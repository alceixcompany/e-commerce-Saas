const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const blogsController = require('../modules/blogs/blogs.controller');
const blogsValidators = require('../modules/blogs/blogs.validators');

// @route   GET /api/blogs
// @desc    Get all published blogs (Public) or all blogs (Admin)
// @access  Public
router.get('/', blogsValidators.listBlogsValidators, blogsController.listBlogs);

// @route   GET /api/blogs/all
// @desc    Get ALL blogs (Admin)
// @access  Private/Admin
router.get('/all', protect, authorize('admin'), blogsValidators.listAllBlogsValidators, blogsController.listAllBlogs);

// @route   GET /api/blogs/:id
// @desc    Get single blog (by ID or Slug)
// @access  Public
router.get('/:id', blogsValidators.getBlogValidators, blogsController.getBlog);

// @route   POST /api/blogs
// @desc    Create new blog
// @access  Private/Admin
router.post('/', protect, authorize('admin'), blogsValidators.createBlogValidators, blogsController.createBlog);

// @route   PUT /api/blogs/:id
// @desc    Update blog
// @access  Private/Admin
router.put('/:id', protect, authorize('admin'), blogsValidators.updateBlogValidators, blogsController.updateBlog);

// @route   DELETE /api/blogs/:id
// @desc    Delete blog
// @access  Private/Admin
router.delete('/:id', protect, authorize('admin'), blogsValidators.deleteBlogValidators, blogsController.deleteBlog);

module.exports = router;
