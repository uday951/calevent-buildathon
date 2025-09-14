import Booking from '../models/bookingModel.js';
import Event from '../models/EventModel.js';
import Provider from '../models/Provider.js';
import Customer from '../models/customer.js';
import { calculatePricing } from '../services/paymentService.js';
import { sendBookingConfirmation } from '../services/emailService.js';

// Create new booking
export const createBooking = async (req, res) => {
  try {
    const {
      eventId,
      eventDate,
      eventTime,
      venue,
      guestCount,
      specialRequirements,
      contactDetails,
      paymentMethod
    } = req.body;

    const customerId = req.user.id;

    // Validate event exists and is active
    const event = await Event.findById(eventId).populate('providerId');
    if (!event || !event.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Event not found or inactive'
      });
    }

    // Check if event date is in the future
    const selectedDate = new Date(eventDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (selectedDate < today) {
      return res.status(400).json({
        success: false,
        message: 'Event date cannot be in the past'
      });
    }

    // Check guest count limits
    if (guestCount < event.minCapacity || guestCount > event.maxCapacity) {
      return res.status(400).json({
        success: false,
        message: `Guest count must be between ${event.minCapacity} and ${event.maxCapacity}`
      });
    }

    // Calculate pricing
    const pricing = calculatePricing(event.price, guestCount, event.minCapacity);

    // Create booking
    const booking = new Booking({
      customerId,
      providerId: event.providerId._id,
      eventId,
      eventType: event.category,
      eventDate: selectedDate,
      eventTime,
      venue,
      guestCount,
      specialRequirements,
      contactDetails,
      pricing,
      payment: {
        method: paymentMethod,
        status: 'pending'
      }
    });

    await booking.save();

    // Populate booking details for response
    const populatedBooking = await Booking.findById(booking._id)
      .populate('eventId', 'title eventImage')
      .populate('providerId', 'name businessName phone email')
      .populate('customerId', 'name email phone');

    // Send booking confirmation email
    const bookingDetails = {
      bookingId: booking.bookingId,
      eventTitle: event.title,
      eventDate: booking.eventDate,
      eventTime: booking.eventTime,
      venue: booking.venue,
      guestCount: booking.guestCount,
      pricing: booking.pricing,
      contactDetails: booking.contactDetails,
      providerName: event.providerId.businessName || event.providerId.name,
      providerContact: event.providerId.phone
    };

    await sendBookingConfirmation(bookingDetails);

    // Update event booking count
    event.bookingCount += 1;
    await event.save();

    // Update customer total bookings
    await Customer.findByIdAndUpdate(customerId, {
      $inc: { totalBookings: 1 }
    });

    // Update provider total bookings
    await Provider.findByIdAndUpdate(event.providerId._id, {
      $inc: { totalBookings: 1 }
    });

    res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      data: { booking: populatedBooking }
    });
  } catch (error) {
    console.error('Create booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create booking',
      error: error.message
    });
  }
};

// Get user's bookings
export const getMyBookings = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const userId = req.user.id;
    const userRole = req.user.role;

    // Build filter based on user role
    const filter = {};
    if (userRole === 'customer') {
      filter.customerId = userId;
    } else if (userRole === 'provider') {
      filter.providerId = userId;
    }

    if (status && status !== 'all') {
      filter.status = status;
    }

    // Execute query with pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const bookings = await Booking.find(filter)
      .populate('eventId', 'title eventImage category')
      .populate('customerId', 'name email phone profileImage')
      .populate('providerId', 'name businessName phone email profileImage')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count
    const totalBookings = await Booking.countDocuments(filter);
    const totalPages = Math.ceil(totalBookings / parseInt(limit));

    res.json({
      success: true,
      data: {
        bookings,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalBookings,
          hasNextPage: parseInt(page) < totalPages,
          hasPrevPage: parseInt(page) > 1
        }
      }
    });
  } catch (error) {
    console.error('Get bookings error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch bookings',
      error: error.message
    });
  }
};

// Get booking by ID
export const getBookingById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    const booking = await Booking.findById(id)
      .populate('eventId', 'title eventImage category features')
      .populate('customerId', 'name email phone profileImage')
      .populate('providerId', 'name businessName phone email profileImage location');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check authorization
    const isAuthorized = (userRole === 'customer' && booking.customerId._id.toString() === userId) ||
                        (userRole === 'provider' && booking.providerId._id.toString() === userId);

    if (!isAuthorized) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to view this booking'
      });
    }

    res.json({
      success: true,
      data: { booking }
    });
  } catch (error) {
    console.error('Get booking by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch booking',
      error: error.message
    });
  }
};

