const { decrypt } = require('../../utils/encryption');
const sectionRepo = require('./publicSectionContent.repository');

const getBootstrap = async () => {
    const identifiers = ['global_settings', 'home_settings', 'product_settings', 'contact_settings'];
    const sections = await sectionRepo.findSectionsByIdentifiers(identifiers);

    const bootstrapData = {};
    identifiers.forEach(id => {
        const section = sections.find(s => s.identifier === id);
        bootstrapData[id] = section ? section.content : {};
    });

    return bootstrapData;
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
