const express = require('express');
const router = express.Router();
const publicProductsController = require('../modules/publicProducts/publicProducts.controller');
const publicProductsValidators = require('../modules/publicProducts/publicProducts.validators');

// @route   GET /api/public/products/ids
// @desc    Get products by their IDs
// @access  Public
router.get('/ids', publicProductsValidators.idsValidators, publicProductsController.getProductsByIds);

// @route   GET /api/public/products/stats
// @desc    Get product stats (counts for new arrivals, etc)
// @access  Public
router.get('/stats', publicProductsController.getStats);

// @route   GET /api/public/products/search
// @desc    Search products by name, description, or SKU
// @access  Public
router.get('/search', publicProductsValidators.searchValidators, publicProductsController.searchProducts);

// @route   GET /api/public/products
// @desc    Get all active products (public)
// @access  Public
router.get('/', publicProductsValidators.listValidators, publicProductsController.listProducts);

// @route   GET /api/public/products/:id
// @desc    Get single product by ID (public)
// @access  Public
router.get('/:id', publicProductsValidators.getProductValidators, publicProductsController.getProductById);

module.exports = router;
