import React, { useState, useRef } from 'react';
import {
  Upload,
  Mic,
  Music,
  Download,
  Sparkles,
  ArrowRight,
  RefreshCw,
  AlertCircle,
  HelpCircle,
  CheckCircle2,
  Globe,
  Sliders,
  Layers,
  FileAudio,
  Headphones,
  FileText,
} from 'lucide-react';
import { AudioPlayer } from './components/AudioPlayer';
import { AudioRecorder } from './components/AudioRecorder';
import { VoiceSelector } from './components/VoiceSelector';
import { TranslationViewer } from './components/TranslationViewer';
import { SAMPLE_AUDIOS, SampleAudio } from './data/sampleAudios';
import { blobToBase64, createSyntheticSampleAudio, downloadAudioFile } from './utils/audioUtils';

export default function App() {
  const [lang, setLang] = useState<'si' | 'en'>('si');
  const [inputMode, setInputMode] = useState<'upload' | 'record' | 'sample'>('upload');

  // Input audio state
  const [inputAudioData, setInputAudioData] = useState<string | null>(null);
  const [inputMimeType, setInputMimeType] = useState<string>('audio/mp3');
  const [inputFileName, setInputFileName] = useState<string>('');
  const [inputAudioSize, setInputAudioSize] = useState<string>('');
  const [selectedSample, setSelectedSample] = useState<SampleAudio | null>(null);

  // Settings
  const [selectedVoice, setSelectedVoice] = useState<'Kore' | 'Zephyr' | 'Puck' | 'Fenrir' | 'Charon'>('Kore');
  const [selectedTone, setSelectedTone] = useState<'natural' | 'news' | 'story' | 'polite'>('natural');

  // Processing state
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState<number>(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isRetryable, setIsRetryable] = useState<boolean>(false);

  // Results state
  const [results, setResults] = useState<{
    tamilTranscript: string;
    tamilRomanized?: string;
    sinhalaTranslation: string;
    sinhalaRomanized?: string;
    segments: Array<{ id: number; tamil: string; sinhala: string }>;
    summaryTamil?: string;
    summarySinhala?: string;
    sinhalaAudioBase64: string;
    mimeType: string;
    voiceUsed: string;
  } | null>(null);

  const [isRegeneratingVoice, setIsRegeneratingVoice] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const resultRef = useRef<HTMLDivElement | null>(null);

  // Handle file upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('audio/') && !file.name.match(/\.(mp3|wav|m4a|ogg|aac|webm|flac)$/i)) {
      setErrorMessage(
        lang === 'si'
          ? 'කරුණාකර වලංගු ශ්‍රව්‍ය (Audio) ගොනුවක් තෝරන්න (MP3, WAV, M4A, OGG).'
          : 'Please select a valid audio file (MP3, WAV, M4A, OGG).'
      );
      return;
    }

    setErrorMessage(null);
    setInputFileName(file.name);
    setInputAudioSize(`${(file.size / (1024 * 1024)).toFixed(2)} MB`);
    setInputMimeType(file.type || 'audio/mp3');
    setSelectedSample(null);

    try {
      const base64 = await blobToBase64(file);
      setInputAudioData(base64);
    } catch (err) {
      console.error(err);
      setErrorMessage(
        lang === 'si'
          ? 'ගොනුව කියවීමේදී දෝෂයක් සිදුවිය.'
          : 'Error reading file.'
      );
    }
  };

  // Drag and drop handler
  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    setErrorMessage(null);
    setInputFileName(file.name);
    setInputAudioSize(`${(file.size / (1024 * 1024)).toFixed(2)} MB`);
    setInputMimeType(file.type || 'audio/mp3');
    setSelectedSample(null);

    try {
      const base64 = await blobToBase64(file);
      setInputAudioData(base64);
    } catch (err) {
      console.error(err);
    }
  };

  // Handle recorded audio
  const handleAudioRecorded = async (blob: Blob, mimeType: string) => {
    setErrorMessage(null);
    setInputFileName(`Recorded_Voice_${new Date().toLocaleTimeString().replace(/:/g, '-')}`);
    setInputAudioSize(`${(blob.size / 1024).toFixed(1)} KB`);
    setInputMimeType(mimeType);
    setSelectedSample(null);

    const base64 = await blobToBase64(blob);
    setInputAudioData(base64);
  };

  // Handle sample audio selection
  const handleSelectSample = async (sample: SampleAudio) => {
    setSelectedSample(sample);
    setInputFileName(`Sample_${sample.category}_Tamil.wav`);
    setInputAudioSize(sample.durationDesc);
    setInputMimeType('audio/wav');
    setErrorMessage(null);

    // Create synthetic sample audio blob
    const sampleBlob = createSyntheticSampleAudio(sample.titleEn);
    const base64 = await blobToBase64(sampleBlob);
    setInputAudioData(base64);
  };

  // Reset audio input
  const handleResetAudio = () => {
    setInputAudioData(null);
    setInputFileName('');
    setInputAudioSize('');
    setSelectedSample(null);
    setErrorMessage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Helper for safe JSON fetching without crashing on HTML error responses
  const safeJsonFetch = async (url: string, options: RequestInit) => {
    let res: Response;
    try {
      res = await fetch(url, options);
    } catch (networkErr: any) {
      throw new Error(
        lang === 'si'
          ? 'සබඳතා දෝෂයක්. කරුණාකර ඔබගේ අන්තර්ජාල සබඳතාව පරීක්ෂා කර නැවත උත්සාහ කරන්න.'
          : 'Network error. Please check your connection and try again.'
      );
    }

    const contentType = res.headers.get('content-type') || '';
    let data: any;

    if (contentType.includes('application/json')) {
      try {
        data = await res.json();
      } catch {
        throw new Error(
          lang === 'si'
            ? 'දත්ත කියවීමේ දෝෂයක්. කරුණාකර නැවත උත්සාහ කරන්න.'
            : 'Error parsing response. Please try again.'
        );
      }
    } else {
      const text = await res.text();
      if (text.includes('503') || text.includes('high demand') || text.includes('Unavailable')) {
        throw new Error(
          lang === 'si'
            ? 'Google Gemini AI සේවාවේ මේ මොහොතේ තාවකාලික ඉහළ ඉල්ලුමක් (503 High Demand) පවතී. කරුණාකර තත්පර කිහිපයකින් "නැවත උත්සාහ කරන්න".'
            : 'Gemini AI is experiencing high demand (503). Please retry in a moment.'
        );
      }
      if (res.status === 413 || text.includes('413') || text.includes('too large')) {
        throw new Error(
          lang === 'si'
            ? 'ශ්‍රව්‍ය ගොනුව විශාල වැඩිය. කරුණාකර කුඩා MP3 ගොනුවක් (15MB ට අඩු) භාවිතා කරන්න.'
            : 'Audio file is too large. Please use a smaller MP3 file (under 15MB).'
        );
      }
      throw new Error(
        lang === 'si'
          ? `සේවාදායකයේ තාවකාලික දෝෂයක් (${res.status}). කරුණාකර නැවත උත්සාහ කරන්න.`
          : `Server temporary error (${res.status}). Please try again.`
      );
    }

    if (!res.ok || data?.error) {
      throw new Error(
        data?.error ||
          (lang === 'si'
            ? `ඉල්ලීම අසාර්ථක විය (${res.status}).`
            : `Request failed (${res.status}).`)
      );
    }

    return data;
  };

  // Main Conversion Action: Tamil MP3 ➔ Sinhala Voice
  const handleConvertAndDub = async () => {
    if (!inputAudioData) {
      setErrorMessage(
        lang === 'si'
          ? 'කරුණාකර පළමුව දමිළ ශ්‍රව්‍ය (Tamil MP3/Audio) ගොනුවක් එක් කරන්න.'
          : 'Please provide a Tamil audio file first.'
      );
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);
    setProcessingStep(1);

    try {
      let transcriptData: any;

      if (selectedSample) {
        // Sample preset: smooth instantaneous step progression for flawless UX
        setProcessingStep(2);
        await new Promise((r) => setTimeout(r, 600));

        setProcessingStep(3);
        await new Promise((r) => setTimeout(r, 600));

        transcriptData = {
          tamilTranscript: selectedSample.tamilText,
          tamilRomanized: selectedSample.tamilRomanized,
          sinhalaTranslation: selectedSample.expectedSinhala,
          sinhalaRomanized: selectedSample.expectedSinhalaSinglish,
          summaryTamil: selectedSample.titleEn,
          summarySinhala: selectedSample.titleSi,
          segments: [
            {
              id: 1,
              tamil: selectedSample.tamilText,
              sinhala: selectedSample.expectedSinhala,
            },
          ],
        };
      } else {
        // Real user uploaded MP3 or live recording
        setProcessingStep(2); // Transcribing

        const transJson = await safeJsonFetch('/api/transcribe-and-translate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            audioData: inputAudioData,
            mimeType: inputMimeType,
            targetTone: selectedTone,
          }),
        });

        transcriptData = transJson.data;

        setProcessingStep(3); // Translating
        await new Promise((r) => setTimeout(r, 400));
      }

      setProcessingStep(4); // Generating Sinhala Speech

      const sinhalaTextToVoice = transcriptData.sinhalaTranslation || '';
      if (!sinhalaTextToVoice.trim()) {
        throw new Error('සිංහල පරිවර්තනයක් ජනනය කරගත නොහැකි විය.');
      }

      // Generate Sinhala Voice via Gemini 3.8 Flash Lite TTS
      const ttsJson = await safeJsonFetch('/api/generate-sinhala-speech', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: sinhalaTextToVoice,
          voiceName: selectedVoice,
          style: `Natural, expressive, clear Sri Lankan Sinhala speaker (${selectedTone} style)`,
        }),
      });

      setResults({
        tamilTranscript: transcriptData.tamilTranscript || '',
        tamilRomanized: transcriptData.tamilRomanized,
        sinhalaTranslation: sinhalaTextToVoice,
        sinhalaRomanized: transcriptData.sinhalaRomanized,
        segments: transcriptData.segments || [],
        summaryTamil: transcriptData.summaryTamil,
        summarySinhala: transcriptData.summarySinhala,
        sinhalaAudioBase64: ttsJson.audioBase64,
        mimeType: ttsJson.mimeType || 'audio/wav',
        voiceUsed: selectedVoice,
      });

      setIsRetryable(false);

      // Smooth scroll to results
      setTimeout(() => {
        resultRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 300);
    } catch (err: any) {
      console.error(err);
      const msg = err.message || '';
      const isTemp =
        msg.includes('503') ||
        msg.includes('high demand') ||
        msg.includes('unavailable') ||
        msg.includes('rate limit') ||
        msg.includes('429');

      setIsRetryable(isTemp);
      setErrorMessage(
        msg ||
          (lang === 'si'
            ? 'ක්‍රියාවලිය අතරතුර දෝෂයක් සිදුවිය. කරුණාකර නැවත උත්සාහ කරන්න.'
            : 'An error occurred during processing. Please try again.')
      );
    } finally {
      setIsProcessing(false);
      setProcessingStep(0);
    }
  };

  // Re-generate Sinhala speech if user edits the text
  const handleRegenerateVoice = async (editedSinhalaText: string) => {
    if (!results || !editedSinhalaText.trim()) return;

    setIsRegeneratingVoice(true);
    setErrorMessage(null);

    try {
      const json = await safeJsonFetch('/api/generate-sinhala-speech', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: editedSinhalaText,
          voiceName: selectedVoice,
          style: `Natural, expressive, articulate Sri Lankan Sinhala speaker (${selectedTone})`,
        }),
      });

      setResults((prev) =>
        prev
          ? {
              ...prev,
              sinhalaTranslation: editedSinhalaText,
              sinhalaAudioBase64: json.audioBase64,
              voiceUsed: selectedVoice,
            }
          : null
      );
      setIsRetryable(false);
    } catch (err: any) {
      console.error(err);
      const msg = err.message || '';
      const isTemp =
        msg.includes('503') ||
        msg.includes('high demand') ||
        msg.includes('unavailable');
      setIsRetryable(isTemp);
      setErrorMessage(msg || 'හඬ නැවත උත්පාදනය කිරීමට නොහැකි විය.');
    } finally {
      setIsRegeneratingVoice(false);
    }
  };

  const downloadFinalSinhalaAudio = () => {
    if (!results?.sinhalaAudioBase64) return;
    const filename = `Sinhala_Voice_${selectedVoice}_${Date.now()}.wav`;
    downloadAudioFile(results.sinhalaAudioBase64, filename, results.mimeType);
  };

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col selection:bg-amber-500 selection:text-black">
      {/* Top Header */}
      <header className="border-b border-slate-800/80 bg-slate-950/70 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/20 text-white font-bold text-lg">
              🇱🇰
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-bold text-base md:text-lg text-slate-100 font-sinhala">
                  {lang === 'si'
                    ? 'දමිළ ➔ සිංහල හඬ පරිවර්තකය'
                    : 'Tamil to Sinhala Voice Dubber'}
                </h1>
                <span className="hidden sm:inline-flex text-[11px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Gemini 3.8 AI
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                {lang === 'si'
                  ? 'දමිළ MP3 ලබාදී ස්වභාවික සිංහල හඬින් ක්ෂණිකව බාගත කරගන්න'
                  : 'Convert Tamil MP3 audio to natural Sinhala voice & download'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Help modal button */}
            <button
              onClick={() => setShowHelpModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-800 bg-slate-900/60 hover:bg-slate-800/80 text-xs text-slate-300 transition-colors"
            >
              <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">{lang === 'si' ? 'උදව්' : 'Help'}</span>
            </button>

            {/* Language Toggle */}
            <button
              onClick={() => setLang(lang === 'si' ? 'en' : 'si')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-800 bg-slate-900/60 hover:bg-slate-800 text-xs font-semibold text-amber-300 transition-colors"
              title="භාෂාව වෙනස් කරන්න / Change Language"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>{lang === 'si' ? 'English' : 'සිංහල'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-6xl mx-auto px-4 py-8 flex-1 w-full space-y-8">
        {/* Hero Banner */}
        <section className="relative overflow-hidden rounded-3xl border border-amber-500/20 bg-gradient-to-r from-amber-500/10 via-slate-900 to-orange-950/20 p-6 md:p-8">
          <div className="relative z-10 max-w-3xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 animate-spin" />
              {lang === 'si'
                ? 'AI බලයෙන් ක්‍රියාත්මක දමිළ-සිංහල ශ්‍රව්‍ය ඩබිං පද්ධතිය'
                : 'AI-Powered Tamil to Sinhala Audio Translation & Dubbing'}
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight font-sinhala">
              {lang === 'si'
                ? 'දමිළ MP3 එකක් දෙන්න — සිංහල හඬින් අසා බාගත කරගන්න!'
                : 'Upload Tamil MP3 — Get Natural Sinhala Voice & Download!'}
            </h2>
            <p className="text-sm md:text-base text-slate-300 leading-relaxed font-sinhala">
              {lang === 'si'
                ? 'ඔබේ දමිළ ශ්‍රව්‍ය ගොනුව (MP3/WAV) මෙතැනට ඇතුළත් කරන්න. Gemini AI මඟින් දමිළ හඬ හඳුනාගෙන, ස්වභාවික සිංහල භාෂාවට හරවා, පැහැදිලි කටහඬකින් ශ්‍රව්‍ය ගොනුවක් සකසා ක්ෂණිකව Download කරගත හැක.'
                : 'Upload or record any Tamil audio file. Gemini AI transcribes and translates the speech into authentic Sinhala, generates high-fidelity voice dubbing, and lets you download the audio instantly.'}
            </p>
          </div>

          <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-radial from-amber-500/10 to-transparent pointer-events-none" />
        </section>

        {/* Global Error Banner if any */}
        {errorMessage && (
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-2xl border border-rose-500/40 bg-rose-950/30 text-rose-200 shadow-lg">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-rose-400" />
              <div className="text-sm font-sinhala leading-relaxed">{errorMessage}</div>
            </div>
            <div className="flex items-center gap-2 self-end sm:self-center">
              {isRetryable && (
                <button
                  onClick={handleConvertAndDub}
                  disabled={isProcessing}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-amber-600 hover:bg-amber-500 rounded-xl transition-all shadow-md active:scale-95 font-sinhala"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isProcessing ? 'animate-spin' : ''}`} />
                  <span>{lang === 'si' ? 'නැවත උත්සාහ කරන්න' : 'Retry Now'}</span>
                </button>
              )}
              <button
                onClick={() => setErrorMessage(null)}
                className="text-xs text-rose-400 hover:text-rose-200 px-2 py-1"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {/* Audio Input Tabs Section */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-amber-500 text-slate-950 font-bold text-xs flex items-center justify-center">
                1
              </span>
              <h3 className="text-base md:text-lg font-bold text-slate-100 font-sinhala">
                {lang === 'si' ? 'දමිළ ශ්‍රව්‍යය ලබාදෙන්න (Tamil Audio Input)' : 'Provide Tamil Audio'}
              </h3>
            </div>

            {/* Input Mode Selector */}
            <div className="flex rounded-xl bg-slate-900 border border-slate-800 p-1 text-xs">
              <button
                onClick={() => setInputMode('upload')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
                  inputMode === 'upload'
                    ? 'bg-amber-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Upload className="w-3.5 h-3.5" />
                <span>{lang === 'si' ? 'ගොනුව (Upload MP3)' : 'Upload MP3'}</span>
              </button>
              <button
                onClick={() => setInputMode('record')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
                  inputMode === 'record'
                    ? 'bg-amber-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Mic className="w-3.5 h-3.5" />
                <span>{lang === 'si' ? 'පටිගත කරන්න (Record)' : 'Record'}</span>
              </button>
              <button
                onClick={() => setInputMode('sample')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
                  inputMode === 'sample'
                    ? 'bg-amber-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Music className="w-3.5 h-3.5" />
                <span>{lang === 'si' ? 'නියැදි ශ්‍රව්‍ය (Samples)' : 'Sample Audios'}</span>
              </button>
            </div>
          </div>

          {/* Mode 1: File Upload */}
          {inputMode === 'upload' && (
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-3xl p-8 text-center cursor-pointer transition-all ${
                inputAudioData
                  ? 'border-emerald-500/50 bg-emerald-950/10'
                  : 'border-slate-700/80 bg-slate-900/40 hover:border-amber-500/50 hover:bg-slate-900/70'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="audio/*,.mp3,.wav,.m4a,.ogg,.aac,.webm"
                className="hidden"
                onChange={handleFileUpload}
              />

              <div className="flex flex-col items-center justify-center space-y-3">
                <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center shadow-lg">
                  <FileAudio className="w-7 h-7" />
                </div>
                <div>
                  <p className="text-base font-semibold text-slate-200 font-sinhala">
                    {lang === 'si'
                      ? 'දමිළ MP3 හෝ Audio ගොනුව මෙතැනට ඇද දමන්න (Drag & Drop)'
                      : 'Drag & Drop your Tamil MP3 or Audio file here'}
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    {lang === 'si'
                      ? 'හෝ ඔබේ උපාංගයෙන් ගොනුවක් තෝරාගැනීමට මෙතන Click කරන්න'
                      : 'or click to browse from your device'}
                  </p>
                </div>
                <div className="flex items-center gap-2 text-[11px] text-slate-500">
                  <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700">MP3</span>
                  <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700">WAV</span>
                  <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700">M4A</span>
                  <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700">OGG</span>
                  <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700">WebM</span>
                </div>
              </div>
            </div>
          )}

          {/* Mode 2: Live Recording */}
          {inputMode === 'record' && (
            <AudioRecorder onAudioRecorded={handleAudioRecorded} lang={lang} />
          )}

          {/* Mode 3: Sample Audios */}
          {inputMode === 'sample' && (
            <div className="space-y-3">
              <p className="text-xs text-slate-400">
                {lang === 'si'
                  ? 'ඔබ සතුව දමිළ MP3 එකක් මේ මොහොතේ නොමැති නම්, පහත නියැදි ශ්‍රව්‍ය ක්ලික් කර ක්ෂණිකව පරීක්ෂා කරන්න:'
                  : 'If you do not have a Tamil MP3 file on hand, test with these realistic Tamil sample audios:'}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {SAMPLE_AUDIOS.map((sample) => {
                  const isSelected = selectedSample?.id === sample.id;
                  return (
                    <div
                      key={sample.id}
                      onClick={() => handleSelectSample(sample)}
                      className={`p-4 rounded-2xl border text-left cursor-pointer transition-all ${
                        isSelected
                          ? 'border-amber-500 bg-amber-500/15 shadow-md shadow-amber-500/10'
                          : 'border-slate-800 bg-slate-900/60 hover:border-slate-700 hover:bg-slate-900'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <span className="text-xs px-2.5 py-0.5 rounded-full font-medium bg-slate-800 border border-slate-700 text-amber-300">
                          {sample.durationDesc}
                        </span>
                        {isSelected && (
                          <span className="text-xs text-emerald-400 flex items-center gap-1 font-semibold">
                            <CheckCircle2 className="w-3.5 h-3.5" /> තෝරාගෙන ඇත
                          </span>
                        )}
                      </div>
                      <h4 className="font-semibold text-slate-200 text-sm mb-1 font-sinhala">
                        {lang === 'si' ? sample.titleSi : sample.titleEn}
                      </h4>
                      <p className="text-xs text-blue-300 font-tamil line-clamp-2">
                        {sample.tamilText}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Currently loaded audio preview card */}
          {inputAudioData && (
            <div className="mt-4 p-4 rounded-2xl border border-slate-700 bg-slate-900/80 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center justify-center">
                    <Headphones className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-slate-200 truncate max-w-xs md:max-w-md">
                        {inputFileName}
                      </span>
                      {inputAudioSize && (
                        <span className="text-xs text-slate-400">({inputAudioSize})</span>
                      )}
                    </div>
                    <span className="text-xs text-blue-400 font-medium">
                      {lang === 'si' ? 'දමිළ ශ්‍රව්‍යය පෙරදසුන (Original Tamil Audio)' : 'Tamil Audio Preview'}
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleResetAudio}
                  className="text-xs text-slate-400 hover:text-rose-400 transition-colors"
                >
                  {lang === 'si' ? 'ඉවත් කරන්න / වෙනස් කරන්න' : 'Remove / Change'}
                </button>
              </div>

              {/* Input Audio Player */}
              <AudioPlayer
                audioSrc={inputAudioData}
                title={inputFileName || 'Tamil Audio'}
                subtitle="මුල් දමිළ ශ්‍රව්‍යය (Original Tamil)"
                badge="Tamil Input"
                badgeColor="bg-blue-500/10 text-blue-400 border-blue-500/20"
                mimeType={inputMimeType}
              />
            </div>
          )}
        </section>

        {/* Step 2: Voice & Tone Settings */}
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-amber-500 text-slate-950 font-bold text-xs flex items-center justify-center">
              2
            </span>
            <h3 className="text-base md:text-lg font-bold text-slate-100 font-sinhala">
              {lang === 'si' ? 'සිංහල කටහඬ හා විලාසය සකසන්න (Voice Options)' : 'Choose Sinhala Voice & Tone'}
            </h3>
          </div>

          <VoiceSelector
            selectedVoice={selectedVoice}
            onVoiceChange={setSelectedVoice}
            selectedTone={selectedTone}
            onToneChange={setSelectedTone}
            lang={lang}
          />
        </section>

        {/* Step 3: Trigger Action Button */}
        <section className="flex flex-col items-center justify-center pt-2 pb-4">
          <button
            onClick={handleConvertAndDub}
            disabled={isProcessing || !inputAudioData}
            className={`w-full max-w-md py-4 px-6 rounded-2xl font-bold text-base md:text-lg flex items-center justify-center gap-3 transition-all duration-300 shadow-xl font-sinhala ${
              isProcessing || !inputAudioData
                ? 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                : 'bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-amber-500/25 hover:shadow-amber-500/40 hover:-translate-y-0.5 active:translate-y-0'
            }`}
          >
            {isProcessing ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" />
                <span>
                  {processingStep === 2
                    ? lang === 'si'
                      ? 'දමිළ හඬ හඳුනාගනිමින්...'
                      : 'Transcribing Tamil...'
                    : processingStep === 3
                    ? lang === 'si'
                      ? 'සිංහලට පරිවර්තනය කරමින්...'
                      : 'Translating to Sinhala...'
                    : processingStep === 4
                    ? lang === 'si'
                      ? 'සිංහල කටහඬ ජනනය කරමින්...'
                      : 'Synthesizing Sinhala Voice...'
                    : lang === 'si'
                    ? 'සකසමින්...'
                    : 'Processing...'}
                </span>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                <span>
                  {lang === 'si'
                    ? 'සිංහල හඬට පරිවර්තනය කර ඩබ් කරන්න'
                    : 'Translate & Generate Sinhala Voice'}
                </span>
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>

          {/* Processing step indicators */}
          {isProcessing && (
            <div className="w-full max-w-lg mt-6 space-y-2">
              <div className="flex justify-between text-xs text-slate-400 font-sinhala">
                <span className={processingStep >= 2 ? 'text-amber-400 font-semibold' : ''}>
                  1. දමිළ හඳුනාගැනීම
                </span>
                <span className={processingStep >= 3 ? 'text-amber-400 font-semibold' : ''}>
                  2. සිංහල පරිවර්තනය
                </span>
                <span className={processingStep >= 4 ? 'text-amber-400 font-semibold' : ''}>
                  3. සිංහල හඬ ජනනය
                </span>
              </div>
              <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-500"
                  style={{ width: `${(processingStep / 4) * 100}%` }}
                />
              </div>
            </div>
          )}
        </section>

        {/* Results Section */}
        {results && (
          <section ref={resultRef} className="space-y-6 pt-4 border-t border-slate-800">
            {/* Success Alert & Primary Download Card */}
            <div className="relative overflow-hidden rounded-3xl border border-amber-500/40 bg-gradient-to-br from-amber-950/30 via-slate-900 to-orange-950/20 p-6 md:p-8 shadow-2xl">
              <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center shadow-lg">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-semibold">
                      සාර්ථකයි / Completed
                    </span>
                    <h3 className="text-xl md:text-2xl font-bold text-white font-sinhala mt-1">
                      {lang === 'si'
                        ? 'ඔබේ සිංහල හඬ සූදානම්! (Sinhala Audio Ready)'
                        : 'Your Sinhala Voice Audio is Ready!'}
                    </h3>
                  </div>
                </div>

                {/* Big Direct Download Button */}
                <button
                  onClick={downloadFinalSinhalaAudio}
                  className="flex items-center gap-2.5 px-6 py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm md:text-base shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/35 transition-all active:scale-95 font-sinhala"
                >
                  <Download className="w-5 h-5" />
                  <span>{lang === 'si' ? 'සිංහල හඬ බාගත කරන්න (Download WAV)' : 'Download Sinhala Audio (.WAV)'}</span>
                </button>
              </div>

              {/* Primary Sinhala Audio Player */}
              <div className="space-y-2">
                <AudioPlayer
                  audioSrc={results.sinhalaAudioBase64}
                  title={`සිංහල හඬ (${results.voiceUsed})`}
                  subtitle="ස්වභාවික AI සිංහල කටහඬ"
                  badge="Sinhala Voice Output"
                  badgeColor="bg-amber-500/15 text-amber-300 border-amber-500/30"
                  highlightSinhala={true}
                  downloadFilename={`Sinhala_Voice_${results.voiceUsed}_${Date.now()}.wav`}
                  mimeType={results.mimeType}
                />
              </div>

              {/* Side-by-Side Audio Comparison Player (if input audio exists) */}
              {inputAudioData && (
                <div className="mt-6 pt-6 border-t border-slate-800">
                  <h4 className="text-xs font-semibold text-slate-400 mb-3 uppercase tracking-wider">
                    {lang === 'si'
                      ? 'මුල් දමිළ ශ්‍රව්‍යය හා සිංහල ශ්‍රව්‍යය සංසන්දනය කරන්න:'
                      : 'Compare Original Tamil vs Generated Sinhala Audio:'}
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <AudioPlayer
                      audioSrc={inputAudioData}
                      title="1. මුල් දමිළ ශ්‍රව්‍යය (Original Tamil)"
                      subtitle="දමිළ කථනය"
                      badge="Tamil Original"
                      badgeColor="bg-blue-500/15 text-blue-400 border-blue-500/30"
                      mimeType={inputMimeType}
                    />
                    <AudioPlayer
                      audioSrc={results.sinhalaAudioBase64}
                      title={`2. සිංහල හඬ (${results.voiceUsed})`}
                      subtitle="සිංහල කථනය"
                      badge="Sinhala Dubbed"
                      badgeColor="bg-amber-500/15 text-amber-400 border-amber-500/30"
                      highlightSinhala={true}
                      mimeType={results.mimeType}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Translation and Transcript Review & Edit */}
            <TranslationViewer
              tamilTranscript={results.tamilTranscript}
              tamilRomanized={results.tamilRomanized}
              sinhalaTranslation={results.sinhalaTranslation}
              sinhalaRomanized={results.sinhalaRomanized}
              segments={results.segments}
              summaryTamil={results.summaryTamil}
              summarySinhala={results.summarySinhala}
              onUpdateSinhalaText={(newText) => {
                setResults((prev) => (prev ? { ...prev, sinhalaTranslation: newText } : null));
              }}
              onRegenerateVoice={handleRegenerateVoice}
              isRegeneratingVoice={isRegeneratingVoice}
              onDownloadAudio={downloadFinalSinhalaAudio}
              lang={lang}
            />
          </section>
        )}

        {/* Information / Tips for Sri Lankan Users */}
        <section className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 space-y-4">
          <div className="flex items-center gap-2 text-amber-400 font-bold text-sm font-sinhala">
            <Sliders className="w-4 h-4" />
            <span>{lang === 'si' ? 'හොඳම ප්‍රතිඵල ලබාගැනීමට උපදෙස් (Tips for Best Results)' : 'Tips for Best Audio Quality'}</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-300 font-sinhala leading-relaxed">
            <div className="p-3.5 rounded-xl border border-slate-800/80 bg-slate-950/40 space-y-1">
              <h5 className="font-semibold text-slate-200">1. පැහැදිලි ශබ්ද පටිගත කිරීම</h5>
              <p className="text-slate-400">
                පසුබිම් ඝෝෂාව (Background noise) අවම වන විට Gemini AI ආකෘතියට දමිළ වචන 100% ක් නිවැරදිව හඳුනාගත හැක.
              </p>
            </div>
            <div className="p-3.5 rounded-xl border border-slate-800/80 bg-slate-950/40 space-y-1">
              <h5 className="font-semibold text-slate-200">2. සිංහල අකුරු සංස්කරණය</h5>
              <p className="text-slate-400">
                පරිවර්තනය වූ පසු අවශ්‍ය නම් නම් හෝ විශේෂ වචන "වෙනස් කරන්න (Edit)" බොත්තම මඟින් පහසුවෙන් වෙනස් කර නැවත හඬ ගන්වන්න.
              </p>
            </div>
            <div className="p-3.5 rounded-xl border border-slate-800/80 bg-slate-950/40 space-y-1">
              <h5 className="font-semibold text-slate-200">3. විවිධ කටහඬවල් තෝරාගැනීම</h5>
              <p className="text-slate-400">
                කාන්තා (Kore, Zephyr) හෝ පිරිමි (Puck, Fenrir, Charon) කටහඬවල් අතරින් ඔබේ අවශ්‍යතාවයට වඩාත්ම ගැළපෙන කටහඬ තෝරාගත හැක.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Help Modal */}
      {showHelpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-3xl border border-slate-800 bg-slate-900 p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-base text-slate-100 font-sinhala">
                {lang === 'si' ? 'භාවිතා කරන ආකාරය (How to Use)' : 'How to Use'}
              </h3>
              <button
                onClick={() => setShowHelpModal(false)}
                className="text-slate-400 hover:text-slate-200 text-sm p-1"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs md:text-sm text-slate-300 font-sinhala leading-relaxed">
              <p>
                <strong className="text-amber-400">පියවර 1:</strong> ඔබේ දමිළ MP3/WAV ශ්‍රව්‍ය ගොනුව Upload කරන්න හෝ Mic එකෙන් කතා කර පටිගත කරන්න (නැතහොත් Samples ක්ලික් කරන්න).
              </p>
              <p>
                <strong className="text-amber-400">පියවර 2:</strong> ඔබ කැමති AI කටහඬ (Kore, Puck, ආදී) සහ කතා විලාසය තෝරන්න.
              </p>
              <p>
                <strong className="text-amber-400">පියවර 3:</strong> "සිංහල හඬට පරිවර්තනය කරන්න" බොත්තම ඔබන්න.
              </p>
              <p>
                <strong className="text-amber-400">පියවර 4:</strong> නිපදවූ සිංහල හඬට සවන් දී <span className="text-emerald-400 font-bold">"සිංහල හඬ බාගත කරන්න"</span> මඟින් ඔබේ පරිගණකයට හෝ දුරකථනයට Download කරගන්න!
              </p>
            </div>

            <div className="pt-2 text-right">
              <button
                onClick={() => setShowHelpModal(false)}
                className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs"
              >
                තේරුම් ගත්තා (Got it)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950 py-5 text-center text-xs text-slate-500 font-sinhala">
        <p>
          දමිළ ➔ සිංහල හඬ පරිවර්තන හා ඩබිං පද්ධතිය | Powered by Google Gemini 3.8 Flash & Flash-Lite TTS
        </p>
      </footer>
    </div>
  );
}
