import Razorpay from 'razorpay';
import crypto from 'crypto';
import Payment from '../models/Payment.js';
import Booking from '../models/bookingModel.js';

// Initialize Razorpay (only if keys are provided)
let razorpay = null;
if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
  razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
  });
}

// Create Razorpay order
export const createRazorpayOrder = async (amount, currency = 'INR', receipt) => {
  try {
    if (!razorpay) {
      return {
        success: false,
        error: 'Razorpay not configured. Please set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET'
      };
    }

    const options = {
      amount: amount * 100, // Razorpay expects amount in paise
      currency: currency,
      receipt: receipt,
      payment_capture: 1 // Auto capture payment
    };

    const order = await razorpay.orders.create(options);
    return {
      success: true,
      order: order
    };
  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Verify Razorpay payment signature
export const verifyRazorpaySignature = (orderId, paymentId, signature) => {
  try {
    const body = orderId + '|' + paymentId;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest('hex');

    return expectedSignature === signature;
  } catch (error) {
    console.error('Error verifying Razorpay signature:', error);
    return false;
  }
};

// Process payment
export const processPayment = async (paymentData) => {
  try {
    const {
      bookingId,
      customerId,
      providerId,
      amount,
      method,
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
      metadata
    } = paymentData;

    // Verify signature
    const isValidSignature = verifyRazorpaySignature(
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature
    );

    if (!isValidSignature) {
      throw new Error('Invalid payment signature');
    }

    // Create payment record
    const payment = new Payment({
      bookingId,
      customerId,
      providerId,
      amount,
      method,
      status: 'paid',
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
      metadata,
      paidAt: new Date()
    });

    await payment.save();

    // Update booking payment status
    await Booking.findOneAndUpdate(
      { bookingId },
      {
        'payment.status': 'paid',
        'payment.razorpayPaymentId': razorpayPaymentId,
        'payment.paidAt': new Date(),
        status: 'confirmed'
      }
    );

    return {
      success: true,
      payment,
      message: 'Payment processed successfully'
    };
  } catch (error) {
    console.error('Error processing payment:', error);
    
    // Update payment status to failed
    if (paymentData.bookingId) {
      await Payment.findOneAndUpdate(
        { bookingId: paymentData.bookingId },
        { 
          status: 'failed',
          failureReason: error.message
        }
      );

      await Booking.findOneAndUpdate(
        { bookingId: paymentData.bookingId },
        { 'payment.status': 'failed' }
      );
    }

    return {
      success: false,
      error: error.message
    };
  }
};

// Initiate refund
export const initiateRefund = async (paymentId, amount, reason) => {
  try {
    if (!razorpay) {
      return {
        success: false,
        error: 'Razorpay not configured'
      };
    }

    const payment = await Payment.findById(paymentId);
    if (!payment) {
      throw new Error('Payment not found');
    }

    if (payment.status !== 'paid') {
      throw new Error('Payment is not in paid status');
    }

    // Create refund with Razorpay
    const refund = await razorpay.payments.refund(payment.razorpayPaymentId, {
      amount: amount * 100, // Amount in paise
      speed: 'normal',
      notes: {
        reason: reason,
        booking_id: payment.bookingId
      }
    });

    // Update payment record
    payment.status = 'refunded';
    payment.refundId = refund.id;
    payment.refundAmount = amount;
    payment.refundReason = reason;
    payment.refundedAt = new Date();
    await payment.save();

    // Update booking
    await Booking.findOneAndUpdate(
      { bookingId: payment.bookingId },
      {
        'payment.status': 'refunded',
        'cancellation.refundAmount': amount,
        'cancellation.refundStatus': 'processed'
      }
    );

    return {
      success: true,
      refund,
      message: 'Refund initiated successfully'
    };
  } catch (error) {
    console.error('Error initiating refund:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Get payment details
export const getPaymentDetails = async (paymentId) => {
  try {
    if (!razorpay) {
      return {
        success: false,
        error: 'Razorpay not configured'
      };
    }

    const payment = await razorpay.payments.fetch(paymentId);
    return {
      success: true,
      payment
    };
  } catch (error) {
    console.error('Error fetching payment details:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Calculate pricing with taxes
export const calculatePricing = (basePrice, guestCount, minGuests = 100, additionalGuestPrice = 500) => {
  let additionalCharges = 0;
  
  // Calculate additional charges for extra guests
  if (guestCount > minGuests) {
    additionalCharges = (guestCount - minGuests) * additionalGuestPrice;
  }

  const subtotal = basePrice + additionalCharges;
  const taxes = Math.round(subtotal * 0.18); // 18% GST
  const totalAmount = subtotal + taxes;

  return {
    basePrice,
    additionalCharges,
    subtotal,
    taxes,
    totalAmount,
    breakdown: {
      basePrice: `Base price for ${minGuests} guests`,
      additionalCharges: guestCount > minGuests ? `${guestCount - minGuests} additional guests @ ₹${additionalGuestPrice} each` : null,
      taxes: '18% GST',
      totalAmount: 'Total amount to pay'
    }
  };
};

// Webhook handler for Razorpay events
export const handleRazorpayWebhook = async (payload, signature) => {
  try {
    // Verify webhook signature
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET)
      .update(JSON.stringify(payload))
      .digest('hex');

    if (expectedSignature !== signature) {
      throw new Error('Invalid webhook signature');
    }

    const { event, payload: eventPayload } = payload;

    switch (event) {
      case 'payment.captured':
        await handlePaymentCaptured(eventPayload.payment.entity);
        break;
      
      case 'payment.failed':
        await handlePaymentFailed(eventPayload.payment.entity);
        break;
      
      case 'refund.processed':
        await handleRefundProcessed(eventPayload.refund.entity);
        break;
      
      default:
        console.log('Unhandled webhook event:', event);
    }

    return { success: true };
  } catch (error) {
    console.error('Error handling webhook:', error);
    return { success: false, error: error.message };
  }
};

// Handle payment captured event
const handlePaymentCaptured = async (payment) => {
  try {
    await Payment.findOneAndUpdate(
      { razorpayPaymentId: payment.id },
      {
        status: 'paid',
        paidAt: new Date(payment.created_at * 1000),
        metadata: {
          ...payment,
          cardLast4: payment.card?.last4,
          cardNetwork: payment.card?.network,
          bank: payment.bank,
          wallet: payment.wallet,
          vpa: payment.vpa
        }
      }
    );

    console.log('Payment captured:', payment.id);
  } catch (error) {
    console.error('Error handling payment captured:', error);
  }
};

// Handle payment failed event
const handlePaymentFailed = async (payment) => {
  try {
    await Payment.findOneAndUpdate(
      { razorpayPaymentId: payment.id },
      {
        status: 'failed',
        failureReason: payment.error_description
      }
    );

    await Booking.findOneAndUpdate(
      { 'payment.razorpayPaymentId': payment.id },
      { 'payment.status': 'failed' }
    );

    console.log('Payment failed:', payment.id);
  } catch (error) {
    console.error('Error handling payment failed:', error);
  }
};

// Handle refund processed event
const handleRefundProcessed = async (refund) => {
  try {
    await Payment.findOneAndUpdate(
      { razorpayPaymentId: refund.payment_id },
      {
        status: 'refunded',
        refundId: refund.id,
        refundAmount: refund.amount / 100,
        refundedAt: new Date(refund.created_at * 1000)
      }
    );

    console.log('Refund processed:', refund.id);
  } catch (error) {
    console.error('Error handling refund processed:', error);
  }
};