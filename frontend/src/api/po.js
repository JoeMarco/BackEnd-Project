import api from './index';

export const poService = {
  // Get all purchase orders
  getAll: async (params) => {
    const response = await api.get('/purchase-orders', { params });
    return response.data;
  },

  // Alias for getAll (for compatibility)
  getPurchaseOrders: async (params) => {
    const response = await api.get('/purchase-orders', { params });
    return response.data;
  },

  // Get purchase order by ID
  getById: async (id) => {
    const response = await api.get(`/purchase-orders/${id}`);
    return response.data;
  },

  // Create new purchase order
  create: async (data) => {
    const response = await api.post('/purchase-orders', data);
    return response.data;
  },

  // Update purchase order
  update: async (id, data) => {
    const response = await api.put(`/purchase-orders/${id}`, data);
    return response.data;
  },

  // Delete purchase order
  delete: async (id) => {
    const response = await api.delete(`/purchase-orders/${id}`);
    return response.data;
  },

  // Approve purchase order
  approve: async (id) => {
    const response = await api.post(`/purchase-orders/${id}/approve`);
    return response.data;
  },

  // Receive purchase order
  receive: async (id, data) => {
    const response = await api.post(`/purchase-orders/${id}/receive`, data);
    return response.data;
  },

  // Cancel purchase order
  cancel: async (id) => {
    const response = await api.post(`/purchase-orders/${id}/cancel`);
    return response.data;
  },

  // Export purchase orders
  export: async (params) => {
    const response = await api.get('/purchase-orders/export', { 
      params,
      responseType: 'blob'
    });
    return response.data;
  }
};

export default poService;
