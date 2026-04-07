const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const componentsController = require('../modules/components/components.controller');
const componentsValidators = require('../modules/components/components.validators');

// @route   GET /api/components
// @desc    Get all component instances or filter by type
// @access  Public (so site frontend can fetch them by ID easily) or Protected
router.get('/', componentsValidators.listComponentsValidators, componentsController.listComponents);

// @route   GET /api/components/:id
// @desc    Get single component instance
// @access  Public
router.get('/:id', componentsValidators.getComponentValidators, componentsController.getComponent);

// @route   POST /api/components
// @desc    Create new component instance
// @access  Private/Admin
router.post('/', protect, authorize('admin'), componentsValidators.createComponentValidators, componentsController.createComponent);

// @route   PUT /api/components/:id
// @desc    Update component instance
// @access  Private/Admin
router.put('/:id', protect, authorize('admin'), componentsValidators.updateComponentValidators, componentsController.updateComponent);

// @route   DELETE /api/components/:id
// @desc    Delete component instance
// @access  Private/Admin
router.delete('/:id', protect, authorize('admin'), componentsValidators.deleteComponentValidators, componentsController.deleteComponent);

module.exports = router;
