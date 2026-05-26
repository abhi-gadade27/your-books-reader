import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Star, Share2, BookOpen } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth, API_URL } from '../context/AuthContext';

const BookCard = ({ book, onWishlistUpdate }) => {
  const { user, token, updateUserFieldsLocally } = useAuth();
  const navigate = useNavigate();
  const cardRef = useRef(null);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [isWishlisted, setIsWishlisted] = useState(
    user?.wishlist?.includes(book._id) || false
  );
  const [loadingWishlist, setLoadingWishlist] = useState(false);

  // 3D Tilt Hover Effect
  const handleMouseMove = (e) => {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left - width / 2;
    const mouseY = e.clientY - rect.top - height / 2;
    
    // Limits rotation to +/- 10 degrees
    const rX = -(mouseY / height) * 12;
    const rY = (mouseX / width) * 12;
    
    setRotateX(rX);
    setRotateY(rY);
  };

  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
  };

  const handleWishlistClick = async (e) => {
    e.stopPropagation();
    if (!user) {
      navigate('/login');
      return;
    }
    
    setLoadingWishlist(true);
    try {
      const res = await fetch(`${API_URL}/books/${book._id}/wishlist`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setIsWishlisted(data.isWishlisted);
        updateUserFieldsLocally({ wishlist: data.wishlist });
        if (onWishlistUpdate) onWishlistUpdate(book._id, data.isWishlisted);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingWishlist(false);
    }
  };

  const handleShareClick = (e) => {
    e.stopPropagation();
    // Simulate share or copy URL
    navigator.clipboard.writeText(`${window.location.origin}/books/${book._id}`);
    alert('Book link copied to clipboard!');
  };

  const handleReadClick = (e) => {
    e.stopPropagation();
    if (!user) {
      navigate('/login');
      return;
    }
    navigate(`/reader/${book._id}`);
  };

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={() => navigate(`/books/${book._id}`)}
      style={{
        transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
        transformStyle: 'preserve-3d',
        transition: 'transform 0.1s ease-out'
      }}
      whileHover={{ y: -8 }}
      className="cursor-pointer rounded-2xl glass-panel-glow-purple border border-white/10 p-4 flex flex-col justify-between h-[450px] relative overflow-hidden group hover:border-theme-gold-elegant/30 hover:shadow-purple-glow/20 transition-all duration-300"
    >
      {/* Background Subtle Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-theme-darker via-transparent to-transparent opacity-60 pointer-events-none" />

      {/* Book Cover Container */}
      <div className="relative aspect-[3/4] w-full rounded-xl overflow-hidden shadow-lg border border-white/5 bg-theme-dark group-hover:border-theme-gold-elegant/20 transition-colors">
        <img
          src={book.coverImage}
          alt={book.title}
          loading="lazy"
          className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
        />
        
        {/* Language Badge */}
        <span className="absolute top-2.5 left-2.5 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-black/60 border border-white/10 text-theme-gold-elegant">
          {book.language}
        </span>

        {/* Featured Tag */}
        {book.isFeatured && (
          <span className="absolute top-2.5 right-2.5 text-[9px] font-bold px-2 py-0.5 rounded-full bg-theme-gold-elegant/80 text-theme-darker tracking-wider uppercase">
            Featured
          </span>
        )}
      </div>

      {/* Book details */}
      <div className="mt-3 flex-1 flex flex-col justify-between">
        <div>
          {/* Category & Stars */}
          <div className="flex items-center justify-between gap-2 mb-1">
            <span className="text-[10px] text-theme-gold-elegant uppercase font-bold tracking-wider">
              {book.category}
            </span>
            <div className="flex items-center gap-1">
              <Star size={11} className="fill-theme-gold-elegant text-theme-gold-elegant" />
              <span className="text-xs font-semibold text-gray-300">{book.rating || 'N/A'}</span>
            </div>
          </div>

          {/* Title & Author */}
          <h3 className="text-sm font-bold text-white line-clamp-1 font-serif group-hover:text-theme-gold-bright transition-colors">
            {book.title}
          </h3>
          <p className="text-xs text-gray-400 font-light mt-0.5 line-clamp-1">
            By {book.author}
          </p>

          {/* Description */}
          <p className="text-[11px] text-gray-500 line-clamp-2 mt-1.5 font-light leading-relaxed">
            {book.description}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between gap-2 mt-4 pt-3 border-t border-white/5 relative z-10">
          {/* Read button */}
          <button
            onClick={handleReadClick}
            className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-gradient-to-r from-theme-red-deep to-[#4b0082] text-[11px] text-white font-medium hover:brightness-110 transition-all border border-theme-gold-elegant/10"
          >
            <BookOpen size={12} className="text-theme-gold-elegant" />
            <span>Read</span>
          </button>

          {/* Wishlist Button */}
          <button
            onClick={handleWishlistClick}
            disabled={loadingWishlist}
            className={`p-1.5 rounded-lg border transition-all ${
              isWishlisted
                ? 'bg-theme-red-deep/20 border-theme-red-glow text-theme-red-glow'
                : 'border-white/10 text-gray-400 hover:text-white hover:bg-white/5'
            }`}
            aria-label="Wishlist Book"
          >
            <Heart size={14} className={isWishlisted ? 'fill-theme-red-glow' : ''} />
          </button>

          {/* Share Button */}
          <button
            onClick={handleShareClick}
            className="p-1.5 rounded-lg border border-white/10 text-gray-400 hover:text-white hover:bg-white/5 transition-all"
            aria-label="Share Book Link"
          >
            <Share2 size={14} />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default BookCard;
