import express from 'express';
import { 
  registerUser, 
  loginUser, 
  getProfile, 
  logoutUser, 
  refreshToken,
  verifyEmail,
  getUserProfile,
  getUserPosts,
  searchUsers,
  followUser,
  unfollowUser,
  checkFollowStatus,
  getFeedPosts,
  getAllPosts
} from '../controller/auth.controller.js';

const router = express.Router();

// Auth routes
router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/verify-email', verifyEmail);
router.get('/profile', getProfile);
router.get('/user/:userId', getUserProfile);
router.get('/user/:userId/posts', getUserPosts);
router.get('/search', searchUsers);
router.get('/feed', getFeedPosts);
router.get('/all-posts', getAllPosts);
router.post('/follow/:userId', followUser);
router.delete('/follow/:userId', unfollowUser);
router.get('/follow-status/:userId', checkFollowStatus);
router.post('/logout', logoutUser);
router.post('/refresh', refreshToken);

export default router;
