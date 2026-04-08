const mongoose = require('mongoose');
const escapeRegex = require('../../utils/escapeRegex');
const productsRepo = require('./publicProducts.repository');

const addCompatImage = (product) => {
    const productObj = product.toObject ? product.toObject() : { ...product };
    if (productObj.mainImage && !productObj.image) {
        productObj.image = productObj.mainImage;
    }
    return productObj;
};

const getProductsByIds = async (idsCsv) => {
    if (!idsCsv) {
        const error = new Error('No IDs provided');
        error.statusCode = 400;
        throw error;
    }

    const idArray = idsCsv.split(',').filter(id => mongoose.Types.ObjectId.isValid(id));
    const products = await productsRepo.findProductsByIds(idArray);
    const productsWithCompat = products.map(addCompatImage);
    const sortedProducts = idArray.map(id => productsWithCompat.find(p => p._id.toString() === id)).filter(Boolean);

    return sortedProducts;
};

const getStats = async () => {
    const newArrivalsCount = await productsRepo.countProducts({ status: 'active', isNewArrival: true });
    const bestSellersCount = await productsRepo.countProducts({ status: 'active', isBestSeller: true });
    return { newArrivals: newArrivalsCount, bestSellers: bestSellersCount };
};

const searchProducts = async ({ q, page = 1, limit = 10, minimal }) => {
    if (!q || q.trim().length < 2) {
        const error = new Error('Search query must be at least 2 characters');
        error.statusCode = 400;
        throw error;
    }

    const searchRegex = new RegExp(escapeRegex(q.trim()), 'i');
    let query = { status: 'active', $or: [{ name: searchRegex }, { shortDescription: searchRegex }, { sku: searchRegex }] };

    const skip = (page - 1) * limit;
    let projection = {};
    if (minimal === 'true') {
        projection = {
            name: 1,
            price: 1,
            discountedPrice: 1,
            mainImage: 1,
            image: 1,
            category: 1,
            isNewArrival: 1,
            isBestSeller: 1,
            status: 1,
            stock: 1,
            sku: 1,
            rating: 1
        };
    }

    const [products, total] = await Promise.all([
        productsRepo.findProducts(query, projection, { createdAt: -1 }, skip, parseInt(limit)),
        productsRepo.countProducts(query)
    ]);

    const productsWithCompat = products.map(addCompatImage);
    return {
        products: productsWithCompat,
        total,
        page,
        pages: Math.ceil(total / limit)
    };
};

const listProducts = async ({ tag, category, sort, minPrice, maxPrice, minimal, q, page = 1, limit = 12 }) => {
    let query = { status: 'active' };
    
    if (q && q.trim().length >= 2) {
        const searchRegex = new RegExp(escapeRegex(q.trim()), 'i');
        query.$or = [
            { name: searchRegex },
            { shortDescription: searchRegex },
            { sku: searchRegex }
        ];
    }
    let projection = {};
    if (minimal === 'true') {
        projection = {
            name: 1,
            price: 1,
            discountedPrice: 1,
            mainImage: 1,
            image: 1,
            category: 1,
            isNewArrival: 1,
            isBestSeller: 1,
            status: 1,
            stock: 1,
            sku: 1,
            rating: 1
        };
    }

    if (tag === 'new-arrival') {
        query.isNewArrival = true;
    } else if (tag === 'best-seller') {
        query.isBestSeller = true;
    }

    if (category && category !== 'all') {
        query.category = category;
    }

    if (minPrice || maxPrice) {
        query.price = {};
        if (minPrice) query.price.$gte = Number(minPrice);
        if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    let sortQuery = { createdAt: -1 };
    if (sort) {
        switch (sort) {
            case 'price-low':
                sortQuery = { price: 1 };
                break;
            case 'price-high':
                sortQuery = { price: -1 };
                break;
            case 'name':
                sortQuery = { name: 1 };
                break;
            case 'best-selling':
                sortQuery = { isBestSeller: -1, stock: 1 };
                break;
            case 'newest':
                sortQuery = { createdAt: -1 };
                break;
        }
    }

    const skip = (page - 1) * limit;
    const [products, total] = await Promise.all([
        productsRepo.findProducts(query, projection, sortQuery, skip, parseInt(limit)),
        productsRepo.countProducts(query)
    ]);

    const productsWithCompat = products.map(addCompatImage);
    return {
        products: productsWithCompat,
        total,
        page,
        pages: Math.ceil(total / limit)
    };
};

const getProductById = async (id) => {
    const product = await productsRepo.findProductById(id);
    if (!product) {
        const error = new Error('Product not found');
        error.statusCode = 404;
        throw error;
    }
    return addCompatImage(product);
};

module.exports = {
    getProductsByIds,
    getStats,
    searchProducts,
    listProducts,
    getProductById,
};
