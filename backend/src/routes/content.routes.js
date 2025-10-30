import express from "express";
import {
  createContent,
  getContentByType,
  getStoriesFeed,
  viewStory,
  likeContent,
  commentOnContent,
  deleteContent,
  getUserContent,
  getReelsFeed
} from "../controller/content.controller.js";

const router = express.Router();

// Create content (post/reel/story)
router.post("/create", createContent);

// Get content by type (posts, reels, stories)
router.get("/type/:contentType", getContentByType);

// Get stories feed (from followed users)
router.get("/stories/feed", getStoriesFeed);

// View a story
router.post("/story/:storyId/view", viewStory);

// Get reels feed
router.get("/reels/feed", getReelsFeed);

// Like/unlike content
router.post("/:contentId/like", likeContent);

// Comment on content
router.post("/:contentId/comment", commentOnContent);

// Delete content
router.delete("/:contentId", deleteContent);

// Get user's content
router.get("/user/:userId", getUserContent);

export default router;
