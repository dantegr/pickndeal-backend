const mongoose = require('mongoose');

const userTypeSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    unique: true
  },
  description: {
    type: String
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('UserType', userTypeSchema);