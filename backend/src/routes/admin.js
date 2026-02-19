const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Order = require('../models/Order');
const { protect, authorize } = require('../middleware/auth');
const escapeRegex = require('../utils/escapeRegex');

// All admin routes require authentication and admin role
router.use(protect);
router.use(authorize('admin'));

// @route   GET /api/admin/dashboard
// @desc    Get admin dashboard stats
// @access  Private/Admin
router.get('/dashboard', async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalOrders = await Order.countDocuments();

    // Calculate total sales from paid orders
    const salesData = await Order.aggregate([
      { $match: { isPaid: true } },
      { $group: { _id: null, totalSales: { $sum: '$totalPrice' } } }
    ]);

    const paidOrders = await Order.countDocuments({ isPaid: true });
    const unpaidOrders = await Order.countDocuments({ isPaid: false });

    res.status(200).json({
      success: true,
      data: {
        stats: {
          totalUsers,
          totalOrders,
          totalSales: salesData.length > 0 ? salesData[0].totalSales : 0,
          paidOrders,
          unpaidOrders,
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
});

// @route   GET /api/admin/users
// @desc    Get all users with total spent
// @access  Private/Admin
router.get('/users', async (req, res) => {
  try {
    const { page = 1, limit = 10, q, sort } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    let matchQuery = {};
    if (q) {
      const searchRegex = new RegExp(escapeRegex(q.trim()), 'i');
      matchQuery.$or = [
        { name: searchRegex },
        { email: searchRegex }
      ];
    }

    let sortQuery = { totalSpent: -1 }; // Default: Top Spenders
    if (sort === 'newest') {
      sortQuery = { createdAt: -1 };
    }

    const pipeline = [
      { $match: matchQuery },
      {
        $lookup: {
          from: 'orders',
          localField: '_id',
          foreignField: 'user',
          as: 'orders'
        }
      },
      {
        $project: {
          name: 1,
          email: 1,
          role: 1,
          createdAt: 1,
          totalSpent: {
            $sum: {
              $map: {
                input: { $filter: { input: '$orders', as: 'o', cond: '$$o.isPaid' } },
                as: 'paidOrder',
                in: '$$paidOrder.totalPrice'
              }
            }
          },
          orderCount: { $size: '$orders' }
        }
      },
      { $sort: sortQuery }
    ];

    const [totalUsers, usersWithStats] = await Promise.all([
      User.countDocuments(matchQuery),
      User.aggregate([
        ...pipeline,
        { $skip: skip },
        { $limit: parseInt(limit) }
      ])
    ]);

    res.status(200).json({
      success: true,
      count: usersWithStats.length,
      total: totalUsers,
      page,
      pages: Math.ceil(totalUsers / limit),
      data: usersWithStats,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
});

// @route   GET /api/admin/users/:id
// @desc    Get single user details with order history
// @access  Private/Admin
router.get('/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    const orders = await Order.find({ user: req.params.id }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: {
        user,
        orders
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
});

// @route   PUT /api/admin/users/:id/role
// @desc    Update user role
// @access  Private/Admin
router.put('/users/:id/role', async (req, res) => {
  try {
    const { role } = req.body;

    if (!role || !['user', 'admin'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid role (user or admin)',
      });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'User role updated successfully',
      data: user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
});

// @route   DELETE /api/admin/users/:id
// @desc    Delete user
// @access  Private/Admin
router.delete('/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Prevent deleting yourself
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot delete your own account',
      });
    }

    await user.deleteOne();

    res.status(200).json({
      success: true,
      message: 'User deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
});

module.exports = router;

