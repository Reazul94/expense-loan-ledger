import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Trash2, 
  Edit3, 
  X, 
  Check, 
  Calendar, 
  DollarSign, 
  Tag, 
  FileText,
  Eye
} from 'lucide-react';
import { toBengaliDigits } from './LedgerSelector';

const CATEGORIES = [
  { id: 'Food & Groceries', tKey: 'catFood', color: 'border-emerald-500 text-emerald-400 bg-emerald-500/10' },
  { id: 'Commute', tKey: 'catCommute', color: 'border-sky-500 text-sky-400 bg-sky-500/10' },
  { id: 'Utilities', tKey: 'catUtilities', color: 'border-amber-500 text-amber-400 bg-amber-500/10' },
  { id: 'Rent', tKey: 'catRent', color: 'border-indigo-500 text-indigo-400 bg-indigo-500/10' },
  { id: 'Health', tKey: 'catHealth', color: 'border-rose-500 text-rose-400 bg-rose-500/10' },
  { id: 'Entertainment', tKey: 'catEntertainment', color: 'border-purple-500 text-purple-400 bg-purple-500/10' },
  { id: 'Miscellaneous', tKey: 'catMisc', color: 'border-slate-500 text-slate-400 bg-slate-500/10' }
];

export default function ExpenseTracker({ 
  expenses, 
  onAddExpense, 
  onUpdateExpense, 
  onDeleteExpense, 
  currentMonth, 
  lang, 
  t 
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [selectedNote, setSelectedNote] = useState(null);
  
  // Form fields
  const [date, setDate] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0].id);
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');

  // Search & Filter
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('ALL');

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

  // Handle editing populate
  const handleStartEdit = (item) => {
    setEditItem(item);
    setDate(item.date);
    setCategory(item.category);
    setAmount(item.amount.toString());
    setDescription(item.description);
    setIsOpen(true);
  };

  const handleCloseForm = () => {
    setIsOpen(false);
    setEditItem(null);
    setAmount('');
    setDescription('');
    setCategory(CATEGORIES[0].id);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    if (!date || !category || isNaN(parsedAmount) || parsedAmount <= 0) return;

    const payload = {
      date,
      category,
      amount: parsedAmount,
      description: description.trim() || t[CATEGORIES.find(c => c.id === category).tKey]
    };

    if (editItem) {
      onUpdateExpense(editItem.id, payload);
    } else {
      onAddExpense(payload);
    }
    handleCloseForm();
  };

  // Filter expenses matching current month, search string, and category filter
  const filteredExpenses = expenses.filter(item => {
    const itemMonth = item.date.substring(0, 7);
    if (itemMonth !== currentMonth) return false;

    if (filterCat !== 'ALL' && item.category !== filterCat) return false;

    if (search.trim() !== '') {
      const s = search.toLowerCase();
      const noteMatch = item.description.toLowerCase().includes(s);
      const catMatch = t[CATEGORIES.find(c => c.id === item.category)?.tKey]?.toLowerCase().includes(s);
      if (!noteMatch && !catMatch) return false;
    }

    return true;
  });

  // Group by date
  const groupedExpenses = filteredExpenses.reduce((groups, item) => {
    const d = item.date;
    if (!groups[d]) {
      groups[d] = [];
    }
    groups[d].push(item);
    return groups;
  }, {});

  // Sort dates descending
  const sortedDates = Object.keys(groupedExpenses).sort((a, b) => new Date(b) - new Date(a));

  const formatCurrency = (amt) => {
    const val = amt.toFixed(2);
    const bnVal = toBengaliDigits(val);
    return lang === 'bn' ? `${bnVal} ${t.currency}` : `${t.currency}${val}`;
  };

  const getCategoryTag = (catId) => {
    const cat = CATEGORIES.find(c => c.id === catId);
    if (!cat) return null;
    return (
      <span className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase border ${cat.color}`}>
        <span className="w-1.5 h-1.5 rounded-full bg-current" />
        {t[cat.tKey]}
      </span>
    );
  };

  const formatDateLabel = (dateStr) => {
    const d = new Date(dateStr);
    if (lang === 'bn') {
      const day = toBengaliDigits(d.getDate().toString());
      const monthNames = [
        "জানুয়ারি", "ফেব্রুয়ারি", "মার্চ", "এপ্রিল", "মে", "জুন",
        "জুলাই", "আগস্ট", "সেপ্টেম্বর", "অক্টোবর", "নভেম্বর", "ডিসেম্বর"
      ];
      const month = monthNames[d.getMonth()];
      const year = toBengaliDigits(d.getFullYear().toString());
      return `${day} ${month}, ${year}`;
    } else {
      const options = { day: 'numeric', month: 'long', year: 'numeric' };
      return d.toLocaleDateString('en-US', options);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header bar with controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-pulse"></span>
            {t.expenseTrackerTitle}
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            {lang === 'en' ? `Showing grouped records for ${currentMonth}` : `${toBengaliDigits(currentMonth)} এর খরচের তালিকা`}
          </p>
        </div>

        <button 
          onClick={() => { if (isOpen) handleCloseForm(); else setIsOpen(true); }}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 text-slate-100 font-semibold text-sm hover:bg-indigo-500 active:scale-[0.98] transition-all shadow-lg shadow-indigo-600/10"
        >
          {isOpen ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {isOpen ? t.cancel : t.addExpense}
        </button>
      </div>

      {/* Expandable Form Card */}
      {isOpen && (
        <form onSubmit={handleSubmit} className="glass-card rounded-2xl p-5 border border-indigo-500/25 glow-indigo space-y-4 animate-fadeIn">
          <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
            {editItem ? t.editExpense : t.addExpense}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Date Field */}
            <div className="space-y-1.5">
              <label className="text-xs text-slate-400 font-semibold flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-indigo-400" />
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

            {/* Category Field */}
            <div className="space-y-1.5">
              <label className="text-xs text-slate-400 font-semibold flex items-center gap-1">
                <Tag className="w-3.5 h-3.5 text-indigo-400" />
                {t.category}
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg"
              >
                {CATEGORIES.map(cat => (
                  <option key={cat.id} value={cat.id} className="bg-[var(--bg-color)] text-[var(--text-color)]">
                    {t[cat.tKey]}
                  </option>
                ))}
              </select>
            </div>

            {/* Amount Field */}
            <div className="space-y-1.5">
              <label className="text-xs text-slate-400 font-semibold flex items-center gap-1">
                <DollarSign className="w-3.5 h-3.5 text-indigo-400" />
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

            {/* Description Field */}
            <div className="space-y-1.5">
              <label className="text-xs text-slate-400 font-semibold flex items-center gap-1">
                <FileText className="w-3.5 h-3.5 text-indigo-400" />
                {t.description}
              </label>
              <input
                type="text"
                placeholder={lang === 'en' ? 'e.g. Eggs and milk' : 'যেমন: চাল-ডাল কেনা'}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg"
              />
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
              className="flex items-center gap-1 px-4 py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors"
            >
              <Check className="w-3.5 h-3.5" />
              {t.save}
            </button>
          </div>
        </form>
      )}

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder={t.searchPlaceholder}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl text-sm focus:border-indigo-500/50"
          />
        </div>

        {/* Category Filter */}
        <div className="relative">
          <Filter className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
          <select
            value={filterCat}
            onChange={(e) => setFilterCat(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl text-sm focus:border-indigo-500/50"
          >
            <option value="ALL" className="bg-[var(--bg-color)] text-[var(--text-color)]">{t.filterCategory}</option>
            {CATEGORIES.map(cat => (
              <option key={cat.id} value={cat.id} className="bg-[var(--bg-color)] text-[var(--text-color)]">
                {t[cat.tKey]}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Gallery View (Grouped by date) */}
      <div className="space-y-6">
        {sortedDates.length === 0 ? (
          <div className="glass-card rounded-2xl p-8 border border-slate-800/60 text-center text-slate-400 text-xs">
            {t.noExpenses}
          </div>
        ) : (
          sortedDates.map(dateStr => (
            <div key={dateStr} className="space-y-2.5">
              {/* Date Header */}
              <h4 className="text-xs font-bold text-indigo-300 uppercase tracking-wide px-1 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-indigo-400/80" />
                {formatDateLabel(dateStr)}
              </h4>
              
              {/* Gallery Items Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {groupedExpenses[dateStr].map(item => (
                  <div 
                    key={item.id} 
                    className="glass-card-hover rounded-xl p-4 flex flex-col justify-between border border-slate-800/80 text-xs gap-3.5 group relative"
                  >
                    <div className="flex justify-between items-start gap-2">
                      <div className="relative group/tooltip flex-1 min-w-0">
                        <span className="font-bold text-slate-200 line-clamp-2 cursor-help hover:text-indigo-400 transition-colors block">
                          {item.description}
                        </span>
                        {/* Hover Popup Note Tooltip */}
                        <div className="absolute left-0 bottom-full mb-2.5 hidden group-hover/tooltip:block w-64 p-3 rounded-xl text-[10px] backdrop-blur-md shadow-2xl z-50 pointer-events-none break-words whitespace-normal leading-relaxed panel-container border border-slate-800/40">
                          {item.description}
                        </div>
                      </div>
                      <span className="font-extrabold text-slate-100 shrink-0 text-sm tracking-tight bg-slate-950/20 px-2 py-0.5 rounded border border-slate-800/10">
                        {formatCurrency(item.amount)}
                      </span>
                    </div>

                    <div className="flex justify-between items-center mt-1 border-t border-slate-800/40 pt-2.5">
                      {getCategoryTag(item.category)}
                      
                      {/* CRUD Buttons */}
                      <div className="flex gap-1">
                        <button
                          type="button"
                          onClick={() => setSelectedNote(item.description)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/10 transition-all duration-200 border-0 bg-transparent cursor-pointer"
                          title={lang === 'en' ? 'View Full Note' : 'সম্পূর্ণ বিবরণ দেখুন'}
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleStartEdit(item)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/10 transition-all duration-200 border-0 bg-transparent cursor-pointer"
                          title={t.editExpense}
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onDeleteExpense(item.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-all duration-200 border-0 bg-transparent cursor-pointer"
                          title={t.delete}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Note Detail Modal Overlay */}
      {selectedNote && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="rounded-2xl p-6 max-w-md w-full shadow-2xl relative space-y-4 max-h-[80vh] flex flex-col panel-container">
            <div className="flex justify-between items-center border-b border-slate-800/30 pb-3">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-200">
                {lang === 'en' ? 'Expense Note Details' : 'খরচের নোট বিবরণ'}
              </h3>
              <button 
                type="button"
                onClick={() => setSelectedNote(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/10 transition-all border-0 bg-transparent cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="overflow-y-auto pr-1 flex-1 text-slate-300 text-xs leading-relaxed max-h-[50vh] break-words whitespace-pre-wrap bg-slate-950/30 p-4 rounded-xl border border-slate-800/40">
              {selectedNote}
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-800/20">
              <button
                type="button"
                onClick={() => setSelectedNote(null)}
                className="px-4 py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors border-0 cursor-pointer"
              >
                {lang === 'en' ? 'Close' : 'বন্ধ করুন'}
              </button>
            </div>
          </div>
        </div>
      )}
      
    </div>
  );
}
export { CATEGORIES };
