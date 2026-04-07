const Banner = require('../../models/Banner');

const findBanners = async () => {
    return Banner.find().sort({ order: 1, createdAt: -1 });
};

const createBanner = async (payload) => {
    return Banner.create(payload);
};

const updateBannerById = async (id, payload) => {
    return Banner.findByIdAndUpdate(id, payload, { new: true, runValidators: true });
};

const deleteBannerById = async (id) => {
    return Banner.findByIdAndDelete(id);
};

module.exports = {
    findBanners,
    createBanner,
    updateBannerById,
    deleteBannerById,
};
