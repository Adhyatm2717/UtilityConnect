const providers = require('../data/providers');

// @desc    Get all providers
// @route   GET /api/providers
// @access  Public
exports.getProviders = (req, res) => {
  res.status(200).json(providers);
};

// @desc    Get single provider
// @route   GET /api/providers/:id
// @access  Public
exports.getProvider = (req, res) => {
  const providerId = req.params.id;
  // Check if ID is a number or a slug
  const isNumeric = !isNaN(providerId);

  const provider = providers.find(p => 
    isNumeric ? p.id === parseInt(providerId) : p.slug === providerId
  );

  if (!provider) {
    return res.status(404).json({ error: 'Provider not found' });
  }

  res.status(200).json(provider);
};
