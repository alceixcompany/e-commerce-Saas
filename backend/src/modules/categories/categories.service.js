const mongoose = require('mongoose');
const { GridFSBucket } = require('mongodb');
const categoriesRepo = require('./categories.repository');

const createHttpError = (message, statusCode) => {
    const error = new Error(message);
    error.statusCode = statusCode;
    return error;
};

const normalizeCategory = (category) => {
    return {
        ...category,
        bannerImage: category.bannerImage !== undefined && category.bannerImage !== null ? category.bannerImage : '',
        image: category.image !== undefined && category.image !== null ? category.image : '',
    };
};

const listCategories = async ({ page = 1, limit = 10 }) => {
    const skip = (page - 1) * limit;
    const [categories, total] = await categoriesRepo.findCategories(skip, parseInt(limit));
    const categoriesData = categories.map(normalizeCategory);

    return {
        categories: categoriesData,
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit)
    };
};

const getCategoryById = async (id) => {
    const category = await categoriesRepo.findCategoryByIdLean(id);
    if (!category) throw createHttpError('Category not found', 404);
    return normalizeCategory(category);
};

const createCategory = async (payload) => {
    const { name, slug, status, image, bannerImage } = payload;
    if (!name) {
        throw createHttpError('Please provide a category name', 400);
    }

    const computedSlug = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const existingCategory = await categoriesRepo.findCategoryByNameOrSlug(name, computedSlug);
    if (existingCategory) {
        throw createHttpError('Category with this name or slug already exists', 400);
    }

    const categoryDataToSave = {
        name,
        slug: computedSlug,
        status: status || 'active',
        image: image || '',
        bannerImage: bannerImage !== undefined && bannerImage !== null ? bannerImage : '',
    };

    const category = await categoriesRepo.createCategory(categoryDataToSave);
    const savedCategory = await categoriesRepo.findCategoryByIdLean(category._id);
    return normalizeCategory(savedCategory);
};

const updateCategory = async (id, payload) => {
    const category = await categoriesRepo.findCategoryById(id);
    if (!category) throw createHttpError('Category not found', 404);

    if (payload.name || payload.slug) {
        const existingCategory = await categoriesRepo.findCategoryByNameOrSlugExcludingId(
            payload.name || category.name,
            payload.slug || category.slug,
            id
        );
        if (existingCategory) {
            throw createHttpError('Category with this name or slug already exists', 400);
        }
    }

    const updateData = {
        ...payload,
        image: payload.image !== undefined ? (payload.image || '') : category.image,
        bannerImage: payload.bannerImage !== undefined ? (payload.bannerImage || '') : category.bannerImage,
    };

    await categoriesRepo.updateCategoryById(id, updateData);
    const updatedCategory = await categoriesRepo.findCategoryByIdLean(id);
    return normalizeCategory(updatedCategory);
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

const deleteCategory = async (id) => {
    const category = await categoriesRepo.findCategoryById(id);
    if (!category) throw createHttpError('Category not found', 404);

    const imageIdsToDelete = [];

    if (category.image) {
        const imageId = extractFileIdFromUrl(category.image);
        if (imageId) imageIdsToDelete.push(imageId);
    }

    if (category.bannerImage) {
        const bannerImageId = extractFileIdFromUrl(category.bannerImage);
        if (bannerImageId && !imageIdsToDelete.includes(bannerImageId)) {
            imageIdsToDelete.push(bannerImageId);
        }
    }

    await Promise.all(imageIdsToDelete.map(deleteImageFromGridFS));
    await categoriesRepo.deleteCategory(category);
};

module.exports = {
    listCategories,
    getCategoryById,
    createCategory,
    updateCategory,
    deleteCategory,
};
