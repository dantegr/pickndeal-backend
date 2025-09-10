const Chat = require('../models/Chat');
const User = require('../models/User');
const Profile = require('../models/Profile');

// Get chat history between two users
exports.getChatHistory = async (req, res) => {
  try {
    const senderId = req.user.id;
    const { receiverId } = req.params;

    // Find or create chat between the two users
    let chat = await Chat.findOrCreateChat(senderId, receiverId);
    
    // Mark messages as read
    await chat.markMessagesAsRead(senderId);

    // Get last 100 messages (most recent) and ensure sender/receiver are populated
    let messages = [];
    if (chat.messages && chat.messages.length > 0) {
      // Populate the chat with user information
      await chat.populate([
        { path: 'messages.sender', select: 'name email image' },
        { path: 'messages.receiver', select: 'name email image' }
      ]);
      
      messages = chat.messages.slice(-100);
      
      // Ensure each message maintains its structure
      messages = messages.map(msg => {
        // If populate worked, sender/receiver will be objects; if not, they'll be ObjectIds
        const messageObj = {
          _id: msg._id,
          sender: msg.sender,
          receiver: msg.receiver,
          textContent: msg.textContent,
          dateSent: msg.dateSent,
          isRead: msg.isRead,
          createdAt: msg.createdAt,
          updatedAt: msg.updatedAt
        };
        
        return messageObj;
      });
    }

    res.status(200).json({
      success: true,
      data: {
        chatId: chat._id,
        chat: {
          _id: chat._id,
          userIds: chat.userIds,
          lastActivity: chat.lastActivity,
          createdAt: chat.createdAt
        },
        messages
      }
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
    .sort({ lastActivity: -1 });
    
    // Populate lastMessage fields only if it exists
    for (let chat of chats) {
      if (chat.lastMessage && chat.lastMessage.sender) {
        await chat.populate('lastMessage.sender lastMessage.receiver', 'name email image');
      }
    }

    // Format chats to include the other user's info and unread count
    const formattedChats = await Promise.all(chats.map(async (chat) => {
      const otherUser = chat.userIds.find(user => user._id.toString() !== userId);
      
      // Get the profile for the other user to get avatarImage
      let otherUserWithProfile = null;
      if (otherUser) {
        const profile = await Profile.findOne({ user_id: otherUser._id });
        otherUserWithProfile = {
          _id: otherUser._id,
          name: otherUser.name,
          email: otherUser.email,
          image: otherUser.image,
          avatarImage: profile?.avatarImage || null
        };
      }
      
      // Also enhance lastMessage sender/receiver with profile images
      let enhancedLastMessage = chat.lastMessage;
      if (enhancedLastMessage) {
        if (enhancedLastMessage.sender) {
          const senderProfile = await Profile.findOne({ user_id: enhancedLastMessage.sender._id });
          enhancedLastMessage.sender.avatarImage = senderProfile?.avatarImage || null;
        }
        if (enhancedLastMessage.receiver) {
          const receiverProfile = await Profile.findOne({ user_id: enhancedLastMessage.receiver._id });
          enhancedLastMessage.receiver.avatarImage = receiverProfile?.avatarImage || null;
        }
      }
      
      return {
        _id: chat._id,
        otherUser: otherUserWithProfile,
        lastMessage: enhancedLastMessage,
        lastActivity: chat.lastActivity,
        unreadCount: chat.getUnreadCount(userId),
        createdAt: chat.createdAt
      };
    }));

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
    const hasChanges = await chat.markMessagesAsRead(userId);

    res.status(200).json({
      success: true,
      message: 'Messages marked as read',
      updated: hasChanges
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

    const count = await Chat.getUnreadCountForUser(userId);

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