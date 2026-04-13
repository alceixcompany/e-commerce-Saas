const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const productsController = require('../modules/products/products.controller');
const productsValidators = require('../modules/products/products.validators');

// All product routes require authentication and admin role
router.use(protect);
router.use(authorize('admin'));

// @route   GET /api/products
// @desc    Get all products
// @access  Private/Admin
router.get('/', productsValidators.listProductsValidators, productsController.listProducts);

// @route   GET /api/products/:id
// @desc    Get single product
// @access  Private/Admin
router.get('/:id', productsValidators.getProductValidators, productsController.getProduct);

// @route   POST /api/products
// @desc    Create new product
// @access  Private/Admin
router.post('/', productsValidators.createProductValidators, productsController.createProduct);

// @route   PUT /api/products/:id
// @desc    Update product
// @access  Private/Admin
router.put('/:id', productsValidators.updateProductValidators, productsController.updateProduct);

// @route   DELETE /api/products/:id
// @desc    Delete product and its associated images
// @access  Private/Admin
router.delete('/:id', productsValidators.deleteProductValidators, productsController.deleteProduct);

// @route   POST /api/products/bulk-delete
// @desc    Bulk delete products and their associated images
// @access  Private/Admin
router.post('/bulk-delete', productsValidators.bulkDeleteProductsValidators, productsController.bulkDeleteProducts);

module.exports = router;
