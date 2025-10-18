const { Customer } = require('../models');
const { paginate, paginationMeta, buildSearchQuery, exportToExcel } = require('../utils/helpers');

// Get all customers with pagination and search
const getCustomers = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, status, type } = req.query;
    const { limit: pageLimit, offset } = paginate(page, limit);
    
    // Build where clause
    const whereClause = {};
    
    if (status) {
      whereClause.status = status;
    }
    
    if (type) {
      whereClause.type = type;
    }
    
    if (search) {
      Object.assign(whereClause, buildSearchQuery(['name', 'contact', 'phone'], search));
    }
    
    // Get customers
    const { count, rows } = await Customer.findAndCountAll({
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

// Get customer by ID
const getCustomerById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const customer = await Customer.findByPk(id);
    
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: customer
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Create new customer
const createCustomer = async (req, res) => {
  try {
    const customer = await Customer.create(req.body);
    
    res.status(201).json({
      success: true,
      message: 'Customer created successfully',
      data: customer
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Update customer
const updateCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    
    const customer = await Customer.findByPk(id);
    
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }
    
    await customer.update(req.body);
    
    res.status(200).json({
      success: true,
      message: 'Customer updated successfully',
      data: customer
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Delete customer
const deleteCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    
    const customer = await Customer.findByPk(id);
    
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }
    
    await customer.destroy();
    
    res.status(200).json({
      success: true,
      message: 'Customer deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Export customers to Excel
const exportCustomers = async (req, res) => {
  try {
    const { status, type } = req.query;
    
    // Build where clause
    const whereClause = {};
    
    if (status) {
      whereClause.status = status;
    }
    
    if (type) {
      whereClause.type = type;
    }
    
    // Get customers
    const customers = await Customer.findAll({
      where: whereClause,
      order: [['name', 'ASC']]
    });
    
    // Format data for export
    const exportData = customers.map(customer => ({
      Name: customer.name,
      Contact: customer.contact,
      Phone: customer.phone,
      Address: customer.address,
      Type: customer.type,
      Status: customer.status
    }));
    
    // Export to Excel
    const filename = `customers_${Date.now()}.xlsx`;
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
  getCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  exportCustomers
};