const adminService = require('./admin.service');
const { triggerRevalidation } = require('../../utils/revalidate');

const getDashboard = async (req, res) => {
    try {
        const stats = await adminService.getDashboardStats();
        res.status(200).json({
            success: true,
            data: { stats },
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Server error',
        });
    }
};

const listUsers = async (req, res) => {
    try {
        const result = await adminService.listUsers(req.query);
        res.status(200).json({
            success: true,
            count: result.users.length,
            total: result.total,
            page: result.page,
            pages: result.pages,
            data: result.users,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Server error',
        });
    }
};

const getUserDetails = async (req, res) => {
    try {
        const data = await adminService.getUserDetails(req.params.id, req.query);
        res.status(200).json({
            success: true,
            data
        });
    } catch (error) {
        res.status(error.statusCode || 500).json({
            success: false,
            message: error.statusCode ? error.message : (error.message || 'Server error'),
        });
    }
};

const updateUserRole = async (req, res) => {
    try {
        const user = await adminService.updateUserRole(req.params.id, req.body.role);
        await triggerRevalidation(['admin:users', `admin:user:${req.params.id}`]);
        res.status(200).json({
            success: true,
            message: 'User role updated successfully',
            data: user,
        });
    } catch (error) {
        res.status(error.statusCode || 500).json({
            success: false,
            message: error.statusCode ? error.message : (error.message || 'Server error'),
        });
    }
};

const deleteUser = async (req, res) => {
    try {
        await adminService.deleteUser(req.params.id, req.user._id);
        await triggerRevalidation(['admin:users', 'admin:dashboard', `admin:user:${req.params.id}`]);
        res.status(200).json({
            success: true,
            message: 'User deleted successfully',
        });
    } catch (error) {
        res.status(error.statusCode || 500).json({
            success: false,
            message: error.statusCode ? error.message : (error.message || 'Server error'),
        });
    }
};

const bulkDeleteUsers = async (req, res) => {
    try {
        const { ids } = req.body;
        await adminService.bulkDeleteUsers(ids, req.user._id);
        await triggerRevalidation(['admin:users', 'admin:dashboard', ...ids.map((id) => `admin:user:${id}`)]);
        res.status(200).json({
            success: true,
            message: `Successfully deleted ${ids.length} users`,
        });
    } catch (error) {
        res.status(error.statusCode || 500).json({
            success: false,
            message: error.statusCode ? error.message : (error.message || 'Server error'),
        });
    }
};

module.exports = {
    getDashboard,
    listUsers,
    getUserDetails,
    updateUserRole,
    deleteUser,
    bulkDeleteUsers,
};
