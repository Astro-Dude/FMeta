import jwt from "jsonwebtoken";
import Post from "../models/post.model.js";
import Reel from "../models/reel.model.js";
import Story from "../models/story.model.js";
import User from "../models/user.model.js";

// Verify JWT token helper
const verifyToken = (req) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");
  if (!token) {
    throw new Error("No token provided");
  }
  return jwt.verify(token, process.env.JWT_SECRET || "your-secret-key");
};

// Create Post/Reel/Story
export const createContent = async (req, res) => {
  try {
    const decoded = verifyToken(req);
    const userId = decoded.userId;

    const {
      contentType, // 'post', 'reel', or 'story'
      content,
      media, // Array of {url, type, thumbnail?, duration?} for posts, single object for reels/stories
      location,
      hashtags,
      mentions,
      visibility // 'public', 'followers', 'close_friends'
    } = req.body;

    // Validation
    if (!contentType || !['post', 'reel', 'story'].includes(contentType)) {
      return res.status(400).json({
        success: false,
        message: "Valid contentType is required (post, reel, or story)"
      });
    }

    if (!media || (Array.isArray(media) && media.length === 0)) {
      return res.status(400).json({
        success: false,
        message: "At least one media item is required"
      });
    }

    let newContent;

    // Create based on content type
    if (contentType === 'post') {
      // Validate posts - only images allowed
      if (!Array.isArray(media)) {
        return res.status(400).json({
          success: false,
          message: "Posts must have media as an array"
        });
      }

      for (const item of media) {
        if (!item.url || item.type !== 'image') {
          return res.status(400).json({
            success: false,
            message: "Posts can only have images"
          });
        }
      }

      const postData = {
        author: userId,
        media: media.map(m => ({ url: m.url, type: 'image' })),
        visibility: visibility || 'public'
      };

      if (content) postData.content = content;
      if (location) postData.location = location;
      if (hashtags) postData.hashtags = hashtags;
      if (mentions) postData.mentions = mentions;

      newContent = new Post(postData);
      await newContent.save();

      // Add to user's posts array
      await User.findByIdAndUpdate(userId, {
        $push: { posts: newContent._id }
      });

    } else if (contentType === 'reel') {
      // Validate reels - single video required
      const videoData = Array.isArray(media) ? media[0] : media;
      
      if (!videoData || videoData.type !== 'video') {
        return res.status(400).json({
          success: false,
          message: "Reels must have exactly one video"
        });
      }

      const reelData = {
        author: userId,
        video: {
          url: videoData.url,
          thumbnail: videoData.thumbnail,
          duration: videoData.duration
        },
        visibility: visibility || 'public'
      };

      if (content) reelData.content = content;
      if (hashtags) reelData.hashtags = hashtags;
      if (mentions) reelData.mentions = mentions;

      newContent = new Reel(reelData);
      await newContent.save();

    } else if (contentType === 'story') {
      // Validate stories - single media required
      const storyMedia = Array.isArray(media) ? media[0] : media;
      
      if (!storyMedia || !['image', 'video'].includes(storyMedia.type)) {
        return res.status(400).json({
          success: false,
          message: "Stories must have one image or video"
        });
      }

      const storyData = {
        author: userId,
        media: {
          url: storyMedia.url,
          type: storyMedia.type,
          thumbnail: storyMedia.thumbnail,
          duration: storyMedia.duration
        },
        visibility: visibility || 'public'
      };

      newContent = new Story(storyData);
      await newContent.save();
    }

    // Populate author details
    await newContent.populate('author', 'username name');

    res.status(201).json({
      success: true,
      message: `${contentType.charAt(0).toUpperCase() + contentType.slice(1)} created successfully!`,
      content: newContent
    });

  } catch (error) {
    console.error("Create content error:", error);
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        message: "Invalid token"
      });
    }
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};

// Get content by type (posts, reels, or stories)
export const getContentByType = async (req, res) => {
  try {
    const decoded = verifyToken(req);
    const userId = decoded.userId;
    const { contentType } = req.params;

    if (!['post', 'reel', 'story'].includes(contentType)) {
      return res.status(400).json({
        success: false,
        message: "Invalid content type"
      });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    let contents, totalContents, Model;

    // Select the appropriate model
    if (contentType === 'post') {
      Model = Post;
    } else if (contentType === 'reel') {
      Model = Reel;
    } else if (contentType === 'story') {
      Model = Story;
    }

    // Build query
    const query = {};

    // For stories, only get non-expired ones
    if (contentType === 'story') {
      query.expiresAt = { $gt: new Date() };
    }

    contents = await Model.find(query)
      .populate('author', 'username name')
      .populate('likes', 'username')
      .populate('comments.user', 'username name')
      .populate('mentions', 'username name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    totalContents = await Model.countDocuments(query);

    res.status(200).json({
      success: true,
      contentType,
      contents,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalContents / limit),
        totalItems: totalContents,
        hasNextPage: page < Math.ceil(totalContents / limit)
      }
    });

  } catch (error) {
    console.error("Get content by type error:", error);
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        message: "Invalid token"
      });
    }
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};

