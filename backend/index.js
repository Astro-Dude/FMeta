// Dependencies
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';

// Imports
import {connectDb} from './src/utils/db.js';
import authRoutes from './src/routes/auth.routes.js';

// setup
dotenv.config();
const app = express();
const PORT = process.env.PORT || 8000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);


// Basic route
app.get('/', (req, res) => {
  res.json({ 
    message: 'F-Meta API is running!',
    endpoints: {
      auth: {
        register: 'POST /api/auth/register',
        login: 'POST /api/auth/login',
        profile: 'GET /api/auth/profile',
        logout: 'POST /api/auth/logout',
        refresh: 'POST /api/auth/refresh'
      }
    }
  });
});

// Server
app.listen(PORT, async () => {
  console.log(`Server started on port ${PORT}`);
  await connectDb();
});