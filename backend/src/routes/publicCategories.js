const express = require('express');
const router = express.Router();
const Category = require('../models/Category');

// @route   GET /api/public/categories
// @desc    Get all active categories with product counts
// @access  Public
router.get('/', async (req, res) => {
  try {
    const Category = require('../models/Category');
    const Product = require('../models/Product');

    const categories = await Category.aggregate([
      { $match: { status: 'active' } },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: 'category',
          as: 'products'
        }
      },
      {
        $project: {
          name: 1,
          slug: 1,
          image: 1,
          bannerImage: 1,
          status: 1,
          productCount: {
            $size: {
              $filter: {
                input: '$products',
                as: 'p',
                cond: { $eq: ['$$p.status', 'active'] }
              }
            }
          }
        }
      },
      { $sort: { name: 1 } }
    ]);

    res.status(200).json({
      success: true,
      count: categories.length,
      data: categories,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
});

// @route   GET /api/public/categories/:id
// @desc    Get single active category (public access)
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const category = await Category.findOne({
      _id: req.params.id,
      status: 'active'
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found',
      });
    }

    // Ensure bannerImage is always included in response
    const categoryData = category.toObject();
    if (categoryData.bannerImage === undefined || categoryData.bannerImage === null) {
      categoryData.bannerImage = '';
    }

    res.status(200).json({
      success: true,
      data: categoryData,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
});

module.exports = router;

