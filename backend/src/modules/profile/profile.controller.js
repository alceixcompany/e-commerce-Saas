const profileService = require('./profile.service');
const logger = require('../../utils/logger');

const getProfile = async (req, res) => {
    try {
        const user = await profileService.getProfile(req.user._id);
        res.json({ success: true, data: user });
    } catch (error) {
        logger.error('Get profile error:', error);
        res.status(error.statusCode || 500).json({ success: false, message: error.statusCode ? error.message : 'Server error' });
    }
};

const updateProfile = async (req, res) => {
    try {
        const user = await profileService.updateProfile(req.user._id, req.body);
        res.json({ success: true, data: user, message: 'Profile updated successfully' });
    } catch (error) {
        logger.error('Update profile error:', error);
        res.status(error.statusCode || 500).json({ success: false, message: error.statusCode ? error.message : 'Server error' });
    }
};

const addAddress = async (req, res) => {
    try {
        const user = await profileService.addAddress(req.user._id, req.body);
        res.status(201).json({ success: true, data: user, message: 'Address added successfully' });
    } catch (error) {
        logger.error('Add address error:', error);
        res.status(error.statusCode || 500).json({ success: false, message: error.statusCode ? error.message : 'Server error' });
    }
};

const updateAddress = async (req, res) => {
    try {
        const user = await profileService.updateAddress(req.user._id, req.params.addressId, req.body);
        res.json({ success: true, data: user, message: 'Address updated successfully' });
    } catch (error) {
        logger.error('Update address error:', error);
        res.status(error.statusCode || 500).json({ success: false, message: error.statusCode ? error.message : 'Server error' });
    }
};

const deleteAddress = async (req, res) => {
    try {
        const user = await profileService.deleteAddress(req.user._id, req.params.addressId);
        res.json({ success: true, data: user, message: 'Address deleted successfully' });
    } catch (error) {
        logger.error('Delete address error:', error);
        res.status(error.statusCode || 500).json({ success: false, message: error.statusCode ? error.message : 'Server error' });
    }
};

const addToWishlist = async (req, res) => {
    try {
        const user = await profileService.addToWishlist(req.user._id, req.params.productId);
        res.json({ success: true, data: user, message: 'Product added to wishlist' });
    } catch (error) {
        logger.error('Add to wishlist error:', error);
        res.status(error.statusCode || 500).json({ success: false, message: error.statusCode ? error.message : 'Server error' });
    }
};

const removeFromWishlist = async (req, res) => {
    try {
        const user = await profileService.removeFromWishlist(req.user._id, req.params.productId);
        res.json({ success: true, data: user, message: 'Product removed from wishlist' });
    } catch (error) {
        logger.error('Remove from wishlist error:', error);
        res.status(error.statusCode || 500).json({ success: false, message: error.statusCode ? error.message : 'Server error' });
    }
};

const getCart = async (req, res) => {
    try {
        const cart = await profileService.getCart(req.user._id);
        res.json({ success: true, data: cart });
    } catch (error) {
        logger.error('Get cart error:', error);
        res.status(error.statusCode || 500).json({ success: false, message: error.statusCode ? error.message : 'Server error' });
    }
};

const addToCart = async (req, res) => {
    try {
        const cart = await profileService.addToCart(req.user._id, req.body.productId, req.body.quantity);
        res.json({ success: true, data: cart, message: 'Product added to cart' });
    } catch (error) {
        logger.error('Add to cart error:', error);
        res.status(error.statusCode || 500).json({ success: false, message: error.statusCode ? error.message : 'Server error' });
    }
};

const updateCart = async (req, res) => {
    try {
        const cart = await profileService.updateCartItem(req.user._id, req.params.productId, req.body.quantity);
        res.json({ success: true, data: cart, message: 'Cart updated' });
    } catch (error) {
        logger.error('Update cart error:', error);
        res.status(error.statusCode || 500).json({ success: false, message: error.statusCode ? error.message : 'Server error' });
    }
};

const removeFromCart = async (req, res) => {
    try {
        const cart = await profileService.removeFromCart(req.user._id, req.params.productId);
        res.json({ success: true, data: cart, message: 'Product removed from cart' });
    } catch (error) {
        logger.error('Remove from cart error:', error);
        res.status(error.statusCode || 500).json({ success: false, message: error.statusCode ? error.message : 'Server error' });
    }
};

const clearCart = async (req, res) => {
    try {
        const cart = await profileService.clearCart(req.user._id);
        res.json({ success: true, data: cart, message: 'Cart cleared' });
    } catch (error) {
        logger.error('Clear cart error:', error);
        res.status(error.statusCode || 500).json({ success: false, message: error.statusCode ? error.message : 'Server error' });
    }
};

module.exports = {
    getProfile,
    updateProfile,
    addAddress,
    updateAddress,
    deleteAddress,
    addToWishlist,
    removeFromWishlist,
    getCart,
    addToCart,
    updateCart,
    removeFromCart,
    clearCart,
};
