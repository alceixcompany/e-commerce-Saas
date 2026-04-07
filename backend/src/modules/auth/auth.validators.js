const { body } = require('express-validator');
const { validateRequest } = require('../../middleware/validate');

const registerValidators = [
    body('name', 'Name is required').notEmpty().trim(),
    body('email', 'Please include a valid email').isEmail().normalizeEmail(),
    body('password', 'Please enter a password with 6 or more characters').isLength({ min: 6 }),
    validateRequest,
];

const loginValidators = [
    body('email', 'Please include a valid email').isEmail().normalizeEmail(),
    body('password', 'Password is required').exists(),
    validateRequest,
];

module.exports = {
    registerValidators,
    loginValidators,
};
