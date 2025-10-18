const { body, param, query, validationResult } = require('express-validator');

// Handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation Error',
      errors: errors.array()
    });
  }
  next();
};

// User validation
const validateUser = [
  body('username').notEmpty().withMessage('Username is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('full_name').notEmpty().withMessage('Full name is required'),
  body('role').isIn(['admin', 'manager', 'staff']).withMessage('Invalid role'),
  body('email').isEmail().withMessage('Valid email is required').optional(),
  handleValidationErrors
];

// Supplier validation
const validateSupplier = [
  body('name').notEmpty().withMessage('Supplier name is required'),
  body('phone').isMobilePhone().withMessage('Valid phone number is required').optional(),
  handleValidationErrors
];

// Customer validation
const validateCustomer = [
  body('name').notEmpty().withMessage('Customer name is required'),
  body('phone').isMobilePhone().withMessage('Valid phone number is required'),
  body('type').isIn(['retail', 'wholesale']).withMessage('Invalid customer type'),
  handleValidationErrors
];

// Material validation
const validateMaterial = [
  body('sku').notEmpty().withMessage('SKU is required'),
  body('name').notEmpty().withMessage('Material name is required'),
  body('unit').notEmpty().withMessage('Unit is required'),
  body('unit_price').isDecimal().withMessage('Unit price must be a decimal number'),
  body('stock').isInt({ min: 0 }).withMessage('Stock must be a non-negative integer'),
  body('min_stock').isInt({ min: 0 }).withMessage('Min stock must be a non-negative integer'),
  handleValidationErrors
];

// Product validation
const validateProduct = [
  body('sku').notEmpty().withMessage('SKU is required'),
  body('name').notEmpty().withMessage('Product name is required'),
  body('type').isIn(['sendal', 'boot']).withMessage('Invalid product type'),
  body('unit_price').isDecimal().withMessage('Unit price must be a decimal number'),
  body('stock').isInt({ min: 0 }).withMessage('Stock must be a non-negative integer'),
  body('min_stock').isInt({ min: 0 }).withMessage('Min stock must be a non-negative integer'),
  handleValidationErrors
];

// BOM validation
const validateBOM = [
  body('product_id').isInt({ min: 1 }).withMessage('Valid product ID is required'),
  body('material_id').isInt({ min: 1 }).withMessage('Valid material ID is required'),
  body('quantity').isDecimal({ gt: 0 }).withMessage('Quantity must be a positive number'),
  handleValidationErrors
];

// Purchase Order validation
const validatePurchaseOrder = [
  body('po_number').notEmpty().withMessage('PO number is required'),
  body('supplier_id').isInt({ min: 1 }).withMessage('Valid supplier ID is required'),
  body('order_date').isDate().withMessage('Valid order date is required'),
  body('status').isIn(['pending', 'approved', 'received', 'cancelled']).withMessage('Invalid status'),
  handleValidationErrors
];

// PO Item validation
const validatePOItem = [
  body('material_id').isInt({ min: 1 }).withMessage('Valid material ID is required'),
  body('quantity').isInt({ min: 1 }).withMessage('Quantity must be a positive integer'),
  body('price').isDecimal({ min: 0 }).withMessage('Price must be a non-negative decimal'),
  handleValidationErrors
];

// Work Order validation
const validateWorkOrder = [
  body('wo_number').notEmpty().withMessage('WO number is required'),
  body('product_id').isInt({ min: 1 }).withMessage('Valid product ID is required'),
  body('quantity_planned').isInt({ min: 1 }).withMessage('Planned quantity must be a positive integer'),
  body('status').isIn(['pending', 'in_progress', 'completed', 'cancelled']).withMessage('Invalid status'),
  handleValidationErrors
];

// Sales Order validation
const validateSalesOrder = [
  body('so_number').notEmpty().withMessage('SO number is required'),
  body('customer_id').isInt({ min: 1 }).withMessage('Valid customer ID is required'),
  body('order_date').isDate().withMessage('Valid order date is required'),
  body('status').isIn(['pending', 'confirmed', 'shipped', 'completed', 'cancelled']).withMessage('Invalid status'),
  handleValidationErrors
];

// SO Item validation
const validateSOItem = [
  body('product_id').isInt({ min: 1 }).withMessage('Valid product ID is required'),
  body('quantity').isInt({ min: 1 }).withMessage('Quantity must be a positive integer'),
  body('price').isDecimal({ min: 0 }).withMessage('Price must be a non-negative decimal'),
  handleValidationErrors
];

// Stock Log validation
const validateStockLog = [
  body('item_type').isIn(['material', 'product']).withMessage('Invalid item type'),
  body('item_id').isInt({ min: 1 }).withMessage('Valid item ID is required'),
  body('movement_type').isIn(['in', 'out', 'adjust']).withMessage('Invalid movement type'),
  body('quantity').isInt({ min: 1 }).withMessage('Quantity must be a positive integer'),
  handleValidationErrors
];

// ID parameter validation
const validateId = [
  param('id').isInt({ min: 1 }).withMessage('Valid ID is required'),
  handleValidationErrors
];

// Pagination query validation
const validatePagination = [
  query('page').isInt({ min: 1 }).withMessage('Page must be a positive integer').optional(),
  query('limit').isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100').optional(),
  handleValidationErrors
];

module.exports = {
  validateUser,
  validateSupplier,
  validateCustomer,
  validateMaterial,
  validateProduct,
  validateBOM,
  validatePurchaseOrder,
  validatePOItem,
  validateWorkOrder,
  validateSalesOrder,
  validateSOItem,
  validateStockLog,
  validateId,
  validatePagination
};
