import React from 'react';
import { CATEGORIES } from './ExpenseTracker';
import { toBengaliDigits } from './LedgerSelector';
import { BarChart3 } from 'lucide-react';

export default function Analytics({ expenses, currentMonth, lang, t }) {
  // Filter expenses for current month
  const monthlyExpenses = expenses.filter(
    item => item.date.substring(0, 7) === currentMonth
  );

  const totalMonthlySpend = monthlyExpenses.reduce((sum, item) => sum + item.amount, 0);

  // Group by category
  const categoryTotals = CATEGORIES.reduce((acc, cat) => {
    acc[cat.id] = 0;
    return acc;
  }, {});

  monthlyExpenses.forEach(item => {
    if (categoryTotals[item.category] !== undefined) {
      categoryTotals[item.category] += item.amount;
    } else {
      // Fallback in case of category mismatches
      categoryTotals['Miscellaneous'] = (categoryTotals['Miscellaneous'] || 0) + item.amount;
    }
  });

  // Convert to array of objects and calculate percentage
  const chartData = CATEGORIES.map(cat => {
    const total = categoryTotals[cat.id] || 0;
    const percentage = totalMonthlySpend > 0 ? (total / totalMonthlySpend) * 100 : 0;
    return {
      id: cat.id,
      tKey: cat.tKey,
      total,
      percentage,
      colorClass: cat.id === 'Food & Groceries' ? 'bg-emerald-500 shadow-emerald-500/20' :
                  cat.id === 'Commute' ? 'bg-sky-500 shadow-sky-500/20' :
                  cat.id === 'Utilities' ? 'bg-amber-500 shadow-amber-500/20' :
                  cat.id === 'Rent' ? 'bg-indigo-500 shadow-indigo-500/20' :
                  cat.id === 'Health' ? 'bg-rose-500 shadow-rose-500/20' :
                  cat.id === 'Entertainment' ? 'bg-purple-500 shadow-purple-500/20' :
                  'bg-slate-500 shadow-slate-500/20'
    };
  })
  .filter(item => item.total > 0) // Only show categories with spending
  .sort((a, b) => b.total - a.total); // Sort highest first

  const formatCurrency = (amt) => {
    const val = amt.toFixed(2);
    const bnVal = toBengaliDigits(val);
    return lang === 'bn' ? `${bnVal} ${t.currency}` : `${t.currency}${val}`;
  };

  const formatPercent = (pct) => {
    const formatted = pct.toFixed(1);
    return lang === 'bn' ? `${toBengaliDigits(formatted)}%` : `${formatted}%`;
  };

  return (
    <div className="glass-card rounded-2xl p-5 border border-slate-800/80 glow-indigo">
      <div className="flex items-center gap-2 text-indigo-400 mb-5">
        <BarChart3 className="w-5 h-5" />
        <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider">{t.analyticsTitle}</h3>
      </div>

      {totalMonthlySpend === 0 ? (
        <div className="py-8 text-center text-slate-400 text-xs">
          {t.noSpendsForChart}
        </div>
      ) : (
        <div className="space-y-4">
          {chartData.map(item => (
            <div key={item.id} className="space-y-2 group">
              {/* Category Info */}
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-slate-200 group-hover:text-indigo-400 transition-colors">
                  {t[item.tKey]}
                </span>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-100">{formatCurrency(item.total)}</span>
                  <span className="text-slate-400 text-[10px]">
                    ({formatPercent(item.percentage)})
                  </span>
                </div>
              </div>
              
              {/* Progress Bar Track */}
              <div className="h-2.5 w-full bg-slate-950/70 border border-slate-900 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-1000 ease-out shadow-lg ${item.colorClass}`}
                  style={{ width: `${item.percentage}%` }}
                ></div>
              </div>
            </div>
          ))}
          
          {/* Total aggregate footer */}
          <div className="border-t border-slate-800/50 pt-4 mt-5 flex justify-between items-center text-xs">
            <span className="font-semibold text-slate-400">
              {lang === 'en' ? 'Aggregated Spending' : 'একত্রিত খরচের পরিমাণ'}
            </span>
            <span className="font-extrabold text-indigo-400 text-sm">
              {formatCurrency(totalMonthlySpend)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
