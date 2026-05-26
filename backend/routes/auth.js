import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '../config/db.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your_books_reader_jwt_secret_key_123';

// Middleware to verify JWT token
export const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    
    const user = await db.Users.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ message: 'User not found, authorization denied' });
    }
    
    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

// Middleware to check if user is Admin
export const adminMiddleware = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Access denied. Admin role required.' });
  }
};

// @route   POST api/auth/register
// @desc    Register a user
router.post('/register', async (req, res) => {
  const { username, email, password } = req.body;
  
  try {
    if (!username || !email || !password) {
      return res.status(400).json({ message: 'Please enter all fields' });
    }

    const userExists = await db.Users.findOne({ email: email.toLowerCase() });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await db.Users.create({
      username,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: 'user', // Default role
      profileImage: `https://api.dicebear.com/7.x/adventurer/svg?seed=${username}`,
      wishlist: [],
      readingHistory: [],
      readingStreak: 0,
      lastReadDate: '',
      favoriteCategories: [],
      badges: ['Novice Reader']
    });

    const token = jwt.sign({ id: newUser._id, role: newUser.role }, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      token,
      user: {
        id: newUser._id,
        username: newUser.username,
        email: newUser.email,
        role: newUser.role,
        profileImage: newUser.profileImage,
        readingHistory: newUser.readingHistory,
        wishlist: newUser.wishlist,
        readingStreak: newUser.readingStreak,
        badges: newUser.badges
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error during registration', error: error.message });
  }
});

// @route   POST api/auth/login
// @desc    Authenticate user & get token
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({ message: 'Please enter all fields' });
    }

    // Default Admin quick-login logic
    if (email.toLowerCase() === 'admin' || email.toLowerCase() === 'admin@yourbooksreader.com') {
      if (password === 'Admin@123') {
        // Ensure admin user exists in DB
        let adminUser = await db.Users.findOne({ role: 'admin' });
        if (!adminUser) {
          const salt = await bcrypt.genSalt(10);
          const hashedPassword = await bcrypt.hash('Admin@123', salt);
          adminUser = await db.Users.create({
            username: 'Administrator',
            email: 'admin@yourbooksreader.com',
            password: hashedPassword,
            role: 'admin',
            profileImage: 'https://api.dicebear.com/7.x/bottts/svg?seed=admin',
            wishlist: [],
            readingHistory: [],
            badges: ['Grandmaster'],
            readingStreak: 0
          });
        }
        
        const token = jwt.sign({ id: adminUser._id, role: 'admin' }, JWT_SECRET, { expiresIn: '7d' });
        return res.json({
          token,
          user: {
            id: adminUser._id,
            username: adminUser.username,
            email: adminUser.email,
            role: 'admin',
            profileImage: adminUser.profileImage,
            readingHistory: adminUser.readingHistory,
            wishlist: adminUser.wishlist,
            readingStreak: adminUser.readingStreak,
            badges: adminUser.badges
          }
        });
      }
    }

    const user = await db.Users.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        profileImage: user.profileImage,
        readingHistory: user.readingHistory,
        wishlist: user.wishlist,
        readingStreak: user.readingStreak,
        badges: user.badges
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error during login', error: error.message });
  }
});

// @route   GET api/auth/me
// @desc    Get current user details
router.get('/me', authMiddleware, async (req, res) => {
  res.json({
    user: {
      id: req.user._id,
      username: req.user.username,
      email: req.user.email,
      role: req.user.role,
      profileImage: req.user.profileImage,
      readingHistory: req.user.readingHistory,
      wishlist: req.user.wishlist,
      readingStreak: req.user.readingStreak,
      badges: req.user.badges,
      createdAt: req.user.createdAt
    }
  });
});

// @route   POST api/auth/forgot-password
// @desc    Forgot Password Mock
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  try {
    const user = await db.Users.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({ message: 'No user found with this email' });
    }
    
    // In a real application, send reset email.
    // For local premium mock: return a success signal.
    res.json({ message: 'Password reset link sent to your email.' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   POST api/auth/update-profile
// @desc    Update user profile details
router.post('/update-profile', authMiddleware, async (req, res) => {
  const { username, email, profileImage, favoriteCategories } = req.body;
  try {
    const updates = {};
    if (username) updates.username = username;
    if (profileImage) updates.profileImage = profileImage;
    if (favoriteCategories) updates.favoriteCategories = favoriteCategories;
    
    if (email && email.toLowerCase() !== req.user.email) {
      const emailExists = await db.Users.findOne({ email: email.toLowerCase() });
      if (emailExists) {
        return res.status(400).json({ message: 'Email already in use' });
      }
      updates.email = email.toLowerCase();
    }
    
    const updatedUser = await db.Users.findByIdAndUpdate(req.user._id, { $set: updates }, { new: true });
    
    res.json({
      user: {
        id: updatedUser._id,
        username: updatedUser.username,
        email: updatedUser.email,
        role: updatedUser.role,
        profileImage: updatedUser.profileImage,
        readingHistory: updatedUser.readingHistory,
        wishlist: updatedUser.wishlist,
        readingStreak: updatedUser.readingStreak,
        badges: updatedUser.badges
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error updating profile', error: error.message });
  }
});

export default router;
