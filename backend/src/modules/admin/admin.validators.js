const { body, param, query } = require('express-validator');
const { validateRequest } = require('../../middleware/validate');

const listUsersValidators = [
    query('page', 'Page must be a positive number').optional().isInt({ min: 1 }),
    query('limit', 'Limit must be a positive number').optional().isInt({ min: 1 }),
    query('role', 'Invalid role').optional().isIn(['user', 'admin']),
    validateRequest,
];

const userIdParamValidators = [
    param('id', 'Invalid user id').isMongoId(),
    validateRequest,
];

const updateRoleValidators = [
    param('id', 'Invalid user id').isMongoId(),
    body('role', 'Role must be user or admin').isIn(['user', 'admin']),
    validateRequest,
];

const bulkDeleteUsersValidators = [
    body('ids', 'ids must be a non-empty array').isArray({ min: 1 }),
    body('ids.*', 'ids must contain valid MongoIds').isMongoId(),
    validateRequest,
];

module.exports = {
    listUsersValidators,
    userIdParamValidators,
    updateRoleValidators,
    bulkDeleteUsersValidators,
};
