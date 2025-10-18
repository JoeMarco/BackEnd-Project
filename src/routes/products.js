const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const { validateProduct, validateId, validatePagination } = require('../middleware/validation');
const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getLowStockProducts,
  exportProducts
} = require('../controllers/productController');

// Get all products
router.get('/', authenticate, validatePagination, getProducts);

// Get low stock products
router.get('/low-stock', authenticate, getLowStockProducts);

// Export products
router.get('/export', authenticate, authorize('admin', 'manager'), exportProducts);

// Get product by ID
router.get('/:id', authenticate, validateId, getProductById);

// Create new product
router.post('/', authenticate, authorize('admin', 'manager'), validateProduct, createProduct);

// Update product
router.put('/:id', authenticate, authorize('admin', 'manager'), validateId, validateProduct, updateProduct);

// Delete product
router.delete('/:id', authenticate, authorize('admin'), validateId, deleteProduct);

module.exports = router;