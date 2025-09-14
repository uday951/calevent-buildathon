import mongoose from 'mongoose';

const comboPackageSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Combo package title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Combo package description is required'],
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  category: {
    type: String,
    required: [true, 'Combo category is required'],
    enum: ['wedding', 'corporate', 'birthday', 'anniversary', 'conference', 'party']
  },
  originalPrice: {
    type: Number,
    required: [true, 'Original price is required'],
    min: [0, 'Price cannot be negative']
  },
  comboPrice: {
    type: Number,
    required: [true, 'Combo price is required'],
    min: [0, 'Price cannot be negative']
  },
  savings: {
    type: Number,
    required: true
  },
  savingsPercent: {
    type: Number,
    required: true
  },
  images: [{
    type: String,
    required: true
  }],
  services: [{
    name: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true
    },
    included: {
      type: Boolean,
      default: true
    },
    price: {
      type: Number,
      default: 0
    }
  }],
  providers: [{
    providerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Provider',
      required: true
    },
    name: {
      type: String,
      required: true
    },
    service: {
      type: String,
      required: true
    },
    rating: {
      type: Number,
      min: 0,
      max: 5
    },
    experience: String,
    image: String
  }],
  location: {
    address: String,
    city: {
      type: String,
      required: true
    },
    state: String,
    coordinates: {
      latitude: Number,
      longitude: Number
    }
  },
  duration: {
    type: String,
    required: true
  },
  maxGuests: {
    type: Number,
    required: true,
    min: 1
  },
  minGuests: {
    type: Number,
    default: 1,
    min: 1
  },
  featured: {
    type: Boolean,
    default: false
  },
  availability: [{
    type: Date
  }],
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  reviewCount: {
    type: Number,
    default: 0
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
  bookingCount: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }]
}, {
  timestamps: true
});

// Calculate savings before saving
comboPackageSchema.pre('save', function(next) {
  if (this.isModified('originalPrice') || this.isModified('comboPrice')) {
    this.savings = this.originalPrice - this.comboPrice;
    this.savingsPercent = Math.round((this.savings / this.originalPrice) * 100);
  }
  next();
});

// Calculate average rating when reviews are updated
comboPackageSchema.methods.calculateAverageRating = function() {
  if (this.reviews.length === 0) {
    this.rating = 0;
    this.reviewCount = 0;
    return;
  }
  
  const totalRating = this.reviews.reduce((sum, review) => sum + review.rating, 0);
  this.rating = Math.round((totalRating / this.reviews.length) * 10) / 10;
  this.reviewCount = this.reviews.length;
};

// Indexes for better performance
comboPackageSchema.index({ category: 1 });
comboPackageSchema.index({ 'location.city': 1 });
comboPackageSchema.index({ comboPrice: 1 });
comboPackageSchema.index({ rating: -1 });
comboPackageSchema.index({ featured: -1 });
comboPackageSchema.index({ isActive: 1 });
comboPackageSchema.index({ createdAt: -1 });

export default mongoose.model('ComboPackage', comboPackageSchema);