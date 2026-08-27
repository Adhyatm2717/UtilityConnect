const mongoose = require('mongoose');

const providerSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  slug: {
    type: String,
    required: true,
    unique: true,
  },
  name: String, // Kept for legacy compatibility without joins
  image: String,
  service: String,
  serviceSlug: String,
  experience: Number,
  skills: [String],
  pricing: Number, // Base/starting pricing
  startingPrice: Number, // Alias for pricing to match frontend
  rating: {
    type: Number,
    default: 0,
  },
  reviewCount: {
    type: Number,
    default: 0,
  },
  verified: {
    type: Boolean,
    default: false,
  },
  availability: {
    type: String,
    default: 'Available',
  },
  location: String,
  distance: Number,
  about: String,
  services: [
    {
      name: String,
      price: Number,
    }
  ],
}, { timestamps: true });

module.exports = mongoose.model('Provider', providerSchema);
