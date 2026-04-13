const { body, param, query } = require('express-validator');
const { validateRequest } = require('../../middleware/validate');

const listCategoriesValidators = [
    query('page', 'Page must be a positive number').optional().isInt({ min: 1 }),
    query('limit', 'Limit must be a positive number').optional().isInt({ min: 1 }),
    validateRequest,
];

const getCategoryValidators = [
    param('id', 'Invalid category id').isMongoId(),
    validateRequest,
];

const createCategoryValidators = [
    body('name', 'Name is required').notEmpty().trim(),
    body('slug', 'Slug must be a string').optional().isString(),
    body('status', 'Status must be active or inactive').optional().isIn(['active', 'inactive']),
    body('image', 'Image must be a string').optional().isString(),
    body('bannerImage', 'Banner image must be a string').optional().isString(),
    validateRequest,
];

const updateCategoryValidators = [
    param('id', 'Invalid category id').isMongoId(),
    body('name', 'Name must be a string').optional().isString(),
    body('slug', 'Slug must be a string').optional().isString(),
    body('status', 'Status must be active or inactive').optional().isIn(['active', 'inactive']),
    body('image', 'Image must be a string').optional().isString(),
    body('bannerImage', 'Banner image must be a string').optional().isString(),
    validateRequest,
];

const deleteCategoryValidators = [
    param('id', 'Invalid category id').isMongoId(),
    validateRequest,
];

const bulkDeleteCategoriesValidators = [
    body('ids', 'ids must be a non-empty array').isArray({ min: 1 }),
    body('ids.*', 'ids must contain valid MongoIds').isMongoId(),
    validateRequest,
];

module.exports = {
    listCategoriesValidators,
    getCategoryValidators,
    createCategoryValidators,
    updateCategoryValidators,
    deleteCategoryValidators,
    bulkDeleteCategoriesValidators,
};
