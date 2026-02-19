const express = require('express');
const router = express.Router();

// API routes will be added here
// Example: router.use('/products', productRoutes);

router.get('/', (req, res) => {
  res.json({ 
    message: 'E-commerce Backend API',
    version: '1.0.0'
  });
});

module.exports = router;

