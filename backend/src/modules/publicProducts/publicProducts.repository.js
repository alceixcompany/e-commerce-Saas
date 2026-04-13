const Product = require('../../models/Product');

const findProductsByIds = async (ids) => {
    return Product.find({ _id: { $in: ids }, status: 'active' }).populate('category', 'name slug');
};

const countProducts = async (query) => {
    return Product.countDocuments(query);
};

const findProducts = async (query, projection, sortQuery, skip, limit) => {
    return Product.find(query, projection)
        .populate('category', 'name slug')
        .sort(sortQuery)
        .skip(skip)
        .limit(limit);
};

const findProductById = async (id) => {
    const mongoose = require('mongoose');
    if (!mongoose.Types.ObjectId.isValid(id)) {
        // Option: Search by SKU or slug if we had one. For now, just return null for invalid IDs.
        // Product.findOne({ sku: id.toUpperCase(), status: 'active' })
        return null;
    }
    return Product.findOne({ _id: id, status: 'active' }).populate('category', 'name slug');
};

module.exports = {
    findProductsByIds,
    countProducts,
    findProducts,
    findProductById,
};
