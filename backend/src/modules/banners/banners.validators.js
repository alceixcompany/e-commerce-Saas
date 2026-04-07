const { body, param } = require('express-validator');
const { validateRequest } = require('../../middleware/validate');

const listBannersValidators = [validateRequest];

const createBannerValidators = [
    body('title', 'Title is required').notEmpty().trim(),
    body('image', 'Image is required').notEmpty().isString(),
    body('description', 'Description must be a string').optional().isString(),
    body('buttonText', 'Button text must be a string').optional().isString(),
    body('buttonUrl', 'Button URL must be a string').optional().isString(),
    body('order', 'Order must be a number').optional().isInt({ min: 0 }),
    body('status', 'Status must be active or inactive').optional().isIn(['active', 'inactive']),
    body('section', 'Section must be a string').optional().isString(),
    validateRequest,
];

const updateBannerValidators = [
    param('id', 'Invalid banner id').isMongoId(),
    body('title', 'Title must be a string').optional().isString(),
    body('image', 'Image must be a string').optional().isString(),
    body('description', 'Description must be a string').optional().isString(),
    body('buttonText', 'Button text must be a string').optional().isString(),
    body('buttonUrl', 'Button URL must be a string').optional().isString(),
    body('order', 'Order must be a number').optional().isInt({ min: 0 }),
    body('status', 'Status must be active or inactive').optional().isIn(['active', 'inactive']),
    body('section', 'Section must be a string').optional().isString(),
    validateRequest,
];

const deleteBannerValidators = [
    param('id', 'Invalid banner id').isMongoId(),
    validateRequest,
];

module.exports = {
    listBannersValidators,
    createBannerValidators,
    updateBannerValidators,
    deleteBannerValidators,
};
