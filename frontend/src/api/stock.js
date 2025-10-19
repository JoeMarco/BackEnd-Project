import api from '../services/api';

export const stockService = {
  // Get stock summary
  getStockSummary: () => api.get('/stock/summary'),
  
  // Get stock logs
  getStockLogs: (params) => api.get('/stock/logs', { params }),
  
  // Get stock movements by item
  getStockMovementsByItem: (itemType, itemId, params) => 
    api.get(`/stock/movements/${itemType}/${itemId}`, { params }),
  
  // Adjust stock
  adjustStock: (data) => api.post('/stock/adjust', data)
};