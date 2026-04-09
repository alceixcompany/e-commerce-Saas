const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const ordersController = require('../modules/orders/orders.controller');
const ordersValidators = require('../modules/orders/orders.validators');
const { dynamicLimiter } = require('../middleware/dynamicLimiter');

// @route   POST /api/orders
// @desc    Create new order
// @access  Private
router.post(
    '/',
    protect,
    ordersValidators.createOrderValidators,
    ordersController.createOrder
);

// @route   PUT /api/orders/:id/pay
// @desc    Update order to paid
// @access  Private
router.put(
    '/:id/pay',
    protect,
    dynamicLimiter('payment', 5),
    ordersValidators.payOrderValidators,
    ordersController.payOrder
);

// @route   POST /api/orders/iyzico/initialize
// @desc    Initialize Iyzico Checkout Form
// @access  Private
router.post(
    '/iyzico/initialize',
    protect,
    dynamicLimiter('payment', 5),
    ordersValidators.iyzicoInitValidators,
    ordersController.initializeIyzico
);

// @route   POST /api/orders/iyzico/callback
// @desc    Handle Iyzico Callback
// @access  Public
router.post(
    '/iyzico/callback',
    ordersValidators.iyzicoCallbackValidators,
    ordersController.iyzicoCallback
);

// @route   GET /api/orders/myorders
// @desc    Get logged in user orders
// @access  Private
router.get('/myorders', protect, ordersController.getMyOrders);

// @route   GET /api/orders/:id
// @desc    Get order by ID
// @access  Private
router.get(
    '/:id',
    protect,
    ordersValidators.getOrderValidators,
    ordersController.getOrderById
);

// @route   GET /api/orders
// @desc    Get all orders
// @access  Private/Admin
router.get(
    '/',
    protect,
    authorize('admin'),
    ordersValidators.listOrdersValidators,
    ordersController.listOrders
);

// @route   PUT /api/orders/:id/deliver
// @desc    Update order to delivered
// @access  Private/Admin
router.put(
    '/:id/deliver',
    protect,
    authorize('admin'),
    ordersValidators.deliverOrderValidators,
    ordersController.deliverOrder
);

// @route   DELETE /api/orders/:id
// @desc    Delete order
// @access  Private/Admin
router.delete(
    '/:id',
    protect,
    authorize('admin'),
    ordersValidators.deleteOrderValidators,
    ordersController.deleteOrder
);

module.exports = router;
