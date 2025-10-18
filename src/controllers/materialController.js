const { RawMaterial, Supplier } = require('../models');
const { paginationMeta, buildSearchQuery, exportToExcel } = require('../utils/helpers');
const { sequelize } = require('../utils/database');

// Get all materials with pagination and search
const getMaterials = async (req, res) => {
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
      Object.assign(whereClause, buildSearchQuery(['name', 'sku'], search));
    }
    
    // Get materials
    const { count, rows } = await RawMaterial.findAndCountAll({
      where: whereClause,
      include: [{ model: Supplier, attributes: ['id', 'name'] }],
      limit: pageLimit,
      offset,
      order: [['name', 'ASC']]
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

// Get material by ID
const getMaterialById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const material = await RawMaterial.findByPk(id, {
      include: [{ model: Supplier, attributes: ['id', 'name'] }]
    });
    
    if (!material) {
      return res.status(404).json({
        success: false,
        message: 'Material not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: material
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Create new material
const createMaterial = async (req, res) => {
  try {
    const material = await RawMaterial.create(req.body);
    
    res.status(201).json({
      success: true,
      message: 'Material created successfully',
      data: material
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Update material
const updateMaterial = async (req, res) => {
  try {
    const { id } = req.params;
    
    const material = await RawMaterial.findByPk(id);
    
    if (!material) {
      return res.status(404).json({
        success: false,
        message: 'Material not found'
      });
    }
    
    await material.update(req.body);
    
    res.status(200).json({
      success: true,
      message: 'Material updated successfully',
      data: material
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Delete material
const deleteMaterial = async (req, res) => {
  try {
    const { id } = req.params;
    
    const material = await RawMaterial.findByPk(id);
    
    if (!material) {
      return res.status(404).json({
        success: false,
        message: 'Material not found'
      });
    }
    
    await material.destroy();
    
    res.status(200).json({
      success: true,
      message: 'Material deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get low stock materials
const getLowStockMaterials = async (req, res) => {
  try {
    const materials = await RawMaterial.findAll({
      where: {
        [sequelize.Op.and]: [
          { stock: { [sequelize.Op.lte]: sequelize.col('min_stock') } },
          { status: 'active' }
        ]
      },
      include: [{ model: Supplier, attributes: ['id', 'name'] }],
      order: [['name', 'ASC']]
    });
    
    res.status(200).json({
      success: true,
      data: materials
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Export materials to Excel
const exportMaterials = async (req, res) => {
  try {
    const { status, supplier_id } = req.query;
    
    // Build where clause
    const whereClause = {};
    
    if (status) {
      whereClause.status = status;
    }
    
    if (supplier_id) {
      whereClause.supplier_id = supplier_id;
    }
    
    // Get materials
    const materials = await RawMaterial.findAll({
      where: whereClause,
      include: [{ model: Supplier, attributes: ['name'] }],
      order: [['name', 'ASC']]
    });
    
    // Format data for export
    const exportData = materials.map(material => ({
      SKU: material.sku,
      Name: material.name,
      Category: material.category,
      Unit: material.unit,
      'Unit Price': material.unit_price,
      Stock: material.stock,
      'Min Stock': material.min_stock,
      Supplier: material.Supplier ? material.Supplier.name : '',
      Status: material.status
    }));
    
    // Export to Excel
    const filename = `materials_${Date.now()}.xlsx`;
    exportToExcel(exportData, filename);
    
    // Send file
    res.download(filename, (err) => {
      if (err) {
        res.status(500).json({
          success: false,
          message: 'Error exporting file'
        });
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  getMaterials,
  getMaterialById,
  createMaterial,
  updateMaterial,
  deleteMaterial,
  getLowStockMaterials,
  exportMaterials
};