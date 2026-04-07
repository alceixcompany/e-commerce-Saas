const Banner = require('../../models/Banner');

const findActiveBanners = async () => {
    return Banner.find({ status: 'active' }).sort({ order: 1, createdAt: -1 });
};

module.exports = {
    findActiveBanners,
};
