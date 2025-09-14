import mongoose from 'mongoose';

const feedPostSchema = new mongoose.Schema({
  providerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Provider',
    required: true
  },
  providerName: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  content: {
    type: String,
    required: true,
    maxlength: [2000, 'Content cannot exceed 2000 characters']
  },
  images: [{
    type: String
  }],
  category: {
    type: String,
    enum: ['wedding', 'corporate', 'birthday', 'anniversary', 'conference', 'party', 'general'],
    default: 'general'
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  likes: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'likes.userType'
    },
    userType: {
      type: String,
      enum: ['Customer', 'Provider']
    },
    likedAt: {
      type: Date,
      default: Date.now
    }
  }],
  comments: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'comments.userType'
    },
    userType: {
      type: String,
      enum: ['Customer', 'Provider']
    },
    userName: String,
    comment: {
      type: String,
      required: true,
      maxlength: [500, 'Comment cannot exceed 500 characters']
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  shares: {
    type: Number,
    default: 0
  },
  views: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isPinned: {
    type: Boolean,
    default: false
  },
  isPromoted: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Virtual for like count
feedPostSchema.virtual('likeCount').get(function() {
  return this.likes.length;
});

// Virtual for comment count
feedPostSchema.virtual('commentCount').get(function() {
  return this.comments.length;
});

// Indexes for better performance
feedPostSchema.index({ providerId: 1 });
feedPostSchema.index({ category: 1 });
feedPostSchema.index({ tags: 1 });
feedPostSchema.index({ isActive: 1 });
feedPostSchema.index({ isPinned: -1 });
feedPostSchema.index({ isPromoted: -1 });
feedPostSchema.index({ createdAt: -1 });

export default mongoose.model('FeedPost', feedPostSchema);