const { PurchaseOrder, POItem, Supplier, RawMaterial, User } = require('../models');
const { paginate, paginationMeta, buildSearchQuery, generateOrderNumber, updateStock, logStockMovement } = require('../utils/helpers');
const { sequelize } = require('../utils/database');

// Get all purchase orders with pagination and search
const getPurchaseOrders = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, status, supplier_id } = req.query;
    const { limit: pageLimit, offset } = paginate(page, limit);
    
    // Build where clause
    const whereClause = {};
    
    if (status) {
      whereClause.status = status;
    }
    
    if (supplier_id) {
      whereClause.supplier_id = supplier_id;
    }
    
    if (search) {
      Object.assign(whereClause, buildSearchQuery(['po_number'], search));
    }
    
    // Get purchase orders
    const { count, rows } = await PurchaseOrder.findAndCountAll({
      where: whereClause,
      include: [
        { model: Supplier, attributes: ['id', 'name'] },
        { model: User, as: 'creator', attributes: ['id', 'full_name'] }
      ],
      limit: pageLimit,
      offset,
      order: [['order_date', 'DESC']]
    });
    
    // Send response
    res.status(200).json({
      success: true,
      data: rows,
      meta: paginationMeta(page, limit, count)
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get purchase order by ID
const getPurchaseOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const purchaseOrder = await PurchaseOrder.findByPk(id, {
      include: [
        { model: Supplier },
        { model: User, as: 'creator', attributes: ['id', 'full_name'] },
        {
          model: POItem,
          include: [{ model: RawMaterial }]
        }
      ]
    });
    
    if (!purchaseOrder) {
      return res.status(404).json({
        success: false,
        message: 'Purchase order not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: purchaseOrder
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Create new purchase order
const createPurchaseOrder = async (req, res) => {
  const t = await sequelize.transaction();
  
  try {
    const { items, ...orderData } = req.body;
    
    // Generate PO number if not provided
    if (!orderData.po_number) {
      orderData.po_number = generateOrderNumber('PO');
    }
    
    // Set created_by
    orderData.created_by = req.user.id;
    
    // Create purchase order
    const purchaseOrder = await PurchaseOrder.create(orderData, { transaction });
    
    // Create PO items and calculate total
    let total = 0;
    const poItems = [];
    
    for (const item of items) {
      const subtotal = item.quantity * item.price;
      total += subtotal;
      
      const poItem = await POItem.create({
        po_id: purchaseOrder.id,
        material_id: item.material_id,
        quantity: item.quantity,
        price: item.price,
        subtotal
      }, { transaction });
      
      poItems.push(poItem);
    }
    
    // Update total
    await purchaseOrder.update({ total }, { transaction });
    
    // Commit transaction
    await t.commit();
    
    // Get the created purchase order with associations
    const newPurchaseOrder = await PurchaseOrder.findByPk(purchaseOrder.id, {
      include: [
        { model: Supplier },
        { model: User, as: 'creator', attributes: ['id', 'full_name'] },
        {
          model: POItem,
          include: [{ model: RawMaterial }]
        }
      ]
    });
    
    res.status(201).json({
      success: true,
      message: 'Purchase order created successfully',
      data: newPurchaseOrder
    });
  } catch (error) {
    await t.rollback();
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Update purchase order
const updatePurchaseOrder = async (req, res) => {
  const t = await sequelize.transaction();
  
  try {
    const { id } = req.params;
    const { items, ...orderData } = req.body;
    
    // Find purchase order
    const purchaseOrder = await PurchaseOrder.findByPk(id, { transaction });
    
    if (!purchaseOrder) {
      await t.rollback();
      return res.status(404).json({
        success: false,
        message: 'Purchase order not found'
      });
    }
    
    // Check if purchase order can be updated
    if (purchaseOrder.status === 'received' || purchaseOrder.status === 'cancelled') {
      await t.rollback();
      return res.status(400).json({
        success: false,
        message: 'Cannot update purchase order with status received or cancelled'
      });
    }
    
    // Update purchase order
    await purchaseOrder.update(orderData, { transaction });
    
    // If items are provided, update them
    if (items) {
      // Delete existing items
      await POItem.destroy({
        where: { po_id: id },
        transaction
      });
      
      // Create new items and calculate total
      let total = 0;
      
      for (const item of items) {
        const subtotal = item.quantity * item.price;
        total += subtotal;
        
        await POItem.create({
          po_id: id,
          material_id: item.material_id,
          quantity: item.quantity,
          price: item.price,
          subtotal
        }, { transaction });
      }
      
      // Update total
      await purchaseOrder.update({ total }, { transaction });
    }
    
    // Commit transaction
    await t.commit();
    
    // Get the updated purchase order with associations
    const updatedPurchaseOrder = await PurchaseOrder.findByPk(id, {
      include: [
        { model: Supplier },
        { model: User, as: 'creator', attributes: ['id', 'full_name'] },
        {
          model: POItem,
          include: [{ model: RawMaterial }]
        }
      ]
    });
    
    res.status(200).json({
      success: true,
      message: 'Purchase order updated successfully',
      data: updatedPurchaseOrder
    });
  } catch (error) {
    await t.rollback();
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Delete purchase order
const deletePurchaseOrder = async (req, res) => {
  const t = await sequelize.transaction();
  
  try {
    const { id } = req.params;
    
    // Find purchase order
    const purchaseOrder = await PurchaseOrder.findByPk(id, { transaction });
    
    if (!purchaseOrder) {
      await t.rollback();
      return res.status(404).json({
        success: false,
        message: 'Purchase order not found'
      });
    }
    
    // Check if purchase order can be deleted
    if (purchaseOrder.status === 'received') {
      await t.rollback();
      return res.status(400).json({
        success: false,
        message: 'Cannot delete purchase order with status received'
      });
    }
    
    // Delete purchase order (cascade will delete PO items)
    await purchaseOrder.destroy({ transaction });
    
    // Commit transaction
    await t.commit();
    
    res.status(200).json({
      success: true,
      message: 'Purchase order deleted successfully'
    });
  } catch (error) {
    await t.rollback();
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Receive purchase order
const receivePurchaseOrder = async (req, res) => {
  const t = await sequelize.transaction();
  
  try {
    const { id } = req.params;
    
    // Find purchase order with items
    const purchaseOrder = await PurchaseOrder.findByPk(id, {
      include: [{ model: POItem, include: [{ model: RawMaterial }] }],
      transaction
    });
    
    if (!purchaseOrder) {
      await t.rollback();
      return res.status(404).json({
        success: false,
        message: 'Purchase order not found'
      });
    }
    
    // Check if purchase order can be received
    if (purchaseOrder.status !== 'approved') {
      await t.rollback();
      return res.status(400).json({
        success: false,
        message: 'Cannot receive purchase order with status not approved'
      });
    }
    
    // Update stock for each item
    for (const item of purchaseOrder.POItems) {
      await updateStock(
        'material',
        item.material_id,
        'in',
        item.quantity,
        t
      );
      
      // Log stock movement
      await logStockMovement(
        'material',
        item.material_id,
        'in',
        item.quantity,
        'PO',
        purchaseOrder.id,
        `Received from PO: ${purchaseOrder.po_number}`,
        req.user.id,
        t
      );
    }
    
    // Update purchase order status
    await purchaseOrder.update({ status: 'received' }, { transaction });
    
    // Commit transaction
    await t.commit();
    
    res.status(200).json({
      success: true,
      message: 'Purchase order received successfully',
      data: purchaseOrder
    });
  } catch (error) {
    await t.rollback();
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Approve purchase order
const approvePurchaseOrder = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Find purchase order
    const purchaseOrder = await PurchaseOrder.findByPk(id);
    
    if (!purchaseOrder) {
      return res.status(404).json({
        success: false,
        message: 'Purchase order not found'
      });
    }
    
    // Check if purchase order can be approved
    if (purchaseOrder.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Cannot approve purchase order with status not pending'
      });
    }
    
    // Update purchase order status
    await purchaseOrder.update({ status: 'approved' });
    
    res.status(200).json({
      success: true,
      message: 'Purchase order approved successfully',
      data: purchaseOrder
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Cancel purchase order
const cancelPurchaseOrder = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Find purchase order
    const purchaseOrder = await PurchaseOrder.findByPk(id);
    
    if (!purchaseOrder) {
      return res.status(404).json({
        success: false,
        message: 'Purchase order not found'
      });
    }
    
    // Check if purchase order can be cancelled
    if (purchaseOrder.status === 'received') {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel purchase order with status received'
      });
    }
    
    // Update purchase order status
    await purchaseOrder.update({ status: 'cancelled' });
    
    res.status(200).json({
      success: true,
      message: 'Purchase order cancelled successfully',
      data: purchaseOrder
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  getPurchaseOrders,
  getPurchaseOrderById,
  createPurchaseOrder,
  updatePurchaseOrder,
  deletePurchaseOrder,
  receivePurchaseOrder,
  approvePurchaseOrder,
  cancelPurchaseOrder
};