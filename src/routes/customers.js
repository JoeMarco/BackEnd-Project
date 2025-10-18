const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const { validateCustomer, validateId, validatePagination } = require('../middleware/validation');
const {
  getCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  exportCustomers
} = require('../controllers/customerController');

// Get all customers
router.get('/', authenticate, validatePagination, getCustomers);

// Export customers
router.get('/export', authenticate, authorize('admin', 'manager'), exportCustomers);

// Get customer by ID
router.get('/:id', authenticate, validateId, getCustomerById);

// Create new customer
router.post('/', authenticate, authorize('admin', 'manager', 'staff'), validateCustomer, createCustomer);

// Update customer
router.put('/:id', authenticate, authorize('admin', 'manager', 'staff'), validateId, validateCustomer, updateCustomer);

// Delete customer
router.delete('/:id', authenticate, authorize('admin'), validateId, deleteCustomer);

module.exports = router;