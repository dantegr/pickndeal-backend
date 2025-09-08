const Chat = require('../models/Chat');
const Message = require('../models/Message');
const User = require('../models/User');

// Get chat history between two users
exports.getChatHistory = async (req, res) => {
  try {
    const senderId = req.user.id;
    const { receiverId } = req.params;

    // Find or create chat between the two users
    let chat = await Chat.findOrCreateChat(senderId, receiverId);
    
    // Populate messages
    await chat.populate({
      path: 'messages',
      options: { 
        sort: { dateSent: 1 },
        limit: 100 // Limit to last 100 messages
      }
    });

    // Mark messages as read
    await Message.updateMany(
      {
        _id: { $in: chat.messages.map(m => m._id) },
        receiver: senderId,
        isRead: false
      },
      { isRead: true }
    );

    res.status(200).json({
      success: true,
      chat,
      messages: chat.messages
    });
  } catch (error) {
    console.error('Error fetching chat history:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch chat history',
      error: error.message
    });
  }
};

// Get all chats for current user
exports.getUserChats = async (req, res) => {
  try {
    const userId = req.user.id;

    const chats = await Chat.find({
      userIds: userId
    })
    .populate('userIds', 'name email image')
    .populate('lastMessage')
    .sort({ lastActivity: -1 });

    // Format chats to include the other user's info
    const formattedChats = chats.map(chat => {
      const otherUser = chat.userIds.find(user => user._id.toString() !== userId);
      return {
        _id: chat._id,
        otherUser,
        lastMessage: chat.lastMessage,
        lastActivity: chat.lastActivity,
        createdAt: chat.createdAt
      };
    });

    res.status(200).json({
      success: true,
      chats: formattedChats
    });
  } catch (error) {
    console.error('Error fetching user chats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch chats',
      error: error.message
    });
  }
};

// Mark messages as read in a chat
exports.markMessagesAsRead = async (req, res) => {
  try {
    const userId = req.user.id;
    const { chatId } = req.params;

    // Verify user is part of this chat
    const chat = await Chat.findOne({
      _id: chatId,
      userIds: userId
    });

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found'
      });
    }

    // Mark all messages in this chat as read where current user is receiver
    await Message.updateMany(
      {
        _id: { $in: chat.messages },
        receiver: userId,
        isRead: false
      },
      { isRead: true }
    );

    res.status(200).json({
      success: true,
      message: 'Messages marked as read'
    });
  } catch (error) {
    console.error('Error marking messages as read:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark messages as read',
      error: error.message
    });
  }
};

// Get unread message count
exports.getUnreadCount = async (req, res) => {
  try {
    const userId = req.user.id;

    const count = await Message.countDocuments({
      receiver: userId,
      isRead: false
    });

    res.status(200).json({
      success: true,
      count
    });
  } catch (error) {
    console.error('Error fetching unread count:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch unread count',
      error: error.message
    });
  }
};