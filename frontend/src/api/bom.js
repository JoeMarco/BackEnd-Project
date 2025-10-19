import api from '../services/api';

export const bomService = {
  // Get all BOM items
  getBOMs: (params) => api.get('/bom', { params }),
  
  // Get BOM by ID
  getBOMById: (id) => api.get(`/bom/${id}`),
  
  // Get BOM by product ID
  getBOMByProductId: (productId) => api.get(`/bom/product/${productId}`),
  
  // Create BOM
  createBOM: (data) => api.post('/bom', data),
  
  // Update BOM
  updateBOM: (id, data) => api.put(`/bom/${id}`, data),
  
  // Delete BOM
  deleteBOM: (id) => api.delete(`/bom/${id}`)
};