const publicProductsService = require('./publicProducts.service');

const getProductsByIds = async (req, res) => {
    try {
        const products = await publicProductsService.getProductsByIds(req.query.ids);
        res.status(200).json({
            success: true,
            data: products,
        });
    } catch (error) {
        res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || 'Server error',
        });
    }
};

const getStats = async (req, res) => {
    try {
        const data = await publicProductsService.getStats();
        res.status(200).json({
            success: true,
            data,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Server error',
        });
    }
};

const searchProducts = async (req, res) => {
    try {
        const result = await publicProductsService.searchProducts(req.query);
        res.status(200).json({
            success: true,
            count: result.products.length,
            total: result.total,
            page: result.page,
            pages: result.pages,
            data: result.products,
        });
    } catch (error) {
        res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || 'Server error',
        });
    }
};

const listProducts = async (req, res) => {
    try {
        const result = await publicProductsService.listProducts(req.query);
        res.status(200).json({
            success: true,
            count: result.products.length,
            total: result.total,
            page: result.page,
            pages: result.pages,
            data: result.products,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Server error',
        });
    }
};

const getProductById = async (req, res) => {
    try {
        const product = await publicProductsService.getProductById(req.params.id);
        res.status(200).json({
            success: true,
            data: product,
        });
    } catch (error) {
        res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || 'Server error',
        });
    }
};

module.exports = {
    getProductsByIds,
    getStats,
    searchProducts,
    listProducts,
    getProductById,
};
