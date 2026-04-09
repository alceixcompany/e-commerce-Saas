const DOMPurify = require('isomorphic-dompurify');

/**
 * Sanitizes an input string or object recursively to prevent XSS attacks.
 * @param {any} input - The data to sanitize
 * @returns {any} - The sanitized data
 */
const sanitize = (input) => {
    if (typeof input === 'string') {
        // Use DOMPurify to clean HTML tags and scripts
        // We allow some basic styling if needed later, but for now we're strict
        return DOMPurify.sanitize(input.trim(), {
            ALLOWED_TAGS: [], // No HTML allowed in standard fields
            ALLOWED_ATTR: []
        });
    }

    if (Array.isArray(input)) {
        return input.map(item => sanitize(item));
    }

    if (typeof input === 'object' && input !== null) {
        const sanitizedData = {};
        for (const [key, value] of Object.entries(input)) {
            sanitizedData[key] = sanitize(value);
        }
        return sanitizedData;
    }

    return input;
};

/**
 * Specifically for Rich Text fields if any (allows basic formatting)
 */
const sanitizeHTML = (html) => {
    if (typeof html !== 'string') return html;
    return DOMPurify.sanitize(html, {
        ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br', 'ul', 'ol', 'li'],
        ALLOWED_ATTR: ['href', 'target']
    });
};

module.exports = { sanitize, sanitizeHTML };
