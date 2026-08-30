const User = require('../models/User');
const Provider = require('../models/Provider');
const Booking = require('../models/Booking');
const Dispute = require('../models/Dispute');
const MaintenanceRequest = require('../models/MaintenanceRequest');

// @desc    Get admin dashboard overview metrics
// @route   GET /api/admin/dashboard
// @access  Private (Admin)
exports.getAdminDashboard = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({});
    const verifiedProviders = await Provider.countDocuments({ verified: true });
    const pendingProviders = await Provider.countDocuments({ verified: false });

    const activeBookings = await Booking.countDocuments({
      status: { $in: ['requested', 'accepted', 'in-progress', 'Booking Requested'] }
    });
    const completedJobs = await Booking.countDocuments({ status: 'completed' });

    // Calculate average provider rating
    const providers = await Provider.find({}, 'rating');
    let averageRating = 5.0;
    if (providers.length > 0) {
      const sum = providers.reduce((acc, p) => acc + (p.rating || 5.0), 0);
      averageRating = Math.round((sum / providers.length) * 10) / 10;
    }

    res.status(200).json({
      metrics: {
        totalUsers,
        verifiedProviders,
        pendingProviders,
        activeBookings,
        completedJobs,
        averageRating,
      }
    });
  } catch (error) {
    console.error('Admin dashboard error:', error);
    res.status(500).json({ error: 'Server error fetching admin dashboard' });
  }
};

// @desc    Get pending provider verification requests
// @route   GET /api/admin/providers/pending
// @access  Private (Admin)
exports.getPendingProviders = async (req, res) => {
  try {
    const pendingProviders = await Provider.find({ verified: false }).sort({ createdAt: -1 });
    res.status(200).json(pendingProviders);
  } catch (error) {
    console.error('Fetch pending providers error:', error);
    res.status(500).json({ error: 'Server error fetching pending providers' });
  }
};

// @desc    Approve or reject provider verification
// @route   PATCH /api/admin/providers/:id/verify
// @access  Private (Admin)
exports.verifyProvider = async (req, res) => {
  try {
    const { verified } = req.body;
    const provider = await Provider.findOne({
      $or: [
        { _id: req.params.id.match(/^[0-9a-fA-F]{24}$/) ? req.params.id : null },
        { slug: req.params.id }
      ].filter(Boolean)
    });

    if (!provider) {
      return res.status(404).json({ error: 'Provider not found' });
    }

    provider.verified = Boolean(verified);
    await provider.save();

    res.status(200).json({
      message: `Provider ${provider.name} verification updated to ${provider.verified}`,
      provider
    });
  } catch (error) {
    console.error('Verify provider error:', error);
    res.status(500).json({ error: 'Server error updating provider verification' });
  }
};

// @desc    Get all bookings for admin monitoring
// @route   GET /api/admin/bookings
// @access  Private (Admin)
exports.getAllBookings = async (req, res) => {
  try {
    const { status, service, date } = req.query;
    const query = {};

    if (status && status !== 'all') {
      if (status === 'requested') {
        query.status = { $in: ['requested', 'Booking Requested'] };
      } else {
        query.status = status;
      }
    }
    if (service && service !== 'all') {
      query.selectedService = { $regex: service, $options: 'i' };
    }
    if (date) {
      query.date = date;
    }

    const bookings = await Booking.find(query).sort({ createdAt: -1 });
    res.status(200).json(bookings);
  } catch (error) {
    console.error('Admin fetch bookings error:', error);
    res.status(500).json({ error: 'Server error fetching bookings' });
  }
};

// @desc    Get all customer disputes
// @route   GET /api/admin/disputes
// @access  Private (Admin)
exports.getDisputes = async (req, res) => {
  try {
    const disputes = await Dispute.find({}).sort({ createdAt: -1 });
    res.status(200).json(disputes);
  } catch (error) {
    console.error('Admin fetch disputes error:', error);
    res.status(500).json({ error: 'Server error fetching disputes' });
  }
};

// @desc    Update dispute status
// @route   PATCH /api/admin/disputes/:id
// @access  Private (Admin)
exports.updateDisputeStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!['Open', 'Under Review', 'Resolved'].includes(status)) {
      return res.status(400).json({ error: 'Invalid dispute status' });
    }

    const dispute = await Dispute.findOne({
      $or: [
        { disputeId: req.params.id },
        ...(req.params.id.match(/^[0-9a-fA-F]{24}$/) ? [{ _id: req.params.id }] : [])
      ]
    });

    if (!dispute) {
      return res.status(404).json({ error: 'Dispute not found' });
    }

    dispute.status = status;
    await dispute.save();

    res.status(200).json(dispute);
  } catch (error) {
    console.error('Update dispute error:', error);
    res.status(500).json({ error: 'Server error updating dispute' });
  }
};

// @desc    Get detailed system analytics
// @route   GET /api/admin/analytics
// @access  Private (Admin)
exports.getAnalytics = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({});
    const customersCount = await User.countDocuments({ role: 'customer' });
    const providersCount = await User.countDocuments({ role: 'provider' });

    const totalProviders = await Provider.countDocuments({});
    const verifiedProviders = await Provider.countDocuments({ verified: true });
    const pendingProviders = await Provider.countDocuments({ verified: false });

    const totalBookings = await Booking.countDocuments({});
    const completedBookings = await Booking.countDocuments({ status: 'completed' });
    const activeBookings = await Booking.countDocuments({ status: { $in: ['requested', 'accepted', 'in-progress', 'Booking Requested'] } });
    const cancelledBookings = await Booking.countDocuments({ status: 'cancelled' });

    const totalCommercialRequests = await MaintenanceRequest.countDocuments({});
    const completedCommercial = await MaintenanceRequest.countDocuments({ status: 'Completed' });

    const openDisputes = await Dispute.countDocuments({ status: { $ne: 'Resolved' } });

    res.status(200).json({
      users: { total: totalUsers, customers: customersCount, providers: providersCount },
      providers: { total: totalProviders, verified: verifiedProviders, pending: pendingProviders },
      bookings: { total: totalBookings, completed: completedBookings, active: activeBookings, cancelled: cancelledBookings },
      commercial: { total: totalCommercialRequests, completed: completedCommercial },
      disputes: { open: openDisputes }
    });
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ error: 'Server error fetching analytics' });
  }
};
