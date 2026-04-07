const publicSectionService = require('./publicSectionContent.service');

const getBootstrap = async (req, res) => {
    try {
        const data = await publicSectionService.getBootstrap();
        res.status(200).json({
            success: true,
            data
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Server error',
        });
    }
};

const getSection = async (req, res) => {
    try {
        const data = await publicSectionService.getSection(req.params.identifier);
        res.status(200).json({
            success: true,
            data
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Server error',
        });
    }
};

module.exports = {
    getBootstrap,
    getSection,
};
