const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getChatHistory,
  getUserChats,
  markMessagesAsRead,
  getUnreadCount
} = require('../controllers/chatController');

// All routes require authentication
router.use(protect);

// Get chat history with a specific user
router.get('/history/:receiverId', getChatHistory);

// Get all chats for current user
router.get('/list', getUserChats);

// Mark messages as read in a chat
router.put('/:chatId/read', markMessagesAsRead);

// Get unread message count
router.get('/unread-count', getUnreadCount);

module.exports = router;