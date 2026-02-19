const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const escapeRegex = require('../utils/escapeRegex');

// @route   GET /api/public/products/stats
// @desc    Get product stats (counts for new arrivals, etc)
// @access  Public
router.get('/stats', async (req, res) => {
  try {
    const newArrivalsCount = await Product.countDocuments({ status: 'active', isNewArrival: true });
    const bestSellersCount = await Product.countDocuments({ status: 'active', isBestSeller: true });

    res.status(200).json({
      success: true,
      data: {
        newArrivals: newArrivalsCount,
        bestSellers: bestSellersCount
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
});

// @route   GET /api/public/products/search
// @desc    Search products by name, description, or SKU
// @access  Public
router.get('/search', async (req, res) => {
  try {
    const { q } = req.query;

    if (!q || q.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Search query must be at least 2 characters',
      });
    }

    // Create search regex (case-insensitive)
    const searchRegex = new RegExp(escapeRegex(q.trim()), 'i');

    // Build query
    let query = { status: 'active' };

    // Add search conditions to the query
    query.$or = [
      { name: searchRegex },
      { shortDescription: searchRegex },
      { sku: searchRegex },
    ];

    // Search in name, shortDescription, and sku
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const [products, total] = await Promise.all([
      Product.find(query)
        .populate('category', 'name slug')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Product.countDocuments(query)
    ]);

    // Add backward compatibility
    const productsWithCompat = products.map(product => {
      const productObj = product.toObject();
      if (productObj.mainImage && !productObj.image) {
        productObj.image = productObj.mainImage;
      }
      return productObj;
    });

    res.status(200).json({
      success: true,
      count: productsWithCompat.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: productsWithCompat,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
});

// @route   GET /api/public/products
// @desc    Get all active products (public)
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { tag, category, sort, minPrice, maxPrice } = req.query;

    let query = { status: 'active' };

    // Tag filter
    if (tag === 'new-arrival') {
      query.isNewArrival = true;
    } else if (tag === 'best-seller') {
      query.isBestSeller = true;
    }

    // Category filter
    if (category && category !== 'all') {
      query.category = category;
    }

    // Price range filter
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    // Sorting
    let sortQuery = { createdAt: -1 }; // Default: Newest
    if (sort) {
      switch (sort) {
        case 'price-low':
          sortQuery = { price: 1 };
          break;
        case 'price-high':
          sortQuery = { price: -1 };
          break;
        case 'name':
          sortQuery = { name: 1 };
          break;
        case 'best-selling':
          sortQuery = { isBestSeller: -1, stock: 1 };
          break;
        case 'newest':
          sortQuery = { createdAt: -1 };
          break;
      }
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;

    const [products, total] = await Promise.all([
      Product.find(query)
        .populate('category', 'name slug')
        .sort(sortQuery)
        .skip(skip)
        .limit(limit),
      Product.countDocuments(query)
    ]);

    // Add backward compatibility: if mainImage exists but image doesn't, set image = mainImage
    const productsWithCompat = products.map(product => {
      const productObj = product.toObject();
      if (productObj.mainImage && !productObj.image) {
        productObj.image = productObj.mainImage;
      }
      return productObj;
    });

    res.status(200).json({
      success: true,
      count: productsWithCompat.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: productsWithCompat,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
});

// @route   GET /api/public/products/:id
// @desc    Get single product by ID (public)
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findOne({
      _id: req.params.id,
      status: 'active',
    }).populate('category', 'name slug');

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    // Add backward compatibility: if mainImage exists but image doesn't, set image = mainImage
    const productObj = product.toObject();
    if (productObj.mainImage && !productObj.image) {
      productObj.image = productObj.mainImage;
    }

    res.status(200).json({
      success: true,
      data: productObj,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
});

module.exports = router;

