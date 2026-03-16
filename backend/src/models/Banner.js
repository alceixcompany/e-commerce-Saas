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
    },
    section: {
        type: String,
        enum: ['hero', 'grid', 'hero_split'], // 'hero' for top slider, 'grid' for middle section banners, 'hero_split' for split hero
        default: 'grid',
    }
}, {
    timestamps: true,
});

module.exports = mongoose.model('Banner', bannerSchema);
