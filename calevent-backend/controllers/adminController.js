import Admin from '../models/Admin.js';
import Provider from '../models/Provider.js';
import Customer from '../models/customer.js';
import Event from '../models/EventModel.js';
import Booking from '../models/Booking.js';
import jwt from 'jsonwebtoken';

// Admin Login
export const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const admin = await Admin.findOne({ email, isActive: true }).select('+password');
    if (!admin || !(await admin.comparePassword(password))) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
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
        admin: {
          id: admin._id,
          name: admin.name,
          email: admin.email,
          role: admin.role,
          permissions: admin.permissions
        },
        token
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get Dashboard Stats
export const getDashboardStats = async (req, res) => {
  try {
    const [
      totalProviders,
      pendingProviders,
      totalCustomers,
      totalEvents,
      totalBookings,
      monthlyRevenue
    ] = await Promise.all([
      Provider.countDocuments(),
      Provider.countDocuments({ isVerified: false }),
      Customer.countDocuments(),
      Event.countDocuments({ isActive: true }),
      Booking.countDocuments(),
      Booking.aggregate([
        { $match: { status: 'confirmed', createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } }
      ])
    ]);

    res.json({
      success: true,
      data: {
        providers: { total: totalProviders, pending: pendingProviders },
        customers: totalCustomers,
        events: totalEvents,
        bookings: totalBookings,
        revenue: monthlyRevenue[0]?.total || 0
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get Pending Providers
export const getPendingProviders = async (req, res) => {
  try {
    const providers = await Provider.find({ isVerified: false })
      .select('name businessName email phone categories location documents createdAt')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: providers });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Verify Provider
export const verifyProvider = async (req, res) => {
  try {
    const { providerId } = req.params;
    const { status, reason } = req.body; // 'approved' or 'rejected'

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
      provider.rejectionReason = reason;
    }

    await provider.save();

    res.json({
      success: true,
      message: `Provider ${status} successfully`,
      data: {
        providerId: provider._id,
        status: provider.verificationStatus,
        isActive: provider.isActive
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get All Users
export const getAllUsers = async (req, res) => {
  try {
    const { type = 'all', page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    let users = [];
    if (type === 'providers' || type === 'all') {
      const providers = await Provider.find()
        .select('name businessName email phone isVerified isActive createdAt')
        .sort({ createdAt: -1 })
        .skip(type === 'providers' ? skip : 0)
        .limit(type === 'providers' ? parseInt(limit) : 10);
      
      users.push(...providers.map(p => ({ ...p.toObject(), userType: 'provider' })));
    }

    if (type === 'customers' || type === 'all') {
      const customers = await Customer.find()
        .select('name email phone isActive createdAt')
        .sort({ createdAt: -1 })
        .skip(type === 'customers' ? skip : 0)
        .limit(type === 'customers' ? parseInt(limit) : 10);
      
      users.push(...customers.map(c => ({ ...c.toObject(), userType: 'customer' })));
    }

    res.json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Suspend/Activate User
export const toggleUserStatus = async (req, res) => {
  try {
    const { userId, userType } = req.params;
    const { action, reason } = req.body; // 'suspend' or 'activate'

    const Model = userType === 'provider' ? Provider : Customer;
    const user = await Model.findById(userId);
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.isActive = action === 'activate';
    if (action === 'suspend') {
      user.suspensionReason = reason;
    }

    await user.save();

    res.json({
      success: true,
      message: `User ${action}d successfully`
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get Platform Analytics
export const getAnalytics = async (req, res) => {
  try {
    const { period = '30' } = req.query;
    const days = parseInt(period);
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const [bookingTrends, categoryStats, revenueData] = await Promise.all([
      Booking.aggregate([
        { $match: { createdAt: { $gte: startDate } } },
        { $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 },
          revenue: { $sum: '$totalAmount' }
        }},
        { $sort: { _id: 1 } }
      ]),
      Event.aggregate([
        { $group: { _id: '$category', count: { $sum: 1 } } }
      ]),
      Booking.aggregate([
        { $match: { status: 'confirmed', createdAt: { $gte: startDate } } },
        { $group: { _id: null, total: { $sum: '$totalAmount' }, count: { $sum: 1 } } }
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