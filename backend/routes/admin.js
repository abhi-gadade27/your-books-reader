import express from 'express';
import { db } from '../config/db.js';
import { authMiddleware, adminMiddleware } from './auth.js';

const router = express.Router();

// Apply auth and admin check on all routes in this router
router.use(authMiddleware);
router.use(adminMiddleware);

// @route   GET api/admin/stats
// @desc    Get dashboard overview metrics and analytics
router.get('/stats', async (req, res) => {
  try {
    const users = await db.Users.find({});
    const books = await db.Books.find({});
    const feedbacks = await db.Feedbacks.find({});
    const requests = await db.BookRequests.find({});
    const ratings = await db.Ratings.find({});
    const logs = await db.ActivityLogs.find({});

    const totalUsers = users.length;
    const totalBooks = books.length;
    const marathiBooksCount = books.filter(b => b.language === 'Marathi').length;
    
    // Calculate active readers (users who read books in last 7 days)
    const activeReaders = users.filter(u => u.readingHistory && u.readingHistory.length > 0).length;

    // Feedback resolved vs pending
    const feedbackStats = {
      total: feedbacks.length,
      resolved: feedbacks.filter(f => f.resolved).length,
      pending: feedbacks.filter(f => !f.resolved).length
    };

    // Requested books pending count
    const requestedCount = requests.filter(r => r.status === 'pending').length;

    // Analytics: Find most read books
    const bookReadCounts = {};
    users.forEach(u => {
      if (u.readingHistory) {
        u.readingHistory.forEach(h => {
          bookReadCounts[h.bookTitle] = (bookReadCounts[h.bookTitle] || 0) + 1;
        });
      }
    });

    const mostReadBooks = Object.keys(bookReadCounts).map(title => ({
      title,
      reads: bookReadCounts[title]
    })).sort((a, b) => b.reads - a.reads).slice(0, 5);

    // Analytics: Trending categories
    const categoryCounts = {};
    books.forEach(b => {
      categoryCounts[b.category] = (categoryCounts[b.category] || 0) + 1;
    });
    const trendingCategories = Object.keys(categoryCounts).map(name => ({
      name,
      count: categoryCounts[name]
    })).sort((a, b) => b.count - a.count).slice(0, 5);

    // Analytics: Monthly registrations (simulation)
    const monthlyRegistrations = [
      { month: 'Jan', users: Math.max(1, Math.floor(totalUsers * 0.1)) },
      { month: 'Feb', users: Math.max(2, Math.floor(totalUsers * 0.25)) },
      { month: 'Mar', users: Math.max(4, Math.floor(totalUsers * 0.45)) },
      { month: 'Apr', users: Math.max(7, Math.floor(totalUsers * 0.75)) },
      { month: 'May', users: totalUsers }
    ];

    res.json({
      overview: {
        totalUsers,
        totalBooks,
        marathiBooksCount,
        activeReaders,
        pendingFeedback: feedbackStats.pending,
        pendingRequests: requestedCount
      },
      mostReadBooks,
      trendingCategories,
      feedbackStats,
      monthlyRegistrations,
      recentLogs: logs.slice(0, 10)
    });
  } catch (error) {
    res.status(500).json({ message: 'Error loading stats', error: error.message });
  }
});

// @route   GET api/admin/users
// @desc    Get list of all users
router.get('/users', async (req, res) => {
  try {
    const users = await db.Users.find({});
    // Exclude password in return
    const sanitizedUsers = users.map(u => ({
      id: u._id,
      username: u.username,
      email: u.email,
      role: u.role,
      profileImage: u.profileImage,
      readingHistory: u.readingHistory || [],
      wishlist: u.wishlist || [],
      readingStreak: u.readingStreak || 0,
      badges: u.badges || [],
      isBanned: u.isBanned || false,
      createdAt: u.createdAt
    }));
    res.json(sanitizedUsers);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving users', error: error.message });
  }
});

// @route   POST api/admin/users/:id/ban
// @desc    Ban or unban a user
router.post('/users/:id/ban', async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await db.Users.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.role === 'admin') {
      return res.status(400).json({ message: 'Cannot ban another Administrator' });
    }

    const currentBanStatus = user.isBanned || false;
    const updatedUser = await db.Users.findByIdAndUpdate(
      userId,
      { $set: { isBanned: !currentBanStatus } },
      { new: true }
    );

    // Log admin action
    await db.ActivityLogs.create({
      action: updatedUser.isBanned ? 'BAN_USER' : 'UNBAN_USER',
      user: req.user.username,
      details: `${updatedUser.isBanned ? 'Banned' : 'Unbanned'} user "${updatedUser.username}" (${updatedUser.email})`
    });

    res.json({ message: `User successfully ${updatedUser.isBanned ? 'banned' : 'unbanned'}`, isBanned: updatedUser.isBanned });
  } catch (error) {
    res.status(500).json({ message: 'Error toggling user ban status', error: error.message });
  }
});

