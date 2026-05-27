import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth, API_URL } from './context/AuthContext';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import AdminDashboard from './components/AdminDashboard';
import { 
  Heart, BookOpen, Star, Mail, Award, Flame, Calendar, BookMarked, 
  MapPin, Send, Compass, MessageSquare, ChevronRight, CheckCircle, AlertTriangle, Sparkles,
  Phone, Lock, User, X, Bell
} from 'lucide-react';
import { motion } from 'framer-motion';
import ParticlesBackground from './components/ParticlesBackground';
import BookCard from './components/BookCard';
import Reader from './components/Reader';


// ==================================================
// 1. LANDING PAGE (HOME)
// ==================================================
const Home = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [featuredBooks, setFeaturedBooks] = useState([]);
  const [recentBooks, setRecentBooks] = useState([]);

  useEffect(() => {
    // Fetch books
    fetch(`${API_URL}/books?filter=Popular`)
      .then(res => res.json())
      .then(data => setFeaturedBooks(data.slice(0, 3)))
      .catch(err => console.error(err));

    fetch(`${API_URL}/books?filter=Recently Added`)
      .then(res => res.json())
      .then(data => setRecentBooks(data.slice(0, 4)))
      .catch(err => console.error(err));
  }, []);

  const scrollToExplore = () => {
    const el = document.getElementById('explore-shelf');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section */}
      <div className="relative overflow-hidden min-h-[85vh] flex items-center justify-center">
        {/* Animated Badge & Hero Text */}
        <div className="text-center z-10 max-w-4xl mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-panel border border-theme-gold-elegant/20 text-theme-gold-bright text-xs sm:text-sm font-semibold mb-6 shadow-gold-glow/10"
          >
            <Flame size={14} className="text-theme-gold-elegant animate-bounce" />
            <span>Discover Stories That Stay Forever</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-4xl sm:text-6xl md:text-7xl font-bold font-serif leading-tight text-white mb-6"
          >
            Read Beyond Limits
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.3 }}
            className="max-w-2xl mx-auto text-gray-400 text-sm sm:text-md md:text-lg mb-10 leading-relaxed font-light"
          >
            “Read Beyond Limits — Discover Stories That Stay Forever.” Explore classical Marathi novels, global fiction, and biography masterpieces in a high-end cinematic reader.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <button
              onClick={() => navigate('/books')}
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-theme-red-deep to-theme-purple-royal border border-theme-gold-elegant/30 text-white font-medium hover:brightness-110 active:scale-95 transition-all shadow-red-glow/20 flex items-center justify-center gap-2"
            >
              <BookOpen size={16} className="text-theme-gold-bright" />
              <span>Start Reading</span>
            </button>
            <button
              onClick={scrollToExplore}
              className="w-full sm:w-auto px-8 py-4 rounded-xl glass-panel border border-white/10 text-gray-300 hover:text-white transition-all flex items-center justify-center gap-2"
            >
              <Compass size={16} />
              <span>Explore Library</span>
            </button>
          </motion.div>
        </div>
      </div>

      {/* Streak and Suggestions Banner (If Logged In) */}
      {user && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-panel-glow-gold border rounded-3xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-6"
          >
            <div className="flex items-center gap-4">
              <div className="p-3.5 bg-gradient-to-tr from-theme-red-deep/20 to-theme-purple-royal/20 border border-theme-gold-elegant/30 rounded-2xl flex items-center justify-center text-theme-gold-elegant">
                <Flame size={28} className="animate-pulse" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white font-serif">Welcome back, {user.username}!</h3>
                <p className="text-xs text-gray-400 mt-1">You are currently on a <span className="text-theme-gold-bright font-bold">{user.readingStreak || 0}-day reading streak</span>. Keep going!</p>
              </div>
            </div>
            
            {/* Continue Reading Suggestion */}
            {user.readingHistory && user.readingHistory.length > 0 ? (
              <div className="flex items-center gap-4 bg-white/5 border border-white/5 p-3 rounded-2xl">
                <img 
                  src={user.readingHistory[user.readingHistory.length - 1].bookCover} 
                  alt="cover" 
                  className="w-9 h-12 object-cover rounded shadow"
                />
                <div className="text-left">
                  <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Continue Reading</p>
                  <p className="text-xs font-semibold text-white truncate max-w-[120px]">{user.readingHistory[user.readingHistory.length - 1].bookTitle}</p>
                  <button
                    onClick={() => navigate(`/reader/${user.readingHistory[user.readingHistory.length - 1].bookId}`)}
                    className="text-[10px] text-theme-gold-elegant hover:underline font-bold mt-1 block"
                  >
                    Resume Page {user.readingHistory[user.readingHistory.length - 1].page + 1} &rarr;
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-xs text-gray-400">Pick up your first book from the shelves below and start your progress!</p>
            )}
          </motion.div>
        </div>
      )}

      {/* Featured Books Row */}
      <div id="explore-shelf" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex justify-between items-end">
          <div>
            <h2 className="text-2xl font-serif text-white font-bold flex items-center gap-2">
              <Sparkles className="text-theme-gold-elegant" size={20} />
              <span>Trending Masterpieces</span>
            </h2>
            <p className="text-xs text-gray-400 mt-1 font-light">Highly rated literature chosen by readers</p>
          </div>
          <Link to="/books" className="text-xs text-theme-gold-elegant hover:underline flex items-center gap-1">
            <span>View All</span>
            <ChevronRight size={12} />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {featuredBooks.map(book => (
            <BookCard key={book._id} book={book} />
          ))}
        </div>
      </div>

      {/* AI Recommendations shelf */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div>
          <h2 className="text-2xl font-serif text-white font-bold flex items-center gap-2">
            <Compass className="text-theme-purple-glow" size={20} />
            <span>AI-Based Book Recommendations</span>
          </h2>
          <p className="text-xs text-gray-400 mt-1 font-light">Tailored suggestions matching your profile stats</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {recentBooks.map(book => (
            <BookCard key={book._id} book={book} />
          ))}
        </div>
      </div>
    </div>
  );
};

