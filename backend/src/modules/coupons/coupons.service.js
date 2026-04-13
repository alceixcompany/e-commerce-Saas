const couponsRepo = require('./coupons.repository');
const { sanitize } = require('../../utils/sanitizer');

const createHttpError = (message, statusCode) => {
    const error = new Error(message);
    error.statusCode = statusCode;
    return error;
};

const createCoupon = async ({ code, discountType, amount, expirationDate, usageLimit }) => {
    const couponExists = await couponsRepo.findCouponByCode(code.toUpperCase());
    if (couponExists) throw createHttpError('Coupon code already exists', 400);

    return couponsRepo.createCoupon({
        code: sanitize(code).toUpperCase(),
        discountType,
        amount,
        expirationDate,
        usageLimit
    });
};

const listCoupons = async ({ page = 1, limit = 10 }) => {
    const skip = (page - 1) * limit;
    const [coupons, total] = await couponsRepo.findCoupons(skip, parseInt(limit));
    return {
        coupons,
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit)
    };
};

const deleteCoupon = async (id) => {
    const coupon = await couponsRepo.findCouponById(id);
    if (!coupon) throw createHttpError('Coupon not found', 404);
    await couponsRepo.deleteCoupon(coupon);
    return true;
};

const validateCoupon = async ({ code, cartTotal, userId }) => {
    const cleanedCode = code.trim().toUpperCase();
    const coupon = await couponsRepo.findCouponByCode(cleanedCode);

    if (!coupon) throw createHttpError('No such coupon found', 400);
    if (!coupon.isActive) throw createHttpError('Coupon is no longer active', 400);
    if (new Date() > new Date(coupon.expirationDate)) throw createHttpError('Coupon has expired', 400);
    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) throw createHttpError('Coupon usage limit reached', 400);
    if (userId && coupon.usedBy.some((id) => id.toString() === userId.toString())) {
        throw createHttpError('You have already used this coupon', 400);
    }

    const safeCartTotal = Number(cartTotal);
    let discountAmount = 0;
    if (coupon.discountType === 'percentage') {
        discountAmount = (safeCartTotal * coupon.amount) / 100;
    } else {
        discountAmount = coupon.amount;
    }

    if (discountAmount > safeCartTotal) {
        discountAmount = safeCartTotal;
    }

    return {
        code: coupon.code,
        discountType: coupon.discountType,
        amount: coupon.amount,
        discountAmount,
        _id: coupon._id
    };
};

const bulkDeleteCoupons = async (ids) => {
    if (!ids || !Array.isArray(ids) || ids.length === 0) return;
    return couponsRepo.deleteManyCoupons(ids);
};

module.exports = {
    createCoupon,
    listCoupons,
    deleteCoupon,
    validateCoupon,
    bulkDeleteCoupons,
};
