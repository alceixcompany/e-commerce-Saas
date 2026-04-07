const productsService = require('./products.service');

const listProducts = async (req, res) => {
    try {
        const result = await productsService.listProducts(req.query);
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

const getProduct = async (req, res) => {
    try {
        const product = await productsService.getProductById(req.params.id);
        res.status(200).json({
            success: true,
            data: product,
        });
    } catch (error) {
        res.status(error.statusCode || 500).json({
            success: false,
            message: error.statusCode ? error.message : (error.message || 'Server error'),
        });
    }
};

const createProduct = async (req, res) => {
    try {
        const product = await productsService.createProduct(req.body);
        res.status(201).json({
            success: true,
            message: 'Product created successfully',
            data: product,
        });
    } catch (error) {
        res.status(error.statusCode || 500).json({
            success: false,
            message: error.statusCode ? error.message : (error.message || 'Server error'),
        });
    }
};

const updateProduct = async (req, res) => {
    try {
        const product = await productsService.updateProduct(req.params.id, req.body);
        res.status(200).json({
            success: true,
            message: 'Product updated successfully',
            data: product,
        });
    } catch (error) {
        res.status(error.statusCode || 500).json({
            success: false,
            message: error.statusCode ? error.message : (error.message || 'Server error'),
        });
    }
};

const deleteProduct = async (req, res) => {
    try {
        await productsService.deleteProduct(req.params.id);
        res.status(200).json({
            success: true,
            message: 'Product and associated images deleted successfully',
        });
    } catch (error) {
        res.status(error.statusCode || 500).json({
            success: false,
            message: error.statusCode ? error.message : (error.message || 'Server error'),
        });
    }
};

module.exports = {
    listProducts,
    getProduct,
    createProduct,
    updateProduct,
    deleteProduct,
};
