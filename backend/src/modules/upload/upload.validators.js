const { param } = require('express-validator');
const { validateRequest } = require('../../middleware/validate');

const fileIdValidators = [
    param('id', 'Invalid file id').isMongoId(),
    validateRequest,
];

module.exports = {
    fileIdValidators,
};
