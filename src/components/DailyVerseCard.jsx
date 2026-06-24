import React, { useState } from 'react';
import { getVerseOfTheDay, quranicVerses } from '../utils/verses';
import { BookOpen, RefreshCw } from 'lucide-react';

export default function DailyVerseCard({ lang, t }) {
  const [verse, setVerse] = useState(() => getVerseOfTheDay());
  const [spin, setSpin] = useState(false);

  // Allow manual rotation to other verses
  const handleNextVerse = () => {
    setSpin(true);
    setTimeout(() => setSpin(false), 600);

    const currentIndex = quranicVerses.findIndex(v => v.id === verse.id);
    const nextIndex = (currentIndex + 1) % quranicVerses.length;
    setVerse(quranicVerses[nextIndex]);
  };

  return (
    <div className="glass-card rounded-2xl p-5 border border-slate-800/80 glow-indigo relative overflow-hidden animate-fadeIn">
      {/* Background Soft Glow */}
      <div className="absolute -right-20 -top-20 w-48 h-48 bg-amber-500/5 rounded-full blur-3xl pointer-events-none"></div>
      
      {/* Title & Actions */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2 text-amber-400">
          <BookOpen className="w-5 h-5 shrink-0" />
          <h3 className="text-xs font-extrabold text-slate-100 uppercase tracking-wider">
            {lang === 'en' ? 'Daily Quranic Reflection' : 'আজকের কুরআনিক প্রতিফলন'}
          </h3>
        </div>

        <button
          type="button"
          onClick={handleNextVerse}
          className="p-1.5 rounded-lg text-slate-400 hover:text-amber-400 hover:bg-amber-500/10 transition-all cursor-pointer bg-transparent border-0"
          title={lang === 'en' ? 'Next Reflection' : 'পরবর্তী বাণী'}
        >
          <RefreshCw className={`w-4 h-4 ${spin ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Main Content */}
      <div className="space-y-4">
        {/* Arabic Text (Styled beautifully in center, RTL) */}
        <p 
          className="text-xl sm:text-2xl text-amber-300 font-medium text-center leading-loose my-2 antialiased select-none"
          style={{ 
            fontFamily: 'Amiri, Georgia, serif', 
            direction: 'rtl',
            textShadow: '0 0 1px rgba(251, 191, 36, 0.1)' 
          }}
        >
          {verse.arabic}
        </p>

        {/* Localized Translations / Subtitles */}
        <div className="border-t border-slate-800/30 pt-3.5 space-y-2">
          {lang === 'en' ? (
            <>
              {/* Primary English */}
              <p className="text-xs font-semibold text-slate-100 leading-relaxed">
                {verse.english}
              </p>
              {/* Bangla Subtitle */}
              <p className="text-[11px] text-slate-400 font-medium italic leading-relaxed">
                {verse.bangla}
              </p>
            </>
          ) : (
            <>
              {/* Primary Bangla */}
              <p className="text-xs font-semibold text-slate-100 leading-relaxed">
                {verse.bangla}
              </p>
              {/* English Subtitle */}
              <p className="text-[11px] text-slate-400 font-medium italic leading-relaxed">
                {verse.english}
              </p>
            </>
          )}
        </div>

        {/* Source Reference */}
        <div className="flex justify-end pt-1">
          <span className="text-[10px] font-bold text-amber-500 bg-amber-500/5 px-2.5 py-0.5 rounded-full border border-amber-500/10 tracking-wide">
            {verse.reference}
          </span>
        </div>
      </div>
    </div>
  );
}
