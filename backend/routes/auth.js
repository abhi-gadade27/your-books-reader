import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '../config/db.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your_books_reader_jwt_secret_key_123';

// In-memory cache for phone OTPs (key: phoneNumber, value: { otp, expiresAt })
const otpCache = {};

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
  const cleanEmail = email ? email.trim().toLowerCase() : '';
  const cleanUsername = username ? username.trim() : '';
  
  console.log(`[Auth Register] Request received - username: "${cleanUsername}", email: "${cleanEmail}"`);
  
  try {
    if (!cleanUsername || !cleanEmail || !password) {
      return res.status(400).json({ message: 'Please enter all fields' });
    }

    const userExists = await db.Users.findOne({ email: cleanEmail });
    if (userExists) {
      console.log(`[Auth Register] User registration failed: email "${cleanEmail}" already exists`);
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await db.Users.create({
      username: cleanUsername,
      email: cleanEmail,
      password: hashedPassword,
      role: 'user', // Default role
      profileImage: `https://api.dicebear.com/7.x/adventurer/svg?seed=${cleanUsername}`,
      wishlist: [],
      readingHistory: [],
      readingStreak: 0,
      lastReadDate: '',
      favoriteCategories: [],
      badges: ['Novice Reader']
    });

    console.log(`[Auth Register] User successfully registered: id=${newUser._id}, username=${newUser.username}`);

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
    console.error(`[Auth Register Error]`, error);
    res.status(500).json({ message: 'Server error during registration', error: error.message });
  }
});

