const mongoose = require('mongoose');

const sectionContentSchema = new mongoose.Schema({
    identifier: {
        type: String,
        required: true,
        unique: true,
        enum: ['popular_collections', 'footer_config', 'contact_info'], // Expandable
    },
    content: {
        type: mongoose.Schema.Types.Mixed,
        default: {},
    }
}, {
    timestamps: true,
});

module.exports = mongoose.model('SectionContent', sectionContentSchema);
