import Booking from '../models/bookingModel.js';
import Event from '../models/EventModel.js';
import Provider from '../models/Provider.js';
import Customer from '../models/customer.js';
import ImageRequest from '../models/ImageRequest.js';

// Create new booking
export const createBooking = async (req, res) => {
  try {
    const customerId = req.user?.id;
    const {
      eventId,
      eventDate,
      eventTime,
      venue,
      guests,
      contactDetails,
      paymentMethod,
      specialRequests,
      // AI booking fields
      isAIGenerated,
      requestId,
      providerId,
      eventType,
      amount,
      generatedImage,
      eventTitle
    } = req.body;

    console.log('Creating booking for customer:', customerId);
    console.log('Request body:', req.body);

    if (!customerId) {
      console.log('No customer ID found');
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    // Generate unique booking ID
    const bookingId = 'BK' + Date.now().toString().slice(-8) + Math.random().toString(36).substr(2, 4).toUpperCase();
    
    let bookingData = {
      customerId,
      bookingId,
      eventDate,
      eventTime,
      venue,
      guestCount: guests || 50,
      contactDetails,
      specialRequirements: specialRequests,
      payment: {
        method: paymentMethod,
        status: 'pending'
      },
      status: 'pending'
    };

    if (isAIGenerated) {
      // AI-generated booking
      bookingData = {
        ...bookingData,
        providerId,
        eventId: 'ai-generated',
        eventType,
        pricing: {
          basePrice: amount,
          taxes: amount * 0.18,
          totalAmount: amount + (amount * 0.18)
        }
      };
    } else {
      // Regular event booking
      const event = await Event.findById(eventId).populate('providerId');
      if (!event) {
        return res.status(404).json({
          success: false,
          message: 'Event not found'
        });
      }

      bookingData = {
        ...bookingData,
        eventId,
        providerId: event.providerId._id,
        eventType: event.category,
        pricing: {
          basePrice: event.price,
          taxes: event.price * 0.18,
          totalAmount: event.price + (event.price * 0.18)
        }
      };
    }

    console.log('Final booking data:', bookingData);
    
    const booking = new Booking(bookingData);
    await booking.save();
    
    console.log('Booking saved with ID:', booking._id);

    // Populate the booking with related data
    const populatedBooking = await Booking.findById(booking._id)
      .populate('customerId', 'name email phone')
      .populate('providerId', 'businessName name email phone location')
      .populate('eventId', 'title category');

    console.log('Populated booking:', populatedBooking);

    res.status(201).json({
      success: true,
      data: {
        booking: populatedBooking,
        message: 'Booking created successfully'
      }
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

// Get customer bookings
export const getCustomerBookings = async (req, res) => {
  try {
    const customerId = req.user?.id;
    const { status, page = 1, limit = 10 } = req.query;

    console.log('Getting bookings for customer:', customerId);

    if (!customerId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const filter = { customerId };
    if (status && status !== 'all') {
      filter.status = status;
    }

    console.log('Booking filter:', filter);

    const bookings = await Booking.find(filter)
      .populate('providerId', 'businessName name email phone location profileImage')
      .populate('eventId', 'title category image')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Booking.countDocuments(filter);

    console.log('Found bookings:', bookings.length, 'Total:', total);

    res.json({
      success: true,
      data: {
        bookings,
        pagination: {
          current: page,
          pages: Math.ceil(total / limit),
          total
        }
      }
    });

  } catch (error) {
    console.error('Get customer bookings error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get bookings',
      error: error.message
    });
  }
};

// Get provider bookings
export const getProviderBookings = async (req, res) => {
  try {
    const providerId = req.user?.id;
    const { status, page = 1, limit = 10 } = req.query;

    if (!providerId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const filter = { providerId };
    if (status && status !== 'all') {
      filter.status = status;
    }

    const bookings = await Booking.find(filter)
      .populate('customerId', 'name email phone')
      .populate('eventId', 'title category image')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Booking.countDocuments(filter);

    // Calculate stats
    const stats = {
      pending: await Booking.countDocuments({ providerId, status: 'pending' }),
      confirmed: await Booking.countDocuments({ providerId, status: 'confirmed' }),
      completed: await Booking.countDocuments({ providerId, status: 'completed' }),
      cancelled: await Booking.countDocuments({ providerId, status: 'cancelled' })
    };

    res.json({
      success: true,
      data: {
        bookings,
        stats,
        pagination: {
          current: page,
          pages: Math.ceil(total / limit),
          total
        }
      }
    });

  } catch (error) {
    console.error('Get provider bookings error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get bookings',
      error: error.message
    });
  }
};

// Update booking status
export const updateBookingStatus = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { status, providerNotes, estimatedDelivery } = req.body;
    const providerId = req.user?.id;

    if (!providerId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const booking = await Booking.findOne({ 
      _id: bookingId, 
      providerId 
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    booking.status = status;
    if (providerNotes) booking.providerNotes = providerNotes;
    if (estimatedDelivery) booking.estimatedDelivery = estimatedDelivery;

    if (status === 'confirmed') {
      booking.confirmedAt = new Date();
    } else if (status === 'completed') {
      booking.completedAt = new Date();
    }

    await booking.save();

    const updatedBooking = await Booking.findById(booking._id)
      .populate('customerId', 'name email phone')
      .populate('providerId', 'businessName name email phone');

    res.json({
      success: true,
      data: {
        booking: updatedBooking,
        message: `Booking ${status} successfully`
      }
    });

  } catch (error) {
    console.error('Update booking status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update booking',
      error: error.message
    });
  }
};

// Get booking by ID
export const getBookingById = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const userId = req.user?.id;

    const booking = await Booking.findById(bookingId)
      .populate('customerId', 'name email phone')
      .populate('providerId', 'businessName name email phone location profileImage')
      .populate('eventId', 'title category image');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check if user has access to this booking
    if (booking.customerId._id.toString() !== userId && booking.providerId._id.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
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
      message: 'Failed to get booking',
      error: error.message
    });
  }
};