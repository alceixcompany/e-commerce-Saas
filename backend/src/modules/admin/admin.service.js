const escapeRegex = require('../../utils/escapeRegex');
const adminRepo = require('./admin.repository');

const createHttpError = (message, statusCode) => {
    const error = new Error(message);
    error.statusCode = statusCode;
    return error;
};

const getDashboardStats = async () => {
    const totalUsers = await adminRepo.countUsers();
    const totalOrders = await adminRepo.countOrders();

    const salesData = await adminRepo.aggregateSales();
    const paidOrders = await adminRepo.countOrders({ isPaid: true });
    const unpaidOrders = await adminRepo.countOrders({ isPaid: false });

    return {
        totalUsers,
        totalOrders,
        totalSales: salesData.length > 0 ? salesData[0].totalSales : 0,
        paidOrders,
        unpaidOrders,
    };
};

const listUsers = async ({ page = 1, limit = 10, q, sort }) => {
    const skip = (page - 1) * limit;
    let matchQuery = {};
    if (q) {
        const searchRegex = new RegExp(escapeRegex(q.trim()), 'i');
        matchQuery.$or = [
            { name: searchRegex },
            { email: searchRegex }
        ];
    }

    let sortQuery = { totalSpent: -1 };
    if (sort === 'newest') {
        sortQuery = { createdAt: -1 };
    }

    const pipeline = [
        { $match: matchQuery },
        {
            $lookup: {
                from: 'orders',
                localField: '_id',
                foreignField: 'user',
                as: 'orders'
            }
        },
        {
            $project: {
                name: 1,
                email: 1,
                role: 1,
                createdAt: 1,
                totalSpent: {
                    $sum: {
                        $map: {
                            input: { $filter: { input: '$orders', as: 'o', cond: '$$o.isPaid' } },
                            as: 'paidOrder',
                            in: '$$paidOrder.totalPrice'
                        }
                    }
                },
                orderCount: { $size: '$orders' }
            }
        },
        { $sort: sortQuery }
    ];

    const [totalUsers, usersWithStats] = await Promise.all([
        adminRepo.countUsers(matchQuery),
        adminRepo.aggregateUsersWithStats(pipeline, skip, parseInt(limit))
    ]);

    return {
        users: usersWithStats,
        total: totalUsers,
        page,
        pages: Math.ceil(totalUsers / limit)
    };
};

const getUserDetails = async (id) => {
    const user = await adminRepo.findUserById(id);
    if (!user) throw createHttpError('User not found', 404);
    const orders = await adminRepo.listUserOrders(id);
    return { user, orders };
};

const updateUserRole = async (id, role) => {
    if (!role || !['user', 'admin'].includes(role)) {
        throw createHttpError('Please provide a valid role (user or admin)', 400);
    }

    const user = await adminRepo.updateUserRole(id, role);
    if (!user) throw createHttpError('User not found', 404);
    return user;
};

const deleteUser = async (id, currentUserId) => {
    const user = await adminRepo.findUserById(id);
    if (!user) throw createHttpError('User not found', 404);

    if (user._id.toString() === currentUserId.toString()) {
        throw createHttpError('You cannot delete your own account', 400);
    }

    await adminRepo.deleteUser(user);
};

module.exports = {
    getDashboardStats,
    listUsers,
    getUserDetails,
    updateUserRole,
    deleteUser,
};
