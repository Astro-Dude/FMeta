# F*Meta Social Media Platform

A full-stack Instagram-inspired social media platform built with React.js, Node.js, Express.js, and MongoDB.

## 📋 Table of Contents

- [Project Overview](#project-overview)
- [Tech Stack](#tech-stack)
- [Features](#features)
- [Project Structure](#project-structure)
- [Installation & Setup](#installation--setup)
- [Environment Configuration](#environment-configuration)
- [API Documentation](#api-documentation)
- [Frontend Components](#frontend-components)
- [Database Schema](#database-schema)
- [Email Verification System](#email-verification-system)
- [Development Workflow](#development-workflow)
- [Production Deployment](#production-deployment)
- [Troubleshooting](#troubleshooting)

## 🚀 Project Overview

F*Meta is a modern social media platform that replicates Instagram's core functionality with features like user authentication, email verification, and a dynamic dashboard feed.

### Key Features
- ✅ User Registration & Login
- ✅ Email Verification System
- ✅ JWT-based Authentication
- ✅ Instagram-like UI/UX with Mobile-First Design
- ✅ Fully Responsive Design (Mobile/Tablet/Desktop)
- ✅ Instagram-Style Profile Layouts
- ✅ Responsive Sidebar Navigation
- ✅ Mobile Bottom Navigation Bar
- ✅ Dashboard with Random Posts
- ✅ User Search & Profile Viewing
- ✅ Follow/Unfollow System
- ✅ Password Show/Hide Toggle
- ✅ Real-time Form Validation

## 🛠 Tech Stack

### Frontend
- **React.js** (18+) - UI Library
- **Vite** - Build Tool
- **Tailwind CSS** - Styling
- **React Router Dom** - Routing
- **Lucide React** - Icons

### Backend
- **Node.js** - Runtime Environment
- **Express.js** - Web Framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **Bcryptjs** - Password Hashing
- **Nodemailer** - Email Service

## 📁 Project Structure

```
Social_Media/
├── backend/
│   ├── src/
│   │   ├── controller/
│   │   │   └── auth.controller.js
│   │   ├── models/
│   │   │   ├── user.model.js
│   │   │   └── post.model.js
│   │   ├── routes/
│   │   │   └── auth.routes.js
│   │   └── utils/
│   │       └── db.js
│   ├── .env
│   ├── .env.example
│   ├── index.js
│   └── package.json
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── ProtectedRoute.jsx
    │   │   └── ui/
    │   │       ├── button.jsx
    │   │       └── input.jsx
    │   ├── config/
    │   │   └── api.js
    │   ├── elements/
    │   │   ├── Authorisation/
    │   │   │   ├── loginCard.jsx
    │   │   │   └── signupCard.jsx
    │   │   └── Dashboard/
    │   │       ├── FeedContent.jsx
    │   │       ├── ProfileContent.jsx
    │   │       ├── SearchContent.jsx
    │   │       └── Sidebar.jsx
    │   ├── pages/
    │   │   ├── authorisation.jsx
    │   │   ├── dashboard.jsx
    │   │   └── emailVerification.jsx
    │   ├── utils/
    │   │   └── auth.js
    │   ├── App.jsx
    │   ├── App.css
    │   └── main.jsx
    ├── .env
    ├── index.html
    ├── package.json
    └── vite.config.js
```

## 🔧 Installation & Setup

### Prerequisites
- Node.js (16+ recommended)
- MongoDB Atlas account or local MongoDB
- Gmail account for email service

### Clone Repository
```bash
git clone <your-repository-url>
cd Social_Media
```

### Backend Setup
```bash
cd backend
npm install
```

### Frontend Setup
```bash
cd frontend
npm install
```

## ⚙️ Environment Configuration

### Backend (.env)
```env
# Server Configuration
NODE_ENV=development
PORT=8000

# Database
dbURL=your-mongodb-atlas-production-url

# JWT Configuration
JWT_SECRET=your-super-secure-jwt-secret-key

# Frontend URL
FRONTEND_URL=http://localhost:5173

# Email Configuration
Email=your-production-email@gmail.com
EmailPassword=your-gmail-app-password
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:8000
```

### Production Environment Variables

#### Backend (.env.production)
```env
NODE_ENV=production
PORT=8000
dbURL=your-mongodb-atlas-production-url
JWT_SECRET=your-super-secure-production-jwt-secret
FRONTEND_URL=https://yourdomain.com
Email=your-production-email@gmail.com
EmailPassword=your-gmail-app-password
```

#### Frontend (.env.production)
```env
VITE_API_URL=https://api.yourdomain.com
```

## 📡 API Documentation

### Base URL
- **Development**: `http://localhost:8000/api`
- **Production**: `https://api.yourdomain.com/api`

### Authentication Endpoints

#### Register User
```http
POST /auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "username": "johndoe123",
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Registration successful! Please check your email to verify your account.",
  "requiresVerification": true
}
```

#### Verify Email
```http
GET /auth/verify-email?token=verification_token
```

**Response:**
```json
{
  "success": true,
  "message": "Email verified successfully!"
}
```

#### Login User
```http
POST /auth/login
Content-Type: application/json

{
  "emailOrPhoneOrUsername": "johndoe123",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "user": {
    "_id": "user_id",
    "name": "John Doe",
    "username": "johndoe123",
    "email": "john@example.com",
    "isEmailVerified": true
  },
  "token": "jwt_token_here"
}
```

#### Get Profile
```http
GET /auth/profile
Authorization: Bearer <jwt_token>
```

#### Logout
```http
POST /auth/logout
Authorization: Bearer <jwt_token>
```

#### Refresh Token
```http
POST /auth/refresh
Authorization: Bearer <jwt_token>
```

## 🎨 Frontend Components

### Core Components

#### AuthCard Components
- **LoginCard** (`/src/elements/Authorisation/loginCard.jsx`)
  - Email/Username/Phone login
  - Password show/hide toggle
  - Form validation
  - API integration

- **SignupCard** (`/src/elements/Authorisation/signupCard.jsx`)
  - User registration form
  - Email verification flow
  - Success/error messaging
  - Instagram-style UI

#### Dashboard Components
- **Sidebar** (`/src/elements/Dashboard/Sidebar.jsx`)
  - Responsive navigation system
  - Desktop sidebar (lg: breakpoint)
  - Mobile bottom navigation bar
  - Instagram-style navigation icons
  - User profile integration

- **FeedContent** (`/src/elements/Dashboard/FeedContent.jsx`)
  - Instagram-like post feed
  - Random post generation
  - Responsive grid layout
  - Interactive post elements

- **ProfileContent** (`/src/elements/Dashboard/ProfileContent.jsx`)
  - Instagram-style profile layout
  - Mobile-first responsive design
  - Desktop/mobile layout variations
  - Profile picture, stats, and bio sections
  - Action buttons (Edit profile/Follow/Message)
  - Posts grid with hover effects

- **SearchContent** (`/src/elements/Dashboard/SearchContent.jsx`)
  - User search functionality
  - Recent searches with localStorage
  - Profile viewing with follow/unfollow
  - Responsive search results
  - Instagram-style user cards

#### Pages
- **Authorisation** (`/src/pages/authorisation.jsx`)
  - Toggle between login/signup
  - Responsive design
  - Centralized authentication

- **Dashboard** (`/src/pages/dashboard.jsx`)
  - Main app interface
  - Responsive layout with sidebar integration
  - Dynamic content switching (Feed/Search/Profile)
  - Protected route implementation

- **EmailVerification** (`/src/pages/emailVerification.jsx`)
  - Token-based verification
  - Success/error handling
  - Automatic redirection

#### UI Components
- **Button** (`/src/components/ui/button.jsx`)
  - Reusable button component
  - Multiple variants and sizes
  - Consistent styling across app

- **Input** (`/src/components/ui/input.jsx`)
  - Form input component
  - Validation states
  - Instagram-style design

### Responsive Design Features

#### Mobile Layout (320px - 1023px)
- **Profile Layout**: Horizontal layout with profile picture left, stats right
- **Navigation**: Bottom navigation bar with 5 main icons
- **Buttons**: Compact sizing with touch-friendly targets
- **Typography**: Scaled text sizes for mobile readability
- **Spacing**: Optimized padding and margins for small screens

#### Desktop Layout (1024px+)
- **Profile Layout**: Traditional side-by-side layout
- **Navigation**: Left sidebar with full labels
- **Buttons**: Larger desktop-style buttons
- **Typography**: Larger text for desktop viewing
- **Spacing**: Generous padding and spacing

#### Responsive Breakpoints
- **Base**: Mobile-first (320px+)
- **sm**: Large mobile (640px+)
- **md**: Tablet (768px+)
- **lg**: Desktop transformation (1024px+)
- **xl**: Large desktop (1280px+)

### Styling
- **Framework**: Tailwind CSS with custom responsive utilities
- **Theme**: Dark theme (Instagram-inspired)
- **Design System**: Mobile-first with progressive enhancement
- **Icons**: Lucide React for consistent iconography
- **Layout**: CSS Grid and Flexbox for responsive layouts

## 🗄️ Database Schema

### User Model
```javascript
{
  name: String (required),
  username: String (required, unique),
  email: String (unique, sparse),
  phone: String (unique, sparse),
  password: String (required),
  bio: String,
  profilePicture: String,
  isEmailVerified: Boolean (default: false),
  emailVerificationToken: String,
  emailVerificationExpires: Date,
  followers: [ObjectId] (ref: User),
  following: [ObjectId] (ref: User),
  posts: [ObjectId] (ref: Post),
  createdAt: Date,
  updatedAt: Date
}
```

### Post Model
```javascript
{
  content: String (required),
  author: ObjectId (ref: User, required),
  images: [String],
  likes: [ObjectId] (ref: User),
  comments: [{
    user: ObjectId (ref: User),
    text: String,
    createdAt: Date
  }],
  location: String,
  hashtags: [String],
  createdAt: Date,
  updatedAt: Date
}
```

## 📧 Email Verification System

### Flow
1. User registers with email
2. Backend generates verification token (24-hour expiry)
3. Email sent with verification link
4. User clicks link → Frontend verification page
5. Token validated → User marked as verified
6. Redirect to login page

### Email Configuration
- **Service**: Gmail SMTP
- **Security**: App Password required
- **Template**: HTML email with F*Meta branding

### Gmail Setup
1. Enable 2-Factor Authentication
2. Generate App Password
3. Use App Password in EmailPassword env variable

## 🔄 Development Workflow

### Starting Development Servers

#### Backend
```bash
cd backend
node index.js  # Start backend server
```

#### Frontend
```bash
cd frontend
npm run dev  # Using Vite dev server
```

### Development URLs
- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:8000
- **API Base**: http://localhost:8000/api

### Testing Authentication Flow
1. Register new user at `/auth/register`
2. Check email for verification link
3. Click verification link
4. Login with verified credentials
5. Access dashboard

## 🚀 Production Deployment

### Deployment Platforms

#### Frontend (Recommended: Vercel)
```bash
# Build for production
npm run build

# Deploy to Vercel
vercel --prod
```

#### Backend (Recommended: Railway/Render)
```bash
# Set environment variables
# Deploy using platform-specific method
```

### Domain Configuration
```
Frontend: https://yourdomain.com
Backend:  https://api.yourdomain.com
```

### Production Checklist
- [ ] Update FRONTEND_URL in backend .env
- [ ] Update API_BASE_URL in frontend config
- [ ] Set secure JWT_SECRET
- [ ] Configure CORS for production domain
- [ ] Use MongoDB Atlas
- [ ] Set NODE_ENV=production
- [ ] Test email verification flow
- [ ] Verify all API endpoints
- [ ] Test complete user journey

### CORS Configuration for Production
```javascript
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://yourdomain.com']
    : ['http://localhost:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
};
```

## 🔍 Troubleshooting

### Common Issues

#### Email Not Sending
- Check Gmail App Password
- Verify email environment variables
- Check SMTP configuration
- Review console logs for email errors

#### CORS Errors
- Update corsOptions for your domain
- Check FRONTEND_URL environment variable
- Verify API_BASE_URL in frontend config

#### Token Verification Fails
- Check JWT_SECRET consistency
- Verify token expiration
- Check Authorization header format

#### Database Connection Issues
- Verify MongoDB Atlas connection string
- Check IP whitelist in Atlas
- Confirm database credentials

#### Port Issues
- Frontend runs on port 5173
- Backend runs on port 8000
- Ensure no port conflicts

### Debug Commands
```bash
# Check environment variables
node -e "console.log(process.env)"

# Test database connection
node -e "require('./src/utils/db.js').connectDb()"

# Test email configuration
node -e "console.log(process.env.Email, process.env.EmailPassword)"
```

## 📝 Development Notes

### Code Standards
- Use ES6+ syntax
- Implement proper error handling
- Add console logging for debugging
- Follow RESTful API conventions
- Use async/await for asynchronous operations

### Security Best Practices
- Never commit .env files
- Use secure JWT secrets
- Implement proper CORS
- Validate all inputs
- Hash passwords with bcrypt
- Set token expiration times

### Performance Considerations
- Implement pagination for posts
- Use MongoDB indexes for faster queries
- Optimize bundle size with code splitting
- Implement caching strategies
- Use CDN for static assets
- Lazy load images and components
- Implement virtual scrolling for large lists
- Optimize responsive images with srcset
- Use service workers for offline functionality

## 🎯 Current Implementation Status

### ✅ Completed Features
- **Authentication System**
  - User registration and login
  - Email verification system
  - JWT authentication with refresh tokens
  - Password hashing with bcrypt
  - Protected routes implementation

- **User Interface**
  - Instagram-style UI components
  - Fully responsive design (mobile/tablet/desktop)
  - Mobile-first approach with progressive enhancement
  - Dark theme with Instagram-inspired styling

- **Navigation System**
  - Responsive sidebar for desktop
  - Mobile bottom navigation bar
  - Dynamic content switching
  - Instagram-style navigation icons

- **Profile System**
  - User profile viewing and editing
  - Instagram-like profile layouts
  - Responsive profile sections
  - Profile picture, bio, and stats display

- **Search & Discovery**
  - User search functionality
  - Recent searches with localStorage
  - Profile viewing from search results
  - Follow/unfollow system integration

- **Dashboard Features**
  - Feed with random posts
  - Interactive post grid
  - Responsive layout system
  - User authentication checks

- **Technical Features**
  - Error and success messaging
  - Form validation
  - API integration
  - Centralized configuration
  - Email verification flow

### 🚧 Pending Features
- **Post Management**
  - Post creation and editing
  - Image upload functionality
  - Post deletion and archiving
  - Story feature implementation

- **Social Features**
  - Like and comment system
  - Real-time notifications
  - Direct messaging
  - Activity feed

- **Enhanced Features**
  - Advanced search filters
  - Hashtag system
  - Location tagging
  - User mentions

- **Performance & Optimization**
  - Image optimization
  - Lazy loading
  - Caching strategies
  - Performance monitoring

**Project**: F*Meta Social Media Platform  
**Version**: 1.0.0
