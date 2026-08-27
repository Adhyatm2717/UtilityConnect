const Service = require('../models/Service');

// @desc    Get all services
// @route   GET /api/services
// @access  Public
exports.getServices = async (req, res) => {
  try {
    const services = await Service.find({ active: true });
    res.status(200).json(services);
  } catch (error) {
    res.status(500).json({ error: 'Server error fetching services' });
  }
};