// Update booking status (Provider only)
export const updateBookingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, message } = req.body;
    const providerId = req.user.id;

    const booking = await Booking.findOne({ _id: id, providerId });
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found or unauthorized'
      });
    }

    // Validate status transition
    const validStatuses = ['pending', 'confirmed', 'in-progress', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    // Update booking status
    booking.status = status;
    
    // Add timeline entry
    booking.timeline.push({
      status,
      message: message || `Booking status changed to ${status}`,
      timestamp: new Date()
    });

    await booking.save();

    // Update provider revenue if completed
    if (status === 'completed' && booking.payment.status === 'paid') {
      await Provider.findByIdAndUpdate(providerId, {
        $inc: { totalRevenue: booking.pricing.totalAmount }
      });

      // Update customer total spent
      await Customer.findByIdAndUpdate(booking.customerId, {
        $inc: { totalSpent: booking.pricing.totalAmount }
      });
    }

    res.json({
      success: true,
      message: 'Booking status updated successfully',
      data: { booking }
    });
  } catch (error) {
    console.error('Update booking status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update booking status',
      error: error.message
    });
  }
};

// Cancel booking
export const cancelBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const userId = req.user.id;
    const userRole = req.user.role;

    // Find booking and check authorization
    const filter = { _id: id };
    if (userRole === 'customer') {
      filter.customerId = userId;
    } else if (userRole === 'provider') {
      filter.providerId = userId;
    }

    const booking = await Booking.findOne(filter);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found or unauthorized'
      });
    }

    // Check if booking can be cancelled
    if (booking.status === 'completed' || booking.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Booking cannot be cancelled'
      });
    }

    // Update booking
    booking.status = 'cancelled';
    booking.cancellation = {
      isCancelled: true,
      cancelledBy: userRole,
      reason,
      cancelledAt: new Date()
    };

    // Add timeline entry
    booking.timeline.push({
      status: 'cancelled',
      message: `Booking cancelled by ${userRole}: ${reason}`,
      timestamp: new Date()
    });

    await booking.save();

    res.json({
      success: true,
      message: 'Booking cancelled successfully',
      data: { booking }
    });
  } catch (error) {
    console.error('Cancel booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cancel booking',
      error: error.message
    });
  }
};

// Add rating and review
export const addBookingRating = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, comment } = req.body;
    const userId = req.user.id;
    const userRole = req.user.role;

    const booking = await Booking.findById(id);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check authorization and booking status
    const isAuthorized = (userRole === 'customer' && booking.customerId.toString() === userId) ||
                        (userRole === 'provider' && booking.providerId.toString() === userId);

    if (!isAuthorized) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to rate this booking'
      });
    }

    if (booking.status !== 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Can only rate completed bookings'
      });
    }

    // Add rating
    if (userRole === 'customer') {
      if (booking.rating.customerRating.rating) {
        return res.status(400).json({
          success: false,
          message: 'You have already rated this booking'
        });
      }
      booking.rating.customerRating = {
        rating: parseInt(rating),
        comment,
        ratedAt: new Date()
      };
    } else {
      if (booking.rating.providerRating.rating) {
        return res.status(400).json({
          success: false,
          message: 'You have already rated this booking'
        });
      }
      booking.rating.providerRating = {
        rating: parseInt(rating),
        comment,
        ratedAt: new Date()
      };
    }

    await booking.save();

    // Update provider rating if customer rated
    if (userRole === 'customer') {
      const provider = await Provider.findById(booking.providerId);
      const allBookings = await Booking.find({
        providerId: booking.providerId,
        'rating.customerRating.rating': { $exists: true }
      });

      const totalRating = allBookings.reduce((sum, b) => sum + b.rating.customerRating.rating, 0);
      const avgRating = totalRating / allBookings.length;

      provider.rating = Math.round(avgRating * 10) / 10;
      provider.totalReviews = allBookings.length;
      await provider.save();
    }

    res.json({
      success: true,
      message: 'Rating added successfully',
      data: { booking }
    });
  } catch (error) {
    console.error('Add booking rating error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add rating',
      error: error.message
    });
  }
};