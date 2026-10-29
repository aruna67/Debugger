import React, { useState } from 'react';
import { Copy, Check, Edit3, Volume2, Sparkles, FileText, Download } from 'lucide-react';

interface Segment {
  id: number;
  tamil: string;
  sinhala: string;
}

interface TranslationViewerProps {
  tamilTranscript: string;
  tamilRomanized?: string;
  sinhalaTranslation: string;
  sinhalaRomanized?: string;
  segments: Segment[];
  summaryTamil?: string;
  summarySinhala?: string;
  onUpdateSinhalaText: (newText: string) => void;
  onRegenerateVoice: (editedText: string) => void;
  isRegeneratingVoice: boolean;
  onDownloadAudio?: () => void;
  lang: 'si' | 'en';
}

export const TranslationViewer: React.FC<TranslationViewerProps> = ({
  tamilTranscript,
  tamilRomanized,
  sinhalaTranslation,
  sinhalaRomanized,
  segments,
  summaryTamil,
  summarySinhala,
  onUpdateSinhalaText,
  onRegenerateVoice,
  isRegeneratingVoice,
  onDownloadAudio,
  lang,
}) => {
  const [isEditingSinhala, setIsEditingSinhala] = useState(false);
  const [editedText, setEditedText] = useState(sinhalaTranslation);
  const [copiedTamil, setCopiedTamil] = useState(false);
  const [copiedSinhala, setCopiedSinhala] = useState(false);
  const [activeTab, setActiveTab] = useState<'side-by-side' | 'segments' | 'summary'>('side-by-side');

  // Keep edited text in sync if prop changes
  React.useEffect(() => {
    setEditedText(sinhalaTranslation);
  }, [sinhalaTranslation]);

  const copyToClipboard = (text: string, type: 'tamil' | 'sinhala') => {
    navigator.clipboard.writeText(text);
    if (type === 'tamil') {
      setCopiedTamil(true);
      setTimeout(() => setCopiedTamil(false), 2000);
    } else {
      setCopiedSinhala(true);
      setTimeout(() => setCopiedSinhala(false), 2000);
    }
  };

  const handleSaveAndRegenerate = () => {
    onUpdateSinhalaText(editedText);
    onRegenerateVoice(editedText);
    setIsEditingSinhala(false);
  };

  const exportTextFile = () => {
    const content = `================================================
දමිළ - සිංහල හඬ පරිවර්තන පිටපත (Tamil to Sinhala Transcript)
දිනය: ${new Date().toLocaleDateString()}
================================================

[දමිළ මුල් පිටපත / Original Tamil Transcript]
${tamilTranscript}
${tamilRomanized ? `\n(උච්චාරණය / Pronunciation): ${tamilRomanized}` : ''}

------------------------------------------------
[සිංහල පරිවර්තනය / Sinhala Translation]
${editedText}
${sinhalaRomanized ? `\n(Singlish): ${sinhalaRomanized}` : ''}

------------------------------------------------
[වාක්‍ය අනුව පෙළගැස්ම / Sentence Segments]
${segments
  .map(
    (s, idx) =>
      `${idx + 1}. [Tamil]   ${s.tamil}\n   [Sinhala] ${s.sinhala}`
  )
  .join('\n\n')}
`;

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tamil_to_sinhala_transcript_${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4 rounded-2xl border border-slate-800 bg-slate-900/60 p-4 md:p-6 shadow-xl">
      {/* Top Header & Tab switcher */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <h3 className="text-base font-bold text-slate-100 font-sinhala">
            {lang === 'si' ? 'පරිවර්තන පිටපත හා පෙළගැස්ම' : 'Translation & Transcript'}
          </h3>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Tabs */}
          <div className="flex rounded-xl bg-slate-950/80 p-1 border border-slate-800 text-xs">
            <button
              onClick={() => setActiveTab('side-by-side')}
              className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                activeTab === 'side-by-side'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {lang === 'si' ? 'සම්පූර්ණ සංසන්දනය' : 'Side-by-Side'}
            </button>
            <button
              onClick={() => setActiveTab('segments')}
              className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                activeTab === 'segments'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {lang === 'si' ? `වාක්‍ය අනුව (${segments.length})` : `Segments (${segments.length})`}
            </button>
            {(summaryTamil || summarySinhala) && (
              <button
                onClick={() => setActiveTab('summary')}
                className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                  activeTab === 'summary'
                    ? 'bg-amber-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {lang === 'si' ? 'සාරාංශය' : 'Summary'}
              </button>
            )}
          </div>

          {/* Export text button */}
          <button
            onClick={exportTextFile}
            title="පෙළ ගොනුවක් ලෙස බාගත කරන්න"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-300 bg-slate-800/80 hover:bg-slate-700/80 rounded-xl border border-slate-700 transition-colors"
          >
            <FileText className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">{lang === 'si' ? 'පෙළ බාගත කරන්න (TXT)' : 'Export TXT'}</span>
          </button>
        </div>
      </div>

      {/* Main Tab Content */}
      {activeTab === 'side-by-side' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Tamil Transcript Card */}
          <div className="flex flex-col rounded-xl border border-slate-800 bg-slate-950/60 p-4 relative">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 font-semibold">
                  தமிழ் (Tamil Original)
                </span>
              </div>
              <button
                onClick={() => copyToClipboard(tamilTranscript, 'tamil')}
                className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-200 transition-colors"
              >
                {copiedTamil ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedTamil ? 'පිටපත් විය' : 'පිටපත්'}</span>
              </button>
            </div>

            <p className="text-base text-slate-200 leading-relaxed font-tamil font-medium whitespace-pre-wrap">
              {tamilTranscript}
            </p>

            {tamilRomanized && (
              <div className="mt-3 pt-3 border-t border-slate-800/80">
                <p className="text-[11px] text-slate-400 font-mono italic">
                  <span className="text-slate-500 font-semibold not-italic mr-1">උච්චාරණය:</span>
                  {tamilRomanized}
                </p>
              </div>
            )}
          </div>

          {/* Sinhala Translation Card (with live editor) */}
          <div className="flex flex-col rounded-xl border border-amber-500/30 bg-amber-950/10 p-4 relative">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 font-semibold">
                  සිංහල (Sinhala Translation)
                </span>
                <span className="text-[10px] text-emerald-400 font-mono">● හඬට සූදානම්</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsEditingSinhala(!isEditingSinhala)}
                  className="flex items-center gap-1 text-xs text-amber-400 hover:text-amber-300 transition-colors bg-amber-500/10 hover:bg-amber-500/20 px-2 py-0.5 rounded-lg border border-amber-500/20"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>{isEditingSinhala ? 'අවලංගු කරන්න' : 'වෙනස් කරන්න (Edit)'}</span>
                </button>
                <button
                  onClick={() => copyToClipboard(editedText, 'sinhala')}
                  className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-200 transition-colors"
                >
                  {copiedSinhala ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedSinhala ? 'පිටපත් විය' : 'පිටපත්'}</span>
                </button>
              </div>
            </div>

            {isEditingSinhala ? (
              <div className="space-y-3">
                <textarea
                  value={editedText}
                  onChange={(e) => setEditedText(e.target.value)}
                  rows={4}
                  className="w-full rounded-lg border border-amber-500/50 bg-slate-950 p-3 text-base text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500/50 font-sinhala leading-relaxed"
                  placeholder="සිංහල අකුරින් අවශ්‍ය වෙනස්කම් සිදුකරන්න..."
                />
                <div className="flex items-center justify-between">
                  <p className="text-[11px] text-slate-400">
                    වෙනස් කළ පසු නැවත හඬ උත්පාදනය කිරීමට පහත බොත්තම ඔබන්න.
                  </p>
                  <button
                    onClick={handleSaveAndRegenerate}
                    disabled={isRegeneratingVoice || !editedText.trim()}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-500 rounded-lg shadow-md transition-all disabled:opacity-50"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>{isRegeneratingVoice ? 'හඬ ගන්වමින්...' : 'නැවත හඬ ගන්වන්න (Re-voice)'}</span>
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <p className="text-base text-amber-100 font-semibold font-sinhala leading-relaxed whitespace-pre-wrap">
                  {editedText}
                </p>

                {sinhalaRomanized && (
                  <div className="mt-3 pt-3 border-t border-amber-500/20">
                    <p className="text-[11px] text-slate-400 font-mono italic">
                      <span className="text-slate-500 font-semibold not-italic mr-1">Singlish:</span>
                      {sinhalaRomanized}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Segments View */}
      {activeTab === 'segments' && (
        <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1">
          {segments.map((seg, idx) => (
            <div
              key={seg.id || idx}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-xl border border-slate-800 bg-slate-950/40 hover:bg-slate-800/30 transition-colors"
            >
              <div className="flex items-start gap-2.5 flex-1">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-slate-800 text-slate-300 text-xs font-mono font-bold flex items-center justify-center">
                  {idx + 1}
                </span>
                <div className="space-y-1">
                  <p className="text-sm font-tamil text-blue-300 font-medium">{seg.tamil}</p>
                  <p className="text-sm font-sinhala text-amber-200 font-semibold">{seg.sinhala}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Summary View */}
      {activeTab === 'summary' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-2">
          {summaryTamil && (
            <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/60">
              <span className="text-xs text-blue-400 font-semibold mb-1 block">சுருக்கம் (Tamil Summary):</span>
              <p className="text-sm text-slate-300 font-tamil">{summaryTamil}</p>
            </div>
          )}
          {summarySinhala && (
            <div className="p-4 rounded-xl border border-amber-500/20 bg-amber-950/20">
              <span className="text-xs text-amber-300 font-semibold mb-1 block">සාරාංශය (Sinhala Summary):</span>
              <p className="text-sm text-slate-200 font-sinhala">{summarySinhala}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
