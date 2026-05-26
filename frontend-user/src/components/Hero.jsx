import React from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Compass, ArrowRight, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Hero = ({ onExploreClick }) => {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-[85vh] flex items-center justify-center overflow-hidden py-16 sm:py-24">
      {/* Cinematic Ambient Glow Background */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-[350px] h-[350px] bg-theme-red-deep/20 rounded-full blur-[100px] animate-pulse-glow" style={{ animationDuration: '8s' }} />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-theme-purple-royal/20 rounded-full blur-[120px] animate-pulse-glow" style={{ animationDuration: '10s' }} />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        
        {/* Animated Badge */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-panel border border-theme-gold-elegant/20 text-theme-gold-bright text-xs sm:text-sm font-semibold mb-8 shadow-gold-glow/20"
        >
          <Sparkles size={14} className="animate-spin-slow text-theme-gold-elegant" />
          <span>A New Era of Digital Reading</span>
        </motion.div>

        {/* Cinematic Premium Slogan */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-4xl sm:text-6xl md:text-7xl font-bold font-serif leading-tight tracking-tight text-white mb-6"
        >
          Read Beyond Limits
          <span className="block mt-2 font-sans font-light text-gradient-gold text-2xl sm:text-4xl md:text-5xl tracking-normal">
            Discover Stories That Stay Forever
          </span>
        </motion.h1>

        {/* Short description */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.4 }}
          className="max-w-2xl mx-auto text-gray-400 text-sm sm:text-md md:text-lg mb-10 leading-relaxed font-light"
        >
          Welcome to <span className="text-theme-gold-elegant font-medium">Your Books Reader</span>. Immerse yourself in a luxurious reading experience with cinematic transitions, auto-saving reading metrics, and a hand-curated library of English & Marathi masterpieces.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6"
        >
          {/* Start Reading Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/books')}
            className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-theme-red-deep via-[#6e0147] to-theme-purple-royal border border-theme-gold-elegant/40 text-white font-medium shadow-red-glow/30 hover:shadow-gold-glow flex items-center justify-center gap-3 group transition-all"
          >
            <BookOpen size={18} className="text-theme-gold-bright" />
            <span>Start Reading</span>
            <ArrowRight size={16} className="group-hover:translate-x-1.5 transition-transform" />
          </motion.button>

          {/* Explore Books Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onExploreClick}
            className="w-full sm:w-auto px-8 py-4 rounded-xl glass-panel border border-white/10 text-gray-300 hover:text-white hover:border-theme-purple-bright/40 shadow-glass-card hover:shadow-purple-glow/20 flex items-center justify-center gap-3 transition-all"
          >
            <Compass size={18} />
            <span>Explore Books</span>
          </motion.button>
        </motion.div>

        {/* Floating Ambient Book Graphic */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 50 }}
          animate={{ opacity: 0.2, scale: 1, y: 0 }}
          transition={{ duration: 1.2, delay: 0.6 }}
          className="absolute left-1/2 -bottom-24 -translate-x-1/2 pointer-events-none w-[500px] h-[300px] rounded-full bg-gradient-to-t from-theme-gold-elegant/10 to-transparent blur-3xl z-0"
        />

      </div>
    </div>
  );
};

export default Hero;
