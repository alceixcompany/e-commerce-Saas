const paymentService = require('./paymentSettings.service');
const { triggerRevalidation } = require('../../utils/revalidate');

const getPaymentSettings = async (req, res) => {
    try {
        const data = await paymentService.getPaymentSettings();
        res.status(200).json({
            success: true,
            data
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Server error',
        });
    }
};

const updatePaymentSettings = async (req, res) => {
    try {
        await paymentService.updatePaymentSettings(req.body);
        await triggerRevalidation(['content', 'content:section:payment_settings', 'admin:payment-settings']);
        res.status(200).json({
            success: true,
            message: 'Payment settings updated successfully'
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message || 'Invalid data',
        });
    }
};

module.exports = {
    getPaymentSettings,
    updatePaymentSettings,
};
