const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true
  },
  email: {
    type: String,
    unique: true,
    sparse: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String
  },
  phone_number: {
    type: String,
    unique: true,
    sparse: true
  },
  verification_code: {
    type: Number,
    default: 0
  },
  is_verified: {
    type: Boolean,
    default: false
  },
  is_block: {
    type: Boolean,
    default: false
  },
  image: {
    type: String
  },
  is_pro: {
    type: Number,
    default: 0
  },
  is_profile_completed: {
    type: Number,
    default: 0
  },
  reset_token: {
    type: String
  },
  device_token: {
    type: String
  },
  device_type: {
    type: String
  },
  remember_token: {
    type: String
  },
  email_verified_at: {
    type: Date
  },
  role: {
    type: String,
    enum: ['retailer', 'supplier'],
    default: 'retailer'
  }
}, {
  timestamps: true
});

// Encrypt password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    next();
  }
  
  if (this.password) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }
  next();
});

// Sign JWT and return
userSchema.methods.getSignedJwtToken = function() {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE
  });
};

// Match user entered password to hashed password in database
userSchema.methods.matchPassword = async function(enteredPassword) {
  if (!this.password) {
    return false;
  }
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);