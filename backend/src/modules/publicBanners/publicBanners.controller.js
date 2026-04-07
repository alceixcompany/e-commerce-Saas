const publicBannersService = require('./publicBanners.service');

const listBanners = async (req, res) => {
    try {
        const banners = await publicBannersService.listBanners();
        res.status(200).json({
            success: true,
            count: banners.length,
            data: banners,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Server error',
        });
    }
};

module.exports = {
    listBanners,
};
