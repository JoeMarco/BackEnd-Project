const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../models');

// Login user
const login = async (req, res) => {
  console.log(req.body);
  console.log(">>> Inside login controller function!");
  try {
    const { username, password } = req.body;
    const cleanedUsername = username ? username.trim() : username;
    const cleanedPassword = password ? password.trim() : password;
    // Find user by username
    const user = await User.findOne({ where: { username: cleanedUsername } });
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }
    
    // Check if user is active
    if (!user.is_active) {
      return res.status(401).json({
        success: false,
        message: 'Account is disabled'
      });
    }
    
    // Check password
const isMatch = await bcrypt.compare(cleanedPassword, user.password);
    
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }
    
    // Create JWT token
    const payload = {
      id: user.id,
      username: user.username,
      role: user.role
    };
    
    const token = jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );
    
    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        user: {
          id: user.id,
          username: user.username,
          full_name: user.full_name,
          role: user.role,
          email: user.email
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get current user
const getMe = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password'] }
    });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Change password
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    // Get user
    const user = await User.findByPk(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Check current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }
    
    // Hash new password
    const salt = await bcrypt.genSalt(parseInt(process.env.BCRYPT_ROUNDS) || 10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    
    // Update password
    await user.update({ password: hashedPassword });
    
    res.status(200).json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// HANYA UNTUK DEBUG/SETUP (Buat hash baru di server)
const debugResetPassword = async (req, res) => {
  try {
    // Gunakan password yang sudah dibersihkan (dari logic login)
    const { username, password } = req.body;
    const cleanedUsername = username ? username.trim() : username;
    const cleanedPassword = password ? password.trim() : password;
    
    // Cari pengguna yang ada
    const user = await User.findOne({ where: { username: cleanedUsername } });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    // Buat hash baru menggunakan BCRYPT_ROUNDS dari ENV Railway
    const salt = await bcrypt.genSalt(parseInt(process.env.BCRYPT_ROUNDS) || 10);
    const newHashedPassword = await bcrypt.hash(cleanedPassword, salt);
    
    // Update password di database
    await user.update({ password: newHashedPassword });

    // Kirim respons
    res.status(200).json({
      success: true,
      message: 'Password has been safely re-hashed and saved.',
      new_hash: newHashedPassword 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  login,
  getMe,
  changePassword,
  debugResetPassword 
};