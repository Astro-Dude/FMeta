import mongoose from 'mongoose';

const postSchema = new mongoose.Schema({
  content: {
    type: String,
    required: true
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  images: [{
    type: String // URLs to images
  }],
  likes: [{
    type: [mongoose.Schema.Types.ObjectId],
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
  location: String,
  hashtags: [String]
}, {
  timestamps: true
});

const Post = mongoose.model("Post", postSchema);
export default Post;
