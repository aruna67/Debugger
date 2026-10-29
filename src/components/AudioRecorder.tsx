import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square, Trash2, CheckCircle, Radio } from 'lucide-react';
import { formatTime } from '../utils/audioUtils';

interface AudioRecorderProps {
  onAudioRecorded: (blob: Blob, mimeType: string) => void;
  sourceLang?: 'ta' | 'si';
  lang: 'si' | 'en';
}

export const AudioRecorder: React.FC<AudioRecorderProps> = ({
  onAudioRecorded,
  sourceLang = 'ta',
  lang,
}) => {
  const isSourceSinhala = sourceLang === 'si';
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [recordedUrl, setRecordedUrl] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const timerRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (recordedUrl) {
        URL.revokeObjectURL(recordedUrl);
      }
    };
  }, [recordedUrl]);

  const startRecording = async () => {
    setErrorMsg(null);
    setRecordedBlob(null);
    if (recordedUrl) {
      URL.revokeObjectURL(recordedUrl);
      setRecordedUrl(null);
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      // Choose supported mimeType
      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : MediaRecorder.isTypeSupported('audio/ogg;codecs=opus')
        ? 'audio/ogg;codecs=opus'
        : 'audio/webm';

      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const fullBlob = new Blob(chunksRef.current, { type: mimeType });
        setRecordedBlob(fullBlob);
        const url = URL.createObjectURL(fullBlob);
        setRecordedUrl(url);
        onAudioRecorded(fullBlob, mimeType);
      };

      mediaRecorder.start(250);
      setIsRecording(true);
      setRecordingTime(0);

      timerRef.current = window.setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (err: any) {
      console.error('Mic access error:', err);
      setErrorMsg(
        lang === 'si'
          ? 'මයික්‍රෆෝනය ලබා ගැනීමට නොහැකි විය. කරුණාකර බ්‍රවුසරයේ අවසර පරීක්ෂා කරන්න.'
          : 'Could not access microphone. Please check browser permissions.'
      );
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    setIsRecording(false);
  };

  const clearRecording = () => {
    setRecordedBlob(null);
    if (recordedUrl) {
      URL.revokeObjectURL(recordedUrl);
      setRecordedUrl(null);
    }
    setRecordingTime(0);
  };

  return (
    <div className="rounded-2xl border border-slate-700/60 bg-slate-900/40 p-4">
      <div className="flex flex-col items-center justify-center py-4 text-center">
        {isRecording ? (
          <div className="flex flex-col items-center gap-3">
            <div className="relative flex items-center justify-center">
              <span className="absolute inline-flex h-16 w-16 animate-ping rounded-full bg-rose-500 opacity-30"></span>
              <button
                onClick={stopRecording}
                className="relative z-10 flex h-14 w-14 items-center justify-center rounded-full bg-rose-600 text-white shadow-lg shadow-rose-600/40 hover:bg-rose-500 transition-transform active:scale-95"
                title="Stop recording"
              >
                <Square className="h-6 w-6 fill-current" />
              </button>
            </div>
            <div className="flex items-center gap-2 text-rose-400 font-mono text-sm font-semibold">
              <Radio className="w-4 h-4 animate-pulse" />
              <span>{formatTime(recordingTime)}</span>
            </div>
            <p className="text-xs text-slate-300">
              {lang === 'si'
                ? isSourceSinhala
                  ? 'සිංහල බසින් කතා කරන්න... (දැන් පටිගත වේ)'
                  : 'දමිළ බසින් කතා කරන්න... (දැන් පටිගත වේ)'
                : isSourceSinhala
                ? 'Speak in Sinhala... (Recording in progress)'
                : 'Speak in Tamil... (Recording in progress)'}
            </p>
          </div>
        ) : recordedBlob ? (
          <div className="w-full flex flex-col items-center gap-3">
            <div className="flex items-center gap-2 text-emerald-400 text-sm font-medium">
              <CheckCircle className="w-4 h-4" />
              <span>
                {lang === 'si' ? 'හඬ සාර්ථකව පටිගත විය!' : 'Voice recorded successfully!'} ({formatTime(recordingTime)})
              </span>
            </div>
            {recordedUrl && (
              <audio src={recordedUrl} controls className="h-9 w-full max-w-sm rounded-lg" />
            )}
            <div className="flex gap-2 mt-1">
              <button
                onClick={startRecording}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700"
              >
                <Mic className="w-3.5 h-3.5 text-rose-400" />
                <span>{lang === 'si' ? 'නැවත පටිගත කරන්න' : 'Record Again'}</span>
              </button>
              <button
                onClick={clearRecording}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-rose-300 bg-rose-950/40 hover:bg-rose-900/40 rounded-lg border border-rose-800/40"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{lang === 'si' ? 'ඉවත් කරන්න' : 'Remove'}</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <button
              onClick={startRecording}
              className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-tr from-rose-600 to-amber-600 text-white shadow-lg shadow-rose-600/20 hover:from-rose-500 hover:to-amber-500 transition-transform active:scale-95"
              title="Start recording"
            >
              <Mic className="h-6 w-6" />
            </button>
            <div className="text-center">
              <p className="text-sm font-semibold text-slate-200">
                {lang === 'si'
                  ? isSourceSinhala
                    ? 'සජීවීව සිංහල හඬ පටිගත කරන්න'
                    : 'සජීවීව දමිළ හඬ පටිගත කරන්න'
                  : isSourceSinhala
                  ? 'Record Sinhala Audio Live'
                  : 'Record Tamil Audio Live'}
              </p>
              <p className="text-xs text-slate-400 mt-0.5">
                {lang === 'si' ? 'මයික්‍රෆෝනය මඟින් කෙලින්ම කතා කරන්න' : 'Use your microphone directly'}
              </p>
            </div>
          </div>
        )}

        {errorMsg && (
          <p className="mt-3 text-xs text-rose-400 bg-rose-950/40 px-3 py-1.5 rounded-lg border border-rose-800/40">
            {errorMsg}
          </p>
        )}
      </div>
    </div>
  );
};
