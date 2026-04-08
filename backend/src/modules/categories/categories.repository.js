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

module.exports = {
    findCategories,
    findCategoryById,
    findCategoryByIdLean,
    findCategoryByNameOrSlug,
    findCategoryByNameOrSlugExcludingId,
    createCategory,
    updateCategoryById,
    deleteCategory,
};
