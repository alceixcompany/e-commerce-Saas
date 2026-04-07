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

const listUserOrders = async (userId) => {
    return Order.find({ user: userId }).sort({ createdAt: -1 });
};

const updateUserRole = async (id, role) => {
    return User.findByIdAndUpdate(id, { role }, { new: true, runValidators: true }).select('-password');
};

const deleteUser = async (user) => {
    return user.deleteOne();
};

module.exports = {
    countUsers,
    countOrders,
    aggregateSales,
    aggregateUsersWithStats,
    findUserById,
    listUserOrders,
    updateUserRole,
    deleteUser,
};