// Get stories from followed users (Instagram-style stories feed)
export const getStoriesFeed = async (req, res) => {
  try {
    const decoded = verifyToken(req);
    const userId = decoded.userId;

    const currentUser = await User.findById(userId);
    if (!currentUser) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // Get stories from followed users + own stories
    const followingIds = [...currentUser.following, userId];

    const stories = await Story.find({
      author: { $in: followingIds },
      expiresAt: { $gt: new Date() }
    })
      .populate('author', 'username name')
      .populate('views.user', 'username')
      .sort({ createdAt: -1 });

    // Group stories by author
    const storiesByAuthor = stories.reduce((acc, story) => {
      const authorId = story.author._id.toString();
      if (!acc[authorId]) {
        acc[authorId] = {
          author: story.author,
          stories: [],
          hasViewed: false
        };
      }
      
      // Check if current user has viewed this story
      const viewed = story.views.some(view => view.user._id.toString() === userId);
      if (viewed) {
        acc[authorId].hasViewed = true;
      }
      
      acc[authorId].stories.push({
        _id: story._id,
        media: story.media,
        content: story.content,
        location: story.location,
        createdAt: story.createdAt,
        expiresAt: story.expiresAt,
        viewsCount: story.views.length,
        hasViewed: viewed
      });
      
      return acc;
    }, {});

    // Convert to array and sort (unviewed first)
    const storiesFeed = Object.values(storiesByAuthor).sort((a, b) => {
      if (a.hasViewed === b.hasViewed) return 0;
      return a.hasViewed ? 1 : -1;
    });

    res.status(200).json({
      success: true,
      storiesFeed
    });

  } catch (error) {
    console.error("Get stories feed error:", error);
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        message: "Invalid token"
      });
    }
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};

// View a story (mark as viewed)
export const viewStory = async (req, res) => {
  try {
    const decoded = verifyToken(req);
    const userId = decoded.userId;
    const { storyId } = req.params;

    const story = await Story.findById(storyId);

    if (!story) {
      return res.status(404).json({
        success: false,
        message: "Story not found"
      });
    }

    // Check if story has expired
    if (story.expiresAt < new Date()) {
      return res.status(400).json({
        success: false,
        message: "Story has expired"
      });
    }

    // Check if already viewed
    const alreadyViewed = story.views.some(view => view.user.toString() === userId);

    if (!alreadyViewed) {
      story.views.push({ user: userId });
      await story.save();
    }

    res.status(200).json({
      success: true,
      message: "Story viewed",
      viewsCount: story.views.length
    });

  } catch (error) {
    console.error("View story error:", error);
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        message: "Invalid token"
      });
    }
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};

// Like content (post/reel/story)
export const likeContent = async (req, res) => {
  try {
    const decoded = verifyToken(req);
    const userId = decoded.userId;
    const { contentId } = req.params;

    // Try to find in all three collections
    let content = await Post.findById(contentId);
    if (!content) content = await Reel.findById(contentId);
    if (!content) content = await Story.findById(contentId);

    if (!content) {
      return res.status(404).json({
        success: false,
        message: "Content not found"
      });
    }

    // Check if already liked
    const alreadyLiked = content.likes.some(like => like.toString() === userId);

    if (alreadyLiked) {
      // Unlike
      content.likes = content.likes.filter(like => like.toString() !== userId);
      await content.save();

      return res.status(200).json({
        success: true,
        message: "Content unliked",
        liked: false,
        likesCount: content.likes.length
      });
    } else {
      // Like
      content.likes.push(userId);
      await content.save();

      return res.status(200).json({
        success: true,
        message: "Content liked",
        liked: true,
        likesCount: content.likes.length
      });
    }

  } catch (error) {
    console.error("Like content error:", error);
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        message: "Invalid token"
      });
    }
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};

