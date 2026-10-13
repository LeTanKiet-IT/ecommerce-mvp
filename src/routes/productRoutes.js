const express = require('express');

const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
} = require('../modules/product/product.controller');

const router = express.Router();

router.get('/', getProducts);
router.post('/', createProduct);
router.put('/:pid', updateProduct);
router.delete('/:pid', deleteProduct);
router.get('/:pid', getProductById);

module.exports = router;