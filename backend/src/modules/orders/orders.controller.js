const ordersService = require('./orders.service');
const { recordAttempt } = require('../../middleware/dynamicLimiter');
const { getAuthoritativeUrl } = require('../../utils/url');
const logger = require('../../utils/logger');

const createOrder = async (req, res) => {
    try {
        const createdOrder = await ordersService.createOrder(req.body, req.user);
        res.status(201).json({
            success: true,
            data: createdOrder,
            message: 'Order created successfully',
        });
    } catch (error) {
        console.error('Create order error:', error);
        res.status(error.statusCode || 500).json({
            success: false,
            message: error.statusCode ? error.message : 'Server error',
        });
    }
};

const payOrder = async (req, res) => {
    try {
        const paypalOrderId = req.body.id;
        if (!paypalOrderId) {
            return res.status(400).json({
                success: false,
                message: 'PayPal order id is required',
            });
        }

        const updatedOrder = await ordersService.payOrderWithPaypal(
            { orderId: req.params.id, paypalOrderId },
            req.user
        );
        
        // Reset dynamic limiter on success
        const identifier = req.user ? req.user._id.toString() : req.ip;
        await recordAttempt(identifier, 'payment', 'success');

        res.json({
            success: true,
            data: updatedOrder,
            message: 'Order paid successfully',
        });
    } catch (error) {
        console.error('Update order pay error:', error);

        // Record failure for dynamic limiter
        const identifier = req.user ? req.user._id.toString() : req.ip;
        await recordAttempt(identifier, 'payment', 'failure');

        res.status(error.statusCode || 500).json({
            success: false,
            message: error.statusCode ? error.message : 'Payment verification failed: ' + error.message,
        });
    }
};

const initializeIyzico = async (req, res) => {
    try {
        const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
        const result = await ordersService.initializeIyzico(
            { orderId: req.body.orderId, clientIp },
            req.user
        );
        res.json({
            success: true,
            checkoutFormContent: result.checkoutFormContent,
            token: result.token,
            paymentPageUrl: result.paymentPageUrl
        });
    } catch (error) {
        console.error('Initialize Iyzico error:', error);

        // Record failure for dynamic limiter
        const identifier = req.user ? req.user._id.toString() : req.ip;
        await recordAttempt(identifier, 'payment', 'failure');

        res.status(error.statusCode || 500).json({
            success: false,
            message: error.statusCode ? error.message : (error.message || 'Server error'),
        });
    }
};

const iyzicoCallback = async (req, res) => {
    try {
        const { token } = req.body;
        if (!token) {
            return res.status(400).json({ success: false, message: 'Token is required' });
        }

        const result = await ordersService.handleIyzicoCallback({ token });
        return res.redirect(result.redirectUrl);
    } catch (error) {
        console.error('Iyzico Callback controller error:', error);
        const baseUrl = await getAuthoritativeUrl();
        const errorMsg = encodeURIComponent(error.message || 'server_error');
        return res.redirect(`${baseUrl}/checkout/callback?status=error&message=${errorMsg}`);
    }
};

const getMyOrders = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;

        const result = await ordersService.getMyOrders({ userId: req.user._id, page, limit });
        res.json({
            success: true,
            count: result.orders.length,
            total: result.total,
            page: result.page,
            pages: result.pages,
            data: result.orders,
        });
    } catch (error) {
        console.error('Get my orders error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
        });
    }
};

const getOrderById = async (req, res) => {
    try {
        const order = await ordersService.getOrderById({ orderId: req.params.id }, req.user);
        res.json({
            success: true,
            data: order,
        });
    } catch (error) {
        console.error('Get order error:', error);
        res.status(error.statusCode || 500).json({
            success: false,
            message: error.statusCode ? error.message : 'Server error',
        });
    }
};

const listOrders = async (req, res) => {
    try {
        const { page = 1, limit = 10, filter, q } = req.query;
        const result = await ordersService.listOrders({
            page: parseInt(page),
            limit: parseInt(limit),
            filter,
            q
        });

        res.json({
            success: true,
            count: result.orders.length,
            total: result.total,
            page: result.page,
            pages: result.pages,
            data: result.orders,
            stats: result.stats,
        });
    } catch (error) {
        console.error('Get all orders error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
        });
    }
};

const deliverOrder = async (req, res) => {
    try {
        const updatedOrder = await ordersService.deliverOrder({ orderId: req.params.id });
        res.json({
            success: true,
            data: updatedOrder,
            message: 'Order delivered',
        });
    } catch (error) {
        console.error('Update order deliver error:', error);
        res.status(error.statusCode || 500).json({
            success: false,
            message: error.statusCode ? error.message : 'Server error',
        });
    }
};

const deleteOrder = async (req, res) => {
    try {
        await ordersService.deleteOrder({ orderId: req.params.id });
        res.json({
            success: true,
            message: 'Order removed',
        });
    } catch (error) {
        console.error('Delete order error:', error);
        res.status(error.statusCode || 500).json({
            success: false,
            message: error.statusCode ? error.message : 'Server error',
        });
    }
};

const bulkUpdateStatus = async (req, res) => {
    try {
        const { orderIds, status } = req.body;
        if (!orderIds || !Array.isArray(orderIds) || orderIds.length === 0) {
            return res.status(400).json({ success: false, message: 'orderIds array is required' });
        }
        await ordersService.bulkUpdateStatus({ orderIds, status });
        res.json({
            success: true,
            message: `Successfully updated ${orderIds.length} orders to ${status}`,
        });
    } catch (error) {
        logger.error('Bulk update order status error:', {
            error: error.message,
            stack: error.stack,
            body: req.body
        });
        res.status(error.statusCode || 500).json({
            success: false,
            message: error.statusCode ? error.message : 'Server error',
        });
    }
};

const bulkDeleteOrders = async (req, res) => {
    try {
        const { orderIds } = req.body;
        if (!orderIds || !Array.isArray(orderIds) || orderIds.length === 0) {
            return res.status(400).json({ success: false, message: 'orderIds array is required' });
        }
        await ordersService.bulkDeleteOrders(orderIds);
        res.json({
            success: true,
            message: `Successfully deleted ${orderIds.length} orders`,
        });
    } catch (error) {
        console.error('Bulk delete orders controller error:', error);
        res.status(error.statusCode || 500).json({
            success: false,
            message: error.statusCode ? error.message : 'Server error',
        });
    }
};

module.exports = {
    createOrder,
    payOrder,
    initializeIyzico,
    iyzicoCallback,
    getMyOrders,
    getOrderById,
    listOrders,
    deliverOrder,
    deleteOrder,
    bulkUpdateStatus,
    bulkDeleteOrders,
};