// ==================================================
// 2. EXPLORE BOOKS (CATALOG WITH FILTERS)
// ==================================================
const BooksCatalog = () => {
  const [searchParams] = useSearchParams();
  const urlSearch = searchParams.get('search') || '';
  
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState(urlSearch);
  const [languageFilter, setLanguageFilter] = useState('');
  
  const categories = ['All', 'Fiction', 'Classic Literature', 'Novel', 'Biography', 'Historical Fiction'];

  const fetchBooks = async () => {
    setLoading(true);
    try {
      let url = `${API_URL}/books?`;
      if (searchQuery) url += `search=${searchQuery}&`;
      if (activeFilter && activeFilter !== 'All') url += `category=${activeFilter}&`;
      if (languageFilter) url += `language=${languageFilter}&`;
      
      const res = await fetch(url);
      if (res.ok) {
        setBooks(await res.json());
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, [activeFilter, languageFilter, searchQuery]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header & Search */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-serif text-white font-bold">Explore Library</h1>
          <p className="text-xs text-gray-400 mt-1">Browse, search and read from our hand-curated shelves</p>
        </div>

        <div className="w-full md:w-80 relative">
          <input
            type="text"
            placeholder="Search title, author..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-full glass-panel border border-white/10 text-sm focus:outline-none focus:border-theme-gold-elegant text-white"
          />
          <Compass size={16} className="absolute left-3.5 top-3 text-gray-500" />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveFilter(cat)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                activeFilter === cat
                  ? 'bg-gradient-to-r from-theme-red-deep/30 to-theme-purple-royal/30 text-theme-gold-elegant border-theme-gold-elegant/30'
                  : 'glass-panel border-white/5 text-gray-400 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Language selector */}
        <div className="flex items-center gap-2 bg-black/20 p-1 rounded-xl border border-white/5 w-fit">
          {[
            { label: 'All Languages', val: '' },
            { label: 'English', val: 'English' },
            { label: 'मराठी (Marathi)', val: 'Marathi' }
          ].map(lang => (
            <button
              key={lang.val}
              onClick={() => setLanguageFilter(lang.val)}
              className={`px-3 py-1 text-xs font-medium rounded-lg transition-all ${
                languageFilter === lang.val
                  ? 'bg-gradient-to-r from-theme-red-deep/40 to-theme-purple-royal/40 text-theme-gold-elegant border border-theme-gold-elegant/10'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {lang.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid Shelf */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="glass-panel border border-white/5 rounded-2xl h-[450px] animate-pulse p-4 flex flex-col justify-between">
              <div className="aspect-[3/4] bg-white/5 rounded-xl" />
              <div className="space-y-3 mt-4">
                <div className="h-4 bg-white/10 rounded w-2/3" />
                <div className="h-3 bg-white/5 rounded w-1/2" />
                <div className="h-8 bg-white/5 rounded w-full mt-4" />
              </div>
            </div>
          ))}
        </div>
      ) : books.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 animate-fade-in">
          {books.map(book => (
            <BookCard key={book._id} book={book} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 glass-panel border border-white/5 rounded-3xl">
          <BookOpen className="text-gray-600 w-12 h-12 mx-auto mb-3" />
          <h3 className="text-lg font-serif text-white">No Books Found</h3>
          <p className="text-xs text-gray-500 mt-1">Try relaxing filters or search terms</p>
        </div>
      )}
    </div>
  );
};

// ==================================================
// 3. DEDICATED MARATHI BOOKS SECTION
// ==================================================
const MarathiBooks = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');

  const marathiCategories = [
    { en: 'All', mr: 'सर्व साहित्य' },
    { en: 'Classic Literature', mr: 'अभिजात साहित्य' },
    { en: 'Novel', mr: 'कादंबरी संग्रह' },
    { en: 'Historical Fiction', mr: 'ऐतिहासिक कादंबरी' }
  ];

  useEffect(() => {
    setLoading(true);
    let url = `${API_URL}/books?language=Marathi`;
    if (activeCategory !== 'All') {
      url += `&category=${activeCategory}`;
    }
    
    fetch(url)
      .then(res => res.json())
      .then(data => {
        setBooks(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [activeCategory]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 font-marathi">
      {/* Devnagari theme styled header */}
      <div className="glass-panel-glow-red border rounded-3xl p-8 text-center relative overflow-hidden">
        {/* Background glow overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-theme-red-dark/30 to-theme-purple-dark/30 pointer-events-none" />
        
        <div className="relative z-10 space-y-2">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="inline-block text-[11px] font-bold text-theme-gold-bright uppercase tracking-widest bg-theme-red-deep/40 border border-theme-gold-elegant/20 px-3 py-1 rounded-full mb-2"
          >
            मराठी साहित्य दालन
          </motion.div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-gradient-gold Rozha font-serif tracking-wide leading-tight">
            मराठी पुस्तके संग्रह
          </h1>
          <p className="text-xs sm:text-sm text-gray-300 font-light max-w-xl mx-auto font-sans leading-relaxed">
            महाराष्ट्राच्या समृद्ध सांस्कृतिक वारशाची आणि अद्भूत मराठी साहित्याची सफर करा. ऐतिहासिक कादंबरी, कथा आणि जीवनचरित्रे वाचा.
          </p>
        </div>
      </div>

      {/* Marathi Localized Filters */}
      <div className="flex flex-wrap justify-center gap-3 border-b border-white/5 pb-6">
        {marathiCategories.map((cat) => (
          <button
            key={cat.en}
            onClick={() => setActiveCategory(cat.en)}
            className={`px-5 py-2 rounded-xl text-xs font-semibold border transition-all ${
              activeCategory === cat.en
                ? 'bg-gradient-to-r from-theme-red-deep/40 to-theme-purple-royal/40 text-theme-gold-bright border-theme-gold-elegant/40 shadow-red-glow/20'
                : 'glass-panel border-white/5 text-gray-400 hover:text-white'
            }`}
          >
            {cat.mr}
          </button>
        ))}
      </div>

      {/* Grid Shelf */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="glass-panel border border-white/5 rounded-2xl h-[450px] animate-pulse" />
          ))}
        </div>
      ) : books.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {books.map(book => (
            <BookCard key={book._id} book={book} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 glass-panel border border-white/5 rounded-3xl">
          <p className="text-xs text-gray-500">या वर्गवारीमध्ये सध्या पुस्तके उपलब्ध नाहीत.</p>
        </div>
      )}
    </div>
  );
};

// ==================================================
// 4. USER PROFILE & STREAKS
// ==================================================
const UserProfile = () => {
  const { user, token, updateProfile, refreshUserData, notifications } = useAuth();
  const [activeSubTab, setActiveSubTab] = useState('stats');
  const location = useLocation();
  const [searchParams] = useSearchParams();
  
  // Profile edit state
  const [isEditing, setIsEditing] = useState(false);
  const [username, setUsername] = useState(user?.username || '');
  const [profileImage, setProfileImage] = useState(user?.profileImage || '');
  const [favCategories, setFavCategories] = useState(user?.favoriteCategories?.join(', ') || '');
  const [loadingEdit, setLoadingEdit] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  const avatarSeeds = ['Felix', 'Aneka', 'Jack', 'Zoe', 'Oliver', 'Maya', 'Sasha', 'Liam', 'Lily', 'Leo', 'Mia', 'Zack'];

  useEffect(() => {
    if (token) refreshUserData();
  }, [token]);

  // Synchronize form states whenever user object updates or editing state opens
  useEffect(() => {
    if (user && isEditing) {
      setUsername(user.username || '');
      setProfileImage(user.profileImage || '');
      setFavCategories(user.favoriteCategories?.join(', ') || '');
    }
  }, [user, isEditing]);

  // Synchronize active tab based on URL hash
  useEffect(() => {
    const hash = location.hash;
    if (hash === '#notifications') {
      setActiveSubTab('notifications');
    } else if (hash === '#history' || hash === '#saved') {
      setActiveSubTab('history');
    } else if (hash === '#settings') {
      setIsEditing(true);
      setActiveSubTab('stats');
    } else {
      setActiveSubTab('stats');
    }
  }, [location.hash]);

  // Check query parameters to toggle edit drawer
  useEffect(() => {
    if (searchParams.get('edit') === 'true') {
      setIsEditing(true);
    }
  }, [searchParams]);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('avatar', file);

    setUploadingImage(true);
    try {
      const res = await fetch(`${API_URL}/auth/upload-avatar`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });
      const data = await res.json();
      if (res.ok) {
        setProfileImage(data.imageUrl);
        alert('Profile picture uploaded successfully! Click "Save Settings" below to apply.');
      } else {
        alert(data.message || 'File upload failed');
      }
    } catch (err) {
      console.error(err);
      alert('Error uploading file');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoadingEdit(true);
    try {
      const categoriesArray = favCategories
        .split(',')
        .map(c => c.trim())
        .filter(c => c.length > 0);

      await updateProfile({
        username,
        profileImage,
        favoriteCategories: categoriesArray
      });
      alert('Profile updated successfully!');
      setIsEditing(false);
    } catch (err) {
      alert(err.message);
    } finally {
      setLoadingEdit(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center text-white">
        <div className="text-center glass-panel p-8 rounded-3xl border-white/10 max-w-sm">
          <Flame size={40} className="text-theme-gold-elegant mx-auto mb-4" />
          <h2 className="text-lg font-serif">Sign in Required</h2>
          <p className="text-xs text-gray-400 mt-2 mb-6">You must be logged in to view your profile dashboard.</p>
          <Link to="/login" className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-theme-red-deep to-theme-purple-royal text-xs font-semibold text-white">Log In</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Profile Overview Card */}
      <div className="glass-panel border border-white/5 p-6 rounded-3xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <img
            src={user.profileImage}
            alt={user.username}
            className="w-20 h-20 rounded-full border border-theme-gold-elegant/40 object-cover shadow-2xl"
          />
          <div>
            <h1 className="text-2xl font-serif text-white font-bold">{user.username}</h1>
            <p className="text-xs text-gray-400">{user.email}</p>
            <div className="flex items-center gap-3 mt-3">
              <span className="text-[10px] bg-theme-gold-elegant/10 border border-theme-gold-elegant/20 text-theme-gold-elegant px-2.5 py-0.5 rounded-full font-bold uppercase">
                {user.role} Member
              </span>
              <span className="text-[10px] text-gray-500 font-light">Joined {new Date(user.createdAt || Date.now()).toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="px-5 py-2.5 rounded-xl border border-white/10 hover:border-theme-gold-elegant/30 hover:text-white transition-all text-xs font-medium"
          >
            {isEditing ? 'Cancel Edit' : 'Edit Profile'}
          </button>
        </div>
      </div>

      {/* Edit Form Drawer */}
      {isEditing && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          className="glass-panel border border-white/10 p-6 rounded-3xl"
        >
          <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Edit Profile details</h3>
          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-xs text-gray-400">Username</label>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="p-2 text-sm rounded-lg bg-theme-darker/60 border border-white/10 text-white focus:outline-none focus:border-theme-gold-elegant"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs text-gray-400">Favorite Categories (Comma-separated)</label>
                <input
                  type="text"
                  placeholder="e.g. Fiction, Classics, Biography"
                  value={favCategories}
                  onChange={(e) => setFavCategories(e.target.value)}
                  className="p-2 text-sm rounded-lg bg-theme-darker/60 border border-white/10 text-white focus:outline-none focus:border-theme-gold-elegant"
                />
              </div>

              {/* Avatar Selector Grid */}
              <div className="flex flex-col gap-2 sm:col-span-2">
                <label className="text-xs text-gray-400">Select Avatar Seed (Dicebear characters)</label>
                <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-12 gap-2 bg-black/25 p-3 rounded-2xl border border-white/5">
                  {avatarSeeds.map((seed) => {
                    const avatarUrl = `https://api.dicebear.com/7.x/adventurer/svg?seed=${seed}`;
                    const isSelected = profileImage === avatarUrl;
                    return (
                      <button
                        key={seed}
                        type="button"
                        onClick={() => setProfileImage(avatarUrl)}
                        className={`aspect-square rounded-xl overflow-hidden border-2 transition-all hover:scale-105 active:scale-95 flex items-center justify-center p-1 bg-white/5 ${
                          isSelected ? 'border-theme-gold-elegant bg-white/10 shadow-gold-glow/20' : 'border-transparent hover:border-white/20'
                        }`}
                        title={seed}
                      >
                        <img src={avatarUrl} alt={seed} className="w-full h-full object-contain" />
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* File Upload Option */}
              <div className="flex flex-col gap-1 sm:col-span-2">
                <label className="text-xs text-gray-400">Upload Profile Picture (DP)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="p-1 text-sm rounded-lg bg-theme-darker/60 border border-white/10 text-white focus:outline-none focus:border-theme-gold-elegant file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-theme-gold-elegant/10 file:text-theme-gold-bright hover:file:bg-theme-gold-elegant/20 file:cursor-pointer"
                />
                {uploadingImage && <p className="text-[10px] text-theme-gold-bright animate-pulse mt-1">Uploading image file...</p>}
              </div>

              <div className="flex flex-col gap-1 sm:col-span-2">
                <label className="text-xs text-gray-400">Or custom profile Image URL</label>
                <input
                  type="text"
                  placeholder="https://images.unsplash.com/photo-..."
                  value={profileImage}
                  onChange={(e) => setProfileImage(e.target.value)}
                  className="p-2 text-sm rounded-lg bg-theme-darker/60 border border-white/10 text-white focus:outline-none focus:border-theme-gold-elegant"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={loadingEdit}
                className="px-6 py-2 rounded-xl bg-gradient-to-r from-theme-red-deep to-theme-purple-royal text-xs font-semibold text-white border border-theme-gold-elegant/20"
              >
                {loadingEdit ? 'Saving...' : 'Save Settings'}
              </button>
            </div>
          </form>
        </motion.div>
      )}

      {/* Sub-tab Navigation */}
      <div className="flex border-b border-white/5 pb-2 overflow-x-auto gap-4 scrollbar-none">
        {[
          { id: 'stats', label: 'My Stats & Achievements', hash: '#stats' },
          { id: 'notifications', label: 'Notifications', hash: '#notifications', count: notifications?.length },
          { id: 'history', label: 'Reading Progress & History', hash: '#history' },
        ].map((tab) => (
          <Link
            key={tab.id}
            to={`/profile${tab.hash}`}
            className={`px-4 py-2 text-xs sm:text-sm font-semibold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
              activeSubTab === tab.id
                ? 'border-theme-gold-elegant text-theme-gold-elegant font-bold'
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            <span>{tab.label}</span>
            {tab.count ? (
              <span className="bg-theme-red-glow/20 text-theme-red-glow text-[10px] px-2 py-0.5 rounded-full border border-theme-red-glow/25 font-bold">
                {tab.count}
              </span>
            ) : null}
          </Link>
        ))}
      </div>

      {/* Stats and Streaks sub-tab */}
      {activeSubTab === 'stats' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in">
          
          {/* Left Column: Streaks and Achievement Badges */}
          <div className="space-y-6">
            {/* Streak card */}
            <div className="glass-panel border border-white/5 p-6 rounded-3xl text-center space-y-4">
              <Flame size={48} className="text-orange-500 mx-auto animate-bounce" />
              <div>
                <h3 className="text-3xl font-bold text-white font-serif">{user.readingStreak || 0} Days</h3>
                <p className="text-xs text-gray-400 mt-1 uppercase tracking-wider font-semibold">Current Reading Streak</p>
              </div>
              <p className="text-[11px] text-gray-500">Read a page daily to keep your learning streak flame alive!</p>
            </div>

            {/* Badges Grid */}
            <div className="glass-panel border border-white/5 p-6 rounded-3xl">
              <h3 className="text-sm font-serif font-bold text-white mb-4 flex items-center gap-2">
                <Award className="text-theme-gold-elegant" size={16} />
                <span>Unlocked Achievement Badges</span>
              </h3>
              
              <div className="grid grid-cols-2 gap-3">
                {user.badges && user.badges.length > 0 ? (
                  user.badges.map((badge, idx) => (
                    <div key={idx} className="p-3 bg-white/5 border border-white/5 rounded-2xl text-center flex flex-col items-center justify-center">
                      <Award size={20} className="text-theme-gold-bright mb-1" />
                      <span className="text-[10px] text-gray-300 font-semibold truncate max-w-full">{badge}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-gray-500 text-center col-span-2">No badges unlocked yet.</p>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Mini Reading history progress list */}
          <div className="lg:col-span-2 space-y-6">
            <div className="glass-panel border border-white/5 p-6 rounded-3xl space-y-4">
              <h3 className="text-lg font-serif font-bold text-white flex items-center gap-2">
                <BookMarked className="text-theme-purple-glow" size={18} />
                <span>My Reading Progress Shelf</span>
              </h3>

              {user.readingHistory && user.readingHistory.length > 0 ? (
                <div className="space-y-4">
                  {user.readingHistory.slice(0, 3).map((item, idx) => (
                    <div key={idx} className="flex gap-4 p-3 bg-white/5 border border-white/5 rounded-2xl hover:border-theme-gold-elegant/10 transition-colors">
                      <img src={item.bookCover} alt={item.bookTitle} className="w-12 h-16 object-cover rounded shadow" />
                      <div className="flex-1 flex flex-col justify-between overflow-hidden">
                        <div>
                          <div className="flex justify-between items-center gap-2">
                            <h4 className="text-sm font-semibold text-white truncate font-serif">{item.bookTitle}</h4>
                            <span className="text-[10px] text-gray-500">{new Date(item.lastRead).toLocaleDateString()}</span>
                          </div>
                          <p className="text-[10px] text-gray-400 mt-1">Reading progress: {item.progress}% (Chapter {item.page + 1})</p>
                        </div>
                        
                        <div className="flex items-center gap-3 mt-2">
                          <div className="flex-1 h-1.5 bg-theme-darker rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-theme-red-deep to-theme-gold-elegant rounded-full"
                              style={{ width: `${item.progress}%` }}
                            />
                          </div>
                          <Link
                            to={`/reader/${item.bookId}`}
                            className="text-[10px] text-theme-gold-elegant hover:underline font-bold"
                          >
                            Resume &rarr;
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                  {user.readingHistory.length > 3 && (
                    <Link to="/profile#history" className="text-xs text-theme-gold-elegant hover:underline block text-center font-semibold pt-2">
                      View remaining {user.readingHistory.length - 3} books in progress &rarr;
                    </Link>
                  )}
                </div>
              ) : (
                <div className="text-center py-10">
                  <p className="text-xs text-gray-500">You haven't read any books yet. Explore catalog to start.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Reading history list */}
      {activeSubTab === 'history' && (
        <div className="glass-panel border border-white/5 p-6 sm:p-8 rounded-3xl space-y-6 animate-fade-in">
          <h3 className="text-lg font-serif font-bold text-white flex items-center gap-2">
            <BookMarked className="text-theme-purple-glow" size={18} />
            <span>My Reading Progress Shelf</span>
          </h3>

          {user.readingHistory && user.readingHistory.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {user.readingHistory.map((item, idx) => (
                <div key={idx} className="flex gap-4 p-4 bg-white/5 border border-white/5 rounded-2xl hover:border-theme-gold-elegant/10 transition-all hover:bg-white/10">
                  <img src={item.bookCover} alt={item.bookTitle} className="w-16 h-20 object-cover rounded shadow" />
                  <div className="flex-1 flex flex-col justify-between overflow-hidden">
                    <div>
                      <div className="flex justify-between items-center gap-2">
                        <h4 className="text-sm font-semibold text-white truncate font-serif">{item.bookTitle}</h4>
                        <span className="text-[10px] text-gray-500">{new Date(item.lastRead).toLocaleDateString()}</span>
                      </div>
                      <p className="text-[11px] text-gray-400 mt-1">Reading progress: {item.progress}% (Chapter {item.page + 1})</p>
                    </div>
                    
                    <div className="flex items-center gap-3 mt-4">
                      <div className="flex-1 h-1.5 bg-theme-darker rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-theme-red-deep to-theme-gold-elegant rounded-full"
                          style={{ width: `${item.progress}%` }}
                        />
                      </div>
                      <Link
                        to={`/reader/${item.bookId}`}
                        className="text-[10px] text-theme-gold-elegant hover:underline font-bold"
                      >
                        Resume &rarr;
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10">
              <p className="text-xs text-gray-500">You haven't read any books yet. Explore catalog to start.</p>
            </div>
          )}
        </div>
      )}

      {/* Notifications sub-tab */}
      {activeSubTab === 'notifications' && (
        <div className="glass-panel border border-white/5 p-6 sm:p-8 rounded-3xl space-y-6 animate-fade-in">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-serif font-bold text-white flex items-center gap-2">
              <Bell className="text-theme-gold-elegant" size={18} />
              <span>Notifications Inbox</span>
            </h3>
            <span className="text-xs text-gray-500">{notifications?.length || 0} Messages</span>
          </div>

          {notifications && notifications.length > 0 ? (
            <div className="space-y-3">
              {notifications.map((notif, idx) => (
                <div 
                  key={notif._id || idx}
                  onClick={() => setSelectedNotification(notif)}
                  className="p-4 bg-white/5 border border-white/5 hover:border-theme-gold-elegant/20 hover:bg-white/10 rounded-2xl transition-all cursor-pointer flex justify-between items-start gap-4"
                >
                  <div className="space-y-1 overflow-hidden">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-sm font-semibold text-white">{notif.title}</h4>
                      <span className={`text-[8px] font-bold px-2 py-0.5 rounded-full uppercase ${
                        notif.type === 'announcement'
                          ? 'bg-purple-500/20 text-purple-300 border border-purple-500/25'
                          : notif.type === 'reminder'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/25'
                            : 'bg-blue-500/20 text-blue-300 border border-blue-500/25'
                      }`}>
                        {notif.type || 'update'}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 truncate max-w-md sm:max-w-xl md:max-w-2xl">{notif.message}</p>
                  </div>
                  <span className="text-[10px] text-gray-500 whitespace-nowrap">
                    {new Date(notif.createdAt || Date.now()).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10">
              <p className="text-xs text-gray-500">Your inbox is clear! No notifications received.</p>
            </div>
          )}
        </div>
      )}

      {/* Notification Details Modal */}
      <AnimatePresence>
        {selectedNotification && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg glass-panel border border-white/10 p-6 sm:p-8 rounded-3xl space-y-6 relative"
            >
              <button 
                onClick={() => setSelectedNotification(null)}
                className="absolute top-4 right-4 text-gray-400 hover:text-white p-1.5 rounded-full hover:bg-white/5 transition-all"
              >
                <X size={18} />
              </button>
              
              <div className="space-y-4 text-left">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-theme-gold-elegant/10 border border-theme-gold-elegant/20 text-theme-gold-bright rounded-2xl">
                    <Bell size={24} className="animate-pulse" />
                  </div>
                  <div>
                    <span className={`text-[9px] font-bold px-2.5 py-0.5 rounded-full uppercase inline-block mb-1.5 ${
                      selectedNotification.type === 'announcement'
                        ? 'bg-purple-500/20 text-purple-300 border border-purple-500/25'
                        : selectedNotification.type === 'reminder'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/25'
                          : 'bg-blue-500/20 text-blue-300 border border-blue-500/25'
                    }`}>
                      {selectedNotification.type || 'update'}
                    </span>
                    <h3 className="text-xl font-bold text-white font-serif">{selectedNotification.title}</h3>
                  </div>
                </div>

                <div className="text-[10px] text-gray-500 border-b border-white/5 pb-2">
                  Received on {new Date(selectedNotification.createdAt || Date.now()).toLocaleString()}
                </div>

                <p className="text-sm text-gray-300 leading-relaxed font-light whitespace-pre-wrap">
                  {selectedNotification.message}
                </p>
              </div>

              <div className="flex justify-end pt-4">
                <button
                  onClick={() => setSelectedNotification(null)}
                  className="px-6 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-white border border-white/10"
                >
                  Close Message
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

// ==================================================
// 5. WISHLIST PAGE
// ==================================================
const WishlistPage = () => {
  const { user, token } = useAuth();
  const [wishlistBooks, setWishlistBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchWishlist = async () => {
    if (!user) return;
    setLoading(true);
    try {
      // Since our fallback DB lets us fetch all, we fetch all books and filter locally based on user.wishlist
      const res = await fetch(`${API_URL}/books`);
      if (res.ok) {
        const allBooks = await res.json();
        const filtered = allBooks.filter(book => user.wishlist?.includes(book._id));
        setWishlistBooks(filtered);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, [user]);

  const handleWishlistUpdateLocally = (bookId, isAdded) => {
    if (!isAdded) {
      setWishlistBooks(prev => prev.filter(b => b._id !== bookId));
    }
  };

  if (!user) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-white">
        <div className="text-center glass-panel p-8 rounded-3xl border-white/10">
          <Heart size={40} className="text-theme-red-glow mx-auto mb-4" />
          <h2 className="text-lg font-serif">Sign in Required</h2>
          <p className="text-xs text-gray-400 mt-2 mb-6">Log in to view and manage your custom reading wishlist.</p>
          <Link to="/login" className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-theme-red-deep to-theme-purple-royal text-xs font-semibold text-white">Log In</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <h1 className="text-3xl font-serif text-white font-bold flex items-center gap-2">
          <Heart className="text-theme-red-glow fill-theme-red-glow" size={24} />
          <span>My Favorite Wishlist</span>
        </h1>
        <p className="text-xs text-gray-400 mt-1">Saved digital books to read later</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="glass-panel border border-white/5 rounded-2xl h-[450px] animate-pulse" />
          ))}
        </div>
      ) : wishlistBooks.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {wishlistBooks.map(book => (
            <BookCard key={book._id} book={book} onWishlistUpdate={handleWishlistUpdateLocally} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 glass-panel border border-white/5 rounded-3xl">
          <Heart className="text-gray-600 w-12 h-12 mx-auto mb-3" />
          <h3 className="text-lg font-serif text-white">Your Wishlist is Empty</h3>
          <p className="text-xs text-gray-500 mt-1">Add books to wishlist while browsing the catalog</p>
        </div>
      )}
    </div>
  );
};

// ==================================================
// 6. FEEDBACK SYSTEM
// ==================================================
const FeedbackPage = () => {
  const { user, token } = useAuth();
  const [formData, setFormData] = useState({ name: user?.username || '', email: user?.email || '', message: '', rating: 5 });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [myFeedbacks, setMyFeedbacks] = useState([]);
  const [fetchingFeedbacks, setFetchingFeedbacks] = useState(false);

  const fetchMyFeedbacks = async () => {
    if (!token) return;
    setFetchingFeedbacks(true);
    try {
      const res = await fetch(`${API_URL}/feedback/my-feedback`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setMyFeedbacks(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setFetchingFeedbacks(false);
    }
  };

  useEffect(() => {
    fetchMyFeedbacks();
  }, [token]);

  useEffect(() => {
    if (user) {
      setFormData(prev => ({ ...prev, name: user.username, email: user.email }));
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setSubmitted(true);
        setFormData({ name: user?.username || '', email: user?.email || '', message: '', rating: 5 });
        fetchMyFeedbacks();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-12 space-y-8">
      <div className="glass-panel border border-white/5 p-6 sm:p-10 rounded-3xl space-y-6">
        <div className="text-center">
          <MessageSquare className="text-theme-gold-elegant w-10 h-10 mx-auto mb-3" />
          <h1 className="text-2xl font-serif text-white font-bold">Feedback Center</h1>
          <p className="text-xs text-gray-400 mt-1">Help us fine-tune your digital reading platform experience</p>
        </div>

        {submitted ? (
          <div className="p-6 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-center space-y-3">
            <CheckCircle className="text-emerald-400 w-10 h-10 mx-auto" />
            <h3 className="text-md font-bold text-white">Thank You for Your Feedback!</h3>
            <p className="text-xs text-gray-400">Our administrators will review your comments and continue refining the platform.</p>
            <button
              onClick={() => setSubmitted(false)}
              className="mt-2 text-xs text-theme-gold-elegant hover:underline"
            >
              Submit another feedback entry
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-gray-400">Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="p-2.5 text-sm rounded-xl bg-theme-darker/60 border border-white/10 focus:outline-none focus:border-theme-gold-elegant text-white"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-gray-400">Email Address</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="p-2.5 text-sm rounded-xl bg-theme-darker/60 border border-white/10 focus:outline-none focus:border-theme-gold-elegant text-white"
                />
              </div>
            </div>

            {/* Experience Stars selector */}
            <div className="flex flex-col gap-2">
              <label className="text-xs text-gray-400">Platform Experience Rating</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setFormData({ ...formData, rating: star })}
                    className="focus:outline-none transition-transform active:scale-90"
                  >
                    <Star 
                      size={24} 
                      className={star <= formData.rating ? 'fill-theme-gold-elegant text-theme-gold-elegant' : 'text-gray-600'} 
                    />
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-gray-400">Feedback Message</label>
              <textarea
                rows={5}
                required
                placeholder="Write down any feature suggestions or reading experience reviews here..."
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                className="p-2.5 text-sm rounded-xl bg-theme-darker/60 border border-white/10 focus:outline-none focus:border-theme-gold-elegant text-white"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-theme-red-deep to-theme-purple-royal text-xs font-semibold text-white border border-theme-gold-elegant/20 hover:brightness-110 active:scale-[0.99] transition-all"
            >
              {loading ? 'Submitting...' : 'Submit Feedback Details'}
            </button>
          </form>
        )}
      </div>

      {/* Feedback History View */}
      {user && (
        <div className="glass-panel border border-white/5 p-6 sm:p-10 rounded-3xl space-y-6">
          <h2 className="text-xl font-serif text-white font-bold flex items-center gap-2">
            <MessageSquare className="text-theme-gold-elegant" size={20} />
            <span>My Feedback History</span>
          </h2>
          
          {fetchingFeedbacks ? (
            <p className="text-xs text-gray-500 animate-pulse">Loading feedback history...</p>
          ) : myFeedbacks.length > 0 ? (
            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
              {myFeedbacks.map((f, idx) => (
                <div key={f._id || idx} className="p-4 bg-white/5 border border-white/5 rounded-2xl space-y-3">
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex items-center gap-2">
                      <div className="flex gap-0.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            size={12}
                            className={star <= f.rating ? 'fill-theme-gold-elegant text-theme-gold-elegant' : 'text-gray-600'}
                          />
                        ))}
                      </div>
                      <span className="text-[10px] text-gray-500">
                        {new Date(f.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase ${
                      f.resolved 
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/20' 
                        : 'bg-amber-500/20 text-amber-400 border border-amber-500/20'
                    }`}>
                      {f.resolved ? 'Replied' : 'Pending Review'}
                    </span>
                  </div>
                  
                  <p className="text-xs text-gray-300 leading-relaxed italic">
                    "{f.message}"
                  </p>

                  {f.reply && (
                    <div className="p-3 bg-theme-gold-elegant/10 border border-theme-gold-elegant/20 rounded-xl space-y-1">
                      <p className="text-[10px] font-bold text-theme-gold-bright uppercase tracking-wider">Admin Response:</p>
                      <p className="text-xs text-gray-200 font-light">
                        {f.reply}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-gray-500">You haven't submitted any feedback yet.</p>
          )}
        </div>
      )}
    </div>
  );
};

// ==================================================
// 7. REQUEST A BOOK PAGE
// ==================================================
const RequestBookPage = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ bookName: '', authorName: '', category: 'Fiction', language: 'English', notes: '' });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      navigate('/login');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/feedback/request-book`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setSubmitted(true);
        setFormData({ bookName: '', authorName: '', category: 'Fiction', language: 'English', notes: '' });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-white">
        <div className="text-center glass-panel p-8 rounded-3xl border-white/10 max-w-sm">
          <BookOpen size={40} className="text-theme-gold-elegant mx-auto mb-4" />
          <h2 className="text-lg font-serif">Sign in Required</h2>
          <p className="text-xs text-gray-400 mt-2 mb-6">You must log in to submit a book request to the library team.</p>
          <Link to="/login" className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-theme-red-deep to-theme-purple-royal text-xs font-semibold text-white">Log In</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-12 font-sans">
      <div className="glass-panel border border-white/5 p-6 sm:p-10 rounded-3xl space-y-6">
        <div className="text-center">
          <BookMarked className="text-theme-purple-glow w-10 h-10 mx-auto mb-3" />
          <h1 className="text-2xl font-serif text-white font-bold">Request a Book</h1>
          <p className="text-xs text-gray-400 mt-1">Let us know what digital books you want added next to the library shelves</p>
        </div>

        {submitted ? (
          <div className="p-6 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-center space-y-3 animate-fade-in">
            <CheckCircle className="text-emerald-400 w-10 h-10 mx-auto" />
            <h3 className="text-md font-bold text-white">Book Request Lodged Successfully!</h3>
            <p className="text-xs text-gray-400">Our content administrators have received your request and will notify you when it's added.</p>
            <button
              onClick={() => setSubmitted(false)}
              className="mt-2 text-xs text-theme-gold-elegant hover:underline"
            >
              Request another book
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-gray-400">Book Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Swami Vivekananda Biography"
                  value={formData.bookName}
                  onChange={(e) => setFormData({ ...formData, bookName: e.target.value })}
                  className="p-2.5 text-sm rounded-xl bg-theme-darker/60 border border-white/10 focus:outline-none focus:border-theme-gold-elegant text-white"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-gray-400">Author Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Romain Rolland"
                  value={formData.authorName}
                  onChange={(e) => setFormData({ ...formData, authorName: e.target.value })}
                  className="p-2.5 text-sm rounded-xl bg-theme-darker/60 border border-white/10 focus:outline-none focus:border-theme-gold-elegant text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-gray-400">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="p-2.5 text-sm rounded-xl bg-theme-darker/60 border border-white/10 focus:outline-none focus:border-theme-gold-elegant text-white"
                >
                  <option value="Fiction">Fiction</option>
                  <option value="Classic Literature">Classic Literature</option>
                  <option value="Novel">Novel</option>
                  <option value="Biography">Biography</option>
                  <option value="Poetry">Poetry</option>
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-gray-400">Language Preferred</label>
                <select
                  value={formData.language}
                  onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                  className="p-2.5 text-sm rounded-xl bg-theme-darker/60 border border-white/10 focus:outline-none focus:border-theme-gold-elegant text-white"
                >
                  <option value="English">English</option>
                  <option value="Marathi">Marathi</option>
                  <option value="Hindi">Hindi</option>
                </select>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-gray-400">Additional Notes</label>
              <textarea
                rows={3}
                placeholder="Optionally, mention any specific edition, description or source files details..."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="p-2.5 text-sm rounded-xl bg-theme-darker/60 border border-white/10 focus:outline-none focus:border-theme-gold-elegant text-white"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-theme-red-deep to-theme-purple-royal text-xs font-semibold text-white border border-theme-gold-elegant/20 hover:brightness-110 active:scale-[0.99] transition-all"
            >
              {loading ? 'Submitting Request...' : 'Send Request to Admin'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

// ==================================================
// 8. CONTACT US PAGE
// ==================================================
const ContactPage = () => {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setSubmitted(true);
      setFormData({ name: '', email: '', message: '' });
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      
      <div className="text-center space-y-2">
        <h1 className="text-3xl sm:text-4xl font-serif text-white font-bold">Contact Library Team</h1>
        <p className="text-xs text-gray-400 max-w-md mx-auto">Get in touch for support queries, licensing reviews or admin panels authorizations</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Contact Info & Map placeholder */}
        <div className="glass-panel border border-white/5 p-6 sm:p-10 rounded-3xl flex flex-col justify-between gap-8">
          <div className="space-y-6">
            <h3 className="text-lg font-serif text-white font-semibold">Direct Channels</h3>
            
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-theme-gold-elegant">
                <Mail size={18} />
              </div>
              <div>
                <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Email Address</p>
                <a href="mailto:abhigadade98@gmail.com" className="text-sm font-semibold text-white hover:text-theme-gold-elegant transition-colors">
                  abhigadade98@gmail.com
                </a>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-theme-gold-elegant">
                <MapPin size={18} />
              </div>
              <div>
                <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Office Headquarters</p>
                <p className="text-sm font-semibold text-white">Pune, Maharashtra, India</p>
              </div>
            </div>
          </div>

          {/* Map placeholder */}
          <div className="h-44 rounded-2xl border border-white/5 bg-theme-darker/60 relative overflow-hidden flex items-center justify-center">
            <div className="absolute inset-0 bg-gradient-to-tr from-theme-red-deep/10 to-theme-purple-royal/10 pointer-events-none" />
            <div className="text-center z-10">
              <MapPin className="text-theme-gold-elegant w-8 h-8 mx-auto animate-bounce mb-2" />
              <span className="text-[11px] text-gray-400 font-light">Pune Location Map Container</span>
            </div>
          </div>
        </div>

        {/* Contact form */}
        <div className="glass-panel border border-white/5 p-6 sm:p-10 rounded-3xl">
          <h3 className="text-lg font-serif text-white font-semibold mb-6">Send a Quick Message</h3>
          
          {submitted ? (
            <div className="p-6 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-center space-y-3">
              <CheckCircle className="text-emerald-400 w-10 h-10 mx-auto" />
              <p className="text-sm font-semibold text-white">Message Dispatched!</p>
              <p className="text-xs text-gray-400">Our administrators will respond to your queries shortly via email.</p>
              <button onClick={() => setSubmitted(false)} className="text-xs text-theme-gold-elegant hover:underline">Send another email</button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-gray-400">Your Full Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="p-2.5 text-sm rounded-xl bg-theme-darker/60 border border-white/10 focus:outline-none focus:border-theme-gold-elegant text-white"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-gray-400">Your Email Address</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="p-2.5 text-sm rounded-xl bg-theme-darker/60 border border-white/10 focus:outline-none focus:border-theme-gold-elegant text-white"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-gray-400">Message Content</label>
                <textarea
                  rows={4}
                  required
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="p-2.5 text-sm rounded-xl bg-theme-darker/60 border border-white/10 focus:outline-none focus:border-theme-gold-elegant text-white"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-theme-red-deep to-theme-purple-royal text-xs font-semibold text-white border border-theme-gold-elegant/20 hover:brightness-110 active:scale-[0.99] transition-all flex items-center justify-center gap-2"
              >
                <Send size={12} />
                <span>{loading ? 'Sending...' : 'Send Message'}</span>
              </button>
            </form>
          )}
        </div>

      </div>

    </div>
  );
};

// ==================================================
// 9. AUTHENTICATION PAGES (LOGIN / SIGNUP / FORGOT)
// ==================================================
const AuthPage = ({ mode }) => {
  const { login, signup, sendPhoneOtp, verifyPhoneOtp, rememberMe, setRememberMe } = useAuth();
  const navigate = useNavigate();
  
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isForgot, setIsForgot] = useState(false);
  
  // Phone auth states
  const [loginMethod, setLoginMethod] = useState('email'); // 'email' | 'phone'
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [phoneStep, setPhoneStep] = useState(1); // 1: input phone, 2: input OTP, 3: input username (if new user)
  const [otpSentMsg, setOtpSentMsg] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [forgotSubmitted, setForgotSubmitted] = useState(false);

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    try {
      if (mode === 'login') {
        await login(email, password);
      } else {
        await signup(username, email, password);
      }
      navigate('/');
    } catch (err) {
      setErrorMsg(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      if (res.ok) {
        setForgotSubmitted(true);
      } else {
        const d = await res.json();
        setErrorMsg(d.message);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!phoneNumber || phoneNumber.trim().length < 10) {
      setErrorMsg('Please enter a valid 10-digit phone number.');
      return;
    }
    setLoading(true);
    setErrorMsg('');
    setOtpSentMsg('');
    try {
      const res = await sendPhoneOtp(phoneNumber);
      setPhoneStep(2);
      setOtpSentMsg(res.message || 'OTP code sent successfully!');
    } catch (err) {
      setErrorMsg(err.message || 'Failed to send OTP code. Please check your phone number.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otp || otp.trim().length < 6) {
      setErrorMsg('Please enter the 6-digit OTP code.');
      return;
    }
    setLoading(true);
    setErrorMsg('');
    try {
      const result = await verifyPhoneOtp(phoneNumber, otp);
      if (result && result.isNewUser) {
        setPhoneStep(3);
      } else {
        navigate('/');
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to verify OTP code.');
    } finally {
      setLoading(false);
    }
  };

  const handleCompletePhoneSignup = async (e) => {
    e.preventDefault();
    if (!username || !username.trim()) {
      setErrorMsg('Username is required.');
      return;
    }
    setLoading(true);
    setErrorMsg('');
    try {
      await verifyPhoneOtp(phoneNumber, otp, username);
      navigate('/');
    } catch (err) {
      setErrorMsg(err.message || 'Failed to register username.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md glass-panel border border-white/5 p-6 sm:p-10 rounded-3xl space-y-6">
        
        {/* Header */}
        <div className="text-center">
          <BookOpen className="text-theme-gold-elegant w-10 h-10 mx-auto mb-3" />
          <h2 className="text-2xl font-serif text-white font-bold">
            {isForgot 
              ? 'Reset Password' 
              : phoneStep === 3 
                ? 'Choose Username' 
                : mode === 'login' ? 'Sign In' : 'Create Account'}
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            {isForgot
              ? 'Enter email to receive reset code'
              : phoneStep === 3 
                ? 'Complete your registration'
                : mode === 'login' ? 'Access your cinematic library' : 'Unlock your streak achievements'}
          </p>
        </div>

        {errorMsg && (
          <div className="p-3 bg-theme-red-deep/20 border border-theme-red-glow/30 text-theme-red-glow rounded-xl text-xs flex items-center gap-2">
            <AlertTriangle size={14} />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Login vs Signup Tabs */}
        {!isForgot && phoneStep < 3 && (
          <div className="flex bg-white/5 p-1 rounded-2xl border border-white/5">
            <button
              type="button"
              onClick={() => {
                navigate('/login');
                setErrorMsg('');
              }}
              className={`flex-1 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                mode === 'login'
                  ? 'bg-gradient-to-r from-theme-red-deep to-theme-purple-royal text-white border border-theme-gold-elegant/20'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Sign In (Login)
            </button>
            <button
              type="button"
              onClick={() => {
                navigate('/register');
                setErrorMsg('');
              }}
              className={`flex-1 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                mode === 'signup'
                  ? 'bg-gradient-to-r from-theme-red-deep to-theme-purple-royal text-white border border-theme-gold-elegant/20'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Create Account (Signup)
            </button>
          </div>
        )}

        {/* Toggle Login Method */}
        {!isForgot && phoneStep < 3 && (
          <div className="flex bg-white/5 p-1 rounded-2xl border border-white/5">
            <button
              type="button"
              onClick={() => { setLoginMethod('email'); setErrorMsg(''); }}
              className={`flex-1 py-2 rounded-xl text-[11px] font-semibold flex items-center justify-center gap-2 transition-all ${loginMethod === 'email' ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white'}`}
            >
              <Mail size={12} />
              <span>Email Auth</span>
            </button>
            <button
              type="button"
              onClick={() => { setLoginMethod('phone'); setErrorMsg(''); }}
              className={`flex-1 py-2 rounded-xl text-[11px] font-semibold flex items-center justify-center gap-2 transition-all ${loginMethod === 'phone' ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white'}`}
            >
              <Phone size={12} />
              <span>Phone OTP</span>
            </button>
          </div>
        )}

        {isForgot ? (
          forgotSubmitted ? (
            <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-center space-y-2">
              <CheckCircle className="text-emerald-400 w-8 h-8 mx-auto" />
              <p className="text-xs text-gray-300">If registered, a reset email link has been sent. Check your inbox.</p>
              <button onClick={() => setIsForgot(false)} className="text-xs text-theme-gold-elegant hover:underline font-bold mt-2">Back to Login</button>
            </div>
          ) : (
            <form onSubmit={handleForgotSubmit} className="space-y-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-gray-400">Email Address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="p-2.5 text-sm rounded-xl bg-theme-darker/60 border border-white/10 focus:outline-none focus:border-theme-gold-elegant text-white"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-theme-red-deep to-theme-purple-royal text-xs font-semibold text-white border border-theme-gold-elegant/20 hover:brightness-110 transition-all"
              >
                {loading ? 'Sending...' : 'Send Reset Link'}
              </button>
              <div className="text-center">
                <button type="button" onClick={() => setIsForgot(false)} className="text-xs text-gray-400 hover:text-white">
                  Back to Sign In
                </button>
              </div>
            </form>
          )
        ) : loginMethod === 'email' ? (
          <form onSubmit={handleAuthSubmit} className="space-y-4">
            {mode === 'signup' && (
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-gray-400">Username</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. John Doe"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="p-2.5 text-sm rounded-xl bg-theme-darker/60 border border-white/10 focus:outline-none focus:border-theme-gold-elegant text-white"
                />
              </div>
            )}

            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-gray-400">Email Address</label>
              <input
                type="email"
                required
                placeholder="e.g. user@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="p-2.5 text-sm rounded-xl bg-theme-darker/60 border border-white/10 focus:outline-none focus:border-theme-gold-elegant text-white"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-gray-400">Password</label>
              <input
                type="password"
                required
                placeholder="e.g. Password@123 (min 8 chars)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="p-2.5 text-sm rounded-xl bg-theme-darker/60 border border-white/10 focus:outline-none focus:border-theme-gold-elegant text-white"
              />
            </div>

            {/* Remember me & Forgot Password links */}
            <div className="flex items-center justify-between text-xs pt-1">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="remember"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="accent-theme-gold-elegant"
                />
                <label htmlFor="remember" className="text-gray-400 cursor-pointer select-none">Remember Me</label>
              </div>
              {mode === 'login' && (
                <button type="button" onClick={() => setIsForgot(true)} className="text-theme-gold-elegant hover:underline">
                  Forgot Password?
                </button>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-theme-red-deep to-theme-purple-royal text-xs font-semibold text-white border border-theme-gold-elegant/20 hover:brightness-110 active:scale-[0.99] transition-all"
            >
              {loading ? 'Authenticating...' : mode === 'login' ? 'Sign In' : 'Sign Up'}
            </button>

            <div className="text-center text-xs text-gray-400 pt-2 border-t border-white/5">
              {mode === 'login' ? (
                <span>New to Your Books Reader? <Link to="/register" className="text-theme-gold-elegant hover:underline font-bold">Create Account</Link></span>
              ) : (
                <span>Already have an account? <Link to="/login" className="text-theme-gold-elegant hover:underline font-bold">Sign In</Link></span>
              )}
            </div>
          </form>
        ) : (
          /* Phone login/signup UI */
          <div className="space-y-4">
            {phoneStep === 1 && (
              <form onSubmit={handleSendOtp} className="space-y-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-gray-400">Phone Number</label>
                  <div className="relative">
                    <span className="absolute left-3 top-3 text-sm text-gray-400 font-semibold">+91</span>
                    <input
                      type="tel"
                      required
                      pattern="[0-9]{10}"
                      placeholder="Enter 10-digit number"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                      className="w-full pl-12 pr-3 py-2.5 text-sm rounded-xl bg-theme-darker/60 border border-white/10 focus:outline-none focus:border-theme-gold-elegant text-white"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-theme-red-deep to-theme-purple-royal text-xs font-semibold text-white border border-theme-gold-elegant/20 hover:brightness-110 active:scale-[0.99] transition-all"
                >
                  {loading ? 'Sending Code...' : 'Send Verification Code'}
                </button>
              </form>
            )}

            {phoneStep === 2 && (
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                {otpSentMsg && (
                  <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl text-[11px] text-center space-y-1">
                    <p className="font-semibold">{otpSentMsg}</p>
                    <p className="text-gray-400 text-[10px]">Simply type the code to proceed.</p>
                  </div>
                )}

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-gray-400">Enter OTP Code</label>
                  <input
                    type="text"
                    required
                    pattern="[0-9]{6}"
                    maxLength="6"
                    placeholder="Enter 6-digit OTP"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    className="p-2.5 text-center text-sm font-bold tracking-[0.5em] rounded-xl bg-theme-darker/60 border border-white/10 focus:outline-none focus:border-theme-gold-elegant text-white"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-theme-red-deep to-theme-purple-royal text-xs font-semibold text-white border border-theme-gold-elegant/20 hover:brightness-110 active:scale-[0.99] transition-all"
                >
                  {loading ? 'Verifying OTP...' : 'Verify Code & Sign In'}
                </button>

                <div className="flex justify-between items-center text-xs text-gray-400 pt-2">
                  <button
                    type="button"
                    onClick={() => { setPhoneStep(1); setOtp(''); }}
                    className="text-theme-gold-elegant hover:underline"
                  >
                    Change Phone Number
                  </button>
                  <button
                    type="button"
                    onClick={handleSendOtp}
                    disabled={loading}
                    className="text-theme-gold-elegant hover:underline"
                  >
                    Resend OTP
                  </button>
                </div>
              </form>
            )}

            {phoneStep === 3 && (
              <form onSubmit={handleCompletePhoneSignup} className="space-y-4">
                <div className="p-3 bg-theme-gold-elegant/10 border border-theme-gold-elegant/20 text-theme-gold-bright rounded-xl text-[11px] text-center">
                  Phone verified! Since you are logging in for the first time, please enter a username to complete your profile.
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-gray-400">Username</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. abhi27"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="p-2.5 text-sm rounded-xl bg-theme-darker/60 border border-white/10 focus:outline-none focus:border-theme-gold-elegant text-white"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-theme-red-deep to-theme-purple-royal text-xs font-semibold text-white border border-theme-gold-elegant/20 hover:brightness-110 active:scale-[0.99] transition-all"
                >
                  {loading ? 'Completing Signup...' : 'Complete Sign Up'}
                </button>
              </form>
            )}

            {phoneStep < 3 && (
              <div className="text-center text-xs text-gray-400 pt-2 border-t border-white/5">
                {mode === 'login' ? (
                  <span>New to Your Books Reader? <Link to="/register" className="text-theme-gold-elegant hover:underline font-bold">Create Account</Link></span>
                ) : (
                  <span>Already have an account? <Link to="/login" className="text-theme-gold-elegant hover:underline font-bold">Sign In</Link></span>
                )}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};

// ==================================================
// 10. ERROR PAGE (404 NOT FOUND)
// ==================================================
const ErrorPage = () => {
  return (
    <div className="min-h-[70vh] flex items-center justify-center text-white">
      <div className="text-center glass-panel p-10 rounded-3xl border-theme-red-deep/20 max-w-sm space-y-4">
        <AlertTriangle size={48} className="text-theme-gold-elegant mx-auto" />
        <h2 className="text-2xl font-serif">Page Not Found</h2>
        <p className="text-xs text-gray-400">The library corridor you're looking for doesn't exist.</p>
        <Link to="/" className="inline-block px-6 py-2.5 rounded-xl bg-gradient-to-r from-theme-red-deep to-theme-purple-royal text-xs font-semibold text-white border border-theme-gold-elegant/20">Go Home</Link>
      </div>
    </div>
  );
};

// ==================================================
// MAIN APP ROUTING WRAPPER
// ==================================================
const AppContent = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex flex-col min-h-screen relative z-10">
      <Navbar onOpenSidebar={() => setSidebarOpen(true)} />
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      {/* Dynamic Animated Particles Background Layer */}
      <ParticlesBackground />

      {/* Main Pages Content routing body */}
      <div className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/books" element={<BooksCatalog />} />
          <Route path="/books/:id" element={<BooksCatalog />} /> {/* Reuse or direct details */}
          <Route path="/marathi" element={<MarathiBooks />} />
          <Route path="/profile" element={<UserProfile />} />
          <Route path="/wishlist" element={<WishlistPage />} />
          <Route path="/feedback" element={<FeedbackPage />} />
          <Route path="/request-book" element={<RequestBookPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/login" element={<AuthPage mode="login" />} />
          <Route path="/register" element={<AuthPage mode="signup" />} />
          <Route path="/reader/:id" element={<Reader />} />
          <Route path="*" element={<ErrorPage />} />
        </Routes>
      </div>

      {/* Footer */}
      <footer className="glass-panel border-t border-white/5 py-8 mt-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center sm:flex sm:justify-between sm:items-center space-y-4 sm:space-y-0">
          <p className="text-xs text-gray-500">
            &copy; {new Date().getFullYear()} Your Books Reader. Luxury Reading Experience. All rights reserved.
          </p>
          <p className="text-[10px] text-gray-600">
            Designed for literary preservation &middot; English & मराठी साहित्य
          </p>
        </div>
      </footer>
    </div>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
};

export default App;
