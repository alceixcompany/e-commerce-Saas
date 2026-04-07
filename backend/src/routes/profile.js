const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const profileController = require('../modules/profile/profile.controller');
const profileValidators = require('../modules/profile/profile.validators');

// @route   GET /api/profile
// @desc    Get user profile
// @access  Private
router.get('/', protect, profileController.getProfile);

// @route   PUT /api/profile
// @desc    Update user profile
// @access  Private
router.put('/', protect, profileValidators.updateProfileValidators, profileController.updateProfile);

// @route   POST /api/profile/address
// @desc    Add new address
// @access  Private
router.post('/address', protect, profileValidators.addAddressValidators, profileController.addAddress);

// @route   PUT /api/profile/address/:addressId
// @desc    Update address
// @access  Private
router.put('/address/:addressId', protect, profileValidators.updateAddressValidators, profileController.updateAddress);

// @route   DELETE /api/profile/address/:addressId
// @desc    Delete address
// @access  Private
router.delete('/address/:addressId', protect, profileValidators.deleteAddressValidators, profileController.deleteAddress);

// @route   POST /api/profile/wishlist/:productId
// @desc    Add product to wishlist
// @access  Private
router.post('/wishlist/:productId', protect, profileValidators.wishlistValidators, profileController.addToWishlist);

// @route   DELETE /api/profile/wishlist/:productId
// @desc    Remove product from wishlist
// @access  Private
router.delete('/wishlist/:productId', protect, profileValidators.wishlistValidators, profileController.removeFromWishlist);

// @route   GET /api/profile/cart
// @desc    Get user cart
// @access  Private
router.get('/cart', protect, profileController.getCart);

// @route   POST /api/profile/cart
// @desc    Add product to cart
// @access  Private
router.post('/cart', protect, profileValidators.addToCartValidators, profileController.addToCart);

// @route   PUT /api/profile/cart/:productId
// @desc    Update cart item quantity
// @access  Private
router.put('/cart/:productId', protect, profileValidators.updateCartValidators, profileController.updateCart);

// @route   DELETE /api/profile/cart/:productId
// @desc    Remove product from cart
// @access  Private
router.delete('/cart/:productId', protect, profileValidators.removeCartItemValidators, profileController.removeFromCart);

// @route   DELETE /api/profile/cart
// @desc    Clear cart
// @access  Private
router.delete('/cart', protect, profileController.clearCart);

module.exports = router;
