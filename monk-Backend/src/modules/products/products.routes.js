const express = require('express');
const router = express.Router();
const productsController = require('./products.controller');

router.post('/', productsController.createProduct);
router.get('/', productsController.getProducts);
router.get('/:id', productsController.getProductById);

module.exports = router;
