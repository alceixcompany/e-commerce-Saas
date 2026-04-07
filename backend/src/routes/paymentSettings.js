const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const SectionContent = require('../models/SectionContent');
const { protect, authorize } = require('../middleware/auth');
const { validateRequest } = require('../middleware/validate');
const { encrypt, decrypt } = require('../utils/encryption');

// All payment settings routes require authentication and admin role
router.use(protect);
router.use(authorize('admin'));

/**
 * Helper to mask sensitive strings
 */
const maskValue = (val) => {
    if (!val) return '';
    const decrypted = decrypt(val);
    if (!decrypted) return '';
    if (decrypted.length <= 8) return '********';
    return decrypted.substring(0, 4) + '****************' + decrypted.slice(-4);
};

// @route   GET /api/admin/payment-settings
// @desc    Get payment settings (masked)
// @access  Private/Admin
router.get('/', async (req, res) => {
    try {
        const section = await SectionContent.findOne({ identifier: 'payment_settings' });
        
        const data = section ? section.content : {
            paypal: {
                active: false,
                clientId: '',
                clientSecret: '',
                mode: 'sandbox'
            },
            iyzico: {
                active: false,
                apiKey: '',
                secretKey: '',
                baseUrl: 'https://sandbox-api.iyzipay.com'
            }
        };

        // Mask sensitive data before sending to UI
        if (data.paypal) {
            data.paypal.clientId = maskValue(data.paypal.clientId);
            data.paypal.clientSecret = maskValue(data.paypal.clientSecret);
        }
        if (data.iyzico) {
            data.iyzico.apiKey = maskValue(data.iyzico.apiKey);
            data.iyzico.secretKey = maskValue(data.iyzico.secretKey);
        }

        res.status(200).json({
            success: true,
            data
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Server error',
        });
    }
});

// @route   PUT /api/admin/payment-settings
// @desc    Update payment settings
// @access  Private/Admin
router.put(
    '/',
    [
        body('paypal', 'paypal must be an object').optional().isObject(),
        body('paypal.active', 'paypal.active must be boolean').optional().isBoolean(),
        body('paypal.clientId', 'paypal.clientId must be a string').optional().isString(),
        body('paypal.clientSecret', 'paypal.clientSecret must be a string').optional().isString(),
        body('paypal.mode', 'paypal.mode must be live or sandbox').optional().isIn(['live', 'sandbox']),
        body('iyzico', 'iyzico must be an object').optional().isObject(),
        body('iyzico.active', 'iyzico.active must be boolean').optional().isBoolean(),
        body('iyzico.apiKey', 'iyzico.apiKey must be a string').optional().isString(),
        body('iyzico.secretKey', 'iyzico.secretKey must be a string').optional().isString(),
        body('iyzico.baseUrl', 'iyzico.baseUrl must be a string').optional().isString(),
        validateRequest,
    ],
    async (req, res) => {
    try {
        const { paypal, iyzico } = req.body;
        
        // Fetch existing logic to see if we are updating or keeping same values (in case of mask)
        const existingSection = await SectionContent.findOne({ identifier: 'payment_settings' });
        const existingContent = existingSection ? existingSection.content : {};

        const newPaypal = paypal ? { ...paypal } : undefined;
        const newIyzico = iyzico ? { ...iyzico } : undefined;

        // Handle encryption - only encrypt if the value is not a mask
        const processField = (provider, field, newValue) => {
            // If the user didn't change the masked value, keep what we had in DB
            if (newValue && newValue.includes('****************')) {
                return existingContent[provider] ? existingContent[provider][field] : null;
            }
            // If it's a new value, encrypt it
            return newValue ? encrypt(newValue) : null;
        };

        if (newPaypal) {
            newPaypal.clientId = processField('paypal', 'clientId', paypal.clientId);
            newPaypal.clientSecret = processField('paypal', 'clientSecret', paypal.clientSecret);
        }
        
        if (newIyzico) {
            newIyzico.apiKey = processField('iyzico', 'apiKey', iyzico.apiKey);
            newIyzico.secretKey = processField('iyzico', 'secretKey', iyzico.secretKey);
        }
        
        const updateContent = {};
        if (newPaypal) updateContent.paypal = newPaypal;
        if (newIyzico) updateContent.iyzico = newIyzico;

        const section = await SectionContent.findOneAndUpdate(
            { identifier: 'payment_settings' },
            { $set: { content: { ...existingContent, ...updateContent } } },
            { new: true, upsert: true, setDefaultsOnInsert: true }
        );

        res.status(200).json({
            success: true,
            message: 'Payment settings updated successfully'
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message || 'Invalid data',
        });
    }
});

module.exports = router;
