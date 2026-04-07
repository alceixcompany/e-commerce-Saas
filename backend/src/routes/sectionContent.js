const express = require('express');
const router = express.Router();
const { body, param } = require('express-validator');
const SectionContent = require('../models/SectionContent');
const { protect, authorize } = require('../middleware/auth');
const { validateRequest } = require('../middleware/validate');

const allowedIdentifiers = [
    'popular_collections',
    'footer_config',
    'contact_info',
    'global_settings',
    'payment_settings',
    'home_settings',
    'product_settings',
    'about_settings',
    'contact_settings',
    'auth_settings',
    'privacy_policy',
    'terms_of_service',
    'accessibility'
];

// All layout routes require authentication and admin role
router.use(protect);
router.use(authorize('admin'));

// @route   GET /api/section-content/:identifier
// @desc    Get section content by identifier
// @access  Private/Admin
router.get(
    '/:identifier',
    [
        param('identifier', 'Invalid identifier').isIn(allowedIdentifiers),
        validateRequest,
    ],
    async (req, res) => {
    try {
        const { identifier } = req.params;
        let section = await SectionContent.findOne({ identifier });


        // Return empty config if still not found
        if (!section) {
            return res.status(200).json({
                success: true,
                data: { identifier, content: {} },
            });
        }

        res.status(200).json({
            success: true,
            data: section,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: error.message || 'Server error',
        });
    }
});

// @route   PUT /api/section-content/:identifier
// @desc    Update section content
// @access  Private/Admin
router.put(
    '/:identifier',
    [
        param('identifier', 'Invalid identifier').isIn(allowedIdentifiers),
        body('content', 'Content is required').exists(),
        validateRequest,
    ],
    async (req, res) => {
    try {
        const { identifier } = req.params;
        const { content } = req.body;

        const section = await SectionContent.findOneAndUpdate(
            { identifier },
            { content },
            { new: true, upsert: true, setDefaultsOnInsert: true }
        );

        res.status(200).json({
            success: true,
            data: section,
            message: 'Section content updated successfully'
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message || 'Invalid data',
        });
    }
});

module.exports = router;
