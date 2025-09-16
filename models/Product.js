const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const productSchema = new mongoose.Schema({
  uuid: {
    type: String,
    default: uuidv4,
    unique: true,
    required: true
  },
  name: {
    type: String,
    required: [true, 'Please provide a product name'],
    trim: true
  },
  unit_of_measurement: {
    type: String,
    required: [true, 'Please provide a unit of measurement'],
    trim: true
  },
  category_id: {
    type: String,
    required: [true, 'Please provide a category ID'],
    trim: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Product', productSchema);