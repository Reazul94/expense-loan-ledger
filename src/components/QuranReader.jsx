import React, { useState, useEffect, useRef } from 'react';
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
  AlertCircle,
  ChevronsUp,
  ChevronsDown,
  Play,
  Pause,
  Volume2,
  Square,
  Repeat,
  LogOut,
  Palette
} from 'lucide-react';
import { surahList } from '../utils/quranData';
import { toBengaliDigits } from './LedgerSelector';

export const recitersList = [
  { id: 'ar.alafasy', name: 'Mishary Rashid Al-Afasy', nameBn: 'মিশারী রশীদ আল-আফাসী' },
  { id: 'ar.mahermuaiqly', name: 'Maher Al Muaiqly', nameBn: 'মাহের আল-মুআইকিলী' },
  { id: 'ar.husary', name: 'Mahmoud Khalil Al-Husary', nameBn: 'মাহমুদ খলিল আল-হুসারী' },
  { id: 'ar.minshawi', name: 'Mohamed Siddiq Al-Minshawi', nameBn: 'মোহাম্মদ সিদ্দিক আল-মিনশাবি' },
  { id: 'ar.ahmedajamy', name: 'Ahmed Al-Ajamy', nameBn: 'আহমেদ আল-আজমি' },
  { id: 'ar.shaatree', name: 'Abu Bakr Ash-Shaatree', nameBn: 'আবু বকর আশ-শাতরি' },
  { id: 'ar.hudhaify', name: 'Ali Al-Huthaify', nameBn: 'আলী আল-হুজাইফী' }
];

