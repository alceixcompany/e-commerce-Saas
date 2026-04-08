const publicCategoriesService = require('./publicCategories.service');

const listCategories = async (req, res) => {
    try {
        const { data: categories, totalProducts } = await publicCategoriesService.listCategories();
        res.status(200).json({
            success: true,
            count: categories.length,
            totalProducts,
            data: categories,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Server error',
        });
    }
};

const getCategory = async (req, res) => {
    try {
        const category = await publicCategoriesService.getCategoryById(req.params.id);
        res.status(200).json({
            success: true,
            data: category,
        });
    } catch (error) {
        res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || 'Server error',
        });
    }
};

module.exports = {
    listCategories,
    getCategory,
};
