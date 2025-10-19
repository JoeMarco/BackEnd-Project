import api from '../services/api';

export const workOrderService = {
  // Get all work orders
  getWorkOrders: (params) => api.get('/work-orders', { params }),
  
  // Get work order by ID
  getWorkOrderById: (id) => api.get(`/work-orders/${id}`),
  
  // Create work order
  createWorkOrder: (data) => api.post('/work-orders', data),
  
  // Update work order
  updateWorkOrder: (id, data) => api.put(`/work-orders/${id}`, data),
  
  // Delete work order
  deleteWorkOrder: (id) => api.delete(`/work-orders/${id}`),
  
  // Start work order
  startWorkOrder: (id) => api.patch(`/work-orders/${id}/start`),
  
  // Complete work order
  completeWorkOrder: (id, data) => api.patch(`/work-orders/${id}/complete`, data),
  
  // Cancel work order
  cancelWorkOrder: (id) => api.patch(`/work-orders/${id}/cancel`),
  
  // Get BOM requirements for work order
  getWorkOrderBOMRequirements: (id) => api.get(`/work-orders/${id}/bom-requirements`)
};