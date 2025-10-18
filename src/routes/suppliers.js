const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const { validateSupplier, validateId, validatePagination } = require('../middleware/validation');
const {
  getSuppliers,
  getSupplierById,
  createSupplier,
  updateSupplier,
  deleteSupplier,
  exportSuppliers
} = require('../controllers/supplierController');

// Get all suppliers
router.get('/', authenticate, validatePagination, getSuppliers);

// Export suppliers
router.get('/export', authenticate, authorize('admin', 'manager'), exportSuppliers);

// Get supplier by ID
router.get('/:id', authenticate, validateId, getSupplierById);

// Create new supplier
router.post('/', authenticate, authorize('admin', 'manager'), validateSupplier, createSupplier);

// Update supplier
router.put('/:id', authenticate, authorize('admin', 'manager'), validateId, validateSupplier, updateSupplier);

// Delete supplier
router.delete('/:id', authenticate, authorize('admin'), validateId, deleteSupplier);

module.exports = router;