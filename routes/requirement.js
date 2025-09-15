const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  createRequirement,
  updateRequirement,
  deleteRequirement,
  getAllRequirements,
  getRequirement,
  getMyRequirements,
  updateRequirementState
} = require('../controllers/requirementController');

// All routes are protected (require authentication)
router.post('/create', protect, createRequirement);
router.put('/update/:id', protect, updateRequirement);
router.delete('/delete/:id', protect, deleteRequirement);
router.get('/getAll', protect, getAllRequirements);
router.get('/my', protect, getMyRequirements);
router.get('/get/:id', protect, getRequirement);
router.patch('/updateState/:id', protect, updateRequirementState);

module.exports = router;