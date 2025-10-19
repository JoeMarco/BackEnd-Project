import api from '../services/api';

export const productService = {
  // Get all products
  getProducts: (params) => api.get('/products', { params }),
  
  // Get product by ID
  getProductById: (id) => api.get(`/products/${id}`),
  
  // Create product
  createProduct: (data) => api.post('/products', data),
  
  // Update product
  updateProduct: (id, data) => api.put(`/products/${id}`, data),
  
  // Delete product
  deleteProduct: (id) => api.delete(`/products/${id}`),
  
  // Get low stock products
  getLowStockProducts: () => api.get('/products/low-stock'),
  
  // Export products
  exportProducts: (params) => api.get('/products/export', { 
    params,
    responseType: 'blob'
  })
};