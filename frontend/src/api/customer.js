import api from '../services/api';

export const customerService = {
  // Get all customers
  getCustomers: (params) => api.get('/customers', { params }),
  
  // Get customer by ID
  getCustomerById: (id) => api.get(`/customers/${id}`),
  
  // Create customer
  createCustomer: (data) => api.post('/customers', data),
  
  // Update customer
  updateCustomer: (id, data) => api.put(`/customers/${id}`, data),
  
  // Delete customer
  deleteCustomer: (id) => api.delete(`/customers/${id}`),
  
  // Export customers
  exportCustomers: (params) => api.get('/customers/export', { 
    params,
    responseType: 'blob'
  })
};