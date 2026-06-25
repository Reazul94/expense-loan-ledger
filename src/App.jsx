import React, { useState, useEffect } from 'react';
import { translations } from './utils/translations';
import MarqueeBanner from './components/MarqueeBanner';
import LedgerSelector from './components/LedgerSelector';
import DashboardOverview from './components/DashboardOverview';
import ExpenseTracker from './components/ExpenseTracker';
import LoanManager from './components/LoanManager';
import Analytics from './components/Analytics';
import SettingsPanel from './components/SettingsPanel';
import DailyVerseCard from './components/DailyVerseCard';
import DailyHadithCard from './components/DailyHadithCard';
import DailyDuaCard from './components/DailyDuaCard';
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
  Check,
  ShieldCheck,
  FileText,
  BookOpen,
  X,
  Download,
  Monitor,
  Smartphone,
  Laptop,
  ArrowUp,
  ArrowDown
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
  const [activeModal, setActiveModal] = useState(null); // 'terms' | 'privacy' | 'storage' | 'install' | null
  const [deferredPrompt, setDeferredPrompt] = useState(null);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);


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

  const handleImportAll = (importedData) => {
    if (importedData.expenses) setExpenses(importedData.expenses);
    if (importedData.loans) setLoans(importedData.loans);
    if (importedData.incomes) setIncomes(importedData.incomes);
    showToast(t.toastSuccessImport);
  };

  return (
    <div className="min-h-screen flex flex-col antialiased selection:bg-indigo-500/30 selection:text-indigo-200">
      
      {/* Top Notice Marquee Banner */}
      <MarqueeBanner lang={lang} />

      {/* Main Premium Navbar */}
      <header className="w-full border-b backdrop-blur-md relative md:sticky md:top-0 z-40 panel-container">
        <div className="max-w-7xl mx-auto px-4 py-3 md:h-16 flex flex-col md:flex-row items-center justify-between gap-3 md:gap-0">
          
          {/* Logo / Title */}
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 shadow-md shadow-indigo-600/20 text-white">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xs sm:text-sm font-extrabold tracking-tight bg-gradient-to-r from-indigo-200 via-slate-100 to-purple-200 bg-clip-text text-transparent">
                {t.title}
              </h1>
              <p className="text-[10px] text-slate-400 font-medium">
                {t.subtitle}
              </p>
            </div>
          </div>

          {/* Controls: Theme & Language Switchers */}
          <div className="flex items-center gap-3">
            {/* Install / Shortcut Button */}
            <button
              type="button"
              onClick={() => setActiveModal('install')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg panel-container text-[10px] font-extrabold uppercase text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/5 transition-all cursor-pointer border-0"
              title={lang === 'en' ? 'Install App / Add Shortcut' : 'অ্যাপ ইনস্টল / শর্টকাট যোগ'}
            >
              <Download className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
              <span className="hidden sm:inline">{lang === 'en' ? 'Add Shortcut' : 'শর্টকাট যোগ'}</span>
            </button>
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

        {/* Daily Reflections Section (Quran, Hadith & Dua) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <DailyVerseCard lang={lang} t={t} />
          <DailyHadithCard lang={lang} t={t} />
          <DailyDuaCard lang={lang} t={t} />
        </div>

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
          onImportAll={handleImportAll}
          showToast={showToast}
          currentMonth={currentMonth}
          lang={lang}
          t={t}
          onOpenStorageGuide={() => setActiveModal('storage')}
        />

      </main>

      {/* Premium footer */}
      <footer className="w-full bg-slate-950 border-t border-slate-900 py-6 text-[10px] text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-6 text-center sm:text-left">
            <p className="flex items-center gap-1 text-slate-400 font-medium justify-center sm:justify-start">
              <Sparkles className="w-3 h-3 text-indigo-500" />
              © {new Date().getFullYear()} RKarim. {t.copyright}
            </p>
            <div className="flex items-center gap-3 justify-center">
              <button 
                type="button" 
                onClick={() => setActiveModal('terms')} 
                className="hover:text-indigo-400 transition-colors underline cursor-pointer bg-transparent border-0 p-0 text-[10px] text-slate-500 font-semibold"
              >
                {t.terms}
              </button>
              <span className="text-slate-800">|</span>
              <button 
                type="button" 
                onClick={() => setActiveModal('privacy')} 
                className="hover:text-indigo-400 transition-colors underline cursor-pointer bg-transparent border-0 p-0 text-[10px] text-slate-500 font-semibold"
              >
                {t.privacy}
              </button>
              <span className="text-slate-800">|</span>
              <button 
                type="button" 
                onClick={() => setActiveModal('storage')} 
                className="hover:text-indigo-400 transition-colors underline cursor-pointer bg-transparent border-0 p-0 text-[10px] text-slate-500 font-semibold flex items-center gap-1"
              >
                {t.storageGuide}
              </button>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3 text-slate-600 font-medium text-center sm:text-right">
            <span>
              {t.tagline}
            </span>
            <span className="hidden sm:inline text-slate-800">|</span>
            <a 
              href="https://wa.me/8801303045825" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-emerald-500 hover:text-emerald-400 font-semibold flex items-center gap-1 transition-colors"
            >
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.504-5.714-1.465L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.625 1.451 5.403.002 9.803-4.386 9.805-9.789.002-2.618-1.01-5.079-2.859-6.93-1.849-1.85-4.311-2.863-6.93-2.865-5.409 0-9.81 4.387-9.814 9.791-.002 1.838.491 3.633 1.428 5.176l-.993 3.626 3.738-.979zM17.476 14.39c-.329-.165-1.944-.96-2.244-1.07-.3-.11-.518-.165-.738.165-.219.33-.852 1.07-1.042 1.29-.19.22-.38.247-.709.083-.329-.164-1.389-.512-2.647-1.633-.978-.872-1.637-1.95-1.83-2.28-.19-.33-.02-.508.145-.671.147-.147.328-.384.492-.577.164-.193.22-.33.329-.55.11-.22.055-.412-.028-.577-.082-.165-.738-1.78-.1-2.42-.3-.724-.59-.724-.81-.724-.21-.01-.45-.01-.69-.01-.24 0-.63.09-.96.45-.33.36-1.26 1.23-1.26 3.01 0 1.78 1.3 3.5 1.48 3.73.18.23 2.55 3.9 6.19 5.47.86.37 1.54.59 2.06.76.87.28 1.66.24 2.28.15.7-.1 2.244-.917 2.56-1.8.312-.883.312-1.64.218-1.8-.09-.16-.328-.247-.656-.41z" />
              </svg>
              <span>{t.whatsappHelp}</span>
            </a>
          </div>
        </div>
      </footer>

      {/* Modal Overlays for Legal & Guide */}
      {activeModal && (
        <div 
          className="fixed inset-0 bg-slate-950/65 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn"
          onClick={() => setActiveModal(null)}
        >
          <div 
            className="rounded-2xl p-6 max-w-lg w-full shadow-2xl relative space-y-4 max-h-[85vh] flex flex-col panel-container border border-slate-800/80 animate-scaleUp text-left"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex justify-between items-center border-b border-slate-800/40 pb-3">
              <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2 uppercase tracking-wider">
                {activeModal === 'terms' && (
                  <>
                    <FileText className="w-4.5 h-4.5 text-indigo-400" />
                    {t.termsTitle}
                  </>
                )}
                {activeModal === 'privacy' && (
                  <>
                    <ShieldCheck className="w-4.5 h-4.5 text-emerald-400" />
                    {t.privacyTitle}
                  </>
                )}
                {activeModal === 'storage' && (
                  <>
                    <BookOpen className="w-4.5 h-4.5 text-sky-400" />
                    {t.storageGuideTitle}
                  </>
                )}
                {activeModal === 'install' && (
                  <>
                    <Laptop className="w-4.5 h-4.5 text-indigo-400" />
                    {lang === 'en' ? 'Install App / Add Shortcut' : 'অ্যাপ ইনস্টল / শর্টকাট যোগ'}
                  </>
                )}
              </h3>
              <button 
                type="button"
                onClick={() => setActiveModal(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/10 transition-all cursor-pointer bg-transparent border-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            {/* Content */}
            <div className="overflow-y-auto pr-1 flex-1 text-slate-300 text-xs space-y-4 max-h-[55vh]">
              {activeModal === 'storage' && (
                <>
                  <p className="font-medium text-slate-200 leading-relaxed">
                    {t.storageGuideDesc}
                  </p>
                  <ul className="list-decimal list-inside space-y-3.5 pl-1.5 mb-4">
                    {(t.storageGuideSteps || []).map((step, idx) => (
                      <li key={idx} className="leading-relaxed break-words whitespace-normal">
                        <span className="text-slate-300">{step}</span>
                      </li>
                    ))}
                  </ul>
                  
                  {/* Visual Guide Infographic */}
                  <div className="mt-4 border border-slate-800/80 rounded-xl overflow-hidden bg-slate-950/40 p-1.5 flex flex-col items-center gap-1.5">
                    <img 
                      src={`${import.meta.env.BASE_URL || '/'}data_transfer_guide.png`} 
                      alt="Data Import & Export Transfer Guide" 
                      className="rounded-lg max-w-full h-auto w-full object-cover max-h-56 shadow-md border border-slate-900/60"
                    />
                    <span className="text-[10px] text-slate-500 font-semibold text-center mt-1">
                      {lang === 'en' 
                        ? 'Visual Flow: Export database to file → Upload on new device'
                        : 'ভিজুয়াল ডায়াগ্রাম: ডাটাবেজ ফাইল এক্সপোর্ট করুন → নতুন ডিভাইসে আপলোড করুন'}
                    </span>
                  </div>
                </>
              )}

              {activeModal === 'terms' && (
                <ul className="list-disc list-inside space-y-3.5 pl-1.5">
                  {(t.termsList || []).map((step, idx) => (
                    <li key={idx} className="leading-relaxed break-words whitespace-normal">
                      <span className="text-slate-300">{step}</span>
                    </li>
                  ))}
                </ul>
              )}

              {activeModal === 'privacy' && (
                <ul className="list-disc list-inside space-y-3.5 pl-1.5">
                  {(t.privacyList || []).map((step, idx) => (
                    <li key={idx} className="leading-relaxed break-words whitespace-normal">
                      <span className="text-slate-300">{step}</span>
                    </li>
                  ))}
                </ul>
              )}

              {activeModal === 'install' && (
                <div className="space-y-5 text-slate-300">
                  <p className="font-semibold text-slate-200">
                    {lang === 'en'
                      ? 'Add WalletLedger Hub to your desktop or mobile home screen to access it instantly like a native app.'
                      : 'সহজে ব্যবহার করতে WalletLedger Hub-কে আপনার ডেক্সটপ বা মোবাইলের হোম স্ক্রিনে শর্টকাট হিসেবে যুক্ত করুন।'}
                  </p>

                  {/* Option 1: PWA Install (Supported by Chrome/Edge/Android) */}
                  {deferredPrompt ? (
                    <div className="p-4 rounded-xl bg-indigo-500/5 border border-indigo-500/10 flex flex-col gap-3">
                      <h4 className="text-xs font-extrabold text-indigo-400 flex items-center gap-1.5 uppercase">
                        <Download className="w-4 h-4" />
                        {lang === 'en' ? 'Direct Installation' : 'সরাসরি ইনস্টলেশন'}
                      </h4>
                      <p className="text-[11px] leading-relaxed text-slate-400">
                        {lang === 'en'
                          ? 'Your browser supports direct installation. Click below to install it instantly.'
                          : 'আপনার ব্রাউজারে সরাসরি ইনস্টল করার সুবিধা রয়েছে। নিচের বাটনে ক্লিক করে ইনস্টল করুন।'}
                      </p>
                      <button
                        type="button"
                        onClick={async () => {
                          deferredPrompt.prompt();
                          const { outcome } = await deferredPrompt.userChoice;
                          console.log(`User response to install prompt: ${outcome}`);
                          setDeferredPrompt(null);
                          setActiveModal(null);
                        }}
                        className="px-4 py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors cursor-pointer border-0 w-full sm:w-auto self-start"
                      >
                        {lang === 'en' ? 'Install Application' : 'অ্যাপ্লিকেশন ইনস্টল করুন'}
                      </button>
                    </div>
                  ) : null}

                  {/* Option 2: Windows / Mac Desktop Shortcut Download */}
                  <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/80 flex flex-col gap-3">
                    <h4 className="text-xs font-extrabold text-indigo-400 flex items-center gap-1.5 uppercase">
                      <Monitor className="w-4 h-4" />
                      {lang === 'en' ? 'Windows & Mac Desktop Shortcut' : 'উইন্ডোজ ও ম্যাক ডেক্সটপ শর্টকাট'}
                    </h4>
                    <p className="text-[11px] leading-relaxed text-slate-400">
                      {lang === 'en'
                        ? 'Download a shortcut file. Double-clicking it will instantly open the ledger in your web browser.'
                        : 'ডেক্সটপ শর্টকাট ফাইল ডাউনলোড করুন। এটি ডাবল-ক্লিক করলেই সরাসরি আপনার লেজার ওপেন হবে।'}
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        const urlContent = `[InternetShortcut]\r\nURL=https://Reazul94.github.io/expense-loan-ledger/\r\n`;
                        const blob = new Blob([urlContent], { type: 'text/plain' });
                        const url = URL.createObjectURL(blob);
                        const link = document.createElement('a');
                        link.href = url;
                        link.download = 'WalletLedger_Hub.url';
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                        URL.revokeObjectURL(url);
                        setActiveModal(null);
                      }}
                      className="px-4 py-2 text-xs font-bold bg-indigo-900/60 hover:bg-indigo-900 text-slate-200 border border-indigo-500/20 rounded-lg transition-colors cursor-pointer w-full sm:w-auto self-start flex items-center gap-1.5"
                    >
                      <Download className="w-3.5 h-3.5" />
                      {lang === 'en' ? 'Download Desktop Shortcut' : 'ডেক্সটপ শর্টকাট ডাউনলোড'}
                    </button>
                  </div>

                  {/* Option 3: Mobile Home Screen Steps */}
                  <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/80 flex flex-col gap-3">
                    <h4 className="text-xs font-extrabold text-indigo-400 flex items-center gap-1.5 uppercase">
                      <Smartphone className="w-4 h-4" />
                      {lang === 'en' ? 'Mobile Home Screen Guide' : 'মোবাইল হোম স্ক্রিন গাইড'}
                    </h4>
                    
                    <div className="space-y-3.5 text-[11px] text-slate-400">
                      <div>
                        <span className="font-extrabold text-slate-200">Android (Chrome/Firefox):</span>
                        <p className="leading-relaxed">
                          {lang === 'en'
                            ? 'Tap the three dots (menu) in top-right and select "Install App" or "Add to Home screen".'
                            : 'ডানদিকের থ্রি-ডটস মেনু চেপে "Install App" বা "Add to Home screen" নির্বাচন করুন।'}
                        </p>
                      </div>
                      <div className="border-t border-slate-800/30 pt-2.5">
                        <span className="font-extrabold text-slate-200">iOS iPhone/iPad (Safari):</span>
                        <p className="leading-relaxed">
                          {lang === 'en'
                            ? 'Tap the "Share" button at the bottom of Safari, scroll down, and select "Add to Home Screen".'
                            : 'সাফারির নিচে থাকা "Share" বাটনটি আলতো চাপুন এবং নিচে স্ক্রল করে "Add to Home Screen" নির্বাচন করুন।'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer button */}
            <div className="flex justify-end pt-3 border-t border-slate-800/40">
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="px-4 py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors cursor-pointer border-0"
              >
                {t.close}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Floating scroll to top/bottom arrows */}
      <div className="fixed bottom-24 right-5 flex flex-col gap-2 z-40">
        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="p-3 rounded-full panel-container border border-slate-800/80 text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/10 hover:border-indigo-500/30 transition-all cursor-pointer shadow-xl glow-indigo border-0"
          title={lang === 'en' ? 'Scroll to Top' : 'উপরে যান'}
        >
          <ArrowUp className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'smooth' })}
          className="p-3 rounded-full panel-container border border-slate-800/80 text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/10 hover:border-indigo-500/30 transition-all cursor-pointer shadow-xl glow-indigo border-0"
          title={lang === 'en' ? 'Scroll to Bottom' : 'নিচে যান'}
        >
          <ArrowDown className="w-4 h-4" />
        </button>
      </div>

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
