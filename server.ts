import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const isProduction = process.env.NODE_ENV === 'production';
const PORT = process.env.PORT || 3000;

const app = express();

// Support large audio base64 uploads (up to 50MB)
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Initialize GoogleGenAI client according to instructions
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Health check endpoint
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    hasApiKey: !!process.env.GEMINI_API_KEY,
    time: new Date().toISOString(),
  });
});

// Helper to strip data url prefix if present
function cleanBase64(dataUrlOrBase64: string): { base64: string; mimeType?: string } {
  const match = dataUrlOrBase64.match(/^data:([^;]+);base64,(.+)$/);
  if (match) {
    return {
      mimeType: match[1],
      base64: match[2],
    };
  }
  return { base64: dataUrlOrBase64 };
}

// Sleep helper
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Helper to check if error is transient (503 UNAVAILABLE, 429 RATE_LIMIT, timeout)
function isTransientError(error: any): boolean {
  const msg = (error?.message || error?.status || JSON.stringify(error) || '').toLowerCase();
  return (
    msg.includes('503') ||
    msg.includes('unavailable') ||
    msg.includes('high demand') ||
    msg.includes('rate limit') ||
    msg.includes('429') ||
    msg.includes('resource_exhausted') ||
    msg.includes('temporarily') ||
    msg.includes('econnreset')
  );
}

// Robust wrapper around ai.models.generateContent with retry & model fallback
async function generateContentWithRetry(
  params: any,
  fallbackModels: string[] = [],
  maxRetries = 3
): Promise<any> {
  const modelsToTry = [params.model, ...fallbackModels];
  let lastError: any = null;

  for (const currentModel of modelsToTry) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`[Gemini API] Requesting model=${currentModel} (attempt ${attempt}/${maxRetries})...`);
        const response = await ai.models.generateContent({
          ...params,
          model: currentModel,
        });
        return response;
      } catch (err: any) {
        lastError = err;
        console.warn(`[Gemini API Warning] model=${currentModel} attempt ${attempt} failed:`, err?.message || err);

        if (isTransientError(err) && attempt < maxRetries) {
          const delay = attempt * 1200; // 1.2s, 2.4s
          console.log(`[Gemini API] Retrying in ${delay}ms...`);
          await sleep(delay);
          continue;
        }

        // If not transient or exhausted retries for this model, break to try fallback model
        break;
      }
    }
  }

  throw lastError;
}

function formatErrorMessage(err: any): { error: string; isTemporary: boolean } {
  const raw = err?.message || JSON.stringify(err) || '';
  if (isTransientError(err)) {
    return {
      error: 'Google Gemini AI සේවාවේ මේ මොහොතේ ඉහළ ඉල්ලුමක් (High demand / 503) පවතී. පද්ධතිය ස්වයංක්‍රීයව නැවත උත්සාහ කරයි. කරුණාකර තත්පර කිහිපයකින් නැවත උත්සාහ කරන්න.',
      isTemporary: true,
    };
  }
  return {
    error: raw || 'ශ්‍රව්‍ය පරිවර්තනය කිරීමේදී දෝෂයක් සිදුවිය. කරුණාකර නැවත උත්සාහ කරන්න.',
    isTemporary: false,
  };
}

/**
 * Endpoint 1: Transcribe Tamil audio and translate to Sinhala
 */
