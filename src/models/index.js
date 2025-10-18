const { sequelize } = require('../utils/database');
const User = require('./user');
const Supplier = require('./supplier');
const Customer = require('./customer');
const RawMaterial = require('./material');
const Product = require('./product');
const BOM = require('./bom');
const PurchaseOrder = require('./po');
const POItem = require('./poItem');
const WorkOrder = require('./workOrder');
const SalesOrder = require('./sales');
const SOItem = require('./soItem');
const StockLog = require('./stock');

// Define associations
Supplier.hasMany(RawMaterial, { foreignKey: 'supplier_id' });
RawMaterial.belongsTo(Supplier, { foreignKey: 'supplier_id' });

Product.hasMany(BOM, { foreignKey: 'product_id' });
RawMaterial.hasMany(BOM, { foreignKey: 'material_id' });
BOM.belongsTo(Product, { foreignKey: 'product_id' });
BOM.belongsTo(RawMaterial, { foreignKey: 'material_id' });

Supplier.hasMany(PurchaseOrder, { foreignKey: 'supplier_id' });
PurchaseOrder.belongsTo(Supplier, { foreignKey: 'supplier_id' });
User.hasMany(PurchaseOrder, { foreignKey: 'created_by' });
PurchaseOrder.belongsTo(User, { foreignKey: 'created_by', as: 'creator' });

PurchaseOrder.hasMany(POItem, { foreignKey: 'po_id' });
POItem.belongsTo(PurchaseOrder, { foreignKey: 'po_id' });
RawMaterial.hasMany(POItem, { foreignKey: 'material_id' });
POItem.belongsTo(RawMaterial, { foreignKey: 'material_id' });

Product.hasMany(WorkOrder, { foreignKey: 'product_id' });
WorkOrder.belongsTo(Product, { foreignKey: 'product_id' });
User.hasMany(WorkOrder, { foreignKey: 'created_by' });
WorkOrder.belongsTo(User, { foreignKey: 'created_by', as: 'creator' });

Customer.hasMany(SalesOrder, { foreignKey: 'customer_id' });
SalesOrder.belongsTo(Customer, { foreignKey: 'customer_id' });
User.hasMany(SalesOrder, { foreignKey: 'created_by' });
SalesOrder.belongsTo(User, { foreignKey: 'created_by', as: 'creator' });

SalesOrder.hasMany(SOItem, { foreignKey: 'so_id' });
SOItem.belongsTo(SalesOrder, { foreignKey: 'so_id' });
Product.hasMany(SOItem, { foreignKey: 'product_id' });
SOItem.belongsTo(Product, { foreignKey: 'product_id' });

User.hasMany(StockLog, { foreignKey: 'created_by' });
StockLog.belongsTo(User, { foreignKey: 'created_by', as: 'creator' });

module.exports = {
  sequelize,
  User,
  Supplier,
  Customer,
  RawMaterial,
  Product,
  BOM,
  PurchaseOrder,
  POItem,
  WorkOrder,
  SalesOrder,
  SOItem,
  StockLog
};