const express = require('express');
const router = express.Router();
const {
  createNotification,
  getUserNotifications,
  getUnreadNotifications,
  updateNotification,
  markAllAsRead,
  deleteNotification,
  deleteAllNotifications,
  getUnreadCount
} = require('../controllers/notificationController');
const { protect } = require('../middleware/auth');

// All routes are protected
router.use(protect);

// Notification routes
router.post('/', createNotification);
router.get('/', getUserNotifications);
router.get('/unread', getUnreadNotifications);
router.get('/unread-count', getUnreadCount);
router.put('/mark-all-read', markAllAsRead);
router.put('/:id', updateNotification);
router.delete('/all', deleteAllNotifications);
router.delete('/:id', deleteNotification);

module.exports = router;