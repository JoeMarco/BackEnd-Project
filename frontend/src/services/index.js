/**
 * API Service Layer
 * Organized API calls for all resources
 */

import api from './api';

// ============================================================================
// Auth Services
// ============================================================================
export const authService = {
  login: (credentials) => api.post('/auth/login', credentials),
  logout: () => api.post('/auth/logout'),
  register: (userData) => api.post('/auth/register', userData),
  getCurrentUser: () => api.get('/auth/me'),
  updateProfile: (userData) => api.put('/auth/profile', userData),
  changePassword: (passwordData) => api.put('/auth/password', passwordData),
};

// ============================================================================
// Material Services
// ============================================================================
export const materialService = {
  getAll: (params) => api.get('/materials', { params }),
  getById: (id) => api.get(`/materials/${id}`),
  create: (data) => api.post('/materials', data),
  update: (id, data) => api.put(`/materials/${id}`, data),
  delete: (id) => api.delete(`/materials/${id}`),
  getLowStock: () => api.get('/materials/low-stock'),
};

// ============================================================================
// Product Services
// ============================================================================
export const productService = {
  getAll: (params) => api.get('/products', { params }),
  getById: (id) => api.get(`/products/${id}`),
  create: (data) => api.post('/products', data),
  update: (id, data) => api.put(`/products/${id}`, data),
  delete: (id) => api.delete(`/products/${id}`),
  getLowStock: () => api.get('/products/low-stock'),
};

// ============================================================================
// Supplier Services
// ============================================================================
export const supplierService = {
  getAll: (params) => api.get('/suppliers', { params }),
  getById: (id) => api.get(`/suppliers/${id}`),
  create: (data) => api.post('/suppliers', data),
  update: (id, data) => api.put(`/suppliers/${id}`, data),
  delete: (id) => api.delete(`/suppliers/${id}`),
  getActive: () => api.get('/suppliers/active'),
};

// ============================================================================
// Customer Services
// ============================================================================
export const customerService = {
  getAll: (params) => api.get('/customers', { params }),
  getById: (id) => api.get(`/customers/${id}`),
  create: (data) => api.post('/customers', data),
  update: (id, data) => api.put(`/customers/${id}`, data),
  delete: (id) => api.delete(`/customers/${id}`),
  getActive: () => api.get('/customers/active'),
};

// ============================================================================
// BOM Services
// ============================================================================
export const bomService = {
  getAll: (params) => api.get('/bom', { params }),
  getByProductId: (productId) => api.get(`/bom/product/${productId}`),
  create: (data) => api.post('/bom', data),
  update: (id, data) => api.put(`/bom/${id}`, data),
  delete: (id) => api.delete(`/bom/${id}`),
  calculateRequirements: (productId, quantity) =>
    api.get(`/bom/calculate/${productId}`, { params: { quantity } }),
};

// ============================================================================
// Purchase Order Services
// ============================================================================
export const purchaseOrderService = {
  getAll: (params) => api.get('/purchase-orders', { params }),
  getById: (id) => api.get(`/purchase-orders/${id}`),
  create: (data) => api.post('/purchase-orders', data),
  update: (id, data) => api.put(`/purchase-orders/${id}`, data),
  delete: (id) => api.delete(`/purchase-orders/${id}`),
  updateStatus: (id, status) => api.patch(`/purchase-orders/${id}/status`, { status }),
  receive: (id, receiveData) => api.post(`/purchase-orders/${id}/receive`, receiveData),
};

// ============================================================================
// Sales Order Services
// ============================================================================
export const salesOrderService = {
  getAll: (params) => api.get('/sales-orders', { params }),
  getById: (id) => api.get(`/sales-orders/${id}`),
  create: (data) => api.post('/sales-orders', data),
  update: (id, data) => api.put(`/sales-orders/${id}`, data),
  delete: (id) => api.delete(`/sales-orders/${id}`),
  updateStatus: (id, status) => api.patch(`/sales-orders/${id}/status`, { status }),
  ship: (id, shipmentData) => api.post(`/sales-orders/${id}/ship`, shipmentData),
};

// ============================================================================
// Work Order Services
// ============================================================================
export const workOrderService = {
  getAll: (params) => api.get('/work-orders', { params }),
  getById: (id) => api.get(`/work-orders/${id}`),
  create: (data) => api.post('/work-orders', data),
  update: (id, data) => api.put(`/work-orders/${id}`, data),
  delete: (id) => api.delete(`/work-orders/${id}`),
  updateStatus: (id, status) => api.patch(`/work-orders/${id}/status`, { status }),
  updateProgress: (id, progressData) =>
    api.patch(`/work-orders/${id}/progress`, progressData),
  complete: (id) => api.post(`/work-orders/${id}/complete`),
};

// ============================================================================
// Stock Services
// ============================================================================
export const stockService = {
  getLogs: (params) => api.get('/stock/logs', { params }),
  getMovements: (itemType, itemId) => api.get(`/stock/movements/${itemType}/${itemId}`),
  adjustStock: (data) => api.post('/stock/adjust', data),
  transferStock: (data) => api.post('/stock/transfer', data),
  getStockReport: (params) => api.get('/stock/report', { params }),
};

// ============================================================================
// Dashboard Services
// ============================================================================
export const dashboardService = {
  getOverview: () => api.get('/dashboard/overview'),
  getStats: () => api.get('/dashboard/stats'),
  getRecentActivities: () => api.get('/dashboard/activities'),
  getLowStockAlerts: () => api.get('/dashboard/low-stock'),
  getProductionStatus: () => api.get('/dashboard/production'),
};
