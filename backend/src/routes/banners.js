const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const bannersController = require('../modules/banners/banners.controller');
const bannersValidators = require('../modules/banners/banners.validators');

// All banner routes require authentication and admin role
router.use(protect);
router.use(authorize('admin'));

// @route   GET /api/banners
// @desc    Get all banners
// @access  Private/Admin
router.get('/', bannersValidators.listBannersValidators, bannersController.listBanners);

// @route   POST /api/banners
// @desc    Create new banner
// @access  Private/Admin
router.post('/', bannersValidators.createBannerValidators, bannersController.createBanner);

// @route   PUT /api/banners/:id
// @desc    Update banner
// @access  Private/Admin
router.put('/:id', bannersValidators.updateBannerValidators, bannersController.updateBanner);

// @route   DELETE /api/banners/:id
// @desc    Delete banner
// @access  Private/Admin
router.delete('/:id', bannersValidators.deleteBannerValidators, bannersController.deleteBanner);

module.exports = router;
