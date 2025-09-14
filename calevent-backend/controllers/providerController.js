import mongoose from 'mongoose';
import Provider from '../models/Provider.js';
import Event from '../models/EventModel.js';
import Booking from '../models/bookingModel.js';
import Follow from '../models/Follow.js';
import Message from '../models/Message.js';
import Review from '../models/Review.js';
import Customer from '../models/customer.js';
import { getFileUrl } from '../middleware/upload.js';

// Get all providers with filtering
export const getAllProviders = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 12,
      category,
      location,
      rating,
      verified,
      search
    } = req.query;

    // Build filter object
    const filter = { isActive: true };

    if (category && category !== 'all') {
      filter.categories = category;
    }

    if (location) {
      filter['location.city'] = new RegExp(location, 'i');
    }

    if (rating) {
      filter.rating = { $gte: parseFloat(rating) };
    }

    if (verified === 'true') {
      filter.isVerified = true;
    }

    if (search) {
      filter.$or = [
        { name: new RegExp(search, 'i') },
        { businessName: new RegExp(search, 'i') },
        { description: new RegExp(search, 'i') }
      ];
    }

    // Execute query with pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const providers = await Provider.find(filter)
      .select('-password -bankDetails -documents')
      .sort({ rating: -1, totalReviews: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count
    const totalProviders = await Provider.countDocuments(filter);
    const totalPages = Math.ceil(totalProviders / parseInt(limit));

    // Add full image URLs
    const providersWithUrls = providers.map(provider => {
      const providerObj = provider.toObject();
      if (providerObj.profileImage) {
        providerObj.profileImage = getFileUrl(req, providerObj.profileImage);
      }
      if (providerObj.coverImage) {
        providerObj.coverImage = getFileUrl(req, providerObj.coverImage);
      }
      return providerObj;
    });

    res.json({
      success: true,
      data: {
        providers: providersWithUrls,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalProviders,
          hasNextPage: parseInt(page) < totalPages,
          hasPrevPage: parseInt(page) > 1
        }
      }
    });
  } catch (error) {
    console.error('Get providers error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch providers',
      error: error.message
    });
  }
};

