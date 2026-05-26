import express from 'express';
import { db } from '../config/db.js';
import { authMiddleware } from './auth.js';

const router = express.Router();

// @route   POST api/feedback
// @desc    Submit user feedback
router.post('/', async (req, res) => {
  const { name, email, message, rating } = req.body;
  try {
    if (!name || !email || !message || !rating) {
      return res.status(400).json({ message: 'All fields (name, email, message, rating) are required' });
    }

    const feedback = await db.Feedbacks.create({
      name,
      email,
      message,
      rating: Number(rating)
    });

    res.status(201).json({ message: 'Feedback submitted successfully', feedback });
  } catch (error) {
    res.status(500).json({ message: 'Error submitting feedback', error: error.message });
  }
});

// @route   POST api/feedback/request-book
// @desc    Submit a book request
router.post('/request-book', authMiddleware, async (req, res) => {
  const { bookName, authorName, category, language, notes } = req.body;
  try {
    if (!bookName || !authorName || !category || !language) {
      return res.status(400).json({ message: 'Book name, Author name, Category, and Language are required' });
    }

    const request = await db.BookRequests.create({
      bookName,
      authorName,
      category,
      language,
      notes: notes || '',
      userEmail: req.user.email
    });

    res.status(201).json({ message: 'Book request submitted successfully', request });
  } catch (error) {
    res.status(500).json({ message: 'Error submitting request', error: error.message });
  }
});

export default router;
