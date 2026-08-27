const Provider = require('../models/Provider');

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
    // Query by either object _id or slug
    const provider = await Provider.findOne({
      $or: [
        { slug: providerId },
        // Only try ObjectId if it's a valid 24 hex char string
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
