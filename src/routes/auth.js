const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { validateUser } = require('../middleware/validation');
const { login, getMe, changePassword, debugResetPassword } = require('../controllers/authController');

console.log(">>> Loading src/routes/auth.js ...");

// Login
console.log(">>> Defining POST /login route...");
router.post('/login', login);

router.post('/debug-reset', debugResetPassword);

// Get current user
router.get('/me', authenticate, getMe);

// Change password
router.post('/change-password', authenticate, changePassword);

module.exports = router;