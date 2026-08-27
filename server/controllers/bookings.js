const Booking = require('../models/Booking');

// @desc    Create new booking
// @route   POST /api/bookings
// @access  Public
exports.createBooking = async (req, res) => {
  try {
    const { providerId, selectedService, description, location, scheduleType, date, timeSlot } = req.body;

    // Basic validation
    if (!providerId || !selectedService || !description || !location || !scheduleType) {
      return res.status(400).json({ error: 'Please provide all required fields' });
    }

    const bookingId = 'UC-' + Math.random().toString(36).substring(2, 8).toUpperCase();

    const newBooking = await Booking.create({
      bookingId,
      providerId,
      selectedService,
      description,
      location,
      scheduleType,
      date,
      timeSlot,
      status: 'Booking Requested'
    });

    res.status(201).json(newBooking);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error creating booking' });
  }
};

// @desc    Get single booking
// @route   GET /api/bookings/:id
// @access  Public
exports.getBooking = async (req, res) => {
  try {
    const booking = await Booking.findOne({
      $or: [
        { bookingId: req.params.id },
        ...(req.params.id.match(/^[0-9a-fA-F]{24}$/) ? [{ _id: req.params.id }] : [])
      ]
    });

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    res.status(200).json(booking);
  } catch (error) {
    res.status(500).json({ error: 'Server error fetching booking' });
  }
};
