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
        <div className="glass-card rounded-2xl p-5 relative overflow-hidden flex flex-col justify-between h-32 border border-indigo-500/20 glow-indigo group">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-indigo-300 uppercase tracking-wider">{t.income}</span>
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 group-hover:scale-110 transition-transform">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          
          <div className="flex items-center gap-2 mt-2">
            {isEditing ? (
              <div className="flex items-center gap-1.5 w-full">
                <input
                  type="number"
                  value={tempIncome}
                  onChange={(e) => setTempIncome(e.target.value)}
                  className="w-full px-2 py-1 text-base font-bold border border-indigo-500 rounded focus:ring-1 focus:ring-indigo-500"
                  autoFocus
                  onKeyDown={(e) => { if (e.key === 'Enter') handleSave(); }}
                />
                <button 
                  onClick={handleSave}
                  className="p-1.5 rounded bg-indigo-500 text-white hover:bg-indigo-600 transition-colors"
                >
                  <Check className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between w-full">
                <span className="text-xl font-bold text-slate-100 tracking-tight">
                  {formatCurrency(income)}
                </span>
                <button 
                  onClick={() => setIsEditing(true)}
                  className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-indigo-400 hover:bg-slate-800/50 rounded transition-all"
                  title={t.setIncome}
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Expenses Card */}
        <div className="glass-card rounded-2xl p-5 relative overflow-hidden flex flex-col justify-between h-32 border border-rose-500/10 glow-rose group">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-rose-300 uppercase tracking-wider">{t.totalExpenses}</span>
            <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400 group-hover:scale-110 transition-transform">
              <TrendingDown className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-xl font-bold text-slate-100 tracking-tight">
              {formatCurrency(totalExpenses)}
            </span>
          </div>
        </div>

        {/* Net Savings Card */}
        <div className="glass-card rounded-2xl p-5 relative overflow-hidden flex flex-col justify-between h-32 border border-emerald-500/10 glow-emerald group">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-emerald-300 uppercase tracking-wider">{t.netSavings}</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 group-hover:scale-110 transition-transform">
              <PiggyBank className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2">
            <span className={`text-xl font-bold tracking-tight ${netSavings >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {formatCurrency(netSavings)}
            </span>
          </div>
        </div>

        {/* Savings Rate Card */}
        <div className="glass-card rounded-2xl p-5 relative overflow-hidden flex flex-col justify-between h-32 border border-sky-500/10 group">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-sky-300 uppercase tracking-wider">{t.savingsRate}</span>
            <div className="p-2 rounded-xl bg-sky-500/10 text-sky-400 group-hover:scale-110 transition-transform">
              <Percent className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2">
            <span className={`text-xl font-bold tracking-tight ${savingsRate >= 20 ? 'text-emerald-400' : 'text-amber-400'}`}>
              {formatPercent(savingsRate)}
            </span>
          </div>
        </div>

        {/* Active Loans Card */}
        <div className="glass-card rounded-2xl p-5 relative overflow-hidden flex flex-col justify-between h-32 border border-amber-500/10 group">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-amber-300 uppercase tracking-wider">{t.activeLoans}</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 group-hover:scale-110 transition-transform">
              <Scale className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2 flex flex-col text-[11px] text-slate-400 space-y-0.5">
            <div className="flex justify-between">
              <span>{lang === 'en' ? 'Lent:' : 'পাওনা:'}</span>
              <span className="font-semibold text-emerald-400">{formatCurrency(activeLent)}</span>
            </div>
            <div className="flex justify-between">
              <span>{lang === 'en' ? 'Borrowed:' : 'দেনা:'}</span>
              <span className="font-semibold text-rose-400">{formatCurrency(activeBorrowed)}</span>
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
