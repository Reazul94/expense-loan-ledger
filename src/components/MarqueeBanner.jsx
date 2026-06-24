import React from 'react';
import { marqueeTips } from '../utils/translations';
import { Sparkles } from 'lucide-react';

export default function MarqueeBanner({ lang }) {
  const tips = marqueeTips[lang] || [];

  return (
    <div className="w-full bg-gradient-to-r from-indigo-900/60 via-purple-900/40 to-slate-900/60 border-b border-indigo-950 backdrop-blur-md text-xs py-2.5 overflow-hidden relative z-50">
      <div className="max-w-7xl mx-auto px-4 flex items-center gap-3">
        {/* Banner Label */}
        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-400 font-bold shrink-0 uppercase tracking-wider text-[10px] border border-indigo-500/30">
          <Sparkles className="w-3 h-3 animate-pulse" />
          {lang === 'en' ? 'Tips' : 'পরামর্শ'}
        </div>

        {/* Marquee Track */}
        <div className="relative flex overflow-x-hidden w-full">
          <div className="animate-marquee flex whitespace-nowrap hover:[animation-play-state:paused] cursor-pointer">
            {tips.map((tip, idx) => (
              <span key={`tip-1-${idx}`} className="mx-8 text-slate-300 font-medium select-none hover:text-indigo-300 transition-colors">
                {tip}
              </span>
            ))}
            {/* Duplicated for infinite scrolling */}
            {tips.map((tip, idx) => (
              <span key={`tip-2-${idx}`} className="mx-8 text-slate-300 font-medium select-none hover:text-indigo-300 transition-colors">
                {tip}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
