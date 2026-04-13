const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const categoriesController = require('../modules/categories/categories.controller');
const categoriesValidators = require('../modules/categories/categories.validators');

// All category routes require authentication and admin role
router.use(protect);
router.use(authorize('admin'));

// @route   GET /api/categories
// @desc    Get all categories
// @access  Private/Admin
router.get('/', categoriesValidators.listCategoriesValidators, categoriesController.listCategories);

// @route   GET /api/categories/:id
// @desc    Get single category
// @access  Private/Admin
router.get('/:id', categoriesValidators.getCategoryValidators, categoriesController.getCategory);

// @route   POST /api/categories
// @desc    Create new category
// @access  Private/Admin
router.post('/', categoriesValidators.createCategoryValidators, categoriesController.createCategory);

// @route   PUT /api/categories/:id
// @desc    Update category
// @access  Private/Admin
router.put('/:id', categoriesValidators.updateCategoryValidators, categoriesController.updateCategory);

// @route   DELETE /api/categories/:id
// @desc    Delete category and its associated images
// @access  Private/Admin
router.delete('/:id', categoriesValidators.deleteCategoryValidators, categoriesController.deleteCategory);

// @route   POST /api/categories/bulk-delete
// @desc    Bulk delete categories and their associated products/images
// @access  Private/Admin
router.post('/bulk-delete', categoriesValidators.bulkDeleteCategoriesValidators, categoriesController.bulkDeleteCategories);

module.exports = router;
