const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const couponsController = require('../modules/coupons/coupons.controller');
const couponsValidators = require('../modules/coupons/coupons.validators');

// @route   POST /api/coupons
// @desc    Create a new coupon
// @access  Private/Admin
router.post('/', protect, authorize('admin'), couponsValidators.createCouponValidators, couponsController.createCoupon);

// @route   GET /api/coupons
// @desc    Get all coupons
// @access  Private/Admin
router.get('/', protect, authorize('admin'), couponsValidators.listCouponsValidators, couponsController.listCoupons);

// @route   DELETE /api/coupons/:id
// @desc    Delete/Deactivate a coupon
// @access  Private/Admin
router.delete('/:id', protect, authorize('admin'), couponsValidators.deleteCouponValidators, couponsController.deleteCoupon);

// @route   POST /api/coupons/validate
// @desc    Validate a coupon code
// @access  Public
router.post('/validate', couponsValidators.validateCouponValidators, couponsController.validateCoupon);

module.exports = router;
