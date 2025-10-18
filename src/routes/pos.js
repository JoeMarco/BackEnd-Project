const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const { validatePurchaseOrder, validatePOItem, validateId, validatePagination } = require('../middleware/validation');
const {
  getPurchaseOrders,
  getPurchaseOrderById,
  createPurchaseOrder,
  updatePurchaseOrder,
  deletePurchaseOrder,
  receivePurchaseOrder,
  approvePurchaseOrder,
  cancelPurchaseOrder
} = require('../controllers/poController');

// Get all purchase orders
router.get('/', authenticate, validatePagination, getPurchaseOrders);

// Get purchase order by ID
router.get('/:id', authenticate, validateId, getPurchaseOrderById);

// Create new purchase order
router.post('/', authenticate, authorize('admin', 'manager'), validatePurchaseOrder, createPurchaseOrder);

// Update purchase order
router.put('/:id', authenticate, authorize('admin', 'manager'), validateId, validatePurchaseOrder, updatePurchaseOrder);

// Delete purchase order
router.delete('/:id', authenticate, authorize('admin'), validateId, deletePurchaseOrder);

// Approve purchase order
router.patch('/:id/approve', authenticate, authorize('admin', 'manager'), validateId, approvePurchaseOrder);

// Receive purchase order
router.patch('/:id/receive', authenticate, authorize('admin', 'manager', 'staff'), validateId, receivePurchaseOrder);

// Cancel purchase order
router.patch('/:id/cancel', authenticate, authorize('admin', 'manager'), validateId, cancelPurchaseOrder);

module.exports = router;