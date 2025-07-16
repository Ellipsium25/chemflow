const express = require('express');
const authController = require('../middleware/authController');
const authMiddleware = require('../middleware/auth');

const router = express.Router();


// Public routes
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/guest', authController.guest);

// Protected routes
router.get('/me', authMiddleware, authController.me);
router.post('/logout', authMiddleware, authController.logout);

module.exports = router;