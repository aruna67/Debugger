import React from 'react';
import { User, Sparkles, SlidersHorizontal, Volume2 } from 'lucide-react';

export interface VoiceOption {
  id: 'Kore' | 'Zephyr' | 'Puck' | 'Fenrir' | 'Charon';
  nameSi: string;
  nameEn: string;
  genderSi: string;
  genderEn: string;
  gender: 'female' | 'male';
  tagSi: string;
  tagEn: string;
  descriptionSi: string;
  descriptionEn: string;
}

export const AVAILABLE_VOICES: VoiceOption[] = [
  {
    id: 'Kore',
    nameSi: 'කෝරේ (Kore)',
    nameEn: 'Kore (Female)',
    genderSi: 'කාන්තා',
    genderEn: 'Female',
    gender: 'female',
    tagSi: 'ස්වභාවික & මිත්‍රශීලී',
    tagEn: 'Natural & Friendly',
    descriptionSi: 'පැහැදිලි උච්චාරණයක් සහිත මෘදු, ස්වභාවික කාන්තා හඬක්.',
    descriptionEn: 'Soft, natural female voice with warm articulation.',
  },
  {
    id: 'Zephyr',
    nameSi: 'සෙෆයර් (Zephyr)',
    nameEn: 'Zephyr (Female)',
    genderSi: 'කාන්තා',
    genderEn: 'Female',
    gender: 'female',
    tagSi: 'දීප්තිමත් & විධිමත්',
    tagEn: 'Bright & Articulate',
    descriptionSi: 'පුවත් සහ නිවේදන සඳහා සුදුසු පැහැදිලි කාන්තා හඬක්.',
    descriptionEn: 'Crisp, bright female voice suited for formal announcements.',
  },
  {
    id: 'Puck',
    nameSi: 'පක් (Puck)',
    nameEn: 'Puck (Male)',
    genderSi: 'පිරිමි',
    genderEn: 'Male',
    gender: 'male',
    tagSi: 'තරුණ & ජවසම්පන්න',
    tagEn: 'Youthful & Lively',
    descriptionSi: 'සාමාන්‍ය කතාබහට හා විනෝදාත්මක අන්තර්ගතයට ගැළපෙන තරුණ පිරිමි හඬක්.',
    descriptionEn: 'Energetic, friendly male tone great for casual dialogue.',
  },
  {
    id: 'Fenrir',
    nameSi: 'ෆෙන්රිර් (Fenrir)',
    nameEn: 'Fenrir (Male)',
    genderSi: 'පිරිමි',
    genderEn: 'Male',
    gender: 'male',
    tagSi: 'ගැඹුරු & විශ්වාසනීය',
    tagEn: 'Deep & Authoritative',
    descriptionSi: 'ගැඹුරු පෞරුෂයක් හා විශ්වාසනීය බවක් දනවන පිරිමි හඬක්.',
    descriptionEn: 'Deep resonance and authoritative male voice.',
  },
  {
    id: 'Charon',
    nameSi: 'චැරොන් (Charon)',
    nameEn: 'Charon (Male)',
    genderSi: 'පිරිමි',
    genderEn: 'Male',
    gender: 'male',
    tagSi: 'කථික & ගාම්භීර',
    tagEn: 'Broadcast & Rich',
    descriptionSi: 'ගාම්භීර වාර්තාමය සහ කථික විලාසයේ පිරිමි හඬක්.',
    descriptionEn: 'Rich oratorical broadcast timbre.',
  },
];

export interface ToneOption {
  id: 'natural' | 'news' | 'story' | 'polite';
  labelSi: string;
  labelEn: string;
  descSi: string;
  descEn: string;
}

export const TONE_OPTIONS: ToneOption[] = [
  {
    id: 'natural',
    labelSi: 'සාමාන්‍ය කතාබහ (Conversational)',
    labelEn: 'Natural Conversational',
    descSi: 'දෛනික මිත්‍රශීලී කතාබස් විලාසය',
    descEn: 'Everyday friendly spoken phrasing',
  },
  {
    id: 'news',
    labelSi: 'පුවත් / විධිමත් (News & Formal)',
    labelEn: 'Formal & Broadcast',
    descSi: 'ගෞරවනීය හා නිරවද්‍ය භාෂා රටාව',
    descEn: 'Polite and professional delivery',
  },
  {
    id: 'story',
    labelSi: 'කතන්දර / විස්තරාත්මක (Storyteller)',
    labelEn: 'Narrative Storyteller',
    descSi: 'හැඟීම්බර, ආකර්ෂණීය විස්තර විලාසය',
    descEn: 'Expressive and engaging flow',
  },
  {
    id: 'polite',
    labelSi: 'සුහද පාරිභෝගික සත්කාර (Customer Care)',
    labelEn: 'Polite Customer Service',
    descSi: 'ඉතා ගෞරවනීය ආචාරශීලී වචන',
    descEn: 'Respectful and helpful tone',
  },
];

