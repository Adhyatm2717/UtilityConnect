const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const Provider = require('../models/Provider');

// Helper to generate JWT
const generateToken = (user) => {
  const payload = {
    id: user._id,
    role: user.role,
    name: user.name,
    email: user.email,
  };
  const secret = process.env.JWT_SECRET || 'defaultsecret';
  const expiresIn = process.env.JWT_EXPIRES_IN || '7d';
  return jwt.sign(payload, secret, { expiresIn });
};

// @desc    Register user (customer or provider)
// @route   POST /api/auth/register
// @access  Public
const registerUserWithRole = (forcedRole) => [
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { name, email, phone, password, location, service } = req.body;
    const role = forcedRole || req.body.role || 'customer';

    try {
      const existing = await User.findOne({ email });
      if (existing) {
        return res.status(409).json({ error: 'User already exists with this email' });
      }
      const hashed = await bcrypt.hash(password, 10);
      const user = await User.create({
        name,
        email,
        phone,
        password: hashed,
        role: role === 'provider' ? 'provider' : 'customer',
        location,
      });

      let providerDoc = null;
      if (user.role === 'provider') {
        const serviceName = service || 'Electrician';
        const serviceSlug = serviceName.toLowerCase().replace(/\s+/g, '-');
        const slug = name.toLowerCase().replace(/\s+/g, '-') + '-' + Math.random().toString(36).substring(2, 6);
        const locStr = location?.city ? `${location.area || ''}, ${location.city}` : 'Pune';

        providerDoc = await Provider.create({
          userId: user._id,
          name: user.name,
          slug,
          service: serviceName,
          serviceSlug,
          experience: 3,
          skills: [serviceName, 'General Maintenance'],
          pricing: 499,
          startingPrice: 499,
          rating: 5.0,
          reviewCount: 0,
          verified: true,
          availability: 'Available',
          location: locStr,
          distance: 2.5,
          about: `Experienced ${serviceName} providing professional services.`,
          services: [
            { name: `${serviceName} Inspection & Repair`, price: 499 },
            { name: 'Standard Maintenance', price: 799 },
          ],
        });
      }

      const token = generateToken(user);
      const { password: _, ...userInfo } = user.toObject();
      res.status(201).json({
        token,
        user: { ...userInfo, providerId: providerDoc?._id || null }
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Server error during registration' });
    }
  },
];

exports.register = registerUserWithRole();
exports.registerCustomer = registerUserWithRole('customer');
exports.registerProvider = registerUserWithRole('provider');

// @desc    Login user (customer, provider, or admin)
// @route   POST /api/auth/login
// @access  Public
exports.login = [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').exists().withMessage('Password is required'),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { email, password } = req.body;
    try {
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }
      const token = generateToken(user);
      const { password: _, ...userInfo } = user.toObject();

      let providerId = null;
      if (user.role === 'provider') {
        const providerDoc = await Provider.findOne({ userId: user._id });
        if (providerDoc) {
          providerId = providerDoc._id;
        }
      }

      res.status(200).json({ token, user: { ...userInfo, providerId } });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Server error during login' });
    }
  },
];

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    let providerInfo = null;
    if (user.role === 'provider') {
      providerInfo = await Provider.findOne({ userId: user._id });
    }
    res.json({ user, provider: providerInfo });
  } catch (err) {
    res.status(500).json({ error: 'Server error fetching user profile' });
  }
};
