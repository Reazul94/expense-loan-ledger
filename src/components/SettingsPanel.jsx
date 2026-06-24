import React, { useState } from 'react';
import { 
  Download, 
  Trash2, 
  HelpCircle, 
  FileSpreadsheet, 
  FileJson,
  ShieldCheck,
  AlertOctagon,
  X,
  BookOpen
} from 'lucide-react';

export default function SettingsPanel({ expenses, loans, onResetAll, currentMonth, lang, t, onOpenStorageGuide }) {
  const [resetConfirm, setResetConfirm] = useState(false);
  const [resetTimeoutId, setResetTimeoutId] = useState(null);

  // Export current month's expenses as CSV
  const handleExportCSV = () => {
    const filtered = expenses.filter(item => item.date.substring(0, 7) === currentMonth);
    
    // Add UTF-8 BOM so Excel parses Bengali characters correctly
    let csvContent = "\uFEFF";
    csvContent += "Date,Category,Amount,Description\n";
    
    filtered.forEach(item => {
      const escapedDesc = (item.description || '').replace(/"/g, '""');
      const escapedCat = (item.category || '').replace(/"/g, '""');
      csvContent += `${item.date},"${escapedCat}",${item.amount},"${escapedDesc}"\n`;
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement("a");
    link.href = url;
    link.download = `expenses_${currentMonth}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Export everything (expenses + loans + incomes) as a JSON backup
  const handleExportJSON = () => {
    const incomes = JSON.parse(localStorage.getItem('expense_hub_incomes') || '{}');
    const backupData = {
      version: "1.0",
      exportDate: new Date().toISOString(),
      expenses,
      loans,
      incomes
    };

    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement("a");
    link.href = url;
    link.download = `expense_hub_database_backup.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Safe double-click reset
  const handleResetClick = () => {
    if (!resetConfirm) {
      setResetConfirm(true);
      // Automatically reset button state after 4 seconds if not clicked again
      const id = setTimeout(() => {
        setResetConfirm(false);
      }, 4000);
      setResetTimeoutId(id);
    } else {
      // Clear timeout and execute reset
      if (resetTimeoutId) clearTimeout(resetTimeoutId);
      onResetAll();
      setResetConfirm(false);
    }
  };

  return (
    <div className="glass-card rounded-2xl p-5 border border-slate-800/80 glow-indigo">
      {/* Title & Info icon with tooltip */}
      <div className="flex justify-between items-center mb-5">
        <div className="flex items-center gap-2 text-indigo-400">
          <ShieldCheck className="w-5 h-5" />
          <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider">{t.settingsTitle}</h3>
        </div>

        {/* Hovering settings information tooltip */}
        <div className="relative group cursor-help">
          <HelpCircle className="w-4.5 h-4.5 text-slate-400 hover:text-indigo-400 transition-colors" />
          
          <div className="absolute right-0 bottom-full mb-2 w-64 p-3.5 rounded-xl border border-slate-800 bg-slate-950/95 text-[11px] text-slate-300 backdrop-blur-md shadow-2xl opacity-0 scale-95 origin-bottom-right group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 pointer-events-none z-50 leading-relaxed">
            {t.storageTooltip}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Storage Guide */}
        <button
          type="button"
          onClick={onOpenStorageGuide}
          className="flex items-center justify-center gap-2.5 px-4 py-3 rounded-xl border border-indigo-500/20 bg-indigo-500/5 hover:bg-indigo-500/10 text-indigo-400 font-semibold text-xs transition-all active:scale-[0.98]"
        >
          <BookOpen className="w-4.5 h-4.5" />
          {t.storageGuide}
        </button>

        {/* CSV Export */}
        <button
          onClick={handleExportCSV}
          disabled={expenses.length === 0}
          className="flex items-center justify-center gap-2.5 px-4 py-3 rounded-xl border border-indigo-500/20 bg-indigo-500/5 hover:bg-indigo-500/10 text-indigo-400 font-semibold text-xs transition-all active:scale-[0.98] disabled:opacity-40 disabled:pointer-events-none"
        >
          <FileSpreadsheet className="w-4.5 h-4.5" />
          {t.exportCsv}
        </button>

        {/* JSON Export */}
        <button
          onClick={handleExportJSON}
          className="flex items-center justify-center gap-2.5 px-4 py-3 rounded-xl border border-sky-500/20 bg-sky-500/5 hover:bg-sky-500/10 text-sky-400 font-semibold text-xs transition-all active:scale-[0.98]"
        >
          <FileJson className="w-4.5 h-4.5" />
          {t.exportJson}
        </button>

        {/* Cache Reset (Double click confirmation) */}
        <button
          onClick={handleResetClick}
          className={`flex items-center justify-center gap-2.5 px-4 py-3 rounded-xl font-bold text-xs transition-all active:scale-[0.98] border ${
            resetConfirm 
              ? 'border-rose-500 bg-rose-500/15 text-rose-300 animate-pulse'
              : 'border-slate-800 bg-rose-500/5 hover:bg-rose-500/10 text-rose-400/90'
          }`}
        >
          {resetConfirm ? (
            <>
              <AlertOctagon className="w-4.5 h-4.5 text-rose-400 animate-bounce" />
              {lang === 'en' ? 'Click again to wipe database' : 'নিশ্চিত করতে আবার ক্লিক করুন'}
            </>
          ) : (
            <>
              <Trash2 className="w-4.5 h-4.5" />
              {t.resetDatabase}
            </>
          )}
        </button>
      </div>
    </div>
  );
}
