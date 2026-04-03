import mongoose from 'mongoose';

const assignmentSchema = new mongoose.Schema({
  providerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Provider', required: true },
  serviceType: String,
  status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' },
  notes: String,
  assignedAt: { type: Date, default: Date.now }
});

const eventRequestSchema = new mongoose.Schema({
  requestNumber: { type: String, unique: true },
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },

  // Event info
  eventType: { type: String, required: true },
  eventTitle: String,
  eventDate: { type: Date, required: true },
  eventTime: String,
  guestCount: { type: Number, required: true },

  // Location
  location: {
    address: String,
    city: String,
    state: String,
    pincode: String
  },

  // Budget
  budget: {
    min: { type: Number, default: 0 },
    max: { type: Number, required: true }
  },

  // Services
  servicesRequired: [String],
  description: String,
  specialRequirements: String,
  contactPreference: { type: String, default: 'phone' },

  // Admin workflow
  status: {
    type: String,
    enum: ['pending', 'contacted', 'providers_assigned', 'quoted', 'approved', 'in_progress', 'completed', 'cancelled'],
    default: 'pending'
  },
  adminNotes: String,
  assignments: [assignmentSchema],

  // Quotation from admin
  quotation: {
    totalAmount: Number,
    breakdown: [{ service: String, amount: Number }],
    notes: String,
    createdAt: Date
  },

  cancelReason: String,
  cancelledBy: { type: String, enum: ['customer', 'admin'] }
}, { timestamps: true });

// Auto-generate request number
eventRequestSchema.pre('save', async function (next) {
  if (!this.requestNumber) {
    const count = await mongoose.model('EventRequest').countDocuments();
    this.requestNumber = `EVR${String(count + 1).padStart(5, '0')}`;
  }
  next();
});

export default mongoose.model('EventRequest', eventRequestSchema);
