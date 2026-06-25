import React, { useState } from 'react';
import { Wallet, Phone, Mail, Lock, User, Key, ArrowRight, ArrowLeft, RefreshCw, AlertCircle, CheckCircle } from 'lucide-react';

export default function AuthPage({ lang, onLoginSuccess }) {
  const [view, setView] = useState('login'); // 'login', 'register', 'forgot', 'reset'
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [recoveryCode, setRecoveryCode] = useState('');
  const [enteredCode, setEnteredCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  
  const [simulatedMailModal, setSimulatedMailModal] = useState(null); // stores { email, code }
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Localized Strings
  const t = {
    en: {
      login: "Login to Ledger",
      register: "Create Account",
      forgot: "Forgot Password?",
      reset: "Reset Password",
      name: "Full Name",
      mobile: "Mobile Number",
      email: "Email Address",
      password: "Password",
      confirmPassword: "Confirm Password",
      newPassword: "New Password",
      confirmNewPassword: "Confirm New Password",
      submitLogin: "Sign In",
      submitRegister: "Register",
      submitForgot: "Send Recovery Code",
      submitReset: "Update Password",
      backToLogin: "Back to Login",
      noAccount: "Don't have an account?",
      haveAccount: "Already have an account?",
      errEmpty: "Please fill in all fields.",
      errMatch: "Passwords do not match.",
      errMobile: "Please enter a valid 11-digit mobile number.",
      errEmail: "Please enter a valid email address.",
      errUserExists: "An account with this mobile number already exists.",
      errInvalidCred: "Invalid mobile number or password.",
      errInvalidEmail: "Email not found.",
      errInvalidCode: "Invalid recovery code.",
      successReg: "Account registered successfully! Please log in.",
      successForgot: "A recovery code has been simulated.",
      successReset: "Password updated successfully! Please log in with your new password.",
      simulationTitle: "Simulated Recovery Email Outbox",
      simulationBody: "Since this ledger runs locally on your browser, a real email was not sent. We simulated sending the recovery code to:",
      simulationCode: "Your Verification Code:",
      simulationEnter: "Please write down this code and enter it on the next screen.",
      enterCode: "Enter 6-Digit Code",
      verify: "Verify & Proceed"
    },
    bn: {
      login: "লেজারে লগইন করুন",
      register: "নতুন অ্যাকাউন্ট তৈরি",
      forgot: "পাসওয়ার্ড ভুলে গেছেন?",
      reset: "পাসওয়ার্ড রিসেট",
      name: "সম্পূর্ণ নাম",
      mobile: "মোবাইল নম্বর",
      email: "ইমেইল ঠিকানা",
      password: "পাসওয়ার্ড",
      confirmPassword: "পাসওয়ার্ড নিশ্চিত করুন",
      newPassword: "নতুন পাসওয়ার্ড",
      confirmNewPassword: "নতুন পাসওয়ার্ড নিশ্চিত করুন",
      submitLogin: "প্রবেশ করুন",
      submitRegister: "নিবন্ধন করুন",
      submitForgot: "রিকভারি কোড পাঠান",
      submitReset: "পাসওয়ার্ড পরিবর্তন করুন",
      backToLogin: "লগইন পেজে ফিরুন",
      noAccount: "অ্যাকাউন্ট নেই?",
      haveAccount: "ইতিমধ্যে অ্যাকাউন্ট আছে?",
      errEmpty: "অনুগ্রহ করে সব তথ্য প্রদান করুন।",
      errMatch: "পাসওয়ার্ড দুটি মেলেনি।",
      errMobile: "অনুগ্রহ করে একটি সঠিক ১১ ডিজিটের মোবাইল নম্বর লিখুন।",
      errEmail: "অনুগ্রহ করে একটি সঠিক ইমেইল ঠিকানা লিখুন।",
      errUserExists: "এই মোবাইল নম্বর দিয়ে ইতিমধ্যে একটি অ্যাকাউন্ট তৈরি করা হয়েছে।",
      errInvalidCred: "মোবাইল নম্বর অথবা পাসওয়ার্ড সঠিক নয়।",
      errInvalidEmail: "ইমেইল ঠিকানাটি খুঁজে পাওয়া যায়নি।",
      errInvalidCode: "ভেরিফিকেশন কোডটি সঠিক নয়।",
      successReg: "অ্যাকাউন্ট নিবন্ধন সফল হয়েছে! অনুগ্রহ করে লগইন করুন।",
      successForgot: "একটি রিকভারি কোড পাঠানো হয়েছে (সিমুলেশন)।",
      successReset: "পাসওয়ার্ড পরিবর্তন সফল হয়েছে! নতুন পাসওয়ার্ড দিয়ে লগইন করুন।",
      simulationTitle: "ইমেইল আউটবক্স (সিমুলেশন)",
      simulationBody: "যেহেতু এই হিসাবরক্ষক অ্যাপটি সম্পূর্ণ অফলাইনে চলে, কোনো বাস্তব ইমেইল পাঠানো হয়নি। নিচের ঠিকানায় ইমেইল পাঠানোর সিমুলেশন করা হয়েছে:",
      simulationCode: "ভেরিফিকেশন কোড:",
      simulationEnter: "অনুগ্রহ করে কোডটি লিখে পরবর্তী স্ক্রিনে প্রবেশ করান।",
      enterCode: "৬ ডিজিটের কোডটি লিখুন",
      verify: "কোড যাচাই করুন"
    }
  }[lang];

  const validateMobile = (num) => {
    return /^[0-9]{11}$/.test(num);
  };

  const validateEmail = (mail) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(mail);
  };

  const getUsers = () => {
    return JSON.parse(localStorage.getItem('expense_hub_users') || '[]');
  };

  const saveUsers = (usersList) => {
    localStorage.setItem('expense_hub_users', JSON.stringify(usersList));
  };

  const handleLogin = (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!mobile || !password) {
      setError(t.errEmpty);
      return;
    }

    const users = getUsers();
    const user = users.find(u => u.mobile === mobile && u.password === password);

    if (user) {
      onLoginSuccess(user);
    } else {
      setError(t.errInvalidCred);
    }
  };

  const handleRegister = (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!name || !mobile || !email || !password || !confirmPassword) {
      setError(t.errEmpty);
      return;
    }

    if (!validateMobile(mobile)) {
      setError(t.errMobile);
      return;
    }

    if (!validateEmail(email)) {
      setError(t.errEmail);
      return;
    }

    if (password !== confirmPassword) {
      setError(t.errMatch);
      return;
    }

    const users = getUsers();
    if (users.some(u => u.mobile === mobile)) {
      setError(t.errUserExists);
      return;
    }

    const newUser = { name, mobile, email, password };
    users.push(newUser);
    saveUsers(users);

    setSuccess(t.successReg);
    setView('login');
    // Clear registration fields
    setName('');
    setMobile('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
  };

  const handleForgot = (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!recoveryEmail) {
      setError(t.errEmpty);
      return;
    }

    if (!validateEmail(recoveryEmail)) {
      setError(t.errEmail);
      return;
    }

    const users = getUsers();
    const user = users.find(u => u.email.toLowerCase() === recoveryEmail.toLowerCase());

    if (!user) {
      setError(t.errInvalidEmail);
      return;
    }

    // Generate a random 6-digit recovery code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setRecoveryCode(code);
    
    // Open the simulated email outbox modal
    setSimulatedMailModal({ email: recoveryEmail, code });
  };

  const handleVerifyCode = (e) => {
    e.preventDefault();
    setError('');

    if (enteredCode === recoveryCode) {
      setView('reset');
      setError('');
    } else {
      setError(t.errInvalidCode);
    }
  };

  const handleResetPassword = (e) => {
    e.preventDefault();
    setError('');

    if (!newPassword || !confirmNewPassword) {
      setError(t.errEmpty);
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setError(t.errMatch);
      return;
    }

    const users = getUsers();
    const userIndex = users.findIndex(u => u.email.toLowerCase() === recoveryEmail.toLowerCase());

    if (userIndex !== -1) {
      users[userIndex].password = newPassword;
      saveUsers(users);
      
      setSuccess(t.successReset);
      setView('login');
      // Reset values
      setRecoveryEmail('');
      setRecoveryCode('');
      setEnteredCode('');
      setNewPassword('');
      setConfirmNewPassword('');
    } else {
      setError(t.errInvalidEmail);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-[#080c14] text-slate-100 select-none relative overflow-hidden">
      
      {/* Ambient background glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-600/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-purple-500/10 blur-[120px] pointer-events-none" />

      {/* Main Form Glass Card */}
      <div className="w-full max-w-md p-6 md:p-8 rounded-3xl border border-slate-800 bg-slate-900/60 backdrop-blur-xl shadow-2xl flex flex-col items-center z-10 animate-fadeIn">
        
        {/* Brand Header */}
        <div className="flex flex-col items-center mb-6">
          <div className="p-3.5 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 shadow-lg shadow-indigo-600/30 text-white">
            <Wallet className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-extrabold mt-3 bg-gradient-to-r from-indigo-200 to-slate-100 bg-clip-text text-transparent">
            WalletLedger Hub
          </h2>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">
            {t[view]}
          </p>
        </div>

        {/* Global Error Alert */}
        {error && (
          <div className="w-full flex items-center gap-2 p-3.5 mb-4 rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-300 text-xs font-semibold animate-shake">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Global Success Alert */}
        {success && (
          <div className="w-full flex items-center gap-2 p-3.5 mb-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-300 text-xs font-semibold animate-fadeIn">
            <CheckCircle className="w-4 h-4 shrink-0" />
            <span>{success}</span>
          </div>
        )}

        {/* --- VIEW: LOGIN --- */}
        {view === 'login' && (
          <form onSubmit={handleLogin} className="w-full space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase text-slate-400 tracking-wider flex items-center gap-1.5 pl-0.5">
                <Phone className="w-3.5 h-3.5 text-indigo-400" />
                {t.mobile}
              </label>
              <input
                type="text"
                maxLength={11}
                placeholder="e.g. 01712345678"
                value={mobile}
                onChange={(e) => setMobile(e.target.value.replace(/\D/g, ''))}
                className="w-full px-4 py-3 rounded-xl bg-slate-950/50 border border-slate-800 focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/30 text-xs sm:text-sm text-slate-200 outline-none transition-all"
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between items-center pr-0.5">
                <label className="text-[10px] font-bold uppercase text-slate-400 tracking-wider flex items-center gap-1.5 pl-0.5">
                  <Lock className="w-3.5 h-3.5 text-indigo-400" />
                  {t.password}
                </label>
                <button
                  type="button"
                  onClick={() => { setError(''); setSuccess(''); setView('forgot'); }}
                  className="text-[10px] font-extrabold text-indigo-400 hover:text-indigo-300 transition-colors border-0 bg-transparent cursor-pointer font-sans"
                >
                  {t.forgot}
                </button>
              </div>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-slate-950/50 border border-slate-800 focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/30 text-xs sm:text-sm text-slate-200 outline-none transition-all"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 mt-2 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white text-xs font-bold uppercase tracking-wider transition-all shadow-md shadow-indigo-600/20 active:scale-98 border-0 cursor-pointer flex items-center justify-center gap-2"
            >
              <span>{t.submitLogin}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <p className="text-[11px] text-center text-slate-400 pt-3">
              {t.noAccount}{' '}
              <button
                type="button"
                onClick={() => { setError(''); setSuccess(''); setView('register'); }}
                className="font-bold text-indigo-400 hover:text-indigo-300 transition-colors border-0 bg-transparent cursor-pointer"
              >
                {t.submitRegister}
              </button>
            </p>
          </form>
        )}

        {/* --- VIEW: REGISTER --- */}
        {view === 'register' && (
          <form onSubmit={handleRegister} className="w-full space-y-3.5">
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase text-slate-400 tracking-wider flex items-center gap-1.5 pl-0.5">
                <User className="w-3.5 h-3.5 text-indigo-400" />
                {t.name}
              </label>
              <input
                type="text"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950/50 border border-slate-800 focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/30 text-xs text-slate-200 outline-none transition-all"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase text-slate-400 tracking-wider flex items-center gap-1.5 pl-0.5">
                <Phone className="w-3.5 h-3.5 text-indigo-400" />
                {t.mobile}
              </label>
              <input
                type="text"
                maxLength={11}
                placeholder="11 digits e.g. 017XXXXXXXX"
                value={mobile}
                onChange={(e) => setMobile(e.target.value.replace(/\D/g, ''))}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950/50 border border-slate-800 focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/30 text-xs text-slate-200 outline-none transition-all"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase text-slate-400 tracking-wider flex items-center gap-1.5 pl-0.5">
                <Mail className="w-3.5 h-3.5 text-indigo-400" />
                {t.email}
              </label>
              <input
                type="email"
                placeholder="example@mail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950/50 border border-slate-800 focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/30 text-xs text-slate-200 outline-none transition-all"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-slate-400 tracking-wider flex items-center gap-1.5 pl-0.5">
                  <Lock className="w-3.5 h-3.5 text-indigo-400" />
                  {t.password}
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-950/50 border border-slate-800 focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/30 text-xs text-slate-200 outline-none transition-all"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-slate-400 tracking-wider flex items-center gap-1.5 pl-0.5 truncate">
                  <Lock className="w-3.5 h-3.5 text-indigo-400" />
                  {t.confirmPassword}
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-950/50 border border-slate-800 focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/30 text-xs text-slate-200 outline-none transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 mt-2 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white text-xs font-bold uppercase tracking-wider transition-all shadow-md shadow-indigo-600/20 active:scale-98 border-0 cursor-pointer text-center"
            >
              {t.submitRegister}
            </button>

            <p className="text-[11px] text-center text-slate-400 pt-2">
              {t.haveAccount}{' '}
              <button
                type="button"
                onClick={() => { setError(''); setView('login'); }}
                className="font-bold text-indigo-400 hover:text-indigo-300 transition-colors border-0 bg-transparent cursor-pointer"
              >
                {t.submitLogin}
              </button>
            </p>
          </form>
        )}

        {/* --- VIEW: FORGOT PASSWORD --- */}
        {view === 'forgot' && (
          <form onSubmit={handleForgot} className="w-full space-y-4">
            <p className="text-[10px] text-slate-400 leading-relaxed text-center font-semibold uppercase tracking-wider mb-2">
              {lang === 'en' ? 'Enter your registered email address to recover your account.' : 'অ্যাকাউন্ট রিকভার করতে আপনার নিবন্ধিত ইমেইল ঠিকানাটি লিখুন।'}
            </p>

            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase text-slate-400 tracking-wider flex items-center gap-1.5 pl-0.5">
                <Mail className="w-3.5 h-3.5 text-indigo-400" />
                {t.email}
              </label>
              <input
                type="email"
                placeholder="example@mail.com"
                value={recoveryEmail}
                onChange={(e) => setRecoveryEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-slate-950/50 border border-slate-800 focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/30 text-xs sm:text-sm text-slate-200 outline-none transition-all"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white text-xs font-bold uppercase tracking-wider transition-all shadow-md shadow-indigo-600/20 active:scale-98 border-0 cursor-pointer flex items-center justify-center gap-2"
            >
              <span>{t.submitForgot}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => { setError(''); setSuccess(''); setView('login'); }}
              className="w-full py-2.5 rounded-xl border border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800/30 text-[10px] font-bold uppercase transition-all cursor-pointer flex items-center justify-center gap-1.5 bg-transparent"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              {t.backToLogin}
            </button>
          </form>
        )}

        {/* --- VIEW: VERIFY RECOVERY CODE --- */}
        {view === 'verify' && (
          <form onSubmit={handleVerifyCode} className="w-full space-y-4">
            <p className="text-[10px] text-slate-400 leading-relaxed text-center font-semibold uppercase tracking-wider mb-2">
              {lang === 'en' ? 'Check the simulated email outbox below and write the code.' : 'নিচের সিমুলেটেড আউটবক্স থেকে কোডটি দেখে তা টাইপ করুন।'}
            </p>

            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase text-slate-400 tracking-wider flex items-center gap-1.5 pl-0.5">
                <Key className="w-3.5 h-3.5 text-indigo-400" />
                {t.enterCode}
              </label>
              <input
                type="text"
                maxLength={6}
                placeholder="e.g. 123456"
                value={enteredCode}
                onChange={(e) => setEnteredCode(e.target.value.replace(/\D/g, ''))}
                className="w-full px-4 py-3 text-center tracking-widest text-lg font-bold rounded-xl bg-slate-950/50 border border-slate-800 focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/30 text-slate-200 outline-none transition-all"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white text-xs font-bold uppercase tracking-wider transition-all shadow-md shadow-indigo-600/20 active:scale-98 border-0 cursor-pointer text-center font-sans"
            >
              {t.verify}
            </button>

            <button
              type="button"
              onClick={() => { setError(''); setSuccess(''); setView('login'); }}
              className="w-full py-2.5 rounded-xl border border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800/30 text-[10px] font-bold uppercase transition-all cursor-pointer flex items-center justify-center gap-1.5 bg-transparent"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              {t.backToLogin}
            </button>
          </form>
        )}

        {/* --- VIEW: RESET PASSWORD --- */}
        {view === 'reset' && (
          <form onSubmit={handleResetPassword} className="w-full space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase text-slate-400 tracking-wider flex items-center gap-1.5 pl-0.5">
                <Lock className="w-3.5 h-3.5 text-indigo-400" />
                {t.newPassword}
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-slate-950/50 border border-slate-800 focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/30 text-xs sm:text-sm text-slate-200 outline-none transition-all"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase text-slate-400 tracking-wider flex items-center gap-1.5 pl-0.5">
                <Lock className="w-3.5 h-3.5 text-indigo-400" />
                {t.confirmNewPassword}
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-slate-950/50 border border-slate-800 focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/30 text-xs sm:text-sm text-slate-200 outline-none transition-all"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white text-xs font-bold uppercase tracking-wider transition-all shadow-md shadow-indigo-600/20 active:scale-98 border-0 cursor-pointer text-center font-sans"
            >
              {t.submitReset}
            </button>
          </form>
        )}

      </div>

      {/* --- SIMULATED MAIL OUTBOX MODAL --- */}
      {simulatedMailModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md p-6 rounded-3xl border border-indigo-500/30 bg-slate-900/90 glow-indigo shadow-2xl space-y-4">
            
            <div className="flex items-center gap-2.5 pb-2 border-b border-slate-800">
              <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 shrink-0">
                <Mail className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-extrabold text-slate-100 tracking-tight uppercase">
                {t.simulationTitle}
              </h3>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed font-medium">
              {t.simulationBody}
            </p>

            <div className="p-4 rounded-2xl bg-slate-950/50 border border-slate-800 text-center">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest block mb-1">
                {lang === 'en' ? 'Recipient' : 'প্রাপক'}
              </span>
              <span className="text-xs text-indigo-400 font-extrabold select-all">
                {simulatedMailModal.email}
              </span>
              
              <div className="w-full h-px bg-slate-800 my-3" />

              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest block mb-1">
                {t.simulationCode}
              </span>
              <span className="text-2xl font-black tracking-widest bg-gradient-to-r from-indigo-200 to-slate-100 bg-clip-text text-transparent select-all">
                {simulatedMailModal.code}
              </span>
            </div>

            <p className="text-[10px] text-slate-500 text-center font-semibold leading-relaxed">
              {t.simulationEnter}
            </p>

            <button
              type="button"
              onClick={() => {
                setSimulatedMailModal(null);
                setView('verify');
                setSuccess(t.successForgot);
              }}
              className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold uppercase tracking-wider transition-all border-0 cursor-pointer text-center"
            >
              {lang === 'en' ? 'Close & Verify Code' : 'বন্ধ করুন এবং কোড যাচাই করুন'}
            </button>

          </div>
        </div>
      )}

    </div>
  );
}
