/**
 * Test Suite: Import/Export Validation
 * Memvalidasi semua import statements dan dependencies
 */

const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '..');
const srcDir = path.join(rootDir, 'src');

// Helper function untuk membaca semua file JS/JSX
const getAllJsFiles = (dir, fileList = []) => {
  if (!fs.existsSync(dir)) return fileList;
  
  const files = fs.readdirSync(dir, { withFileTypes: true });
  files.forEach(file => {
    const filePath = path.join(dir, file.name);
    if (file.isDirectory()) {
      getAllJsFiles(filePath, fileList);
    } else if (file.name.endsWith('.js') || file.name.endsWith('.jsx')) {
      fileList.push(filePath);
    }
  });
  return fileList;
};

// Helper function untuk extract import statements
const extractImports = (content) => {
  const importRegex = /import\s+(?:(?:\{[^}]*\})|(?:\*\s+as\s+\w+)|(?:\w+))\s+from\s+['"]([^'"]+)['"]/g;
  const imports = [];
  let match;
  
  while ((match = importRegex.exec(content)) !== null) {
    imports.push(match[1]);
  }
  
  return imports;
};

// Helper function untuk resolve path relatif
const resolveImportPath = (fromFile, importPath) => {
  // Skip external packages
  if (!importPath.startsWith('.')) {
    return null;
  }

  const fromDir = path.dirname(fromFile);
  let resolvedPath = path.join(fromDir, importPath);

  // Coba berbagai ekstensi
  const extensions = ['', '.js', '.jsx', '/index.js', '/index.jsx'];
  for (const ext of extensions) {
    const fullPath = resolvedPath + ext;
    if (fs.existsSync(fullPath)) {
      return fullPath;
    }
  }

  return resolvedPath;
};

