import express from 'express';
import { db } from '../config/db.js';
import { authMiddleware } from './auth.js';

const router = express.Router();

// @route   GET api/books
// @desc    Get all books with filtering and search
router.get('/', async (req, res) => {
  try {
    const { search, category, language, filter } = req.query;
    let query = { visible: true };

    if (language) {
      query.language = language;
    }

    if (category && category !== 'All') {
      query.category = category;
    }

    if (search) {
      query.$or = [
        { title: new RegExp(search, 'i') },
        { author: new RegExp(search, 'i') }
      ];
    }

    let books = await db.Books.find(query);

    // Apply sorting/filtering based on the 'filter' parameter
    if (filter === 'Popular' || filter === 'Trending') {
      // Sort by rating (descending)
      books.sort((a, b) => b.rating - a.rating);
    } else if (filter === 'Top Rated') {
      books.sort((a, b) => b.rating - a.rating);
    } else if (filter === 'Recently Added') {
      books.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    res.json(books);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving books', error: error.message });
  }
});

// @route   GET api/books/categories
// @desc    Get all unique book categories
router.get('/categories', async (req, res) => {
  try {
    const books = await db.Books.find({ visible: true });
    const categories = ['All', ...new Set(books.map(b => b.category))];
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching categories', error: error.message });
  }
});

// @route   GET api/books/:id
// @desc    Get single book by ID
router.get('/:id', async (req, res) => {
  try {
    const book = await db.Books.findById(req.params.id);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }
    
    // Fetch reviews for this book
    const reviews = await db.Ratings.find({ bookId: req.params.id });
    
    res.json({ book, reviews });
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving book', error: error.message });
  }
});

// @route   POST api/books/:id/review
// @desc    Add rating and review for a book
router.post('/:id/review', authMiddleware, async (req, res) => {
  const { rating, review } = req.body;
  try {
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Please provide rating between 1 and 5' });
    }

    const book = await db.Books.findById(req.params.id);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    // Check if user has already reviewed
    const existingReviews = await db.Ratings.find({ bookId: req.params.id, userId: req.user._id.toString() });
    if (existingReviews.length > 0) {
      return res.status(400).json({ message: 'You have already reviewed this book' });
    }

    // Save review
    const newRating = await db.Ratings.create({
      bookId: req.params.id,
      userId: req.user._id.toString(),
      username: req.user.username,
      rating: Number(rating),
      review: review || ''
    });

    // Update book overall rating
    const allReviews = await db.Ratings.find({ bookId: req.params.id });
    const totalRating = allReviews.reduce((sum, r) => sum + r.rating, 0);
    const avgRating = Number((totalRating / allReviews.length).toFixed(1));

    await db.Books.findByIdAndUpdate(req.params.id, {
      $set: {
        rating: avgRating,
        reviewsCount: allReviews.length
      }
    });

    // Log Activity
    await db.ActivityLogs.create({
      action: 'REVIEW_BOOK',
      user: req.user.username,
      details: `Reviewed "${book.title}" with ${rating} stars`
    });

    res.json({ message: 'Review added successfully', rating: newRating });
  } catch (error) {
    res.status(500).json({ message: 'Error adding review', error: error.message });
  }
});

// @route   POST api/books/:id/wishlist
// @desc    Add or Remove book from wishlist
router.post('/:id/wishlist', authMiddleware, async (req, res) => {
  try {
    const bookId = req.params.id;
    const book = await db.Books.findById(bookId);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    const user = await db.Users.findById(req.user._id);
    const isWishlisted = user.wishlist.includes(bookId);

    let updatedUser;
    if (isWishlisted) {
      // Pull from wishlist
      updatedUser = await db.Users.findByIdAndUpdate(
        req.user._id,
        { $pull: { wishlist: bookId } },
        { new: true }
      );
    } else {
      // Push to wishlist
      updatedUser = await db.Users.findByIdAndUpdate(
        req.user._id,
        { $push: { wishlist: bookId } },
        { new: true }
      );
    }

    res.json({
      wishlist: updatedUser.wishlist,
      isWishlisted: !isWishlisted
    });
  } catch (error) {
    res.status(500).json({ message: 'Error updating wishlist', error: error.message });
  }
});

// @route   POST api/books/:id/progress
// @desc    Update reading progress and streak stats
router.post('/:id/progress', authMiddleware, async (req, res) => {
  const { page, progress } = req.body;
  try {
    const bookId = req.params.id;
    const book = await db.Books.findById(bookId);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    const user = await db.Users.findById(req.user._id);
    let history = [...(user.readingHistory || [])];
    const index = history.findIndex(h => h.bookId === bookId);

    const now = new Date();
    
    // Update streak logic
    const todayStr = now.toISOString().slice(0, 10); // YYYY-MM-DD
    let currentStreak = user.readingStreak || 0;
    
    if (user.lastReadDate !== todayStr) {
      if (user.lastReadDate) {
        const lastRead = new Date(user.lastReadDate);
        const diffTime = Math.abs(now - lastRead);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays === 1) {
          currentStreak += 1;
        } else if (diffDays > 1) {
          currentStreak = 1;
        }
      } else {
        currentStreak = 1;
      }
    }

    const item = {
      bookId,
      bookTitle: book.title,
      bookCover: book.coverImage,
      progress: Number(progress),
      page: Number(page),
      lastRead: now
    };

    if (index > -1) {
      history[index] = item;
    } else {
      history.push(item);
    }

    // Award badges based on progress/streak
    const badges = [...(user.badges || [])];
    if (currentStreak >= 3 && !badges.includes('3-Day Streak')) {
      badges.push('3-Day Streak');
    }
    if (currentStreak >= 7 && !badges.includes('Weekly Scholar')) {
      badges.push('Weekly Scholar');
    }
    if (history.length >= 5 && !badges.includes('Avid Reader')) {
      badges.push('Avid Reader');
    }
    if (progress >= 100 && !badges.includes('Book Finisher')) {
      badges.push('Book Finisher');
    }

    const updatedUser = await db.Users.findByIdAndUpdate(
      req.user._id,
      {
        $set: {
          readingHistory: history,
          readingStreak: currentStreak,
          lastReadDate: todayStr,
          badges: badges
        }
      },
      { new: true }
    );

    res.json({
      readingHistory: updatedUser.readingHistory,
      readingStreak: updatedUser.readingStreak,
      badges: updatedUser.badges
    });
  } catch (error) {
    res.status(500).json({ message: 'Error updating reading progress', error: error.message });
  }
});

export default router;
