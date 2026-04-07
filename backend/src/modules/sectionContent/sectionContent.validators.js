const { body, param } = require('express-validator');
const { validateRequest } = require('../../middleware/validate');
const { allowedIdentifiers } = require('./sectionContent.service');

const getSectionValidators = [
    param('identifier', 'Invalid identifier').isIn(allowedIdentifiers),
    validateRequest,
];

const updateSectionValidators = [
    param('identifier', 'Invalid identifier').isIn(allowedIdentifiers),
    body('content', 'Content is required').exists(),
    validateRequest,
];

module.exports = {
    getSectionValidators,
    updateSectionValidators,
};
