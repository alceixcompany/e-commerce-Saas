const mongoose = require('mongoose');

const pageSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    slug: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    path: {
        type: String,
        required: true
    },
    description: {
        type: String,
        default: ''
    },
    sections: {
        type: mongoose.Schema.Types.Mixed,
        default: []
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Page', pageSchema);
