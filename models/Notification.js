const mongoose = require('mongoose');

// Schema for chat notification data
const chatDataSchema = new mongoose.Schema({
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  senderName: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  }
}, { _id: false });

const notificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  type: {
    type: String,
    required: true,
    enum: ['chat'],
    default: 'chat'
  },
  isRead: {
    type: Boolean,
    default: false
  },
  data: {
    type: chatDataSchema,
    required: true
  },
  dateCreated: {
    type: Date,
    default: Date.now,
    index: true
  }
}, {
  timestamps: true
});

// Index for efficient queries
notificationSchema.index({ userId: 1, isRead: 1, dateCreated: -1 });

// Virtual for formatted date
notificationSchema.virtual('formattedDate').get(function() {
  return this.dateCreated.toISOString();
});

// Method to mark as read
notificationSchema.methods.markAsRead = async function() {
  this.isRead = true;
  return await this.save();
};

// Static method to get unread count for a user
notificationSchema.statics.getUnreadCount = async function(userId) {
  return await this.countDocuments({ userId, isRead: false });
};

// Static method to mark all as read for a user
notificationSchema.statics.markAllAsRead = async function(userId) {
  return await this.updateMany(
    { userId, isRead: false },
    { isRead: true }
  );
};

module.exports = mongoose.model('Notification', notificationSchema);