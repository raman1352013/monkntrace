const express = require('express');
const router = express.Router();

// Import core v1 routes
router.use('/auth', require('../../modules/auth/auth.routes'));
router.use('/users', require('../../modules/users/users.routes'));
router.use('/roles', require('../../modules/roles/roles.routes'));
router.use('/permissions', require('../../modules/permissions/permissions.routes'));
router.use('/upload', require('../../modules/upload/upload.routes'));
router.use('/notifications', require('../../modules/notifications/notifications.routes'));

// LCA Platform Modules
router.use('/vendors', require('../../modules/vendors/vendors.routes'));
router.use('/products', require('../../modules/products/products.routes'));
router.use('/lca-projects', require('../../modules/lca/lca.routes'));
router.use('/lca', require('../../modules/lca/lca.routes'));
router.use('/reviews', require('../../modules/reviews/reviews.routes'));

// Health check endpoint
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'LCA Platform API v1 is running',
    timestamp: new Date().toISOString(),
    version: 'v1'
  });
});

module.exports = router;
