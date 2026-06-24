import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Trash2, 
  Edit3, 
  X, 
  Check, 
  User, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Calendar, 
  DollarSign, 
  CheckCircle2, 
  HelpCircle,
  Clock
} from 'lucide-react';
import { toBengaliDigits } from './LedgerSelector';

export default function LoanManager({ 
  loans, 
  onAddLoan, 
  onUpdateLoan, 
  onDeleteLoan, 
  currentMonth, 
  lang, 
  t 
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);

  // Form states
  const [friendName, setFriendName] = useState('');
  const [type, setType] = useState('Lent'); // Lent or Borrowed
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState('');
  const [repaymentDate, setRepaymentDate] = useState('');
  const [status, setStatus] = useState('Pending'); // Pending or Settled

  // View settings
  const [showPendingOnly, setShowPendingOnly] = useState(true);
  const [showAllMonths, setShowAllMonths] = useState(true);

  // Set default date when currentMonth changes or form opens
  useEffect(() => {
    if (currentMonth) {
      const today = new Date();
      const monthStr = String(today.getMonth() + 1).padStart(2, '0');
      const currentYearMonth = `${today.getFullYear()}-${monthStr}`;
      
      if (currentMonth === currentYearMonth) {
        setDate(today.toISOString().split('T')[0]);
      } else {
        setDate(`${currentMonth}-01`);
      }
    }
  }, [currentMonth, isOpen]);

  const handleStartEdit = (item) => {
    setEditItem(item);
    setFriendName(item.friendName);
    setType(item.type);
    setAmount(item.amount.toString());
    setDate(item.date);
    setRepaymentDate(item.repaymentDate || '');
    setStatus(item.status);
    setIsOpen(true);
  };

  const handleCloseForm = () => {
    setIsOpen(false);
    setEditItem(null);
    setFriendName('');
    setType('Lent');
    setAmount('');
    setRepaymentDate('');
    setStatus('Pending');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    if (!friendName.trim() || !type || isNaN(parsedAmount) || parsedAmount <= 0 || !date) return;

    const payload = {
      friendName: friendName.trim(),
      type,
      amount: parsedAmount,
      date,
      repaymentDate: repaymentDate || null,
      status
    };

    if (editItem) {
      onUpdateLoan(editItem.id, payload);
    } else {
      onAddLoan(payload);
    }
    handleCloseForm();
  };

  const handleToggleStatus = (item) => {
    const nextStatus = item.status === 'Pending' ? 'Settled' : 'Pending';
    onUpdateLoan(item.id, { ...item, status: nextStatus });
  };

  // Filter loans based on month and pending filters
  const filteredLoans = loans.filter(item => {
    // Month filter
    if (!showAllMonths) {
      const itemMonth = item.date.substring(0, 7);
      if (itemMonth !== currentMonth) return false;
    }
    // Status filter
    if (showPendingOnly && item.status !== 'Pending') {
      return false;
    }
    return true;
  });

  // Calculate summaries (based on global pending loans)
  const pendingLoans = loans.filter(item => item.status === 'Pending');
  const totalLent = pendingLoans
    .filter(item => item.type === 'Lent')
    .reduce((sum, item) => sum + item.amount, 0);

  const totalBorrowed = pendingLoans
    .filter(item => item.type === 'Borrowed')
    .reduce((sum, item) => sum + item.amount, 0);

  const netBalance = totalLent - totalBorrowed;

  // Currency Formatter
  const formatCurrency = (amt) => {
    const val = amt.toFixed(2);
    const bnVal = toBengaliDigits(val);
    const sym = t.currency;
    return lang === 'bn' ? `${bnVal} ${sym}` : `${sym}${val}`;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    const d = new Date(dateStr);
    if (lang === 'bn') {
      return `${toBengaliDigits(d.getDate().toString())}/${toBengaliDigits((d.getMonth()+1).toString())}/${toBengaliDigits(d.getFullYear().toString())}`;
    }
    return dateStr;
  };

  return (
    <div className="space-y-6">
      
      {/* Title & Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse"></span>
            {t.loanManagerTitle}
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            {lang === 'en' ? "Manage money lent to or borrowed from roommates/friends." : "রুমমেট ও বন্ধুদের সাথে দেনা-পাওনা ট্র‍্যাক করুন।"}
          </p>
        </div>

        <button 
          onClick={() => { if (isOpen) handleCloseForm(); else setIsOpen(true); }}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-slate-100 font-semibold text-sm active:scale-[0.98] transition-all shadow-lg shadow-amber-600/10"
        >
          {isOpen ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {isOpen ? t.cancel : t.addLoan}
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-card rounded-xl p-4 flex items-center gap-3 border border-emerald-500/10 glow-emerald">
          <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-400">
            <ArrowUpRight className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-emerald-300 uppercase tracking-wide">{t.totalOwedToYou}</p>
            <p className="text-base font-bold text-slate-100">{formatCurrency(totalLent)}</p>
          </div>
        </div>

        <div className="glass-card rounded-xl p-4 flex items-center gap-3 border border-rose-500/10 glow-rose">
          <div className="p-2.5 rounded-lg bg-rose-500/10 text-rose-400">
            <ArrowDownLeft className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-rose-300 uppercase tracking-wide">{t.totalYouOwe}</p>
            <p className="text-base font-bold text-slate-100">{formatCurrency(totalBorrowed)}</p>
          </div>
        </div>

        <div className={`glass-card rounded-xl p-4 flex items-center gap-3 border ${netBalance >= 0 ? 'border-emerald-500/10 glow-emerald' : 'border-rose-500/10 glow-rose'}`}>
          <div className={`p-2.5 rounded-lg ${netBalance >= 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-300 uppercase tracking-wide">{t.netBalance}</p>
            <p className={`text-base font-bold ${netBalance >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {formatCurrency(netBalance)}
            </p>
          </div>
        </div>
      </div>

      {/* Expandable Add/Edit Form */}
      {isOpen && (
        <form onSubmit={handleSubmit} className="glass-card rounded-2xl p-5 border border-amber-500/25 glow-indigo space-y-4 animate-fadeIn">
          <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
            {editItem ? t.editLoan : t.addLoan}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Friend Name */}
            <div className="space-y-1.5">
              <label className="text-xs text-slate-400 font-semibold flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-amber-400" />
                {t.friendName}
              </label>
              <input
                type="text"
                required
                placeholder={lang === 'en' ? 'e.g. Asif Ahmed' : 'যেমন: আসিফ আহমেদ'}
                value={friendName}
                onChange={(e) => setFriendName(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg"
              />
            </div>

            {/* Type */}
            <div className="space-y-1.5">
              <label className="text-xs text-slate-400 font-semibold flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                {t.loanType}
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg"
              >
                <option value="Lent" className="bg-[var(--bg-color)] text-[var(--text-color)]">{t.lentType}</option>
                <option value="Borrowed" className="bg-[var(--bg-color)] text-[var(--text-color)]">{t.borrowedType}</option>
              </select>
            </div>

            {/* Amount */}
            <div className="space-y-1.5">
              <label className="text-xs text-slate-400 font-semibold flex items-center gap-1">
                <DollarSign className="w-3.5 h-3.5 text-amber-400" />
                {t.amount}
              </label>
              <input
                type="number"
                step="0.01"
                required
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg"
              />
            </div>

            {/* Date */}
            <div className="space-y-1.5">
              <label className="text-xs text-slate-400 font-semibold flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-amber-400" />
                {t.date}
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg"
              />
            </div>

            {/* Expected Repayment */}
            <div className="space-y-1.5">
              <label className="text-xs text-slate-400 font-semibold flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-amber-400" />
                {t.expectedRepayment}
              </label>
              <input
                type="date"
                value={repaymentDate}
                onChange={(e) => setRepaymentDate(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg"
              />
            </div>

            {/* Status */}
            <div className="space-y-1.5">
              <label className="text-xs text-slate-400 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
                {t.status}
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg"
              >
                <option value="Pending" className="bg-[var(--bg-color)] text-[var(--text-color)]">{t.pending}</option>
                <option value="Settled" className="bg-[var(--bg-color)] text-[var(--text-color)]">{t.settled}</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={handleCloseForm}
              className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 rounded-lg transition-colors"
            >
              {t.cancel}
            </button>
            <button
              type="submit"
              className="flex items-center gap-1 px-4 py-2 text-xs font-bold bg-amber-600 hover:bg-amber-500 text-white rounded-lg transition-colors"
            >
              <Check className="w-3.5 h-3.5" />
              {t.save}
            </button>
          </div>
        </form>
      )}

      {/* View Options & Filters */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-3.5 bg-slate-900/35 rounded-xl border border-slate-800/80">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-300">{lang === 'en' ? 'Filters:' : 'ফিল্টারসমূহ:'}</span>
        </div>

        <div className="flex flex-wrap items-center gap-5 text-xs">
          {/* Status Filter */}
          <label className="flex items-center gap-2 text-slate-300 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={showPendingOnly}
              onChange={(e) => setShowPendingOnly(e.target.checked)}
              className="w-4 h-4 rounded text-amber-500 border-slate-700 bg-slate-950/60 focus:ring-0 focus:ring-offset-0 cursor-pointer"
            />
            {lang === 'en' ? 'Show Pending Loans Only' : 'শুধুমাত্র পেন্ডিং ঋণ দেখান'}
          </label>

          {/* Month Filter */}
          <label className="flex items-center gap-2 text-slate-300 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={showAllMonths}
              onChange={(e) => setShowAllMonths(e.target.checked)}
              className="w-4 h-4 rounded text-amber-500 border-slate-700 bg-slate-950/60 focus:ring-0 focus:ring-offset-0 cursor-pointer"
            />
            {lang === 'en' ? 'Show All Months Data' : 'সব মাসের ঋণ একসঙ্গে দেখান'}
          </label>
        </div>
      </div>

      {/* Loans Table */}
      <div className="glass-card rounded-xl border border-slate-800/80 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-900/60 border-b border-slate-800 text-slate-300 font-bold uppercase tracking-wider">
                <th className="px-4 py-3">{t.friendName}</th>
                <th className="px-4 py-3">{t.loanType}</th>
                <th className="px-4 py-3">{t.amount}</th>
                <th className="px-4 py-3">{t.date}</th>
                <th className="px-4 py-3">{t.expectedRepayment}</th>
                <th className="px-4 py-3 text-center">{t.status}</th>
                <th className="px-4 py-3 text-right">{t.actions}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {filteredLoans.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-8 text-slate-400">
                    {t.noLoans}
                  </td>
                </tr>
              ) : (
                filteredLoans.map(item => (
                  <tr key={item.id} className="hover:bg-slate-900/30 transition-colors group">
                    {/* Name */}
                    <td className="px-4 py-3.5 font-semibold text-slate-100">
                      {item.friendName}
                    </td>
                    
                    {/* Type Badge */}
                    <td className="px-4 py-3.5">
                      <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] uppercase border ${
                        item.type === 'Lent' 
                          ? 'border-emerald-500/20 text-emerald-400 bg-emerald-500/10' 
                          : 'border-rose-500/20 text-rose-400 bg-rose-500/10'
                      }`}>
                        {item.type === 'Lent' ? (lang === 'en' ? 'Lent' : 'পাওনা') : (lang === 'en' ? 'Borrowed' : 'দেনা')}
                      </span>
                    </td>

                    {/* Amount */}
                    <td className="px-4 py-3.5 font-bold text-slate-100">
                      {formatCurrency(item.amount)}
                    </td>

                    {/* Date */}
                    <td className="px-4 py-3.5 text-slate-400">
                      {formatDate(item.date)}
                    </td>

                    {/* Repayment Date */}
                    <td className="px-4 py-3.5 text-slate-400">
                      {formatDate(item.repaymentDate)}
                    </td>

                    {/* Quick status toggle */}
                    <td className="px-4 py-3.5 text-center">
                      <button
                        onClick={() => handleToggleStatus(item)}
                        className={`mx-auto flex items-center justify-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-extrabold uppercase transition-all ${
                          item.status === 'Settled'
                            ? 'border-emerald-500/35 text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20'
                            : item.type === 'Borrowed'
                              ? 'border-rose-500/35 text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 shadow-md shadow-rose-500/5'
                              : 'border-amber-500/35 text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 shadow-md shadow-amber-500/5'
                        }`}
                      >
                        {item.status === 'Settled' ? (
                          <>
                            <CheckCircle2 className="w-3 h-3" />
                            {t.settled}
                          </>
                        ) : item.type === 'Borrowed' ? (
                          <>
                            <ArrowDownLeft className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
                            {t.payLoanAction}
                          </>
                        ) : (
                          <>
                            <ArrowUpRight className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                            {t.settleLoanAction}
                          </>
                        )}
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3.5 text-right">
                      <div className="flex gap-2 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleStartEdit(item)}
                          className="p-1 rounded text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/10 transition-colors"
                          title={t.editLoan}
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onDeleteLoan(item.id)}
                          className="p-1 rounded text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                          title={t.delete}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
