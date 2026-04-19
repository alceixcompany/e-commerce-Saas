const couponsService = require('./coupons.service');
const { triggerRevalidation } = require('../../utils/revalidate');

const createCoupon = async (req, res) => {
    try {
        const coupon = await couponsService.createCoupon(req.body);
        await triggerRevalidation(['admin:coupons']);
        res.status(201).json({
            success: true,
            data: coupon
        });
    } catch (error) {
        res.status(error.statusCode || 500).json({
            success: false,
            message: error.statusCode ? error.message : error.message
        });
    }
};

const listCoupons = async (req, res) => {
    try {
        const result = await couponsService.listCoupons(req.query);
        res.status(200).json({
            success: true,
            count: result.coupons.length,
            total: result.total,
            page: result.page,
            pages: result.pages,
            data: result.coupons
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const deleteCoupon = async (req, res) => {
    try {
        await couponsService.deleteCoupon(req.params.id);
        await triggerRevalidation(['admin:coupons']);
        res.status(200).json({
            success: true,
            message: 'Coupon removed'
        });
    } catch (error) {
        res.status(error.statusCode || 500).json({
            success: false,
            message: error.statusCode ? error.message : error.message
        });
    }
};

const validateCoupon = async (req, res) => {
    try {
        const data = await couponsService.validateCoupon(req.body);
        res.status(200).json({
            success: true,
            data
        });
    } catch (error) {
        res.status(error.statusCode || 500).json({
            success: false,
            message: error.statusCode ? error.message : error.message
        });
    }
};

const bulkDeleteCoupons = async (req, res) => {
    try {
        const { ids } = req.body;
        await couponsService.bulkDeleteCoupons(ids);
        await triggerRevalidation(['admin:coupons']);
        res.status(200).json({
            success: true,
            message: `Successfully deleted ${ids.length} coupons`,
        });
    } catch (error) {
        res.status(error.statusCode || 500).json({
            success: false,
            message: error.statusCode ? error.message : error.message
        });
    }
};

module.exports = {
    createCoupon,
    listCoupons,
    deleteCoupon,
    validateCoupon,
    bulkDeleteCoupons,
};
