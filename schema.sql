-- ========================================
-- MINIMAL DATABASE FOR PROTOTYPE
-- Factory Inventory - Essential Only
-- Efisiensi Ekstrim untuk Demo/Testing
-- ========================================

-- ========================================
-- 1. USERS (Simplified - No RBAC)
-- ========================================
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    role ENUM('admin', 'manager', 'staff') DEFAULT 'staff',
    email VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ========================================
-- 2. SUPPLIERS (Simplified)
-- ========================================
CREATE TABLE suppliers (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(200) NOT NULL,
    contact VARCHAR(100),
    phone VARCHAR(20),
    address TEXT,
    status ENUM('active', 'inactive') DEFAULT 'active'
);

-- ========================================
-- 3. CUSTOMERS (Simplified)
-- ========================================
CREATE TABLE customers (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(200) NOT NULL,
    contact VARCHAR(100),
    phone VARCHAR(20) NOT NULL,
    address TEXT,
    type ENUM('retail', 'wholesale') DEFAULT 'retail',
    status ENUM('active', 'inactive') DEFAULT 'active'
);

-- ========================================
-- 4. RAW MATERIALS (Core Only)
-- ========================================
CREATE TABLE raw_materials (
    id INT PRIMARY KEY AUTO_INCREMENT,
    sku VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(200) NOT NULL,
    category VARCHAR(100),
    unit VARCHAR(20) NOT NULL,
    unit_price DECIMAL(15,2) DEFAULT 0,
    stock INT DEFAULT 0,
    min_stock INT DEFAULT 0,
    supplier_id INT,
    status ENUM('active', 'inactive') DEFAULT 'active',
    FOREIGN KEY (supplier_id) REFERENCES suppliers(id)
);

-- ========================================
-- 5. PRODUCTS (Core Only)
-- ========================================
CREATE TABLE products (
    id INT PRIMARY KEY AUTO_INCREMENT,
    sku VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(200) NOT NULL,
    category VARCHAR(100),
    type ENUM('sendal', 'boot') NOT NULL,
    size VARCHAR(20),
    color VARCHAR(50),
    unit_price DECIMAL(15,2) DEFAULT 0,
    stock INT DEFAULT 0,
    min_stock INT DEFAULT 0,
    status ENUM('active', 'inactive') DEFAULT 'active'
);

-- ========================================
-- 6. BILL OF MATERIALS (Simplified)
-- ========================================
CREATE TABLE bom (
    id INT PRIMARY KEY AUTO_INCREMENT,
    product_id INT NOT NULL,
    material_id INT NOT NULL,
    quantity DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (product_id) REFERENCES products(id),
    FOREIGN KEY (material_id) REFERENCES raw_materials(id)
);

-- ========================================
-- 7. PURCHASE ORDERS (Simplified)
-- ========================================
CREATE TABLE purchase_orders (
    id INT PRIMARY KEY AUTO_INCREMENT,
    po_number VARCHAR(50) UNIQUE NOT NULL,
    supplier_id INT NOT NULL,
    order_date DATE NOT NULL,
    status ENUM('pending', 'approved', 'received', 'cancelled') DEFAULT 'pending',
    total DECIMAL(15,2) DEFAULT 0,
    notes TEXT,
    created_by INT,
    FOREIGN KEY (supplier_id) REFERENCES suppliers(id),
    FOREIGN KEY (created_by) REFERENCES users(id)
);

CREATE TABLE po_items (
    id INT PRIMARY KEY AUTO_INCREMENT,
    po_id INT NOT NULL,
    material_id INT NOT NULL,
    quantity INT NOT NULL,
    price DECIMAL(15,2) DEFAULT 0,
    subtotal DECIMAL(15,2) DEFAULT 0,
    FOREIGN KEY (po_id) REFERENCES purchase_orders(id) ON DELETE CASCADE,
    FOREIGN KEY (material_id) REFERENCES raw_materials(id)
);

-- ========================================
-- 8. WORK ORDERS (Simplified)
-- ========================================
CREATE TABLE work_orders (
    id INT PRIMARY KEY AUTO_INCREMENT,
    wo_number VARCHAR(50) UNIQUE NOT NULL,
    product_id INT NOT NULL,
    quantity_planned INT NOT NULL,
    quantity_produced INT DEFAULT 0,
    status ENUM('pending', 'in_progress', 'completed', 'cancelled') DEFAULT 'pending',
    start_date DATE,
    completion_date DATE,
    notes TEXT,
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id),
    FOREIGN KEY (created_by) REFERENCES users(id)
);

-- ========================================
-- 9. SALES ORDERS (Simplified)
-- ========================================
CREATE TABLE sales_orders (
    id INT PRIMARY KEY AUTO_INCREMENT,
    so_number VARCHAR(50) UNIQUE NOT NULL,
    customer_id INT NOT NULL,
    order_date DATE NOT NULL,
    status ENUM('pending', 'confirmed', 'shipped', 'completed', 'cancelled') DEFAULT 'pending',
    total DECIMAL(15,2) DEFAULT 0,
    notes TEXT,
    created_by INT,
    FOREIGN KEY (customer_id) REFERENCES customers(id),
    FOREIGN KEY (created_by) REFERENCES users(id)
);

CREATE TABLE so_items (
    id INT PRIMARY KEY AUTO_INCREMENT,
    so_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL,
    price DECIMAL(15,2) DEFAULT 0,
    subtotal DECIMAL(15,2) DEFAULT 0,
    FOREIGN KEY (so_id) REFERENCES sales_orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id)
);

