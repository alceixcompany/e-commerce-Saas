const express = require('express');
const router = express.Router();
const Blog = require('../models/Blog');
const { protect, authorize } = require('../middleware/auth');
const escapeRegex = require('../utils/escapeRegex');
const DOMPurify = require('isomorphic-dompurify');

// @route   GET /api/blogs
// @desc    Get all published blogs (Public) or all blogs (Admin)
// @access  Public
router.get('/', async (req, res) => {
    try {
        const { sort, q } = req.query;
        let query = { isPublished: true };

        // Search filter
        if (q) {
            const searchRegex = new RegExp(escapeRegex(q.trim()), 'i');
            query.$or = [
                { title: searchRegex },
                { excerpt: searchRegex },
                { content: searchRegex }
            ];
        }

        // Sorting
        let sortQuery = { createdAt: -1 }; // Default: Newest
        if (sort === 'best-read') {
            sortQuery = { views: -1 };
        } else if (sort === 'new') {
            sortQuery = { createdAt: -1 };
        }

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const [blogs, total] = await Promise.all([
            Blog.find(query)
                .populate('author', 'name')
                .sort(sortQuery)
                .skip(skip)
                .limit(limit),
            Blog.countDocuments(query)
        ]);

        res.status(200).json({
            success: true,
            count: blogs.length,
            total,
            page,
            pages: Math.ceil(total / limit),
            data: blogs,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Server error',
        });
    }
});

// @route   GET /api/blogs/all
// @desc    Get ALL blogs (Admin)
// @access  Private/Admin
router.get('/all', protect, authorize('admin'), async (req, res) => {
    try {
        const { page = 1, limit = 10, q } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        let query = {};
        if (q) {
            query.title = { $regex: escapeRegex(q.trim()), $options: 'i' };
        }

        const [blogs, total] = await Promise.all([
            Blog.find(query)
                .populate('author', 'name')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(parseInt(limit)),
            Blog.countDocuments(query)
        ]);

        res.status(200).json({
            success: true,
            count: blogs.length,
            total,
            page,
            pages: Math.ceil(total / limit),
            data: blogs,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Server error',
        });
    }
});

// @route   GET /api/blogs/:id
// @desc    Get single blog (by ID or Slug)
// @access  Public
router.get('/:id', async (req, res) => {
    try {
        const idOrSlug = req.params.id;
        let query = {};

        // Check if it's a valid MongoDB ID
        if (idOrSlug.match(/^[0-9a-fA-F]{24}$/)) {
            query = { _id: idOrSlug };
        } else {
            // Use the slug directly, just normalize to lowercase
            query = { slug: idOrSlug.toLowerCase() };
        }

        const blog = await Blog.findOneAndUpdate(
            query,
            { $inc: { views: 1 } },
            { new: true }
        ).populate('author', 'name');

        if (!blog) {
            return res.status(404).json({
                success: false,
                message: 'Blog not found',
            });
        }

        res.status(200).json({
            success: true,
            data: blog,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Server error',
        });
    }
});

// @route   POST /api/blogs
// @desc    Create new blog
// @access  Private/Admin
router.post('/', protect, authorize('admin'), async (req, res) => {
    try {
        req.body.author = req.user.id; // Set author to current user

        // Sanitize content if it exists
        if (req.body.content) {
            req.body.content = DOMPurify.sanitize(req.body.content);
        }

        const blog = await Blog.create(req.body);

        res.status(201).json({
            success: true,
            data: blog,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Server error',
        });
    }
});

// @route   PUT /api/blogs/:id
// @desc    Update blog
// @access  Private/Admin
router.put('/:id', protect, authorize('admin'), async (req, res) => {
    try {
        let blog = await Blog.findById(req.params.id);

        if (!blog) {
            return res.status(404).json({
                success: false,
                message: 'Blog not found',
            });
        }

        // Sanitize content if it exists
        if (req.body.content) {
            req.body.content = DOMPurify.sanitize(req.body.content);
        }

        blog = await Blog.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });

        res.status(200).json({
            success: true,
            data: blog,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Server error',
        });
    }
});

// @route   DELETE /api/blogs/:id
// @desc    Delete blog
// @access  Private/Admin
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
    try {
        const blog = await Blog.findById(req.params.id);

        if (!blog) {
            return res.status(404).json({
                success: false,
                message: 'Blog not found',
            });
        }

        await blog.deleteOne();

        res.status(200).json({
            success: true,
            message: 'Blog deleted successfully',
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Server error',
        });
    }
});

module.exports = router;
