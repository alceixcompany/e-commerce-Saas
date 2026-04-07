const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const uploadController = require('../modules/upload/upload.controller');
const uploadValidators = require('../modules/upload/upload.validators');

// POST routes require authentication and admin role
// GET routes are public for image display

// @route   POST /api/upload/image
// @desc    Upload and compress image to GridFS
// @access  Private/Admin
router.post('/image', protect, authorize('admin'), uploadController.uploadImageMiddleware, uploadController.uploadImage);

// @route   GET /api/upload/image/:id
// @desc    Get image from GridFS
// @access  Public
router.get('/image/:id', uploadValidators.fileIdValidators, uploadController.getImage);

// @route   DELETE /api/upload/image/:id
// @desc    Delete image from GridFS
// @access  Private/Admin
router.delete('/image/:id', protect, authorize('admin'), uploadValidators.fileIdValidators, uploadController.deleteImage);

// @route   POST /api/upload/video
// @desc    Upload video to GridFS
// @access  Private/Admin
router.post('/video', protect, authorize('admin'), uploadController.uploadVideoMiddleware, uploadController.uploadVideo);

// @route   GET /api/upload/video/:id
// @desc    Stream video from GridFS
// @access  Public
router.get('/video/:id', uploadValidators.fileIdValidators, uploadController.getVideo);

// @route   DELETE /api/upload/video/:id
// @desc    Delete video from GridFS
// @access  Private/Admin
router.delete('/video/:id', protect, authorize('admin'), uploadValidators.fileIdValidators, uploadController.deleteVideo);

module.exports = router;
