const escapeRegex = require('../../utils/escapeRegex');
const adminRepo = require('./admin.repository');

const createHttpError = (message, statusCode) => {
    const error = new Error(message);
    error.statusCode = statusCode;
    return error;
};

const getDashboardStats = async () => {
    const totalUsers = await adminRepo.countUsers();
    const paidOrders = await adminRepo.countOrders({ isPaid: true });
    const unpaidOrders = await adminRepo.countOrders({ isPaid: false, paymentStatus: 'pending' });
    const totalOrders = paidOrders;
    const salesData = await adminRepo.aggregateSales();

    return {
        totalUsers,
        totalOrders,
        totalSales: salesData.length > 0 ? salesData[0].totalSales : 0,
        paidOrders,
        unpaidOrders,
    };
};

const listUsers = async ({ page = 1, limit = 10, q, sort, role }) => {
    const skip = (page - 1) * limit;
    let matchQuery = {};
    if (q) {
        const searchRegex = new RegExp(escapeRegex(q.trim()), 'i');
        matchQuery.$or = [
            { name: searchRegex },
            { email: searchRegex }
        ];
    }

    if (role && ['user', 'admin'].includes(role)) {
        matchQuery.role = role;
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
                orderCount: {
                    $size: {
                        $filter: { input: '$orders', as: 'o', cond: '$$o.isPaid' }
                    }
                }
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

const getUserDetails = async (id, { page = 1, limit = 10 } = {}) => {
    const user = await adminRepo.findUserById(id);
    if (!user) throw createHttpError('User not found', 404);
    
    const skip = (page - 1) * limit;
    const [orders, total] = await Promise.all([
        adminRepo.listUserOrders(id, skip, limit),
        adminRepo.countUserOrders(id)
    ]);

    return { 
        user, 
        orders,
        metadata: {
            total,
            page: parseInt(page),
            pages: Math.ceil(total / limit)
        }
    };
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
    if (id.toString() === currentUserId.toString()) {
        throw createHttpError('Cannot delete your own account', 400);
    }
    const user = await adminRepo.findUserById(id);
    if (!user) throw createHttpError('User not found', 404);

    await adminRepo.deleteUser(id);
};

const bulkDeleteUsers = async (ids, currentUserId) => {
    if (!ids || !Array.isArray(ids) || ids.length === 0) return;

    // Filter out current user from deletion list for safety
    const safeIds = ids.filter(id => id.toString() !== currentUserId.toString());
    
    if (safeIds.length === 0) {
        throw createHttpError('Cannot delete your own account in bulk', 400);
    }

    await adminRepo.deleteManyUsers(safeIds);
    return safeIds.length;
};

module.exports = {
    getDashboardStats,
    listUsers,
    getUserDetails,
    updateUserRole,
    deleteUser,
    bulkDeleteUsers,
};
