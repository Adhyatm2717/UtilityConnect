const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  bookingId: {
    type: String,
    required: true,
    unique: true,
  },
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  providerId: {
    type: mongoose.Schema.Types.Mixed, // Can be ObjectId or String for legacy ID
  },
  providerSlug: String,
  selectedService: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  location: {
    address: String,
    area: String,
    city: String,
    pin: String,
  },
  scheduleType: {
    type: String,
    enum: ['now', 'later'],
    default: 'now',
  },
  scheduledDate: Date,
  date: String, // Format: YYYY-MM-DD
  scheduledTime: String,
  timeSlot: String,
  estimatedPrice: Number,
  status: {
    type: String,
    enum: ['Booking Requested', 'requested', 'accepted', 'in-progress', 'completed', 'cancelled'],
    default: 'Booking Requested',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Booking', bookingSchema);
