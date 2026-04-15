const Order = require('../../models/Order');
const Coupon = require('../../models/Coupon');
const SectionContent = require('../../models/SectionContent');
const Product = require('../../models/Product');

const startSession = async () => {
    return Order.startSession();
};

const findProductsByIds = async (ids, session) => {
    return Product.find({ _id: { $in: ids } }).session(session);
};

const findCouponByCode = async (code, session) => {
    return Coupon.findOne({ code }).session(session);
};

const incrementCouponUsage = async (couponId, userId, session) => {
    return Coupon.findByIdAndUpdate(
        couponId,
        { $inc: { usedCount: 1 }, $push: { usedBy: userId } },
        { session }
    );
};

const applyCouponUsageIfValid = async (code, userId, session) => {
    return Coupon.findOneAndUpdate(
        {
            code,
            isActive: true,
            expirationDate: { $gt: new Date() },
            usedBy: { $ne: userId },
            $or: [
                { usageLimit: null },
                { usageLimit: { $exists: false } },
                { $expr: { $lt: ['$usedCount', '$usageLimit'] } }
            ]
        },
        { $inc: { usedCount: 1 }, $push: { usedBy: userId } },
        { new: true, session }
    );
};

const createOrder = async (order, session) => {
    const [createdOrder] = await Order.create([order], { session });
    return createdOrder;
};

const findLatestReusableUnpaidOrder = async (userId, paymentMethod, session) => {
    const reusableStatuses = ['pending', 'failed'];

    return Order.findOne({
        user: userId,
        paymentMethod,
        isPaid: false,
        isDelivered: false,
        paymentStatus: { $in: reusableStatuses },
    })
        .sort({ createdAt: -1 })
        .session(session);
};

const findOrderByIdempotencyKey = async (userId, paymentMethod, idempotencyKey, session) => {
    return Order.findOne({
        user: userId,
        paymentMethod,
        idempotencyKey,
    }).session(session);
};

const findOrderById = async (orderId) => {
    return Order.findById(orderId);
};

const findOrderByIdWithUser = async (orderId) => {
    return Order.findById(orderId).populate('user', 'name email phone identityNumber');
};

const saveOrder = async (order) => {
    return order.save();
};

const deleteOrder = async (order) => {
    return order.deleteOne();
};

const findMyOrders = async (userId, skip, limit) => {
    return Promise.all([
        Order.find({ user: userId }).sort({ createdAt: -1 }).skip(skip).limit(limit),
        Order.countDocuments({ user: userId })
    ]);
};

const listOrdersAggregate = async (pipeline, countPipeline) => {
    // Stats calculation pipeline - independent of list filtering.
    // Cards should reflect completed business activity plus failed attempts,
    // not unpaid draft orders left behind during checkout retries.
    const statsPipeline = [
        {
            $match: {
                $or: [
                    { isPaid: true },
                    { paymentStatus: 'failed' }
                ]
            }
        },
        {
            $group: {
                _id: { 
                    status: '$status', 
                    isPaid: '$isPaid', 
                    paymentStatus: '$paymentStatus' 
                },
                count: { $sum: 1 },
                amount: { $sum: '$totalPrice' }
            }
        },
        {
            $project: {
                _id: 0,
                status: '$_id.status',
                isPaid: '$_id.isPaid',
                paymentStatus: '$_id.paymentStatus',
                count: 1,
                amount: 1
            }
        }
    ];

    return Promise.all([
        Order.aggregate(pipeline),
        Order.aggregate([...countPipeline, { $count: 'total' }]),
        Order.aggregate(statsPipeline)
    ]);
};

const updateManyOrders = async (ids, updateData) => {
    return Order.updateMany(
        { _id: { $in: ids } },
        { $set: updateData }
    );
};

const findGlobalSettings = async () => {
    return SectionContent.findOne({ identifier: 'global_settings' });
};

const deleteManyOrders = async (ids) => {
    return Order.deleteMany({ _id: { $in: ids } });
};

const bulkDeleteOrders = async (orderIds) => {
    if (!orderIds || !Array.isArray(orderIds) || orderIds.length === 0) return;
    return deleteManyOrders(orderIds);
};

module.exports = {
    startSession,
    findProductsByIds,
    findCouponByCode,
    incrementCouponUsage,
    applyCouponUsageIfValid,
    createOrder,
    findLatestReusableUnpaidOrder,
    findOrderByIdempotencyKey,
    findOrderById,
    findOrderByIdWithUser,
    saveOrder,
    deleteOrder,
    findMyOrders,
    listOrdersAggregate,
    findGlobalSettings,
    updateManyOrders,
    deleteManyOrders,
    bulkDeleteOrders,
};
