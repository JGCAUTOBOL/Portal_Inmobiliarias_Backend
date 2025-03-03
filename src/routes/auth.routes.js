const express = require('express');
const router = express.Router();
const { validateEmail, validateCode, logout, getSolicitudes } = require('../controllers/auth.controller');
const authenticateToken = require('../middleware/authenticateToken');

router.post('/login', validateEmail);
router.post('/verify-code', validateCode);
router.post('/logout', logout);
router.post('/solicitudes', authenticateToken, getSolicitudes);

module.exports = router;