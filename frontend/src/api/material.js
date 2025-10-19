import api from '../services/api';

export const materialService = {
  // Get all materials
  getMaterials: (params) => api.get('/materials', { params }),
  
  // Get material by ID
  getMaterialById: (id) => api.get(`/materials/${id}`),
  
  // Create material
  createMaterial: (data) => api.post('/materials', data),
  
  // Update material
  updateMaterial: (id, data) => api.put(`/materials/${id}`, data),
  
  // Delete material
  deleteMaterial: (id) => api.delete(`/materials/${id}`),
  
  // Get low stock materials
  getLowStockMaterials: () => api.get('/materials/low-stock'),
  
  // Export materials
  exportMaterials: (params) => api.get('/materials/export', { 
    params,
    responseType: 'blob'
  })
};