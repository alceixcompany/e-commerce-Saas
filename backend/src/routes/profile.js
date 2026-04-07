const express = require('express');
const router = express.Router();
const { body, param } = require('express-validator');
const User = require('../models/User');
const { protect } = require('../middleware/auth');
const { validateRequest } = require('../middleware/validate');

// @route   GET /api/profile
// @desc    Get user profile
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select('-password')
      .populate({
        path: 'wishlist',
        select: 'name price discountedPrice mainImage image'
      })
      .populate({
        path: 'cart.product',
        select: 'name price discountedPrice mainImage image'
      });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Filter out null products from cart and wishlist (in case products were deleted)
    user.cart = user.cart.filter(item => item.product !== null);
    user.wishlist = user.wishlist.filter(item => item !== null);

    // Save if any items were removed
    if (user.isModified('cart') || user.isModified('wishlist')) {
      await user.save();
    }

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
});

// @route   PUT /api/profile
// @desc    Update user profile
// @access  Private
router.put(
  '/',
  protect,
  [
    body('name', 'Name must be a string').optional().isString(),
    body('phone', 'Phone must be a string').optional().isString(),
    body('profileImage', 'Profile image must be a string').optional().isString(),
    validateRequest,
  ],
  async (req, res) => {
  try {
    const { name, phone, profileImage } = req.body;

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Update fields
    if (name) user.name = name;
    if (phone !== undefined) user.phone = phone;
    if (profileImage !== undefined) user.profileImage = profileImage;

    await user.save();

    // Return user without password
    const updatedUser = await User.findById(user._id).select('-password');

    res.json({
      success: true,
      data: updatedUser,
      message: 'Profile updated successfully',
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
});

// @route   POST /api/profile/address
// @desc    Add new address
// @access  Private
router.post(
  '/address',
  protect,
  [
    body('title', 'Title is required').notEmpty().trim(),
    body('fullAddress', 'Full address is required').notEmpty().trim(),
    body('city', 'City is required').notEmpty().trim(),
    body('district', 'District is required').notEmpty().trim(),
    body('postalCode', 'Postal code is required').notEmpty().trim(),
    body('phone', 'Phone is required').notEmpty().trim(),
    body('isDefault', 'isDefault must be boolean').optional().isBoolean(),
    validateRequest,
  ],
  async (req, res) => {
  try {
    const { title, fullAddress, city, district, postalCode, phone, isDefault } = req.body;

    // Validation
    if (!title || !fullAddress || !city || !district || !postalCode || !phone) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required address fields',
      });
    }

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // If this is set as default, unset other defaults
    if (isDefault) {
      user.addresses.forEach(addr => {
        addr.isDefault = false;
      });
    }

    // Add new address
    user.addresses.push({
      title,
      fullAddress,
      city,
      district,
      postalCode,
      phone,
      isDefault: isDefault || user.addresses.length === 0, // First address is default
    });

    await user.save();

    const updatedUser = await User.findById(user._id).select('-password');

    res.status(201).json({
      success: true,
      data: updatedUser,
      message: 'Address added successfully',
    });
  } catch (error) {
    console.error('Add address error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
});

// @route   PUT /api/profile/address/:addressId
// @desc    Update address
// @access  Private
router.put(
  '/address/:addressId',
  protect,
  [
    param('addressId', 'Invalid address id').isMongoId(),
    body('title', 'Title must be a string').optional().isString(),
    body('fullAddress', 'Full address must be a string').optional().isString(),
    body('city', 'City must be a string').optional().isString(),
    body('district', 'District must be a string').optional().isString(),
    body('postalCode', 'Postal code must be a string').optional().isString(),
    body('phone', 'Phone must be a string').optional().isString(),
    body('isDefault', 'isDefault must be boolean').optional().isBoolean(),
    validateRequest,
  ],
  async (req, res) => {
  try {
    const { title, fullAddress, city, district, postalCode, phone, isDefault } = req.body;

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    const address = user.addresses.id(req.params.addressId);

    if (!address) {
      return res.status(404).json({
        success: false,
        message: 'Address not found',
      });
    }

    // If this is set as default, unset other defaults
    if (isDefault) {
      user.addresses.forEach(addr => {
        addr.isDefault = false;
      });
    }

    // Update fields
    if (title) address.title = title;
    if (fullAddress) address.fullAddress = fullAddress;
    if (city) address.city = city;
    if (district) address.district = district;
    if (postalCode) address.postalCode = postalCode;
    if (phone) address.phone = phone;
    if (isDefault !== undefined) address.isDefault = isDefault;

    await user.save();

    const updatedUser = await User.findById(user._id).select('-password');

    res.json({
      success: true,
      data: updatedUser,
      message: 'Address updated successfully',
    });
  } catch (error) {
    console.error('Update address error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
});

// @route   DELETE /api/profile/address/:addressId
// @desc    Delete address
// @access  Private
router.delete(
  '/address/:addressId',
  protect,
  [param('addressId', 'Invalid address id').isMongoId(), validateRequest],
  async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    const address = user.addresses.id(req.params.addressId);

    if (!address) {
      return res.status(404).json({
        success: false,
        message: 'Address not found',
      });
    }

    // Remove address
    address.deleteOne();

    // If deleted address was default and there are other addresses, make first one default
    if (address.isDefault && user.addresses.length > 0) {
      user.addresses[0].isDefault = true;
    }

    await user.save();

    const updatedUser = await User.findById(user._id).select('-password');

    res.json({
      success: true,
      data: updatedUser,
      message: 'Address deleted successfully',
    });
  } catch (error) {
    console.error('Delete address error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
});

// @route   POST /api/profile/wishlist/:productId
// @desc    Add product to wishlist
// @access  Private
router.post(
  '/wishlist/:productId',
  protect,
  [param('productId', 'Invalid product id').isMongoId(), validateRequest],
  async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Check if product already in wishlist
    if (user.wishlist.includes(req.params.productId)) {
      return res.status(400).json({
        success: false,
        message: 'Product already in wishlist',
      });
    }

    user.wishlist.push(req.params.productId);
    await user.save();

    const updatedUser = await User.findById(user._id)
      .select('-password')
      .populate({
        path: 'wishlist',
        select: 'name price discountedPrice mainImage image'
      });

    res.json({
      success: true,
      data: updatedUser,
      message: 'Product added to wishlist',
    });
  } catch (error) {
    console.error('Add to wishlist error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
});

// @route   DELETE /api/profile/wishlist/:productId
// @desc    Remove product from wishlist
// @access  Private
router.delete(
  '/wishlist/:productId',
  protect,
  [param('productId', 'Invalid product id').isMongoId(), validateRequest],
  async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    user.wishlist = user.wishlist.filter(
      (id) => id.toString() !== req.params.productId
    );

    await user.save();

    const updatedUser = await User.findById(user._id)
      .select('-password')
      .populate({
        path: 'wishlist',
        select: 'name price discountedPrice mainImage image'
      });

    res.json({
      success: true,
      data: updatedUser,
      message: 'Product removed from wishlist',
    });
  } catch (error) {
    console.error('Remove from wishlist error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
});

// @route   GET /api/profile/cart
// @desc    Get user cart
// @access  Private
router.get('/cart', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password').populate('cart.product');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.json({
      success: true,
      data: user.cart,
    });
  } catch (error) {
    console.error('Get cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
});

// @route   POST /api/profile/cart
// @desc    Add product to cart
// @access  Private
router.post(
  '/cart',
  protect,
  [
    body('productId', 'Product ID is required').isMongoId(),
    body('quantity', 'Quantity must be at least 1').optional().isInt({ min: 1 }),
    validateRequest,
  ],
  async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;

    if (!productId) {
      return res.status(400).json({
        success: false,
        message: 'Product ID is required',
      });
    }

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Check if product already in cart
    const existingItem = user.cart.find(
      (item) => item.product.toString() === productId
    );

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      user.cart.push({ product: productId, quantity });
    }

    await user.save();

    const updatedUser = await User.findById(user._id).select('-password').populate('cart.product');

    res.json({
      success: true,
      data: updatedUser.cart,
      message: 'Product added to cart',
    });
  } catch (error) {
    console.error('Add to cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
});

// @route   PUT /api/profile/cart/:productId
// @desc    Update cart item quantity
// @access  Private
router.put(
  '/cart/:productId',
  protect,
  [
    param('productId', 'Invalid product id').isMongoId(),
    body('quantity', 'Quantity must be at least 1').isInt({ min: 1 }),
    validateRequest,
  ],
  async (req, res) => {
  try {
    const { quantity } = req.body;

    if (!quantity || quantity < 1) {
      return res.status(400).json({
        success: false,
        message: 'Valid quantity is required',
      });
    }

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    const cartItem = user.cart.find(
      (item) => item.product.toString() === req.params.productId
    );

    if (!cartItem) {
      return res.status(404).json({
        success: false,
        message: 'Product not found in cart',
      });
    }

    cartItem.quantity = quantity;
    await user.save();

    const updatedUser = await User.findById(user._id).select('-password').populate('cart.product');

    res.json({
      success: true,
      data: updatedUser.cart,
      message: 'Cart updated',
    });
  } catch (error) {
    console.error('Update cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
});

// @route   DELETE /api/profile/cart/:productId
// @desc    Remove product from cart
// @access  Private
router.delete(
  '/cart/:productId',
  protect,
  [param('productId', 'Invalid product id').isMongoId(), validateRequest],
  async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    user.cart = user.cart.filter(
      (item) => item.product.toString() !== req.params.productId
    );

    await user.save();

    const updatedUser = await User.findById(user._id).select('-password').populate('cart.product');

    res.json({
      success: true,
      data: updatedUser.cart,
      message: 'Product removed from cart',
    });
  } catch (error) {
    console.error('Remove from cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
});

// @route   DELETE /api/profile/cart
// @desc    Clear cart
// @access  Private
router.delete('/cart', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    user.cart = [];
    await user.save();

    res.json({
      success: true,
      data: [],
      message: 'Cart cleared',
    });
  } catch (error) {
    console.error('Clear cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
});

module.exports = router;
