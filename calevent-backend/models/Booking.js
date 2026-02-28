import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
  bookingId: {
    type: String,
    unique: true,
    required: true
  },
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: true
  },
  providerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Provider',
    required: true
  },
  eventId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event'
  },
  // AI Booking fields
  isAIGenerated: {
    type: Boolean,
    default: false
  },
  aiRequestId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ImageRequest'
  },
  generatedImage: String,
  
  // Event details
  eventTitle: {
    type: String,
    required: true
  },
  eventType: {
    type: String,
    required: true
  },
  eventDate: {
    type: Date,
    required: true
  },
  eventTime: {
    type: String,
    required: true
  },
  venue: {
    type: String,
    required: true
  },
  guests: {
    type: Number,
    required: true
  },
  
  // Contact details
  contactDetails: {
    name: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true
    },
    phone: {
      type: String,
      required: true
    }
  },
  
  // Pricing
  amount: {
    type: Number,
    required: true
  },
  tax: {
    type: Number,
    default: 0
  },
  totalAmount: {
    type: Number,
    required: true
  },
  
  // Status
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'started', 'reached_venue', 'work_started', 'completed', 'cancelled'],
    default: 'pending'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    enum: ['card', 'upi', 'bank'],
    required: true
  },
  
  // Additional details
  specialRequests: String,
  
  // Provider response
  providerNotes: String,
  estimatedDelivery: String,
  
  // Timestamps
  bookedAt: {
    type: Date,
    default: Date.now
  },
  confirmedAt: Date,
  completedAt: Date
}, {
  timestamps: true
});

// Generate unique booking ID
bookingSchema.pre('save', async function(next) {
  if (!this.bookingId) {
    this.bookingId = 'BK' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).substr(2, 4).toUpperCase();
  }
  next();
});

export default mongoose.models.Booking || mongoose.model('Booking', bookingSchema);