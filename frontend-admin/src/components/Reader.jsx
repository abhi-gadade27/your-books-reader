import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Type, Maximize2, Minimize2, Bookmark, 
  ChevronLeft, ChevronRight, Moon, Sun, Clock, BookOpen, Menu
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth, API_URL } from '../context/AuthContext';

const Reader = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, token } = useAuth();
  
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Reader controls
  const [chapterIndex, setChapterIndex] = useState(0);
  const [fontSize, setFontSize] = useState(18); // default 18px
  const [theme, setTheme] = useState('dark'); // 'dark' (royal purple-black), 'sepia', 'light', 'cinematic' (pure black)
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showChaptersMenu, setShowChaptersMenu] = useState(false);
  
  // Bookmarks
  const [bookmarks, setBookmarks] = useState([]);
  const [isBookmarked, setIsBookmarked] = useState(false);

  // Timer Metrics
  const [secondsSpent, setSecondsSpent] = useState(0);
  
  const readerRef = useRef(null);

  // Fetch book details
  useEffect(() => {
    const fetchBook = async () => {
      try {
        const res = await fetch(`${API_URL}/books/${id}`);
        if (!res.ok) throw new Error('Could not load book content');
        const data = await res.json();
        setBook(data.book);
        
        // Load initial progress if user read this book before
        if (user && user.readingHistory) {
          const record = user.readingHistory.find(h => h.bookId === id);
          if (record) {
            setChapterIndex(record.page || 0);
          }
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchBook();
  }, [id, user]);

  // Handle active bookmark status
  useEffect(() => {
    setIsBookmarked(bookmarks.includes(chapterIndex));
  }, [chapterIndex, bookmarks]);

  // Reading Timer Incrementor
  useEffect(() => {
    const interval = setInterval(() => {
      setSecondsSpent(prev => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Periodic Progress Auto-Saver (runs every 10 seconds, and on unmount/chapter change)
  useEffect(() => {
    if (!book) return;
    
    const saveProgress = async () => {
      const totalChapters = book.chapters?.length || 1;
      const progressPercent = Math.min(100, Math.round(((chapterIndex + 1) / totalChapters) * 100));
      
      try {
        await fetch(`${API_URL}/books/${id}/progress`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            page: chapterIndex,
            progress: progressPercent
          })
        });
      } catch (err) {
        console.error('Failed auto-saving progress:', err);
      }
    };

    const autoSaveTimer = setTimeout(saveProgress, 10000);
    return () => clearTimeout(autoSaveTimer);
  }, [chapterIndex, book, id, token]);

  const saveProgressImmediate = async (index) => {
    if (!book) return;
    const totalChapters = book.chapters?.length || 1;
    const progressPercent = Math.min(100, Math.round(((index + 1) / totalChapters) * 100));
    
    try {
      await fetch(`${API_URL}/books/${id}/progress`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          page: index,
          progress: progressPercent
        })
      });
    } catch (err) {
      console.error(err);
    }
  };

  // Fullscreen toggle
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      readerRef.current.requestFullscreen().then(() => setIsFullscreen(true)).catch(err => console.error(err));
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false));
    }
  };

  // Handle page change
  const nextPage = () => {
    if (book && chapterIndex < book.chapters.length - 1) {
      const nextIndex = chapterIndex + 1;
      setChapterIndex(nextIndex);
      saveProgressImmediate(nextIndex);
    }
  };

  const prevPage = () => {
    if (chapterIndex > 0) {
      const prevIndex = chapterIndex - 1;
      setChapterIndex(prevIndex);
      saveProgressImmediate(prevIndex);
    }
  };

  // Bookmark toggle
  const toggleBookmark = () => {
    if (isBookmarked) {
      setBookmarks(prev => prev.filter(b => b !== chapterIndex));
    } else {
      setBookmarks(prev => [...prev, chapterIndex]);
    }
  };

  // Format Timer
  const formatTimer = (totalSeconds) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}m ${secs.toString().padStart(2, '0')}s`;
  };

  // Styles configuration based on theme
  const getThemeStyles = () => {
    switch (theme) {
      case 'sepia':
        return {
          bg: 'bg-[#F4ECD8] text-[#5C4033]',
          panel: 'bg-[#EADECA] border-[#D2B48C] text-[#5C4033]',
          button: 'hover:bg-[#DFD3C3]',
          accent: 'text-amber-800'
        };
      case 'light':
        return {
          bg: 'bg-[#FAFAFA] text-[#222222]',
          panel: 'bg-white border-gray-200 text-[#222222]',
          button: 'hover:bg-gray-100',
          accent: 'text-indigo-600'
        };
      case 'cinematic':
        return {
          bg: 'bg-[#000000] text-gray-300',
          panel: 'bg-black border-white/5 text-gray-300',
          button: 'hover:bg-white/5',
          accent: 'text-theme-gold-elegant'
        };
      case 'dark':
      default:
        return {
          bg: 'bg-[#0f0717] text-gray-200', // royal purple tint
          panel: 'bg-theme-glass border-white/10 text-gray-200',
          button: 'hover:bg-white/5',
          accent: 'text-theme-gold-elegant'
        };
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-theme-dark">
        <div className="text-center">
          <BookOpen className="text-theme-gold-elegant w-12 h-12 mx-auto animate-spin-slow mb-4" />
          <h2 className="text-xl font-serif text-white">Opening Reader...</h2>
          <p className="text-xs text-gray-500 mt-2">Adjusting cinematic lens</p>
        </div>
      </div>
    );
  }

  if (error || !book) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-theme-dark text-white p-6">
        <div className="text-center max-w-md glass-panel p-8 rounded-3xl border-theme-red-deep/20">
          <h2 className="text-2xl font-serif text-theme-red-glow mb-4">Reading Error</h2>
          <p className="text-sm text-gray-400 mb-6">{error || 'Unable to retrieve book content.'}</p>
          <button
            onClick={() => navigate('/books')}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-theme-red-deep to-theme-purple-royal text-sm text-white"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const styles = getThemeStyles();
  const currentChapter = book.chapters && book.chapters[chapterIndex] 
    ? book.chapters[chapterIndex] 
    : { title: 'Chapter Content', content: book.description };

  return (
    <div 
      ref={readerRef} 
      className={`min-h-screen flex flex-col justify-between transition-colors duration-500 ${styles.bg}`}
    >
      {/* Top Navigation Bar */}
      <header className={`px-4 sm:px-6 py-3 border-b flex items-center justify-between ${styles.panel} backdrop-blur-md z-30`}>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate(-1)} 
            className={`p-2 rounded-lg transition-colors ${styles.button}`}
            aria-label="Exit Reader"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-xs sm:text-sm font-bold truncate max-w-[150px] sm:max-w-[250px] font-serif">
              {book.title}
            </h1>
            <p className="text-[10px] text-gray-500 font-light truncate">
              {book.author}
            </p>
          </div>
        </div>

        {/* Floating Timer */}
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/30 border border-white/5 text-[11px]">
          <Clock size={12} className="text-theme-gold-elegant" />
          <span>Timer: {formatTimer(secondsSpent)}</span>
        </div>

        {/* Header Options */}
        <div className="flex items-center gap-1.5 sm:gap-3">
          {/* Chapter Drawer Toggle */}
          <button 
            onClick={() => setShowChaptersMenu(!showChaptersMenu)} 
            className={`p-2 rounded-lg transition-colors ${styles.button}`}
            title="Chapters List"
          >
            <Menu size={18} />
          </button>

          {/* Theme Switcher */}
          <div className="flex items-center gap-1 bg-black/20 p-1 rounded-lg border border-white/5">
            {['dark', 'sepia', 'light', 'cinematic'].map((t) => (
              <button
                key={t}
                onClick={() => setTheme(t)}
                className={`text-[9px] font-bold px-2 py-1 rounded capitalize ${
                  theme === t 
                    ? 'bg-gradient-to-r from-theme-red-deep/40 to-theme-purple-royal/40 text-theme-gold-elegant border border-theme-gold-elegant/20' 
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          {/* Text Size Control */}
          <div className="flex items-center gap-1 bg-black/20 p-1 rounded-lg border border-white/5">
            <button 
              onClick={() => setFontSize(Math.max(14, fontSize - 2))}
              className={`p-1 text-xs rounded ${styles.button}`}
              title="Decrease Font Size"
            >
              A-
            </button>
            <span className="text-[11px] font-bold px-1.5">{fontSize}px</span>
            <button 
              onClick={() => setFontSize(Math.min(28, fontSize + 2))}
              className={`p-1 text-xs rounded ${styles.button}`}
              title="Increase Font Size"
            >
              A+
            </button>
          </div>

          {/* Bookmark Trigger */}
          <button 
            onClick={toggleBookmark} 
            className={`p-2 rounded-lg transition-colors ${styles.button}`}
            title={isBookmarked ? 'Remove Bookmark' : 'Add Bookmark'}
          >
            <Bookmark size={18} className={isBookmarked ? 'fill-theme-gold-elegant text-theme-gold-elegant' : ''} />
          </button>

          {/* Fullscreen Trigger */}
          <button 
            onClick={toggleFullscreen} 
            className={`p-2 rounded-lg transition-colors ${styles.button}`}
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen Mode'}
          >
            {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-4xl mx-auto px-6 sm:px-12 py-8 flex flex-col justify-center relative w-full">
        {/* Chapters drawer menu */}
        <AnimatePresence>
          {showChaptersMenu && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowChaptersMenu(false)}
                className="absolute inset-0 bg-black/60 z-30"
              />
              <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                className={`absolute top-0 right-0 h-full w-72 max-w-full ${styles.panel} border-l border-white/5 z-40 p-5 flex flex-col`}
              >
                <div className="flex items-center justify-between pb-4 border-b border-white/5">
                  <h3 className="font-serif font-semibold text-sm">Table of Contents</h3>
                  <button onClick={() => setShowChaptersMenu(false)} className="text-xs text-gray-500 hover:text-white">Close</button>
                </div>
                
                <div className="flex-1 overflow-y-auto mt-4 space-y-1">
                  {book.chapters?.map((chap, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setChapterIndex(index);
                        saveProgressImmediate(index);
                        setShowChaptersMenu(false);
                      }}
                      className={`w-full text-left p-2.5 rounded-lg text-xs font-medium transition-colors ${
                        chapterIndex === index
                          ? 'bg-gradient-to-r from-theme-red-deep/20 to-theme-purple-royal/20 text-theme-gold-elegant border border-theme-gold-elegant/10'
                          : 'hover:bg-white/5 text-gray-400 hover:text-white'
                      }`}
                    >
                      {index + 1}. {chap.title}
                    </button>
                  ))}

                  {/* Bookmarks section in drawer */}
                  {bookmarks.length > 0 && (
                    <div className="mt-8 pt-6 border-t border-white/5">
                      <h4 className="text-[11px] font-bold text-theme-gold-elegant uppercase tracking-wider mb-2">My Bookmarks</h4>
                      {bookmarks.map((index) => (
                        <button
                          key={index}
                          onClick={() => {
                            setChapterIndex(index);
                            setShowChaptersMenu(false);
                          }}
                          className="w-full text-left p-2 rounded-lg text-xs text-gray-400 hover:text-white hover:bg-white/5 flex items-center gap-2"
                        >
                          <Bookmark size={10} className="fill-theme-gold-elegant text-theme-gold-elegant" />
                          <span>Page {index + 1}: {book.chapters[index]?.title}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Reader Book Content Card with flipping page animation effect */}
        <AnimatePresence mode="wait">
          <motion.article
            key={chapterIndex}
            initial={{ opacity: 0, rotateY: 10, scale: 0.98 }}
            animate={{ opacity: 1, rotateY: 0, scale: 1 }}
            exit={{ opacity: 0, rotateY: -10, scale: 0.98 }}
            transition={{ duration: 0.4 }}
            className={`flex-1 rounded-2xl glass-panel-glow-purple border border-white/5 p-6 sm:p-10 shadow-2xl relative flex flex-col justify-between`}
            style={{ 
              fontFamily: book.language === 'Marathi' ? 'Rozha One, Rozha, serif' : 'Inter, sans-serif',
              transformStyle: 'preserve-3d' 
            }}
          >
            {/* Header info inside card */}
            <div className="pb-4 mb-6 border-b border-white/5 flex items-center justify-between">
              <span className={`text-[10px] font-bold uppercase tracking-wider ${styles.accent}`}>
                {currentChapter.title}
              </span>
              <span className="text-[10px] text-gray-500">
                Page {chapterIndex + 1} of {book.chapters?.length || 1}
              </span>
            </div>

            {/* Content Text rendering */}
            <div 
              className="flex-1 overflow-y-auto leading-relaxed select-text font-light pr-2"
              style={{ fontSize: `${fontSize}px`, lineHeight: 1.7 }}
            >
              {currentChapter.content.split('\n\n').map((paragraph, idx) => (
                <p key={idx} className="mb-4">
                  {paragraph}
                </p>
              ))}
            </div>

            {/* Flip Indicators on desktop */}
            <div className="absolute top-1/2 left-2 -translate-y-1/2 hidden md:block z-20">
              {chapterIndex > 0 && (
                <button
                  onClick={prevPage}
                  className={`p-2.5 rounded-full bg-black/40 border border-white/5 text-gray-400 hover:text-white transition-colors`}
                  aria-label="Previous Page"
                >
                  <ChevronLeft size={20} />
                </button>
              )}
            </div>

            <div className="absolute top-1/2 right-2 -translate-y-1/2 hidden md:block z-20">
              {book.chapters && chapterIndex < book.chapters.length - 1 && (
                <button
                  onClick={nextPage}
                  className={`p-2.5 rounded-full bg-black/40 border border-white/5 text-gray-400 hover:text-white transition-colors`}
                  aria-label="Next Page"
                >
                  <ChevronRight size={20} />
                </button>
              )}
            </div>

            {/* Footer page indicators */}
            <div className="mt-8 pt-4 border-t border-white/5 text-center text-[10px] text-gray-500 flex justify-between">
              <span>{book.language === 'Marathi' ? 'मराठी साहित्य संग्रह' : 'Your Books Reader Library'}</span>
              <span>Streak: {user?.readingStreak || 0} 🔥</span>
            </div>
          </motion.article>
        </AnimatePresence>
      </main>

      {/* Bottom Control buttons for mobile/tablet */}
      <footer className={`px-6 py-4 flex items-center justify-between border-t ${styles.panel} md:hidden z-30`}>
        <button
          onClick={prevPage}
          disabled={chapterIndex === 0}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold ${styles.button} disabled:opacity-30`}
        >
          <ChevronLeft size={16} />
          <span>Previous</span>
        </button>

        <span className="text-xs text-gray-500 font-medium">
          Page {chapterIndex + 1} / {book.chapters?.length || 1}
        </span>

        <button
          onClick={nextPage}
          disabled={!book.chapters || chapterIndex === book.chapters.length - 1}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold ${styles.button} disabled:opacity-30`}
        >
          <span>Next</span>
          <ChevronRight size={16} />
        </button>
      </footer>
    </div>
  );
};

export default Reader;
