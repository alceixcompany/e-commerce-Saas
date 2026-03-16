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

    // Fallback to .env if not found in DB
    return {
        clientId: process.env.PAYPAL_CLIENT_ID,
        clientSecret: process.env.PAYPAL_CLIENT_SECRET,
        mode: process.env.NODE_ENV === 'production' ? 'live' : 'sandbox'
    };
}

async function client() {
    const config = await getPaypalConfig();
    
    let environment;
    if (config.mode === 'live' || process.env.NODE_ENV === 'production') {
        environment = new checkoutNodeJssdk.core.LiveEnvironment(config.clientId, config.clientSecret);
    } else {
        environment = new checkoutNodeJssdk.core.SandboxEnvironment(config.clientId, config.clientSecret);
    }

    return new checkoutNodeJssdk.core.PayPalHttpClient(environment);
}

module.exports = { client };
