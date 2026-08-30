const express = require('express');
const {
  getAdminDashboard,
  getPendingProviders,
  verifyProvider,
  getAllBookings,
  getDisputes,
  updateDisputeStatus,
  getAnalytics,
} = require('../controllers/adminController');
const { verifyToken, requireRole } = require('../middleware/auth');

const router = express.Router();

// All admin routes require admin authentication
router.use(verifyToken, requireRole('admin'));

router.get('/dashboard', getAdminDashboard);
router.get('/providers/pending', getPendingProviders);
router.patch('/providers/:id/verify', verifyProvider);
router.get('/bookings', getAllBookings);
router.get('/disputes', getDisputes);
router.patch('/disputes/:id', updateDisputeStatus);
router.get('/analytics', getAnalytics);

module.exports = router;
