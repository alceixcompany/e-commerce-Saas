const sectionRepo = require('./publicSectionContent.repository');
const pagesService = require('../pages/pages.service');
const { decrypt } = require('../../utils/encryption');

const getBootstrap = async (slug = null) => {
    const identifiers = ['global_settings', 'home_settings', 'product_settings', 'contact_settings'];
    
    // Fetch all sections and optionally page data in parallel for maximum speed
    const [sections, pageData] = await Promise.all([
        sectionRepo.findSectionsByIdentifiers(identifiers),
        slug ? pagesService.getPageBySlug(slug).catch(() => null) : Promise.resolve(null)
    ]);

    const bootstrapData = {};
    identifiers.forEach(id => {
        const section = sections.find(s => s.identifier === id);
        bootstrapData[id] = section ? section.content : {};
    });

    return {
        ...bootstrapData,
        pageData
    };
};

const getSection = async (identifier) => {
    const section = await sectionRepo.findSectionByIdentifier(identifier);
    if (!section) {
        return { identifier, content: {} };
    }

    if (identifier === 'payment_settings') {
        const content = {};
        const rawContent = section.content || {};

        if (rawContent.paypal) {
            content.paypal = {
                active: rawContent.paypal.active,
                clientId: rawContent.paypal.clientId ? decrypt(rawContent.paypal.clientId) : '',
                mode: rawContent.paypal.mode
            };
        }

        if (rawContent.iyzico) {
            content.iyzico = {
                active: rawContent.iyzico.active,
                // iyzico uses secretKey/apiKey which should NOT be public. 
                // We only send the active status so the frontend knows to show the button.
            };
        }

        return { identifier, content };
    }

    return section;
};

module.exports = {
    getBootstrap,
    getSection,
};
