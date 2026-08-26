const express = require('express');
const router = express.Router();
const vendorsController = require('./vendors.controller');

router.post('/', vendorsController.onboardVendor);
router.get('/', vendorsController.getVendors);
router.get('/:id', vendorsController.getVendorById);

module.exports = router;
