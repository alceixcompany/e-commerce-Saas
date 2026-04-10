const SectionContent = require('../models/SectionContent');

/**
 * Resolves the authoritative base URL for redirects.
 * Prioritizes the Store URL from Payment Settings in DB.
 * Falls back to the first URL in FRONTEND_URL env variable.
 */
const getAuthoritativeUrl = async () => {
    try {
        // 1. Try DB first (most authoritative)
        const paymentSettings = await SectionContent.findOne({ identifier: 'payment_settings' });
        let storeUrl = paymentSettings?.content?.storeUrl;

        if (storeUrl) {
            // Clean specific whitespace or trailing slashes
            return storeUrl.trim().replace(/\/+$/, '');
        }

        // 2. Fallback to .env
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
        // Handle comma-separated lists (pick first valid one)
        const firstUrl = frontendUrl.split(',')[0].trim();
        
        return firstUrl.replace(/\/+$/, '');
    } catch (error) {
        console.error('Error resolving authoritative URL:', error);
        return 'http://localhost:3000'; // Final fallback
    }
};

module.exports = {
    getAuthoritativeUrl
};
