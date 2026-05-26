import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth, API_URL } from '../context/AuthContext';
import { 
  Menu, X, Search, Heart, User, LogOut, BookOpen, 
  Settings, Award, Sparkles, MessageSquare, PlusCircle, Phone
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = ({ onOpenSidebar }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const suggestionRef = useRef(null);
  const profileDropdownRef = useRef(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (suggestionRef.current && !suggestionRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(e.target)) {
        setShowProfileDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // Fetch search suggestions
  useEffect(() => {
    const delayDebounce = setTimeout(async () => {
      if (searchQuery.trim().length < 2) {
        setSuggestions([]);
        return;
      }
      try {
        const res = await fetch(`${API_URL}/books?search=${searchQuery}`);
        if (res.ok) {
          const books = await res.json();
          setSuggestions(books.slice(0, 5));
        }
      } catch (err) {
        console.error(err);
      }
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [searchQuery]);

  const handleSuggestionClick = (bookId) => {
    setSearchQuery('');
    setSuggestions([]);
    setShowSuggestions(false);
    navigate(`/books/${bookId}`);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/books?search=${searchQuery}`);
      setShowSuggestions(false);
    }
  };

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Books', path: '/books' },
    { name: 'Marathi Books', path: '/marathi' },
    { name: 'Wishlist', path: '/wishlist' },
    { name: 'Feedback', path: '/feedback' },
    { name: 'Request a Book', path: '/request-book' },
    { name: 'Contact Us', path: '/contact' }
  ];

  return (
    <nav className="sticky top-0 z-40 w-full glass-panel border-b border-white/5 backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          
          {/* Logo & Sidebar Trigger */}
          <div className="flex items-center gap-3">
            <button 
              onClick={onOpenSidebar} 
              className="text-gray-400 hover:text-theme-gold-elegant p-1 transition-colors md:hidden"
              aria-label="Open Sidebar Menu"
            >
              <Menu size={24} />
            </button>

            <Link to="/" className="flex items-center gap-2 group">
              <motion.div
                whileHover={{ rotate: 360, scale: 1.1 }}
                transition={{ duration: 0.6 }}
                className="flex items-center justify-center w-9 h-9 rounded-lg bg-gradient-to-br from-theme-red-deep to-theme-purple-royal border border-theme-gold-elegant/30"
              >
                <BookOpen className="text-theme-gold-bright w-5 h-5" />
              </motion.div>
              <span className="hidden sm:block text-lg font-bold font-serif tracking-wider text-gradient-gold">
                Your Books Reader
              </span>
            </Link>
          </div>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center space-x-1 lg:space-x-4">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-300 ${
                    isActive
                      ? 'bg-gradient-to-r from-theme-red-deep/30 to-theme-purple-royal/30 border border-theme-gold-elegant/20 text-theme-gold-elegant'
                      : 'text-gray-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </div>

          {/* Search bar & Auth section */}
          <div className="flex items-center gap-3 flex-1 md:flex-initial max-w-xs md:max-w-none justify-end">
            {/* Live Search Bar */}
            <div ref={suggestionRef} className="relative w-full max-w-[180px] sm:max-w-[240px] md:max-w-[200px] lg:max-w-[240px]">
              <form onSubmit={handleSearchSubmit}>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search book or author..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setShowSuggestions(true);
                    }}
                    onFocus={() => setShowSuggestions(true)}
                    className="w-full pl-9 pr-4 py-1.5 rounded-full bg-theme-darker/60 border border-white/10 text-sm focus:outline-none focus:border-theme-gold-elegant/40 focus:ring-1 focus:ring-theme-gold-elegant/20 transition-all text-white placeholder-gray-500"
                  />
                  <Search size={16} className="absolute left-3 top-2.5 text-gray-500" />
                </div>
              </form>

              {/* suggestions auto-dropdown */}
              <AnimatePresence>
                {showSuggestions && suggestions.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute top-12 left-0 w-full rounded-xl glass-panel border border-white/10 p-2 shadow-2xl z-50 max-h-60 overflow-y-auto"
                  >
                    {suggestions.map((book) => (
                      <button
                        key={book._id}
                        onClick={() => handleSuggestionClick(book._id)}
                        className="w-full text-left p-2 rounded-lg hover:bg-white/5 flex gap-3 items-center group transition-colors"
                      >
                        <img 
                          src={book.coverImage} 
                          alt={book.title} 
                          className="w-8 h-10 object-cover rounded shadow"
                        />
                        <div className="overflow-hidden">
                          <p className="text-xs font-semibold text-white truncate group-hover:text-theme-gold-elegant transition-colors">
                            {book.title}
                          </p>
                          <p className="text-[10px] text-gray-400 truncate">
                            {book.author}
                          </p>
                        </div>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Profile Dropdown or Login Button */}
            {user ? (
              <div ref={profileDropdownRef} className="relative">
                <button
                  onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                  className="flex items-center gap-2 p-1 rounded-full hover:bg-white/5 border border-white/5 transition-all focus:outline-none"
                  aria-label="User profile menu"
                >
                  <img
                    src={user.profileImage}
                    alt={user.username}
                    className="w-8 h-8 rounded-full border border-theme-gold-elegant/40 object-cover"
                  />
                </button>

                <AnimatePresence>
                  {showProfileDropdown && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: 10 }}
                      className="absolute right-0 mt-3 w-56 rounded-2xl glass-panel border border-white/10 p-2 shadow-2xl z-50"
                    >
                      <div className="px-3 py-2 border-b border-white/5 mb-1 text-left">
                        <p className="text-sm font-semibold text-white truncate">{user.username}</p>
                        <p className="text-[11px] text-gray-400 truncate mt-0.5">{user.email}</p>
                        <span className={`inline-block text-[9px] font-bold px-2 py-0.5 rounded-full mt-2 capitalize ${
                          user.role === 'admin' 
                            ? 'bg-theme-gold-elegant/20 text-theme-gold-bright border border-theme-gold-elegant/30' 
                            : 'bg-theme-purple-bright/20 text-theme-purple-glow border border-theme-purple-royal/30'
                        }`}>
                          {user.role} Account
                        </span>
                      </div>



                      <Link
                        to="/profile"
                        onClick={() => setShowProfileDropdown(false)}
                        className="flex w-full items-center gap-2 px-3 py-2 rounded-xl text-sm text-gray-300 hover:bg-white/5 transition-colors"
                      >
                        <User size={16} />
                        <span>My Profile</span>
                      </Link>

                      <Link
                        to="/wishlist"
                        onClick={() => setShowProfileDropdown(false)}
                        className="flex w-full items-center gap-2 px-3 py-2 rounded-xl text-sm text-gray-300 hover:bg-white/5 transition-colors"
                      >
                        <Heart size={16} />
                        <span>My Wishlist</span>
                      </Link>

                      <button
                        onClick={() => {
                          setShowProfileDropdown(false);
                          logout();
                          navigate('/');
                        }}
                        className="flex w-full items-center gap-2 px-3 py-2 rounded-xl text-sm text-theme-red-glow hover:bg-theme-red-deep/10 transition-colors border-t border-white/5 mt-1"
                      >
                        <LogOut size={16} />
                        <span>Sign Out</span>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Link
                to="/login"
                className="px-4 py-1.5 rounded-full bg-gradient-to-r from-theme-red-deep to-theme-purple-royal border border-theme-gold-elegant/30 text-white font-medium hover:brightness-110 active:scale-95 transition-all text-xs sm:text-sm"
              >
                Log In
              </Link>
            )}

            {/* Mobile Hamburger menu button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-400 hover:text-white p-1 transition-colors md:hidden focus:outline-none"
              aria-label="Toggle Mobile Navigation Menu"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

          </div>

        </div>
      </div>

      {/* Mobile Nav Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden glass-panel border-t border-white/5 backdrop-blur-2xl"
          >
            <div className="px-2 pt-2 pb-4 space-y-1">
              {navLinks.map((link) => {
                const isActive = location.pathname === link.path;
                return (
                  <Link
                    key={link.name}
                    to={link.path}
                    onClick={() => setIsOpen(false)}
                    className={`block px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-gradient-to-r from-theme-red-deep/20 to-theme-purple-royal/20 border border-theme-gold-elegant/10 text-theme-gold-elegant'
                        : 'text-gray-300 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {link.name}
                  </Link>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
