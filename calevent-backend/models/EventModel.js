import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Event title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Event description is required'],
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  category: {
    type: String,
    required: [true, 'Event category is required'],
    enum: ['wedding', 'corporate', 'birthday', 'anniversary', 'conference', 'party', 'haldi', 'engagement']
  },
  subcategory: {
    type: String,
    enum: ['catering', 'lighting', 'dj', 'photography', 'decoration', 'venue', 'stage', 'sound', 'videography', 'anchor', 'transport', 'security', 'full_package'],
    default: 'full_package'
  },
  tag: {
    type: String,
    enum: ['premium', 'budget', 'popular', 'trending', 'bestseller', 'new', 'top_rated'],
    default: 'popular'
  },
  createdBy: {
    type: String,
    enum: ['admin', 'provider'],
    default: 'provider'
  },
  priceMax: {
    type: Number,
    default: null
  },
  price: {
    type: Number,
    required: [true, 'Event price is required'],
    min: [0, 'Price cannot be negative']
  },
  eventImage: {
    type: String,
    required: [true, 'Event image is required']
  },
  images: [{
    type: String,
    trim: true
  }],
  providerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Provider',
    default: null
  },
  providerName: {
    type: String,
    required: true
  },
  location: {
    address: {
      type: String,
      required: true
    },
    city: {
      type: String,
      required: true
    },
    state: String,
    pincode: String,
    coordinates: {
      latitude: Number,
      longitude: Number
    }
  },
  availability: {
    dates: [{
      date: Date,
      isAvailable: { type: Boolean, default: true }
    }],
    timeSlots: [{
      startTime: String,
      endTime: String,
      isAvailable: { type: Boolean, default: true }
    }]
  },
  features: [{
    type: String,
    trim: true
  }],
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  likes: [{
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer'
    },
    likedAt: {
      type: Date,
      default: Date.now
    }
  }],
  views: {
    type: Number,
    default: 0
  },
  bookingCount: {
    type: Number,
    default: 0
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  reviews: [{
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer',
      required: true
    },
    customerName: String,
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    comment: {
      type: String,
      maxlength: [500, 'Comment cannot exceed 500 characters']
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  maxCapacity: {
    type: Number,
    required: true,
    min: 1
  },
  minCapacity: {
    type: Number,
    default: 1,
    min: 1
  },
  duration: {
    type: String,
    required: true
  },
  inclusions: [{
    type: String,
    trim: true
  }],
  exclusions: [{
    type: String,
    trim: true
  }]
}, {
  timestamps: true
});

// Calculate average rating when reviews are updated
eventSchema.methods.calculateAverageRating = function() {
  if (this.reviews.length === 0) {
    this.rating = 0;
    return;
  }
  
  const totalRating = this.reviews.reduce((sum, review) => sum + review.rating, 0);
  this.rating = Math.round((totalRating / this.reviews.length) * 10) / 10;
};

// Indexes for better performance
eventSchema.index({ category: 1 });
eventSchema.index({ subcategory: 1 });
eventSchema.index({ createdBy: 1 });
eventSchema.index({ tag: 1 });
eventSchema.index({ providerId: 1 });
eventSchema.index({ 'location.city': 1 });
eventSchema.index({ price: 1 });
eventSchema.index({ rating: -1 });
eventSchema.index({ createdAt: -1 });
eventSchema.index({ isActive: 1 });
eventSchema.index({ title: 'text', description: 'text' });

export default mongoose.model('Event', eventSchema);