// @route   POST api/auth/login
// @desc    Authenticate user & get token
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const cleanEmail = email ? email.trim().toLowerCase() : '';

  console.log(`[Auth Login] Login attempt for email/id: "${cleanEmail}"`);

  try {
    if (!cleanEmail || !password) {
      return res.status(400).json({ message: 'Please enter all fields' });
    }

    // Default Admin quick-login logic
    if (cleanEmail === 'abhibook@0417') {
      if (password === 'abhiadminbook0417') {
        console.log(`[Auth Login] Admin credentials verified via quick-login.`);
        // Ensure admin user exists in DB
        let adminUser = await db.Users.findOne({ role: 'admin' });
        if (!adminUser) {
          const salt = await bcrypt.genSalt(10);
          const hashedPassword = await bcrypt.hash('abhiadminbook0417', salt);
          adminUser = await db.Users.create({
            username: 'abhibook@0417',
            email: 'abhibook@0417',
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

    const user = await db.Users.findOne({ email: cleanEmail });
    if (!user) {
      console.log(`[Auth Login] User not found for email: "${cleanEmail}"`);
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log(`[Auth Login] Password mismatch for email: "${cleanEmail}"`);
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    console.log(`[Auth Login] User authenticated successfully: username=${user.username}, id=${user._id}`);
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
    console.error(`[Auth Login Error]`, error);
    res.status(500).json({ message: 'Server error during login', error: error.message });
  }
});

// @route   POST api/auth/phone-send-otp
// @desc    Generate and send OTP for phone number
router.post('/phone-send-otp', async (req, res) => {
  const { phoneNumber } = req.body;
  
  try {
    if (!phoneNumber) {
      return res.status(400).json({ message: 'Please enter a phone number' });
    }
    
    const cleanPhone = phoneNumber.trim();
    if (cleanPhone.length < 10) {
      return res.status(400).json({ message: 'Invalid phone number length' });
    }
    
    // Generate a random 6-digit OTP code
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Store in cache (valid for 5 minutes)
    otpCache[cleanPhone] = {
      otp,
      expiresAt: Date.now() + 5 * 60 * 1000
    };
    
    console.log(`\n=============================================`);
    console.log(`[SMS MOCK] Phone Number: ${cleanPhone}`);
    console.log(`[SMS MOCK] Verification Code (OTP): ${otp}`);
    console.log(`=============================================\n`);
    
    // In dev mock mode, we also return the OTP in the JSON response so the user can easily test it.
    res.json({
      success: true,
      message: `OTP sent successfully. (Mock OTP: ${otp})`,
      otp // Include in response for seamless local testing
    });
  } catch (error) {
    console.error('[Phone Send OTP Error]', error);
    res.status(500).json({ message: 'Server error sending OTP', error: error.message });
  }
});

// @route   POST api/auth/phone-verify-otp
// @desc    Verify OTP and log in / sign up
router.post('/phone-verify-otp', async (req, res) => {
  const { phoneNumber, otp, username } = req.body;
  
  try {
    if (!phoneNumber || !otp) {
      return res.status(400).json({ message: 'Phone number and OTP are required' });
    }
    
    const cleanPhone = phoneNumber.trim();
    const cachedData = otpCache[cleanPhone];
    
    if (!cachedData) {
      return res.status(400).json({ message: 'OTP not requested or expired' });
    }
    
    if (Date.now() > cachedData.expiresAt) {
      delete otpCache[cleanPhone];
      return res.status(400).json({ message: 'OTP expired' });
    }
    
    if (cachedData.otp !== otp.trim()) {
      return res.status(400).json({ message: 'Invalid OTP code' });
    }
    
    // OTP is valid! Remove from cache to avoid reuse
    delete otpCache[cleanPhone];
    
    // Check if user exists
    let user = await db.Users.findOne({ phoneNumber: cleanPhone });
    
    if (user) {
      console.log(`[Phone Auth Login] User found: id=${user._id}, phone=${cleanPhone}`);
      const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
      return res.json({
        token,
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          role: user.role,
          phoneNumber: user.phoneNumber,
          profileImage: user.profileImage,
          readingHistory: user.readingHistory,
          wishlist: user.wishlist,
          readingStreak: user.readingStreak,
          badges: user.badges
        }
      });
    } else {
      // User does not exist - check if username is provided to complete registration
      if (!username || !username.trim()) {
        console.log(`[Phone Auth Verification] Phone verified for new user (${cleanPhone}). Prompting for username.`);
        return res.json({
          verified: true,
          isNewUser: true,
          message: 'Phone number verified. Please provide a username to complete registration.'
        });
      }
      
      const cleanUsername = username.trim();
      console.log(`[Phone Auth Signup] Registering new phone user: phone=${cleanPhone}, username="${cleanUsername}"`);
      
      // Check if username is already taken
      const usernameExists = await db.Users.findOne({ username: cleanUsername });
      if (usernameExists) {
        return res.status(400).json({ message: 'Username is already taken' });
      }
      
      // Create new user with mock email and random password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(Math.random().toString(36), salt);
      const mockEmail = `${cleanPhone}@phone.books`;
      
      const newUser = await db.Users.create({
        username: cleanUsername,
        email: mockEmail,
        password: hashedPassword,
        role: 'user',
        phoneNumber: cleanPhone,
        profileImage: `https://api.dicebear.com/7.x/adventurer/svg?seed=${cleanUsername}`,
        wishlist: [],
        readingHistory: [],
        readingStreak: 0,
        lastReadDate: '',
        favoriteCategories: [],
        badges: ['Novice Reader']
      });
      
      console.log(`[Phone Auth Signup] New user created: id=${newUser._id}, username=${newUser.username}`);
      const token = jwt.sign({ id: newUser._id, role: newUser.role }, JWT_SECRET, { expiresIn: '7d' });
      
      return res.status(201).json({
        token,
        user: {
          id: newUser._id,
          username: newUser.username,
          email: newUser.email,
          role: newUser.role,
          phoneNumber: newUser.phoneNumber,
          profileImage: newUser.profileImage,
          readingHistory: newUser.readingHistory,
          wishlist: newUser.wishlist,
          readingStreak: newUser.readingStreak,
          badges: newUser.badges
        }
      });
    }
  } catch (error) {
    console.error('[Phone Auth Verify Error]', error);
    res.status(500).json({ message: 'Server error verifying OTP', error: error.message });
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