// Comment on content (post/reel)
export const commentOnContent = async (req, res) => {
  try {
    const decoded = verifyToken(req);
    const userId = decoded.userId;
    const { contentId } = req.params;
    const { text } = req.body;

    if (!text || text.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: "Comment text is required"
      });
    }

    // Try to find in Post or Reel (stories don't support comments)
    let content = await Post.findById(contentId);
    if (!content) content = await Reel.findById(contentId);

    if (!content) {
      return res.status(404).json({
        success: false,
        message: "Content not found or comments not supported"
      });
    }

    content.comments.push({
      user: userId,
      text: text.trim()
    });

    await content.save();
    await content.populate('comments.user', 'username name');

    res.status(201).json({
      success: true,
      message: "Comment added",
      comment: content.comments[content.comments.length - 1],
      commentsCount: content.comments.length
    });

  } catch (error) {
    console.error("Comment on content error:", error);
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        message: "Invalid token"
      });
    }
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};

// Delete content
export const deleteContent = async (req, res) => {
  try {
    const decoded = verifyToken(req);
    const userId = decoded.userId;
    const { contentId } = req.params;

    // Try to find in all three collections
    let content = await Post.findById(contentId);
    let contentType = 'post';
    let Model = Post;
    
    if (!content) {
      content = await Reel.findById(contentId);
      if (content) {
        contentType = 'reel';
        Model = Reel;
      }
    }
    
    if (!content) {
      content = await Story.findById(contentId);
      if (content) {
        contentType = 'story';
        Model = Story;
      }
    }

    if (!content) {
      return res.status(404).json({
        success: false,
        message: "Content not found"
      });
    }

    // Check if user is the author
    if (content.author.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "You can only delete your own content"
      });
    }

    // Remove from user's posts array (only for posts, not reels or stories)
    if (contentType === 'post') {
      await User.findByIdAndUpdate(userId, {
        $pull: { posts: contentId }
      });
    }

    await Model.findByIdAndDelete(contentId);

    res.status(200).json({
      success: true,
      message: `${contentType.charAt(0).toUpperCase() + contentType.slice(1)} deleted successfully`
    });

  } catch (error) {
    console.error("Delete content error:", error);
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        message: "Invalid token"
      });
    }
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};

// Get user's content (posts/reels/stories)
export const getUserContent = async (req, res) => {
  try {
    const decoded = verifyToken(req);
    const currentUserId = decoded.userId;
    const { userId } = req.params;
    const { contentType } = req.query; // Optional filter

    let contents = [];

    // Fetch based on content type filter
    if (!contentType || contentType === 'post') {
      const posts = await Post.find({ author: userId })
        .populate('author', 'username name')
        .populate('likes', 'username')
        .populate('comments.user', 'username name')
        .sort({ createdAt: -1 });
      contents = contents.concat(posts);
    }

    if (!contentType || contentType === 'reel') {
      const reels = await Reel.find({ author: userId })
        .populate('author', 'username name')
        .populate('likes', 'username')
        .populate('comments.user', 'username name')
        .sort({ createdAt: -1 });
      contents = contents.concat(reels);
    }

    if (!contentType || contentType === 'story') {
      const stories = await Story.find({ 
        author: userId,
        expiresAt: { $gt: new Date() }
      })
        .populate('author', 'username name')
        .populate('views.user', 'username')
        .sort({ createdAt: -1 });
      contents = contents.concat(stories);
    }

    // Sort all contents by creation date if fetching multiple types
    if (!contentType) {
      contents.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    res.status(200).json({
      success: true,
      contents,
      count: contents.length
    });

  } catch (error) {
    console.error("Get user content error:", error);
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        message: "Invalid token"
      });
    }
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};

// Get Reels feed (Explore reels)
export const getReelsFeed = async (req, res) => {
  try {
    const decoded = verifyToken(req);
    const userId = decoded.userId;

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const reels = await Reel.find({})
      .populate('author', 'username name')
      .populate('likes', 'username')
      .populate('comments.user', 'username name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalReels = await Reel.countDocuments({});

    // Add liked status for current user
    const reelsWithStatus = reels.map(reel => ({
      ...reel.toObject(),
      isLikedByCurrentUser: reel.likes.some(like => like._id.toString() === userId),
      likesCount: reel.likes.length,
      commentsCount: reel.comments.length
    }));

    res.status(200).json({
      success: true,
      reels: reelsWithStatus,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalReels / limit),
        totalReels,
        hasNextPage: page < Math.ceil(totalReels / limit)
      }
    });

  } catch (error) {
    console.error("Get reels feed error:", error);
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        message: "Invalid token"
      });
    }
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};
