const mongoose = require('mongoose');
const { GridFSBucket } = require('mongodb');
const productsRepo = require('./products.repository');
const escapeRegex = require('../../utils/escapeRegex');
const { sanitize } = require('../../utils/sanitizer');

const createHttpError = (message, statusCode) => {
    const error = new Error(message);
    error.statusCode = statusCode;
    return error;
};

const addCompatImage = (product) => {
    const productObj = product.toObject ? product.toObject() : { ...product };
    if (productObj.mainImage && !productObj.image) {
        productObj.image = productObj.mainImage;
    }
    return productObj;
};

const listProducts = async ({ page = 1, limit = 10, category, q }) => {
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const query = {};

    if (category && category !== 'all') {
        query.category = category;
    }

    if (q) {
        const searchRegex = new RegExp(escapeRegex(q.trim()), 'i');
        query.$or = [
            { name: searchRegex },
            { sku: searchRegex },
            { shortDescription: searchRegex }
        ];
    }

    const [products, total] = await productsRepo.findProducts(query, skip, parseInt(limit));
    const productsWithCompat = products.map(addCompatImage);

    return {
        products: productsWithCompat,
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit)
    };
};

const getProductById = async (id) => {
    const product = await productsRepo.findProductById(id);
    if (!product) throw createHttpError('Product not found', 404);
    return addCompatImage(product);
};

const createProduct = async (payload) => {
    const {
        name,
        category,
        shortDescription,
        price,
        discountedPrice,
        stock,
        sku,
        mainImage,
        image,
        images,
        shippingWeight,
        status,
        rating,
        isNewArrival,
        isBestSeller,
    } = payload;

    const productMainImage = mainImage || image;

    const isInvalid = (value, allowZero = false) => {
        if (value === undefined || value === null || value === '') return true;
        if (!allowZero && value === 0) return true;
        return false;
    };

    const validationErrors = [];
    if (isInvalid(name)) validationErrors.push('name');
    if (isInvalid(category)) validationErrors.push('category');
    if (isInvalid(price, true)) validationErrors.push('price');
    if (isInvalid(stock, true)) validationErrors.push('stock');
    if (isInvalid(sku)) validationErrors.push('sku');
    if (isInvalid(productMainImage)) validationErrors.push('mainImage');
    if (isInvalid(shippingWeight, true)) validationErrors.push('shippingWeight');

    if (validationErrors.length > 0) {
        throw createHttpError(`Please provide all required fields. Missing: ${validationErrors.join(', ')}`, 400);
    }

    const existingProduct = await productsRepo.findProductBySku(sku);
    if (existingProduct) {
        throw createHttpError('Product with this SKU already exists', 400);
    }

    const product = await productsRepo.createProduct({
        name: sanitize(name),
        category,
        shortDescription: shortDescription ? sanitize(shortDescription) : undefined,
        price,
        discountedPrice: discountedPrice || undefined,
        stock,
        sku: sku.toUpperCase(),
        mainImage: productMainImage,
        image: productMainImage,
        images: images || [],
        shippingWeight,
        status: status || 'active',
        rating: rating !== undefined ? parseFloat(rating) : undefined,
        isNewArrival: isNewArrival || false,
        isBestSeller: isBestSeller || false,
    });

    const populatedProduct = await productsRepo.findProductById(product._id);
    return addCompatImage(populatedProduct);
};

