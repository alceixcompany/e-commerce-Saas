const { body, param, query } = require('express-validator');
const { validateRequest } = require('../../middleware/validate');

const createCouponValidators = [
    body('code', 'Coupon code is required').notEmpty().trim(),
    body('discountType', 'Discount type must be percentage or fixed').isIn(['percentage', 'fixed']),
    body('amount', 'Amount must be a number').isFloat({ min: 0 }),
    body('expirationDate', 'Expiration date is required').notEmpty(),
    body('usageLimit', 'Usage limit must be a number').optional().isInt({ min: 0 }),
    validateRequest,
];

const listCouponsValidators = [
    query('page', 'Page must be a positive number').optional().isInt({ min: 1 }),
    query('limit', 'Limit must be a positive number').optional().isInt({ min: 1 }),
    validateRequest,
];

const deleteCouponValidators = [
    param('id', 'Invalid coupon id').isMongoId(),
    validateRequest,
];

const validateCouponValidators = [
    body('code', 'Please provide a coupon code').notEmpty().trim(),
    body('cartTotal', 'Cart total must be a non-negative number').isFloat({ min: 0 }),
    body('userId', 'User id must be a valid id').optional().isMongoId(),
    validateRequest,
];

const bulkDeleteCouponsValidators = [
    body('ids', 'ids must be a non-empty array').isArray({ min: 1 }),
    body('ids.*', 'ids must contain valid MongoIds').isMongoId(),
    validateRequest,
];

module.exports = {
    createCouponValidators,
    listCouponsValidators,
    deleteCouponValidators,
    validateCouponValidators,
    bulkDeleteCouponsValidators,
};
