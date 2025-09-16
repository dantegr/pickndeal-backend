const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  createProduct,
  updateProduct,
  deleteProduct,
  getAllProducts,
  getProduct,
  getProductsByCategoryId
} = require('../controllers/productController');

// Product CRUD operations
router.get('/getAll', protect, getAllProducts);
router.get('/get/:id', protect, getProduct);
router.get('/getByCategory/:categoryId', protect, getProductsByCategoryId);
router.post('/create', protect, createProduct);
router.put('/update/:id', protect, updateProduct);
router.delete('/delete/:id', protect, deleteProduct);

module.exports = router;