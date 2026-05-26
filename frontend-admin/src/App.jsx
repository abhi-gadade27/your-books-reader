import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth, API_URL } from './context/AuthContext';
import ParticlesBackground from './components/ParticlesBackground';
import AdminDashboard from './components/AdminDashboard';
import { BookOpen, ShieldCheck, AlertTriangle, Key, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// ==================================================
// ADMIN LOGIN SCREEN
// ==================================================
const AdminLogin = () => {
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Redirect to dashboard if already logged in as admin
  useEffect(() => {
    if (user && user.role === 'admin') {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    try {
      const loggedUser = await login(email, password);
      if (loggedUser.role !== 'admin') {
        throw new Error('Access denied. Admin account required.');
      }
      navigate('/dashboard');
    } catch (err) {
      setErrorMsg(err.message || 'Invalid admin credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 relative z-10">
      <div className="w-full max-w-md glass-panel border border-white/5 p-6 sm:p-10 rounded-3xl space-y-6">
        
        {/* Header */}
        <div className="text-center">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-theme-red-deep to-theme-purple-royal border border-theme-gold-elegant/30 flex items-center justify-center mx-auto mb-4">
            <ShieldCheck className="text-theme-gold-bright w-6 h-6" />
          </div>
          <h2 className="text-2xl font-serif text-white font-bold tracking-wide">
            Admin Portal
          </h2>
          <p className="text-xs text-gray-400 mt-1">
            Access secure database dashboards & metrics
          </p>
        </div>

        {errorMsg && (
          <div className="p-3 bg-theme-red-deep/20 border border-theme-red-glow/30 text-theme-red-glow rounded-xl text-xs flex items-center gap-2">
            <AlertTriangle size={14} />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-gray-400">Admin Username / ID</label>
            <input
              type="text"
              required
              placeholder="e.g. abhibook@0417"
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
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="p-2.5 text-sm rounded-xl bg-theme-darker/60 border border-white/10 focus:outline-none focus:border-theme-gold-elegant text-white"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-theme-red-deep to-theme-purple-royal text-xs font-semibold text-white border border-theme-gold-elegant/20 hover:brightness-110 active:scale-[0.99] transition-all flex items-center justify-center gap-2"
          >
            <Key size={14} />
            <span>{loading ? 'Verifying...' : 'Sign In as Admin'}</span>
          </button>
        </form>

      </div>
    </div>
  );
};

// ==================================================
// SECURED ROUTE WRAPPER
// ==================================================
const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) return null;
  if (!user || user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }
  
  return children;
};

// ==================================================
// ADMIN CONSOLE PORTAL WRAPPER
// ==================================================
const AdminConsole = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="flex flex-col min-h-screen relative z-10">
      
      {/* Admin Top Sticky Bar */}
      <header className="sticky top-0 z-40 w-full glass-panel border-b border-white/5 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between gap-4">
            
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-theme-red-deep to-theme-purple-royal border border-theme-gold-elegant/30 flex items-center justify-center">
                <ShieldCheck className="text-theme-gold-bright w-4.5 h-4.5" />
              </div>
              <span className="text-sm font-bold font-serif tracking-wider text-gradient-gold">
                Your Books Reader &middot; Console
              </span>
            </div>

            {/* Logout */}
            <div className="flex items-center gap-3">
              <span className="text-xs text-gray-400 font-light hidden sm:inline">
                Console Operator: <span className="text-theme-gold-bright font-bold">{user?.username}</span>
              </span>
              <button
                onClick={() => {
                  logout();
                  navigate('/');
                }}
                className="px-3 py-1.5 rounded-lg border border-theme-red-glow/20 text-theme-red-glow hover:bg-theme-red-deep/10 text-xs font-semibold flex items-center gap-1.5 transition-all"
              >
                <LogOut size={13} />
                <span>Exit Console</span>
              </button>
            </div>

          </div>
        </div>
      </header>

      {/* Main Admin dashboard view */}
      <main className="flex-1">
        <AdminDashboard />
      </main>

      {/* Footer */}
      <footer className="glass-panel border-t border-white/5 py-6 mt-12 text-center text-[10px] text-gray-500">
        &copy; {new Date().getFullYear()} Your Books Reader &bull; Secure Administrator Portal
      </footer>
    </div>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <div className="relative min-h-screen">
          {/* Ambient Particles */}
          <ParticlesBackground />
          
          <Routes>
            <Route path="/" element={<AdminLogin />} />
            <Route 
              path="/dashboard" 
              element={
                <AdminRoute>
                  <AdminConsole />
                </AdminRoute>
              } 
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
};

export default App;
