const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { validateUser } = require('../middleware/validation');
const { login, getMe, changePassword } = require('../controllers/authController');

// Login
router.post('/login', login);

// Get current user
router.get('/me', authenticate, getMe);

// Change password
router.post('/change-password', authenticate, changePassword);

module.exports = router;