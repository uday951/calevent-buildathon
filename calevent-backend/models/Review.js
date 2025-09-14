import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
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
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    required: true,
    maxlength: 500
  },
  eventType: {
    type: String,
    default: 'General'
  }
}, {
  timestamps: true
});

// Ensure one review per customer per provider
reviewSchema.index({ customerId: 1, providerId: 1 }, { unique: true });

export default mongoose.model('Review', reviewSchema);