const Review = require('../models/Review');
const Booking = require('../models/Booking');
const Provider = require('../models/Provider');

// @desc    Create review for completed booking
// @route   POST /api/reviews
// @access  Private (Customer)
exports.createReview = async (req, res) => {
  try {
    const { bookingId, rating, comment } = req.body;

    if (!bookingId || !rating) {
      return res.status(400).json({ error: 'Booking ID and rating are required' });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }

    // Find booking
    const booking = await Booking.findOne({
      $or: [
        { bookingId: bookingId },
        ...(bookingId.match(/^[0-9a-fA-F]{24}$/) ? [{ _id: bookingId }] : [])
      ]
    });

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    // Check ownership
    if (!booking.customerId || booking.customerId.toString() !== req.user.id) {
      return res.status(403).json({ error: 'You can only review your own booking' });
    }

    // Check status is completed
    if (booking.status !== 'completed') {
      return res.status(400).json({ error: 'Only completed bookings can be reviewed' });
    }

    // Check duplicate review
    const existingReview = await Review.findOne({ bookingId: booking._id });
    if (existingReview) {
      return res.status(409).json({ error: 'Review already submitted for this booking' });
    }

    // Find provider
    const provider = await Provider.findOne({
      $or: [
        { slug: booking.providerSlug },
        ...(booking.providerId && booking.providerId.toString().match(/^[0-9a-fA-F]{24}$/) ? [{ _id: booking.providerId }] : [])
      ]
    });

    const newReview = await Review.create({
      bookingId: booking._id,
      customerId: req.user.id,
      providerId: provider ? provider._id : booking.providerId,
      rating: Number(rating),
      comment: comment || '',
    });

    // Update provider rating & reviewCount if provider exists
    if (provider) {
      const allReviews = await Review.find({ providerId: provider._id });
      const totalRating = allReviews.reduce((acc, r) => acc + r.rating, 0);
      const avgRating = totalRating / allReviews.length;
      provider.rating = Math.round(avgRating * 10) / 10;
      provider.reviewCount = allReviews.length;
      await provider.save();
    }

    res.status(201).json(newReview);
  } catch (error) {
    console.error('Create review error:', error);
    res.status(500).json({ error: 'Server error submitting review' });
  }
};

// @desc    Get review for a booking
// @route   GET /api/reviews/booking/:bookingId
// @access  Private
exports.getReviewByBooking = async (req, res) => {
  try {
    const booking = await Booking.findOne({
      $or: [
        { bookingId: req.params.bookingId },
        ...(req.params.bookingId.match(/^[0-9a-fA-F]{24}$/) ? [{ _id: req.params.bookingId }] : [])
      ]
    });

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    const review = await Review.findOne({ bookingId: booking._id });
    res.status(200).json(review || null);
  } catch (error) {
    res.status(500).json({ error: 'Server error fetching review' });
  }
};
