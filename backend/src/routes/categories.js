const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { GridFSBucket } = require('mongodb');
const Category = require('../models/Category');
const { protect, authorize } = require('../middleware/auth');

// All category routes require authentication and admin role
router.use(protect);
router.use(authorize('admin'));

// @route   GET /api/categories
// @desc    Get all categories
// @access  Private/Admin
router.get('/', async (req, res) => {
  try {
    // Use lean() to get plain JavaScript objects
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const [categories, total] = await Promise.all([
      Category.find().sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Category.countDocuments()
    ]);

    // Ensure bannerImage is always included in response
    const categoriesData = categories.map(cat => {
      // Explicitly include bannerImage even if empty or undefined
      return {
        ...cat,
        bannerImage: cat.bannerImage !== undefined && cat.bannerImage !== null ? cat.bannerImage : '',
        image: cat.image !== undefined && cat.image !== null ? cat.image : '',
      };
    });

    console.log('GET /api/categories - Returning categories:', categoriesData.map(c => ({
      name: c.name,
      image: c.image,
      bannerImage: c.bannerImage
    })));

    res.status(200).json({
      success: true,
      count: categoriesData.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: categoriesData,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
});

// @route   GET /api/categories/:id
// @desc    Get single category
// @access  Private/Admin
router.get('/:id', async (req, res) => {
  try {
    // Use lean() to get plain JavaScript object
    const category = await Category.findById(req.params.id).lean();

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found',
      });
    }

    // Ensure bannerImage is always included in response
    const categoryData = {
      ...category,
      bannerImage: category.bannerImage !== undefined && category.bannerImage !== null ? category.bannerImage : '',
      image: category.image !== undefined && category.image !== null ? category.image : '',
    };

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

// @route   POST /api/categories
// @desc    Create new category
// @access  Private/Admin
router.post('/', async (req, res) => {
  try {
    console.log('Category creation request body:', JSON.stringify(req.body, null, 2));
    const { name, slug, status, image, bannerImage } = req.body;
    console.log('Extracted values:', { name, slug, status, image, bannerImage });

    // Validation
    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a category name',
      });
    }

    // Check if category already exists
    const existingCategory = await Category.findOne({
      $or: [{ name }, { slug: slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-') }],
    });

    if (existingCategory) {
      return res.status(400).json({
        success: false,
        message: 'Category with this name or slug already exists',
      });
    }

    // Prepare category data - explicitly set bannerImage even if empty
    const categoryDataToSave = {
      name,
      slug: slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      status: status || 'active',
      image: image || '',
      bannerImage: bannerImage !== undefined && bannerImage !== null ? bannerImage : '',
    };

    const category = await Category.create(categoryDataToSave);

    // Ensure bannerImage is always included in response - use lean() for better control
    const savedCategory = await Category.findById(category._id).lean();
    const categoryData = {
      ...savedCategory,
      bannerImage: savedCategory.bannerImage !== undefined && savedCategory.bannerImage !== null ? savedCategory.bannerImage : '',
    };

    res.status(201).json({
      success: true,
      message: 'Category created successfully',
      data: categoryData,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
});

// @route   PUT /api/categories/:id
// @desc    Update category
// @access  Private/Admin
router.put('/:id', async (req, res) => {
  try {
    console.log('Category update request body:', JSON.stringify(req.body, null, 2));
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found',
      });
    }

    // Check if name or slug is being changed and if new values already exist
    if (req.body.name || req.body.slug) {
      const existingCategory = await Category.findOne({
        $or: [
          { name: req.body.name || category.name },
          { slug: req.body.slug || category.slug },
        ],
        _id: { $ne: req.params.id },
      });

      if (existingCategory) {
        return res.status(400).json({
          success: false,
          message: 'Category with this name or slug already exists',
        });
      }
    }

    // Prepare update data, ensuring bannerImage and image are properly handled
    const updateData = {
      ...req.body,
      image: req.body.image !== undefined ? (req.body.image || '') : category.image,
      bannerImage: req.body.bannerImage !== undefined ? (req.body.bannerImage || '') : category.bannerImage,
    };

    console.log('Updating category with:', updateData);
    await Category.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    // Fetch updated category with lean() to get plain JavaScript object
    const updatedCategory = await Category.findById(req.params.id).lean();

    // Ensure bannerImage is always included in response
    const categoryData = {
      ...updatedCategory,
      bannerImage: updatedCategory.bannerImage !== undefined && updatedCategory.bannerImage !== null ? updatedCategory.bannerImage : '',
      image: updatedCategory.image !== undefined && updatedCategory.image !== null ? updatedCategory.image : '',
    };

    res.status(200).json({
      success: true,
      message: 'Category updated successfully',
      data: categoryData,
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
    // Log error but don't fail the category deletion if image deletion fails
    console.error(`Failed to delete image ${fileId}:`, error.message);
  }
};

// @route   DELETE /api/categories/:id
// @desc    Delete category and its associated images
// @access  Private/Admin
router.delete('/:id', async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found',
      });
    }

    // Extract image IDs from category
    const imageIdsToDelete = [];

    // Extract image ID
    if (category.image) {
      const imageId = extractFileIdFromUrl(category.image);
      if (imageId) {
        imageIdsToDelete.push(imageId);
      }
    }

    // Extract bannerImage ID
    if (category.bannerImage) {
      const bannerImageId = extractFileIdFromUrl(category.bannerImage);
      if (bannerImageId && !imageIdsToDelete.includes(bannerImageId)) {
        imageIdsToDelete.push(bannerImageId);
      }
    }

    // Delete all associated images from GridFS
    await Promise.all(imageIdsToDelete.map(deleteImageFromGridFS));

    // Delete the category
    await category.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Category and associated images deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
});

module.exports = router;

