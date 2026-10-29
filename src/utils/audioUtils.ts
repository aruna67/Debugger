/**
 * Utility functions for audio conversion, playback, and download.
 */

// Convert base64 audio string to Blob
export function base64ToBlob(base64: string, mimeType = 'audio/wav'): Blob {
  const clean = base64.replace(/^data:[^;]+;base64,/, '');
  const byteCharacters = atob(clean);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);
  return new Blob([byteArray], { type: mimeType });
}

// Convert File or Blob to Base64
export function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      // Keep full data url or extract base64
      resolve(result);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

// Trigger automatic browser file download
export function downloadAudioFile(base64OrBlob: string | Blob, fileName: string, mimeType = 'audio/wav') {
  let blob: Blob;
  if (typeof base64OrBlob === 'string') {
    blob = base64ToBlob(base64OrBlob, mimeType);
  } else {
    blob = base64OrBlob;
  }

  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.style.display = 'none';
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 100);
}

// Format seconds into MM:SS
export function formatTime(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return '00:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

// Generate simple WAV tone buffer for testing/samples
export function createSyntheticSampleAudio(sampleName: string): Blob {
  // Generate a friendly spoken chime tone audio buffer in WAV format
  const sampleRate = 22050;
  const duration = 2.5; // 2.5 seconds
  const numSamples = Math.floor(sampleRate * duration);
  const buffer = new ArrayBuffer(44 + numSamples * 2);
  const view = new DataView(buffer);

  // RIFF identifier
  writeString(view, 0, 'RIFF');
  view.setUint32(4, 36 + numSamples * 2, true);
  writeString(view, 8, 'WAVE');
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true); // PCM format
  view.setUint16(22, 1, true); // Mono
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true); // Byte rate
  view.setUint16(32, 2, true); // Block align
  view.setUint16(34, 16, true); // Bits per sample
  writeString(view, 36, 'data');
  view.setUint32(40, numSamples * 2, true);

  // Write audio samples
  const baseFreq = sampleName.includes('News') ? 330 : sampleName.includes('Story') ? 261 : 392;
  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    // Harmonic pleasant melodic tone
    const envelope = Math.sin((Math.PI * i) / numSamples);
    const wave =
      0.6 * Math.sin(2 * Math.PI * baseFreq * t) +
      0.3 * Math.sin(2 * Math.PI * (baseFreq * 1.5) * t) +
      0.1 * Math.sin(2 * Math.PI * (baseFreq * 2) * t);
    const sample = Math.max(-1, Math.min(1, wave * envelope));
    view.setInt16(44 + i * 2, sample < 0 ? sample * 0x8000 : sample * 0x7fff, true);
  }

  return new Blob([buffer], { type: 'audio/wav' });
}

function writeString(view: DataView, offset: number, string: string) {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}
