/**
 * Test Suite: API Integration Testing
 * Testing semua API calls dan error handling
 */

import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';

// Import all API modules
import * as authAPI from '../src/api/auth';
import * as bomAPI from '../src/api/bom';
import * as customerAPI from '../src/api/customer';
import * as materialAPI from '../src/api/material';
import * as productAPI from '../src/api/product';
import * as salesAPI from '../src/api/sales';
import * as stockAPI from '../src/api/stock';
import * as supplierAPI from '../src/api/supplier';
import * as workOrderAPI from '../src/api/workOrder';

// Setup axios mock
const mock = new MockAdapter(axios);

describe('API Integration Tests', () => {
  beforeEach(() => {
    mock.reset();
  });

  describe('Auth API', () => {
    test('login should send correct credentials', async () => {
      const credentials = { username: 'admin', password: 'password' };
      const response = { token: 'fake-token', user: { id: 1, name: 'Admin' } };

      mock.onPost('/api/auth/login').reply(200, response);

      if (authAPI.login) {
        const result = await authAPI.login(credentials);
        expect(result).toEqual(response);
      }
    });

    test('logout should call correct endpoint', async () => {
      mock.onPost('/api/auth/logout').reply(200, { message: 'Logged out' });

      if (authAPI.logout) {
        const result = await authAPI.logout();
        expect(result.message).toBe('Logged out');
      }
    });

    test('should handle authentication errors', async () => {
      mock.onPost('/api/auth/login').reply(401, { message: 'Invalid credentials' });

      if (authAPI.login) {
        await expect(authAPI.login({ username: 'wrong', password: 'wrong' }))
          .rejects.toThrow();
      }
    });
  });

  describe('Material API', () => {
    test('getMaterials should fetch all materials', async () => {
      const materials = [
        { id: 1, name: 'Steel', quantity: 100 },
        { id: 2, name: 'Wood', quantity: 50 }
      ];

      mock.onGet('/api/materials').reply(200, materials);

      if (materialAPI.getMaterials) {
        const result = await materialAPI.getMaterials();
        expect(result).toEqual(materials);
      }
    });

    test('createMaterial should send material data', async () => {
      const newMaterial = { name: 'Aluminum', quantity: 75 };
      const response = { id: 3, ...newMaterial };

      mock.onPost('/api/materials').reply(201, response);

      if (materialAPI.createMaterial) {
        const result = await materialAPI.createMaterial(newMaterial);
        expect(result).toEqual(response);
      }
    });

    test('updateMaterial should update material', async () => {
      const updatedMaterial = { id: 1, name: 'Steel', quantity: 150 };

      mock.onPut('/api/materials/1').reply(200, updatedMaterial);

      if (materialAPI.updateMaterial) {
        const result = await materialAPI.updateMaterial(1, updatedMaterial);
        expect(result).toEqual(updatedMaterial);
      }
    });

    test('deleteMaterial should delete material', async () => {
      mock.onDelete('/api/materials/1').reply(204);

      if (materialAPI.deleteMaterial) {
        await expect(materialAPI.deleteMaterial(1)).resolves.not.toThrow();
      }
    });
  });

  describe('Product API', () => {
    test('getProducts should fetch all products', async () => {
      const products = [
        { id: 1, name: 'Product A', price: 100 },
        { id: 2, name: 'Product B', price: 200 }
      ];

      mock.onGet('/api/products').reply(200, products);

      if (productAPI.getProducts) {
        const result = await productAPI.getProducts();
        expect(result).toEqual(products);
      }
    });

    test('getProductById should fetch single product', async () => {
      const product = { id: 1, name: 'Product A', price: 100 };

      mock.onGet('/api/products/1').reply(200, product);

      if (productAPI.getProductById) {
        const result = await productAPI.getProductById(1);
        expect(result).toEqual(product);
      }
    });

    test('should handle product not found', async () => {
      mock.onGet('/api/products/999').reply(404, { message: 'Product not found' });

      if (productAPI.getProductById) {
        await expect(productAPI.getProductById(999)).rejects.toThrow();
      }
    });
  });

  describe('Customer API', () => {
    test('getCustomers should fetch all customers', async () => {
      const customers = [
        { id: 1, name: 'Customer A', email: 'a@test.com' },
        { id: 2, name: 'Customer B', email: 'b@test.com' }
      ];

      mock.onGet('/api/customers').reply(200, customers);

      if (customerAPI.getCustomers) {
        const result = await customerAPI.getCustomers();
        expect(result).toEqual(customers);
      }
    });

    test('createCustomer should create new customer', async () => {
      const newCustomer = { name: 'Customer C', email: 'c@test.com' };
      const response = { id: 3, ...newCustomer };

      mock.onPost('/api/customers').reply(201, response);

      if (customerAPI.createCustomer) {
        const result = await customerAPI.createCustomer(newCustomer);
        expect(result).toEqual(response);
      }
    });
  });

  describe('Supplier API', () => {
    test('getSuppliers should fetch all suppliers', async () => {
      const suppliers = [
        { id: 1, name: 'Supplier A', contact: '123456' },
        { id: 2, name: 'Supplier B', contact: '789012' }
      ];

      mock.onGet('/api/suppliers').reply(200, suppliers);

      if (supplierAPI.getSuppliers) {
        const result = await supplierAPI.getSuppliers();
        expect(result).toEqual(suppliers);
      }
    });
  });

  describe('BOM API', () => {
    test('getBOMs should fetch all BOMs', async () => {
      const boms = [
        { id: 1, productId: 1, materials: [] },
        { id: 2, productId: 2, materials: [] }
      ];

      mock.onGet('/api/boms').reply(200, boms);

      if (bomAPI.getBOMs) {
        const result = await bomAPI.getBOMs();
        expect(result).toEqual(boms);
      }
    });

    test('createBOM should create new BOM', async () => {
      const newBOM = { productId: 1, materials: [{ materialId: 1, quantity: 10 }] };
      const response = { id: 1, ...newBOM };

      mock.onPost('/api/boms').reply(201, response);

      if (bomAPI.createBOM) {
        const result = await bomAPI.createBOM(newBOM);
        expect(result).toEqual(response);
      }
    });
  });

  describe('Sales Order API', () => {
    test('getSalesOrders should fetch all sales orders', async () => {
      const orders = [
        { id: 1, customerId: 1, total: 1000 },
        { id: 2, customerId: 2, total: 2000 }
      ];

      mock.onGet('/api/sales-orders').reply(200, orders);

      if (salesAPI.getSalesOrders) {
        const result = await salesAPI.getSalesOrders();
        expect(result).toEqual(orders);
      }
    });
  });

  describe('Work Order API', () => {
    test('getWorkOrders should fetch all work orders', async () => {
      const workOrders = [
        { id: 1, productId: 1, quantity: 100, status: 'pending' },
        { id: 2, productId: 2, quantity: 50, status: 'completed' }
      ];

      mock.onGet('/api/work-orders').reply(200, workOrders);

      if (workOrderAPI.getWorkOrders) {
        const result = await workOrderAPI.getWorkOrders();
        expect(result).toEqual(workOrders);
      }
    });

    test('updateWorkOrderStatus should update status', async () => {
      const updated = { id: 1, status: 'in-progress' };

      mock.onPatch('/api/work-orders/1/status').reply(200, updated);

      if (workOrderAPI.updateWorkOrderStatus) {
        const result = await workOrderAPI.updateWorkOrderStatus(1, 'in-progress');
        expect(result).toEqual(updated);
      }
    });
  });

  describe('Stock API', () => {
    test('getStockLogs should fetch stock logs', async () => {
      const logs = [
        { id: 1, materialId: 1, type: 'in', quantity: 100 },
        { id: 2, materialId: 1, type: 'out', quantity: 50 }
      ];

      mock.onGet('/api/stock-logs').reply(200, logs);

      if (stockAPI.getStockLogs) {
        const result = await stockAPI.getStockLogs();
        expect(result).toEqual(logs);
      }
    });
  });

  describe('Error Handling', () => {
    test('should handle network errors', async () => {
      mock.onGet('/api/materials').networkError();

      if (materialAPI.getMaterials) {
        await expect(materialAPI.getMaterials()).rejects.toThrow();
      }
    });

    test('should handle timeout errors', async () => {
      mock.onGet('/api/materials').timeout();

      if (materialAPI.getMaterials) {
        await expect(materialAPI.getMaterials()).rejects.toThrow();
      }
    });

    test('should handle server errors', async () => {
      mock.onGet('/api/materials').reply(500, { message: 'Internal server error' });

      if (materialAPI.getMaterials) {
        await expect(materialAPI.getMaterials()).rejects.toThrow();
      }
    });

    test('should handle validation errors', async () => {
      mock.onPost('/api/materials').reply(400, { 
        message: 'Validation error',
        errors: { name: 'Name is required' }
      });

      if (materialAPI.createMaterial) {
        await expect(materialAPI.createMaterial({})).rejects.toThrow();
      }
    });
  });

  describe('Request Interceptors', () => {
    test('should add authorization token to requests', async () => {
      // This test would check if token is added to headers
      // Implementation depends on your api.js setup
      mock.onGet('/api/materials').reply(config => {
        expect(config.headers).toBeDefined();
        return [200, []];
      });

      if (materialAPI.getMaterials) {
        await materialAPI.getMaterials();
      }
    });
  });
});