// Get provider dashboard stats
export const getProviderDashboardStats = async (req, res) => {
  try {
    const providerId = req.user.id;

    // Get basic stats
    const [
      totalEvents,
      totalBookings,
      pendingBookings,
      completedBookings,
      totalRevenue,
      recentBookings,
      followersCount,
      reviewsCount
    ] = await Promise.all([
      Event.countDocuments({ providerId, isActive: true }),
      Booking.countDocuments({ providerId }),
      Booking.countDocuments({ providerId, status: 'pending' }),
      Booking.countDocuments({ providerId, status: 'completed' }),
      Booking.aggregate([
        { $match: { providerId: providerId, 'payment.status': 'paid' } },
        { $group: { _id: null, total: { $sum: '$pricing.totalAmount' } } }
      ]),
      Booking.find({ providerId })
        .populate('eventId', 'title')
        .populate('customerId', 'name email phone')
        .sort({ createdAt: -1 })
        .limit(5),
      Follow.countDocuments({ providerId }),
      Review.countDocuments({ providerId })
    ]);

    // Get monthly revenue data (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyRevenue = await Booking.aggregate([
      {
        $match: {
          providerId: providerId,
          'payment.status': 'paid',
          createdAt: { $gte: sixMonthsAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          revenue: { $sum: '$pricing.totalAmount' },
          bookings: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    // Get category-wise booking distribution
    const categoryStats = await Booking.aggregate([
      { $match: { providerId: providerId } },
      { $group: { _id: '$eventType', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    res.json({
      success: true,
      data: {
        overview: {
          totalEvents,
          totalBookings,
          pendingBookings,
          completedBookings,
          totalRevenue: totalRevenue[0]?.total || 0,
          followersCount,
          reviewsCount
        },
        recentBookings,
        monthlyRevenue,
        categoryStats
      }
    });
  } catch (error) {
    console.error('Get provider dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard stats',
      error: error.message
    });
  }
};

// Get provider's events grouped by category
export const getProviderEventsByCategory = async (req, res) => {
  try {
    const providerId = req.user.id;

    const eventsByCategory = await Event.aggregate([
      { $match: { providerId: providerId, isActive: true } },
      {
        $group: {
          _id: '$category',
          events: {
            $push: {
              id: '$_id',
              title: '$title',
              price: '$price',
              rating: '$rating',
              bookingCount: '$bookingCount',
              eventImage: '$eventImage'
            }
          },
          count: { $sum: 1 },
          avgPrice: { $avg: '$price' },
          totalBookings: { $sum: '$bookingCount' }
        }
      },
      { $sort: { count: -1 } }
    ]);

    // Add full image URLs
    const eventsWithUrls = eventsByCategory.map(category => ({
      ...category,
      events: category.events.map(event => ({
        ...event,
        eventImage: getFileUrl(req, event.eventImage)
      }))
    }));

    res.json({
      success: true,
      data: { eventsByCategory: eventsWithUrls }
    });
  } catch (error) {
    console.error('Get provider events by category error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch events by category',
      error: error.message
    });
  }
};

// Enhanced search for provider events
export const searchProviderEvents = async (req, res) => {
  try {
    const { search, category, status = 'active' } = req.query;
    const providerId = req.user.id;

    // Build filter
    const filter = { providerId };
    
    if (status === 'active') {
      filter.isActive = true;
    } else if (status === 'inactive') {
      filter.isActive = false;
    }

    if (category && category !== 'all') {
      filter.category = category;
    }

    if (search) {
      filter.$or = [
        { title: new RegExp(search, 'i') },
        { description: new RegExp(search, 'i') },
        { tags: new RegExp(search, 'i') }
      ];
    }

    const events = await Event.find(filter)
      .select('title description category price rating bookingCount eventImage isActive createdAt')
      .sort({ createdAt: -1 });

    // Add full image URLs and provider names
    const eventsWithDetails = events.map(event => {
      const eventObj = event.toObject();
      eventObj.eventImage = getFileUrl(req, eventObj.eventImage);
      return eventObj;
    });

    res.json({
      success: true,
      data: {
        events: eventsWithDetails,
        totalFound: events.length
      }
    });
  } catch (error) {
    console.error('Search provider events error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search events',
      error: error.message
    });
  }
};

// Get current provider's own profile (authenticated)
export const getMyProfile = async (req, res) => {
  try {
    const providerId = req.user.id;

    const provider = await Provider.findById(providerId)
      .select('-password -bankDetails -documents')
      .lean();

    if (!provider) {
      return res.status(404).json({
        success: false,
        message: 'Provider not found'
      });
    }

    // Add full image URLs
    if (provider.profileImage) {
      provider.profileImage = getFileUrl(req, provider.profileImage);
    }
    if (provider.coverImage) {
      provider.coverImage = getFileUrl(req, provider.coverImage);
    }

    res.json({
      success: true,
      data: provider
    });
  } catch (error) {
    console.error('Get my profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch profile',
      error: error.message
    });
  }
};

// Get provider profile by ID (public)
export const getProviderProfile = async (req, res) => {
  try {
    const { id } = req.params;

    const provider = await Provider.findById(id)
      .select('-password -bankDetails -documents')
      .lean();

    if (!provider || !provider.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Provider not found'
      });
    }

    // Get provider's events
    const events = await Event.find({ providerId: id, isActive: true })
      .select('title description category price rating reviewCount eventImage')
      .sort({ rating: -1, createdAt: -1 })
      .limit(6);

    // Get reviews from Review model
    const reviews = await Review.find({ providerId: id })
      .populate('customerId', 'name profileImage')
      .sort({ createdAt: -1 })
      .limit(5);

    // Get follower count
    const followersCount = await Follow.countDocuments({ providerId: id });

    // Update provider with aggregated review data
    const reviewStats = await Review.aggregate([
      { $match: { providerId: new mongoose.Types.ObjectId(id) } },
      { $group: { 
        _id: null, 
        avgRating: { $avg: '$rating' },
        totalReviews: { $sum: 1 }
      }}
    ]);

    if (reviewStats.length > 0) {
      await Provider.findByIdAndUpdate(id, {
        rating: Math.round(reviewStats[0].avgRating * 10) / 10,
        totalReviews: reviewStats[0].totalReviews,
        followersCount
      });
    }

    // Add full image URLs
    if (provider.profileImage) {
      provider.profileImage = getFileUrl(req, provider.profileImage);
    }
    if (provider.coverImage) {
      provider.coverImage = getFileUrl(req, provider.coverImage);
    }

    const eventsWithUrls = events.map(event => ({
      ...event.toObject(),
      eventImage: getFileUrl(req, event.eventImage)
    }));

    res.json({
      success: true,
      data: {
        provider,
        events: eventsWithUrls,
        reviews: reviews.map(review => ({
          customerName: review.customerId?.name,
          customerImage: review.customerId?.profileImage ? getFileUrl(req, review.customerId.profileImage) : null,
          rating: review.rating,
          comment: review.comment,
          eventType: review.eventType,
          date: review.createdAt
        })),
        followersCount
      }
    });
  } catch (error) {
    console.error('Get provider profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch provider profile',
      error: error.message
    });
  }
};

