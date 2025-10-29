import express from 'express';

const router = express.Router();

// Test route
router.get('/test', (req, res) => {
  res.json({ message: 'Routes working!' });
});

// Simple auth routes first
router.post('/register', (req, res) => {
  res.json({ message: 'Register endpoint' });
});

router.post('/login', (req, res) => {
  res.json({ message: 'Login endpoint' });
});

export default router;