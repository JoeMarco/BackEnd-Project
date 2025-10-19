// User roles
export const ROLES = {
  ADMIN: 'admin',
  MANAGER: 'manager',
  STAFF: 'staff'
};

// Status options
export const STATUS_OPTIONS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive'
};

// Purchase order status
export const PO_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  RECEIVED: 'received',
  CANCELLED: 'cancelled'
};

// Work order status
export const WO_STATUS = {
  PENDING: 'pending',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled'
};

// Sales order status
export const SO_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  SHIPPED: 'shipped',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled'
};

// Product types
export const PRODUCT_TYPES = {
  SENDAL: 'sendal',
  BOOT: 'boot'
};

// Customer types
export const CUSTOMER_TYPES = {
  RETAIL: 'retail',
  WHOLESALE: 'wholesale'
};

// Stock movement types
export const STOCK_MOVEMENT_TYPES = {
  IN: 'in',
  OUT: 'out',
  ADJUST: 'adjust'
};

// Item types
export const ITEM_TYPES = {
  MATERIAL: 'material',
  PRODUCT: 'product'
};

// Reference types
export const REFERENCE_TYPES = {
  PO: 'PO',
  WO: 'WO',
  SO: 'SO',
  ADJUSTMENT: 'ADJUSTMENT'
};

// Pagination defaults
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_PAGE_SIZE: 10,
  PAGE_SIZE_OPTIONS: ['10', '20', '50', '100']
};

// Chart colors
export const CHART_COLORS = {
  PRIMARY: '#1890ff',
  SUCCESS: '#52c41a',
  WARNING: '#faad14',
  ERROR: '#f5222d',
  PURPLE: '#722ed1',
  CYAN: '#13c2c2',
  ORANGE: '#fa8c16'
};