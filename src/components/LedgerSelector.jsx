import React from 'react';
import { Calendar } from 'lucide-react';

const EN_MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const BN_MONTHS = [
  "জানুয়ারি", "ফেব্রুয়ারি", "মার্চ", "এপ্রিল", "মে", "জুন",
  "জুলাই", "আগস্ট", "সেপ্টেম্বর", "অক্টোবর", "নভেম্বর", "ডিসেম্বর"
];

// Utility to convert numbers to Bengali digits
export function toBengaliDigits(numStr) {
  const bnDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return numStr.toString().replace(/\d/g, d => bnDigits[d]);
}

export default function LedgerSelector({ currentMonth, setCurrentMonth, lang, t }) {
  // Generate options (12 months back, 12 months forward from current month)
  const getMonthOptions = () => {
    const options = [];
    const now = new Date();
    const startYear = now.getFullYear() - 1;
    const startMonth = now.getMonth(); // 0-indexed

    for (let i = 0; i < 25; i++) {
      const date = new Date(startYear, startMonth + i, 1);
      const year = date.getFullYear();
      const monthIdx = date.getMonth();
      const value = `${year}-${String(monthIdx + 1).padStart(2, '0')}`;
      
      let label = "";
      if (lang === 'en') {
        label = `${EN_MONTHS[monthIdx]} ${year}`;
      } else {
        label = `${BN_MONTHS[monthIdx]} ${toBengaliDigits(year.toString())}`;
      }
      
      options.push({ value, label });
    }
    return options;
  };

  const options = getMonthOptions();

  return (
    <div className="flex flex-col md:flex-row items-start md:items-center gap-3 bg-slate-900/50 p-4 rounded-xl border border-slate-800/80 backdrop-blur-md glow-indigo">
      <div className="flex items-center gap-2 text-indigo-400 shrink-0">
        <Calendar className="w-5 h-5" />
        <span className="text-sm font-semibold tracking-wide uppercase">
          {t.ledgerMonth}
        </span>
      </div>
      
      <select
        value={currentMonth}
        onChange={(e) => setCurrentMonth(e.target.value)}
        className="w-full md:w-64 px-3.5 py-2.5 rounded-lg text-sm font-medium focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 cursor-pointer shadow-lg transition-colors"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} className="bg-[var(--bg-color)] text-[var(--text-color)]">
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
