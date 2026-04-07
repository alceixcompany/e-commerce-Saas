const { body, param } = require('express-validator');
const { validateRequest } = require('../../middleware/validate');

const updateProfileValidators = [
    body('name', 'Name must be a string').optional().isString(),
    body('phone', 'Phone must be a string').optional().isString(),
    body('profileImage', 'Profile image must be a string').optional().isString(),
    validateRequest,
];

const addAddressValidators = [
    body('title', 'Title is required').notEmpty().trim(),
    body('fullAddress', 'Full address is required').notEmpty().trim(),
    body('city', 'City is required').notEmpty().trim(),
    body('district', 'District is required').notEmpty().trim(),
    body('postalCode', 'Postal code is required').notEmpty().trim(),
    body('phone', 'Phone is required').notEmpty().trim(),
    body('isDefault', 'isDefault must be boolean').optional().isBoolean(),
    validateRequest,
];

const updateAddressValidators = [
    param('addressId', 'Invalid address id').isMongoId(),
    body('title', 'Title must be a string').optional().isString(),
    body('fullAddress', 'Full address must be a string').optional().isString(),
    body('city', 'City must be a string').optional().isString(),
    body('district', 'District must be a string').optional().isString(),
    body('postalCode', 'Postal code must be a string').optional().isString(),
    body('phone', 'Phone must be a string').optional().isString(),
    body('isDefault', 'isDefault must be boolean').optional().isBoolean(),
    validateRequest,
];

const deleteAddressValidators = [
    param('addressId', 'Invalid address id').isMongoId(),
    validateRequest,
];

const wishlistValidators = [
    param('productId', 'Invalid product id').isMongoId(),
    validateRequest,
];

const addToCartValidators = [
    body('productId', 'Product ID is required').isMongoId(),
    body('quantity', 'Quantity must be at least 1').optional().isInt({ min: 1 }),
    validateRequest,
];

const updateCartValidators = [
    param('productId', 'Invalid product id').isMongoId(),
    body('quantity', 'Quantity must be at least 1').isInt({ min: 1 }),
    validateRequest,
];

const removeCartItemValidators = [
    param('productId', 'Invalid product id').isMongoId(),
    validateRequest,
];

module.exports = {
    updateProfileValidators,
    addAddressValidators,
    updateAddressValidators,
    deleteAddressValidators,
    wishlistValidators,
    addToCartValidators,
    updateCartValidators,
    removeCartItemValidators,
};
