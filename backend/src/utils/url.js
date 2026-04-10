/**
 * Sanitizes a URL for use in payment gateway callbacks and SEO.
 * Ensures https://, removes trailing slashes, and trims whitespace.
 * @param {string} url - The raw URL input
 * @returns {string} - The sanitized URL
 */
const sanitizeUrl = (url) => {
    if (!url) return '';

    let sanitized = url.trim();

    // Remove trailing slashes
    sanitized = sanitized.replace(/\/+$/, '');

    // Force HTTPS protocol
    if (sanitized.startsWith('http://')) {
        sanitized = sanitized.replace('http://', 'https://');
    } else if (!sanitized.startsWith('https://')) {
        sanitized = `https://${sanitized}`;
    }

    return sanitized;
};

module.exports = { sanitizeUrl };
