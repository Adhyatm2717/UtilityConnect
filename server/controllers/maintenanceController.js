const MaintenanceRequest = require('../models/MaintenanceRequest');
const Provider = require('../models/Provider');
const User = require('../models/User');

// @desc    Create new commercial maintenance request
// @route   POST /api/maintenance
// @access  Private
exports.createMaintenanceRequest = async (req, res) => {
  try {
    const { mallName, floor, area, serviceType, priority = 'Medium', description } = req.body;

    if (!mallName || !floor || !area || !serviceType || !description) {
      return res.status(400).json({ error: 'Please provide all required fields' });
    }

    const requestId = 'MR-' + Math.random().toString(36).substring(2, 8).toUpperCase();
    const user = await User.findById(req.user.id);

    const newRequest = await MaintenanceRequest.create({
      requestId,
      mallName,
      floor,
      area,
      serviceType,
      priority,
      description,
      requestedBy: req.user.id,
      requestedByName: user ? user.name : 'Mall Manager',
      status: 'Requested',
    });

    res.status(201).json(newRequest);
  } catch (error) {
    console.error('Create maintenance request error:', error);
    res.status(500).json({ error: 'Server error creating maintenance request' });
  }
};

// @desc    Get all commercial maintenance requests
// @route   GET /api/maintenance
// @access  Private
exports.getMaintenanceRequests = async (req, res) => {
  try {
    const { status, priority, serviceType } = req.query;
    const query = {};

    if (status && status !== 'all') query.status = status;
    if (priority && priority !== 'all') query.priority = priority;
    if (serviceType && serviceType !== 'all') query.serviceType = serviceType;

    const requests = await MaintenanceRequest.find(query).sort({ createdAt: -1 });

    // Compute metrics
    const openRequestsCount = await MaintenanceRequest.countDocuments({ status: 'Requested' });
    const assignedRequestsCount = await MaintenanceRequest.countDocuments({ status: 'Assigned' });
    const inProgressCount = await MaintenanceRequest.countDocuments({ status: 'In Progress' });
    const completedCount = await MaintenanceRequest.countDocuments({ status: 'Completed' });
    const highPriorityCount = await MaintenanceRequest.countDocuments({ priority: { $in: ['High', 'Emergency'] } });

    res.status(200).json({
      metrics: {
        openRequestsCount,
        assignedRequestsCount,
        inProgressCount,
        completedCount,
        highPriorityCount,
      },
      requests,
    });
  } catch (error) {
    console.error('Get maintenance requests error:', error);
    res.status(500).json({ error: 'Server error fetching maintenance requests' });
  }
};

// @desc    Get single maintenance request detail
// @route   GET /api/maintenance/:id
// @access  Private
exports.getMaintenanceRequest = async (req, res) => {
  try {
    const request = await MaintenanceRequest.findOne({
      $or: [
        { requestId: req.params.id },
        ...(req.params.id.match(/^[0-9a-fA-F]{24}$/) ? [{ _id: req.params.id }] : [])
      ]
    });

    if (!request) {
      return res.status(404).json({ error: 'Maintenance request not found' });
    }

    res.status(200).json(request);
  } catch (error) {
    res.status(500).json({ error: 'Server error fetching maintenance request' });
  }
};

// @desc    Assign verified provider to maintenance request
// @route   PATCH /api/maintenance/:id/assign
// @access  Private
exports.assignProvider = async (req, res) => {
  try {
    const { providerId } = req.body;
    const request = await MaintenanceRequest.findOne({
      $or: [
        { requestId: req.params.id },
        ...(req.params.id.match(/^[0-9a-fA-F]{24}$/) ? [{ _id: req.params.id }] : [])
      ]
    });

    if (!request) {
      return res.status(404).json({ error: 'Maintenance request not found' });
    }

    // Verify provider exists and is verified
    const provider = await Provider.findOne({
      $or: [
        { _id: providerId.match(/^[0-9a-fA-F]{24}$/) ? providerId : null },
        { slug: providerId }
      ].filter(Boolean)
    });

    if (!provider) {
      return res.status(404).json({ error: 'Provider not found' });
    }

    if (!provider.verified) {
      return res.status(400).json({ error: 'Only verified providers can be assigned to commercial jobs' });
    }

    request.assignedProvider = provider._id;
    request.assignedProviderName = provider.name;
    request.status = 'Assigned';
    await request.save();

    res.status(200).json(request);
  } catch (error) {
    console.error('Assign provider error:', error);
    res.status(500).json({ error: 'Server error assigning provider' });
  }
};

// @desc    Update maintenance request status
// @route   PATCH /api/maintenance/:id/status
// @access  Private
exports.updateRequestStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const allowedStatuses = ['Requested', 'Assigned', 'In Progress', 'Completed', 'Cancelled'];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status value' });
    }

    const request = await MaintenanceRequest.findOne({
      $or: [
        { requestId: req.params.id },
        ...(req.params.id.match(/^[0-9a-fA-F]{24}$/) ? [{ _id: req.params.id }] : [])
      ]
    });

    if (!request) {
      return res.status(404).json({ error: 'Maintenance request not found' });
    }

    request.status = status;
    if (status === 'Completed') {
      request.completedAt = new Date();
    }
    await request.save();

    res.status(200).json(request);
  } catch (error) {
    console.error('Update request status error:', error);
    res.status(500).json({ error: 'Server error updating request status' });
  }
};
