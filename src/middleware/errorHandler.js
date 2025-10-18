const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log error
  console.error(err);

  // Sequelize validation error
  if (err.name === 'SequelizeValidationError') {
    const message = Object.values(err.errors).map(val => val.message);
    error = {
      success: false,
      message: 'Validation Error',
      errors: message
    };
    return res.status(400).json(error);
  }

  // Sequelize unique constraint error
  if (err.name === 'SequelizeUniqueConstraintError') {
    const message = Object.values(err.errors).map(val => val.message);
    error = {
      success: false,
      message: 'Duplicate Entry',
      errors: message
    };
    return res.status(400).json(error);
  }

  // Sequelize foreign key constraint error
  if (err.name === 'SequelizeForeignKeyConstraintError') {
    error = {
      success: false,
      message: 'Reference Error. The referenced record does not exist.'
    };
    return res.status(400).json(error);
  }

  // JWT error
  if (err.name === 'JsonWebTokenError') {
    error = {
      success: false,
      message: 'Invalid token.'
    };
    return res.status(401).json(error);
  }

  // JWT expired error
  if (err.name === 'TokenExpiredError') {
    error = {
      success: false,
      message: 'Token expired.'
    };
    return res.status(401).json(error);
  }

  // Default error
  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || 'Server Error'
  });
};

module.exports = errorHandler;