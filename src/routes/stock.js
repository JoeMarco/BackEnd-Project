const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const { validateStockLog, validateId, validatePagination } = require('../middleware/validation');
const {
  getStockLogs,
  getStockSummary,
  adjustStock,
  getStockMovementsByItem
} = require('../controllers/stockController');

// Get stock summary
router.get('/summary', authenticate, getStockSummary);

// Get all stock logs
router.get('/logs', authenticate, validatePagination, getStockLogs);

// Get stock movements by item
router.get('/movements/:item_type/:item_id', authenticate, validatePagination, getStockMovementsByItem);

// Adjust stock
router.post('/adjust', authenticate, authorize('admin', 'manager'), adjustStock);

module.exports = router;