export default function QuranReader({ 
  lang, 
  setLang,
  t, 
  onClose,
  currentUser,
  currentDateTime,
  theme,
  setTheme,
  handleLogout
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSurah, setSelectedSurah] = useState(null);
  const [verses, setVerses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showScrollUp, setShowScrollUp] = useState(false);
  const [showScrollDown, setShowScrollDown] = useState(true);
  const [verseSearchQuery, setVerseSearchQuery] = useState('');
  const [playingAyahId, setPlayingAyahId] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [continuousPlay, setContinuousPlay] = useState(true);
  const [currentQueueType, setCurrentQueueType] = useState(null); // 'auzubillah' | 'bismillah' | 'ayah'
  const [selectedReciter, setSelectedReciter] = useState(() => {
    const saved = localStorage.getItem('expense_hub_quran_reciter');
    if (saved) {
      const found = recitersList.find(r => r.id === saved);
      if (found) return found;
    }
    return recitersList[0];
  });

  const audioRef = useRef(null);
  const queueRef = useRef([]);
  const queueIndexRef = useRef(-1);
  const selectedSurahRef = useRef(selectedSurah);
  const versesRef = useRef(verses);
  const continuousPlayRef = useRef(continuousPlay);
  const selectedReciterRef = useRef(selectedReciter);

  // Sync refs with state to prevent stale closure issues in audio listeners
  useEffect(() => {
    selectedSurahRef.current = selectedSurah;
  }, [selectedSurah]);

  useEffect(() => {
    versesRef.current = verses;
  }, [verses]);

  useEffect(() => {
    continuousPlayRef.current = continuousPlay;
  }, [continuousPlay]);

  useEffect(() => {
    selectedReciterRef.current = selectedReciter;
    localStorage.setItem('expense_hub_quran_reciter', selectedReciter.id);
  }, [selectedReciter]);

  // Scroll active playing Ayah into view
  useEffect(() => {
    if (playingAyahId && isPlaying) {
      const activeVerse = verses.find(v => v.number === playingAyahId);
      if (activeVerse) {
        const el = document.getElementById(`ayah-${activeVerse.numberInSurah}`);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
    }
  }, [playingAyahId, isPlaying]);

  const playQueueItem = (index) => {
    if (!audioRef.current || index < 0 || index >= queueRef.current.length) return;

    const item = queueRef.current[index];
    queueIndexRef.current = index;

    // Update state for UI
    setCurrentQueueType(item.type);
    setPlayingAyahId(item.ayahId);

    // Play audio
    audioRef.current.src = item.url;
    audioRef.current.load();
    audioRef.current.play().catch(err => {
      console.error("Audio playback error:", err);
    });
    setIsPlaying(true);
  };

  const playAudio = (ayahNumber, skipIntro = false) => {
    if (!audioRef.current) return;

    // Build the queue
    const queue = [];
    if (!skipIntro) {
      // 1. Aujubillah
      // Play Al-Husary's own Aujubillah if selected, otherwise fallback to Al-Afasy
      const aujubillahUrl = selectedReciterRef.current.id === 'ar.husary'
        ? 'https://everyayah.com/data/Husary_128kbps/audhubillah.mp3'
        : 'https://everyayah.com/data/Alafasy_128kbps/audhubillah.mp3';

      queue.push({
        type: 'auzubillah',
        url: aujubillahUrl,
        ayahId: ayahNumber
      });
      // 2. Bismillah (except for Surah 9)
      if (selectedSurahRef.current && selectedSurahRef.current.number !== 9) {
        queue.push({
          type: 'bismillah',
          url: `https://cdn.islamic.network/quran/audio/128/${selectedReciterRef.current.id}/1.mp3`,
          ayahId: ayahNumber
        });
      }
    }
    // 3. The target Ayah
    queue.push({
      type: 'ayah',
      url: `https://cdn.islamic.network/quran/audio/128/${selectedReciterRef.current.id}/${ayahNumber}.mp3`,
      ayahId: ayahNumber
    });

    queueRef.current = queue;
    queueIndexRef.current = 0;

    playQueueItem(0);
  };

  // Initialize Audio player
  useEffect(() => {
    audioRef.current = new Audio();

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleEnded = () => {
      setIsPlaying(false);
      const nextIndex = queueIndexRef.current + 1;
      if (nextIndex < queueRef.current.length) {
        // Play next item in queue
        setTimeout(() => {
          playQueueItem(nextIndex);
        }, 600);
      } else {
        // Queue finished. If continuous play is enabled, find the next Ayah
        if (continuousPlayRef.current) {
          const lastItem = queueRef.current[queueRef.current.length - 1];
          if (lastItem && lastItem.type === 'ayah') {
            const currentAyahId = lastItem.ayahId;
            const currentIndex = versesRef.current.findIndex(v => v.number === currentAyahId);
            if (currentIndex !== -1 && currentIndex + 1 < versesRef.current.length) {
              const nextVerse = versesRef.current[currentIndex + 1];
              setTimeout(() => {
                // Play next verse, skipping the Aujubillah and Bismillah intro
                playAudio(nextVerse.number, true);
              }, 600);
            } else {
              // End of Surah
              setPlayingAyahId(null);
              setCurrentQueueType(null);
            }
          } else {
            setPlayingAyahId(null);
            setCurrentQueueType(null);
          }
        } else {
          setPlayingAyahId(null);
          setCurrentQueueType(null);
        }
      }
    };

    audioRef.current.addEventListener('play', handlePlay);
    audioRef.current.addEventListener('pause', handlePause);
    audioRef.current.addEventListener('ended', handleEnded);

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.removeEventListener('play', handlePlay);
        audioRef.current.removeEventListener('pause', handlePause);
        audioRef.current.removeEventListener('ended', handleEnded);
      }
    };
  }, []);

  const handlePlayPause = (ayahNumber) => {
    if (!audioRef.current) return;
    if (playingAyahId === ayahNumber) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch(err => console.error(err));
      }
    } else {
      playAudio(ayahNumber);
    }
  };

  const handleStopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    queueRef.current = [];
    queueIndexRef.current = -1;
    setPlayingAyahId(null);
    setCurrentQueueType(null);
    setIsPlaying(false);
  };

  // Scroll to top when view changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [selectedSurah]);

  // Handle scroll to toggle Up/Down scroll buttons
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const scrollHeight = document.documentElement.scrollHeight;
      const clientHeight = document.documentElement.clientHeight;

      // Show scroll up button if we've scrolled down more than 100px
      setShowScrollUp(scrollTop > 100);

      // Show scroll down button if we aren't near the bottom (more than 100px away)
      setShowScrollDown(scrollTop + clientHeight < scrollHeight - 100);
    };

    handleScroll();

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, [selectedSurah, verses]);

  // Fetch surah verses (Arabic, Bengali & English translations)
  const fetchSurah = async (surahNumber) => {
    setLoading(true);
    setError(null);
    setVerses([]);

    try {
      const url = `https://api.alquran.cloud/v1/surah/${surahNumber}/editions/quran-simple,bn.bengali,en.sahih`;
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch Surah data.');
      }
      const json = await response.json();
      
      if (json.code === 200 && json.data && json.data.length === 3) {
        const arabicAyahs = json.data[0].ayahs;
        const bengaliAyahs = json.data[1].ayahs;
        const englishAyahs = json.data[2].ayahs;

        // Combine Arabic, Bengali, and English verses, and strip Bismillah prefix if necessary
        let combined = arabicAyahs.map((ayah, index) => {
          let arabicText = ayah.text;
          if (surahNumber !== 1 && surahNumber !== 9 && index === 0) {
            const bismillah = "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ";
            if (arabicText.startsWith(bismillah)) {
              arabicText = arabicText.substring(bismillah.length).trim();
            }
          }
          return {
            number: ayah.number,
            numberInSurah: ayah.numberInSurah,
            arabic: arabicText,
            bengali: bengaliAyahs[index].text,
            english: englishAyahs[index].text
          };
        });

        // Special handling for Surah 1 (Al-Fatihah) to remove the Bismillah ayah (since it is rendered as header)
        if (surahNumber === 1) {
          // Remove the first ayah (which is Bismillah)
          combined = combined.slice(1);
          // Re-index the remaining ayahs so they start from 1
          combined = combined.map((v, i) => ({
            ...v,
            numberInSurah: i + 1
          }));
        }

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
    handleStopAudio();
    setSelectedSurah(null);
    setVerses([]);
    setError(null);
    setVerseSearchQuery('');
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

  const banglaToEnglishDigits = (str) => {
    const banglaDigits = {'০':'0','১':'1','২':'2','৩':'3','৪':'4','৫':'5','৬':'6','৭':'7','৮':'8','৯':'9'};
    return str.replace(/[০-৯]/g, d => banglaDigits[d]);
  };

  const filteredVerses = verses.filter(v => {
    const q = verseSearchQuery.toLowerCase().trim();
    if (!q) return true;

    const normalizedQ = banglaToEnglishDigits(q);

    // Matches ayah number, Arabic text, Bengali translation, or English translation
    return (
      v.numberInSurah.toString() === q ||
      v.numberInSurah.toString() === normalizedQ ||
      v.arabic.includes(q) ||
      v.bengali.toLowerCase().includes(q) ||
      v.english.toLowerCase().includes(q)
    );
  });

  return (
    <div className="min-h-screen flex flex-col antialiased bg-[var(--bg-color)] text-[var(--text-color)] selection:bg-indigo-500/30 selection:text-indigo-200">
      
      {/* Top Banner Header */}
      <header className="w-full border-b backdrop-blur-md relative md:sticky md:top-0 z-40 panel-container">
        <div className="max-w-7xl mx-auto px-4 py-3 md:h-16 flex flex-col md:flex-row items-center justify-between gap-3 md:gap-0">
          
          {/* Logo / Title */}
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={selectedSurah ? handleGoBackToList : () => { handleStopAudio(); onClose(); }}
              className="p-2 rounded-xl text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/10 transition-all border-0 bg-transparent cursor-pointer flex items-center justify-center shrink-0"
              title={lang === 'en' ? 'Back' : 'পেছনে যান'}
            >
              <ChevronLeft className="w-5 h-5 shrink-0" />
            </button>
            
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 shadow-md shadow-indigo-600/20 text-white shrink-0">
                <BookOpen className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <h1 className="text-xs sm:text-sm font-extrabold tracking-tight bg-gradient-to-r from-indigo-200 via-slate-100 to-purple-200 bg-clip-text text-transparent truncate">
                  {lang === 'en' ? 'Holy Quran Explorer' : 'পবিত্র আল-কুরআন এক্সপ্লোরার'}
                </h1>
                <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest truncate">
                  {selectedSurah 
                    ? `${selectedSurah.englishName} (${selectedSurah.name})` 
                    : (lang === 'en' ? 'Read Complete Quran' : 'সম্পূর্ণ কুরআন পড়ুন')}
                </p>
              </div>
            </div>

            {selectedSurah && (
              <button
                type="button"
                onClick={() => fetchSurah(selectedSurah.number)}
                disabled={loading}
                className="p-2 rounded-xl text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/10 transition-all border-0 bg-transparent cursor-pointer disabled:opacity-50 flex items-center justify-center shrink-0 animate-fadeIn"
                title={lang === 'en' ? 'Refresh Surah' : 'রিফ্রেশ করুন'}
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </button>
            )}
          </div>

          {/* User & Live Clock Info */}
          {currentUser && (
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2.5 text-center sm:text-left text-[10px] font-extrabold tracking-wide text-slate-400 bg-slate-950/20 border border-slate-800/40 rounded-xl px-3 py-1.5 md:py-2">
              <div className="flex items-center justify-center sm:justify-start gap-1.5 text-indigo-400 uppercase">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0"></span>
                <span>{lang === 'en' ? 'User:' : 'ব্যবহারকারী:'} <span className="text-slate-100 font-black">{currentUser.name}</span></span>
              </div>
              <span className="hidden sm:inline text-slate-800 font-normal">|</span>
              <div className="text-slate-300 font-mono tracking-tight select-all">
                {currentDateTime.toLocaleString(lang === 'bn' ? 'bn-BD' : 'en-US', { dateStyle: 'medium', timeStyle: 'medium' })}
              </div>
            </div>
          )}

          {/* Controls: Theme, Language, Logout */}
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

            {/* Logout Button */}
            {currentUser && (
              <button
                type="button"
                onClick={handleLogout}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg panel-container text-[10px] font-extrabold uppercase text-rose-400 hover:text-rose-300 hover:bg-rose-500/5 transition-all cursor-pointer border-0"
                title={lang === 'en' ? 'Log Out' : 'লগ আউট'}
              >
                <LogOut className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                <span className="hidden sm:inline">{lang === 'en' ? 'Log Out' : 'লগ আউট'}</span>
              </button>
            )}
          </div>

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
              {verses.length > 0 && (
                <div className="mt-5 flex flex-col sm:flex-row justify-center items-center gap-3">
                  {/* Reciter Selector Dropdown */}
                  <div className="flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-slate-950/40 border border-slate-800 shrink-0">
                    <Volume2 className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                    <select
                      value={selectedReciter.id}
                      onChange={(e) => {
                        const newRec = recitersList.find(r => r.id === e.target.value);
                        if (newRec) {
                          handleStopAudio();
                          setSelectedReciter(newRec);
                        }
                      }}
                      className="bg-transparent border-0 text-[10px] font-extrabold uppercase focus:ring-0 focus:outline-none cursor-pointer py-0.5 text-slate-300"
                    >
                      {recitersList.map(r => (
                        <option key={r.id} value={r.id} className="bg-slate-900 text-slate-200">
                          {lang === 'bn' ? r.nameBn : r.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <button
                    type="button"
                    onClick={() => handlePlayPause(verses[0].number)}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition-all active:scale-[0.98] cursor-pointer shadow-md glow-indigo border-0"
                  >
                    {playingAyahId && isPlaying ? (
                      <>
                        <Volume2 className="w-4 h-4 animate-pulse text-emerald-400" />
                        <span>{lang === 'en' ? 'Playing Recitation' : 'তেলাওয়াত চলছে'}</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4 fill-current" />
                        <span>{lang === 'en' ? 'Play Surah' : 'সূরা শুনুন'}</span>
                      </>
                    )}
                  </button>
                </div>
              )}
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
                
                {/* Search Input Bar for Verses */}
                <div className="relative">
                  <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    placeholder={lang === 'en' ? 'Search Ayah by number, Arabic text, or translation...' : 'নাম্বার, আরবী বা অনুবাদ দিয়ে আয়াত খুঁজুন...'}
                    value={verseSearchQuery}
                    onChange={(e) => setVerseSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-10 py-3 rounded-2xl text-xs sm:text-sm focus:border-indigo-500/50 bg-slate-900/40 border border-slate-800"
                  />
                  {verseSearchQuery && (
                    <button
                      type="button"
                      onClick={() => setVerseSearchQuery('')}
                      className="absolute right-3 top-3.5 p-0.5 rounded-full text-slate-500 hover:text-slate-300 hover:bg-slate-800 transition-colors border-0 bg-transparent cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Bismillah Header (Except Surah 9 - At-Tawbah, and hide when searching) */}
                {selectedSurah.number !== 9 && !verseSearchQuery.trim() && (
                  <div className="text-center py-6 border-b border-slate-800/40 flex flex-col gap-2.5">
                    {/* Arabic Bismillah */}
                    <div className="font-serif text-2xl sm:text-3xl text-slate-200 leading-normal select-all">
                      بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
                    </div>
                    {/* Translations */}
                    <div className="space-y-1 max-w-lg mx-auto">
                      {/* Bengali Bismillah translation */}
                      <p className="text-xs sm:text-sm text-indigo-200/80 leading-relaxed font-medium">
                        পরম করুণাময়, অসীম দয়ালুর নামে (শুরু করছি)।
                      </p>
                      {/* English Bismillah translation */}
                      <p className="text-[11px] sm:text-xs text-slate-400 leading-relaxed font-medium italic">
                        In the name of Allah, the Entirely Merciful, the Especially Merciful.
                      </p>
                    </div>
                  </div>
                )}

                {/* Verses Cards */}
                {filteredVerses.map((v) => (
                  <div 
                    key={v.numberInSurah} 
                    id={`ayah-${v.numberInSurah}`}
                    className={`glass-card rounded-2xl p-5 border transition-all duration-500 flex flex-col gap-4 relative ${
                      v.number === playingAyahId 
                        ? 'border-indigo-500/60 bg-indigo-600/5 shadow-lg shadow-indigo-500/5 glow-indigo-border'
                        : 'border-slate-800/80'
                    }`}
                  >
                    {/* Verse Header Badge */}
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-black uppercase tracking-wider text-indigo-400 bg-indigo-600/10 border border-indigo-500/20 px-2.5 py-0.5 rounded-full">
                        {lang === 'en' ? 'Ayah' : 'আয়াত'} {getBnbDigits(v.numberInSurah)}
                      </span>
                      
                      {/* Individual Audio Recitation Button */}
                      <button
                        type="button"
                        onClick={() => handlePlayPause(v.number)}
                        className={`w-7 h-7 rounded-full flex items-center justify-center transition-all border cursor-pointer active:scale-90 ${
                          v.number === playingAyahId
                            ? 'bg-indigo-600/15 border-indigo-500/30 text-indigo-400 shadow-md'
                            : 'bg-slate-900/40 border-slate-800 text-slate-500 hover:text-indigo-400 hover:border-indigo-500/20'
                        }`}
                        title={lang === 'en' ? 'Play Recitation' : 'তেলাওয়াত প্লে'}
                      >
                        {v.number === playingAyahId && isPlaying ? (
                          <Pause className="w-3.5 h-3.5 fill-current animate-pulse" />
                        ) : (
                          <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                        )}
                      </button>
                    </div>

                    {/* Arabic Verse text */}
                    <p className="font-serif text-2xl sm:text-3xl text-right leading-loose tracking-wide text-slate-100 select-all py-1">
                      {v.arabic}
                    </p>

                    {/* Translations */}
                    <div className="space-y-2 border-t border-slate-800/40 pt-3 pl-0.5">
                      {/* Bengali Translation */}
                      <p className="text-xs sm:text-sm text-indigo-200/90 leading-relaxed font-medium break-words">
                        {v.bengali}
                      </p>
                      {/* English Translation */}
                      <p className="text-[11px] sm:text-xs text-slate-400 leading-relaxed font-medium break-words italic">
                        {v.english}
                      </p>
                    </div>
                  </div>
                ))}

                {/* No results fallback */}
                {filteredVerses.length === 0 && (
                  <div className="glass-card rounded-2xl p-8 border border-slate-800/60 text-center text-slate-500 text-xs font-semibold animate-fadeIn">
                    {lang === 'en' ? 'No Ayahs match your search criteria.' : 'কোনো আয়াত খুঁজে পাওয়া যায়নি। আয়াতের নম্বর বা শব্দ ঠিকমতো লিখুন।'}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

      </main>

      {/* Floating Audio Recitation Control Bar */}
      {playingAyahId && (
        <div className="fixed bottom-24 left-4 right-4 md:left-auto md:right-4 md:w-96 z-40 animate-slideUp">
          <div className="rounded-2xl border border-indigo-500/30 bg-slate-900/95 backdrop-blur-md shadow-2xl p-4 flex flex-col gap-3 glow-indigo">
            {/* Playing Info */}
            <div className="flex items-center justify-between gap-3 text-left">
              <div className="flex items-center gap-2 min-w-0">
                <div className="p-2 rounded-xl bg-indigo-600/10 text-indigo-400 shrink-0">
                  <Volume2 className="w-4.5 h-4.5 animate-pulse" />
                </div>
                <div className="min-w-0">
                  <span className="text-[9px] font-black uppercase tracking-wider text-indigo-400">
                    {lang === 'en' ? 'Reciting Surah' : 'সূরা তেলাওয়াত'} {selectedSurah.englishName}
                  </span>
                  <p className="text-xs font-extrabold text-slate-100 truncate mt-0.5">
                    {currentQueueType === 'auzubillah' 
                      ? (lang === 'en' ? "A'udhu Billah" : "আউযুবিল্লাহ")
                      : currentQueueType === 'bismillah'
                        ? (lang === 'en' ? "Bismillah" : "বিসমিল্লাহ")
                        : `${lang === 'en' ? 'Ayah' : 'আয়াত'} ${getBnbDigits(verses.find(v => v.number === playingAyahId)?.numberInSurah || 1)}`
                    }
                  </p>
                </div>
              </div>

              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest bg-slate-950/40 px-2 py-0.5 rounded border border-slate-800 shrink-0">
                {lang === 'bn' ? selectedReciter.nameBn : selectedReciter.name}
              </span>
            </div>

            {/* Progress Bar Status */}
            <div className="w-full bg-slate-950/50 rounded-full h-1 overflow-hidden">
              <div className={`h-full bg-indigo-500 rounded-full ${isPlaying ? 'w-full transition-all duration-[20s] linear' : 'w-1/2'}`}></div>
            </div>

            {/* Control Buttons */}
            <div className="flex items-center justify-between gap-4 pt-1">
              {/* Continuous Play Toggle */}
              <button
                type="button"
                onClick={() => setContinuousPlay(!continuousPlay)}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg border text-[10px] font-bold uppercase transition-all cursor-pointer ${
                  continuousPlay
                    ? 'bg-indigo-600/15 border-indigo-500/30 text-indigo-400'
                    : 'bg-transparent border-slate-800 text-slate-500 hover:text-slate-300'
                }`}
                title={lang === 'en' ? 'Continuous Recitation' : 'অটো-নেক্সট প্লে'}
              >
                <Repeat className="w-3.5 h-3.5" />
                <span>{lang === 'en' ? 'Auto-Next' : 'অটো-নেক্সট'}</span>
              </button>

              {/* Play/Pause & Stop Controls */}
              <div className="flex items-center gap-2">
                {/* Play/Pause Toggle */}
                <button
                  type="button"
                  onClick={() => handlePlayPause(playingAyahId)}
                  className="w-8 h-8 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white flex items-center justify-center transition-all cursor-pointer border-0 active:scale-90"
                >
                  {isPlaying ? (
                    <Pause className="w-4 h-4 fill-current" />
                  ) : (
                    <Play className="w-4 h-4 fill-current ml-0.5" />
                  )}
                </button>

                {/* Stop */}
                <button
                  type="button"
                  onClick={handleStopAudio}
                  className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition-all cursor-pointer border border-slate-700 active:scale-90"
                  title={lang === 'en' ? 'Stop Recitation' : 'বন্ধ করুন'}
                >
                  <Square className="w-3.5 h-3.5 fill-current" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Floating scroll to top/bottom arrows */}
      {(showScrollUp || showScrollDown) && (
        <div className="fixed bottom-6 right-4 flex flex-col gap-3.5 z-50 animate-fadeIn">
          {showScrollUp && (
            <button
              type="button"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="w-11 h-11 rounded-full border border-slate-850 bg-slate-900/90 text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/10 hover:border-indigo-500/30 flex items-center justify-center transition-all cursor-pointer shadow-xl glow-indigo border-0 active:scale-90"
              title={lang === 'en' ? 'Scroll to Top' : 'উপরে যান'}
            >
              <ChevronsUp className="w-5 h-5 shrink-0" />
            </button>
          )}
          {showScrollDown && (
            <button
              type="button"
              onClick={() => window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'smooth' })}
              className="w-11 h-11 rounded-full border border-slate-850 bg-slate-900/90 text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/10 hover:border-indigo-500/30 flex items-center justify-center transition-all cursor-pointer shadow-xl glow-indigo border-0 active:scale-90"
              title={lang === 'en' ? 'Scroll to Bottom' : 'নিচে যান'}
            >
              <ChevronsDown className="w-5 h-5 shrink-0" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
