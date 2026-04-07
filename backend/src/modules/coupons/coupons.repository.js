const Coupon = require('../../models/Coupon');

const findCouponByCode = async (code) => {
    return Coupon.findOne({ code });
};

const findCoupons = async (skip, limit) => {
    return Promise.all([
        Coupon.find({}).sort({ createdAt: -1 }).skip(skip).limit(limit),
        Coupon.countDocuments({})
    ]);
};

const findCouponById = async (id) => {
    return Coupon.findById(id);
};

const createCoupon = async (payload) => {
    return Coupon.create(payload);
};

const deleteCoupon = async (coupon) => {
    return coupon.deleteOne();
};

module.exports = {
    findCouponByCode,
    findCoupons,
    findCouponById,
    createCoupon,
    deleteCoupon,
};
