import React, { useState } from 'react';
import { getDuaOfTheDay, propheticDuas } from '../utils/duas';
import { Sparkles, RefreshCw } from 'lucide-react';

export default function DailyDuaCard({ lang, t }) {
  const [dua, setDua] = useState(() => getDuaOfTheDay());
  const [spin, setSpin] = useState(false);

  // Allow manual rotation to other Duas
  const handleNextDua = () => {
    setSpin(true);
    setTimeout(() => setSpin(false), 600);

    const currentIndex = propheticDuas.findIndex(d => d.id === dua.id);
    const nextIndex = (currentIndex + 1) % propheticDuas.length;
    setDua(propheticDuas[nextIndex]);
  };

  return (
    <div className="glass-card rounded-2xl p-5 border border-slate-800/80 glow-sky relative overflow-hidden animate-fadeIn">
      {/* Background Soft Glow */}
      <div className="absolute -right-20 -top-20 w-48 h-48 bg-sky-500/5 rounded-full blur-3xl pointer-events-none"></div>
      
      {/* Title & Actions */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2 text-sky-400">
          <Sparkles className="w-5 h-5 shrink-0" />
          <h3 className="text-xs font-extrabold text-slate-100 uppercase tracking-wider">
            {lang === 'en' ? 'Prophetic & Quranic Dua' : 'আজকের দুআ প্রতিফলন'}
          </h3>
        </div>

        <button
          type="button"
          onClick={handleNextDua}
          className="p-1.5 rounded-lg text-slate-400 hover:text-sky-400 hover:bg-sky-500/10 transition-all cursor-pointer bg-transparent border-0"
          title={lang === 'en' ? 'Next Dua' : 'পরবর্তী দুআ'}
        >
          <RefreshCw className={`w-4 h-4 ${spin ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Main Content */}
      <div className="space-y-4">
        {/* Arabic Text (Styled beautifully in center, RTL) */}
        <p 
          className="text-xl sm:text-2xl text-sky-300 font-medium text-center leading-loose my-2 antialiased select-none"
          style={{ 
            fontFamily: 'Amiri, Georgia, serif', 
            direction: 'rtl',
            textShadow: '0 0 1px rgba(56, 189, 248, 0.1)' 
          }}
        >
          {dua.arabic}
        </p>

        {/* Localized Translations / Subtitles */}
        <div className="border-t border-slate-800/30 pt-3.5 space-y-2">
          {lang === 'en' ? (
            <>
              {/* Primary English */}
              <p className="text-xs font-semibold text-slate-100 leading-relaxed">
                {dua.english}
              </p>
              {/* Bangla Subtitle */}
              <p className="text-[11px] text-slate-400 font-medium italic leading-relaxed">
                {dua.bangla}
              </p>
            </>
          ) : (
            <>
              {/* Primary Bangla */}
              <p className="text-xs font-semibold text-slate-100 leading-relaxed">
                {dua.bangla}
              </p>
              {/* English Subtitle */}
              <p className="text-[11px] text-slate-400 font-medium italic leading-relaxed">
                {dua.english}
              </p>
            </>
          )}
        </div>

        {/* Source Reference */}
        <div className="flex justify-end pt-1">
          <span className="text-[10px] font-bold text-sky-500 bg-sky-500/5 px-2.5 py-0.5 rounded-full border border-sky-500/10 tracking-wide">
            {dua.reference}
          </span>
        </div>
      </div>
    </div>
  );
}
