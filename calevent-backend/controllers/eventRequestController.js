import EventRequest from '../models/EventRequest.js';
import Provider from '../models/Provider.js';

// ─── CUSTOMER ────────────────────────────────────────────────────────────────

export const createRequest = async (req, res) => {
  try {
    const customerId = req.user?.id;
    if (!customerId) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    const request = new EventRequest({ customerId, ...req.body });
    await request.save();

    res.status(201).json({
      success: true,
      message: "Request submitted! We'll contact you within 24 hours.",
      data: { request }
    });
  } catch (error) {
    console.error('Create request error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getMyRequests = async (req, res) => {
  try {
    const customerId = req.user?.id;
    if (!customerId) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    const requests = await EventRequest.find({ customerId })
      .sort({ createdAt: -1 });

    res.json({ success: true, data: { requests } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getMyRequestById = async (req, res) => {
  try {
    const customerId = req.user?.id;
    const request = await EventRequest.findOne({ _id: req.params.id, customerId })
      .populate('assignments.providerId', 'businessName name phone rating location');

    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }

    res.json({ success: true, data: { request, assignments: request.assignments } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const approveQuote = async (req, res) => {
  try {
    const customerId = req.user?.id;
    const request = await EventRequest.findOne({ _id: req.params.id, customerId });

    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }
    if (request.status !== 'quoted') {
      return res.status(400).json({ success: false, message: 'No quote to approve yet' });
    }

    request.status = 'approved';
    await request.save();

    res.json({ success: true, message: 'Quote approved! Your event is confirmed.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const cancelRequest = async (req, res) => {
  try {
    const customerId = req.user?.id;
    const request = await EventRequest.findOne({ _id: req.params.id, customerId });

    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }
    if (['completed', 'cancelled'].includes(request.status)) {
      return res.status(400).json({ success: false, message: 'Cannot cancel this request' });
    }

    request.status = 'cancelled';
    request.cancelReason = req.body.reason || 'Cancelled by customer';
    request.cancelledBy = 'customer';
    await request.save();

    res.json({ success: true, message: 'Request cancelled' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── ADMIN ───────────────────────────────────────────────────────────────────

export const adminGetAll = async (req, res) => {
  try {
    const { status = 'all', page = 1, limit = 20 } = req.query;
    const filter = {};
    if (status !== 'all') filter.status = status;

    const requests = await EventRequest.find(filter)
      .populate('customerId', 'name email phone')
      .populate('assignments.providerId', 'businessName name phone rating location')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await EventRequest.countDocuments(filter);

    // Status counts for filter badges
    const statusCounts = await EventRequest.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    res.json({
      success: true,
      data: {
        requests,
        statusCounts: statusCounts.reduce((acc, s) => ({ ...acc, [s._id]: s.count }), {}),
        pagination: { current: parseInt(page), pages: Math.ceil(total / limit), total }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const adminGetById = async (req, res) => {
  try {
    const request = await EventRequest.findById(req.params.id)
      .populate('customerId', 'name email phone')
      .populate('assignments.providerId', 'businessName name phone rating location categories');

    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }

    // Get available providers matching event type
    const availableProviders = await Provider.find({
      isActive: true,
      isVerified: true
    }).select('businessName name phone location categories rating');

    res.json({ success: true, data: { request, availableProviders } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const adminGetStats = async (req, res) => {
  try {
    const statusCounts = await EventRequest.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    const counts = statusCounts.reduce((acc, s) => ({ ...acc, [s._id]: s.count }), {});

    res.json({
      success: true,
      data: {
        total: await EventRequest.countDocuments(),
        pending: counts.pending || 0,
        inProgress: (counts.contacted || 0) + (counts.providers_assigned || 0) + (counts.quoted || 0) + (counts.approved || 0) + (counts.in_progress || 0),
        completed: counts.completed || 0,
        cancelled: counts.cancelled || 0,
        byStatus: counts
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const adminUpdateStatus = async (req, res) => {
  try {
    const { status, adminNotes } = req.body;
    const request = await EventRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }

    request.status = status;
    if (adminNotes) request.adminNotes = adminNotes;
    await request.save();

    res.json({ success: true, message: `Status updated to ${status}` });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const adminAssignProvider = async (req, res) => {
  try {
    const { providerId, serviceType, notes } = req.body;
    const request = await EventRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }

    const provider = await Provider.findOne({ _id: providerId, isActive: true, isVerified: true });
    if (!provider) {
      return res.status(404).json({ success: false, message: 'Provider not found or not verified' });
    }

    // Avoid duplicate assignment for same provider
    const alreadyAssigned = request.assignments.some(
      a => a.providerId.toString() === providerId
    );
    if (alreadyAssigned) {
      return res.status(400).json({ success: false, message: 'Provider already assigned' });
    }

    request.assignments.push({ providerId, serviceType, notes });
    request.status = 'providers_assigned';
    await request.save();

    const updated = await EventRequest.findById(req.params.id)
      .populate('customerId', 'name email phone')
      .populate('assignments.providerId', 'businessName name phone rating location');

    res.json({
      success: true,
      message: `${provider.businessName} assigned successfully`,
      data: { request: updated }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const adminRemoveAssignment = async (req, res) => {
  try {
    const request = await EventRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }

    request.assignments = request.assignments.filter(
      a => a._id.toString() !== req.params.assignmentId
    );
    if (request.assignments.length === 0) request.status = 'contacted';
    await request.save();

    res.json({ success: true, message: 'Assignment removed' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const adminCreateQuotation = async (req, res) => {
  try {
    const { totalAmount, breakdown, notes } = req.body;
    const request = await EventRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }

    request.quotation = { totalAmount, breakdown, notes, createdAt: new Date() };
    request.status = 'quoted';
    await request.save();

    res.json({ success: true, message: 'Quotation sent to customer' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const adminSearchProviders = async (req, res) => {
  try {
    const { category, city } = req.query;
    const filter = { isActive: true, isVerified: true };
    if (category) filter.categories = category;
    if (city) filter['location.city'] = new RegExp(city, 'i');

    const providers = await Provider.find(filter)
      .select('businessName name phone location categories rating profileImage')
      .limit(20);

    res.json({ success: true, data: providers });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── PROVIDER ────────────────────────────────────────────────────────────────

export const providerGetAssignments = async (req, res) => {
  try {
    const providerId = req.user?.id;
    const requests = await EventRequest.find({
      'assignments.providerId': providerId
    })
      .populate('customerId', 'name phone')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: { assignments: requests } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const providerRespond = async (req, res) => {
  try {
    const providerId = req.user?.id;
    const { status, notes } = req.body;

    const request = await EventRequest.findOne({
      'assignments._id': req.params.assignmentId,
      'assignments.providerId': providerId
    });

    if (!request) {
      return res.status(404).json({ success: false, message: 'Assignment not found' });
    }

    const assignment = request.assignments.id(req.params.assignmentId);
    assignment.status = status;
    if (notes) assignment.notes = notes;
    await request.save();

    res.json({ success: true, message: `Response recorded: ${status}` });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
