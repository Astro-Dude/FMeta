import mongoose from "mongoose";

const user = mongoose.model("User", new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: false,
    unique: true,
    sparse: true // Allows multiple null values
  },
  phone: {
    type: String,
    required: false,
    unique: true,
    sparse: true // Allows multiple null values
  },
  password: {
    type: String,
    required: true
  },
  username:{
    type: String,
    required: true,
    unique: true
  },
  bio: {
    type: String
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationToken: {
    type: String
  },
  emailVerificationExpires: {
    type: Date
  },
  followers: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: "User"
  },
  following: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: "User"
  },
  relationship_status: {
    type: String,
    enum: ["single", "in a relationship", "it's complicated", "looking for one"],
  },
  posts: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: "Post"
  }
}, {
  timestamps: true
}));

export default user;
