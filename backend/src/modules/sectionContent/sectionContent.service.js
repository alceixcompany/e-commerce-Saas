const sectionRepo = require('./sectionContent.repository');

const allowedIdentifiers = [
    'popular_collections',
    'footer_config',
    'contact_info',
    'global_settings',
    'payment_settings',
    'home_settings',
    'product_settings',
    'about_settings',
    'contact_settings',
    'auth_settings',
    'privacy_policy',
    'terms_of_service',
    'accessibility'
];

const createHttpError = (message, statusCode) => {
    const error = new Error(message);
    error.statusCode = statusCode;
    return error;
};

const getSectionContent = async (identifier) => {
    if (!allowedIdentifiers.includes(identifier)) {
        throw createHttpError('Invalid identifier', 400);
    }
    const section = await sectionRepo.findSectionByIdentifier(identifier);
    if (!section) {
        return { identifier, content: {} };
    }
    return section;
};

const updateSectionContent = async (identifier, content) => {
    if (!allowedIdentifiers.includes(identifier)) {
        throw createHttpError('Invalid identifier', 400);
    }
    return sectionRepo.upsertSectionContent(identifier, content);
};

module.exports = {
    allowedIdentifiers,
    getSectionContent,
    updateSectionContent,
};
