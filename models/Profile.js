const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  address: {
    type: String,
    required: true
  },
  address2: {
    type: String
  },
  country_id: {
    type: String,
    required: true
  },
  state_id: {
    type: String,
    required: true
  },
  city_id: {
    type: String
  },
  zip: {
    type: String,
    required: true
  },
  aboutme: {
    type: String,
    required: true
  },
  timeSlots: {
    type: [String], // Array of time slot strings
    required: true
  },
  categories: {
    type: [String], // Array of category names
    required: true
  },
  lat: {
    type: Number
  },
  lng: {
    type: Number
  },
  deliveryRadius: {
    type: Number,
    required: false
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Profile', profileSchema);