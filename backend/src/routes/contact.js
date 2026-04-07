const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const Contact = require('../models/Contact');
const { protect, authorize } = require('../middleware/auth');
const { validateRequest } = require('../middleware/validate');

// @route   POST /api/contact
// @desc    Send a contact message
// @access  Public
router.post(
    '/',
    [
        body('name', 'Name is required').notEmpty().trim(),
        body('email', 'Please include a valid email').isEmail().normalizeEmail(),
        body('subject', 'Subject is required').notEmpty().trim(),
        body('message', 'Message is required').notEmpty().trim(),
        validateRequest,
    ],
    async (req, res) => {
    try {
        const { name, email, subject, message } = req.body;

        const newMessage = await Contact.create({
            name,
            email,
            subject,
            message,
        });

        res.status(201).json({
            success: true,
            data: newMessage,
            message: 'Message sent successfully',
        });
    } catch (error) {
        console.error('Contact error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
        });
    }
});

// @route   GET /api/contact
// @desc    Get all contact messages
// @access  Private/Admin
router.get('/', protect, authorize('admin'), async (req, res) => {
    try {
        const messages = await Contact.find().sort({ createdAt: -1 });

        res.json({
            success: true,
            data: messages,
        });
    } catch (error) {
        console.error('Get messages error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
        });
    }
});

module.exports = router;
