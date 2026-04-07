const { body } = require('express-validator');
const { validateRequest } = require('../../middleware/validate');

const updatePaymentSettingsValidators = [
    body('paypal', 'paypal must be an object').optional().isObject(),
    body('paypal.active', 'paypal.active must be boolean').optional().isBoolean(),
    body('paypal.clientId', 'paypal.clientId must be a string').optional().isString(),
    body('paypal.clientSecret', 'paypal.clientSecret must be a string').optional().isString(),
    body('paypal.mode', 'paypal.mode must be live or sandbox').optional().isIn(['live', 'sandbox']),
    body('iyzico', 'iyzico must be an object').optional().isObject(),
    body('iyzico.active', 'iyzico.active must be boolean').optional().isBoolean(),
    body('iyzico.apiKey', 'iyzico.apiKey must be a string').optional().isString(),
    body('iyzico.secretKey', 'iyzico.secretKey must be a string').optional().isString(),
    body('iyzico.baseUrl', 'iyzico.baseUrl must be a string').optional().isString(),
    validateRequest,
];

module.exports = {
    updatePaymentSettingsValidators,
};
