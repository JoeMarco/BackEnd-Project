const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const { validateBOM, validateId, validatePagination } = require('../middleware/validation');
const {
  getBOMs,
  getBOMById,
  createBOM,
  updateBOM,
  deleteBOM,
  getBOMByProductId
} = require('../controllers/bomController');

// Get all BOM items
router.get('/', authenticate, validatePagination, getBOMs);

// Get BOM by product ID
router.get('/product/:productId', authenticate, getBOMByProductId);

// Get BOM by ID
router.get('/:id', authenticate, validateId, getBOMById);

// Create new BOM
router.post('/', authenticate, authorize('admin', 'manager'), validateBOM, createBOM);

// Update BOM
router.put('/:id', authenticate, authorize('admin', 'manager'), validateId, validateBOM, updateBOM);

// Delete BOM
router.delete('/:id', authenticate, authorize('admin'), validateId, deleteBOM);

module.exports = router;