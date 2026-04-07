const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const Coupon = require('../models/Coupon');
const { protect, authorize } = require('../middleware/auth');
const { validateRequest } = require('../middleware/validate');

// @route   POST /api/coupons
// @desc    Create a new coupon
// @access  Private/Admin
router.post('/', protect, authorize('admin'), async (req, res) => {
    try {
        const { code, discountType, amount, expirationDate, usageLimit } = req.body;

        const couponExists = await Coupon.findOne({ code: code.toUpperCase() });
        if (couponExists) {
            return res.status(400).json({
                success: false,
                message: 'Coupon code already exists'
            });
        }

        const coupon = await Coupon.create({
            code,
            discountType,
            amount,
            expirationDate,
            usageLimit
        });

        res.status(201).json({
            success: true,
            data: coupon
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// @route   GET /api/coupons
// @desc    Get all coupons
// @access  Private/Admin
router.get('/', protect, authorize('admin'), async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const [coupons, total] = await Promise.all([
            Coupon.find({}).sort({ createdAt: -1 }).skip(skip).limit(limit),
            Coupon.countDocuments({})
        ]);
        res.status(200).json({
            success: true,
            count: coupons.length,
            total,
            page,
            pages: Math.ceil(total / limit),
            data: coupons
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// @route   DELETE /api/coupons/:id
// @desc    Delete/Deactivate a coupon
// @access  Private/Admin
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
    try {
        const coupon = await Coupon.findById(req.params.id);

        if (!coupon) {
            return res.status(404).json({
                success: false,
                message: 'Coupon not found'
            });
        }

        await coupon.deleteOne();

        res.status(200).json({
            success: true,
            message: 'Coupon removed'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// @route   POST /api/coupons/validate
// @desc    Validate a coupon code
// @access  Public
router.post(
    '/validate',
    [
        body('code', 'Please provide a coupon code').notEmpty().trim(),
        body('cartTotal', 'Cart total must be a non-negative number').isFloat({ min: 0 }),
        body('userId', 'User id must be a valid id').optional().isMongoId(),
        validateRequest,
    ],
    async (req, res) => {
    try {
        const { code, cartTotal, userId } = req.body;

        const cleanedCode = code.trim().toUpperCase();
        const coupon = await Coupon.findOne({ code: cleanedCode });

        // 1. Check if exists
        if (!coupon) {
            return res.status(400).json({
                success: false,
                message: 'No such coupon found'
            });
        }

        // 2. Check if active
        if (!coupon.isActive) {
            return res.status(400).json({
                success: false,
                message: 'Coupon is no longer active'
            });
        }

        // 3. Check expiration
        if (new Date() > new Date(coupon.expirationDate)) {
            return res.status(400).json({
                success: false,
                message: 'Coupon has expired'
            });
        }

        // 4. Check usage limit
        if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
            return res.status(400).json({
                success: false,
                message: 'Coupon usage limit reached'
            });
        }

        // 5. Check if user already used it
        if (userId && coupon.usedBy.some((id) => id.toString() === userId.toString())) {
            return res.status(400).json({
                success: false,
                message: 'You have already used this coupon'
            });
        }

        // Calculate discount amount
        const safeCartTotal = Number(cartTotal);
        let discountAmount = 0;
        if (coupon.discountType === 'percentage') {
            discountAmount = (safeCartTotal * coupon.amount) / 100;
            // Optional: Cap max discount?
        } else {
            discountAmount = coupon.amount;
        }

        // Ensure discount doesn't exceed total price
        if (discountAmount > safeCartTotal) {
            discountAmount = safeCartTotal;
        }

        res.status(200).json({
            success: true,
            data: {
                code: coupon.code,
                discountType: coupon.discountType,
                amount: coupon.amount,
                discountAmount: discountAmount,
                _id: coupon._id // Return ID for secure processing in order creation if needed
            }
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

module.exports = router;
