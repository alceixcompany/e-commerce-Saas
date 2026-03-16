const mongoose = require('mongoose');

const sectionContentSchema = new mongoose.Schema({
    identifier: {
        type: String,
        required: true,
        unique: true,
        enum: ['popular_collections', 'footer_config', 'contact_info', 'global_settings', 'payment_settings', 'home_settings', 'product_settings', 'about_settings', 'contact_settings', 'auth_settings', 'privacy_policy', 'terms_of_service', 'accessibility'], // Expanded
    },
    content: {
        type: mongoose.Schema.Types.Mixed,
        default: {},
    }
}, {
    timestamps: true,
});

module.exports = mongoose.model('SectionContent', sectionContentSchema);
