/**
 * Script: Project Structure Validation
 * Memvalidasi struktur file dan direktori proyek
 */

const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

// Definisi struktur yang diharapkan
const expectedStructure = {
  'public': {
    files: ['index.html'],
    optional: ['favicon.ico']
  },
  'src': {
    files: ['App.jsx', 'index.js', 'index.css']
  },
  'src/api': {
    files: [
      'auth.js',
      'bom.js',
      'customer.js',
      'material.js',
      'product.js',
      'sales.js',
      'stock.js',
      'supplier.js',
      'workOrder.js'
    ]
  },
  'src/components/common': {
    files: ['Header.jsx', 'Layout.jsx', 'PrivateRoute.jsx', 'Sidebar.jsx'],
    optional: ['Loading.jsx']
  },
  'src/components/forms': {
    files: [
      'BOMForm.jsx',
      'CusomerForm.jsx',
      'MaterialForm.jsx',
      'POForm.jsx',
      'ProductForm.jsx',
      'SalesOrderForm.jsx',
      'SupplierForm.jsx',
      'WorkOrderForm.jsx'
    ]
  },
  'src/components/tables': {
    optional: [
      'BOMTable.jsx',
      'CustomerTable.jsx',
      'MaterialTable.jsx',
      'POTable.jsx',
      'ProductTable.jsx',
      'SalesOrderTable.jsx',
      'StockLogTable.jsx',
      'SupplierTable.jsx',
      'WorkOrderTable.jsx'
    ]
  },
  'src/components/ui': {
    files: ['ConfirmModal.jsx', 'FilterPanel.jsx', 'StatCard.jsx'],
    optional: ['Notification.jsx']
  },
  'src/context': {
    files: ['AuthContext.jsx']
  },
  'src/hooks': {
    files: ['useAuth.js', 'useNotification.js']
  },
  'src/pages': {
    files: ['NotFound.jsx']
  },
  'src/pages/auth': {
    files: ['Login.jsx']
  },
  'src/pages/dashboard': {
    files: ['Dashboard.jsx']
  },
  'src/pages/inventory': {
    files: ['Materials.jsx', 'Products.jsx', 'StockLogs.jsx']
  },
  'src/pages/management': {
    files: ['BOM.jsx', 'Customer.jsx', 'Suppliers.jsx']
  },
  'src/pages/transaction': {
    files: ['PurchaseOrders.jsx', 'SalesOrders.jsx', 'WorkOrder.jsx']
  },
  'src/services': {
    files: ['api.js', 'storage.js']
  },
  'src/utils': {
    files: ['constants.js', 'helpers.js', 'validators.js']
  }
};

// Root files yang diharapkan
const rootFiles = [
  'package.json',
  'README.md',
  '.gitignore'
];

const optionalRootFiles = [
  '.env.example',
  '.env'
];

class StructureValidator {
  constructor() {
    this.errors = [];
    this.warnings = [];
    this.success = [];
    this.rootDir = path.join(__dirname, '..');
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const types = {
      info: chalk.blue('ℹ'),
      success: chalk.green('✓'),
      warning: chalk.yellow('⚠'),
      error: chalk.red('✗')
    };
    console.log(`${types[type]} ${message}`);
  }

  checkFileExists(filePath) {
    return fs.existsSync(filePath);
  }

  checkFileNotEmpty(filePath) {
    try {
      const stats = fs.statSync(filePath);
      return stats.size > 0;
    } catch (error) {
      return false;
    }
  }

  validateNamingConvention(fileName, expectedPattern) {
    if (expectedPattern === 'PascalCase') {
      return /^[A-Z][a-zA-Z0-9]*\.(jsx|tsx)$/.test(fileName);
    } else if (expectedPattern === 'camelCase') {
      return /^[a-z][a-zA-Z0-9]*\.(js|ts)$/.test(fileName);
    }
    return true;
  }

  checkDirectory(dirPath) {
    const fullPath = path.join(this.rootDir, dirPath);
    
    if (!this.checkFileExists(fullPath)) {
      this.errors.push(`Directory missing: ${dirPath}`);
      return false;
    }
    
    this.success.push(`Directory exists: ${dirPath}`);
    return true;
  }

  checkFile(filePath, required = true) {
    const fullPath = path.join(this.rootDir, filePath);
    
    if (!this.checkFileExists(fullPath)) {
      if (required) {
        this.errors.push(`Required file missing: ${filePath}`);
      } else {
        this.warnings.push(`Optional file missing: ${filePath}`);
      }
      return false;
    }

    if (!this.checkFileNotEmpty(fullPath)) {
      this.warnings.push(`File is empty: ${filePath}`);
    }

    this.success.push(`File exists: ${filePath}`);
    return true;
  }

