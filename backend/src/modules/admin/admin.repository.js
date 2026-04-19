const User = require('../../models/User');
const Order = require('../../models/Order');

const countUsers = async (query = {}) => {
    return User.countDocuments(query);
};

const countOrders = async (query = {}) => {
    return Order.countDocuments(query);
};

const aggregateSales = async () => {
    return Order.aggregate([
        { $match: { isPaid: true } },
        { $group: { _id: null, totalSales: { $sum: '$totalPrice' } } }
    ]);
};

const aggregateUsersWithStats = async (pipeline, skip, limit) => {
    return User.aggregate([
        ...pipeline,
        { $skip: skip },
        { $limit: limit }
    ]);
};

const findUserById = async (id) => {
    return User.findById(id).select('-password');
};

const listUserOrders = async (userId, skip = 0, limit = 10) => {
    return Order.find({ user: userId, isPaid: true })
        .sort({ createdAt: -1 })
        .skip(parseInt(skip))
        .limit(parseInt(limit));
};

const countUserOrders = async (userId) => {
    return Order.countDocuments({ user: userId, isPaid: true });
};

const updateUserRole = async (id, role) => {
    return User.findByIdAndUpdate(id, { role }, { new: true, runValidators: true }).select('-password');
};

const deleteUser = async (user) => {
    return user.deleteOne();
};

const deleteManyUsers = async (ids) => {
    return User.deleteMany({ _id: { $in: ids } });
};

module.exports = {
    countUsers,
    countOrders,
    aggregateSales,
    aggregateUsersWithStats,
    findUserById,
    listUserOrders,
    countUserOrders,
    updateUserRole,
    deleteUser,
    deleteManyUsers,
};
