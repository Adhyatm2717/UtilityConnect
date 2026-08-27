const Booking = require('../models/Booking');
const Provider = require('../models/Provider');

// @desc    Create new booking
// @route   POST /api/bookings
// @access  Private (Customer)
exports.createBooking = async (req, res) => {
  try {
    const { providerId, providerSlug, selectedService, description, location, scheduleType, scheduledDate, date, scheduledTime, timeSlot, estimatedPrice } = req.body;

    if (!providerId || !selectedService || !description || !location) {
      return res.status(400).json({ error: 'Please provide all required fields' });
    }

    // Verify provider exists
    const provider = await Provider.findOne({
      $or: [
        { slug: providerSlug || providerId },
        ...(providerId && providerId.match(/^[0-9a-fA-F]{24}$/) ? [{ _id: providerId }] : []),
        { _id: providerId }
      ]
    });

    const bookingId = 'UC-' + Math.random().toString(36).substring(2, 8).toUpperCase();

    const newBooking = await Booking.create({
      bookingId,
      customerId: req.user.id,
      providerId: provider ? provider._id : providerId,
      providerSlug: provider ? provider.slug : providerSlug,
      selectedService,
      description,
      location,
      scheduleType: scheduleType || 'now',
      scheduledDate: scheduledDate || (date ? new Date(date) : new Date()),
      date: date || new Date().toISOString().split('T')[0],
      scheduledTime: scheduledTime || timeSlot,
      timeSlot: timeSlot || scheduledTime,
      estimatedPrice: estimatedPrice || provider?.pricing || provider?.startingPrice || 499,
      status: 'requested'
    });

    res.status(201).json(newBooking);
  } catch (error) {
    console.error('Create booking error:', error);
    res.status(500).json({ error: 'Server error creating booking' });
  }
};

// @desc    Get current user's bookings (customer or provider)
// @route   GET /api/bookings/my
// @access  Private
exports.getMyBookings = async (req, res) => {
  try {
    let bookings = [];
    if (req.user.role === 'provider') {
      const provider = await Provider.findOne({ userId: req.user.id });
      if (!provider) {
        return res.status(200).json([]);
      }
      bookings = await Booking.find({
        $or: [
          { providerId: provider._id },
          { providerId: provider._id.toString() },
          { providerSlug: provider.slug },
          { providerId: req.user.id }
        ]
      }).sort({ createdAt: -1 });
    } else {
      bookings = await Booking.find({ customerId: req.user.id }).sort({ createdAt: -1 });
    }

    res.status(200).json(bookings);
  } catch (error) {
    console.error('Fetch my bookings error:', error);
    res.status(500).json({ error: 'Server error fetching bookings' });
  }
};

// @desc    Get single booking by ID or bookingId
// @route   GET /api/bookings/:id
// @access  Private
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

    // Ownership check
    const isCustomer = booking.customerId && booking.customerId.toString() === req.user.id;
    let isProvider = false;

    if (req.user.role === 'provider') {
      const provider = await Provider.findOne({ userId: req.user.id });
      if (provider) {
        isProvider = (
          (booking.providerId && booking.providerId.toString() === provider._id.toString()) ||
          booking.providerSlug === provider.slug
        );
      }
    }

    if (!isCustomer && !isProvider) {
      return res.status(403).json({ error: 'Access denied to this booking' });
    }

    res.status(200).json(booking);
  } catch (error) {
    console.error('Fetch booking detail error:', error);
    res.status(500).json({ error: 'Server error fetching booking' });
  }
};

// @desc    Update booking status
// @route   PATCH /api/bookings/:id/status
// @access  Private (Provider)
exports.updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const booking = await Booking.findOne({
      $or: [
        { bookingId: req.params.id },
        ...(req.params.id.match(/^[0-9a-fA-F]{24}$/) ? [{ _id: req.params.id }] : [])
      ]
    });

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    // Validate assigned provider
    const provider = await Provider.findOne({ userId: req.user.id });
    if (!provider) {
      return res.status(403).json({ error: 'Provider account not found' });
    }

    const isAssigned = (
      (booking.providerId && booking.providerId.toString() === provider._id.toString()) ||
      booking.providerSlug === provider.slug ||
      booking.providerId === req.user.id
    );

    if (!isAssigned) {
      return res.status(403).json({ error: 'You are not assigned to this booking' });
    }

    // Status state machine transition validation
    // Allowed transitions:
    // requested -> accepted | cancelled
    // accepted -> in-progress
    // in-progress -> completed
    const current = booking.status === 'Booking Requested' ? 'requested' : booking.status;

    const allowedTransitions = {
      requested: ['accepted', 'cancelled'],
      accepted: ['in-progress'],
      'in-progress': ['completed'],
      completed: [],
      cancelled: [],
    };

    const allowed = allowedTransitions[current] || [];
    if (!allowed.includes(status)) {
      return res.status(400).json({
        error: `Invalid status transition from '${current}' to '${status}'. Allowed: [${allowed.join(', ')}]`
      });
    }

    booking.status = status;
    await booking.save();

    res.status(200).json(booking);
  } catch (error) {
    console.error('Update status error:', error);
    res.status(500).json({ error: 'Server error updating booking status' });
  }
};
