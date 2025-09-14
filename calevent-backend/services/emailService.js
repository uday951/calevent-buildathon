import nodemailer from 'nodemailer';

// Create transporter
const createTransporter = () => {
  return nodemailer.createTransporter({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: true, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
};

// Send booking confirmation email
export const sendBookingConfirmation = async (bookingDetails) => {
  try {
    const transporter = createTransporter();
    
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #000 0%, #333f63 100%); color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
          .booking-details { background: white; padding: 15px; margin: 15px 0; border-radius: 5px; }
          .footer { text-align: center; padding: 20px; color: #666; }
          .button { display: inline-block; padding: 12px 24px; background: #333f63; color: white; text-decoration: none; border-radius: 5px; margin: 10px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>CALEVENT</h1>
            <h2>Booking Confirmation</h2>
          </div>
          
          <div class="content">
            <p>Dear ${bookingDetails.contactDetails.name},</p>
            
            <p>Thank you for booking with CALEVENT! Your booking has been confirmed.</p>
            
            <div class="booking-details">
              <h3>Booking Details</h3>
              <p><strong>Booking ID:</strong> ${bookingDetails.bookingId}</p>
              <p><strong>Event:</strong> ${bookingDetails.eventTitle}</p>
              <p><strong>Date:</strong> ${new Date(bookingDetails.eventDate).toLocaleDateString()}</p>
              <p><strong>Time:</strong> ${bookingDetails.eventTime}</p>
              <p><strong>Venue:</strong> ${bookingDetails.venue}</p>
              <p><strong>Guests:</strong> ${bookingDetails.guestCount}</p>
              <p><strong>Total Amount:</strong> ₹${bookingDetails.pricing.totalAmount.toLocaleString()}</p>
            </div>
            
            <div class="booking-details">
              <h3>Provider Details</h3>
              <p><strong>Provider:</strong> ${bookingDetails.providerName}</p>
              <p><strong>Contact:</strong> ${bookingDetails.providerContact}</p>
            </div>
            
            <p>We will send you further updates about your booking. If you have any questions, please contact us.</p>
            
            <a href="${process.env.FRONTEND_URL}/bookings" class="button">View Booking</a>
          </div>
          
          <div class="footer">
            <p>Thank you for choosing CALEVENT!</p>
            <p>Contact us: support@calevent.com | +91 9876543210</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const mailOptions = {
      from: `"CALEVENT" <${process.env.EMAIL_USER}>`,
      to: bookingDetails.contactDetails.email,
      subject: `Booking Confirmed - ${bookingDetails.bookingId}`,
      html: htmlContent
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('Booking confirmation email sent:', result.messageId);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('Error sending booking confirmation email:', error);
    return { success: false, error: error.message };
  }
};

// Send payment confirmation email
export const sendPaymentConfirmation = async (paymentDetails) => {
  try {
    const transporter = createTransporter();
    
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #000 0%, #333f63 100%); color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
          .payment-details { background: white; padding: 15px; margin: 15px 0; border-radius: 5px; }
          .footer { text-align: center; padding: 20px; color: #666; }
          .success { color: #28a745; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>CALEVENT</h1>
            <h2>Payment Confirmation</h2>
          </div>
          
          <div class="content">
            <p>Dear ${paymentDetails.customerName},</p>
            
            <p class="success">Your payment has been successfully processed!</p>
            
            <div class="payment-details">
              <h3>Payment Details</h3>
              <p><strong>Transaction ID:</strong> ${paymentDetails.transactionId}</p>
              <p><strong>Booking ID:</strong> ${paymentDetails.bookingId}</p>
              <p><strong>Amount Paid:</strong> ₹${paymentDetails.amount.toLocaleString()}</p>
              <p><strong>Payment Method:</strong> ${paymentDetails.method.toUpperCase()}</p>
              <p><strong>Date:</strong> ${new Date(paymentDetails.paidAt).toLocaleString()}</p>
            </div>
            
            <p>Your booking is now confirmed and the provider has been notified.</p>
          </div>
          
          <div class="footer">
            <p>Thank you for choosing CALEVENT!</p>
            <p>Contact us: support@calevent.com | +91 9876543210</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const mailOptions = {
      from: `"CALEVENT" <${process.env.EMAIL_USER}>`,
      to: paymentDetails.customerEmail,
      subject: `Payment Confirmed - ${paymentDetails.transactionId}`,
      html: htmlContent
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('Payment confirmation email sent:', result.messageId);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('Error sending payment confirmation email:', error);
    return { success: false, error: error.message };
  }
};

// Send welcome email
export const sendWelcomeEmail = async (userDetails, userType) => {
  try {
    const transporter = createTransporter();
    
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #000 0%, #333f63 100%); color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
          .footer { text-align: center; padding: 20px; color: #666; }
          .button { display: inline-block; padding: 12px 24px; background: #333f63; color: white; text-decoration: none; border-radius: 5px; margin: 10px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>CALEVENT</h1>
            <h2>Welcome to CALEVENT!</h2>
          </div>
          
          <div class="content">
            <p>Dear ${userDetails.name},</p>
            
            <p>Welcome to CALEVENT - Your trusted partner for creating unforgettable events!</p>
            
            ${userType === 'customer' ? `
              <p>As a customer, you can now:</p>
              <ul>
                <li>Browse thousands of events and services</li>
                <li>Book events with trusted providers</li>
                <li>Manage your bookings easily</li>
                <li>Rate and review your experiences</li>
              </ul>
              
              <a href="${process.env.FRONTEND_URL}/AllEvent" class="button">Explore Events</a>
            ` : `
              <p>As a service provider, you can now:</p>
              <ul>
                <li>Create and manage your event listings</li>
                <li>Receive bookings from customers</li>
                <li>Track your business performance</li>
                <li>Build your reputation with reviews</li>
              </ul>
              
              <a href="${process.env.FRONTEND_URL}/provider/dashboard" class="button">Go to Dashboard</a>
            `}
            
            <p>If you have any questions, our support team is here to help!</p>
          </div>
          
          <div class="footer">
            <p>Thank you for choosing CALEVENT!</p>
            <p>Contact us: support@calevent.com | +91 9876543210</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const mailOptions = {
      from: `"CALEVENT" <${process.env.EMAIL_USER}>`,
      to: userDetails.email,
      subject: 'Welcome to CALEVENT!',
      html: htmlContent
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('Welcome email sent:', result.messageId);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('Error sending welcome email:', error);
    return { success: false, error: error.message };
  }
};

// Send password reset email
export const sendPasswordResetEmail = async (userDetails, resetToken) => {
  try {
    const transporter = createTransporter();
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #000 0%, #333f63 100%); color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
          .footer { text-align: center; padding: 20px; color: #666; }
          .button { display: inline-block; padding: 12px 24px; background: #333f63; color: white; text-decoration: none; border-radius: 5px; margin: 10px 0; }
          .warning { background: #fff3cd; border: 1px solid #ffeaa7; padding: 10px; border-radius: 5px; margin: 15px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>CALEVENT</h1>
            <h2>Password Reset Request</h2>
          </div>
          
          <div class="content">
            <p>Dear ${userDetails.name},</p>
            
            <p>We received a request to reset your password for your CALEVENT account.</p>
            
            <p>Click the button below to reset your password:</p>
            
            <a href="${resetUrl}" class="button">Reset Password</a>
            
            <div class="warning">
              <p><strong>Important:</strong></p>
              <ul>
                <li>This link will expire in 1 hour</li>
                <li>If you didn't request this reset, please ignore this email</li>
                <li>For security, never share this link with anyone</li>
              </ul>
            </div>
            
            <p>If the button doesn't work, copy and paste this link into your browser:</p>
            <p>${resetUrl}</p>
          </div>
          
          <div class="footer">
            <p>CALEVENT Security Team</p>
            <p>Contact us: support@calevent.com | +91 9876543210</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const mailOptions = {
      from: `"CALEVENT Security" <${process.env.EMAIL_USER}>`,
      to: userDetails.email,
      subject: 'Password Reset Request - CALEVENT',
      html: htmlContent
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('Password reset email sent:', result.messageId);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('Error sending password reset email:', error);
    return { success: false, error: error.message };
  }
};