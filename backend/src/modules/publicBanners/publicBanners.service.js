const bannersRepo = require('./publicBanners.repository');

const listBanners = async () => {
    return bannersRepo.findActiveBanners();
};

module.exports = {
    listBanners,
};
