const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const Page = require('../models/Page');

// @route   GET /api/pages
// @desc    Get all custom pages
// @access  Public
router.get('/', async (req, res) => {
    try {
        const pages = await Page.find().sort({ createdAt: -1 });
        res.json({ success: true, count: pages.length, data: pages });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
});

// @route   GET /api/pages/:slug
// @desc    Get single page by slug
// @access  Public
router.get('/:slug', async (req, res) => {
    try {
        const page = await Page.findOne({ slug: req.params.slug });
        if (!page) {
            return res.status(404).json({ success: false, error: 'Page not found' });
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
        res.status(500).json({ success: false, error: 'Server Error' });
    }
});

// @route   POST /api/pages
// @desc    Create a new custom page
// @access  Private/Admin
router.post('/', protect, authorize('admin'), async (req, res) => {
    try {
        const { title, slug, path, description, sections } = req.body;
        
        // Basic validation
        if (!title || !slug || !path) {
            return res.status(400).json({ success: false, error: 'Title, slug, and path are required' });
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
            return res.status(400).json({ success: false, error: 'Page with this slug already exists' });
        }
        console.error(err);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
});

// @route   PUT /api/pages/:id
// @desc    Update a custom page
// @access  Private/Admin
router.put('/:id', protect, authorize('admin'), async (req, res) => {
    try {
        const page = await Page.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!page) {
            return res.status(404).json({ success: false, error: 'Page not found' });
        }

        res.json({ success: true, data: page });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
});

// @route   DELETE /api/pages/:id
// @desc    Delete a custom page
// @access  Private/Admin
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
    try {
        const page = await Page.findByIdAndDelete(req.params.id);

        if (!page) {
            return res.status(404).json({ success: false, error: 'Page not found' });
        }

        res.json({ success: true, data: {} });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
});

module.exports = router;
