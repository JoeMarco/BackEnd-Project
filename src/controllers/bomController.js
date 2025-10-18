const { BOM, Product, RawMaterial } = require('../models');
const { paginationMeta, buildSearchQuery } = require('../utils/helpers');

// Get all BOM items with pagination and search
const getBOMs = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, product_id, material_id } = req.query;
    const { limit: pageLimit, offset } = paginate(page, limit);
    
    // Build where clause
    const whereClause = {};
    
    if (product_id) {
      whereClause.product_id = product_id;
    }
    
    if (material_id) {
      whereClause.material_id = material_id;
    }
    
    // Get BOM items
    const { count, rows } = await BOM.findAndCountAll({
      where: whereClause,
      include: [
        { model: Product, attributes: ['id', 'sku', 'name'] },
        { model: RawMaterial, attributes: ['id', 'sku', 'name', 'unit'] }
      ],
      limit: pageLimit,
      offset,
      order: [['product_id', 'ASC'], ['material_id', 'ASC']]
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

// Get BOM by ID
const getBOMById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const bom = await BOM.findByPk(id, {
      include: [
        { model: Product, attributes: ['id', 'sku', 'name'] },
        { model: RawMaterial, attributes: ['id', 'sku', 'name', 'unit'] }
      ]
    });
    
    if (!bom) {
      return res.status(404).json({
        success: false,
        message: 'BOM not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: bom
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Create new BOM
const createBOM = async (req, res) => {
  try {
    const bom = await BOM.create(req.body);
    
    // Get the created BOM with associations
    const newBOM = await BOM.findByPk(bom.id, {
      include: [
        { model: Product, attributes: ['id', 'sku', 'name'] },
        { model: RawMaterial, attributes: ['id', 'sku', 'name', 'unit'] }
      ]
    });
    
    res.status(201).json({
      success: true,
      message: 'BOM created successfully',
      data: newBOM
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Update BOM
const updateBOM = async (req, res) => {
  try {
    const { id } = req.params;
    
    const bom = await BOM.findByPk(id);
    
    if (!bom) {
      return res.status(404).json({
        success: false,
        message: 'BOM not found'
      });
    }
    
    await bom.update(req.body);
    
    // Get the updated BOM with associations
    const updatedBOM = await BOM.findByPk(id, {
      include: [
        { model: Product, attributes: ['id', 'sku', 'name'] },
        { model: RawMaterial, attributes: ['id', 'sku', 'name', 'unit'] }
      ]
    });
    
    res.status(200).json({
      success: true,
      message: 'BOM updated successfully',
      data: updatedBOM
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Delete BOM
const deleteBOM = async (req, res) => {
  try {
    const { id } = req.params;
    
    const bom = await BOM.findByPk(id);
    
    if (!bom) {
      return res.status(404).json({
        success: false,
        message: 'BOM not found'
      });
    }
    
    await bom.destroy();
    
    res.status(200).json({
      success: true,
      message: 'BOM deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get BOM by product ID
const getBOMByProductId = async (req, res) => {
  try {
    const { productId } = req.params;
    
    const bomItems = await BOM.findAll({
      where: { product_id: productId },
      include: [
        { model: Product, attributes: ['id', 'sku', 'name'] },
        { model: RawMaterial, attributes: ['id', 'sku', 'name', 'unit', 'stock'] }
      ],
      order: [['material_id', 'ASC']]
    });
    
    res.status(200).json({
      success: true,
      data: bomItems
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  getBOMs,
  getBOMById,
  createBOM,
  updateBOM,
  deleteBOM,
  getBOMByProductId
};