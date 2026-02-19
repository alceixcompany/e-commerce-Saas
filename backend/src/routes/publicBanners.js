const express = require('express');
const router = express.Router();
const Banner = require('../models/Banner');

// @route   GET /api/public/banners
// @desc    Get all active banners
// @access  Public
router.get('/', async (req, res) => {
    try {
        const banners = await Banner.find({ status: 'active' }).sort({ order: 1, createdAt: -1 });

        res.status(200).json({
            success: true,
            count: banners.length,
            data: banners,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Server error',
        });
    }
});

module.exports = router;
