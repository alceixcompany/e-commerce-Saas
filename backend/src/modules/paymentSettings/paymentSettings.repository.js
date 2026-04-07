const SectionContent = require('../../models/SectionContent');

const findPaymentSettings = async () => {
    return SectionContent.findOne({ identifier: 'payment_settings' });
};

const upsertPaymentSettings = async (content) => {
    return SectionContent.findOneAndUpdate(
        { identifier: 'payment_settings' },
        { $set: { content } },
        { new: true, upsert: true, setDefaultsOnInsert: true }
    );
};

module.exports = {
    findPaymentSettings,
    upsertPaymentSettings,
};
