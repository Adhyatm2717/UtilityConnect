const express = require('express');
const { createDispute, getMyDisputes } = require('../controllers/disputeController');
const { verifyToken, requireRole } = require('../middleware/auth');

const router = express.Router();

router.use(verifyToken);

router.post('/', requireRole('customer'), createDispute);
router.get('/my', requireRole('customer'), getMyDisputes);

module.exports = router;
