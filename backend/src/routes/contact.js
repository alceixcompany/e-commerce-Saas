const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const contactController = require('../modules/contact/contact.controller');
const contactValidators = require('../modules/contact/contact.validators');

// @route   POST /api/contact
// @desc    Send a contact message
// @access  Public
router.post('/', contactValidators.createMessageValidators, contactController.createMessage);

// @route   GET /api/contact
// @desc    Get all contact messages
// @access  Private/Admin
router.get('/', protect, authorize('admin'), contactController.listMessages);

module.exports = router;
