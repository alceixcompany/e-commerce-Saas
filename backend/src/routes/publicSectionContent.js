const express = require('express');
const router = express.Router();
const SectionContent = require('../models/SectionContent');

// @route   GET /api/public/section-content/bootstrap
// @desc    Get all essential site configurations in one request
// @access  Public
router.get('/bootstrap', async (req, res) => {
    try {
        const identifiers = ['global_settings', 'home_settings', 'product_settings', 'contact_settings'];
        const sections = await SectionContent.find({
            identifier: { $in: identifiers }
        });

        const bootstrapData = {};
        identifiers.forEach(id => {
            const section = sections.find(s => s.identifier === id);
            bootstrapData[id] = section ? section.content : {};
        });

        res.status(200).json({
            success: true,
            data: bootstrapData
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Server error',
        });
    }
});

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
