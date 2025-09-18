const Quote = require('../models/Quote');
const Requirement = require('../models/Requirement');
const User = require('../models/User');

// @desc    Create new quote
// @route   POST /api/quotes/create
// @access  Private
exports.createQuote = async (req, res) => {
  try {
    const {
      requirementId,
      canDeliver,
      deliveryDate,
      proposedAmount,
      details
    } = req.body;

    // Validate required fields
    if (!requirementId || !deliveryDate || !proposedAmount) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }

    // Verify requirement exists
    const requirement = await Requirement.findOne({ uuid: requirementId });
    if (!requirement) {
      return res.status(404).json({
        success: false,
        message: 'Requirement not found'
      });
    }

    // Check if user has already quoted for this requirement
    if (requirement.quotedUsers && requirement.quotedUsers.includes(req.user.id)) {
      return res.status(400).json({
        success: false,
        message: 'You have already submitted a quote for this requirement'
      });
    }

    // Create quote data
    const quoteData = {
      requirementId,
      requirementOwnerId: requirement.postedBy.toString(),
      quoterId: req.user.id,
      canDeliver: canDeliver || false,
      deliveryDate,
      proposedAmount,
      details
    };

    // Create new quote
    const quote = await Quote.create(quoteData);

    // Update quotes count and add user to quotedUsers array
    await Requirement.findOneAndUpdate(
      { uuid: requirementId },
      {
        $inc: { quotesCount: 1 },
        $addToSet: { quotedUsers: req.user.id }
      }
    );

    res.status(201).json({
      success: true,
      data: quote
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update quote
// @route   PUT /api/quotes/update/:id
// @access  Private
exports.updateQuote = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Find quote by UUID
    const quote = await Quote.findOne({ uuid: id });

    if (!quote) {
      return res.status(404).json({
        success: false,
        message: 'Quote not found'
      });
    }

    // Check if user is the owner of the quote
    if (quote.quoterId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to update this quote'
      });
    }

    // Remove fields that shouldn't be updated
    delete updates.uuid;
    delete updates.quoterId;
    delete updates.requirementId;
    delete updates.requirementOwnerId;
    delete updates.state; // State should be updated through updateQuoteState

    // Update quote
    const updatedQuote = await Quote.findOneAndUpdate(
      { uuid: id },
      updates,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      data: updatedQuote
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete quote
// @route   DELETE /api/quotes/delete/:id
// @access  Private
exports.deleteQuote = async (req, res) => {
  try {
    const { id } = req.params;

    // Find quote by UUID
    const quote = await Quote.findOne({ uuid: id });

    if (!quote) {
      return res.status(404).json({
        success: false,
        message: 'Quote not found'
      });
    }

    // Check if user is the owner of the quote
    if (quote.quoterId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to delete this quote'
      });
    }

    // Delete quote
    await Quote.findOneAndDelete({ uuid: id });

    // Update quotes count and remove user from quotedUsers array
    await Requirement.findOneAndUpdate(
      { uuid: quote.requirementId },
      {
        $inc: { quotesCount: -1 },
        $pull: { quotedUsers: quote.quoterId }
      }
    );

    res.json({
      success: true,
      message: 'Quote deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get user's quote for a specific requirement
// @route   GET /api/quotes/myQuote/:requirementId
// @access  Private
exports.getMyQuoteForRequirement = async (req, res) => {
  try {
    const { requirementId } = req.params;
    const userId = req.user.id;

    // Find the user's quote for this requirement
    const quote = await Quote.findOne({
      requirementId,
      quoterId: userId
    });

    if (!quote) {
      return res.status(404).json({
        success: false,
        message: 'No quote found for this requirement'
      });
    }

    res.json({
      success: true,
      data: quote
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get all quotes by quoter ID
// @route   GET /api/quotes/byQuoter/:quoterId
// @access  Private
exports.getQuotesByQuoterId = async (req, res) => {
  try {
    const { quoterId } = req.params;

    // Find all quotes by quoter ID
    const quotes = await Quote.find({ quoterId }).sort({ createdAt: -1 }).lean();

    // Hydrate each quote with requirement data
    const quotesWithRequirements = await Promise.all(
      quotes.map(async (quote) => {
        const requirement = await Requirement.findOne({ uuid: quote.requirementId }).lean();
        return {
          ...quote,
          requirement: requirement || null
        };
      })
    );

    res.json({
      success: true,
      count: quotesWithRequirements.length,
      data: quotesWithRequirements
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update quote state
// @route   PATCH /api/quotes/updateState/:id
// @access  Private
exports.updateQuoteState = async (req, res) => {
  try {
    const { id } = req.params;
    const { state } = req.body;

    // Validate state
    const validStates = ['CREATED', 'ACCEPTED', 'DECLINED'];
    if (!state || !validStates.includes(state)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid state. Must be one of: CREATED, ACCEPTED, DECLINED'
      });
    }

    // Find quote by UUID
    const quote = await Quote.findOne({ uuid: id });

    if (!quote) {
      return res.status(404).json({
        success: false,
        message: 'Quote not found'
      });
    }

    // Check if user is the requirement owner (only requirement owner can accept/decline quotes)
    if (quote.requirementOwnerId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to change the state of this quote'
      });
    }

    // Update quote state
    const updatedQuote = await Quote.findOneAndUpdate(
      { uuid: id },
      { state },
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      data: updatedQuote
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get all quotes by requirement ID
// @route   GET /api/quotes/byRequirement/:requirementId
// @access  Private
exports.getQuotesByRequirementId = async (req, res) => {
  try {
    const { requirementId } = req.params;

    // Verify requirement exists
    const requirement = await Requirement.findOne({ uuid: requirementId });
    if (!requirement) {
      return res.status(404).json({
        success: false,
        message: 'Requirement not found'
      });
    }

    // Find all quotes for the requirement
    const quotes = await Quote.find({ requirementId }).sort({ createdAt: -1 });

    res.json({
      success: true,
      count: quotes.length,
      data: quotes
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};