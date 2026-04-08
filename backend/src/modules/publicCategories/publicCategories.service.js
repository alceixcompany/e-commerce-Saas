const categoriesRepo = require('./publicCategories.repository');

const listCategories = async () => {
    const categories = await categoriesRepo.aggregateCategoriesWithCounts();
    const totalProducts = await categoriesRepo.countTotalProducts();
    return { data: categories, totalProducts };
};

const getCategoryById = async (id) => {
    const category = await categoriesRepo.findCategoryById(id);
    if (!category) {
        const error = new Error('Category not found');
        error.statusCode = 404;
        throw error;
    }

    const categoryData = category.toObject();
    if (categoryData.bannerImage === undefined || categoryData.bannerImage === null) {
        categoryData.bannerImage = '';
    }
    return categoryData;
};

module.exports = {
    listCategories,
    getCategoryById,
};
