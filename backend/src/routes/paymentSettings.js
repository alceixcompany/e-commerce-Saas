const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const paymentController = require('../modules/paymentSettings/paymentSettings.controller');
const paymentValidators = require('../modules/paymentSettings/paymentSettings.validators');

// All payment settings routes require authentication and admin role
router.use(protect);
router.use(authorize('admin'));

// @route   GET /api/admin/payment-settings
// @desc    Get payment settings (masked)
// @access  Private/Admin
router.get('/', paymentController.getPaymentSettings);

// @route   PUT /api/admin/payment-settings
// @desc    Update payment settings
// @access  Private/Admin
router.put('/', paymentValidators.updatePaymentSettingsValidators, paymentController.updatePaymentSettings);

module.exports = router;
