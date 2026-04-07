const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const pagesController = require('../modules/pages/pages.controller');
const pagesValidators = require('../modules/pages/pages.validators');

// @route   GET /api/pages
// @desc    Get all custom pages
// @access  Public
router.get('/', pagesValidators.listPagesValidators, pagesController.listPages);

// @route   GET /api/pages/:slug
// @desc    Get single page by slug
// @access  Public
router.get('/:slug', pagesValidators.getPageValidators, pagesController.getPage);

// @route   POST /api/pages
// @desc    Create a new custom page
// @access  Private/Admin
router.post('/', protect, authorize('admin'), pagesValidators.createPageValidators, pagesController.createPage);

// @route   PUT /api/pages/:id
// @desc    Update a custom page
// @access  Private/Admin
router.put('/:id', protect, authorize('admin'), pagesValidators.updatePageValidators, pagesController.updatePage);

// @route   DELETE /api/pages/:id
// @desc    Delete a custom page
// @access  Private/Admin
router.delete('/:id', protect, authorize('admin'), pagesValidators.deletePageValidators, pagesController.deletePage);

module.exports = router;
