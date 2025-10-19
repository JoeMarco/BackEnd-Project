import api from '../services/api';

export const salesService = {
  // Get all sales orders
  getSalesOrders: (params) => api.get('/sales-orders', { params }),
  
  // Get sales order by ID
  getSalesOrderById: (id) => api.get(`/sales-orders/${id}`),
  
  // Create sales order
  createSalesOrder: (data) => api.post('/sales-orders', data),
  
  // Update sales order
  updateSalesOrder: (id, data) => api.put(`/sales-orders/${id}`, data),
  
  // Delete sales order
  deleteSalesOrder: (id) => api.delete(`/sales-orders/${id}`),
  
  // Confirm sales order
  confirmSalesOrder: (id) => api.patch(`/sales-orders/${id}/confirm`),
  
  // Ship sales order
  shipSalesOrder: (id) => api.patch(`/sales-orders/${id}/ship`),
  
  // Complete sales order
  completeSalesOrder: (id) => api.patch(`/sales-orders/${id}/complete`),
  
  // Cancel sales order
  cancelSalesOrder: (id) => api.patch(`/sales-orders/${id}/cancel`)
};