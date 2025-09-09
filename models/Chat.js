const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  receiver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  textContent: {
    type: String,
    required: true,
    trim: true
  },
  dateSent: {
    type: Date,
    default: Date.now
  },
  isRead: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

const chatSchema = new mongoose.Schema({
  userIds: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }],
  messages: [messageSchema],
  lastMessage: messageSchema,
  lastActivity: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

chatSchema.index({ userIds: 1 });
chatSchema.index({ lastActivity: -1 });
chatSchema.index({ 'messages.sender': 1, 'messages.receiver': 1, 'messages.dateSent': -1 });

chatSchema.methods.addMessage = async function(messageData) {
  const message = {
    _id: new mongoose.Types.ObjectId(),
    sender: messageData.sender,
    receiver: messageData.receiver,
    textContent: messageData.textContent,
    dateSent: messageData.dateSent || new Date(),
    isRead: messageData.isRead || false,
    createdAt: new Date(),
    updatedAt: new Date()
  };
  
  this.messages.push(message);
  this.lastMessage = message;
  this.lastActivity = new Date();
  await this.save();
  
  return message;
};

chatSchema.methods.markMessagesAsRead = async function(userId) {
  let hasChanges = false;
  
  if (!this.messages || this.messages.length === 0) {
    return hasChanges;
  }
  
  this.messages.forEach(message => {
    if (message && message.receiver && 
        message.receiver.toString() === userId.toString() && 
        !message.isRead) {
      message.isRead = true;
      hasChanges = true;
    }
  });
  
  if (hasChanges) {
    await this.save();
  }
  
  return hasChanges;
};

chatSchema.methods.getUnreadCount = function(userId) {
  if (!this.messages || this.messages.length === 0) {
    return 0;
  }
  
  return this.messages.filter(
    message => message && message.receiver && 
               message.receiver.toString() === userId.toString() && 
               !message.isRead
  ).length;
};

chatSchema.statics.findOrCreateChat = async function(userId1, userId2) {
  const sortedUserIds = [userId1, userId2].sort();
  
  let chat = await this.findOne({
    userIds: { $all: sortedUserIds, $size: 2 }
  });
  
  if (!chat) {
    chat = await this.create({
      userIds: sortedUserIds,
      messages: []
    });
  }
  
  return chat;
};

chatSchema.statics.getUnreadCountForUser = async function(userId) {
  const chats = await this.find({ userIds: userId });
  let totalUnread = 0;
  
  chats.forEach(chat => {
    totalUnread += chat.getUnreadCount(userId);
  });
  
  return totalUnread;
};

module.exports = mongoose.model('Chat', chatSchema);