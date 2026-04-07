const Product = require('../../models/Product');

const findProducts = async (query, skip, limit) => {
    return Promise.all([
        Product.find(query)
            .populate('category', 'name slug')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit),
        Product.countDocuments(query)
    ]);
};

const findProductById = async (id) => {
    return Product.findById(id).populate('category', 'name slug');
};

const findProductByIdLean = async (id) => {
    return Product.findById(id).lean();
};

const findProductBySku = async (sku) => {
    return Product.findOne({ sku });
};

const createProduct = async (payload) => {
    return Product.create(payload);
};

const updateProductById = async (id, payload) => {
    return Product.findByIdAndUpdate(id, payload, { new: true, runValidators: true })
        .populate('category', 'name slug');
};

const deleteProduct = async (product) => {
    return product.deleteOne();
};

module.exports = {
    findProducts,
    findProductById,
    findProductByIdLean,
    findProductBySku,
    createProduct,
    updateProductById,
    deleteProduct,
};
