import React, { useState } from 'react';
import { getHadithOfTheDay, propheticHadiths } from '../utils/hadiths';
import { Quote, RefreshCw } from 'lucide-react';

export default function DailyHadithCard({ lang, t }) {
  const [hadith, setHadith] = useState(() => getHadithOfTheDay());
  const [spin, setSpin] = useState(false);

  // Allow manual rotation to other Hadiths
  const handleNextHadith = () => {
    setSpin(true);
    setTimeout(() => setSpin(false), 600);

    const currentIndex = propheticHadiths.findIndex(h => h.id === hadith.id);
    const nextIndex = (currentIndex + 1) % propheticHadiths.length;
    setHadith(propheticHadiths[nextIndex]);
  };

  return (
    <div className="glass-card rounded-2xl p-5 border border-slate-800/80 glow-emerald relative overflow-hidden animate-fadeIn">
      {/* Background Soft Glow */}
      <div className="absolute -right-20 -top-20 w-48 h-48 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none"></div>
      
      {/* Title & Actions */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2 text-emerald-400">
          <Quote className="w-5 h-5 shrink-0" />
          <h3 className="text-xs font-extrabold text-slate-100 uppercase tracking-wider">
            {lang === 'en' ? 'Prophetic Hadith Reflection (ﷺ)' : 'আজকের হাদিস প্রতিফলন (ﷺ)'}
          </h3>
        </div>

        <button
          type="button"
          onClick={handleNextHadith}
          className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10 transition-all cursor-pointer bg-transparent border-0"
          title={lang === 'en' ? 'Next Hadith' : 'পরবর্তী হাদিস'}
        >
          <RefreshCw className={`w-4 h-4 ${spin ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Main Content */}
      <div className="space-y-4">
        {/* Arabic Text (Styled beautifully in center, RTL) */}
        <p 
          className="text-xl sm:text-2xl text-emerald-300 font-medium text-center leading-loose my-2 antialiased select-none"
          style={{ 
            fontFamily: 'Amiri, Georgia, serif', 
            direction: 'rtl',
            textShadow: '0 0 1px rgba(52, 211, 153, 0.1)' 
          }}
        >
          {hadith.arabic}
        </p>

        {/* Localized Translations / Subtitles */}
        <div className="border-t border-slate-800/30 pt-3.5 space-y-2">
          {lang === 'en' ? (
            <>
              {/* Primary English */}
              <p className="text-xs font-semibold text-slate-100 leading-relaxed">
                {hadith.english}
              </p>
              {/* Bangla Subtitle */}
              <p className="text-[11px] text-slate-400 font-medium italic leading-relaxed">
                {hadith.bangla}
              </p>
            </>
          ) : (
            <>
              {/* Primary Bangla */}
              <p className="text-xs font-semibold text-slate-100 leading-relaxed">
                {hadith.bangla}
              </p>
              {/* English Subtitle */}
              <p className="text-[11px] text-slate-400 font-medium italic leading-relaxed">
                {hadith.english}
              </p>
            </>
          )}
        </div>

        {/* Source Reference */}
        <div className="flex justify-end pt-1">
          <span className="text-[10px] font-bold text-emerald-500 bg-emerald-500/5 px-2.5 py-0.5 rounded-full border border-emerald-500/10 tracking-wide">
            {hadith.reference}
          </span>
        </div>
      </div>
    </div>
  );
}
