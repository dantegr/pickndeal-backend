const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const productCategorySchema = new mongoose.Schema({
  uuid: {
    type: String,
    default: uuidv4,
    unique: true,
    required: true
  },
  name: {
    type: String,
    required: [true, 'Please provide a category name'],
    unique: true,
    trim: true
  },
  unit_of_measurement: {
    type: String,
    required: [true, 'Please provide a unit of measurement'],
    trim: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('ProductCategory', productCategorySchema);