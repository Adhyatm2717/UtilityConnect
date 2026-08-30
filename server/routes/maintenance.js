const express = require('express');
const {
  createMaintenanceRequest,
  getMaintenanceRequests,
  getMaintenanceRequest,
  assignProvider,
  updateRequestStatus,
} = require('../controllers/maintenanceController');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

router.use(verifyToken);

router.post('/', createMaintenanceRequest);
router.get('/', getMaintenanceRequests);
router.get('/:id', getMaintenanceRequest);
router.patch('/:id/assign', assignProvider);
router.patch('/:id/status', updateRequestStatus);

module.exports = router;
