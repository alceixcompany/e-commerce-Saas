const express = require('express');
const router = express.Router();
const publicBannersController = require('../modules/publicBanners/publicBanners.controller');

// @route   GET /api/public/banners
// @desc    Get all active banners
// @access  Public
router.get('/', publicBannersController.listBanners);

module.exports = router;
