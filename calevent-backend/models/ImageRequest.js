import mongoose from 'mongoose';

const imageRequestSchema = new mongoose.Schema({
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
  generatedImage: {
    type: String, // base64 or URL
    required: true
  },
  imagePrompt: {
    type: String,
    required: true
  },
  eventType: {
    type: String,
    required: true
  },
  eventDetails: {
    theme: String,
    budget: Number,
    guestCount: Number,
    date: Date,
    location: String,
    additionalRequirements: String
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected', 'completed', 'query'],
    default: 'pending'
  },
  providerResponse: {
    message: String,
    estimatedCost: Number,
    availability: String,
    contactDetails: {
      phone: String,
      email: String,
      address: String
    },
    canBook: Boolean,
    responseDate: Date
  },
  customerMessage: String
}, {
  timestamps: true
});

export default mongoose.model('ImageRequest', imageRequestSchema);