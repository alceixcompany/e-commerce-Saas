const SectionContent = require('../../models/SectionContent');

const findSectionByIdentifier = async (identifier) => {
    return SectionContent.findOne({ identifier });
};

const upsertSectionContent = async (identifier, content) => {
    return SectionContent.findOneAndUpdate(
        { identifier },
        { content },
        { new: true, upsert: true, setDefaultsOnInsert: true }
    );
};

module.exports = {
    findSectionByIdentifier,
    upsertSectionContent,
};
