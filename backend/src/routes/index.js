const express = require('express');
const router = express.Router();
const systemController = require('../modules/system/system.controller');

// Import all route modules
const authRoutes = require('./auth');
const adminRoutes = require('./admin');
const productRoutes = require('./products');
const categoryRoutes = require('./categories');
const uploadRoutes = require('./upload');
const publicProductRoutes = require('./publicProducts');
const publicCategoryRoutes = require('./publicCategories');
const profileRoutes = require('./profile');
const bannerRoutes = require('./banners');
const publicBannerRoutes = require('./publicBanners');
const sectionContentRoutes = require('./sectionContent');
const publicSectionContentRoutes = require('./publicSectionContent');
const contactRoutes = require('./contact');
const orderRoutes = require('./orders');
const couponRoutes = require('./coupons');
const blogRoutes = require('./blogs');
const paymentSettingsRoutes = require('./paymentSettings');
const componentRoutes = require('./components');
const pageRoutes = require('./pages');

/**
 * @openapi
 * /api/health:
 *   get:
 *     summary: Health Check
 *     tags: [System]
 *     responses:
 *       200:
 *         description: Server is healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 status:
 *                   type: string
 */
router.get('/health', systemController.getHealth);

/**
 * @openapi
 * /api:
 *   get:
 *     summary: Get API Information
 *     tags: [System]
 *     responses:
 *       200:
 *         description: API info
 */
router.get('/', systemController.getApiInfo);

// Module-specific routes
router.use('/auth', authRoutes);
router.use('/admin', adminRoutes);
router.use('/admin/payment-settings', paymentSettingsRoutes);
router.use('/products', productRoutes);
router.use('/categories', categoryRoutes);
router.use('/upload', uploadRoutes);
router.use('/public/products', publicProductRoutes);
router.use('/public/categories', publicCategoryRoutes);
router.use('/profile', profileRoutes);
router.use('/banners', bannerRoutes);
router.use('/public/banners', publicBannerRoutes);
router.use('/section-content', sectionContentRoutes);
router.use('/public/section-content', publicSectionContentRoutes);
router.use('/contact', contactRoutes);
router.use('/orders', orderRoutes);
router.use('/coupons', couponRoutes);
router.use('/blogs', blogRoutes);
router.use('/components', componentRoutes);
router.use('/pages', pageRoutes);

module.exports = router;
