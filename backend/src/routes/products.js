const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { GridFSBucket } = require('mongodb');
const { body, param } = require('express-validator');
const Product = require('../models/Product');
const { protect, authorize } = require('../middleware/auth');
const { validateRequest } = require('../middleware/validate');
const escapeRegex = require('../utils/escapeRegex');

// All product routes require authentication and admin role
router.use(protect);
router.use(authorize('admin'));

// @route   GET /api/products
// @desc    Get all products
// @access  Private/Admin
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, category, q } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    let query = {};

    // Category filter
    if (category && category !== 'all') {
      query.category = category;
    }

    // Search filter
    if (q) {
      const searchRegex = new RegExp(escapeRegex(q.trim()), 'i');
      query.$or = [
        { name: searchRegex },
        { sku: searchRegex },
        { shortDescription: searchRegex }
      ];
    }

    const [products, total] = await Promise.all([
      Product.find(query)
        .populate('category', 'name slug')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
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

// @route   GET /api/products/:id
// @desc    Get single product
// @access  Private/Admin
router.get(
  '/:id',
  [param('id', 'Invalid product id').isMongoId(), validateRequest],
  async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('category', 'name slug');

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

// @route   POST /api/products
// @desc    Create new product
// @access  Private/Admin
router.post(
  '/',
  [
    body('name', 'Name is required').notEmpty().trim(),
    body('category', 'Category is required').isMongoId(),
    body('price', 'Price must be a non-negative number').isFloat({ min: 0 }),
    body('stock', 'Stock must be a non-negative number').isFloat({ min: 0 }),
    body('sku', 'SKU is required').notEmpty().trim(),
    body('mainImage', 'Main image is required').optional().isString(),
    body('image', 'Image must be a string').optional().isString(),
    body().custom((value, { req }) => {
      if (!req.body.mainImage && !req.body.image) {
        throw new Error('Main image is required');
      }
      return true;
    }),
    body('images', 'Images must be an array').optional().isArray(),
    body('shippingWeight', 'Shipping weight must be a non-negative number').isFloat({ min: 0 }),
    body('discountedPrice', 'Discounted price must be a non-negative number').optional().isFloat({ min: 0 }),
    body('rating', 'Rating must be between 0 and 5').optional().isFloat({ min: 0, max: 5 }),
    body('status', 'Status must be active or inactive').optional().isIn(['active', 'inactive']),
    body('isNewArrival', 'isNewArrival must be boolean').optional().isBoolean(),
    body('isBestSeller', 'isBestSeller must be boolean').optional().isBoolean(),
    validateRequest,
  ],
  async (req, res) => {
  try {
    const {
      name,
      category,
      shortDescription,
      price,
      discountedPrice,
      stock,
      sku,
      mainImage,
      image, // For backward compatibility
      images,
      shippingWeight,
      status,
      rating,
      isNewArrival,
      isBestSeller,
    } = req.body;

    // Use mainImage if provided, otherwise fall back to image for backward compatibility
    const productMainImage = mainImage || image;

    // Validation - check for undefined, null, empty string, and 0 (but 0 is valid for price)
    const isInvalid = (value, allowZero = false) => {
      if (value === undefined || value === null || value === '') return true;
      if (!allowZero && value === 0) return true;
      return false;
    };

    const validationErrors = [];
    if (isInvalid(name)) validationErrors.push('name');
    if (isInvalid(category)) validationErrors.push('category');
    if (isInvalid(price, true)) validationErrors.push('price'); // Allow 0 for price
    if (isInvalid(stock, true)) validationErrors.push('stock'); // Allow 0 for stock
    if (isInvalid(sku)) validationErrors.push('sku');
    if (isInvalid(productMainImage)) validationErrors.push('mainImage');
    if (isInvalid(shippingWeight, true)) validationErrors.push('shippingWeight'); // Allow 0 for weight

    if (validationErrors.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Please provide all required fields. Missing: ${validationErrors.join(', ')}`,
        missingFields: validationErrors,
      });
    }

    // Check if SKU already exists
    const existingProduct = await Product.findOne({ sku });
    if (existingProduct) {
      return res.status(400).json({
        success: false,
        message: 'Product with this SKU already exists',
      });
    }

    const product = await Product.create({
      name,
      category,
      shortDescription: shortDescription || undefined,
      price,
      discountedPrice: discountedPrice || undefined,
      stock,
      sku: sku.toUpperCase(),
      mainImage: productMainImage,
      image: productMainImage, // For backward compatibility
      images: images || [],
      shippingWeight,
      status: status || 'active',
      rating: rating !== undefined ? parseFloat(rating) : undefined,
      isNewArrival: isNewArrival || false,
      isBestSeller: isBestSeller || false,
    });

    const populatedProduct = await Product.findById(product._id).populate('category', 'name slug');

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: populatedProduct,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
});

// @route   PUT /api/products/:id
// @desc    Update product
// @access  Private/Admin
router.put(
  '/:id',
  [
    param('id', 'Invalid product id').isMongoId(),
    body('category', 'Category must be a valid id').optional().isMongoId(),
    body('price', 'Price must be a non-negative number').optional().isFloat({ min: 0 }),
    body('stock', 'Stock must be a non-negative number').optional().isFloat({ min: 0 }),
    body('sku', 'SKU must be a string').optional().isString(),
    body('mainImage', 'Main image must be a string').optional().isString(),
    body('image', 'Image must be a string').optional().isString(),
    body('images', 'Images must be an array').optional().isArray(),
    body('shippingWeight', 'Shipping weight must be a non-negative number').optional().isFloat({ min: 0 }),
    body('discountedPrice', 'Discounted price must be a non-negative number').optional().isFloat({ min: 0 }),
    body('rating', 'Rating must be between 0 and 5').optional().isFloat({ min: 0, max: 5 }),
    body('status', 'Status must be active or inactive').optional().isIn(['active', 'inactive']),
    body('isNewArrival', 'isNewArrival must be boolean').optional().isBoolean(),
    body('isBestSeller', 'isBestSeller must be boolean').optional().isBoolean(),
    validateRequest,
  ],
  async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    // Check if SKU is being changed and if new SKU already exists
    if (req.body.sku && req.body.sku !== product.sku) {
      const existingProduct = await Product.findOne({ sku: req.body.sku.toUpperCase() });
      if (existingProduct) {
        return res.status(400).json({
          success: false,
          message: 'Product with this SKU already exists',
        });
      }
      req.body.sku = req.body.sku.toUpperCase();
    }

    // Prepare update data
    const updateData = { ...req.body };

    // If mainImage is provided, also update image for backward compatibility
    if (updateData.mainImage && !updateData.image) {
      updateData.image = updateData.mainImage;
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('category', 'name slug');

    // Add backward compatibility to response
    const productObj = updatedProduct.toObject();
    if (productObj.mainImage && !productObj.image) {
      productObj.image = productObj.mainImage;
    }

    res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      data: productObj,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
});

// Helper function to extract file ID from URL
const extractFileIdFromUrl = (url) => {
  if (!url) return null;
  // URL format: /api/upload/image/:id
  const match = url.match(/\/api\/upload\/image\/([a-fA-F0-9]{24})/);
  return match ? match[1] : null;
};

// Helper function to delete image from GridFS
const deleteImageFromGridFS = async (fileId) => {
  try {
    if (!fileId) return;

    const bucket = new GridFSBucket(mongoose.connection.db, {
      bucketName: 'uploads',
    });

    const objectId = new mongoose.Types.ObjectId(fileId);
    await bucket.delete(objectId);
  } catch (error) {
    // Log error but don't fail the product deletion if image deletion fails
    console.error(`Failed to delete image ${fileId}:`, error.message);
  }
};

// @route   DELETE /api/products/:id
// @desc    Delete product and its associated images
// @access  Private/Admin
router.delete(
  '/:id',
  [param('id', 'Invalid product id').isMongoId(), validateRequest],
  async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    // Extract image IDs from product
    const imageIdsToDelete = [];

    // Extract mainImage ID
    if (product.mainImage) {
      const mainImageId = extractFileIdFromUrl(product.mainImage);
      if (mainImageId) {
        imageIdsToDelete.push(mainImageId);
      }
    }

    // Extract image ID (for backward compatibility)
    if (product.image) {
      const imageId = extractFileIdFromUrl(product.image);
      if (imageId && !imageIdsToDelete.includes(imageId)) {
        imageIdsToDelete.push(imageId);
      }
    }

    // Extract images array IDs
    if (product.images && Array.isArray(product.images)) {
      product.images.forEach((imageUrl) => {
        const imageId = extractFileIdFromUrl(imageUrl);
        if (imageId && !imageIdsToDelete.includes(imageId)) {
          imageIdsToDelete.push(imageId);
        }
      });
    }

    // Delete all associated images from GridFS
    await Promise.all(imageIdsToDelete.map(deleteImageFromGridFS));

    // Delete the product
    await product.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Product and associated images deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
});

module.exports = router;
