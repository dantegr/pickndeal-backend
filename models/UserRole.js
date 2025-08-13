const mongoose = require('mongoose');

const userRoleSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  user_type_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'UserType',
    required: true
  }
}, {
  timestamps: true
});

// Create compound index for unique user-role combination
userRoleSchema.index({ user_id: 1, user_type_id: 1 }, { unique: true });

module.exports = mongoose.model('UserRole', userRoleSchema);