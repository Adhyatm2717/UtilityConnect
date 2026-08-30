const Dispute = require('../models/Dispute');
const Booking = require('../models/Booking');

// @desc    Raise a dispute on a booking
// @route   POST /api/disputes
// @access  Private (Customer)
exports.createDispute = async (req, res) => {
  try {
    const { bookingId, reason, description } = req.body;

    if (!bookingId || !reason || !description) {
      return res.status(400).json({ error: 'Booking ID, reason, and description are required' });
    }

    const booking = await Booking.findOne({
      $or: [
        { bookingId: bookingId },
        ...(bookingId.match(/^[0-9a-fA-F]{24}$/) ? [{ _id: bookingId }] : [])
      ]
    });

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    if (booking.customerId && booking.customerId.toString() !== req.user.id) {
      return res.status(403).json({ error: 'You can only raise disputes for your own bookings' });
    }

    const disputeId = 'DSP-' + Math.random().toString(36).substring(2, 8).toUpperCase();

    const newDispute = await Dispute.create({
      disputeId,
      bookingId: booking._id,
      customerId: req.user.id,
      providerId: booking.providerId,
      reason,
      description,
      status: 'Open',
    });

    res.status(201).json(newDispute);
  } catch (error) {
    console.error('Create dispute error:', error);
    res.status(500).json({ error: 'Server error creating dispute' });
  }
};

// @desc    Get current customer's disputes
// @route   GET /api/disputes/my
// @access  Private (Customer)
exports.getMyDisputes = async (req, res) => {
  try {
    const disputes = await Dispute.find({ customerId: req.user.id }).sort({ createdAt: -1 });
    res.status(200).json(disputes);
  } catch (error) {
    res.status(500).json({ error: 'Server error fetching disputes' });
  }
};
