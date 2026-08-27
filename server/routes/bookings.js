const express = require('express');
const { createBooking, getMyBookings, getBooking, updateBookingStatus } = require('../controllers/bookings');
const { verifyToken, requireRole } = require('../middleware/auth');

const router = express.Router();

router.route('/')
  .post(verifyToken, requireRole('customer'), createBooking);

router.route('/my')
  .get(verifyToken, getMyBookings);

router.route('/:id')
  .get(verifyToken, getBooking);

router.route('/:id/status')
  .patch(verifyToken, requireRole('provider'), updateBookingStatus);

module.exports = router;
