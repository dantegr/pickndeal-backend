const Requirement = require('../models/Requirement');
const User = require('../models/User');

// @desc    Create new requirement
// @route   POST /api/requirement/create
// @access  Private
exports.createRequirement = async (req, res) => {
  try {
    const {
      title,
      description,
      categories,
      quantity,
      recurring,
      location,
      deliveryDate,
      budget
    } = req.body;

    // Validate required fields
    if (!title || !description || !location || !deliveryDate || !budget || quantity === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }

    // Validate quantity is a positive number
    if (quantity < 0) {
      return res.status(400).json({
        success: false,
        message: 'Quantity must be a positive number'
      });
    }

    // Get user details for postedByName
    const user = await User.findById(req.user.id);
    
    // Create new requirement
    const requirement = await Requirement.create({
      title,
      description,
      categories: categories || [],
      quantity,
      recurring: recurring || false,
      location,
      deliveryDate,
      budget,
      postedBy: req.user.id,
      postedByName: user.name || 'Unknown User',
      state: 'CREATED'
    });

    res.status(201).json({
      success: true,
      data: requirement
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update requirement
// @route   PUT /api/requirement/update/:id
// @access  Private
exports.updateRequirement = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Find requirement by UUID or MongoDB ID
    let requirement = await Requirement.findOne({
      $or: [
        { _id: id },
        { uuid: id }
      ]
    });

    if (!requirement) {
      return res.status(404).json({
        success: false,
        message: 'Requirement not found'
      });
    }

    // Check if user is the owner of the requirement
    if (requirement.postedBy.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this requirement'
      });
    }

    // Update allowed fields
    const allowedUpdates = [
      'title',
      'description',
      'state',
      'categories',
      'quantity',
      'recurring',
      'location',
      'deliveryDate',
      'budget'
    ];

    allowedUpdates.forEach(field => {
      if (updates[field] !== undefined) {
        requirement[field] = updates[field];
      }
    });

    // Validate state if being updated
    if (updates.state) {
      const validStates = ['CREATED', 'ACTIVE', 'PROCESSING', 'COMPLETED'];
      if (!validStates.includes(updates.state)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid state value'
        });
      }
    }

    await requirement.save();

    res.status(200).json({
      success: true,
      data: requirement
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete requirement
// @route   DELETE /api/requirement/delete/:id
// @access  Private
exports.deleteRequirement = async (req, res) => {
  try {
    const { id } = req.params;

    // Find requirement by UUID or MongoDB ID
    const requirement = await Requirement.findOne({
      $or: [
        { _id: id },
        { uuid: id }
      ]
    });

    if (!requirement) {
      return res.status(404).json({
        success: false,
        message: 'Requirement not found'
      });
    }

    // Check if user is the owner of the requirement
    if (requirement.postedBy.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this requirement'
      });
    }

    await requirement.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Requirement deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get all requirements
// @route   GET /api/requirement/getAll
// @access  Private
exports.getAllRequirements = async (req, res) => {
  try {
    const { state, postedBy } = req.query;
    
    // Build query
    const query = {};
    
    if (state) {
      query.state = state;
    }
    
    if (postedBy) {
      query.postedBy = postedBy;
    }

    const requirements = await Requirement.find(query)
      .populate('postedBy', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: requirements.length,
      data: requirements
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get single requirement
// @route   GET /api/requirement/get/:id
// @access  Private
exports.getRequirement = async (req, res) => {
  try {
    const { id } = req.params;

    // Find requirement by UUID or MongoDB ID
    const requirement = await Requirement.findOne({
      $or: [
        { _id: id },
        { uuid: id }
      ]
    }).populate('postedBy', 'name email phone_number');

    if (!requirement) {
      return res.status(404).json({
        success: false,
        message: 'Requirement not found'
      });
    }

    res.status(200).json({
      success: true,
      data: requirement
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get my requirements
// @route   GET /api/requirement/my
// @access  Private
exports.getMyRequirements = async (req, res) => {
  try {
    const requirements = await Requirement.find({ postedBy: req.user.id })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: requirements.length,
      data: requirements
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update requirement state
// @route   PATCH /api/requirement/updateState/:id
// @access  Private
exports.updateRequirementState = async (req, res) => {
  try {
    const { id } = req.params;
    const { state } = req.body;

    // Validate state
    const validStates = ['CREATED', 'ACTIVE', 'PROCESSING', 'COMPLETED'];
    if (!state || !validStates.includes(state)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid state'
      });
    }

    // Find requirement by UUID or MongoDB ID
    let requirement = await Requirement.findOne({
      $or: [
        { _id: id },
        { uuid: id }
      ]
    });

    if (!requirement) {
      return res.status(404).json({
        success: false,
        message: 'Requirement not found'
      });
    }

    // Check if user is the owner of the requirement
    if (requirement.postedBy.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this requirement'
      });
    }

    requirement.state = state;
    await requirement.save();

    res.status(200).json({
      success: true,
      data: requirement
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};