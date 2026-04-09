const sectionRepo = require('./publicSectionContent.repository');
const pagesService = require('../pages/pages.service');

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
        const content = { ...section.content };
        if (content.paypal) {
            content.paypal = {
                active: content.paypal.active,
                clientId: decrypt(content.paypal.clientId),
                mode: content.paypal.mode
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
