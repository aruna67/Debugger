import React, { useState } from 'react';
import { Copy, Check, Edit3, Volume2, Sparkles, FileText, Download } from 'lucide-react';

interface Segment {
  id: number;
  source?: string;
  target?: string;
  tamil?: string;
  sinhala?: string;
}

interface TranslationViewerProps {
  direction?: 'ta-to-si' | 'si-to-ta';
  sourceTranscript: string;
  sourceRomanized?: string;
  targetTranslation: string;
  targetRomanized?: string;
  segments: Segment[];
  summarySource?: string;
  summaryTarget?: string;
  onUpdateTargetText: (newText: string) => void;
  onRegenerateVoice: (editedText: string) => void;
  isRegeneratingVoice: boolean;
  onDownloadAudio?: () => void;
  lang: 'si' | 'en';
  // Legacy aliases
  tamilTranscript?: string;
  tamilRomanized?: string;
  sinhalaTranslation?: string;
  sinhalaRomanized?: string;
  onUpdateSinhalaText?: (newText: string) => void;
}

export const TranslationViewer: React.FC<TranslationViewerProps> = ({
  direction = 'ta-to-si',
  sourceTranscript,
  sourceRomanized,
  targetTranslation,
  targetRomanized,
  segments,
  summarySource,
  summaryTarget,
  onUpdateTargetText,
  onRegenerateVoice,
  isRegeneratingVoice,
  onDownloadAudio,
  lang,
  tamilTranscript,
  tamilRomanized,
  sinhalaTranslation,
  sinhalaRomanized,
  onUpdateSinhalaText,
}) => {
  const isSiToTa = direction === 'si-to-ta';

  // Resolved source & target
  const resolvedSource = sourceTranscript || (isSiToTa ? sinhalaTranslation : tamilTranscript) || '';
  const resolvedSourceRomanized = sourceRomanized || (isSiToTa ? sinhalaRomanized : tamilRomanized);
  const resolvedTarget = targetTranslation || (isSiToTa ? tamilTranscript : sinhalaTranslation) || '';
  const resolvedTargetRomanized = targetRomanized || (isSiToTa ? tamilRomanized : sinhalaRomanized);

  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState(resolvedTarget);
  const [copiedSource, setCopiedSource] = useState(false);
  const [copiedTarget, setCopiedTarget] = useState(false);
  const [activeTab, setActiveTab] = useState<'side-by-side' | 'segments' | 'summary'>('side-by-side');

  // Keep edited text in sync if prop changes
  React.useEffect(() => {
    setEditedText(resolvedTarget);
  }, [resolvedTarget]);

  const copyToClipboard = (text: string, type: 'source' | 'target') => {
    navigator.clipboard.writeText(text);
    if (type === 'source') {
      setCopiedSource(true);
      setTimeout(() => setCopiedSource(false), 2000);
    } else {
      setCopiedTarget(true);
      setTimeout(() => setCopiedTarget(false), 2000);
    }
  };

  const handleSaveAndRegenerate = () => {
    if (onUpdateTargetText) {
      onUpdateTargetText(editedText);
    } else if (onUpdateSinhalaText) {
      onUpdateSinhalaText(editedText);
    }
    onRegenerateVoice(editedText);
    setIsEditing(false);
  };

  const sourceLabel = isSiToTa ? 'සිංහල (Sinhala Original)' : 'தமிழ் (Tamil Original)';
  const targetLabel = isSiToTa ? 'தமிழ் (Tamil Dubbed Voice)' : 'සිංහල (Sinhala Dubbed Voice)';

  const exportTextFile = () => {
    const title = isSiToTa
      ? 'සිංහල - දමිළ හඬ පරිවර්තන පිටපත (Sinhala to Tamil Transcript)'
      : 'දමිළ - සිංහල හඬ පරිවර්තන පිටපත (Tamil to Sinhala Transcript)';

    const content = `================================================
${title}
දිනය: ${new Date().toLocaleDateString()}
================================================

[මුල් පිටපත / Original (${sourceLabel})]
${resolvedSource}
${resolvedSourceRomanized ? `\n(උච්චාරණය / Pronunciation): ${resolvedSourceRomanized}` : ''}

------------------------------------------------
[පරිවර්තනය / Translation (${targetLabel})]
${editedText}
${resolvedTargetRomanized ? `\n(උච්චාරණය / Pronunciation): ${resolvedTargetRomanized}` : ''}

------------------------------------------------
[වාක්‍ය අනුව පෙළගැස්ම / Sentence Segments]
${segments
  .map((s, idx) => {
    const src = s.source || (isSiToTa ? s.sinhala : s.tamil) || '';
    const tgt = s.target || (isSiToTa ? s.tamil : s.sinhala) || '';
    return `${idx + 1}. [${isSiToTa ? 'Sinhala' : 'Tamil'}] ${src}\n   [${isSiToTa ? 'Tamil' : 'Sinhala'}]   ${tgt}`;
  })
  .join('\n\n')}
`;

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${isSiToTa ? 'sinhala_to_tamil' : 'tamil_to_sinhala'}_transcript_${Date.now()}.txt`;
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
            {(summarySource || summaryTarget) && (
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
          {/* Source Card */}
          <div className="flex flex-col rounded-xl border border-slate-800 bg-slate-950/60 p-4 relative">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 font-semibold">
                {sourceLabel}
              </span>
              <button
                onClick={() => copyToClipboard(resolvedSource, 'source')}
                className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-200 transition-colors"
              >
                {copiedSource ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedSource ? 'පිටපත් විය' : 'පිටපත්'}</span>
              </button>
            </div>

            <p
              className={`text-base text-slate-200 leading-relaxed font-medium whitespace-pre-wrap ${
                isSiToTa ? 'font-sinhala' : 'font-tamil'
              }`}
            >
              {resolvedSource}
            </p>

            {resolvedSourceRomanized && (
              <div className="mt-3 pt-3 border-t border-slate-800/80">
                <p className="text-[11px] text-slate-400 font-mono italic">
                  <span className="text-slate-500 font-semibold not-italic mr-1">උච්චාරණය:</span>
                  {resolvedSourceRomanized}
                </p>
              </div>
            )}
          </div>

          {/* Target Card (with live editor) */}
          <div className="flex flex-col rounded-xl border border-amber-500/30 bg-amber-950/10 p-4 relative">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 font-semibold">
                  {targetLabel}
                </span>
                <span className="text-[10px] text-emerald-400 font-mono">● හඬට සූදානම්</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="flex items-center gap-1 text-xs text-amber-400 hover:text-amber-300 transition-colors bg-amber-500/10 hover:bg-amber-500/20 px-2 py-0.5 rounded-lg border border-amber-500/20"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>{isEditing ? 'අවලංගු කරන්න' : 'වෙනස් කරන්න (Edit)'}</span>
                </button>
                <button
                  onClick={() => copyToClipboard(editedText, 'target')}
                  className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-200 transition-colors"
                >
                  {copiedTarget ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedTarget ? 'පිටපත් විය' : 'පිටපත්'}</span>
                </button>
              </div>
            </div>

            {isEditing ? (
              <div className="space-y-3">
                <textarea
                  value={editedText}
                  onChange={(e) => setEditedText(e.target.value)}
                  rows={4}
                  className={`w-full rounded-lg border border-amber-500/50 bg-slate-950 p-3 text-base text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500/50 leading-relaxed ${
                    isSiToTa ? 'font-tamil' : 'font-sinhala'
                  }`}
                  placeholder={
                    isSiToTa
                      ? 'தமிழ் எழுத்தில் தேவையான மாற்றங்களைச் செய்யுங்கள்...'
                      : 'සිංහල අකුරින් අවශ්‍ය වෙනස්කම් සිදුකරන්න...'
                  }
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
                    <span>
                      {isRegeneratingVoice
                        ? 'හඬ ගන්වමින්...'
                        : isSiToTa
                        ? 'නැවත දමිළ හඬ ගන්වන්න (Re-voice Tamil)'
                        : 'නැවත සිංහල හඬ ගන්වන්න (Re-voice Sinhala)'}
                    </span>
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <p
                  className={`text-base text-amber-100 font-semibold leading-relaxed whitespace-pre-wrap ${
                    isSiToTa ? 'font-tamil' : 'font-sinhala'
                  }`}
                >
                  {editedText}
                </p>

                {resolvedTargetRomanized && (
                  <div className="mt-3 pt-3 border-t border-amber-500/20">
                    <p className="text-[11px] text-slate-400 font-mono italic">
                      <span className="text-slate-500 font-semibold not-italic mr-1">උච්චාරණය:</span>
                      {resolvedTargetRomanized}
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
          {segments.map((seg, idx) => {
            const src = seg.source || (isSiToTa ? seg.sinhala : seg.tamil) || '';
            const tgt = seg.target || (isSiToTa ? seg.tamil : seg.sinhala) || '';
            return (
              <div
                key={seg.id || idx}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-xl border border-slate-800 bg-slate-950/40 hover:bg-slate-800/30 transition-colors"
              >
                <div className="flex items-start gap-2.5 flex-1">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-slate-800 text-slate-300 text-xs font-mono font-bold flex items-center justify-center">
                    {idx + 1}
                  </span>
                  <div className="space-y-1">
                    <p
                      className={`text-sm text-blue-300 font-medium ${
                        isSiToTa ? 'font-sinhala' : 'font-tamil'
                      }`}
                    >
                      {src}
                    </p>
                    <p
                      className={`text-sm text-amber-200 font-semibold ${
                        isSiToTa ? 'font-tamil' : 'font-sinhala'
                      }`}
                    >
                      {tgt}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Summary View */}
      {activeTab === 'summary' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-2">
          {summarySource && (
            <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/60">
              <span className="text-xs text-blue-400 font-semibold mb-1 block">
                {isSiToTa ? 'සිංහල සාරාංශය (Sinhala Summary):' : 'சுருக்கம் (Tamil Summary):'}
              </span>
              <p className={`text-sm text-slate-300 ${isSiToTa ? 'font-sinhala' : 'font-tamil'}`}>
                {summarySource}
              </p>
            </div>
          )}
          {summaryTarget && (
            <div className="p-4 rounded-xl border border-amber-500/20 bg-amber-950/20">
              <span className="text-xs text-amber-300 font-semibold mb-1 block">
                {isSiToTa ? 'சுருக்கம் (Tamil Summary):' : 'සාරාංශය (Sinhala Summary):'}
              </span>
              <p className={`text-sm text-slate-200 ${isSiToTa ? 'font-tamil' : 'font-sinhala'}`}>
                {summaryTarget}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
