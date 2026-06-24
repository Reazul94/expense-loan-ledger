import React, { useState, useEffect } from 'react';
import { translations } from './utils/translations';
import MarqueeBanner from './components/MarqueeBanner';
import LedgerSelector from './components/LedgerSelector';
import DashboardOverview from './components/DashboardOverview';
import ExpenseTracker from './components/ExpenseTracker';
import LoanManager from './components/LoanManager';
import Analytics from './components/Analytics';
import SettingsPanel from './components/SettingsPanel';
import { 
  Wallet, 
  ArrowLeftRight, 
  CreditCard, 
  Settings, 
  Sparkles,
  Info,
  Sun,
  Moon,
  Palette,
  Check
} from 'lucide-react';

export default function App() {
  // 1. Core States
  const [lang, setLang] = useState(() => localStorage.getItem('expense_hub_lang') || 'en');
  const [theme, setTheme] = useState(() => localStorage.getItem('expense_hub_theme') || 'dark');
  
  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    return `${now.getFullYear()}-${month}`;
  });

  const [expenses, setExpenses] = useState(() => {
    const raw = localStorage.getItem('expense_hub_expenses');
    return raw ? JSON.parse(raw) : [];
  });

  const [loans, setLoans] = useState(() => {
    const raw = localStorage.getItem('expense_hub_loans');
    return raw ? JSON.parse(raw) : [];
  });

  const [incomes, setIncomes] = useState(() => {
    const raw = localStorage.getItem('expense_hub_incomes');
    return raw ? JSON.parse(raw) : {};
  });

  const [activeTab, setActiveTab] = useState('expenses'); // 'expenses' or 'loans'
  const [toasts, setToasts] = useState([]);

  // Get active translation dictionary
  const t = translations[lang] || translations.en;

  // 2. Persistent Synchronization
  useEffect(() => {
    localStorage.setItem('expense_hub_lang', lang);
  }, [lang]);

  useEffect(() => {
    localStorage.setItem('expense_hub_theme', theme);
    const themeClasses = ['theme-light', 'theme-dark', 'theme-mint', 'theme-solarized', 'theme-dracula', 'theme-onedark', 'theme-nord'];
    document.body.classList.remove(...themeClasses);
    document.body.classList.add(`theme-${theme}`);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('expense_hub_expenses', JSON.stringify(expenses));
  }, [expenses]);

  useEffect(() => {
    localStorage.setItem('expense_hub_loans', JSON.stringify(loans));
  }, [loans]);

  useEffect(() => {
    localStorage.setItem('expense_hub_incomes', JSON.stringify(incomes));
  }, [incomes]);

  // 3. Toast Helper
  const showToast = (message) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(toast => toast.id !== id));
    }, 3000);
  };

  // 4. Calculations
  const currentIncome = incomes[currentMonth] || 0;
  
  const totalExpenses = expenses
    .filter(item => item.date.substring(0, 7) === currentMonth)
    .reduce((sum, item) => sum + item.amount, 0);

  const pendingLoans = loans.filter(item => item.status === 'Pending');
  const activeLent = pendingLoans
    .filter(item => item.type === 'Lent')
    .reduce((sum, item) => sum + item.amount, 0);

  const activeBorrowed = pendingLoans
    .filter(item => item.type === 'Borrowed')
    .reduce((sum, item) => sum + item.amount, 0);

  // 5. Handlers
  const handleSaveIncome = (amount) => {
    setIncomes(prev => ({
      ...prev,
      [currentMonth]: amount
    }));
    showToast(lang === 'en' ? 'Income updated successfully!' : 'মাসিক আয় সফলভাবে আপডেট হয়েছে!');
  };

  // Expense Handlers
  const handleAddExpense = (payload) => {
    const newItem = {
      ...payload,
      id: 'exp_' + Math.random().toString(36).substr(2, 9)
    };
    setExpenses(prev => [...prev, newItem]);
    showToast(t.toastSuccessAdd);
  };

  const handleUpdateExpense = (id, payload) => {
    setExpenses(prev => prev.map(item => item.id === id ? { ...item, ...payload } : item));
    showToast(t.toastSuccessEdit);
  };

  const handleDeleteExpense = (id) => {
    setExpenses(prev => prev.filter(item => item.id !== id));
    showToast(t.toastSuccessDelete);
  };

  // Loan Handlers
  const handleAddLoan = (payload) => {
    const newItem = {
      ...payload,
      id: 'loan_' + Math.random().toString(36).substr(2, 9)
    };
    setLoans(prev => [...prev, newItem]);
    showToast(t.toastSuccessAdd);
  };

  const handleUpdateLoan = (id, payload) => {
    setLoans(prev => prev.map(item => item.id === id ? { ...item, ...payload } : item));
    showToast(t.toastSuccessEdit);
  };

  const handleDeleteLoan = (id) => {
    setLoans(prev => prev.filter(item => item.id !== id));
    showToast(t.toastSuccessDelete);
  };

  // Database Reset
  const handleResetAll = () => {
    setExpenses([]);
    setLoans([]);
    setIncomes({});
    localStorage.removeItem('expense_hub_expenses');
    localStorage.removeItem('expense_hub_loans');
    localStorage.removeItem('expense_hub_incomes');
    showToast(t.toastReset);
  };

  return (
    <div className="min-h-screen flex flex-col antialiased selection:bg-indigo-500/30 selection:text-indigo-200">
      
      {/* Top Notice Marquee Banner */}
      <MarqueeBanner lang={lang} />

      {/* Main Premium Navbar */}
      <header className="w-full border-b backdrop-blur-md sticky top-0 z-40 panel-container">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          
          {/* Logo / Title */}
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 shadow-md shadow-indigo-600/20 text-white">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-sm font-extrabold tracking-tight bg-gradient-to-r from-indigo-200 via-slate-100 to-purple-200 bg-clip-text text-transparent">
                {t.title}
              </h1>
              <p className="text-[10px] text-slate-400 font-medium">
                {t.subtitle}
              </p>
            </div>
          </div>

          {/* Controls: Theme & Language Switchers */}
          <div className="flex items-center gap-3">
            {/* Theme Selector */}
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg panel-container">
              <Palette className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
              <select
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
                className="bg-transparent border-0 text-[10px] font-extrabold uppercase focus:ring-0 focus:outline-none cursor-pointer py-0.5"
                style={{ color: 'var(--text-color)' }}
              >
                <option value="light" className="bg-[var(--bg-color)] text-[var(--text-color)]">{lang === 'en' ? 'Light Theme' : 'লাইট থিম'}</option>
                <option value="dark" className="bg-[var(--bg-color)] text-[var(--text-color)]">{lang === 'en' ? 'Dark Theme' : 'ডার্ক থিম'}</option>
                <option value="mint" className="bg-[var(--bg-color)] text-[var(--text-color)]">{lang === 'en' ? 'Mint Theme' : 'মিন্ট থিম'}</option>
                <option value="solarized" className="bg-[var(--bg-color)] text-[var(--text-color)]">Solarized</option>
                <option value="dracula" className="bg-[var(--bg-color)] text-[var(--text-color)]">Dracula</option>
                <option value="onedark" className="bg-[var(--bg-color)] text-[var(--text-color)]">One Dark</option>
                <option value="nord" className="bg-[var(--bg-color)] text-[var(--text-color)]">Nord Theme</option>
              </select>
            </div>

            {/* Bilingual Language Switcher */}
            <div className="flex items-center p-0.5 rounded-lg panel-container">
              <button
                type="button"
                onClick={() => setLang('en')}
                className={`px-3 py-1 rounded text-[10px] font-extrabold uppercase transition-all duration-300 ${
                  lang === 'en'
                    ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-md shadow-indigo-600/10'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                EN
              </button>
              <button
                type="button"
                onClick={() => setLang('bn')}
                className={`px-3 py-1 rounded text-[10px] font-extrabold uppercase transition-all duration-300 ${
                  lang === 'bn'
                    ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-md shadow-indigo-600/10'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                বাংলা
              </button>
            </div>
          </div>

        </div>
      </header>

      {/* Main Body */}
      <main className="max-w-7xl mx-auto px-4 py-8 flex-1 w-full space-y-8">
        
        {/* Dropdown Selector */}
        <LedgerSelector 
          currentMonth={currentMonth} 
          setCurrentMonth={setCurrentMonth} 
          lang={lang} 
          t={t} 
        />

        {/* Dashboard Cards Row */}
        <DashboardOverview
          income={currentIncome}
          onSaveIncome={handleSaveIncome}
          totalExpenses={totalExpenses}
          activeBorrowed={activeBorrowed}
          activeLent={activeLent}
          lang={lang}
          t={t}
        />

        {/* Tab Selection */}
        <div className="flex border-b border-slate-800/80 gap-6">
          <button
            onClick={() => setActiveTab('expenses')}
            className={`pb-3 text-xs font-bold uppercase tracking-wider transition-all relative ${
              activeTab === 'expenses' 
                ? 'text-indigo-400 font-extrabold' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {lang === 'en' ? 'Daily Spends & Analytics' : 'দৈনিক খরচ ও বিশ্লেষণ'}
            {activeTab === 'expenses' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500 rounded-full animate-fadeIn"></span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('loans')}
            className={`pb-3 text-xs font-bold uppercase tracking-wider transition-all relative ${
              activeTab === 'loans' 
                ? 'text-amber-400 font-extrabold' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {lang === 'en' ? 'Debt & Loan Ledger' : 'দেনা-পাওনা লেজার'}
            {activeTab === 'loans' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-500 rounded-full animate-fadeIn"></span>
            )}
          </button>
        </div>

        {/* Tab Panels */}
        <div className="space-y-8 animate-fadeIn">
          {activeTab === 'expenses' ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Daily spends column */}
              <div className="lg:col-span-2 space-y-6">
                <ExpenseTracker
                  expenses={expenses}
                  onAddExpense={handleAddExpense}
                  onUpdateExpense={handleUpdateExpense}
                  onDeleteExpense={handleDeleteExpense}
                  currentMonth={currentMonth}
                  lang={lang}
                  t={t}
                />
              </div>

              {/* Analytics column */}
              <div className="space-y-6">
                <Analytics
                  expenses={expenses}
                  currentMonth={currentMonth}
                  lang={lang}
                  t={t}
                />
                
                {/* Visual storage indicator */}
                <div className="glass-card rounded-2xl p-4 border border-slate-800/80 flex gap-3 text-xs text-slate-400 items-start">
                  <Info className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                  <p className="leading-relaxed">
                    {lang === 'en' 
                      ? 'Local Storage Mode: All calculations are processed locally. Removing browser cookies deletes records.'
                      : 'লোকাল স্টোরেজ মোড: সকল হিসাব আপনার ব্রাউজারে প্রক্রিয়াজাত হচ্ছে। ব্রাউজার ক্যাশ মুছলে সমস্ত তথ্য ডিলিট হবে।'}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="w-full">
              <LoanManager
                loans={loans}
                onAddLoan={handleAddLoan}
                onUpdateLoan={handleUpdateLoan}
                onDeleteLoan={handleDeleteLoan}
                currentMonth={currentMonth}
                lang={lang}
                t={t}
              />
            </div>
          )}
        </div>

        {/* Bottom Utility Card (Export/Import/Reset) */}
        <SettingsPanel
          expenses={expenses}
          loans={loans}
          onResetAll={handleResetAll}
          currentMonth={currentMonth}
          lang={lang}
          t={t}
        />

      </main>

      {/* Premium footer */}
      <footer className="w-full bg-slate-950 border-t border-slate-900 py-6 text-center text-[10px] text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-indigo-500" />
            © {new Date().getFullYear()} WalletLedger Hub.
          </p>
          <p>
            {lang === 'en' 
              ? 'Engineered with React, Tailwind CSS and LocalStorage'
              : 'সফলভাবে তৈরি করা হয়েছে React, Tailwind CSS এবং LocalStorage ব্যবহার করে'}
          </p>
        </div>
      </footer>

      {/* Floating Toast notifications container */}
      <div className="fixed bottom-5 right-5 flex flex-col gap-2.5 z-50 pointer-events-none">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className="flex items-center gap-2 px-4 py-3 rounded-xl border border-indigo-500/30 bg-slate-900/90 text-slate-100 text-xs font-semibold shadow-2xl backdrop-blur-md glow-indigo animate-slideIn pointer-events-auto"
          >
            <Check className="w-4 h-4 text-emerald-400" />
            <span>{toast.message}</span>
          </div>
        ))}
      </div>

    </div>
  );
}
