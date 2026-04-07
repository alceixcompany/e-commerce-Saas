const { param } = require('express-validator');
const { validateRequest } = require('../../middleware/validate');

const getCategoryValidators = [
    param('id', 'Invalid category id').isMongoId(),
    validateRequest,
];

module.exports = {
    getCategoryValidators,
};
