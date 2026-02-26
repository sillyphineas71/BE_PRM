const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const authMiddleware = require('../middleware/auth.middleware');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/users/me', authMiddleware, authController.getProfile); 
router.put('/users/me', authMiddleware, authController.updateProfile);

module.exports = router;