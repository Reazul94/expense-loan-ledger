import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Search, 
  X, 
  BookOpen, 
  Globe, 
  Compass, 
  Book, 
  Info,
  ChevronLeft,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { surahList } from '../utils/quranData';
import { toBengaliDigits } from './LedgerSelector';

export default function QuranReader({ lang, t, onClose }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSurah, setSelectedSurah] = useState(null);
  const [verses, setVerses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Scroll to top when view changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [selectedSurah]);

  // Fetch surah verses (Arabic & Bengali translation)
  const fetchSurah = async (surahNumber) => {
    setLoading(true);
    setError(null);
    setVerses([]);

    try {
      const url = `https://api.alquran.cloud/v1/surah/${surahNumber}/editions/quran-simple,bn.bengali`;
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch Surah data.');
      }
      const json = await response.json();
      
      if (json.code === 200 && json.data && json.data.length === 2) {
        const arabicAyahs = json.data[0].ayahs;
        const bengaliAyahs = json.data[1].ayahs;

        // Combine Arabic and Bengali verses
        const combined = arabicAyahs.map((ayah, index) => ({
          numberInSurah: ayah.numberInSurah,
          arabic: ayah.text,
          bengali: bengaliAyahs[index].text
        }));

        setVerses(combined);
      } else {
        throw new Error('Unexpected API response structure.');
      }
    } catch (err) {
      console.error(err);
      setError(
        lang === 'en' 
          ? 'Could not connect to the Quran service. Please check your internet connection and try again.' 
          : 'কুরআন সার্ভিসের সাথে সংযোগ করা সম্ভব হয়নি। অনুগ্রহ করে ইন্টারনেট সংযোগ চেক করে আবার চেষ্টা করুন।'
      );
    } finally {
      setLoading(false);
    }
  };

  // Trigger fetch when a Surah is clicked
  const handleSelectSurah = (surah) => {
    setSelectedSurah(surah);
    fetchSurah(surah.number);
  };

  const handleGoBackToList = () => {
    setSelectedSurah(null);
    setVerses([]);
    setError(null);
  };

  // Filter surahs based on search query
  const filteredSurahs = surahList.filter(s => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;

    // Search matches Surah Number, English name, Arabic name, or Meaning
    return (
      s.number.toString() === q ||
      s.englishName.toLowerCase().includes(q) ||
      s.englishNameTranslation.toLowerCase().includes(q) ||
      s.name.includes(q)
    );
  });

  const getBnbDigits = (num) => {
    return lang === 'bn' ? toBengaliDigits(num.toString()) : num.toString();
  };

  return (
    <div className="min-h-screen flex flex-col antialiased bg-[var(--bg-color)] text-[var(--text-color)] selection:bg-indigo-500/30 selection:text-indigo-200">
      
      {/* Top Banner Header */}
      <header className="w-full border-b backdrop-blur-md relative md:sticky md:top-0 z-40 panel-container">
        <div className="max-w-7xl mx-auto px-4 py-3 md:h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={selectedSurah ? handleGoBackToList : onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/10 transition-all border-0 bg-transparent cursor-pointer flex items-center justify-center"
              title={lang === 'en' ? 'Back' : 'পেছনে যান'}
            >
              <ChevronLeft className="w-5 h-5 shrink-0" />
            </button>
            
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 shadow-md shadow-indigo-600/20 text-white">
                <BookOpen className="w-4 h-4" />
              </div>
              <div>
                <h1 className="text-xs sm:text-sm font-extrabold tracking-tight bg-gradient-to-r from-indigo-200 via-slate-100 to-purple-200 bg-clip-text text-transparent">
                  {lang === 'en' ? 'Holy Quran Explorer' : 'পবিত্র আল-কুরআন এক্সপ্লোরার'}
                </h1>
                <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">
                  {selectedSurah 
                    ? `${selectedSurah.englishName} (${selectedSurah.name})` 
                    : (lang === 'en' ? 'Read Complete Quran' : 'সম্পূর্ণ কুরআন পড়ুন')}
                </p>
              </div>
            </div>
          </div>

          {selectedSurah && (
            <button
              type="button"
              onClick={() => fetchSurah(selectedSurah.number)}
              disabled={loading}
              className="p-2 rounded-xl text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/10 transition-all border-0 bg-transparent cursor-pointer disabled:opacity-50 flex items-center justify-center"
              title={lang === 'en' ? 'Refresh Surah' : 'রিফ্রেশ করুন'}
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          )}
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-4xl mx-auto px-4 py-8 flex-1 w-full space-y-6">

        {/* --- VIEW 1: SURAH LIST VIEW --- */}
        {!selectedSurah && (
          <div className="space-y-6">
            
            {/* Search Input Bar */}
            <div className="relative">
              <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
              <input
                type="text"
                placeholder={lang === 'en' ? 'Search Surah by name, translation, or number (e.g. Al-Fatiha, 1)...' : 'নাম, অর্থ বা নাম্বার দিয়ে সূরা খুঁজুন (যেমন: ফাতিহা, ১)...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-10 py-3 rounded-2xl text-xs sm:text-sm focus:border-indigo-500/50 bg-slate-900/40 border border-slate-800"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-3.5 p-0.5 rounded-full text-slate-500 hover:text-slate-300 hover:bg-slate-800 transition-colors border-0 bg-transparent cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Surah Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {filteredSurahs.map((surah) => (
                <div
                  key={surah.number}
                  onClick={() => handleSelectSurah(surah)}
                  className="glass-card-hover rounded-2xl p-4 flex items-center justify-between border border-slate-800/80 cursor-pointer group"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    {/* Surah Number Avatar */}
                    <div className="w-9 h-9 rounded-xl bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 font-extrabold flex items-center justify-center text-xs shrink-0 shadow-sm">
                      {getBnbDigits(surah.number)}
                    </div>
                    
                    <div className="min-w-0">
                      <h4 className="font-bold text-slate-200 text-xs sm:text-sm group-hover:text-indigo-400 transition-colors truncate">
                        {surah.englishName}
                      </h4>
                      <p className="text-[10px] text-slate-500 font-semibold truncate mt-0.5">
                        {surah.englishNameTranslation}
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="font-serif text-slate-100 text-sm sm:text-base block">
                      {surah.name}
                    </span>
                    <span className="inline-block mt-1 text-[9px] font-black uppercase tracking-wider text-indigo-400 bg-indigo-600/10 border border-indigo-500/20 px-2 py-0.5 rounded-full">
                      {lang === 'bn' ? surah.revelationTypeBn : surah.revelationType} • {getBnbDigits(surah.numberOfAyahs)} {lang === 'en' ? 'Ayahs' : 'আয়াত'}
                    </span>
                  </div>
                </div>
              ))}

              {filteredSurahs.length === 0 && (
                <div className="col-span-1 sm:col-span-2 glass-card rounded-2xl p-8 border border-slate-800/60 text-center text-slate-500 text-xs font-semibold">
                  {lang === 'en' ? 'No Surahs match your search criteria.' : 'খুঁজে পাওয়া যায়নি। সূরাটির নাম বা নাম্বার ঠিকমতো লিখুন।'}
                </div>
              )}
            </div>
          </div>
        )}

        {/* --- VIEW 2: SURAH DETAIL VIEW --- */}
        {selectedSurah && (
          <div className="space-y-6">
            
            {/* Surah Banner Details */}
            <div className="relative rounded-3xl border border-slate-800/80 bg-slate-900/35 overflow-hidden p-6 text-center shadow-lg">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 opacity-40 pointer-events-none" />
              
              <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400">
                {lang === 'en' ? 'Surah' : 'সূরা'} {getBnbDigits(selectedSurah.number)}
              </span>
              
              <h2 className="text-2xl font-black text-slate-100 tracking-tight mt-1">
                {selectedSurah.englishName}
              </h2>
              
              <p className="text-xs text-slate-400 mt-1 italic font-medium">
                "{selectedSurah.englishNameTranslation}"
              </p>

              <div className="flex justify-center items-center gap-2 mt-4">
                <span className="text-[10px] font-extrabold uppercase tracking-wider bg-slate-950/40 border border-slate-800 px-3 py-1 rounded-full text-slate-300">
                  {lang === 'bn' ? selectedSurah.revelationTypeBn : selectedSurah.revelationType}
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-slate-700" />
                <span className="text-[10px] font-extrabold uppercase tracking-wider bg-slate-950/40 border border-slate-800 px-3 py-1 rounded-full text-slate-300">
                  {getBnbDigits(selectedSurah.numberOfAyahs)} {lang === 'en' ? 'Ayahs' : 'আয়াত'}
                </span>
              </div>
            </div>

            {/* Loading Spinner */}
            {loading && (
              <div className="flex flex-col items-center justify-center py-24 gap-4">
                <div className="w-12 h-12 rounded-full border-4 border-indigo-500/20 border-t-indigo-500 animate-spin" />
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                  {lang === 'en' ? 'Loading Verses...' : 'আয়াতগুলো লোড হচ্ছে...'}
                </p>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="flex gap-4 p-5 rounded-2xl border border-rose-500/30 bg-rose-500/5 backdrop-blur-md glow-rose">
                <div className="p-3 h-fit rounded-xl bg-rose-500/10 text-rose-400 shrink-0">
                  <AlertCircle className="w-6 h-6" />
                </div>
                <div className="space-y-3 flex-1 min-w-0">
                  <h4 className="text-xs sm:text-sm font-bold text-rose-300">{lang === 'en' ? 'Connection Error' : 'সংযোগ ত্রুটি'}</h4>
                  <p className="text-[11px] leading-relaxed text-rose-200/80 break-words">{error}</p>
                  <button
                    type="button"
                    onClick={() => fetchSurah(selectedSurah.number)}
                    className="px-4 py-2 text-[10px] font-bold bg-rose-600 hover:bg-rose-500 text-white rounded-lg transition-colors border-0 cursor-pointer self-start flex items-center gap-1.5"
                  >
                    <RefreshCw className="w-3 h-3" />
                    {lang === 'en' ? 'Retry Loading' : 'আবার চেষ্টা করুন'}
                  </button>
                </div>
              </div>
            )}

            {/* Verses Container */}
            {!loading && !error && verses.length > 0 && (
              <div className="space-y-6">
                
                {/* Bismillah Header (Except Surah 9 - At-Tawbah) */}
                {selectedSurah.number !== 9 && (
                  <div className="text-center py-8 border-b border-slate-800/40 font-serif text-2xl sm:text-3xl text-slate-200 leading-normal select-all">
                    بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
                  </div>
                )}

                {/* Verses Cards */}
                {verses.map((v) => (
                  <div 
                    key={v.numberInSurah} 
                    className="glass-card rounded-2xl p-5 border border-slate-800/80 flex flex-col gap-4 relative"
                  >
                    {/* Verse Header Badge */}
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-black uppercase tracking-wider text-indigo-400 bg-indigo-600/10 border border-indigo-500/20 px-2.5 py-0.5 rounded-full">
                        {lang === 'en' ? 'Ayah' : 'আয়াত'} {getBnbDigits(v.numberInSurah)}
                      </span>
                    </div>

                    {/* Arabic Verse text */}
                    <p className="font-serif text-2xl sm:text-3xl text-right leading-loose tracking-wide text-slate-100 select-all py-1">
                      {/* For Surah Fatiha (1) or others, if Bismillah is returned in verse 1 text, we can strip it, but simple display is standard. */}
                      {v.arabic}
                    </p>

                    {/* Bengali Translation */}
                    <p className="text-xs sm:text-sm text-indigo-200/90 leading-relaxed font-medium border-t border-slate-800/40 pt-3 pl-0.5 break-words">
                      {v.bengali}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </main>
    </div>
  );
}
