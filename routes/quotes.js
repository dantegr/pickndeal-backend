const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  createQuote,
  updateQuote,
  deleteQuote,
  updateQuoteState,
  getMyQuoteForRequirement,
  getQuotesByQuoterId,
  getQuotesByRequirementId
} = require('../controllers/quoteController');

// All routes are protected (require authentication)
router.post('/create', protect, createQuote);
router.put('/update/:id', protect, updateQuote);
router.delete('/delete/:id', protect, deleteQuote);
router.patch('/updateState/:id', protect, updateQuoteState);
router.get('/myQuote/:requirementId', protect, getMyQuoteForRequirement);
router.get('/byQuoter/:quoterId', protect, getQuotesByQuoterId);
router.get('/byRequirement/:requirementId', protect, getQuotesByRequirementId);

module.exports = router;