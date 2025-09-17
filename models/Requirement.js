const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const requirementSchema = new mongoose.Schema({
  uuid: {
    type: String,
    default: uuidv4,
    unique: true,
    required: true
  },
  title: {
    type: String,
    required: [true, 'Please provide a requirement title'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Please provide a requirement description'],
    trim: true
  },
  state: {
    type: String,
    enum: ['CREATED', 'ACTIVE', 'PROCESSING', 'COMPLETED'],
    default: 'CREATED',
    required: true
  },
  categories: [{
    type: String,
    trim: true
  }],
  products: [{
    name: {
      type: String,
      required: [true, 'Please provide product name'],
      trim: true
    },
    productId: {
      type: String,
      required: [true, 'Please provide product ID'],
      trim: true
    },
    unit_of_measurement: {
      type: String,
      required: [true, 'Please provide unit of measurement'],
      trim: true
    },
    quantity: {
      type: Number,
      required: [true, 'Please provide quantity'],
      min: [0, 'Quantity must be a positive number']
    }
  }],
  recurring: {
    type: Boolean,
    default: false
  },
  location: {
    type: String,
    required: [true, 'Please provide a location'],
    trim: true
  },
  deliveryDate: {
    type: String,
    required: [true, 'Please provide delivery date information'],
    trim: true
  },
  budget: {
    type: String,
    required: [true, 'Please provide budget information'],
    trim: true
  },
  postedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  postedByName: {
    type: String,
    trim: true
  },
  postedByImage: {
    type: String,
    trim: true
  },
  quotesCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Requirement', requirementSchema);