app.post('/api/transcribe-and-translate', async (req: Request, res: Response): Promise<void> => {
  try {
    const { audioData, mimeType = 'audio/mp3', targetTone = 'natural' } = req.body;

    if (!audioData) {
      res.status(400).json({ error: 'කරුණාකර ශ්‍රව්‍ය ගොනුවක් (Audio data) සපයන්න.' });
      return;
    }

    const cleaned = cleanBase64(audioData);
    const audioMime = cleaned.mimeType || mimeType;

    const promptText = `
You are an expert bilingual Tamil-to-Sinhala audio translator and speech specialist.
Listen to this audio carefully (which is spoken in Tamil).

Tasks:
1. Transcribe the spoken Tamil accurately in Tamil script.
2. Provide a Romanized transliteration (Tamil pronunciation in Latin letters).
3. Translate the spoken Tamil into authentic, natural Sri Lankan Sinhala script. Ensure it sounds like a native Sri Lankan speaking Sinhala smoothly, using appropriate vocabulary (${targetTone} tone).
4. Provide a Romanized Singlish pronunciation guide for the Sinhala text.
5. Break down the speech into aligned sentence/phrase segments with approximate timestamps.
6. Provide a 1-2 sentence overall summary in both Sinhala and Tamil.

Output format MUST be valid JSON adhering strictly to this schema:
{
  "tamilTranscript": "Full Tamil transcript in Tamil script",
  "tamilRomanized": "Tamil transliteration in Latin script",
  "sinhalaTranslation": "Full natural Sinhala translation in Sinhala script (සිංහල අකුරින්)",
  "sinhalaRomanized": "Singlish / Romanized Sinhala pronunciation",
  "summaryTamil": "Brief summary in Tamil",
  "summarySinhala": "Brief summary in Sinhala",
  "segments": [
    {
      "id": 1,
      "tamil": "Tamil sentence/phrase in Tamil script",
      "sinhala": "Corresponding Sinhala translation in Sinhala script"
    }
  ]
}
`;

    const response = await generateContentWithRetry(
      {
        model: 'gemini-3.8-flash',
        contents: [
          {
            role: 'user',
            parts: [
              {
                inlineData: {
                  mimeType: audioMime,
                  data: cleaned.base64,
                },
              },
              {
                text: promptText,
              },
            ],
          },
        ],
        config: {
          responseMimeType: 'application/json',
          temperature: 0.2,
        },
      },
      ['gemini-flash-latest', 'gemini-3.5-transcribe']
    );

    const jsonText = response.text?.trim() || '{}';
    let parsedData;
    try {
      parsedData = JSON.parse(jsonText);
    } catch {
      // Fallback in case of markdown wrapping
      const cleanedJson = jsonText.replace(/^```json\s*/i, '').replace(/\s*```$/, '');
      parsedData = JSON.parse(cleanedJson);
    }

    res.json({
      success: true,
      data: parsedData,
    });
  } catch (error: any) {
    console.error('Error in transcribe-and-translate:', error);
    const formatted = formatErrorMessage(error);
    res.status(formatted.isTemporary ? 503 : 500).json(formatted);
  }
});

/**
 * Endpoint 2: Generate Sinhala Speech (TTS) from Sinhala text
 */
app.post('/api/generate-sinhala-speech', async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      text,
      voiceName = 'Kore',
      style = 'Clear, natural, expressive Sri Lankan Sinhala speaker with clear articulation',
    } = req.body;

    if (!text || typeof text !== 'string' || !text.trim()) {
      res.status(400).json({ error: 'ශ්‍රව්‍ය ජනනය කිරීම සඳහා සිංහල පාඨය ඇතුළත් කරන්න.' });
      return;
    }

    // Call Gemini 3.8 Flash Lite TTS with fallback to Gemini 3.8 Flash TTS
    const response = await generateContentWithRetry(
      {
        model: 'gemini-3.8-flash-lite-tts',
        contents: [
          {
            role: 'user',
            parts: [
              {
                text: text.trim(),
                speechMetadata: {
                  style: style,
                },
              },
            ],
          },
        ],
        config: {
          responseModalities: ['AUDIO'],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: voiceName },
            },
          },
        },
      },
      ['gemini-3.8-flash-tts']
    );

    // Unary default returns complete WAV file (audio/wav, 24kHz mono 16-bit RIFF)
    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

    if (!base64Audio) {
      throw new Error('හඬ උත්පාදනය කිරීමට නොහැකි විය. කරුණාකර නැවත උත්සාහ කරන්න.');
    }

    res.json({
      success: true,
      audioBase64: base64Audio,
      mimeType: 'audio/wav',
      voice: voiceName,
    });
  } catch (error: any) {
    console.error('Error in generate-sinhala-speech:', error);
    const formatted = formatErrorMessage(error);
    res.status(formatted.isTemporary ? 503 : 500).json(formatted);
  }
});

/**
 * Endpoint 3: All-in-one convert Tamil MP3 to Sinhala voice audio directly
 */
