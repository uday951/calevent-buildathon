import Admin from '../models/Admin.js';
import Provider from '../models/Provider.js';
import Customer from '../models/customer.js';
import Event from '../models/EventModel.js';
import Booking from '../models/bookingModel.js';
import jwt from 'jsonwebtoken';

// ─── AUTH ────────────────────────────────────────────────────────────────────

export const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const admin = await Admin.findOne({ email, isActive: true }).select('+password');

    if (!admin || !(await admin.comparePassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    admin.lastLogin = new Date();
    await admin.save();

    const token = jwt.sign(
      { id: admin._id, role: 'admin', permissions: admin.permissions },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      data: {
        admin: { id: admin._id, name: admin.name, email: admin.email, role: admin.role },
        token
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── DASHBOARD ───────────────────────────────────────────────────────────────

export const getDashboardStats = async (req, res) => {
  try {
    const [
      totalProviders,
      pendingProviders,
      totalCustomers,
      totalEvents,
      totalBookings,
      pendingBookings,
      monthlyRevenue
    ] = await Promise.all([
      Provider.countDocuments({ isActive: true }),
      Provider.countDocuments({ verificationStatus: 'pending' }),
      Customer.countDocuments(),
      Event.countDocuments({ isActive: true }),
      Booking.countDocuments(),
      Booking.countDocuments({ adminStatus: 'pending_review' }),
      Booking.aggregate([
        {
          $match: {
            adminStatus: 'completed',
            completedAt: { $exists: true, $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
          }
        },
        { $group: { _id: null, total: { $sum: '$pricing.totalAmount' } } }
      ])
    ]);

    res.json({
      success: true,
      data: {
        providers: { total: totalProviders, pending: pendingProviders },
        customers: totalCustomers,
        events: totalEvents,
        bookings: { total: totalBookings, pending: pendingBookings },
        revenue: monthlyRevenue[0]?.total || 0
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── PROVIDER VERIFICATION ───────────────────────────────────────────────────

export const getPendingProviders = async (req, res) => {
  try {
    const providers = await Provider.find({ verificationStatus: 'pending' })
      .select('name businessName email phone categories location description createdAt')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: providers });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAllProviders = async (req, res) => {
  try {
    const { status = 'all' } = req.query;
    const filter = {};
    if (status === 'approved') filter.verificationStatus = 'approved';
    else if (status === 'pending') filter.verificationStatus = 'pending';
    else if (status === 'rejected') filter.verificationStatus = 'rejected';

    const providers = await Provider.find(filter)
      .select('name businessName email phone categories location isVerified isActive verificationStatus createdAt')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: providers });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const verifyProvider = async (req, res) => {
  try {
    const { providerId } = req.params;
    const { status, reason } = req.body;

    const provider = await Provider.findById(providerId);
    if (!provider) {
      return res.status(404).json({ success: false, message: 'Provider not found' });
    }

    if (status === 'approved') {
      provider.isVerified = true;
      provider.isActive = true;
      provider.verificationStatus = 'approved';
      provider.verifiedAt = new Date();
      provider.verifiedBy = req.admin._id;
    } else {
      provider.isActive = false;
      provider.isVerified = false;
      provider.verificationStatus = 'rejected';
      provider.rejectionReason = reason || 'Application rejected by admin';
    }

    await provider.save();

    res.json({
      success: true,
      message: `Provider ${status} successfully`,
      data: { providerId: provider._id, status: provider.verificationStatus }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── BOOKING MANAGEMENT ──────────────────────────────────────────────────────

export const getAllBookings = async (req, res) => {
  try {
    const { adminStatus = 'all', page = 1, limit = 20 } = req.query;
    const filter = {};
    if (adminStatus !== 'all') filter.adminStatus = adminStatus;

    const bookings = await Booking.find(filter)
      .populate('customerId', 'name email phone')
      .populate('eventId', 'title category eventImage')
      .populate('assignedProvider', 'businessName name phone location')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Booking.countDocuments(filter);

    const statusCounts = await Booking.aggregate([
      { $group: { _id: '$adminStatus', count: { $sum: 1 } } }
    ]);

    res.json({
      success: true,
      data: {
        bookings,
        statusCounts: statusCounts.reduce((acc, s) => ({ ...acc, [s._id]: s.count }), {}),
        pagination: { current: parseInt(page), pages: Math.ceil(total / limit), total }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.bookingId)
      .populate('customerId', 'name email phone')
      .populate('eventId', 'title category eventImage price')
      .populate('assignedProvider', 'businessName name phone email location categories profileImage');

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    // Get available providers for this event type
    const availableProviders = await Provider.find({
      categories: booking.eventType,
      isActive: true,
      isVerified: true
    }).select('businessName name phone location categories rating');

    res.json({ success: true, data: { booking, availableProviders } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const assignProvider = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { providerId, adminNotes } = req.body;

    const [booking, provider] = await Promise.all([
      Booking.findById(bookingId),
      Provider.findOne({ _id: providerId, isActive: true, isVerified: true })
    ]);

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }
    if (!provider) {
      return res.status(404).json({ success: false, message: 'Provider not found or not verified' });
    }

    booking.assignedProvider = providerId;
    booking.adminStatus = 'provider_assigned';
    booking.status = 'confirmed';
    booking.adminNotes = adminNotes || '';
    booking.assignedAt = new Date();
    booking.assignedBy = req.admin._id;
    booking.timeline.push({
      status: 'provider_assigned',
      message: `Provider "${provider.businessName}" assigned by admin`
    });

    await booking.save();

    const updated = await Booking.findById(bookingId)
      .populate('customerId', 'name email phone')
      .populate('eventId', 'title category')
      .populate('assignedProvider', 'businessName name phone location');

    res.json({
      success: true,
      message: `Provider "${provider.businessName}" assigned successfully`,
      data: { booking: updated }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateBookingAdminStatus = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { adminStatus, adminNotes } = req.body;

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    booking.adminStatus = adminStatus;
    if (adminNotes) booking.adminNotes = adminNotes;

    // Sync status field
    const statusMap = {
      pending_review: 'pending',
      provider_assigned: 'confirmed',
      confirmed: 'confirmed',
      in_progress: 'in-progress',
      completed: 'completed',
      cancelled: 'cancelled'
    };
    booking.status = statusMap[adminStatus] || booking.status;
    if (adminStatus === 'completed') booking.completedAt = new Date();

    booking.timeline.push({ status: adminStatus, message: `Admin updated status to ${adminStatus}` });
    await booking.save();

    res.json({ success: true, message: `Booking status updated to ${adminStatus}` });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── USER MANAGEMENT ─────────────────────────────────────────────────────────

export const getAllUsers = async (req, res) => {
  try {
    const { type = 'customers', page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    if (type === 'providers') {
      const providers = await Provider.find()
        .select('name businessName email phone isVerified isActive verificationStatus categories createdAt')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));
      const total = await Provider.countDocuments();
      return res.json({ success: true, data: providers, total });
    }

    const customers = await Customer.find()
      .select('name email phone isActive createdAt')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    const total = await Customer.countDocuments();
    res.json({ success: true, data: customers, total });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const toggleUserStatus = async (req, res) => {
  try {
    const { userId, userType } = req.params;
    const { action, reason } = req.body;

    const Model = userType === 'provider' ? Provider : Customer;
    const user = await Model.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.isActive = action === 'activate';
    if (action === 'suspend') user.suspensionReason = reason;
    await user.save();

    res.json({ success: true, message: `User ${action}d successfully` });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── ADMIN EVENT MANAGEMENT ──────────────────────────────────────────────────

export const createAdminEvent = async (req, res) => {
  try {
    const eventData = { ...req.body, createdBy: 'admin', providerId: null };
    
    if (req.file) {
      eventData.eventImage = req.file.path;
    }

    const event = new Event(eventData);
    await event.save();

    res.status(201).json({
      success: true,
      message: 'Admin event created successfully',
      data: { event }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateAdminEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    const event = await Event.findOne({ _id: eventId, createdBy: 'admin' });

    if (!event) {
      return res.status(404).json({ success: false, message: 'Admin event not found' });
    }

    const updateData = { ...req.body };
    if (req.file) {
      updateData.eventImage = req.file.path;
    }

    const updatedEvent = await Event.findByIdAndUpdate(eventId, updateData, { new: true });

    res.json({
      success: true,
      message: 'Admin event updated successfully',
      data: { event: updatedEvent }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteAdminEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    const event = await Event.findOne({ _id: eventId, createdBy: 'admin' });

    if (!event) {
      return res.status(404).json({ success: false, message: 'Admin event not found' });
    }

    event.isActive = false;
    await event.save();

    res.json({ success: true, message: 'Admin event deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAllAdminEvents = async (req, res) => {
  try {
    const { page = 1, limit = 20, category, isActive = 'true' } = req.query;
    const filter = { createdBy: 'admin' };
    
    if (category && category !== 'all') filter.category = category;
    if (isActive !== 'all') filter.isActive = isActive === 'true';

    const events = await Event.find(filter)
      .sort({ createdAt: -1 })
      .skip((parseInt(page) - 1) * parseInt(limit))
      .limit(parseInt(limit));

    const total = await Event.countDocuments(filter);

    res.json({
      success: true,
      data: {
        events,
        pagination: { current: parseInt(page), pages: Math.ceil(total / limit), total }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── ANALYTICS ───────────────────────────────────────────────────────────────

export const getAnalytics = async (req, res) => {
  try {
    const { period = '30' } = req.query;
    const startDate = new Date(Date.now() - parseInt(period) * 24 * 60 * 60 * 1000);

    const [bookingTrends, categoryStats, revenueData] = await Promise.all([
      Booking.aggregate([
        { $match: { createdAt: { $gte: startDate } } },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            count: { $sum: 1 },
            revenue: { $sum: '$pricing.totalAmount' }
          }
        },
        { $sort: { _id: 1 } }
      ]),
      Booking.aggregate([
        { $group: { _id: '$eventType', count: { $sum: 1 } } }
      ]),
      Booking.aggregate([
        { $match: { adminStatus: 'completed', createdAt: { $gte: startDate } } },
        { $group: { _id: null, total: { $sum: '$pricing.totalAmount' }, count: { $sum: 1 } } }
      ])
    ]);

    res.json({
      success: true,
      data: {
        bookingTrends,
        categoryStats,
        revenue: revenueData[0] || { total: 0, count: 0 }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
