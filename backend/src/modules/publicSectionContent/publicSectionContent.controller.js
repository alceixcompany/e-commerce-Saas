const publicSectionService = require('./publicSectionContent.service');
const logger = require('../../utils/logger');

const getBootstrap = async (req, res) => {
    try {
        const { slug } = req.query;
        const data = await publicSectionService.getBootstrap(slug);
        res.status(200).json({
            success: true,
            data
        });
    } catch (error) {
        logger.error('Bootstrap error:', error);
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
        logger.error(`Get section error (${req.params.identifier}):`, error);
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
