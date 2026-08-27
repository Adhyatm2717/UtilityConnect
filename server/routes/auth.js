const express = require('express');
const { register, registerCustomer, registerProvider, login, getMe } = require('../controllers/authController');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

router.post('/register', register);
router.post('/register/customer', registerCustomer);
router.post('/register/provider', registerProvider);
router.post('/login', login);
router.get('/me', verifyToken, getMe);

module.exports = router;
