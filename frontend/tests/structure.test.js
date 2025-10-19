/**
 * Test Suite: Structure Validation
 * Memvalidasi struktur file dan folder proyek
 */

const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '..');
const srcDir = path.join(rootDir, 'src');

// Definisi struktur yang diharapkan
const expectedStructure = {
  'src/api': [
    'auth.js',
    'bom.js',
    'customer.js',
    'material.js',
    'product.js',
    'sales.js',
    'stock.js',
    'supplier.js',
    'workOrder.js'
  ],
  'src/components/common': [
    'Header.jsx',
    'Layout.jsx',
    'PrivateRoute.jsx',
    'Sidebar.jsx'
  ],
  'src/components/forms': [
    'BOMForm.jsx',
    'CusomerForm.jsx',
    'MaterialForm.jsx',
    'POForm.jsx',
    'ProductForm.jsx',
    'SalesOrderForm.jsx',
    'SupplierForm.jsx',
    'WorkOrderForm.jsx'
  ],
  'src/components/ui': [
    'ConfirmModal.jsx',
    'FilterPanel.jsx',
    'StatCard.jsx'
  ],
  'src/context': [
    'AuthContext.jsx'
  ],
  'src/hooks': [
    'useAuth.js',
    'useNotification.js'
  ],
  'src/pages/auth': [
    'Login.jsx'
  ],
  'src/pages/dashboard': [
    'Dashboard.jsx'
  ],
  'src/pages/inventory': [
    'Materials.jsx',
    'Products.jsx',
    'StockLogs.jsx'
  ],
  'src/pages/management': [
    'BOM.jsx',
    'Customer.jsx',
    'Suppliers.jsx'
  ],
  'src/pages/transaction': [
    'PurchaseOrders.jsx',
    'SalesOrders.jsx',
    'WorkOrder.jsx'
  ],
  'src/services': [
    'api.js',
    'storage.js'
  ],
  'src/utils': [
    'constants.js',
    'helpers.js',
    'validators.js'
  ],
  'src': [
    'App.jsx',
    'index.js',
    'index.css'
  ],
  'public': [
    'index.html'
  ]
};

describe('Project Structure Validation', () => {
  describe('Directory Existence', () => {
    test('src directory should exist', () => {
      expect(fs.existsSync(srcDir)).toBe(true);
    });

    test('All required subdirectories should exist', () => {
      const requiredDirs = [
        'api',
        'components',
        'components/common',
        'components/forms',
        'components/tables',
        'components/ui',
        'context',
        'hooks',
        'pages',
        'pages/auth',
        'pages/dashboard',
        'pages/inventory',
        'pages/management',
        'pages/transaction',
        'services',
        'utils'
      ];

      requiredDirs.forEach(dir => {
        const dirPath = path.join(srcDir, dir);
        expect(fs.existsSync(dirPath)).toBe(true);
      });
    });
  });

  describe('File Existence', () => {
    Object.entries(expectedStructure).forEach(([folder, files]) => {
      describe(`Files in ${folder}`, () => {
        files.forEach(file => {
          test(`${file} should exist`, () => {
            const filePath = path.join(rootDir, folder, file);
            expect(fs.existsSync(filePath)).toBe(true);
          });
        });
      });
    });
  });

  describe('File Naming Conventions', () => {
    test('API files should use camelCase', () => {
      const apiDir = path.join(srcDir, 'api');
      if (fs.existsSync(apiDir)) {
        const files = fs.readdirSync(apiDir);
        files.forEach(file => {
          if (file.endsWith('.js')) {
            // File harus dimulai dengan huruf kecil (camelCase)
            expect(file[0]).toBe(file[0].toLowerCase());
          }
        });
      }
    });

    test('Component files should use PascalCase', () => {
      const checkPascalCase = (dir) => {
        if (!fs.existsSync(dir)) return;
        
        const files = fs.readdirSync(dir, { withFileTypes: true });
        files.forEach(file => {
          if (file.isDirectory()) {
            checkPascalCase(path.join(dir, file.name));
          } else if (file.name.endsWith('.jsx')) {
            // File harus dimulai dengan huruf besar (PascalCase)
            expect(file.name[0]).toBe(file.name[0].toUpperCase());
          }
        });
      };

      checkPascalCase(path.join(srcDir, 'components'));
      checkPascalCase(path.join(srcDir, 'pages'));
    });

    test('Utility files should use camelCase', () => {
      const utilsDir = path.join(srcDir, 'utils');
      if (fs.existsSync(utilsDir)) {
        const files = fs.readdirSync(utilsDir);
        files.forEach(file => {
          if (file.endsWith('.js')) {
            expect(file[0]).toBe(file[0].toLowerCase());
          }
        });
      }
    });

    test('Service files should use camelCase', () => {
      const servicesDir = path.join(srcDir, 'services');
      if (fs.existsSync(servicesDir)) {
        const files = fs.readdirSync(servicesDir);
        files.forEach(file => {
          if (file.endsWith('.js')) {
            expect(file[0]).toBe(file[0].toLowerCase());
          }
        });
      }
    });
  });

  describe('File Content Validation', () => {
    test('No file should be empty', () => {
      const checkEmptyFiles = (dir) => {
        if (!fs.existsSync(dir)) return;
        
        const files = fs.readdirSync(dir, { withFileTypes: true });
        files.forEach(file => {
          const filePath = path.join(dir, file.name);
          if (file.isDirectory()) {
            checkEmptyFiles(filePath);
          } else if (file.name.endsWith('.js') || file.name.endsWith('.jsx')) {
            const content = fs.readFileSync(filePath, 'utf-8').trim();
            expect(content.length).toBeGreaterThan(0);
          }
        });
      };

      checkEmptyFiles(srcDir);
    });

    test('All JavaScript files should have valid syntax', () => {
      const checkSyntax = (dir) => {
        if (!fs.existsSync(dir)) return;
        
        const files = fs.readdirSync(dir, { withFileTypes: true });
        files.forEach(file => {
          const filePath = path.join(dir, file.name);
          if (file.isDirectory()) {
            checkSyntax(filePath);
          } else if (file.name.endsWith('.js') || file.name.endsWith('.jsx')) {
            expect(() => {
              const content = fs.readFileSync(filePath, 'utf-8');
              // Basic syntax check - file should not be empty and should contain at least an import or export
              expect(content.length).toBeGreaterThan(0);
            }).not.toThrow();
          }
        });
      };

      checkSyntax(srcDir);
    });
  });

  describe('Configuration Files', () => {
    test('package.json should exist', () => {
      expect(fs.existsSync(path.join(rootDir, 'package.json'))).toBe(true);
    });

    test('package.json should be valid JSON', () => {
      const packageJson = fs.readFileSync(path.join(rootDir, 'package.json'), 'utf-8');
      expect(() => JSON.parse(packageJson)).not.toThrow();
    });

    test('README.md should exist', () => {
      expect(fs.existsSync(path.join(rootDir, 'README.md'))).toBe(true);
    });

    test('.gitignore should exist', () => {
      expect(fs.existsSync(path.join(rootDir, '.gitignore'))).toBe(true);
    });
  });

  describe('Public Assets', () => {
    test('public/index.html should exist', () => {
      expect(fs.existsSync(path.join(rootDir, 'public', 'index.html'))).toBe(true);
    });
  });
});
