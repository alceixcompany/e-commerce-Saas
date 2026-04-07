const Category = require('../../models/Category');

const aggregateCategoriesWithCounts = async () => {
    return Category.aggregate([
        { $match: { status: 'active' } },
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
                productCount: {
                    $size: {
                        $filter: {
                            input: '$products',
                            as: 'p',
                            cond: { $eq: ['$$p.status', 'active'] }
                        }
                    }
                }
            }
        },
        { $sort: { name: 1 } }
    ]);
};

const findCategoryById = async (id) => {
    return Category.findOne({ _id: id, status: 'active' });
};

module.exports = {
    aggregateCategoriesWithCounts,
    findCategoryById,
};
