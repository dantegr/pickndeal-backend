const ProductCategory = require('../models/ProductCategory');

// @desc    Create new product category
// @route   POST /api/productCategory/create
// @access  Private
exports.createProductCategory = async (req, res) => {
  try {
    const { name, unit_of_measurement } = req.body;

    // Validate input
    if (!name || !unit_of_measurement) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name and unit of measurement'
      });
    }

    // Check if category already exists
    const existingCategory = await ProductCategory.findOne({ name });
    if (existingCategory) {
      return res.status(400).json({
        success: false,
        message: 'Product category with this name already exists'
      });
    }

    // Create new category
    const productCategory = await ProductCategory.create({
      name,
      unit_of_measurement
    });

    res.status(201).json({
      success: true,
      data: productCategory
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update product category
// @route   PUT /api/productCategory/update/:id
// @access  Private
exports.updateProductCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, unit_of_measurement } = req.body;

    // Find category by UUID or MongoDB ID
    let productCategory = await ProductCategory.findOne({
      $or: [
        { _id: id },
        { uuid: id }
      ]
    });

    if (!productCategory) {
      return res.status(404).json({
        success: false,
        message: 'Product category not found'
      });
    }

    // Check if new name already exists (if name is being changed)
    if (name && name !== productCategory.name) {
      const existingCategory = await ProductCategory.findOne({ name });
      if (existingCategory) {
        return res.status(400).json({
          success: false,
          message: 'Product category with this name already exists'
        });
      }
    }

    // Update fields
    if (name) productCategory.name = name;
    if (unit_of_measurement) productCategory.unit_of_measurement = unit_of_measurement;

    await productCategory.save();

    res.status(200).json({
      success: true,
      data: productCategory
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete product category
// @route   DELETE /api/productCategory/delete/:id
// @access  Private
exports.deleteProductCategory = async (req, res) => {
  try {
    const { id } = req.params;

    // Find category by UUID or MongoDB ID
    const productCategory = await ProductCategory.findOne({
      $or: [
        { _id: id },
        { uuid: id }
      ]
    });

    if (!productCategory) {
      return res.status(404).json({
        success: false,
        message: 'Product category not found'
      });
    }

    await productCategory.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Product category deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get all product categories
// @route   GET /api/productCategory/getAll
// @access  Public
exports.getAllProductCategories = async (req, res) => {
  try {
    const productCategories = await ProductCategory.find().sort({ name: 1 });

    res.status(200).json({
      success: true,
      count: productCategories.length,
      data: productCategories
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get single product category
// @route   GET /api/productCategory/get/:id
// @access  Public
exports.getProductCategory = async (req, res) => {
  try {
    const { id } = req.params;

    // Find category by UUID or MongoDB ID
    const productCategory = await ProductCategory.findOne({
      $or: [
        { _id: id },
        { uuid: id }
      ]
    });

    if (!productCategory) {
      return res.status(404).json({
        success: false,
        message: 'Product category not found'
      });
    }

    res.status(200).json({
      success: true,
      data: productCategory
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};