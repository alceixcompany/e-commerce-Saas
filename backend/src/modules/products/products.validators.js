const { body, param, query } = require('express-validator');
const { validateRequest } = require('../../middleware/validate');

const listProductsValidators = [
    query('page', 'Page must be a positive number').optional().isInt({ min: 1 }),
    query('limit', 'Limit must be a positive number').optional().isInt({ min: 1 }),
    validateRequest,
];

const getProductValidators = [
    param('id', 'Invalid product id').isMongoId(),
    validateRequest,
];

const createProductValidators = [
    body('name', 'Name is required').notEmpty().trim(),
    body('category', 'Category is required').isMongoId(),
    body('price', 'Price must be a non-negative number').isFloat({ min: 0 }),
    body('stock', 'Stock must be a non-negative number').isFloat({ min: 0 }),
    body('sku', 'SKU is required').notEmpty().trim(),
    body('mainImage', 'Main image is required').optional().isString(),
    body('image', 'Image must be a string').optional().isString(),
    body().custom((value, { req }) => {
        if (!req.body.mainImage && !req.body.image) {
            throw new Error('Main image is required');
        }
        return true;
    }),
    body('images', 'Images must be an array').optional().isArray(),
    body('shippingWeight', 'Shipping weight must be a non-negative number').isFloat({ min: 0 }),
    body('discountedPrice', 'Discounted price must be a non-negative number').optional().isFloat({ min: 0 }),
    body('rating', 'Rating must be between 0 and 5').optional().isFloat({ min: 0, max: 5 }),
    body('status', 'Status must be active or inactive').optional().isIn(['active', 'inactive']),
    body('isNewArrival', 'isNewArrival must be boolean').optional().isBoolean(),
    body('isBestSeller', 'isBestSeller must be boolean').optional().isBoolean(),
    validateRequest,
];

const updateProductValidators = [
    param('id', 'Invalid product id').isMongoId(),
    body('category', 'Category must be a valid id').optional().isMongoId(),
    body('price', 'Price must be a non-negative number').optional().isFloat({ min: 0 }),
    body('stock', 'Stock must be a non-negative number').optional().isFloat({ min: 0 }),
    body('sku', 'SKU must be a string').optional().isString(),
    body('mainImage', 'Main image must be a string').optional().isString(),
    body('image', 'Image must be a string').optional().isString(),
    body('images', 'Images must be an array').optional().isArray(),
    body('shippingWeight', 'Shipping weight must be a non-negative number').optional().isFloat({ min: 0 }),
    body('discountedPrice', 'Discounted price must be a non-negative number').optional().isFloat({ min: 0 }),
    body('rating', 'Rating must be between 0 and 5').optional().isFloat({ min: 0, max: 5 }),
    body('status', 'Status must be active or inactive').optional().isIn(['active', 'inactive']),
    body('isNewArrival', 'isNewArrival must be boolean').optional().isBoolean(),
    body('isBestSeller', 'isBestSeller must be boolean').optional().isBoolean(),
    validateRequest,
];

const deleteProductValidators = [
    param('id', 'Invalid product id').isMongoId(),
    validateRequest,
];

const bulkDeleteProductsValidators = [
    body('ids', 'ids must be a non-empty array').isArray({ min: 1 }),
    body('ids.*', 'ids must contain valid MongoIds').isMongoId(),
    validateRequest,
];

module.exports = {
    listProductsValidators,
    getProductValidators,
    createProductValidators,
    updateProductValidators,
    deleteProductValidators,
    bulkDeleteProductsValidators,
};
