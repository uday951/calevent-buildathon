import Booking from '../models/bookingModel.js';
import Event from '../models/EventModel.js';
import Customer from '../models/customer.js';

// Create new booking — NO provider assigned here, admin does it
export const createBooking = async (req, res) => {
  try {
    const customerId = req.user?.id;
    if (!customerId) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    const {
      eventId,
      eventDate,
      eventTime,
      venue,
      guests,
      contactDetails,
      specialRequests,
      paymentMethod
    } = req.body;

    const event = await Event.findById(eventId);
    if (!event || !event.isActive) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    const basePrice = event.price;
    const taxes = parseFloat((basePrice * 0.18).toFixed(2));
    const totalAmount = parseFloat((basePrice + taxes).toFixed(2));

    const booking = new Booking({
      customerId,
      eventId,
      eventType: event.category,
      eventDate,
      eventTime,
      venue,
      guestCount: guests || 50,
      contactDetails,
      specialRequirements: specialRequests,
      pricing: { basePrice, taxes, totalAmount },
      payment: { method: paymentMethod || 'upi', status: 'pending' },
      // adminStatus defaults to 'pending_review', assignedProvider is null
      status: 'pending',
      adminStatus: 'pending_review',
      timeline: [{ status: 'pending', message: 'Booking submitted. Awaiting admin review.' }]
    });

    await booking.save();

    // Increment event booking count
    await Event.findByIdAndUpdate(eventId, { $inc: { bookingCount: 1 } });

    const populated = await Booking.findById(booking._id)
      .populate('customerId', 'name email phone')
      .populate('eventId', 'title category eventImage');

    res.status(201).json({
      success: true,
      message: 'Booking submitted successfully! Our team will review and assign a provider shortly.',
      data: { booking: populated }
    });

  } catch (error) {
    console.error('Create booking error:', error);
    res.status(500).json({ success: false, message: 'Failed to create booking', error: error.message });
  }
};

// Get customer bookings
export const getCustomerBookings = async (req, res) => {
  try {
    const customerId = req.user?.id;
    if (!customerId) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    const { status, page = 1, limit = 10 } = req.query;
    const filter = { customerId };
    if (status && status !== 'all') filter.status = status;

    const bookings = await Booking.find(filter)
      .populate('eventId', 'title category eventImage')
      .populate('assignedProvider', 'businessName name phone location profileImage')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Booking.countDocuments(filter);

    res.json({
      success: true,
      data: {
        bookings,
        pagination: { current: parseInt(page), pages: Math.ceil(total / limit), total }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to get bookings', error: error.message });
  }
};

// Get provider assigned bookings (only bookings admin assigned to them)
export const getProviderBookings = async (req, res) => {
  try {
    const providerId = req.user?.id;
    if (!providerId) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    const { status, page = 1, limit = 10 } = req.query;
    const filter = { assignedProvider: providerId };
    if (status && status !== 'all') filter.adminStatus = status;

    const bookings = await Booking.find(filter)
      .populate('customerId', 'name email phone')
      .populate('eventId', 'title category eventImage')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Booking.countDocuments(filter);

    const stats = {
      assigned: await Booking.countDocuments({ assignedProvider: providerId, adminStatus: 'provider_assigned' }),
      confirmed: await Booking.countDocuments({ assignedProvider: providerId, adminStatus: 'confirmed' }),
      in_progress: await Booking.countDocuments({ assignedProvider: providerId, adminStatus: 'in_progress' }),
      completed: await Booking.countDocuments({ assignedProvider: providerId, adminStatus: 'completed' })
    };

    res.json({
      success: true,
      data: {
        bookings,
        stats,
        pagination: { current: parseInt(page), pages: Math.ceil(total / limit), total }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to get bookings', error: error.message });
  }
};

// Provider updates execution status (only after admin assigns)
export const updateBookingStatus = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { status, providerNotes } = req.body;
    const providerId = req.user?.id;

    const booking = await Booking.findOne({ _id: bookingId, assignedProvider: providerId });
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found or not assigned to you' });
    }

    // Provider can only update execution statuses
    const allowedStatuses = ['in_progress', 'completed'];
    if (!allowedStatuses.includes(status)) {
      return res.status(403).json({ success: false, message: 'Providers can only update to in_progress or completed' });
    }

    booking.adminStatus = status;
    booking.status = status === 'completed' ? 'completed' : 'in-progress';
    if (providerNotes) booking.adminNotes = providerNotes;
    if (status === 'completed') booking.completedAt = new Date();

    booking.timeline.push({ status, message: `Provider updated status to ${status}` });
    await booking.save();

    res.json({ success: true, message: `Booking updated to ${status}` });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update booking', error: error.message });
  }
};

// Get booking by ID
export const getBookingById = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const userId = req.user?.id;

    const booking = await Booking.findById(bookingId)
      .populate('customerId', 'name email phone')
      .populate('assignedProvider', 'businessName name phone location profileImage')
      .populate('eventId', 'title category eventImage');

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    const isCustomer = booking.customerId?._id?.toString() === userId;
    const isProvider = booking.assignedProvider?._id?.toString() === userId;
    if (!isCustomer && !isProvider) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    res.json({ success: true, data: { booking } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to get booking', error: error.message });
  }
};
