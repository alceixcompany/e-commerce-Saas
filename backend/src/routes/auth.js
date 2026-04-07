const express = require('express');
const router = express.Router();
const authController = require('../modules/auth/auth.controller');
const authValidators = require('../modules/auth/auth.validators');

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', authValidators.registerValidators, authController.register);

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', authValidators.loginValidators, authController.login);

// @route   POST /api/auth/refresh
// @desc    Refresh Access Token
// @access  Public (Uses Refresh Token Cookie)
router.post('/refresh', authController.refresh);

// @route   POST /api/auth/logout
// @desc    Logout user & Clear tokens
// @access  Public
router.post('/logout', authController.logout);

module.exports = router;
