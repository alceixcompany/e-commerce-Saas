const { body, param, query } = require('express-validator');
const { validateRequest } = require('../../middleware/validate');

const listComponentsValidators = [
    query('type', 'Type must be a string').optional().isString(),
    validateRequest,
];

const getComponentValidators = [
    param('id', 'Invalid component instance id').isMongoId(),
    validateRequest,
];

const createComponentValidators = [
    body('type', 'Type is required').notEmpty().trim(),
    body('name', 'Name is required').notEmpty().trim(),
    body('data', 'Data must be an object').optional().isObject(),
    validateRequest,
];

const updateComponentValidators = [
    param('id', 'Invalid component instance id').isMongoId(),
    body('type', 'Type must be a string').optional().isString(),
    body('name', 'Name must be a string').optional().isString(),
    body('data', 'Data must be an object').optional().isObject(),
    validateRequest,
];

const deleteComponentValidators = [
    param('id', 'Invalid component instance id').isMongoId(),
    validateRequest,
];

module.exports = {
    listComponentsValidators,
    getComponentValidators,
    createComponentValidators,
    updateComponentValidators,
    deleteComponentValidators,
};
