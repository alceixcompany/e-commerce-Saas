const express = require('express');
const router = express.Router();
const SectionContent = require('../models/SectionContent');

// @route   GET /api/public/section-content/:identifier
// @desc    Get section content by identifier
// @access  Public
router.get('/:identifier', async (req, res) => {
    try {
        const { identifier } = req.params;
        const section = await SectionContent.findOne({ identifier });

        if (!section) {
            // Return empty default if not found
            return res.status(200).json({
                success: true,
                data: { identifier, content: {} },
            });
        }

        // --- SECURITY: Filter sensitive data for payment_settings ---
        if (identifier === 'payment_settings') {
            const { decrypt } = require('../utils/encryption');
            const content = { ...section.content };
            
            if (content.paypal) {
                // Return only what frontend needs
                content.paypal = {
                    active: content.paypal.active,
                    clientId: decrypt(content.paypal.clientId),
                    mode: content.paypal.mode
                };
            }
            
            return res.status(200).json({
                success: true,
                data: { identifier, content }
            });
        }
        // -------------------------------------------------------------

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

module.exports = router;
