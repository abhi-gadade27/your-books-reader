import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  User, Edit2, Play, History, Bookmark, Heart, 
  BookOpen, Bell, MessageSquare, PlusCircle, Settings, LogOut, X, Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Sidebar = ({ isOpen, onClose }) => {
  const { user, logout, notifications } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { name: 'My Profile', path: '/profile', icon: User },
    { name: 'Edit Profile', path: '/profile?edit=true', icon: Edit2 },
    { name: 'Resume Reading', path: '/resume', icon: Play },
    { name: 'Reading History', path: '/profile#history', icon: History },
    { name: 'Saved Books / History', path: '/profile#saved', icon: Bookmark },
    { name: 'My Wishlist', path: '/wishlist', icon: Heart },
    { name: 'Marathi Books', path: '/marathi', icon: BookOpen },
    { name: 'Notifications', path: '/profile#notifications', icon: Bell, badge: notifications.length },
    { name: 'Feedback', path: '/feedback', icon: MessageSquare },
    { name: 'Request a Book', path: '/request-book', icon: PlusCircle },
    { name: 'Settings', path: '/profile#settings', icon: Settings },
  ];

  const handleLogoutClick = () => {
    logout();
    onClose();
    navigate('/');
  };

  const handleItemClick = (path) => {
    onClose();
    navigate(path);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
          />

          {/* Sidebar Drawer */}
          <motion.aside
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed bottom-0 top-0 left-0 z-50 w-72 max-w-full glass-panel border-r border-white/10 shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="p-5 border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded bg-gradient-to-tr from-theme-red-deep to-theme-purple-royal flex items-center justify-center border border-theme-gold-elegant/30">
                  <BookOpen className="text-theme-gold-bright w-4.5 h-4.5" />
                </div>
                <span className="text-md font-bold font-serif text-gradient-gold">
                  Your Books Reader
                </span>
              </div>
              <button 
                onClick={onClose}
                className="text-gray-400 hover:text-white p-1 rounded-full hover:bg-white/5 transition-colors"
                aria-label="Close Sidebar"
              >
                <X size={20} />
              </button>
            </div>

            {/* Profile Brief Info */}
            {user ? (
              <div className="p-5 border-b border-white/5 flex items-center gap-3">
                <img
                  src={user.profileImage}
                  alt={user.username}
                  className="w-12 h-12 rounded-full border border-theme-gold-elegant/40 object-cover"
                />
                <div className="overflow-hidden">
                  <h4 className="text-sm font-semibold text-white truncate">{user.username}</h4>
                  <p className="text-xs text-gray-400 truncate">{user.email}</p>
                  
                  {user.role === 'admin' && (
                    <span className="inline-flex items-center gap-1 text-[9px] text-theme-gold-bright font-bold mt-1 uppercase">
                      <Sparkles size={8} /> Admin Mode
                    </span>
                  )}
                </div>
              </div>
            ) : (
              <div className="p-5 border-b border-white/5">
                <p className="text-xs text-gray-400">Join our cinematic library to start reading.</p>
                <button
                  onClick={() => { onClose(); navigate('/login'); }}
                  className="w-full mt-3 py-2 text-center rounded-xl bg-gradient-to-r from-theme-red-deep to-theme-purple-royal border border-theme-gold-elegant/20 text-xs font-medium text-white hover:brightness-110 transition-all"
                >
                  Sign In / Create Account
                </button>
              </div>
            )}

            {/* Menu Items */}
            <div className="flex-1 overflow-y-auto p-4 space-y-1">
              {menuItems.map((item, idx) => {
                const IconComponent = item.icon;
                const isActive = location.pathname + location.hash === item.path || 
                                 (location.pathname === '/profile' && item.path.startsWith('/profile#'));
                
                return (
                  <button
                    key={idx}
                    onClick={() => handleItemClick(item.path)}
                    className={`w-full flex items-center justify-between p-2.5 rounded-xl text-sm font-medium transition-all group ${
                      isActive
                        ? 'bg-gradient-to-r from-theme-red-deep/20 to-theme-purple-royal/20 border border-theme-gold-elegant/15 text-theme-gold-elegant'
                        : 'text-gray-300 hover:text-white hover:bg-white/5 border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <IconComponent size={18} className={isActive ? 'text-theme-gold-elegant' : 'text-gray-400 group-hover:text-white transition-colors'} />
                      <span className="text-xs sm:text-sm">{item.name}</span>
                    </div>

                    {item.badge ? (
                      <span className="bg-theme-red-glow/20 text-theme-red-glow text-[10px] px-2 py-0.5 rounded-full border border-theme-red-glow/20">
                        {item.badge}
                      </span>
                    ) : null}
                  </button>
                );
              })}
            </div>

            {/* Logout Footer */}
            {user && (
              <div className="p-4 border-t border-white/5">
                <button
                  onClick={handleLogoutClick}
                  className="w-full flex items-center justify-center gap-2 p-2.5 rounded-xl text-sm font-medium text-theme-red-glow hover:bg-theme-red-deep/10 border border-transparent hover:border-theme-red-deep/20 transition-all"
                >
                  <LogOut size={18} />
                  <span>Log Out</span>
                </button>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
};

export default Sidebar;
