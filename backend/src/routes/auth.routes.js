import express from 'express';
import { 
  registerUser, 
  loginUser, 
  getProfile, 
  logoutUser, 
  refreshToken,
  verifyEmail 
} from '../controller/auth.controller.js';

const router = express.Router();

// Auth routes
router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/verify-email', verifyEmail);
router.get('/profile', getProfile);
router.post('/logout', logoutUser);
router.post('/refresh', refreshToken);

export default router;