app.post('/api/convert-tamil-to-sinhala-audio', async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      audioData,
      mimeType = 'audio/mp3',
      voiceName = 'Kore',
      targetTone = 'natural',
    } = req.body;

    if (!audioData) {
      res.status(400).json({ error: 'ශ්‍රව්‍ය ගොනුවක් සපයා නැත.' });
      return;
    }

    const cleaned = cleanBase64(audioData);
    const audioMime = cleaned.mimeType || mimeType;

    // Step 1: Transcribe Tamil & Translate to Sinhala
    const transcriptionPrompt = `
You are an expert Tamil-to-Sinhala translator and speech dubbing director.
Listen to this Tamil audio.

1. Transcribe the spoken Tamil text in Tamil script.
2. Translate it into natural, fluent spoken Sri Lankan Sinhala script.
3. Make sure the Sinhala script has natural phrasing suitable for text-to-speech dubbing.
4. Provide sentence segments.

Return strictly JSON:
{
  "tamilTranscript": "Tamil script",
  "sinhalaTranslation": "Sinhala script (ස්වභාවික කතාබහ සිංහලෙන්)",
  "segments": [
    { "id": 1, "tamil": "Tamil line", "sinhala": "Sinhala line" }
  ]
}
`;

    const transResponse = await generateContentWithRetry(
      {
        model: 'gemini-3.8-flash',
        contents: [
          {
            role: 'user',
            parts: [
              {
                inlineData: {
                  mimeType: audioMime,
                  data: cleaned.base64,
                },
              },
              {
                text: transcriptionPrompt,
              },
            ],
          },
        ],
        config: {
          responseMimeType: 'application/json',
          temperature: 0.2,
        },
      },
      ['gemini-flash-latest', 'gemini-3.5-transcribe']
    );

    const parsedData = JSON.parse(transResponse.text?.trim() || '{}');
    const sinhalaText = parsedData.sinhalaTranslation || '';

    if (!sinhalaText.trim()) {
      throw new Error('දමිළ ශ්‍රව්‍යයෙන් සිංහල පරිවර්තනයක් හඳුනා ගැනීමට නොහැකි විය.');
    }

    // Step 2: Generate Sinhala Voice
    const ttsResponse = await generateContentWithRetry(
      {
        model: 'gemini-3.8-flash-lite-tts',
        contents: [
          {
            role: 'user',
            parts: [
              {
                text: sinhalaText,
                speechMetadata: {
                  style: `Natural, clear, articulate Sri Lankan Sinhala speaker (${targetTone})`,
                },
              },
            ],
          },
        ],
        config: {
          responseModalities: ['AUDIO'],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: voiceName },
            },
          },
        },
      },
      ['gemini-3.8-flash-tts']
    );

    const base64Audio = ttsResponse.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

    res.json({
      success: true,
      tamilTranscript: parsedData.tamilTranscript,
      sinhalaTranslation: parsedData.sinhalaTranslation,
      segments: parsedData.segments || [],
      audioBase64: base64Audio,
      mimeType: 'audio/wav',
      voice: voiceName,
    });
  } catch (error: any) {
    console.error('Error in full convert:', error);
    const formatted = formatErrorMessage(error);
    res.status(formatted.isTemporary ? 503 : 500).json(formatted);
  }
});

// Catch-all for undefined /api routes so they return JSON, never HTML
app.all('/api/*', (req: Request, res: Response) => {
  res.status(404).json({ error: `API route not found: ${req.method} ${req.path}` });
});

// Global Express error handler returning JSON (never HTML)
app.use((err: any, req: Request, res: Response, next: any) => {
  console.error('[Express Global Error Handler]:', err);
  if (res.headersSent) {
    return next(err);
  }
  const status = typeof err.status === 'number' ? err.status : 500;
  res.status(status).json({
    error: err.message || 'සේවාදායකයේ දෝෂයක් සිදුවිය. කරුණාකර නැවත උත්සාහ කරන්න.',
    isTemporary: isTransientError(err),
  });
});

// Start Express server and mount Vite
async function startServer() {
  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Production: serve built static files
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
}

startServer();
