const categoriesService = require('./categories.service');

const listCategories = async (req, res) => {
    try {
        const { categories, total, totalProducts, page, pages } = await categoriesService.listCategories(req.query);
        res.status(200).json({
            success: true,
            count: categories.length,
            total,
            totalProducts,
            page,
            pages,
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
        const category = await categoriesService.getCategoryById(req.params.id);
        res.status(200).json({
            success: true,
            data: category,
        });
    } catch (error) {
        res.status(error.statusCode || 500).json({
            success: false,
            message: error.statusCode ? error.message : (error.message || 'Server error'),
        });
    }
};

const createCategory = async (req, res) => {
    try {
        const category = await categoriesService.createCategory(req.body);
        res.status(201).json({
            success: true,
            message: 'Category created successfully',
            data: category,
        });
    } catch (error) {
        res.status(error.statusCode || 500).json({
            success: false,
            message: error.statusCode ? error.message : (error.message || 'Server error'),
        });
    }
};

const updateCategory = async (req, res) => {
    try {
        const category = await categoriesService.updateCategory(req.params.id, req.body);
        res.status(200).json({
            success: true,
            message: 'Category updated successfully',
            data: category,
        });
    } catch (error) {
        res.status(error.statusCode || 500).json({
            success: false,
            message: error.statusCode ? error.message : (error.message || 'Server error'),
        });
    }
};

const deleteCategory = async (req, res) => {
    try {
        await categoriesService.deleteCategory(req.params.id);
        res.status(200).json({
            success: true,
            message: 'Category and associated images deleted successfully',
        });
    } catch (error) {
        res.status(error.statusCode || 500).json({
            success: false,
            message: error.statusCode ? error.message : (error.message || 'Server error'),
        });
    }
};

const bulkDeleteCategories = async (req, res) => {
    try {
        const { ids } = req.body;
        await categoriesService.bulkDeleteCategories(ids);
        res.status(200).json({
            success: true,
            message: `Successfully deleted ${ids.length} categories`,
        });
    } catch (error) {
        res.status(error.statusCode || 500).json({
            success: false,
            message: error.statusCode ? error.message : (error.message || 'Server error'),
        });
    }
};

module.exports = {
    listCategories,
    getCategory,
    createCategory,
    updateCategory,
    deleteCategory,
    bulkDeleteCategories,
};