const updateProduct = async (id, payload) => {
    const product = await productsRepo.findProductById(id);
    if (!product) throw createHttpError('Product not found', 404);

    if (payload.sku && payload.sku !== product.sku) {
        const existingProduct = await productsRepo.findProductBySku(payload.sku.toUpperCase());
        if (existingProduct) {
            throw createHttpError('Product with this SKU already exists', 400);
        }
        payload.sku = payload.sku.toUpperCase();
    }

    const updateData = {
        name: payload.name ? sanitize(payload.name) : product.name,
        category: payload.category || product.category,
        shortDescription: payload.shortDescription !== undefined ? sanitize(payload.shortDescription) : product.shortDescription,
        price: payload.price !== undefined ? payload.price : product.price,
        discountedPrice: payload.discountedPrice !== undefined ? payload.discountedPrice : product.discountedPrice,
        stock: payload.stock !== undefined ? payload.stock : product.stock,
        sku: payload.sku ? payload.sku.toUpperCase() : product.sku,
        mainImage: payload.mainImage || product.mainImage,
        images: payload.images || product.images,
        shippingWeight: payload.shippingWeight !== undefined ? payload.shippingWeight : product.shippingWeight,
        status: payload.status || product.status,
        rating: payload.rating !== undefined ? payload.rating : product.rating,
        isNewArrival: payload.isNewArrival !== undefined ? payload.isNewArrival : product.isNewArrival,
        isBestSeller: payload.isBestSeller !== undefined ? payload.isBestSeller : product.isBestSeller,
    };

    if (updateData.mainImage && !updateData.image) {
        updateData.image = updateData.mainImage;
    }

    const updatedProduct = await productsRepo.updateProductById(id, updateData);
    return addCompatImage(updatedProduct);
};

const extractFileIdFromUrl = (url) => {
    if (!url) return null;
    const match = url.match(/\/api\/upload\/image\/([a-fA-F0-9]{24})/);
    return match ? match[1] : null;
};

const deleteImageFromGridFS = async (fileId) => {
    try {
        if (!fileId) return;

        const bucket = new GridFSBucket(mongoose.connection.db, {
            bucketName: 'uploads',
        });

        const objectId = new mongoose.Types.ObjectId(fileId);
        await bucket.delete(objectId);
    } catch (error) {
        console.error(`Failed to delete image ${fileId}:`, error.message);
    }
};

const cleanupProductImages = async (product) => {
    const imageIdsToDelete = [];

    if (product.mainImage) {
        const mainImageId = extractFileIdFromUrl(product.mainImage);
        if (mainImageId) imageIdsToDelete.push(mainImageId);
    }

    if (product.image) {
        const imageId = extractFileIdFromUrl(product.image);
        if (imageId && !imageIdsToDelete.includes(imageId)) {
            imageIdsToDelete.push(imageId);
        }
    }

    if (product.images && Array.isArray(product.images)) {
        product.images.forEach((imageUrl) => {
            const imageId = extractFileIdFromUrl(imageUrl);
            if (imageId && !imageIdsToDelete.includes(imageId)) {
                imageIdsToDelete.push(imageId);
            }
        });
    }

    if (imageIdsToDelete.length > 0) {
        await Promise.all(imageIdsToDelete.map(deleteImageFromGridFS));
    }
};

const deleteProduct = async (id) => {
    const product = await productsRepo.findProductByIdLean(id);
    if (!product) throw createHttpError('Product not found', 404);

    await cleanupProductImages(product);

    const productDoc = await productsRepo.findProductById(id);
    if (productDoc) {
        await productsRepo.deleteProduct(productDoc);
    }
};

const bulkDeleteProducts = async (ids) => {
    if (!ids || !Array.isArray(ids) || ids.length === 0) return;

    for (const id of ids) {
        const product = await productsRepo.findProductByIdLean(id);
        if (product) {
            await cleanupProductImages(product);
        }
    }

    await productsRepo.deleteManyProducts({ _id: { $in: ids } });
};

const deleteProductsByCategoryId = async (categoryId) => {
    // Find all products in this category to clean up images
    const [products] = await productsRepo.findProducts({ category: categoryId }, 0, 100000); // Efficiently find all
    
    for (const product of products) {
        await cleanupProductImages(product);
    }

    await productsRepo.deleteManyProducts({ category: categoryId });
};

module.exports = {
    listProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
    bulkDeleteProducts,
    deleteProductsByCategoryId,
};
