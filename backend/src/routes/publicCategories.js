const express = require('express');
const router = express.Router();
const publicCategoriesController = require('../modules/publicCategories/publicCategories.controller');
const publicCategoriesValidators = require('../modules/publicCategories/publicCategories.validators');

// @route   GET /api/public/categories
// @desc    Get all active categories with product counts
// @access  Public
router.get('/', publicCategoriesController.listCategories);

// @route   GET /api/public/categories/:id
// @desc    Get single active category (public access)
// @access  Public
router.get('/:id', publicCategoriesValidators.getCategoryValidators, publicCategoriesController.getCategory);

module.exports = router;
