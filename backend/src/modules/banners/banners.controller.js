const bannersService = require('./banners.service');

const listBanners = async (req, res) => {
    try {
        const banners = await bannersService.listBanners();
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

const createBanner = async (req, res) => {
    try {
        const banner = await bannersService.createBanner(req.body);
        res.status(201).json({
            success: true,
            data: banner,
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message || 'Invalid data',
        });
    }
};

const updateBanner = async (req, res) => {
    try {
        const banner = await bannersService.updateBanner(req.params.id, req.body);
        res.status(200).json({
            success: true,
            data: banner,
        });
    } catch (error) {
        res.status(error.statusCode || 400).json({
            success: false,
            message: error.statusCode ? error.message : (error.message || 'Invalid data'),
        });
    }
};

const deleteBanner = async (req, res) => {
    try {
        await bannersService.deleteBanner(req.params.id);
        res.status(200).json({
            success: true,
            message: 'Banner deleted successfully',
            data: {},
        });
    } catch (error) {
        res.status(error.statusCode || 500).json({
            success: false,
            message: error.statusCode ? error.message : (error.message || 'Server error'),
        });
    }
};

module.exports = {
    listBanners,
    createBanner,
    updateBanner,
    deleteBanner,
};
