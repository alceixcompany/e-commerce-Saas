const { body, param, query } = require('express-validator');
const { validateRequest } = require('../../middleware/validate');

const createOrderValidators = [
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
];

const payOrderValidators = [
    param('id', 'Invalid order id').isMongoId(),
    validateRequest,
];

const iyzicoInitValidators = [
    body('orderId', 'Order id is required').isMongoId(),
    validateRequest,
];

const iyzicoCallbackValidators = [
    body('token', 'Token is required').notEmpty(),
    validateRequest,
];

const getOrderValidators = [
    param('id', 'Invalid order id').isMongoId(),
    validateRequest,
];

const listOrdersValidators = [
    query('page', 'Page must be a positive number').optional().isInt({ min: 1 }),
    query('limit', 'Limit must be a positive number').optional().isInt({ min: 1 }),
    validateRequest,
];

const deliverOrderValidators = [
    param('id', 'Invalid order id').isMongoId(),
    validateRequest,
];

const deleteOrderValidators = [
    param('id', 'Invalid order id').isMongoId(),
    validateRequest,
];

const bulkUpdateStatusValidators = [
    body('orderIds', 'orderIds must be a non-empty array').isArray({ min: 1 }),
    body('orderIds.*', 'orderIds must contain valid MongoIds').isMongoId(),
    body('status', 'Invalid status').isIn(['received', 'preparing', 'shipped', 'delivered']),
    validateRequest,
];

const bulkDeleteOrdersValidators = [
    body('orderIds', 'orderIds must be a non-empty array').isArray({ min: 1 }),
    body('orderIds.*', 'orderIds must contain valid MongoIds').isMongoId(),
    validateRequest,
];

module.exports = {
    createOrderValidators,
    payOrderValidators,
    iyzicoInitValidators,
    iyzicoCallbackValidators,
    getOrderValidators,
    listOrdersValidators,
    deliverOrderValidators,
    deleteOrderValidators,
    bulkUpdateStatusValidators,
    bulkDeleteOrdersValidators,
};
