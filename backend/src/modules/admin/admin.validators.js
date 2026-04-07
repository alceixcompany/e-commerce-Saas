const { body, param, query } = require('express-validator');
const { validateRequest } = require('../../middleware/validate');

const listUsersValidators = [
    query('page', 'Page must be a positive number').optional().isInt({ min: 1 }),
    query('limit', 'Limit must be a positive number').optional().isInt({ min: 1 }),
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

module.exports = {
    listUsersValidators,
    userIdParamValidators,
    updateRoleValidators,
};
