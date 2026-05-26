import express from 'express';
import { db } from '../config/db.js';
import { authMiddleware } from './auth.js';

const router = express.Router();

// @route   GET api/notifications
// @desc    Get user notifications
router.get('/', authMiddleware, async (req, res) => {
  try {
    const list = await db.Notifications.find({});
    // Filter based on user role (announcements are visible to all, user/admin specific notifications filtered accordingly)
    const filtered = list.filter(n => {
      if (n.targetRole === 'all') return true;
      if (n.targetRole === 'admin' && req.user.role === 'admin') return true;
      if (n.targetRole === 'user' && req.user.role === 'user') return true;
      return false;
    });
    
    res.json(filtered);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving notifications', error: error.message });
  }
});

export default router;
