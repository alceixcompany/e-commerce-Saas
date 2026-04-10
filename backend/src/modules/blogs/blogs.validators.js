const { body, param, query } = require('express-validator');
const { validateRequest } = require('../../middleware/validate');

const listBlogsValidators = [
    query('page', 'Page must be a positive number').optional().isInt({ min: 1 }),
    query('limit', 'Limit must be a positive number').optional().isInt({ min: 1 }),
    query('sort', 'Invalid sort').optional().isIn(['all', 'best-read', 'new']),
    validateRequest,
];

const listAllBlogsValidators = [
    query('page', 'Page must be a positive number').optional().isInt({ min: 1 }),
    query('limit', 'Limit must be a positive number').optional().isInt({ min: 1 }),
    validateRequest,
];

const getBlogValidators = [
    param('id', 'Invalid blog id or slug').notEmpty(),
    validateRequest,
];

const createBlogValidators = [
    body('title', 'Title is required').notEmpty().trim(),
    body('excerpt', 'Excerpt is required').notEmpty().trim(),
    body('content', 'Content is required').notEmpty(),
    body('image', 'Image must be a string').optional().isString(),
    body('tags', 'Tags must be an array').optional().isArray(),
    body('isPublished', 'isPublished must be boolean').optional().isBoolean(),
    validateRequest,
];

const updateBlogValidators = [
    param('id', 'Invalid blog id').isMongoId(),
    body('title', 'Title must be a string').optional().isString(),
    body('excerpt', 'Excerpt must be a string').optional().isString(),
    body('content', 'Content must be a string').optional().isString(),
    body('image', 'Image must be a string').optional().isString(),
    body('tags', 'Tags must be an array').optional().isArray(),
    body('isPublished', 'isPublished must be boolean').optional().isBoolean(),
    validateRequest,
];

const deleteBlogValidators = [
    param('id', 'Invalid blog id').isMongoId(),
    validateRequest,
];

module.exports = {
    listBlogsValidators,
    listAllBlogsValidators,
    getBlogValidators,
    createBlogValidators,
    updateBlogValidators,
    deleteBlogValidators,
};
