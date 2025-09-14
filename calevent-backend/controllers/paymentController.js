import Payment from '../models/Payment.js';
import Booking from '../models/bookingModel.js';
import {
  createRazorpayOrder,
  processPayment,
  handleRazorpayWebhook
} from '../services/paymentService.js';
import { sendPaymentConfirmation } from '../services/emailService.js';

// Create payment order
export const createPaymentOrder = async (req, res) => {
  try {
    const { bookingId } = req.body;
    const customerId = req.user.id;

    // Find booking and verify ownership
    const booking = await Booking.findOne({ bookingId, customerId })
      .populate('eventId', 'title')
      .populate('providerId', 'name businessName');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found or unauthorized'
      });
    }

    if (booking.payment.status === 'paid') {
      return res.status(400).json({
        success: false,
        message: 'Payment already completed for this booking'
      });
    }

    // Create Razorpay order
    const orderResult = await createRazorpayOrder(
      booking.pricing.totalAmount,
      'INR',
      booking.bookingId
    );

    if (!orderResult.success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to create payment order',
        error: orderResult.error
      });
    }

    // Create payment record
    const payment = new Payment({
      bookingId: booking.bookingId,
      customerId,
      providerId: booking.providerId._id,
      amount: booking.pricing.totalAmount,
      currency: 'INR',
      method: booking.payment.method,
      status: 'created',
      razorpayOrderId: orderResult.order.id
    });

    await payment.save();

    // Update booking with Razorpay order ID
    booking.payment.razorpayOrderId = orderResult.order.id;
    await booking.save();

    res.json({
      success: true,
      message: 'Payment order created successfully',
      data: {
        orderId: orderResult.order.id,
        amount: orderResult.order.amount,
        currency: orderResult.order.currency,
        bookingDetails: {
          bookingId: booking.bookingId,
          eventTitle: booking.eventId.title,
          providerName: booking.providerId.businessName || booking.providerId.name,
          totalAmount: booking.pricing.totalAmount
        }
      }
    });
  } catch (error) {
    console.error('Create payment order error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create payment order',
      error: error.message
    });
  }
};

// Verify payment
export const verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      bookingId
    } = req.body;

    const customerId = req.user.id;

    // Find booking and payment
    const booking = await Booking.findOne({ bookingId, customerId })
      .populate('customerId', 'name email')
      .populate('eventId', 'title');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found or unauthorized'
      });
    }

    const payment = await Payment.findOne({ bookingId });
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment record not found'
      });
    }

    // Process payment
    const paymentData = {
      bookingId,
      customerId,
      providerId: booking.providerId,
      amount: booking.pricing.totalAmount,
      method: booking.payment.method,
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      razorpaySignature: razorpay_signature,
      metadata: {
        userAgent: req.get('User-Agent'),
        ipAddress: req.ip
      }
    };

    const result = await processPayment(paymentData);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.error
      });
    }

    // Send payment confirmation email
    const paymentDetails = {
      transactionId: result.payment.transactionId,
      bookingId: booking.bookingId,
      amount: booking.pricing.totalAmount,
      method: booking.payment.method,
      paidAt: result.payment.paidAt,
      customerName: booking.customerId.name,
      customerEmail: booking.customerId.email
    };

    await sendPaymentConfirmation(paymentDetails);

    res.json({
      success: true,
      message: 'Payment verified successfully',
      data: {
        transactionId: result.payment.transactionId,
        bookingId: booking.bookingId,
        status: 'paid'
      }
    });
  } catch (error) {
    console.error('Verify payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Payment verification failed',
      error: error.message
    });
  }
};

// Get payment history
export const getPaymentHistory = async (req, res) => {
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
    const payments = await Payment.find(filter)
      .populate('customerId', 'name email')
      .populate('providerId', 'name businessName')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count
    const totalPayments = await Payment.countDocuments(filter);
    const totalPages = Math.ceil(totalPayments / parseInt(limit));

    // Calculate total amounts
    const totalPaid = await Payment.aggregate([
      { $match: { ...filter, status: 'paid' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    res.json({
      success: true,
      data: {
        payments,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalPayments,
          hasNextPage: parseInt(page) < totalPages,
          hasPrevPage: parseInt(page) > 1
        },
        summary: {
          totalPaidAmount: totalPaid[0]?.total || 0
        }
      }
    });
  } catch (error) {
    console.error('Get payment history error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch payment history',
      error: error.message
    });
  }
};

// Webhook handler for Razorpay
export const handleWebhook = async (req, res) => {
  try {
    const signature = req.get('X-Razorpay-Signature');
    const payload = req.body;

    const result = await handleRazorpayWebhook(payload, signature);

    if (result.success) {
      res.status(200).json({ status: 'ok' });
    } else {
      res.status(400).json({ error: result.error });
    }
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
};

// Get payment details by ID
export const getPaymentById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    const payment = await Payment.findById(id)
      .populate('customerId', 'name email phone')
      .populate('providerId', 'name businessName phone email');

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    // Check authorization
    const isAuthorized = (userRole === 'customer' && payment.customerId._id.toString() === userId) ||
                        (userRole === 'provider' && payment.providerId._id.toString() === userId);

    if (!isAuthorized) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to view this payment'
      });
    }

    res.json({
      success: true,
      data: { payment }
    });
  } catch (error) {
    console.error('Get payment by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch payment details',
      error: error.message
    });
  }
};