const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Coupon = require('../models/Coupon');
const { protect, authorize } = require('../middleware/auth');
const { client } = require('../config/paypal');
const checkoutNodeJssdk = require('@paypal/checkout-server-sdk');

// @route   POST /api/orders
// @desc    Create new order
// @access  Private
router.post('/', protect, async (req, res) => {
    try {
        const {
            orderItems,
            shippingAddress,
            paymentMethod,
            itemsPrice,
            taxPrice,
            shippingPrice,
            totalPrice,
            coupon
        } = req.body;

        if (orderItems && orderItems.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No order items',
            });
        } else {
            const order = new Order({
                orderItems,
                user: req.user._id,
                shippingAddress,
                paymentMethod,
                itemsPrice,
                taxPrice,
                shippingPrice,
                totalPrice,
                coupon
            });

            const createdOrder = await order.save();

            // Increment coupon usage if provided
            if (coupon && coupon.code) {
                const existingCoupon = await Coupon.findOne({ code: coupon.code.toUpperCase() });

                if (existingCoupon) {
                    // Check if user already used it
                    if (existingCoupon.usedBy.includes(req.user._id)) {
                        return res.status(400).json({
                            success: false,
                            message: 'You have already used this coupon'
                        });
                    }

                    // Update usage
                    await Coupon.findByIdAndUpdate(existingCoupon._id, {
                        $inc: { usedCount: 1 },
                        $push: { usedBy: req.user._id }
                    });
                }
            }

            res.status(201).json({
                success: true,
                data: createdOrder,
                message: 'Order created successfully',
            });
        }
    } catch (error) {
        console.error('Create order error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
        });
    }
});

// @route   PUT /api/orders/:id/pay
// @desc    Update order to paid
// @access  Private
router.put('/:id/pay', protect, async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);

        if (order) {
            // VERIFY PAYMENT WITH PAYPAL
            const paypalOrderId = req.body.id;

            // Get the order from PayPal
            const request = new checkoutNodeJssdk.orders.OrdersGetRequest(paypalOrderId);
            const paypalOrder = await client().execute(request);

            const paypalData = paypalOrder.result;

            // Check if it's actually paid
            if (paypalData.status !== 'COMPLETED' && paypalData.status !== 'APPROVED') {
                return res.status(400).json({
                    success: false,
                    message: `PayPal payment not completed. Status: ${paypalData.status}`
                });
            }

            // Optional: Check if amount matches
            // const paidAmount = paypalData.purchase_units[0].amount.value;
            // if (parseFloat(paidAmount) !== order.totalPrice) { ... }

            order.isPaid = true;
            order.paidAt = Date.now();
            order.paymentResult = {
                id: paypalData.id,
                status: paypalData.status,
                update_time: paypalData.update_time,
                email_address: paypalData.payer.email_address,
            };

            const updatedOrder = await order.save();

            res.json({
                success: true,
                data: updatedOrder,
                message: 'Order paid successfully',
            });
        } else {
            res.status(404).json({
                success: false,
                message: 'Order not found',
            });
        }
    } catch (error) {
        console.error('Update order pay error:', error);
        res.status(500).json({
            success: false,
            message: 'Payment verification failed: ' + error.message,
        });
    }
});

// @route   GET /api/orders/myorders
// @desc    Get logged in user orders
// @access  Private
router.get('/myorders', protect, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const [orders, total] = await Promise.all([
            Order.find({ user: req.user._id })
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),
            Order.countDocuments({ user: req.user._id })
        ]);

        res.json({
            success: true,
            count: orders.length,
            total,
            page,
            pages: Math.ceil(total / limit),
            data: orders,
        });
    } catch (error) {
        console.error('Get my orders error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
        });
    }
});

