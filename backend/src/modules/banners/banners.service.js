const bannersRepo = require('./banners.repository');

const createHttpError = (message, statusCode) => {
    const error = new Error(message);
    error.statusCode = statusCode;
    return error;
};

const listBanners = async () => {
    const banners = await bannersRepo.findBanners();
    return banners;
};

const createBanner = async (payload) => {
    return bannersRepo.createBanner(payload);
};

const updateBanner = async (id, payload) => {
    const banner = await bannersRepo.updateBannerById(id, payload);
    if (!banner) throw createHttpError('Banner not found', 404);
    return banner;
};

const deleteBanner = async (id) => {
    const banner = await bannersRepo.deleteBannerById(id);
    if (!banner) throw createHttpError('Banner not found', 404);
    return true;
};

module.exports = {
    listBanners,
    createBanner,
    updateBanner,
    deleteBanner,
};
