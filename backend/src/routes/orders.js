const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const Order = require('../models/Order');
const Coupon = require('../models/Coupon');
const SectionContent = require('../models/SectionContent');
const Product = require('../models/Product');
const { protect, authorize } = require('../middleware/auth');
const { validateRequest } = require('../middleware/validate');
const { client } = require('../config/paypal');
const checkoutNodeJssdk = require('@paypal/checkout-server-sdk');

const createBadRequest = (message) => {
    const error = new Error(message);
    error.statusCode = 400;
    return error;
};

const ensureNonNegativeNumber = (value, fieldName) => {
    const numberValue = Number(value);
    if (Number.isNaN(numberValue) || numberValue < 0) {
        throw createBadRequest(`${fieldName} must be a non-negative number`);
    }
    return numberValue;
};

const buildOrderFromProducts = (orderItems, productsById) => {
    let itemsPrice = 0;
    const normalizedItems = orderItems.map((item) => {
        const product = productsById.get(item.product?.toString());
        if (!product) {
            throw createBadRequest('Product not found for order item');
        }
        const quantity = Number(item.qty || item.quantity || 1);
        if (!quantity || quantity < 1) {
            throw createBadRequest('Invalid quantity');
        }
        const unitPrice = product.discountedPrice != null ? product.discountedPrice : product.price;
        itemsPrice += unitPrice * quantity;

        return {
            name: product.name,
            qty: quantity,
            image: product.mainImage || product.image,
            price: unitPrice,
            product: product._id,
        };
    });

    return { normalizedItems, itemsPrice };
};

const applyCoupon = (coupon, subtotal, userId) => {
    if (!coupon) return { discountAmount: 0, couponData: null };

    if (!coupon.isActive) {
        throw createBadRequest('Coupon is no longer active');
    }
    if (new Date() > new Date(coupon.expirationDate)) {
        throw createBadRequest('Coupon has expired');
    }
    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
        throw createBadRequest('Coupon usage limit reached');
    }
    if (coupon.usedBy && coupon.usedBy.some((id) => id.toString() === userId.toString())) {
        throw createBadRequest('You have already used this coupon');
    }

    let discountAmount = 0;
    if (coupon.discountType === 'percentage') {
        discountAmount = (subtotal * coupon.amount) / 100;
    } else {
        discountAmount = coupon.amount;
    }

    if (discountAmount > subtotal) {
        discountAmount = subtotal;
    }

    return {
        discountAmount,
        couponData: {
            code: coupon.code,
            discountAmount
        }
    };
};

// @route   POST /api/orders
// @desc    Create new order
// @access  Private
router.post(
    '/',
    protect,
    [
        body('orderItems', 'Order items are required').isArray({ min: 1 }),
        body('orderItems.*.product', 'Product id is required').isMongoId(),
        body('orderItems.*').custom((item) => {
            const quantity = item.qty ?? item.quantity;
            if (quantity === undefined || quantity === null) {
                throw new Error('Quantity is required');
            }
            const numeric = Number(quantity);
            if (Number.isNaN(numeric) || numeric < 1) {
                throw new Error('Quantity must be at least 1');
            }
            return true;
        }),
        body('shippingAddress.address', 'Shipping address is required').notEmpty(),
        body('shippingAddress.city', 'Shipping city is required').notEmpty(),
        body('shippingAddress.postalCode', 'Shipping postal code is required').notEmpty(),
        body('shippingAddress.country', 'Shipping country is required').notEmpty(),
        body('paymentMethod', 'Payment method is required').notEmpty(),
        body('taxPrice', 'taxPrice must be a non-negative number').optional().isFloat({ min: 0 }),
        body('shippingPrice', 'shippingPrice must be a non-negative number').optional().isFloat({ min: 0 }),
        body('coupon.code', 'Coupon code must be a string').optional().isString(),
        validateRequest,
    ],
    async (req, res) => {
    let session;
    try {
        const {
            orderItems,
            shippingAddress,
            paymentMethod,
            taxPrice,
            shippingPrice,
            coupon
        } = req.body;

        const safeTaxPrice = ensureNonNegativeNumber(taxPrice || 0, 'taxPrice');
        const safeShippingPrice = ensureNonNegativeNumber(shippingPrice || 0, 'shippingPrice');

        session = await Order.startSession();
        session.startTransaction();

        const productIds = orderItems.map((item) => item.product);
        const uniqueProductIds = [...new Set(productIds.map((id) => id.toString()))];
        const products = await Product.find({ _id: { $in: uniqueProductIds } }).session(session);
        if (products.length !== uniqueProductIds.length) {
            throw createBadRequest('One or more products not found');
        }

        const productsById = new Map(products.map((p) => [p._id.toString(), p]));
        const { normalizedItems, itemsPrice: calculatedItemsPrice } = buildOrderFromProducts(orderItems, productsById);

        const subtotal = calculatedItemsPrice + safeTaxPrice + safeShippingPrice;

        let appliedCoupon = null;
        let discountAmount = 0;
        if (coupon && coupon.code) {
            const existingCoupon = await Coupon.findOne({ code: coupon.code.toUpperCase() }).session(session);
            if (!existingCoupon) {
                throw createBadRequest('No such coupon found');
            }
            const couponResult = applyCoupon(existingCoupon, subtotal, req.user._id);
            appliedCoupon = couponResult.couponData;
            discountAmount = couponResult.discountAmount;

            await Coupon.findByIdAndUpdate(existingCoupon._id, {
                $inc: { usedCount: 1 },
                $push: { usedBy: req.user._id }
            }, { session });
        }

        const finalTotalPrice = subtotal - discountAmount;

        const order = new Order({
            orderItems: normalizedItems,
            user: req.user._id,
            shippingAddress,
            paymentMethod,
            itemsPrice: calculatedItemsPrice,
            taxPrice: safeTaxPrice,
            shippingPrice: safeShippingPrice,
            totalPrice: finalTotalPrice,
            coupon: appliedCoupon || undefined
        });

        const [createdOrder] = await Order.create([order], { session });
        await session.commitTransaction();

        res.status(201).json({
            success: true,
            data: createdOrder,
            message: 'Order created successfully',
        });
    } catch (error) {
        if (session) {
            await session.abortTransaction();
        }
        console.error('Create order error:', error);
        res.status(error.statusCode || 500).json({
            success: false,
            message: error.statusCode ? error.message : 'Server error',
        });
    } finally {
        if (session) {
            session.endSession();
        }
    }
});

