const paymentRepo = require('./paymentSettings.repository');
const { encrypt, decrypt } = require('../../utils/encryption');
const { sanitizeUrl } = require('../../utils/url');

const maskValue = (val) => {
    if (!val) return '';
    const decrypted = decrypt(val);
    if (!decrypted) return '';
    if (decrypted.length <= 8) return '********';
    return decrypted.substring(0, 4) + '****************' + decrypted.slice(-4);
};

const getPaymentSettings = async () => {
    const section = await paymentRepo.findPaymentSettings();
    const data = section ? section.content : {
        paypal: {
            active: false,
            clientId: '',
            clientSecret: '',
            mode: 'sandbox'
        },
        iyzico: {
            active: false,
            apiKey: '',
            secretKey: '',
            baseUrl: 'https://sandbox-api.iyzipay.com'
        },
        storeUrl: ''
    };

    if (data.paypal) {
        data.paypal.clientId = maskValue(data.paypal.clientId);
        data.paypal.clientSecret = maskValue(data.paypal.clientSecret);
    }
    if (data.iyzico) {
        data.iyzico.apiKey = maskValue(data.iyzico.apiKey);
        data.iyzico.secretKey = maskValue(data.iyzico.secretKey);
    }

    return data;
};

const updatePaymentSettings = async ({ paypal, iyzico, storeUrl }) => {
    const existingSection = await paymentRepo.findPaymentSettings();
    const existingContent = existingSection ? existingSection.content : {};

    const newPaypal = paypal ? { ...paypal } : undefined;
    const newIyzico = iyzico ? { ...iyzico } : undefined;

    const processField = (provider, field, newValue) => {
        if (newValue && newValue.includes('****************')) {
            return existingContent[provider] ? existingContent[provider][field] : null;
        }
        return newValue ? encrypt(newValue) : null;
    };

    if (newPaypal) {
        newPaypal.clientId = processField('paypal', 'clientId', paypal.clientId);
        newPaypal.clientSecret = processField('paypal', 'clientSecret', paypal.clientSecret);
    }

    if (newIyzico) {
        newIyzico.apiKey = processField('iyzico', 'apiKey', iyzico.apiKey);
        newIyzico.secretKey = processField('iyzico', 'secretKey', iyzico.secretKey);
    }

    const updateContent = {};
    if (newPaypal) updateContent.paypal = newPaypal;
    if (newIyzico) updateContent.iyzico = newIyzico;
    
    // Sanitize Store URL if provided
    if (storeUrl !== undefined) {
        updateContent.storeUrl = sanitizeUrl(storeUrl);
    }

    await paymentRepo.upsertPaymentSettings({ ...existingContent, ...updateContent });
    return true;
};

module.exports = {
    getPaymentSettings,
    updatePaymentSettings,
};
