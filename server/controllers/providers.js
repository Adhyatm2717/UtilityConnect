const Provider = require('../models/Provider');
const Booking = require('../models/Booking');
const User = require('../models/User');

// @desc    Get all providers
// @route   GET /api/providers
// @access  Public
exports.getProviders = async (req, res) => {
  try {
    const providers = await Provider.find({});
    res.status(200).json(providers);
  } catch (error) {
    res.status(500).json({ error: 'Server error fetching providers' });
  }
};

// @desc    Get single provider
// @route   GET /api/providers/:id
// @access  Public
exports.getProvider = async (req, res) => {
  try {
    const providerId = req.params.id;
    const provider = await Provider.findOne({
      $or: [
        { slug: providerId },
        ...(providerId.match(/^[0-9a-fA-F]{24}$/) ? [{ _id: providerId }] : [])
      ]
    });

    if (!provider) {
      return res.status(404).json({ error: 'Provider not found' });
    }

    res.status(200).json(provider);
  } catch (error) {
    res.status(500).json({ error: 'Server error fetching provider' });
  }
};

// @desc    Get provider dashboard metrics
// @route   GET /api/providers/me/dashboard
// @access  Private (Provider)
exports.getProviderDashboard = async (req, res) => {
  try {
    let provider = await Provider.findOne({ userId: req.user.id });
    if (!provider) {
      // Auto-create Provider profile if user is provider but doc missing
      const user = await User.findById(req.user.id);
      if (!user || user.role !== 'provider') {
        return res.status(403).json({ error: 'Access denied' });
      }
      const slug = user.name.toLowerCase().replace(/\s+/g, '-') + '-' + Math.random().toString(36).substring(2, 6);
      provider = await Provider.create({
        userId: user._id,
        name: user.name,
        slug,
        service: 'Maintenance',
        serviceSlug: 'maintenance',
        experience: 2,
        skills: ['Maintenance'],
        pricing: 499,
        startingPrice: 499,
        rating: 5.0,
        reviewCount: 0,
        verified: true,
        availability: 'Available',
        location: 'Pune',
      });
    }

    // Find all bookings for this provider
    const jobs = await Booking.find({
      $or: [
        { providerId: provider._id },
        { providerId: provider._id.toString() },
        { providerSlug: provider.slug },
        { providerId: req.user.id }
      ]
    }).sort({ createdAt: -1 });

    const todayStr = new Date().toISOString().split('T')[0];
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    let todaysJobsCount = 0;
    let pendingRequestsCount = 0;
    let completedJobsCount = 0;
    let totalEarnings = 0;
    let todayEarnings = 0;
    let weekEarnings = 0;
    let monthEarnings = 0;

    jobs.forEach((job) => {
      const jobStatus = job.status === 'Booking Requested' ? 'requested' : job.status;
      const jobDateStr = job.date || (job.scheduledDate ? new Date(job.scheduledDate).toISOString().split('T')[0] : '');
      const jobCreatedAt = new Date(job.createdAt || job.scheduledDate || now);

      if (jobDateStr === todayStr) {
        todaysJobsCount++;
      }
      if (jobStatus === 'requested') {
        pendingRequestsCount++;
      }
      if (jobStatus === 'completed') {
        completedJobsCount++;
        const price = Number(job.estimatedPrice) || provider.pricing || 499;
        totalEarnings += price;

        if (jobDateStr === todayStr) {
          todayEarnings += price;
        }
        if (jobCreatedAt >= sevenDaysAgo) {
          weekEarnings += price;
        }
        if (jobCreatedAt >= startOfMonth) {
          monthEarnings += price;
        }
      }
    });

    res.status(200).json({
      provider,
      metrics: {
        todaysJobsCount,
        pendingRequestsCount,
        completedJobsCount,
        totalEarnings,
        todayEarnings,
        weekEarnings,
        monthEarnings,
        averageRating: provider.rating || 5.0,
        reviewCount: provider.reviewCount || 0,
        availability: provider.availability || 'Available',
      },
      jobs,
    });
  } catch (error) {
    console.error('Provider dashboard error:', error);
    res.status(500).json({ error: 'Server error loading provider dashboard' });
  }
};

// @desc    Toggle provider availability
// @route   PATCH /api/providers/me/availability
// @access  Private (Provider)
exports.toggleAvailability = async (req, res) => {
  try {
    const { availability } = req.body;
    if (!['Available', 'Unavailable'].includes(availability)) {
      return res.status(400).json({ error: 'Availability must be Available or Unavailable' });
    }

    let provider = await Provider.findOne({ userId: req.user.id });
    if (!provider) {
      return res.status(404).json({ error: 'Provider profile not found' });
    }

    provider.availability = availability;
    await provider.save();

    res.status(200).json({ availability: provider.availability, message: 'Availability updated successfully' });
  } catch (error) {
    console.error('Toggle availability error:', error);
    res.status(500).json({ error: 'Server error updating availability' });
  }
};

// @desc    Update provider profile
// @route   PUT /api/providers/me
// @access  Private (Provider)
exports.updateProviderProfile = async (req, res) => {
  try {
    const { name, phone, location, service, experience, skills, startingPrice, about } = req.body;
    let provider = await Provider.findOne({ userId: req.user.id });

    if (!provider) {
      return res.status(404).json({ error: 'Provider profile not found' });
    }

    if (name) provider.name = name;
    if (service) {
      provider.service = service;
      provider.serviceSlug = service.toLowerCase().replace(/\s+/g, '-');
    }
    if (experience !== undefined) provider.experience = Number(experience);
    if (skills) provider.skills = Array.isArray(skills) ? skills : skills.split(',').map((s) => s.trim());
    if (startingPrice !== undefined) {
      provider.startingPrice = Number(startingPrice);
      provider.pricing = Number(startingPrice);
    }
    if (location) provider.location = location;
    if (about) provider.about = about;

    await provider.save();

    // Also update User record if name or phone changed
    if (name || phone) {
      const user = await User.findById(req.user.id);
      if (user) {
        if (name) user.name = name;
        if (phone) user.phone = phone;
        await user.save();
      }
    }

    res.status(200).json(provider);
  } catch (error) {
    console.error('Update provider profile error:', error);
    res.status(500).json({ error: 'Server error updating profile' });
  }
};
