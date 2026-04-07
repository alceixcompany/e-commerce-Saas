const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const adminController = require('../modules/admin/admin.controller');
const adminValidators = require('../modules/admin/admin.validators');

// All admin routes require authentication and admin role
router.use(protect);
router.use(authorize('admin'));

// @route   GET /api/admin/dashboard
// @desc    Get admin dashboard stats
// @access  Private/Admin
router.get('/dashboard', adminController.getDashboard);

// @route   GET /api/admin/users
// @desc    Get all users with total spent
// @access  Private/Admin
router.get('/users', adminValidators.listUsersValidators, adminController.listUsers);

// @route   GET /api/admin/users/:id
// @desc    Get single user details with order history
// @access  Private/Admin
router.get('/users/:id', adminValidators.userIdParamValidators, adminController.getUserDetails);

// @route   PUT /api/admin/users/:id/role
// @desc    Update user role
// @access  Private/Admin
router.put('/users/:id/role', adminValidators.updateRoleValidators, adminController.updateUserRole);

// @route   DELETE /api/admin/users/:id
// @desc    Delete user
// @access  Private/Admin
router.delete('/users/:id', adminValidators.userIdParamValidators, adminController.deleteUser);

module.exports = router;
