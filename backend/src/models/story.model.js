import mongoose from 'mongoose';

const storySchema = new mongoose.Schema({
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  media: {
    url: {
      type: String,
      required: true
    },
    type: {
      type: String,
      enum: ['image', 'video'],
      required: true
    },
    thumbnail: String, // For video thumbnails
    duration: Number // For videos (in seconds)
  },
  views: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    viewedAt: {
      type: Date,
      default: Date.now
    }
  }],
  expiresAt: {
    type: Date,
    required: true
  },
  visibility: {
    type: String,
    enum: ['public', 'followers', 'close_friends'],
    default: 'public'
  }
}, {
  timestamps: true
});

// Index for efficient story expiration queries
storySchema.index({ expiresAt: 1 });
storySchema.index({ author: 1, createdAt: -1 });

// Auto-expire stories after 24 hours
storySchema.pre('save', function(next) {
  if (!this.expiresAt) {
    this.expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
  }
  next();
});

const Story = mongoose.model("Story", storySchema);
export default Story;
