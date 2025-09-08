const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
  userIds: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }],
  messages: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message'
  }],
  lastMessage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message'
  },
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

chatSchema.methods.addMessage = async function(messageId) {
  this.messages.push(messageId);
  this.lastMessage = messageId;
  this.lastActivity = new Date();
  return this.save();
};

chatSchema.statics.findOrCreateChat = async function(userId1, userId2) {
  const sortedUserIds = [userId1, userId2].sort();
  
  let chat = await this.findOne({
    userIds: { $all: sortedUserIds, $size: 2 }
  });
  
  if (!chat) {
    chat = await this.create({
      userIds: sortedUserIds
    });
  }
  
  return chat;
};

module.exports = mongoose.model('Chat', chatSchema);