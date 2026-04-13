const { param, query } = require('express-validator');
const { validateRequest } = require('../../middleware/validate');

const idsValidators = [
    query('ids', 'IDs are required').notEmpty(),
    validateRequest,
];

const searchValidators = [
    query('q', 'Search query is required').notEmpty(),
    validateRequest,
];

const listValidators = [
    query('page', 'Page must be a positive number').optional().isInt({ min: 1 }),
    query('limit', 'Limit must be a positive number').optional().isInt({ min: 1 }),
    validateRequest,
];

const getProductValidators = [
    param('id', 'Product identifier is required').notEmpty(),
    validateRequest,
];

module.exports = {
    idsValidators,
    searchValidators,
    listValidators,
    getProductValidators,
};
