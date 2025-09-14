import mongoose from 'mongoose';
import Customer from '../models/customer.js';
import Booking from '../models/bookingModel.js';
import Follow from '../models/Follow.js';
import Review from '../models/Review.js';
import Message from '../models/Message.js';
import Provider from '../models/Provider.js';
import { uploadToCloudinary } from '../services/uploadService.js';
import { getFileUrl } from '../middleware/upload.js';

// Get customer profile
export const getCustomerProfile = async (req, res) => {
  try {
    const customer = await Customer.findById(req.user.id).select('-password');
    
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    // Add full image URL
    const customerObj = customer.toObject();
    if (customerObj.profileImage) {
      customerObj.profileImage = getFileUrl(req, customerObj.profileImage);
    }

    res.json({
      success: true,
      data: customerObj
    });
  } catch (error) {
    console.error('Get customer profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update customer profile
export const updateCustomerProfile = async (req, res) => {
  try {
    const { name, phone, address, dateOfBirth, preferences } = req.body;
    
    const updateData = {
      name,
      phone,
      address,
      dateOfBirth,
      preferences: preferences ? JSON.parse(preferences) : undefined
    };

    // Handle profile image upload
    if (req.files?.profileImage) {
      updateData.profileImage = req.files.profileImage[0].path;
    }

    const customer = await Customer.findByIdAndUpdate(
      req.user.id,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select('-password');

    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    // Add full image URL
    const customerObj = customer.toObject();
    if (customerObj.profileImage) {
      customerObj.profileImage = getFileUrl(req, customerObj.profileImage);
    }

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: customerObj
    });
  } catch (error) {
    console.error('Update customer profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get customer stats
export const getCustomerStats = async (req, res) => {
  try {
    const customerId = req.user.id;

    const [totalBookings, upcomingEvents, completedBookings] = await Promise.all([
      Booking.countDocuments({ customer: customerId }),
      Booking.countDocuments({ 
        customer: customerId, 
        status: 'confirmed',
        eventDate: { $gte: new Date() }
      }),
      Booking.countDocuments({ 
        customer: customerId, 
        status: 'completed'
      })
    ]);

    // Get customer join date
    const customer = await Customer.findById(customerId).select('createdAt');
    const memberSince = customer?.createdAt;

    res.json({
      success: true,
      data: {
        totalBookings,
        upcomingEvents,
        completedBookings,
        memberSince
      }
    });
  } catch (error) {
    console.error('Get customer stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Follow provider
export const followProvider = async (req, res) => {
  try {
    const { providerId } = req.params;
    const customerId = req.user.id;

    const existingFollow = await Follow.findOne({ customerId, providerId });
    if (existingFollow) {
      return res.status(400).json({ message: 'Already following this provider' });
    }

    await Follow.create({ customerId, providerId });
    res.json({ success: true, message: 'Provider followed successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Unfollow provider
export const unfollowProvider = async (req, res) => {
  try {
    const { providerId } = req.params;
    const customerId = req.user.id;

    await Follow.findOneAndDelete({ customerId, providerId });
    res.json({ success: true, message: 'Provider unfollowed successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Check follow status
export const checkFollowStatus = async (req, res) => {
  try {
    const { providerId } = req.params;
    const customerId = req.user.id;

    const follow = await Follow.findOne({ customerId, providerId });
    res.json({ success: true, data: { isFollowing: !!follow } });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Get followed providers
export const getFollowedProviders = async (req, res) => {
  try {
    const customerId = req.user.id;
    const follows = await Follow.find({ customerId }).populate('providerId');
    res.json({ success: true, data: follows });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Add review
export const addReview = async (req, res) => {
  try {
    const { providerId } = req.params;
    const { rating, comment } = req.body;
    const customerId = req.user.id;

    const existingReview = await Review.findOne({ customerId, providerId });
    if (existingReview) {
      return res.status(400).json({ message: 'You have already reviewed this provider' });
    }

    const review = await Review.create({
      customerId,
      providerId,
      rating,
      comment
    });

    // Update provider's average rating and review count
    const reviewStats = await Review.aggregate([
      { $match: { providerId: new mongoose.Types.ObjectId(providerId) } },
      { $group: { 
        _id: null, 
        avgRating: { $avg: '$rating' },
        totalReviews: { $sum: 1 }
      }}
    ]);

    if (reviewStats.length > 0) {
      await Provider.findByIdAndUpdate(providerId, {
        rating: Math.round(reviewStats[0].avgRating * 10) / 10,
        totalReviews: reviewStats[0].totalReviews
      });
    }

    const populatedReview = await Review.findById(review._id)
      .populate('customerId', 'name profileImage');

    res.json({ success: true, data: populatedReview });
  } catch (error) {
    console.error('Add review error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update review
export const updateReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { rating, comment } = req.body;
    const customerId = req.user.id;

    const review = await Review.findOneAndUpdate(
      { _id: reviewId, customerId },
      { rating, comment },
      { new: true }
    );

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    res.json({ success: true, data: review });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete review
export const deleteReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const customerId = req.user.id;

    const review = await Review.findOneAndDelete({ _id: reviewId, customerId });
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    res.json({ success: true, message: 'Review deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Get my reviews
export const getMyReviews = async (req, res) => {
  try {
    const customerId = req.user.id;
    const reviews = await Review.find({ customerId }).populate('providerId', 'businessName');
    res.json({ success: true, data: reviews });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Send message
export const sendMessage = async (req, res) => {
  try {
    const { providerId } = req.params;
    const { subject, message } = req.body;
    const customerId = req.user.id;

    const newMessage = await Message.create({
      customerId,
      providerId,
      subject,
      message
    });

    res.json({ success: true, data: newMessage });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Get conversations
export const getConversations = async (req, res) => {
  try {
    const customerId = req.user.id;
    const conversations = await Message.find({ customerId })
      .populate('providerId', 'businessName profileImage')
      .sort({ updatedAt: -1 });
    
    const conversationsWithUrls = conversations.map(conv => ({
      ...conv.toObject(),
      providerId: {
        ...conv.providerId.toObject(),
        profileImage: conv.providerId?.profileImage ? `http://localhost:5000/uploads/profiles/${conv.providerId.profileImage}` : null
      }
    }));
    
    res.json({ success: true, data: conversationsWithUrls });
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get messages
export const getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const customerId = req.user.id;

    const conversation = await Message.findOne({ _id: conversationId, customerId })
      .populate('providerId', 'businessName profileImage')
      .populate('customerId', 'name profileImage');
    
    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    res.json({ success: true, data: conversation });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Mark as read
export const markAsRead = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const customerId = req.user.id;

    await Message.findOneAndUpdate(
      { _id: conversationId, customerId },
      { isRead: true }
    );

    res.json({ success: true, message: 'Marked as read' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Customer reply to message
export const replyToMessage = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { message } = req.body;
    const customerId = req.user.id;
    
    const conversation = await Message.findOneAndUpdate(
      { _id: conversationId, customerId },
      { 
        $push: { 
          replies: { 
            message, 
            isProvider: false, 
            createdAt: new Date() 
          } 
        },
        updatedAt: new Date()
      },
      { new: true }
    ).populate('providerId', 'businessName profileImage')
     .populate('customerId', 'name profileImage');
    
    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }
    
    res.json({ success: true, data: conversation });
  } catch (error) {
    console.error('Customer reply error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};