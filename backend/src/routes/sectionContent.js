const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const sectionController = require('../modules/sectionContent/sectionContent.controller');
const sectionValidators = require('../modules/sectionContent/sectionContent.validators');

// All layout routes require authentication and admin role
router.use(protect);
router.use(authorize('admin'));

// @route   GET /api/section-content/:identifier
// @desc    Get section content by identifier
// @access  Private/Admin
router.get('/:identifier', sectionValidators.getSectionValidators, sectionController.getSection);

// @route   PUT /api/section-content/:identifier
// @desc    Update section content
// @access  Private/Admin
router.put('/:identifier', sectionValidators.updateSectionValidators, sectionController.updateSection);

module.exports = router;
