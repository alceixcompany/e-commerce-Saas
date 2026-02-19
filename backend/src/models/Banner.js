const mongoose = require('mongoose');

const bannerSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please provide a banner title'],
        trim: true,
    },
    description: {
        type: String,
        trim: true,
    },
    image: {
        type: String,
        required: [true, 'Please provide a banner image'],
    },
    buttonText: {
        type: String,
        default: 'View Collection',
    },
    buttonUrl: {
        type: String,
        default: '/products',
    },
    order: {
        type: Number,
        default: 0,
    },
    status: {
        type: String,
        enum: ['active', 'inactive'],
        default: 'active',
    }
}, {
    timestamps: true,
});

module.exports = mongoose.model('Banner', bannerSchema);
