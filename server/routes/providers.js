const express = require('express');
const {
  getProviders,
  getProvider,
  getProviderDashboard,
  toggleAvailability,
  updateProviderProfile,
} = require('../controllers/providers');
const { verifyToken, requireRole } = require('../middleware/auth');

const router = express.Router();

router.get('/', getProviders);
router.get('/me/dashboard', verifyToken, requireRole('provider'), getProviderDashboard);
router.patch('/me/availability', verifyToken, requireRole('provider'), toggleAvailability);
router.put('/me', verifyToken, requireRole('provider'), updateProviderProfile);
router.get('/:id', getProvider);

module.exports = router;
