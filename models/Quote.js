const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const quoteSchema = new mongoose.Schema({
  uuid: {
    type: String,
    default: uuidv4,
    unique: true,
    required: true
  },
  requirementId: {
    type: String,
    required: [true, 'Please provide a requirement ID'],
    trim: true
  },
  requirementOwnerId: {
    type: String,
    required: [true, 'Please provide a requirement owner ID'],
    trim: true
  },
  quoterId: {
    type: String,
    required: [true, 'Please provide a quoter ID'],
    trim: true
  },
  state: {
    type: String,
    enum: ['CREATED', 'ACCEPTED', 'DECLINED'],
    default: 'CREATED',
    required: true
  },
  canDeliver: {
    type: Boolean,
    default: false
  },
  deliveryDate: {
    type: String,
    required: [true, 'Please provide delivery date information'],
    trim: true
  },
  proposedAmount: {
    type: String,
    required: [true, 'Please provide proposed amount'],
    trim: true
  },
  details: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Quote', quoteSchema);