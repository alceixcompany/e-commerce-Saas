const Category = require('../../models/Category');

const findCategories = async (skip, limit) => {
    return Promise.all([
        Category.find().sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
        Category.countDocuments()
    ]);
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
