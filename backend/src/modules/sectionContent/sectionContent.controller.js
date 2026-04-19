const sectionService = require('./sectionContent.service');
const { triggerRevalidation } = require('../../utils/revalidate');

const getSection = async (req, res) => {
    try {
        const data = await sectionService.getSectionContent(req.params.identifier);
        res.status(200).json({
            success: true,
            data,
        });
    } catch (error) {
        console.error(error);
        res.status(error.statusCode || 500).json({
            success: false,
            message: error.statusCode ? error.message : (error.message || 'Server error'),
        });
    }
};

const updateSection = async (req, res) => {
    try {
        const section = await sectionService.updateSectionContent(req.params.identifier, req.body.content);
        await triggerRevalidation(['content', 'content:bootstrap', `content:section:${req.params.identifier}`]);
        res.status(200).json({
            success: true,
            data: section,
            message: 'Section content updated successfully'
        });
    } catch (error) {
        res.status(error.statusCode || 400).json({
            success: false,
            message: error.statusCode ? error.message : (error.message || 'Invalid data'),
        });
    }
};

module.exports = {
    getSection,
    updateSection,
};