interface VoiceSelectorProps {
  selectedVoice: 'Kore' | 'Zephyr' | 'Puck' | 'Fenrir' | 'Charon';
  onVoiceChange: (voice: 'Kore' | 'Zephyr' | 'Puck' | 'Fenrir' | 'Charon') => void;
  selectedTone: 'natural' | 'news' | 'story' | 'polite';
  onToneChange: (tone: 'natural' | 'news' | 'story' | 'polite') => void;
  targetLang?: 'si' | 'ta';
  lang: 'si' | 'en';
}

export const VoiceSelector: React.FC<VoiceSelectorProps> = ({
  selectedVoice,
  onVoiceChange,
  selectedTone,
  onToneChange,
  targetLang = 'si',
  lang,
}) => {
  const isTargetTamil = targetLang === 'ta';
  return (
    <div className="space-y-4 rounded-2xl border border-slate-800 bg-slate-900/60 p-4 md:p-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-amber-400" />
          <h3 className="text-sm font-semibold text-slate-100">
            {lang === 'si'
              ? isTargetTamil
                ? 'දමිළ කටහඬ හා විලාසය තෝරන්න (Tamil Voice Selection)'
                : 'සිංහල කටහඬ හා විලාසය තෝරන්න (Sinhala Voice Selection)'
              : isTargetTamil
              ? 'Select Tamil AI Voice & Style'
              : 'Select Sinhala AI Voice & Style'}
          </h3>
        </div>
        <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center gap-1 font-mono">
          <Sparkles className="w-3 h-3" /> Gemini 3.8 Voice
        </span>
      </div>

      {/* Voice Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
        {AVAILABLE_VOICES.map((v) => {
          const isSelected = selectedVoice === v.id;
          return (
            <button
              key={v.id}
              onClick={() => onVoiceChange(v.id)}
              className={`flex flex-col text-left p-3 rounded-xl border transition-all text-xs relative ${
                isSelected
                  ? 'border-amber-500 bg-amber-500/10 shadow-sm shadow-amber-500/20'
                  : 'border-slate-800 bg-slate-950/40 hover:border-slate-700 hover:bg-slate-800/40'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-1.5 font-bold text-slate-100">
                  <User
                    className={`w-3.5 h-3.5 ${
                      v.gender === 'female' ? 'text-pink-400' : 'text-blue-400'
                    }`}
                  />
                  <span>{lang === 'si' ? v.nameSi : v.nameEn}</span>
                </div>
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                    v.gender === 'female'
                      ? 'bg-pink-500/15 text-pink-300'
                      : 'bg-blue-500/15 text-blue-300'
                  }`}
                >
                  {lang === 'si' ? v.genderSi : v.genderEn}
                </span>
              </div>
              <p className="text-[11px] text-amber-300 font-medium mb-1">
                {lang === 'si' ? v.tagSi : v.tagEn}
              </p>
              <p className="text-[10px] text-slate-400 leading-relaxed">
                {lang === 'si' ? v.descriptionSi : v.descriptionEn}
              </p>
            </button>
          );
        })}
      </div>

      {/* Tone Selection */}
      <div className="pt-2 border-t border-slate-800/80">
        <label className="block text-xs font-medium text-slate-300 mb-2">
          {lang === 'si' ? 'කතා විලාසය / ස්වරය (Speech Tone):' : 'Speech Tone & Style:'}
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {TONE_OPTIONS.map((t) => {
            const isSelected = selectedTone === t.id;
            return (
              <button
                key={t.id}
                onClick={() => onToneChange(t.id)}
                className={`p-2.5 text-left rounded-xl border text-xs transition-colors ${
                  isSelected
                    ? 'border-amber-500/60 bg-amber-500/15 text-amber-200'
                    : 'border-slate-800 bg-slate-900/60 text-slate-300 hover:bg-slate-800/50'
                }`}
              >
                <div className="font-semibold">{lang === 'si' ? t.labelSi : t.labelEn}</div>
                <div className="text-[10px] text-slate-400 mt-0.5">
                  {lang === 'si' ? t.descSi : t.descEn}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