// @route   PUT /api/orders/:id/pay
// @desc    Update order to paid
// @access  Private
router.put('/:id/pay', protect, async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);

        if (order) {
            if (order.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
                return res.status(403).json({
                    success: false,
                    message: 'Not authorized to pay for this order',
                });
            }

            if (order.isPaid) {
                return res.status(400).json({
                    success: false,
                    message: 'Order already paid',
                });
            }

            // VERIFY PAYMENT WITH PAYPAL
            const paypalOrderId = req.body.id;
            if (!paypalOrderId) {
                return res.status(400).json({
                    success: false,
                    message: 'PayPal order id is required',
                });
            }

            // Get the order from PayPal
            const request = new checkoutNodeJssdk.orders.OrdersGetRequest(paypalOrderId);
            const paypalClient = await client();
            const paypalOrder = await paypalClient.execute(request);

            const paypalData = paypalOrder.result;
            const purchaseUnit = paypalData?.purchase_units?.[0];
            if (!purchaseUnit || !purchaseUnit.amount) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid PayPal order data',
                });
            }

            // --- ADDED: Verify Amount and Currency ---
            const paypalAmount = purchaseUnit.amount.value;
            const paypalCurrency = purchaseUnit.amount.currency_code;

            // Fetch global settings for currency check
            const globalSettings = await SectionContent.findOne({ identifier: 'global_settings' });
            const storeCurrency = (globalSettings && globalSettings.content && globalSettings.content.currency) || 'USD';

            if (parseFloat(paypalAmount) !== parseFloat(order.totalPrice)) {
                return res.status(400).json({
                    success: false,
                    message: `Payment amount mismatch. Expected ${order.totalPrice}, got ${paypalAmount}`
                });
            }

            if (paypalCurrency !== storeCurrency) {
                 return res.status(400).json({
                    success: false,
                    message: `Payment currency mismatch. Expected ${storeCurrency}, got ${paypalCurrency}`
                });
            }
            // ------------------------------------------

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

