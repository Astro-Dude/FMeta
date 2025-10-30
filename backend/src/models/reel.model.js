import mongoose from 'mongoose';

const reelSchema = new mongoose.Schema({
  content: {
    type: String,
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  video: {
    url: {
      type: String,
      required: true
    },
    thumbnail: String,
    duration: Number // in seconds
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }],
  comments: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    text: String,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  hashtags: [String],
  mentions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }],
  visibility: {
    type: String,
    enum: ['public', 'followers', 'close_friends'],
    default: 'public'
  }
}, {
  timestamps: true
});

// Index for efficient queries
reelSchema.index({ author: 1, createdAt: -1 });

const Reel = mongoose.model("Reel", reelSchema);
export default Reel;