  validateStructure() {
    console.log(chalk.bold.blue('\n🔍 Starting Project Structure Validation...\n'));

    // Check root files
    console.log(chalk.bold('Checking root files...'));
    rootFiles.forEach(file => this.checkFile(file, true));
    optionalRootFiles.forEach(file => this.checkFile(file, false));

    // Check directory structure
    console.log(chalk.bold('\nChecking directory structure...'));
    Object.keys(expectedStructure).forEach(dir => {
      this.checkDirectory(dir);
      
      const config = expectedStructure[dir];
      
      // Check required files
      if (config.files) {
        config.files.forEach(file => {
          this.checkFile(path.join(dir, file), true);
        });
      }
      
      // Check optional files
      if (config.optional) {
        config.optional.forEach(file => {
          this.checkFile(path.join(dir, file), false);
        });
      }
    });

    this.printReport();
  }

  validateNaming() {
    console.log(chalk.bold.blue('\n🔍 Validating Naming Conventions...\n'));

    const checkNamingInDir = (dir, pattern) => {
      const fullPath = path.join(this.rootDir, dir);
      if (!fs.existsSync(fullPath)) return;

      const files = fs.readdirSync(fullPath, { withFileTypes: true });
      files.forEach(file => {
        if (file.isDirectory()) {
          checkNamingInDir(path.join(dir, file.name), pattern);
        } else if (file.name.endsWith('.js') || file.name.endsWith('.jsx')) {
          if (!this.validateNamingConvention(file.name, pattern)) {
            this.warnings.push(
              `Naming convention violation in ${path.join(dir, file.name)}: expected ${pattern}`
            );
          }
        }
      });
    };

    // Check PascalCase for components and pages
    checkNamingInDir('src/components', 'PascalCase');
    checkNamingInDir('src/pages', 'PascalCase');

    // Check camelCase for utils, services, api
    checkNamingInDir('src/utils', 'camelCase');
    checkNamingInDir('src/services', 'camelCase');
    checkNamingInDir('src/api', 'camelCase');
  }

  detectUnusedFiles() {
    console.log(chalk.bold.blue('\n🔍 Detecting Unused Files...\n'));

    const getAllFiles = (dir, fileList = []) => {
      if (!fs.existsSync(dir)) return fileList;

      const files = fs.readdirSync(dir, { withFileTypes: true });
      files.forEach(file => {
        const filePath = path.join(dir, file.name);
        if (file.isDirectory()) {
          if (!file.name.startsWith('.') && file.name !== 'node_modules') {
            getAllFiles(filePath, fileList);
          }
        } else if (file.name.endsWith('.js') || file.name.endsWith('.jsx')) {
          fileList.push(filePath);
        }
      });
      return fileList;
    };

    const allFiles = getAllFiles(path.join(this.rootDir, 'src'));
    const importedFiles = new Set();

    // Scan all files for imports
    allFiles.forEach(file => {
      const content = fs.readFileSync(file, 'utf-8');
      const importRegex = /from\s+['"](\.\.?\/[^'"]+)['"]/g;
      let match;

      while ((match = importRegex.exec(content)) !== null) {
        const importPath = match[1];
        const resolvedPath = path.resolve(path.dirname(file), importPath);
        
        // Try different extensions
        ['.js', '.jsx', '/index.js', '/index.jsx'].forEach(ext => {
          const fullPath = resolvedPath + ext;
          if (fs.existsSync(fullPath)) {
            importedFiles.add(fullPath);
          }
        });
      }
    });

    // Find unused files
    const unusedFiles = allFiles.filter(file => 
      !importedFiles.has(file) && 
      !file.includes('index.js') &&
      !file.includes('App.jsx')
    );

    if (unusedFiles.length > 0) {
      this.warnings.push(`Found ${unusedFiles.length} potentially unused files`);
      unusedFiles.forEach(file => {
        this.log(`  - ${path.relative(this.rootDir, file)}`, 'warning');
      });
    }
  }

  printReport() {
    console.log(chalk.bold.blue('\n📊 Validation Report\n'));
    
    console.log(chalk.bold.green(`✓ Success: ${this.success.length} items`));
    console.log(chalk.bold.yellow(`⚠ Warnings: ${this.warnings.length} items`));
    console.log(chalk.bold.red(`✗ Errors: ${this.errors.length} items`));

    if (this.warnings.length > 0) {
      console.log(chalk.bold.yellow('\n⚠️  Warnings:'));
      this.warnings.forEach(warning => {
        console.log(chalk.yellow(`  - ${warning}`));
      });
    }

    if (this.errors.length > 0) {
      console.log(chalk.bold.red('\n❌ Errors:'));
      this.errors.forEach(error => {
        console.log(chalk.red(`  - ${error}`));
      });
    }

    if (this.errors.length === 0 && this.warnings.length === 0) {
      console.log(chalk.bold.green('\n✨ All checks passed! Project structure is valid.\n'));
    } else if (this.errors.length === 0) {
      console.log(chalk.bold.yellow('\n⚠️  Validation completed with warnings.\n'));
    } else {
      console.log(chalk.bold.red('\n❌ Validation failed. Please fix the errors above.\n'));
    }
  }

  run() {
    this.validateStructure();
    this.validateNaming();
    this.detectUnusedFiles();

    // Exit with error code if there are errors
    if (this.errors.length > 0) {
      process.exit(1);
    }
  }
}

// Run validation
const validator = new StructureValidator();
validator.run();
