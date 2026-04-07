const express = require('express');
const router = express.Router();
const authController = require('../modules/auth/auth.controller');
const authValidators = require('../modules/auth/auth.validators');

const rateLimit = require('express-rate-limit');

// Strict rate limiter for authentication to prevent brute-force
const authLimiter = rateLimit({
    windowMs: 10 * 60 * 1000, // 10 minutes
    max: 10, // Limit each IP to 10 requests per windowMs
    message: 'Too many authentication attempts, please try again after 10 minutes',
    standardHeaders: true,
    legacyHeaders: false,
});

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', authLimiter, authValidators.registerValidators, authController.register);

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', authLimiter, authValidators.loginValidators, authController.login);

// @route   POST /api/auth/refresh
// @desc    Refresh Access Token
// @access  Public (Uses Refresh Token Cookie)
router.post('/refresh', authController.refresh);

// @route   POST /api/auth/logout
// @desc    Logout user & Clear tokens
// @access  Public
router.post('/logout', authController.logout);

module.exports = router;
