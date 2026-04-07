const express = require('express');
const router = express.Router();
const { body, param } = require('express-validator');
const Banner = require('../models/Banner');
const { protect, authorize } = require('../middleware/auth');
const { validateRequest } = require('../middleware/validate');

// All banner routes require authentication and admin role
router.use(protect);
router.use(authorize('admin'));

// @route   GET /api/banners
// @desc    Get all banners
// @access  Private/Admin
router.get('/', async (req, res) => {
    try {
        const banners = await Banner.find().sort({ order: 1, createdAt: -1 });
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

// @route   POST /api/banners
// @desc    Create new banner
// @access  Private/Admin
router.post(
    '/',
    [
        body('title', 'Title is required').notEmpty().trim(),
        body('image', 'Image is required').notEmpty().isString(),
        body('description', 'Description must be a string').optional().isString(),
        body('buttonText', 'Button text must be a string').optional().isString(),
        body('buttonUrl', 'Button URL must be a string').optional().isString(),
        body('order', 'Order must be a number').optional().isInt({ min: 0 }),
        body('status', 'Status must be active or inactive').optional().isIn(['active', 'inactive']),
        body('section', 'Section must be a string').optional().isString(),
        validateRequest,
    ],
    async (req, res) => {
    try {
        const banner = await Banner.create(req.body);
        res.status(201).json({
            success: true,
            data: banner,
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message || 'Invalid data',
        });
    }
});

// @route   PUT /api/banners/:id
// @desc    Update banner
// @access  Private/Admin
router.put(
    '/:id',
    [
        param('id', 'Invalid banner id').isMongoId(),
        body('title', 'Title must be a string').optional().isString(),
        body('image', 'Image must be a string').optional().isString(),
        body('description', 'Description must be a string').optional().isString(),
        body('buttonText', 'Button text must be a string').optional().isString(),
        body('buttonUrl', 'Button URL must be a string').optional().isString(),
        body('order', 'Order must be a number').optional().isInt({ min: 0 }),
        body('status', 'Status must be active or inactive').optional().isIn(['active', 'inactive']),
        body('section', 'Section must be a string').optional().isString(),
        validateRequest,
    ],
    async (req, res) => {
    try {
        const banner = await Banner.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });

        if (!banner) {
            return res.status(404).json({
                success: false,
                message: 'Banner not found',
            });
        }

        res.status(200).json({
            success: true,
            data: banner,
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message || 'Invalid data',
        });
    }
});

// @route   DELETE /api/banners/:id
// @desc    Delete banner
// @access  Private/Admin
router.delete(
    '/:id',
    [param('id', 'Invalid banner id').isMongoId(), validateRequest],
    async (req, res) => {
    try {
        const banner = await Banner.findByIdAndDelete(req.params.id);

        if (!banner) {
            return res.status(404).json({
                success: false,
                message: 'Banner not found',
            });
        }

        res.status(200).json({
            success: true,
            message: 'Banner deleted successfully',
            data: {},
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Server error',
        });
    }
});

module.exports = router;
