const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const ComponentInstance = require('../models/ComponentInstance');

// @route   GET /api/components
// @desc    Get all component instances or filter by type
// @access  Public (so site frontend can fetch them by ID easily) or Protected
router.get('/', async (req, res) => {
    try {
        const { type } = req.query;
        let query = {};
        if (type) query.type = type;
        
        const instances = await ComponentInstance.find(query).sort({ createdAt: -1 });
        res.json({ success: true, count: instances.length, data: instances });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
});

// @route   GET /api/components/:id
// @desc    Get single component instance
// @access  Public
router.get('/:id', async (req, res) => {
    try {
        const instance = await ComponentInstance.findById(req.params.id);
        if (!instance) return res.status(404).json({ success: false, error: 'Component instance not found' });
        
        res.json({ success: true, data: instance });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
});

// @route   POST /api/components
// @desc    Create new component instance
// @access  Private/Admin
router.post('/', protect, authorize('admin'), async (req, res) => {
    try {
        const { type, name, data } = req.body;
        if (!type || !name) {
            return res.status(400).json({ success: false, error: 'Type and name are required' });
        }
        
        const instance = await ComponentInstance.create({
            type,
            name,
            data: data || {}
        });
        
        res.status(201).json({ success: true, data: instance });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
});

// @route   PUT /api/components/:id
// @desc    Update component instance
// @access  Private/Admin
router.put('/:id', protect, authorize('admin'), async (req, res) => {
    try {
        const instance = await ComponentInstance.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        
        if (!instance) {
            return res.status(404).json({ success: false, error: 'Component instance not found' });
        }
        
        res.json({ success: true, data: instance });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
});

// @route   DELETE /api/components/:id
// @desc    Delete component instance
// @access  Private/Admin
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
    try {
        const instance = await ComponentInstance.findByIdAndDelete(req.params.id);
        
        if (!instance) {
            return res.status(404).json({ success: false, error: 'Component instance not found' });
        }
        
        res.json({ success: true, data: {} });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
});

module.exports = router;
