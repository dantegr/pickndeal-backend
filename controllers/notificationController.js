const Notification = require('../models/Notification');

// Helper function to create notification (can be used internally)
const createNotificationHelper = async (userId, type, data) => {
  try {
    const notification = await Notification.create({
      userId,
      type,
      data,
      isRead: false,
      dateCreated: new Date()
    });
    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
};

// @desc    Create a new notification
// @route   POST /api/notifications
// @access  Private
exports.createNotification = async (req, res) => {
  try {
    const { userId, type, data } = req.body;

    // Validate required fields
    if (!userId || !type || !data) {
      return res.status(400).json({
        success: false,
        message: 'Please provide userId, type, and data'
      });
    }

    // Validate chat data structure
    if (type === 'chat') {
      if (!data.senderId || !data.senderName || !data.message) {
        return res.status(400).json({
          success: false,
          message: 'Chat notifications require senderId, senderName and message in data'
        });
      }
    }

    const notification = await Notification.create({
      userId,
      type,
      data,
      isRead: false,
      dateCreated: new Date()
    });

    res.status(201).json({
      success: true,
      data: notification
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get all notifications for a user
// @route   GET /api/notifications
// @access  Private
exports.getUserNotifications = async (req, res) => {
  try {
    const userId = req.user._id;
    const { page = 1, limit = 20, unreadOnly = false } = req.query;

    const query = { userId };
    
    if (unreadOnly === 'true') {
      query.isRead = false;
    }

    const notifications = await Notification.find(query)
      .sort({ dateCreated: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const count = await Notification.countDocuments(query);
    const unreadCount = await Notification.getUnreadCount(userId);

    res.status(200).json({
      success: true,
      data: notifications,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      totalCount: count,
      unreadCount
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get all unread notifications for a user
// @route   GET /api/notifications/unread
// @access  Private
exports.getUnreadNotifications = async (req, res) => {
  try {
    const userId = req.user._id;
    const { page = 1, limit = 20 } = req.query;

    const notifications = await Notification.find({ userId, isRead: false })
      .sort({ dateCreated: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const count = await Notification.countDocuments({ userId, isRead: false });

    res.status(200).json({
      success: true,
      data: notifications,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      totalCount: count
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update notification (mark as read)
// @route   PUT /api/notifications/:id
// @access  Private
exports.updateNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const notification = await Notification.findOne({ _id: id, userId });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    notification.isRead = true;
    await notification.save();

    res.status(200).json({
      success: true,
      data: notification
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Mark all notifications as read for a user
// @route   PUT /api/notifications/mark-all-read
// @access  Private
exports.markAllAsRead = async (req, res) => {
  try {
    const userId = req.user._id;

    const result = await Notification.markAllAsRead(userId);

    res.status(200).json({
      success: true,
      message: 'All notifications marked as read',
      modifiedCount: result.modifiedCount
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete a notification
// @route   DELETE /api/notifications/:id
// @access  Private
exports.deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const notification = await Notification.findOneAndDelete({ _id: id, userId });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Notification deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete all notifications for a user
// @route   DELETE /api/notifications/all
// @access  Private
exports.deleteAllNotifications = async (req, res) => {
  try {
    const userId = req.user._id;

    const result = await Notification.deleteMany({ userId });

    res.status(200).json({
      success: true,
      message: 'All notifications deleted successfully',
      deletedCount: result.deletedCount
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get unread notification count
// @route   GET /api/notifications/unread-count
// @access  Private
exports.getUnreadCount = async (req, res) => {
  try {
    const userId = req.user._id;
    const unreadCount = await Notification.getUnreadCount(userId);

    res.status(200).json({
      success: true,
      unreadCount
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Export the helper function for internal use
exports.createNotificationHelper = createNotificationHelper;