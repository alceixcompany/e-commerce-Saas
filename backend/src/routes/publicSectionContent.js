const express = require('express');
const router = express.Router();
const publicSectionController = require('../modules/publicSectionContent/publicSectionContent.controller');

// @route   GET /api/public/section-content/bootstrap
// @desc    Get all essential site configurations in one request
// @access  Public
router.get('/bootstrap', publicSectionController.getBootstrap);

// @route   GET /api/public/section-content/:identifier
// @desc    Get section content by identifier
// @access  Public
router.get('/:identifier', publicSectionController.getSection);

module.exports = router;
