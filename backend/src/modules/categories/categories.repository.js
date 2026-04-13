const Category = require('../../models/Category');

const findCategories = async (skip, limit) => {
    const categories = await Category.aggregate([
        { $sort: { createdAt: -1 } },
        { $skip: skip },
        { $limit: limit },
        {
            $lookup: {
                from: 'products',
                localField: '_id',
                foreignField: 'category',
                as: 'products'
            }
        },
        {
            $project: {
                name: 1,
                slug: 1,
                image: 1,
                bannerImage: 1,
                status: 1,
                createdAt: 1,
                updatedAt: 1,
                productCount: { $size: '$products' }
            }
        }
    ]);

    const total = await Category.countDocuments();
    const Product = require('../../models/Product');
    const totalProducts = await Product.countDocuments();
    return [categories, total, totalProducts];
};

const findCategoryById = async (id) => {
    return Category.findById(id);
};

const findCategoryByIdLean = async (id) => {
    return Category.findById(id).lean();
};

const findCategoryByNameOrSlug = async (name, slug) => {
    return Category.findOne({
        $or: [{ name }, { slug }]
    });
};

const findCategoryByNameOrSlugExcludingId = async (name, slug, id) => {
    return Category.findOne({
        $or: [{ name }, { slug }],
        _id: { $ne: id }
    });
};

const createCategory = async (payload) => {
    return Category.create(payload);
};

const updateCategoryById = async (id, payload) => {
    return Category.findByIdAndUpdate(id, payload, { new: true, runValidators: true });
};

const deleteCategory = async (category) => {
    return category.deleteOne();
};

const deleteManyCategories = async (ids) => {
    return Category.deleteMany({ _id: { $in: ids } });
};

const bulkDeleteCategories = async (ids) => {
    if (!ids || !Array.isArray(ids) || ids.length === 0) return;

    for (const id of ids) {
        const category = await findCategoryByIdLean(id);
        if (!category) continue;

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
    }

    await deleteManyCategories(ids);
};

module.exports = {
    findCategories,
    findCategoryById,
    findCategoryByIdLean,
    findCategoryByNameOrSlug,
    findCategoryByNameOrSlugExcludingId,
    createCategory,
    updateCategoryById,
    deleteCategory,
    deleteManyCategories,
    bulkDeleteCategories,
};
