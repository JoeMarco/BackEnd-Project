const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const { validateMaterial, validateId, validatePagination } = require('../middleware/validation');
const {
  getMaterials,
  getMaterialById,
  createMaterial,
  updateMaterial,
  deleteMaterial,
  getLowStockMaterials,
  exportMaterials
} = require('../controllers/materialController');

// Get all materials
router.get('/', authenticate, validatePagination, getMaterials);

// Get low stock materials
router.get('/low-stock', authenticate, getLowStockMaterials);

// Export materials
router.get('/export', authenticate, authorize('admin', 'manager'), exportMaterials);

// Get material by ID
router.get('/:id', authenticate, validateId, getMaterialById);

// Create new material
router.post('/', authenticate, authorize('admin', 'manager'), validateMaterial, createMaterial);

// Update material
router.put('/:id', authenticate, authorize('admin', 'manager'), validateId, validateMaterial, updateMaterial);

// Delete material
router.delete('/:id', authenticate, authorize('admin'), validateId, deleteMaterial);

module.exports = router;