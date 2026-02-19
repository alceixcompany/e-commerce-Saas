const express = require('express');
const router = express.Router();
const SectionContent = require('../models/SectionContent');
const { protect, authorize } = require('../middleware/auth');

// All layout routes require authentication and admin role
router.use(protect);
router.use(authorize('admin'));

// @route   GET /api/section-content/:identifier
// @desc    Get section content by identifier
// @access  Private/Admin
router.get('/:identifier', async (req, res) => {
    try {
        const { identifier } = req.params;
        let section = await SectionContent.findOne({ identifier });

        // Return empty config if not found, don't 404
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
        res.status(500).json({
            success: false,
            message: error.message || 'Server error',
        });
    }
});

// @route   PUT /api/section-content/:identifier
// @desc    Update section content
// @access  Private/Admin
router.put('/:identifier', async (req, res) => {
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
