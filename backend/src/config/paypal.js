const checkoutNodeJssdk = require('@paypal/checkout-server-sdk');
const SectionContent = require('../models/SectionContent');
const { decrypt } = require('../utils/encryption');

async function getPaypalConfig() {
    const section = await SectionContent.findOne({ identifier: 'payment_settings' });
    
    if (section && section.content && section.content.paypal && section.content.paypal.clientId) {
        const { clientId, clientSecret, mode } = section.content.paypal;
        return {
            clientId: decrypt(clientId),
            clientSecret: decrypt(clientSecret),
            mode: mode || 'sandbox'
        };
    }

    // Fallback removed for security. Must be configured in DB.
    return {
        clientId: null,
        clientSecret: null,
        mode: 'sandbox'
    };
}

async function client() {
    const config = await getPaypalConfig();
    
    if (!config.clientId || !config.clientSecret) {
        throw new Error('PayPal payment gateway is not configured in Admin Settings.');
    }

    let environment;
    // Prioritize the mode set in admin settings if available
    const finalMode = config.mode || (process.env.NODE_ENV === 'production' ? 'live' : 'sandbox');
    
    if (finalMode === 'live') {
        environment = new checkoutNodeJssdk.core.LiveEnvironment(config.clientId, config.clientSecret);
    } else {
        environment = new checkoutNodeJssdk.core.SandboxEnvironment(config.clientId, config.clientSecret);
    }

    return new checkoutNodeJssdk.core.PayPalHttpClient(environment);
}

module.exports = { client };
