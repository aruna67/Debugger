import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, RotateCcw, Volume2, VolumeX, Download, Gauge } from 'lucide-react';
import { formatTime, downloadAudioFile } from '../utils/audioUtils';

interface AudioPlayerProps {
  audioSrc: string | Blob;
  title: string;
  subtitle?: string;
  badge?: string;
  badgeColor?: string;
  autoPlay?: boolean;
  downloadFilename?: string;
  mimeType?: string;
  highlightSinhala?: boolean;
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({
  audioSrc,
  title,
  subtitle,
  badge,
  badgeColor = 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
  autoPlay = false,
  downloadFilename,
  mimeType = 'audio/wav',
  highlightSinhala = false,
}) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1.0);
  const [audioUrl, setAudioUrl] = useState<string>('');

  useEffect(() => {
    let url = '';
    if (typeof audioSrc === 'string') {
      if (audioSrc.startsWith('data:') || audioSrc.startsWith('http') || audioSrc.startsWith('blob:')) {
        url = audioSrc;
      } else {
        url = `data:${mimeType};base64,${audioSrc}`;
      }
    } else if (audioSrc instanceof Blob) {
      url = URL.createObjectURL(audioSrc);
    }
    setAudioUrl(url);

    return () => {
      if (audioSrc instanceof Blob && url) {
        URL.revokeObjectURL(url);
      }
    };
  }, [audioSrc, mimeType]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch((err) => console.log('Audio playback error:', err));
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration || 0);
      if (autoPlay) {
        audioRef.current.play().catch(() => {});
      }
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    setCurrentTime(time);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (audioRef.current) {
      audioRef.current.volume = val;
      audioRef.current.muted = val === 0;
      setIsMuted(val === 0);
    }
  };

  const toggleMute = () => {
    if (!audioRef.current) return;
    const newMuted = !isMuted;
    audioRef.current.muted = newMuted;
    setIsMuted(newMuted);
  };

  const cyclePlaybackRate = () => {
    const rates = [0.8, 1.0, 1.25, 1.5];
    const nextIndex = (rates.indexOf(playbackRate) + 1) % rates.length;
    const nextRate = rates[nextIndex];
    setPlaybackRate(nextRate);
    if (audioRef.current) {
      audioRef.current.playbackRate = nextRate;
    }
  };

  const handleReset = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      setCurrentTime(0);
      audioRef.current.play().catch(() => {});
    }
  };

  const handleDownload = () => {
    const name = downloadFilename || 'audio_file.wav';
    downloadAudioFile(audioSrc, name, mimeType);
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border p-5 transition-all ${
        highlightSinhala
          ? 'border-amber-500/30 bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-amber-950/20 shadow-lg shadow-amber-500/5'
          : 'border-slate-700/50 bg-slate-900/60'
      }`}
    >
      <audio
        ref={audioRef}
        src={audioUrl}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={() => setIsPlaying(false)}
      />

      {/* Header Info */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          {badge && (
            <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium border ${badgeColor}`}>
              {badge}
            </span>
          )}
          <h4 className="font-semibold text-slate-100 text-sm md:text-base">{title}</h4>
        </div>
        {subtitle && <span className="text-xs text-slate-400">{subtitle}</span>}
      </div>

      {/* Scrubber progress bar */}
      <div className="space-y-1 mb-4">
        <div className="relative h-2 w-full bg-slate-800 rounded-full overflow-hidden cursor-pointer">
          <div
            className={`h-full transition-all duration-75 ${
              highlightSinhala
                ? 'bg-gradient-to-r from-amber-500 to-orange-500'
                : 'bg-gradient-to-r from-emerald-500 to-teal-400'
            }`}
            style={{ width: `${progressPercent}%` }}
          />
          <input
            type="range"
            min={0}
            max={duration || 100}
            step={0.1}
            value={currentTime}
            onChange={handleSeek}
            aria-label="Seek audio"
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
        </div>
        <div className="flex justify-between text-xs text-slate-400 font-mono">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Audio Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            onClick={togglePlay}
            aria-label={isPlaying ? 'Pause audio' : 'Play audio'}
            className={`flex items-center justify-center w-11 h-11 rounded-full text-white shadow-md transition-transform active:scale-95 ${
              highlightSinhala
                ? 'bg-amber-600 hover:bg-amber-500 shadow-amber-600/30'
                : 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/30'
            }`}
          >
            {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
          </button>

          <button
            onClick={handleReset}
            title="නැවත මුල සිට වාදනය කරන්න (Restart)"
            className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800/80 rounded-lg transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            onClick={cyclePlaybackRate}
            title="වේගය වෙනස් කරන්න (Change Speed)"
            className="flex items-center gap-1 px-2.5 py-1 text-xs font-mono font-medium text-slate-300 bg-slate-800/80 hover:bg-slate-700/80 rounded-lg border border-slate-700 transition-colors"
          >
            <Gauge className="w-3.5 h-3.5 text-slate-400" />
            {playbackRate}x
          </button>
        </div>

        {/* Volume & Download buttons */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2">
            <button
              onClick={toggleMute}
              className="p-1.5 text-slate-400 hover:text-slate-200 transition-colors"
              aria-label={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted || volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={isMuted ? 0 : volume}
              onChange={handleVolumeChange}
              aria-label="Volume slider"
              className="w-16 h-1.5 bg-slate-800 accent-amber-500 rounded-lg cursor-pointer"
            />
          </div>

          {downloadFilename && (
            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-300 bg-emerald-950/40 hover:bg-emerald-900/60 border border-emerald-500/30 rounded-lg transition-all shadow-sm active:scale-95"
            >
              <Download className="w-3.5 h-3.5" />
              <span>බාගත කරන්න (Download)</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
