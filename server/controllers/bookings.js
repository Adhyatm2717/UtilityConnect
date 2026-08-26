// In-memory mock data for bookings
let bookings = [];

// @desc    Create new booking
// @route   POST /api/bookings
// @access  Public
exports.createBooking = (req, res) => {
  const { providerId, selectedService, description, location, scheduleType, date, timeSlot } = req.body;

  // Basic validation
  if (!providerId || !selectedService || !description || !location || !scheduleType) {
    return res.status(400).json({ error: 'Please provide all required fields' });
  }

  const bookingId = 'UC-' + Math.random().toString(36).substring(2, 8).toUpperCase();

  const newBooking = {
    id: bookingId, // Use bookingId as the primary identifier
    bookingId,
    providerId,
    selectedService,
    description,
    location,
    scheduleType,
    date,
    timeSlot,
    status: 'Booking Requested',
    createdAt: new Date().toISOString()
  };

  bookings.push(newBooking);

  res.status(201).json(newBooking);
};

// @desc    Get single booking
// @route   GET /api/bookings/:id
// @access  Public
exports.getBooking = (req, res) => {
  const booking = bookings.find(b => b.id === req.params.id || b.bookingId === req.params.id);

  if (!booking) {
    return res.status(404).json({ error: 'Booking not found' });
  }

  res.status(200).json(booking);
};