// Get top providers - real registered providers from database
export const getTopProviders = async (req, res) => {
  try {
    const { limit = 6 } = req.query;

    // Get real providers from database, sorted by best metrics
    const topProviders = await Provider.find({ isActive: true })
      .select('-password -bankDetails -documents')
      .sort({ rating: -1, totalReviews: -1, totalBookings: -1 })
      .limit(parseInt(limit));

    // Add full image URLs
    const providersWithUrls = topProviders.map(provider => {
      const providerObj = provider.toObject();
      if (providerObj.profileImage) {
        providerObj.profileImage = getFileUrl(req, providerObj.profileImage);
      }
      if (providerObj.coverImage) {
        providerObj.coverImage = getFileUrl(req, providerObj.coverImage);
      }
      return providerObj;
    });

    res.json({
      success: true,
      data: {
        providers: providersWithUrls,
        totalFound: topProviders.length
      }
    });
  } catch (error) {
    console.error('Get top providers error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch top providers',
      error: error.message
    });
  }
};

// Update provider profile
export const updateProviderProfile = async (req, res) => {
  try {
    const providerId = req.user.id;
    const updateData = { ...req.body };

    // Handle file uploads
    if (req.files) {
      if (req.files.profileImage) {
        updateData.profileImage = req.files.profileImage[0].path;
      }
      if (req.files.coverImage) {
        updateData.coverImage = req.files.coverImage[0].path;
      }
    }

    // Handle JSON fields
    if (updateData.categories && typeof updateData.categories === 'string') {
      updateData.categories = JSON.parse(updateData.categories);
    }
    if (updateData.socialMedia && typeof updateData.socialMedia === 'string') {
      updateData.socialMedia = JSON.parse(updateData.socialMedia);
    }
    if (updateData.location && typeof updateData.location === 'string') {
      updateData.location = JSON.parse(updateData.location);
    }

    const updatedProvider = await Provider.findByIdAndUpdate(
      providerId,
      updateData,
      { new: true, runValidators: true }
    ).select('-password -bankDetails -documents');

    // Add full image URLs
    const providerObj = updatedProvider.toObject();
    if (providerObj.profileImage) {
      providerObj.profileImage = getFileUrl(req, providerObj.profileImage);
    }
    if (providerObj.coverImage) {
      providerObj.coverImage = getFileUrl(req, providerObj.coverImage);
    }

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: { provider: providerObj }
    });
  } catch (error) {
    console.error('Update provider profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile',
      error: error.message
    });
  }
};

