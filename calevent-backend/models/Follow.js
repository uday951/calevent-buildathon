import mongoose from 'mongoose';

const followSchema = new mongoose.Schema({
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: true
  },
  providerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Provider',
    required: true
  }
}, {
  timestamps: true
});

// Ensure one follow per customer per provider
followSchema.index({ customerId: 1, providerId: 1 }, { unique: true });

export default mongoose.model('Follow', followSchema);