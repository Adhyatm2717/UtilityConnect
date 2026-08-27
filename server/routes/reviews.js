const express = require('express');
const { createReview, getReviewByBooking } = require('../controllers/reviews');
const { verifyToken, requireRole } = require('../middleware/auth');

const router = express.Router();

router.post('/', verifyToken, requireRole('customer'), createReview);
router.get('/booking/:bookingId', verifyToken, getReviewByBooking);

module.exports = router;