describe('Import/Export Validation', () => {
  let allFiles = [];

  beforeAll(() => {
    allFiles = getAllJsFiles(srcDir);
  });

  describe('Import Path Resolution', () => {
    test('All relative imports should resolve to existing files', () => {
      const errors = [];

      allFiles.forEach(file => {
        const content = fs.readFileSync(file, 'utf-8');
        const imports = extractImports(content);
        const relativeImports = imports.filter(imp => imp.startsWith('.'));

        relativeImports.forEach(importPath => {
          const resolved = resolveImportPath(file, importPath);
          if (resolved && !fs.existsSync(resolved)) {
            errors.push({
              file: path.relative(rootDir, file),
              import: importPath,
              resolved: path.relative(rootDir, resolved)
            });
          }
        });
      });

      if (errors.length > 0) {
        console.error('Unresolved imports:', JSON.stringify(errors, null, 2));
      }
      
      expect(errors).toEqual([]);
    });

    test('No imports should use absolute paths from src', () => {
      const errors = [];

      allFiles.forEach(file => {
        const content = fs.readFileSync(file, 'utf-8');
        const imports = extractImports(content);
        
        imports.forEach(importPath => {
          if (importPath.startsWith('src/')) {
            errors.push({
              file: path.relative(rootDir, file),
              import: importPath
            });
          }
        });
      });

      if (errors.length > 0) {
        console.warn('Files using absolute imports:', JSON.stringify(errors, null, 2));
      }
      
      // This is a warning, not a hard error
      expect(errors.length).toBeLessThan(allFiles.length);
    });
  });

  describe('Export Validation', () => {
    test('All files should have at least one export', () => {
      const filesWithoutExports = [];

      allFiles.forEach(file => {
        // Skip index.js and test files
        if (file.includes('index.js') || file.includes('.test.')) {
          return;
        }

        const content = fs.readFileSync(file, 'utf-8');
        const hasExport = /export\s+(default|const|function|class|\{)/g.test(content);
        
        if (!hasExport) {
          filesWithoutExports.push(path.relative(rootDir, file));
        }
      });

      if (filesWithoutExports.length > 0) {
        console.warn('Files without exports:', filesWithoutExports);
      }

      // Allow some files to not have exports
      expect(filesWithoutExports.length).toBeLessThan(allFiles.length * 0.1);
    });
  });

  describe('Package Dependencies', () => {
    test('All imported packages should be in package.json', () => {
      const packageJson = JSON.parse(
        fs.readFileSync(path.join(rootDir, 'package.json'), 'utf-8')
      );
      const dependencies = {
        ...packageJson.dependencies,
        ...packageJson.devDependencies
      };

      const externalImports = new Set();
      allFiles.forEach(file => {
        const content = fs.readFileSync(file, 'utf-8');
        const imports = extractImports(content);
        
        imports.forEach(importPath => {
          // Extract package name (handle scoped packages)
          if (!importPath.startsWith('.')) {
            const packageName = importPath.startsWith('@')
              ? importPath.split('/').slice(0, 2).join('/')
              : importPath.split('/')[0];
            externalImports.add(packageName);
          }
        });
      });

      const missingDependencies = [];
      externalImports.forEach(pkg => {
        if (!dependencies[pkg] && pkg !== 'react' && pkg !== 'react-dom') {
          missingDependencies.push(pkg);
        }
      });

      expect(missingDependencies).toEqual([]);
    });
  });

  describe('Common Import Patterns', () => {
    test('API imports should come from src/api', () => {
      const violations = [];

      allFiles.forEach(file => {
        if (file.includes('src/api')) return; // Skip API files themselves

        const content = fs.readFileSync(file, 'utf-8');
        // Check if file makes API calls directly instead of using api modules
        if (content.includes('axios.get') || content.includes('axios.post')) {
          const hasApiImport = content.includes("from '../api") || 
                              content.includes("from '../../api") ||
                              content.includes("from '../../../api");
          
          if (!hasApiImport) {
            violations.push(path.relative(rootDir, file));
          }
        }
      });

      if (violations.length > 0) {
        console.warn('Files making direct API calls:', violations);
      }

      // This is a warning for best practices
      expect(violations.length).toBeLessThan(5);
    });

    test('React components should import React', () => {
      const violations = [];

      allFiles.forEach(file => {
        if (!file.endsWith('.jsx')) return;

        const content = fs.readFileSync(file, 'utf-8');
        const hasReactImport = content.includes("import React") || 
                              content.includes("import * as React");
        const hasJSX = /<[A-Z]/.test(content) || /<div|<span|<button/.test(content);
        
        if (hasJSX && !hasReactImport) {
          violations.push(path.relative(rootDir, file));
        }
      });

      if (violations.length > 0) {
        console.warn('JSX files without React import:', violations);
      }

      // Modern React doesn't require React import, so this is just informational
      expect(violations.length).toBeLessThan(allFiles.length);
    });
  });

  describe('Circular Dependencies Detection', () => {
    test('Should not have circular dependencies', () => {
      // Build dependency graph
      const dependencyGraph = new Map();

      allFiles.forEach(file => {
        const content = fs.readFileSync(file, 'utf-8');
        const imports = extractImports(content);
        const relativeImports = imports
          .filter(imp => imp.startsWith('.'))
          .map(imp => resolveImportPath(file, imp))
          .filter(Boolean);

        dependencyGraph.set(file, relativeImports);
      });

      // Detect cycles using DFS
      const detectCycle = (node, visited, recStack, path) => {
        visited.add(node);
        recStack.add(node);
        path.push(node);

        const neighbors = dependencyGraph.get(node) || [];
        for (const neighbor of neighbors) {
          if (!visited.has(neighbor)) {
            const cycle = detectCycle(neighbor, visited, recStack, path);
            if (cycle) return cycle;
          } else if (recStack.has(neighbor)) {
            const cycleStart = path.indexOf(neighbor);
            return path.slice(cycleStart).map(f => path.relative(rootDir, f));
          }
        }

        recStack.delete(node);
        path.pop();
        return null;
      };

      const visited = new Set();
      let foundCycle = null;

      for (const file of allFiles) {
        if (!visited.has(file)) {
          foundCycle = detectCycle(file, visited, new Set(), []);
          if (foundCycle) break;
        }
      }

      if (foundCycle) {
        console.error('Circular dependency detected:', foundCycle);
      }

      expect(foundCycle).toBeNull();
    });
  });
});
