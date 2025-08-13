const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
  sender_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  receiver_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  sender_type: {
    type: String,
    required: true
  },
  receiver_type: {
    type: String,
    required: true
  },
  otp: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    default: 'open'
  },
  section: {
    type: String,
    default: 'signup'
  },
  section_id: {
    type: Number,
    default: 1
  },
  expires_at: {
    type: Date,
    default: Date.now,
    expires: 600 // OTP expires after 10 minutes
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Otp', otpSchema);