-- ========================================
-- 10. STOCK MOVEMENTS (Universal Log)
-- ========================================
CREATE TABLE stock_logs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    item_type ENUM('material', 'product') NOT NULL,
    item_id INT NOT NULL,
    movement_type ENUM('in', 'out', 'adjust') NOT NULL,
    quantity INT NOT NULL,
    reference_type VARCHAR(50) COMMENT 'PO, WO, SO, ADJUSTMENT',
    reference_id INT,
    notes TEXT,
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id)
);

-- ========================================
-- INDEXES (Essential Only)
-- ========================================
CREATE INDEX idx_materials_sku ON raw_materials(sku);
CREATE INDEX idx_products_sku ON products(sku);
CREATE INDEX idx_wo_status ON work_orders(status);
CREATE INDEX idx_so_status ON sales_orders(status);
CREATE INDEX idx_po_status ON purchase_orders(status);

-- ========================================
-- VIEWS (Helper untuk Query Cepat)
-- ========================================

-- View: Low Stock Materials
CREATE VIEW v_low_stock_materials AS
SELECT id, sku, name, stock, min_stock, (min_stock - stock) as shortage
FROM raw_materials 
WHERE stock <= min_stock AND status = 'active';

-- View: Low Stock Products
CREATE VIEW v_low_stock_products AS
SELECT id, sku, name, stock, min_stock, (min_stock - stock) as shortage
FROM products 
WHERE stock <= min_stock AND status = 'active';

-- View: Dashboard Summary
CREATE VIEW v_dashboard AS
SELECT 
    (SELECT COUNT(*) FROM work_orders WHERE status = 'in_progress') as active_work_orders,
    (SELECT COUNT(*) FROM sales_orders WHERE status = 'pending') as pending_sales,
    (SELECT COUNT(*) FROM purchase_orders WHERE status = 'pending') as pending_purchases,
    (SELECT COUNT(*) FROM v_low_stock_materials) as low_stock_materials,
    (SELECT COUNT(*) FROM v_low_stock_products) as low_stock_products;

-- ========================================
-- SAMPLE DATA
-- ========================================

-- Admin User (password: admin123)
INSERT INTO users (username, password, full_name, role, email) VALUES
('admin', '$2a$10$XOPbrlUPQdwdJUpSrIF6X.LbE14qsMmKGhM02N8W0PPvF.v8dn.1m', 'Administrator', 'admin', 'admin@factory.com'),
('operator1', '$2a$10$XOPbrlUPQdwdJUpSrIF6X.LbE14qsMmKGhM02N8W0PPvF.v8dn.1m', 'Operator Produksi', 'staff', 'operator@factory.com');

-- Suppliers
INSERT INTO suppliers (name, contact, phone, address) VALUES
('PT Karet Indonesia', 'Budi', '081234567890', 'Jakarta'),
('CV Foam Makmur', 'Siti', '081234567891', 'Bandung'),
('Toko Bahan Sejahtera', 'Ahmad', '081234567892', 'Surabaya');

-- Customers
INSERT INTO customers (name, contact, phone, type) VALUES
('Toko Sepatu Jaya', 'Dewi', '081234567893', 'wholesale'),
('CV Retail Maju', 'Rudi', '081234567894', 'wholesale'),
('Konsumen Umum', '-', '0000000000', 'retail');

-- Raw Materials
INSERT INTO raw_materials (sku, name, category, unit, unit_price, stock, min_stock, supplier_id) VALUES
('RM001', 'Karet Sol Hitam', 'Karet', 'kg', 25000, 500, 100, 1),
('RM002', 'EVA Foam 10mm', 'Foam', 'lembar', 15000, 200, 50, 2),
('RM003', 'Strap Nilon', 'Aksesoris', 'meter', 3000, 800, 200, 3),
('RM004', 'Lem PU', 'Kimia', 'liter', 45000, 100, 20, 2);

-- Products
INSERT INTO products (sku, name, category, type, size, color, unit_price, stock, min_stock) VALUES
('PRD001', 'Sandal Jepit Classic', 'Sandal Casual', 'sendal', '39', 'Hitam', 35000, 200, 50),
('PRD002', 'Sandal Gunung Adventure', 'Sandal Outdoor', 'sendal', '40', 'Coklat', 150000, 100, 30),
('PRD003', 'Safety Boot Steel Toe', 'Boot Safety', 'boot', '40', 'Hitam', 350000, 50, 20);

-- Bill of Materials
INSERT INTO bom (product_id, material_id, quantity) VALUES
(1, 1, 0.3),  -- Sandal Jepit butuh 0.3kg karet
(1, 3, 0.5),  -- Sandal Jepit butuh 0.5m strap
(2, 1, 0.5),  -- Sandal Gunung butuh 0.5kg karet
(2, 2, 1),    -- Sandal Gunung butuh 1 lembar foam
(2, 3, 1),    -- Sandal Gunung butuh 1m strap
(3, 1, 1),    -- Safety Boot butuh 1kg karet
(3, 2, 2);    -- Safety Boot butuh 2 lembar foam

SELECT '✅ Minimal Database Created!' as message;
SELECT 'Total Tables: 13 (vs 40+ di full version)' as info;
SELECT 'Login: admin / admin123' as credentials;