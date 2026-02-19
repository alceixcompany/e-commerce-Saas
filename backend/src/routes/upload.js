const express = require('express');
const router = express.Router();
const multer = require('multer');
const sharp = require('sharp');
const mongoose = require('mongoose');
const GridFSBucket = mongoose.mongo.GridFSBucket;
const { protect, authorize } = require('../middleware/auth');

// POST routes require authentication and admin role
// GET routes are public for image display

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept only image files
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  },
});

// Custom upload middleware to catch errors
const uploadMiddleware = (req, res, next) => {
  upload.single('image')(req, res, (err) => {
    if (err) {
      console.error('Multer error:', err);
      return res.status(400).json({
        success: false,
        message: err.message || 'File upload error',
      });
    }
    next();
  });
};

// @route   POST /api/upload/image
// @desc    Upload and compress image to GridFS
// @access  Private/Admin
router.post('/image', protect, authorize('admin'), uploadMiddleware, async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image file provided',
      });
    }

    // Initialize GridFS bucket
    const bucket = new GridFSBucket(mongoose.connection.db, {
      bucketName: 'uploads',
    });

    // Process image with Sharp
    let processedImage;
    const originalFormat = req.file.mimetype.split('/')[1];
    let contentType = 'image/jpeg';
    let extension = 'jpg';

    try {
      if (originalFormat === 'png') {
        // For PNG, keep as PNG but optimize
        contentType = 'image/png';
        extension = 'png';
        processedImage = await sharp(req.file.buffer)
          .resize(1200, 1200, {
            fit: 'inside',
            withoutEnlargement: true,
          })
          .png({ quality: 85, compressionLevel: 9 })
          .toBuffer();
      } else {
        // For other formats, convert to JPEG
        processedImage = await sharp(req.file.buffer)
          .resize(1200, 1200, {
            fit: 'inside',
            withoutEnlargement: true,
          })
          .jpeg({ quality: 85, progressive: true, mozjpeg: true })
          .toBuffer();
      }
    } catch (sharpError) {
      console.error('Sharp processing error:', sharpError);
      // Fallback to original buffer if processing fails
      processedImage = req.file.buffer;
      contentType = req.file.mimetype;
      extension = req.file.mimetype.split('/')[1] || 'jpg';
    }

    // Generate unique filename
    const filename = `${Date.now()}-${Math.round(Math.random() * 1e9)}.${extension}`;

    // Create upload stream
    const uploadStream = bucket.openUploadStream(filename, {
      contentType: contentType,
      metadata: {
        originalName: req.file.originalname,
        originalSize: req.file.size,
        uploadedBy: req.user._id,
        uploadedAt: new Date(),
      },
    });

    // Write processed image to GridFS
    uploadStream.end(processedImage);

    uploadStream.on('finish', () => {
      res.status(200).json({
        success: true,
        message: 'Image uploaded successfully',
        data: {
          fileId: uploadStream.id.toString(),
          filename: filename,
          url: `/api/upload/image/${uploadStream.id}`,
        },
      });
    });

    uploadStream.on('error', (error) => {
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to upload image',
      });
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
});

// @route   GET /api/upload/image/:id
// @desc    Get image from GridFS
// @access  Public
router.get('/image/:id', async (req, res) => {
  try {
    const bucket = new GridFSBucket(mongoose.connection.db, {
      bucketName: 'uploads',
    });

    const fileId = new mongoose.Types.ObjectId(req.params.id);

    // Check if file exists
    const files = await bucket.find({ _id: fileId }).toArray();
    if (!files || files.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Image not found',
      });
    }

    // Set headers
    res.set('Content-Type', files[0].contentType || 'image/jpeg');
    res.set('Cache-Control', 'public, max-age=31536000'); // 1 year cache

    // Stream file to response
    const downloadStream = bucket.openDownloadStream(fileId);
    downloadStream.pipe(res);

    downloadStream.on('error', (error) => {
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to retrieve image',
      });
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
});

// @route   DELETE /api/upload/image/:id
// @desc    Delete image from GridFS
// @access  Private/Admin
router.delete('/image/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const bucket = new GridFSBucket(mongoose.connection.db, {
      bucketName: 'uploads',
    });

    const fileId = new mongoose.Types.ObjectId(req.params.id);

    // Delete file
    await bucket.delete(fileId);

    res.status(200).json({
      success: true,
      message: 'Image deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
});

module.exports = router;