// @route   POST api/admin/books
// @desc    Upload / create a new book
router.post('/books', async (req, res) => {
  const { title, author, coverImage, pdfUrl, category, language, description, isFeatured, chapters } = req.body;
  try {
    if (!title || !author || !category) {
      return res.status(400).json({ message: 'Title, Author, and Category are required' });
    }

    const newBook = await db.Books.create({
      title,
      author,
      coverImage: coverImage || 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=500',
      pdfUrl: pdfUrl || '',
      category,
      language: language || 'English',
      description: description || '',
      isFeatured: isFeatured || false,
      visible: true,
      chapters: chapters || []
    });

    // Notify users about the new book
    await db.Notifications.create({
      title: 'New Book Alert! 📚',
      message: `"${title}" by ${author} has been added to the library. Read it now!`,
      type: 'announcement',
      targetRole: 'all'
    });

    // Log admin action
    await db.ActivityLogs.create({
      action: 'UPLOAD_BOOK',
      user: req.user.username,
      details: `Uploaded new book "${title}" in ${language}`
    });

    res.status(201).json(newBook);
  } catch (error) {
    res.status(500).json({ message: 'Error uploading book', error: error.message });
  }
});

// @route   PUT api/admin/books/:id
// @desc    Edit book details
router.put('/books/:id', async (req, res) => {
  const { title, author, coverImage, pdfUrl, category, language, description, isFeatured, visible, chapters } = req.body;
  try {
    const book = await db.Books.findById(req.params.id);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    const updated = await db.Books.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          title,
          author,
          coverImage,
          pdfUrl,
          category,
          language,
          description,
          isFeatured,
          visible,
          chapters
        }
      },
      { new: true }
    );

    // Log admin action
    await db.ActivityLogs.create({
      action: 'EDIT_BOOK',
      user: req.user.username,
      details: `Edited details of book "${title}"`
    });

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Error updating book', error: error.message });
  }
});

// @route   DELETE api/admin/books/:id
// @desc    Delete a book
router.delete('/books/:id', async (req, res) => {
  try {
    const book = await db.Books.findById(req.params.id);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    await db.Books.findByIdAndDelete(req.params.id);

    // Log admin action
    await db.ActivityLogs.create({
      action: 'DELETE_BOOK',
      user: req.user.username,
      details: `Deleted book "${book.title}"`
    });

    res.json({ message: 'Book deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting book', error: error.message });
  }
});

// @route   GET api/admin/feedbacks
// @desc    Get all user feedbacks
router.get('/feedbacks', async (req, res) => {
  try {
    const feedbacks = await db.Feedbacks.find({});
    res.json(feedbacks);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving feedbacks', error: error.message });
  }
});

// @route   POST api/admin/feedbacks/:id/reply
// @desc    Reply to a feedback and resolve it
router.post('/feedbacks/:id/reply', async (req, res) => {
  const { reply } = req.body;
  try {
    const feedback = await db.Feedbacks.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          reply: reply || '',
          resolved: true
        }
      },
      { new: true }
    );

    // Send a system notification to this specific user (mocked by announcement for now)
    await db.Notifications.create({
      title: 'Feedback Response 📩',
      message: `Admin replied to feedback from ${feedback.name}: "${reply}"`,
      type: 'reminder',
      targetRole: 'user'
    });

    res.json({ message: 'Feedback response saved', feedback });
  } catch (error) {
    res.status(500).json({ message: 'Error replying to feedback', error: error.message });
  }
});

// @route   GET api/admin/requests
// @desc    Get all book requests
router.get('/requests', async (req, res) => {
  try {
    const requests = await db.BookRequests.find({});
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving requests', error: error.message });
  }
});

// @route   POST api/admin/requests/:id/status
// @desc    Update status of a requested book
router.post('/requests/:id/status', async (req, res) => {
  const { status } = req.body; // 'approved' or 'rejected'
  try {
    const request = await db.BookRequests.findByIdAndUpdate(
      req.params.id,
      { $set: { status } },
      { new: true }
    );

    // Notify user
    await db.Notifications.create({
      title: `Book Request Update 📖`,
      message: `Your request for "${request.bookName}" has been ${status}.`,
      type: 'announcement',
      targetRole: 'user'
    });

    res.json({ message: 'Request status updated', request });
  } catch (error) {
    res.status(500).json({ message: 'Error updating request status', error: error.message });
  }
});

// @route   POST api/admin/notifications
// @desc    Send announcement/notification
router.post('/notifications', async (req, res) => {
  const { title, message, type } = req.body;
  try {
    if (!title || !message) {
      return res.status(400).json({ message: 'Title and message are required' });
    }

    const notif = await db.Notifications.create({
      title,
      message,
      type: type || 'announcement',
      targetRole: 'all'
    });

    res.status(201).json(notif);
  } catch (error) {
    res.status(500).json({ message: 'Error sending notification', error: error.message });
  }
});

export default router;
