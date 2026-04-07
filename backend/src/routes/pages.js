const express = require('express');
const router = express.Router();
const { body, param, query } = require('express-validator');
const { protect, authorize } = require('../middleware/auth');
const { validateRequest } = require('../middleware/validate');
const Page = require('../models/Page');

// @route   GET /api/pages
// @desc    Get all custom pages
// @access  Public
router.get(
    '/',
    [
        query('page', 'Page must be a positive number').optional().isInt({ min: 1 }),
        query('limit', 'Limit must be a positive number').optional().isInt({ min: 1 }),
        validateRequest,
    ],
    async (req, res) => {
    try {
        const pages = await Page.find().sort({ createdAt: -1 });
        res.json({ success: true, count: pages.length, data: pages });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error', error: 'Server Error' });
    }
});

// @route   GET /api/pages/:slug
// @desc    Get single page by slug
// @access  Public
router.get(
    '/:slug',
    [param('slug', 'Slug is required').notEmpty().trim(), validateRequest],
    async (req, res) => {
    try {
        const page = await Page.findOne({ slug: req.params.slug });
        if (!page) {
            return res.status(404).json({ success: false, message: 'Page not found', error: 'Page not found' });
        }

        const pageObj = page.toObject();
        
        // Populate component instances for sections
        if (pageObj.sections && Array.isArray(pageObj.sections)) {
            const ComponentInstance = require('../models/ComponentInstance');
            
            const populatedSections = await Promise.all(pageObj.sections.map(async (section) => {
                const sectionId = typeof section === 'string' ? section : section.id;
                
                if (sectionId && sectionId.includes('_instance_')) {
                    const instanceId = sectionId.split('_instance_')[1];
                    try {
                        const instance = await ComponentInstance.findById(instanceId);
                        return {
                            ...section,
                            instanceData: instance ? instance.data : null
                        };
                    } catch (error) {
                        console.error(`Failed to populate instance ${instanceId}:`, error);
                        return section;
                    }
                }
                return section;
            }));
            
            pageObj.sections = populatedSections;
        }

        res.json({ success: true, data: pageObj });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error', error: 'Server Error' });
    }
});

// @route   POST /api/pages
// @desc    Create a new custom page
// @access  Private/Admin
router.post(
    '/',
    protect,
    authorize('admin'),
    [
        body('title', 'Title is required').notEmpty().trim(),
        body('slug', 'Slug is required').notEmpty().trim(),
        body('path', 'Path is required').notEmpty().trim(),
        body('description', 'Description must be a string').optional().isString(),
        body('sections', 'Sections must be an array').optional().isArray(),
        validateRequest,
    ],
    async (req, res) => {
    try {
        const { title, slug, path, description, sections } = req.body;
        
        // Basic validation
        if (!title || !slug || !path) {
            return res.status(400).json({ success: false, message: 'Title, slug, and path are required', error: 'Title, slug, and path are required' });
        }

        const page = await Page.create({
            title,
            slug,
            path,
            description: description || '',
            sections: sections || []
        });

        res.status(201).json({ success: true, data: page });
    } catch (err) {
        if (err.code === 11000) {
            return res.status(400).json({ success: false, message: 'Page with this slug already exists', error: 'Page with this slug already exists' });
        }
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error', error: 'Server Error' });
    }
});

// @route   PUT /api/pages/:id
// @desc    Update a custom page
// @access  Private/Admin
router.put(
    '/:id',
    protect,
    authorize('admin'),
    [
        param('id', 'Invalid page id').isMongoId(),
        body('title', 'Title must be a string').optional().isString(),
        body('slug', 'Slug must be a string').optional().isString(),
        body('path', 'Path must be a string').optional().isString(),
        body('description', 'Description must be a string').optional().isString(),
        body('sections', 'Sections must be an array').optional().isArray(),
        validateRequest,
    ],
    async (req, res) => {
    try {
        const page = await Page.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!page) {
            return res.status(404).json({ success: false, message: 'Page not found', error: 'Page not found' });
        }

        res.json({ success: true, data: page });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error', error: 'Server Error' });
    }
});

// @route   DELETE /api/pages/:id
// @desc    Delete a custom page
// @access  Private/Admin
router.delete(
    '/:id',
    protect,
    authorize('admin'),
    [param('id', 'Invalid page id').isMongoId(), validateRequest],
    async (req, res) => {
    try {
        const page = await Page.findByIdAndDelete(req.params.id);

        if (!page) {
            return res.status(404).json({ success: false, message: 'Page not found', error: 'Page not found' });
        }

        res.json({ success: true, data: {} });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error', error: 'Server Error' });
    }
});

module.exports = router;
