const express = require('express');
const { createBooking, getBooking } = require('../controllers/bookings');

const router = express.Router();

router.route('/').post(createBooking);
router.route('/:id').get(getBooking);

module.exports = router;
