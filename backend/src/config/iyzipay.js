const Iyzipay = require('iyzipay');
const SectionContent = require('../models/SectionContent');
const { decrypt } = require('../utils/encryption');

async function getIyzipayConfig() {
    const section = await SectionContent.findOne({ identifier: 'payment_settings' });
    
    if (section && section.content && section.content.iyzico && section.content.iyzico.apiKey) {
        const { apiKey, secretKey, baseUrl } = section.content.iyzico;
        return {
            apiKey: decrypt(apiKey),
            secretKey: decrypt(secretKey),
            uri: baseUrl || 'https://sandbox-api.iyzipay.com'
        };
    }

    // Fallback removed for security. Must be configured in DB.
    return {
        apiKey: null,
        secretKey: null,
        uri: 'https://sandbox-api.iyzipay.com'
    };
}

// Function to initialize new client per request to ensure fresh config
async function getIyzipayClient() {
    const config = await getIyzipayConfig();
    
    // Check if API keys exist
    if (!config.apiKey || !config.secretKey) {
        throw new Error('Iyzico payment gateway is not fully configured (missing API Keys). Please contact store support.');
    }
    
    return new Iyzipay(config);
}

module.exports = { getIyzipayClient, getIyzipayConfig };
