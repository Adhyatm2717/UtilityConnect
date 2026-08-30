const mongoose = require('mongoose');

const maintenanceRequestSchema = new mongoose.Schema({
  requestId: {
    type: String,
    required: true,
    unique: true,
  },
  mallName: {
    type: String,
    required: true,
  },
  floor: {
    type: String,
    required: true,
  },
  area: {
    type: String,
    required: true,
  },
  serviceType: {
    type: String,
    enum: ['Electrical', 'Plumbing', 'Carpentry', 'Maintenance'],
    required: true,
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Emergency'],
    default: 'Medium',
  },
  description: {
    type: String,
    required: true,
  },
  requestedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  requestedByName: String,
  assignedProvider: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Provider',
  },
  assignedProviderName: String,
  status: {
    type: String,
    enum: ['Requested', 'Assigned', 'In Progress', 'Completed', 'Cancelled'],
    default: 'Requested',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  completedAt: Date,
});

module.exports = mongoose.model('MaintenanceRequest', maintenanceRequestSchema);
