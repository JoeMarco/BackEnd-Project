const { Supplier } = require('../models');
const { paginate, paginationMeta, buildSearchQuery, exportToExcel } = require('../utils/helpers');

// Get all suppliers with pagination and search
const getSuppliers = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, status } = req.query;
    const { limit: pageLimit, offset } = paginate(page, limit);
    
    // Build where clause
    const whereClause = {};
    
    if (status) {
      whereClause.status = status;
    }
    
    if (search) {
      Object.assign(whereClause, buildSearchQuery(['name', 'contact', 'phone'], search));
    }
    
    // Get suppliers
    const { count, rows } = await Supplier.findAndCountAll({
      where: whereClause,
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

// Get supplier by ID
const getSupplierById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const supplier = await Supplier.findByPk(id);
    
    if (!supplier) {
      return res.status(404).json({
        success: false,
        message: 'Supplier not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: supplier
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Create new supplier
const createSupplier = async (req, res) => {
  try {
    const supplier = await Supplier.create(req.body);
    
    res.status(201).json({
      success: true,
      message: 'Supplier created successfully',
      data: supplier
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Update supplier
const updateSupplier = async (req, res) => {
  try {
    const { id } = req.params;
    
    const supplier = await Supplier.findByPk(id);
    
    if (!supplier) {
      return res.status(404).json({
        success: false,
        message: 'Supplier not found'
      });
    }
    
    await supplier.update(req.body);
    
    res.status(200).json({
      success: true,
      message: 'Supplier updated successfully',
      data: supplier
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Delete supplier
const deleteSupplier = async (req, res) => {
  try {
    const { id } = req.params;
    
    const supplier = await Supplier.findByPk(id);
    
    if (!supplier) {
      return res.status(404).json({
        success: false,
        message: 'Supplier not found'
      });
    }
    
    await supplier.destroy();
    
    res.status(200).json({
      success: true,
      message: 'Supplier deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Export suppliers to Excel
const exportSuppliers = async (req, res) => {
  try {
    const { status } = req.query;
    
    // Build where clause
    const whereClause = {};
    
    if (status) {
      whereClause.status = status;
    }
    
    // Get suppliers
    const suppliers = await Supplier.findAll({
      where: whereClause,
      order: [['name', 'ASC']]
    });
    
    // Format data for export
    const exportData = suppliers.map(supplier => ({
      Name: supplier.name,
      Contact: supplier.contact,
      Phone: supplier.phone,
      Address: supplier.address,
      Status: supplier.status
    }));
    
    // Export to Excel
    const filename = `suppliers_${Date.now()}.xlsx`;
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
  getSuppliers,
  getSupplierById,
  createSupplier,
  updateSupplier,
  deleteSupplier,
  exportSuppliers
};