import mongoose from 'mongoose';

const testimonialSchema = new mongoose.Schema({
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: true
  },
  customerName: {
    type: String,
    required: true,
    trim: true
  },
  customerImage: {
    type: String
  },
  providerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Provider'
  },
  eventId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event'
  },
  bookingId: {
    type: String,
    ref: 'Booking'
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  content: {
    type: String,
    required: true,
    maxlength: [1000, 'Content cannot exceed 1000 characters']
  },
  eventType: {
    type: String,
    enum: ['wedding', 'corporate', 'birthday', 'anniversary', 'conference', 'party']
  },
  eventDate: {
    type: Date
  },
  images: [{
    type: String
  }],
  isApproved: {
    type: Boolean,
    default: false
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  likes: {
    type: Number,
    default: 0
  },
  helpfulCount: {
    type: Number,
    default: 0
  },
  reportCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Indexes for better performance
testimonialSchema.index({ customerId: 1 });
testimonialSchema.index({ providerId: 1 });
testimonialSchema.index({ eventId: 1 });
testimonialSchema.index({ rating: -1 });
testimonialSchema.index({ isApproved: 1, isActive: 1 });
testimonialSchema.index({ isFeatured: -1 });
testimonialSchema.index({ createdAt: -1 });

export default mongoose.model('Testimonial', testimonialSchema);