// Get followers
export const getFollowers = async (req, res) => {
  try {
    const providerId = req.user.id;
    const { page = 1, limit = 10 } = req.query;
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const [followers, totalCount] = await Promise.all([
      Follow.find({ providerId })
        .populate('customerId', 'name email profileImage createdAt')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Follow.countDocuments({ providerId })
    ]);
    
    const followersWithUrls = followers.map(follow => ({
      ...follow.toObject(),
      customerId: {
        ...follow.customerId.toObject(),
        profileImage: follow.customerId?.profileImage ? getFileUrl(req, follow.customerId.profileImage) : null
      }
    }));
    
    res.json({ 
      success: true, 
      data: { 
        followers: followersWithUrls,
        totalCount,
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalCount / parseInt(limit))
      } 
    });
  } catch (error) {
    console.error('Get followers error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get messages
export const getMessages = async (req, res) => {
  try {
    const providerId = req.user.id;
    const { status } = req.query;
    
    let filter = { providerId };
    if (status === 'unread') filter.isRead = false;
    if (status === 'read') filter.isRead = true;
    
    const messages = await Message.find(filter)
      .populate('customerId', 'name email phone profileImage')
      .sort({ createdAt: -1 });
    
    const messagesWithCustomerData = messages.map(msg => ({
      ...msg.toObject(),
      customerName: msg.customerId?.name,
      customerEmail: msg.customerId?.email,
      customerPhone: msg.customerId?.phone,
      customerImage: msg.customerId?.profileImage
    }));
    
    res.json({ success: true, data: { messages: messagesWithCustomerData } });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Reply to message
export const replyToMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { message } = req.body;
    const providerId = req.user.id;
    
    const conversation = await Message.findOneAndUpdate(
      { _id: messageId, providerId },
      { 
        $push: { 
          replies: { 
            message, 
            isProvider: true, 
            createdAt: new Date() 
          } 
        },
        isRead: true,
        updatedAt: new Date()
      },
      { new: true }
    ).populate('customerId', 'name email phone profileImage');
    
    if (!conversation) {
      return res.status(404).json({ message: 'Message not found' });
    }
    
    res.json({ success: true, data: conversation });
  } catch (error) {
    console.error('Reply to message error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Mark message as read
export const markMessageAsRead = async (req, res) => {
  try {
    const { messageId } = req.params;
    const providerId = req.user.id;
    
    await Message.findOneAndUpdate(
      { _id: messageId, providerId },
      { isRead: true }
    );
    
    res.json({ success: true, message: 'Marked as read' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Get provider reviews
export const getProviderReviews = async (req, res) => {
  try {
    const providerId = req.user.id;
    const { page = 1, limit = 10 } = req.query;
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const [reviews, totalCount] = await Promise.all([
      Review.find({ providerId })
        .populate('customerId', 'name profileImage')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Review.countDocuments({ providerId })
    ]);
    
    const reviewsWithUrls = reviews.map(review => ({
      ...review.toObject(),
      customerId: {
        ...review.customerId.toObject(),
        profileImage: review.customerId?.profileImage ? getFileUrl(req, review.customerId.profileImage) : null
      }
    }));
    
    // Get rating distribution
    const ratingDistribution = await Review.aggregate([
      { $match: { providerId: new mongoose.Types.ObjectId(providerId) } },
      { $group: { _id: '$rating', count: { $sum: 1 } } },
      { $sort: { _id: -1 } }
    ]);
    
    res.json({ 
      success: true, 
      data: { 
        reviews: reviewsWithUrls,
        totalCount,
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalCount / parseInt(limit)),
        ratingDistribution
      } 
    });
  } catch (error) {
    console.error('Get provider reviews error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};