// @route   GET /api/orders/:id
// @desc    Get order by ID
// @access  Private
router.get('/:id', protect, async (req, res) => {
    try {
        const order = await Order.findById(req.params.id).populate(
            'user',
            'name email'
        );

        if (order) {
            // Check if user is owner or admin
            if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
                return res.status(403).json({
                    success: false,
                    message: 'Not authorized to view this order',
                });
            }

            res.json({
                success: true,
                data: order,
            });
        } else {
            res.status(404).json({
                success: false,
                message: 'Order not found',
            });
        }
    } catch (error) {
        console.error('Get order error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
        });
    }
});

// @route   GET /api/orders
// @desc    Get all orders
// @access  Private/Admin
router.get('/', protect, authorize('admin'), async (req, res) => {
    try {
        const { page = 1, limit = 10, filter, q } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        let matchQuery = {};

        // Status filters
        if (filter === 'pending') {
            matchQuery.isDelivered = false;
            matchQuery.isPaid = true;
        } else if (filter === 'unpaid') {
            matchQuery.isPaid = false;
        } else if (filter === 'delivered') {
            matchQuery.isDelivered = true;
        }

        const pipeline = [
            { $match: matchQuery },
            {
                $lookup: {
                    from: 'users',
                    localField: 'user',
                    foreignField: '_id',
                    as: 'userDetails'
                }
            },
            { $unwind: '$userDetails' },
            {
                $project: {
                    user: {
                        _id: '$userDetails._id',
                        name: '$userDetails.name',
                        email: '$userDetails.email'
                    },
                    orderItems: 1,
                    shippingAddress: 1,
                    paymentMethod: 1,
                    paymentResult: 1,
                    itemsPrice: 1,
                    taxPrice: 1,
                    shippingPrice: 1,
                    totalPrice: 1,
                    isPaid: 1,
                    paidAt: 1,
                    isDelivered: 1,
                    deliveredAt: 1,
                    createdAt: 1,
                    updatedAt: 1
                }
            }
        ];

        // Search filter
        if (q) {
            const searchRegex = new RegExp(q.trim(), 'i');
            pipeline.push({
                $match: {
                    $or: [
                        { '_id': { $regex: q.trim(), $options: 'i' } },
                        { 'user.name': searchRegex },
                        { 'user.email': searchRegex }
                    ]
                }
            });
        }

        pipeline.push({ $sort: { createdAt: -1 } });

        // For total count after filters
        const countPipeline = [...pipeline];

        pipeline.push({ $skip: skip });
        pipeline.push({ $limit: parseInt(limit) });

        const [orders, countResult] = await Promise.all([
            Order.aggregate(pipeline),
            Order.aggregate([...countPipeline, { $count: 'total' }])
        ]);

        const total = countResult.length > 0 ? countResult[0].total : 0;

        res.json({
            success: true,
            count: orders.length,
            total,
            page: parseInt(page),
            pages: Math.ceil(total / parseInt(limit)),
            data: orders,
        });
    } catch (error) {
        console.error('Get all orders error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
        });
    }
});

// @route   PUT /api/orders/:id/deliver
// @desc    Update order to delivered
// @access  Private/Admin
router.put('/:id/deliver', protect, authorize('admin'), async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);

        if (order) {
            order.isDelivered = true;
            order.deliveredAt = Date.now();

            const updatedOrder = await order.save();

            res.json({
                success: true,
                data: updatedOrder,
                message: 'Order delivered',
            });
        } else {
            res.status(404).json({
                success: false,
                message: 'Order not found',
            });
        }
    } catch (error) {
        console.error('Update order deliver error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
        });
    }
});

// @route   DELETE /api/orders/:id
// @desc    Delete order
// @access  Private/Admin
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);

        if (order) {
            await order.deleteOne();
            res.json({
                success: true,
                message: 'Order removed',
            });
        } else {
            res.status(404).json({
                success: false,
                message: 'Order not found',
            });
        }
    } catch (error) {
        console.error('Delete order error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
        });
    }
});

module.exports = router;
