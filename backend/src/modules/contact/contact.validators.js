const { body } = require('express-validator');
const { validateRequest } = require('../../middleware/validate');

const createMessageValidators = [
    body('name', 'Name is required').notEmpty().trim(),
    body('email', 'Please include a valid email').isEmail().normalizeEmail(),
    body('subject', 'Subject is required').notEmpty().trim(),
    body('message', 'Message is required').notEmpty().trim(),
    validateRequest,
];

module.exports = {
    createMessageValidators,
};
