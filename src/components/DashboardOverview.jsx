import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  PiggyBank, 
  Percent, 
  Scale, 
  Check, 
  Edit2, 
  AlertTriangle 
} from 'lucide-react';
import { toBengaliDigits } from './LedgerSelector';

export default function DashboardOverview({ 
  income, 
  onSaveIncome, 
  totalExpenses, 
  activeBorrowed, 
  activeLent, 
  lang, 
  t 
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [tempIncome, setTempIncome] = useState(income);

  useEffect(() => {
    setTempIncome(income);
  }, [income]);

  const handleSave = () => {
    const val = parseFloat(tempIncome);
    if (!isNaN(val) && val >= 0) {
      onSaveIncome(val);
      setIsEditing(false);
    }
  };

  const netSavings = income - totalExpenses;
  const savingsRate = income > 0 ? (netSavings / income) * 100 : 0;
  const isAlertVisible = savingsRate < 20;

  // Utility to format values according to language setting
  const formatCurrency = (amount) => {
    const isNegative = amount < 0;
    const absVal = Math.abs(amount).toFixed(2);
    const currencySym = t.currency;
    const formattedNum = lang === 'bn' ? toBengaliDigits(absVal) : absVal;

    if (lang === 'bn') {
      return `${isNegative ? '-' : ''}${formattedNum} ${currencySym}`;
    } else {
      return `${isNegative ? '-' : ''}${currencySym}${formattedNum}`;
    }
  };

  const formatPercent = (pct) => {
    const formatted = pct.toFixed(1);
    return lang === 'bn' ? `${toBengaliDigits(formatted)}%` : `${formatted}%`;
  };

  return (
    <div className="space-y-6">
      {/* 5-Card Dashboard Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        
        {/* Income Card (Editable) */}
        <div className="glass-card rounded-2xl p-5 relative overflow-hidden flex flex-col justify-between h-32 border border-slate-800/80 transition-all duration-300 hover:scale-[1.02] hover:-translate-y-0.5 hover:shadow-xl group">
          {/* Subtle Glows */}
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 opacity-40 pointer-events-none" />
          <div className="absolute -right-6 -bottom-6 w-20 h-20 rounded-full bg-indigo-500/10 blur-xl group-hover:bg-indigo-500/20 transition-all duration-500 pointer-events-none" />
          
          <div className="flex justify-between items-start relative z-10">
            <span className="text-xs font-bold text-indigo-300/80 uppercase tracking-wider">{t.income}</span>
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 group-hover:scale-110 transition-transform duration-300">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          
          <div className="flex items-center gap-2 mt-2 relative z-10">
            {isEditing ? (
              <div className="flex items-center gap-1.5 w-full">
                <input
                  type="number"
                  value={tempIncome}
                  onChange={(e) => setTempIncome(e.target.value)}
                  className="w-full px-2 py-1 text-sm font-bold border border-indigo-500/30 rounded-lg focus:ring-1 focus:ring-indigo-500 bg-slate-950/40"
                  autoFocus
                  onKeyDown={(e) => { if (e.key === 'Enter') handleSave(); }}
                />
                <button 
                  onClick={handleSave}
                  className="p-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-500 transition-colors border-0 cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between w-full">
                <span className="text-xl font-black bg-gradient-to-r from-indigo-200 via-slate-100 to-indigo-300 bg-clip-text text-transparent tracking-tight">
                  {formatCurrency(income)}
                </span>
                <button 
                  onClick={() => setIsEditing(true)}
                  className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-400 hover:text-indigo-400 hover:bg-slate-800/40 rounded-lg transition-all border-0 bg-transparent cursor-pointer"
                  title={t.setIncome}
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Expenses Card */}
        <div className="glass-card rounded-2xl p-5 relative overflow-hidden flex flex-col justify-between h-32 border border-slate-800/80 transition-all duration-300 hover:scale-[1.02] hover:-translate-y-0.5 hover:shadow-xl group">
          <div className="absolute inset-0 bg-gradient-to-br from-rose-500/5 to-red-500/5 opacity-40 pointer-events-none" />
          <div className="absolute -right-6 -bottom-6 w-20 h-20 rounded-full bg-rose-500/10 blur-xl group-hover:bg-rose-500/20 transition-all duration-500 pointer-events-none" />

          <div className="flex justify-between items-start relative z-10">
            <span className="text-xs font-bold text-rose-300/80 uppercase tracking-wider">{t.totalExpenses}</span>
            <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400 group-hover:scale-110 transition-transform duration-300">
              <TrendingDown className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 relative z-10">
            <span className="text-xl font-black bg-gradient-to-r from-rose-300 via-slate-100 to-rose-200 bg-clip-text text-transparent tracking-tight">
              {formatCurrency(totalExpenses)}
            </span>
          </div>
        </div>

        {/* Net Savings Card */}
        <div className="glass-card rounded-2xl p-5 relative overflow-hidden flex flex-col justify-between h-32 border border-slate-800/80 transition-all duration-300 hover:scale-[1.02] hover:-translate-y-0.5 hover:shadow-xl group">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-teal-500/5 opacity-40 pointer-events-none" />
          <div className="absolute -right-6 -bottom-6 w-20 h-20 rounded-full bg-emerald-500/10 blur-xl group-hover:bg-emerald-500/20 transition-all duration-500 pointer-events-none" />

          <div className="flex justify-between items-start relative z-10">
            <span className="text-xs font-bold text-emerald-300/80 uppercase tracking-wider">{t.netSavings}</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 group-hover:scale-110 transition-transform duration-300">
              <PiggyBank className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 relative z-10">
            <span className={`text-xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r ${netSavings >= 0 ? 'from-emerald-400 to-teal-300' : 'from-rose-500 to-red-400'}`}>
              {formatCurrency(netSavings)}
            </span>
          </div>
        </div>

        {/* Savings Rate Card */}
        <div className="glass-card rounded-2xl p-5 relative overflow-hidden flex flex-col justify-between h-32 border border-slate-800/80 transition-all duration-300 hover:scale-[1.02] hover:-translate-y-0.5 hover:shadow-xl group">
          <div className="absolute inset-0 bg-gradient-to-br from-sky-500/5 to-blue-500/5 opacity-40 pointer-events-none" />
          <div className="absolute -right-6 -bottom-6 w-20 h-20 rounded-full bg-sky-500/10 blur-xl group-hover:bg-sky-500/20 transition-all duration-500 pointer-events-none" />

          <div className="flex justify-between items-start relative z-10">
            <span className="text-xs font-bold text-sky-300/80 uppercase tracking-wider">{t.savingsRate}</span>
            <div className="p-2 rounded-xl bg-sky-500/10 text-sky-400 group-hover:scale-110 transition-transform duration-300">
              <Percent className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 relative z-10">
            <span className={`text-xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r ${savingsRate >= 20 ? 'from-sky-400 to-teal-300' : 'from-amber-400 to-orange-400'}`}>
              {formatPercent(savingsRate)}
            </span>
          </div>
        </div>

        {/* Active Loans Card */}
        <div className="glass-card rounded-2xl p-5 relative overflow-hidden flex flex-col justify-between h-32 border border-slate-800/80 transition-all duration-300 hover:scale-[1.02] hover:-translate-y-0.5 hover:shadow-xl group">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-yellow-500/5 opacity-40 pointer-events-none" />
          <div className="absolute -right-6 -bottom-6 w-20 h-20 rounded-full bg-amber-500/10 blur-xl group-hover:bg-amber-500/20 transition-all duration-500 pointer-events-none" />

          <div className="flex justify-between items-start relative z-10">
            <span className="text-xs font-bold text-amber-300/80 uppercase tracking-wider">{t.activeLoans}</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 group-hover:scale-110 transition-transform duration-300">
              <Scale className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex flex-col text-[11px] text-slate-400 space-y-1 relative z-10">
            <div className="flex justify-between items-center bg-slate-950/20 px-2 py-0.5 rounded border border-slate-800/20">
              <span className="font-semibold text-slate-400">{lang === 'en' ? 'Lent:' : 'পাওনা:'}</span>
              <span className="font-extrabold text-emerald-400">{formatCurrency(activeLent)}</span>
            </div>
            <div className="flex justify-between items-center bg-slate-950/20 px-2 py-0.5 rounded border border-slate-800/20">
              <span className="font-semibold text-slate-400">{lang === 'en' ? 'Borrowed:' : 'দেনা:'}</span>
              <span className="font-extrabold text-rose-400">{formatCurrency(activeBorrowed)}</span>
            </div>
          </div>
        </div>

      </div>

      {/* Under-20% Savings Rate Alert Card */}
      {isAlertVisible && (
        <div className="flex gap-4 p-4 rounded-2xl border border-rose-500/30 bg-rose-500/5 backdrop-blur-md glow-rose animate-pulse">
          <div className="p-3 h-fit rounded-xl bg-rose-500/10 text-rose-400">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-rose-300">{t.savingsAlertTitle}</h4>
            <p className="text-xs text-rose-200/80 mt-1 leading-relaxed">{t.savingsAlertDesc}</p>
          </div>
        </div>
      )}
    </div>
  );
}
