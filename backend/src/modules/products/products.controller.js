const productsService = require('./products.service');
const { triggerRevalidation } = require('../../utils/revalidate');

const getProductRevalidationPayload = (productId) => ({
    tags: [
        'products',
        'admin:dashboard',
        'admin:products',
        ...(productId ? [`product:${productId}`, `admin:product:${productId}`] : []),
    ],
    paths: [
        '/products',
        '/admin/products',
        ...(productId ? [`/products/${productId}`, `/admin/products/edit/${productId}`] : []),
    ],
});

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
    const fs = require('fs');
    const path = require('path');
    const debugFile = path.join(process.cwd(), 'debug_controller_data.log');
    
    try {
        const debugInfo = {
            timestamp: new Date().toISOString(),
            type: 'Request',
            body: req.body
        };
        fs.appendFileSync(debugFile, JSON.stringify(debugInfo, null, 2) + '\n');
        
        console.log('--- Product Creation Request ---');
        console.log('Body:', JSON.stringify(req.body, null, 2));
        
        const product = await productsService.createProduct(req.body);
        await triggerRevalidation(getProductRevalidationPayload(product?._id?.toString?.() || null));
        res.status(201).json({
            success: true,
            message: 'Product created successfully',
            data: product,
        });
    } catch (error) {
        const debugInfo = {
            timestamp: new Date().toISOString(),
            type: 'Error',
            message: error.message,
            stack: error.stack,
            code: error.code,
            statusCode: error.statusCode
        };
        fs.appendFileSync(debugFile, JSON.stringify(debugInfo, null, 2) + '\n');

        console.error('--- Product Creation ERROR ---');
        console.error('Message:', error.message);
        console.error('Stack:', error.stack);
        
        // Handle SKU duplicate error as a warning (200 OK with warning: true)
        if (error.statusCode === 400 && error.message.includes('SKU')) {
            return res.status(200).json({
                success: false,
                warning: true,
                message: error.message,
            });
        }
        
        // Handle MongoDB duplicate key error (11000)
        if (error.code === 11000) {
            return res.status(200).json({
                success: false,
                warning: true,
                message: 'Product with this SKU already exists (database conflict)',
            });
        }
        
        res.status(error.statusCode || 500).json({
            success: false,
            message: error.statusCode ? error.message : (error.message || 'Server error'),
        });
    }
};

const updateProduct = async (req, res) => {
    try {
        const product = await productsService.updateProduct(req.params.id, req.body);
        await triggerRevalidation(getProductRevalidationPayload(req.params.id));
        res.status(200).json({
            success: true,
            message: 'Product updated successfully',
            data: product,
        });
    } catch (error) {
        // Handle SKU duplicate error as a warning (200 OK with warning: true)
        if (error.statusCode === 400 && error.message.includes('SKU')) {
            return res.status(200).json({
                success: false,
                warning: true,
                message: error.message,
            });
        }

        res.status(error.statusCode || 500).json({
            success: false,
            message: error.statusCode ? error.message : (error.message || 'Server error'),
        });
    }
};

const deleteProduct = async (req, res) => {
    try {
        await productsService.deleteProduct(req.params.id);
        await triggerRevalidation(getProductRevalidationPayload(req.params.id));
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

const bulkDeleteProducts = async (req, res) => {
    try {
        const { ids } = req.body;
        await productsService.bulkDeleteProducts(ids);
        await triggerRevalidation({
            tags: [
                'products',
                'admin:dashboard',
                'admin:products',
                ...ids.map((id) => `product:${id}`),
                ...ids.map((id) => `admin:product:${id}`),
            ],
            paths: [
                '/products',
                '/admin/products',
                ...ids.map((id) => `/products/${id}`),
                ...ids.map((id) => `/admin/products/edit/${id}`),
            ],
        });
        res.status(200).json({
            success: true,
            message: `Successfully deleted ${ids.length} products`,
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
    bulkDeleteProducts,
};
