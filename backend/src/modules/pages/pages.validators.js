const { body, param, query } = require('express-validator');
const { validateRequest } = require('../../middleware/validate');

const listPagesValidators = [
    query('page', 'Page must be a positive number').optional().isInt({ min: 1 }),
    query('limit', 'Limit must be a positive number').optional().isInt({ min: 1 }),
    validateRequest,
];

const getPageValidators = [
    param('slug', 'Slug is required').notEmpty().trim(),
    validateRequest,
];

const createPageValidators = [
    body('title', 'Title is required').notEmpty().trim(),
    body('slug', 'Slug is required').notEmpty().trim(),
    body('path', 'Path is required').notEmpty().trim(),
    body('description', 'Description must be a string').optional().isString(),
    body('sections', 'Sections must be an array').optional().isArray(),
    validateRequest,
];

const updatePageValidators = [
    param('id', 'Invalid page id').isMongoId(),
    body('title', 'Title must be a string').optional().isString(),
    body('slug', 'Slug must be a string').optional().isString(),
    body('path', 'Path must be a string').optional().isString(),
    body('description', 'Description must be a string').optional().isString(),
    body('sections', 'Sections must be an array').optional().isArray(),
    validateRequest,
];

const deletePageValidators = [
    param('id', 'Invalid page id').isMongoId(),
    validateRequest,
];

module.exports = {
    listPagesValidators,
    getPageValidators,
    createPageValidators,
    updatePageValidators,
    deletePageValidators,
};
