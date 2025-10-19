import api from '../services/api';

export const supplierService = {
  // Get all suppliers
  getSuppliers: (params) => api.get('/suppliers', { params }),
  
  // Get supplier by ID
  getSupplierById: (id) => api.get(`/suppliers/${id}`),
  
  // Create supplier
  createSupplier: (data) => api.post('/suppliers', data),
  
  // Update supplier
  updateSupplier: (id, data) => api.put(`/suppliers/${id}`, data),
  
  // Delete supplier
  deleteSupplier: (id) => api.delete(`/suppliers/${id}`),
  
  // Export suppliers
  exportSuppliers: (params) => api.get('/suppliers/export', { 
    params,
    responseType: 'blob'
  })
};