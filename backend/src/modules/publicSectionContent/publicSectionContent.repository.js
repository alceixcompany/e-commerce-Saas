const SectionContent = require('../../models/SectionContent');

const findSectionsByIdentifiers = async (identifiers) => {
    return SectionContent.find({ identifier: { $in: identifiers } });
};

const findSectionByIdentifier = async (identifier) => {
    return SectionContent.findOne({ identifier });
};

module.exports = {
    findSectionsByIdentifiers,
    findSectionByIdentifier,
};