// @route   POST /api/orders/iyzico/initialize
// @desc    Initialize Iyzico Checkout Form
// @access  Private
router.post('/iyzico/initialize', protect, async (req, res) => {
    try {
        const { orderId } = req.body;
        const order = await Order.findById(orderId).populate('user', 'name email');

        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }
        if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Not authorized to pay for this order' });
        }
        if (order.isPaid) {
            return res.status(400).json({ success: false, message: 'Order already paid' });
        }

        // Fetch global settings for currency
        const globalSettings = await SectionContent.findOne({ identifier: 'global_settings' });
        const storeCurrency = (globalSettings && globalSettings.content && globalSettings.content.currency) || 'USD';

        const { getIyzipayClient } = require('../config/iyzipay');
        const Iyzipay = require('iyzipay');
        const iyzipay = await getIyzipayClient();

        // Prepare Basket Items
        const basketItems = order.orderItems.map(item => ({
            id: item.product.toString(),
            name: item.name,
            category1: 'General', // In a real app, get proper categories
            itemType: Iyzipay.BASKET_ITEM_TYPE.PHYSICAL,
            price: (item.price * item.qty).toFixed(2),
        }));

        const request = {
            locale: Iyzipay.LOCALE.TR,
            conversationId: order._id.toString(),
            price: order.totalPrice.toFixed(2),
            paidPrice: order.totalPrice.toFixed(2),
            currency: Iyzipay.CURRENCY[storeCurrency] || Iyzipay.CURRENCY.USD,
            installment: '1',
            basketId: order._id.toString(),
            paymentChannel: Iyzipay.PAYMENT_CHANNEL.WEB,
            paymentGroup: Iyzipay.PAYMENT_GROUP.PRODUCT,
            callbackUrl: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'}/api/orders/iyzico/callback`,
            buyer: {
                id: order.user._id.toString(),
                name: (order.user.name || 'Buyer').split(' ')[0],
                surname: (order.user.name || 'Name').split(' ').slice(1).join(' ') || 'Name',
                gsmNumber: '+905555555555', // Real app should use user's phone
                email: order.user.email,
                identityNumber: '11111111111', // Real app needs actual ID or default
                lastLoginDate: '2015-10-05 12:43:35',
                registrationDate: '2013-04-21 15:12:09',
                registrationAddress: order.shippingAddress.address,
                ip: req.ip || '85.34.78.112',
                city: order.shippingAddress.city,
                country: order.shippingAddress.country,
                zipCode: order.shippingAddress.postalCode
            },
            shippingAddress: {
                contactName: order.user.name || 'Buyer Name',
                city: order.shippingAddress.city,
                country: order.shippingAddress.country,
                address: order.shippingAddress.address,
                zipCode: order.shippingAddress.postalCode
            },
            billingAddress: {
                contactName: order.user.name || 'Buyer Name',
                city: order.shippingAddress.city,
                country: order.shippingAddress.country,
                address: order.shippingAddress.address,
                zipCode: order.shippingAddress.postalCode
            },
            basketItems: basketItems
        };

        iyzipay.checkoutFormInitialize.create(request, function (err, result) {
            if (err) {
                console.error("Iyzico init error:", err);
                return res.status(500).json({ success: false, message: 'Iyzico API Error' });
            }

            if (result.status === 'success') {
                res.json({
                    success: true,
                    checkoutFormContent: result.checkoutFormContent,
                    token: result.token,
                    paymentPageUrl: result.paymentPageUrl
                });
            } else {
                console.error("Iyzico failed:", result);
                res.status(400).json({
                    success: false,
                    message: result.errorMessage || 'Failed to initialize payment form'
                });
            }
        });

    } catch (error) {
        console.error('Initialize Iyzico error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Server error',
        });
    }
});

// @route   POST /api/orders/iyzico/callback
// @desc    Handle Iyzico Callback
// @access  Public
router.post('/iyzico/callback', async (req, res) => {
    try {
        const { token } = req.body;

        if (!token) {
            return res.status(400).json({ success: false, message: 'Token is required' });
        }

        const { getIyzipayClient } = require('../config/iyzipay');
        const iyzipay = await getIyzipayClient();

        iyzipay.checkoutForm.retrieve({
            locale: iyzipay.LOCALE.TR,
            token: token
        }, async function (err, result) {
            if (err) {
                console.error("Iyzico retrieve error:", err);
                return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/checkout/callback?status=error&message=gateway_error`);
            }

            if (result.status === 'success' && result.paymentStatus === 'SUCCESS') {
                const orderId = result.basketId;
                const order = await Order.findById(orderId);

                if (!order) {
                    return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/checkout/callback?status=error&message=order_not_found`);
                }

                if (!order.isPaid) {
                    const globalSettings = await SectionContent.findOne({ identifier: 'global_settings' });
                    const storeCurrency = (globalSettings && globalSettings.content && globalSettings.content.currency) || 'USD';

                    const paidPrice = parseFloat(result.paidPrice || result.price || '0');
                    if (Number.isNaN(paidPrice) || paidPrice <= 0) {
                        return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/checkout/callback?status=error&message=invalid_payment_amount`);
                    }

                    if (paidPrice !== parseFloat(order.totalPrice)) {
                        return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/checkout/callback?status=error&message=amount_mismatch`);
                    }

                    if (result.currency && result.currency !== storeCurrency) {
                        return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/checkout/callback?status=error&message=currency_mismatch`);
                    }

                    order.isPaid = true;
                    order.paidAt = Date.now();
                    order.paymentResult = {
                        id: result.paymentId,
                        status: result.paymentStatus,
                        update_time: new Date().toISOString(),
                        email_address: order.user?.email || 'unknown',
                    };

                    await order.save();
                }
                
                // Redirect to frontend success page
                return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/checkout/callback?status=success&orderId=${orderId}`);
            } else {
                // Redirect to frontend error page
                return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/checkout/callback?status=error&message=${encodeURIComponent(result.errorMessage || 'Payment failed')}`);
            }
        });

    } catch (error) {
        console.error('Iyzico Callback error:', error);
        return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/checkout/callback?status=error&message=server_error`);
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
