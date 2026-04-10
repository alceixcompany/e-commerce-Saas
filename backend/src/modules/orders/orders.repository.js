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

const createOrder = async (order, session) => {
    const [createdOrder] = await Order.create([order], { session });
    return createdOrder;
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
    return Promise.all([
        Order.aggregate(pipeline),
        Order.aggregate([...countPipeline, { $count: 'total' }])
    ]);
};

const findGlobalSettings = async () => {
    return SectionContent.findOne({ identifier: 'global_settings' });
};

module.exports = {
    startSession,
    findProductsByIds,
    findCouponByCode,
    incrementCouponUsage,
    createOrder,
    findOrderById,
    findOrderByIdWithUser,
    saveOrder,
    deleteOrder,
    findMyOrders,
    listOrdersAggregate,
    findGlobalSettings,
};
