# F*Meta Production Deployment Guide

## Current Issue: Email Service on Render

Render.com (like many hosting providers) blocks outbound SMTP connections for security reasons. This is why you're seeing `Connection timeout` errors when trying to send emails via Gmail SMTP.

## Immediate Solutions

### Option 1: Use SendGrid (Recommended for Production)

SendGrid is a transactional email service that works well with hosting providers like Render.

1. **Sign up for SendGrid**: Go to https://sendgrid.com and create a free account
2. **Get API Key**: Generate an API key in SendGrid dashboard
3. **Add to Render Environment Variables**:
   ```
   SENDGRID_API_KEY=your_sendgrid_api_key_here
   ```
4. **Update From Email**: Use a verified domain/email in SendGrid

### Option 2: Use Mailgun

1. **Sign up for Mailgun**: Go to https://mailgun.com
2. **Get credentials**: Get your API key and domain
3. **Add to Render Environment Variables**:
   ```
   MAILGUN_API_KEY=your_mailgun_api_key
   MAILGUN_DOMAIN=your_mailgun_domain
   ```

### Option 3: Use Email Logging (Development/Testing)

Your app now falls back to console logging when email fails, so registration will still work. The verification emails will be logged to your Render console.

## Required Environment Variables for Render

Add these to your Render service environment variables:

```
# Essential for app functionality
JWT_SECRET=your_super_secret_jwt_key_here
MONGODB_URI=your_mongodb_connection_string

# Email configuration (choose one)
# Option 1: SendGrid
SENDGRID_API_KEY=your_sendgrid_api_key

# Option 2: Mailgun  
MAILGUN_API_KEY=your_mailgun_api_key
MAILGUN_DOMAIN=your_mailgun_domain

# Option 3: Gmail (may not work on Render)
Email=your_gmail_address
EmailPassword=your_gmail_app_password

# App configuration
NODE_ENV=production
FRONTEND_URL=https://fmet69.netlify.app
```

## Steps to Fix Email Issue

### Immediate Fix (Console Logging):
1. Your app will now work without email - users can register
2. Verification emails are logged to Render console
3. Check Render logs to see the verification links

### Production Fix (SendGrid):
1. Create SendGrid account: https://sendgrid.com
2. Verify your sender email address
3. Generate API key in SendGrid dashboard
4. Add `SENDGRID_API_KEY` to Render environment variables
5. Restart your Render service

## Testing the Fix

After adding the environment variables:

1. Try registering a new user
2. Check Render logs for email output
3. If using SendGrid/Mailgun, check their dashboards for delivery status

## Alternative Hosting Providers

If you want to use Gmail SMTP, consider these providers that allow SMTP:

1. **DigitalOcean App Platform** - Allows SMTP
2. **Railway** - Allows SMTP  
3. **Fly.io** - Allows SMTP
4. **Self-hosted VPS** - Full control

## Current App Status

✅ **What's Working:**
- User registration (even without email)
- Database connection
- Authentication
- Frontend deployment

⚠️ **What Needs Environment Variables:**
- JWT token generation (needs JWT_SECRET)
- Database operations (needs MONGODB_URI)
- Email sending (needs email service setup)

## Quick Fix Commands

To add environment variables to Render:
1. Go to your Render dashboard
2. Select your service
3. Go to "Environment" tab
4. Add the missing variables:
   - JWT_SECRET
   - MONGODB_URI
   - SENDGRID_API_KEY (or other email service)

## Email Service Comparison

| Service | Free Tier | Render Compatible | Setup Difficulty |
|---------|-----------|-------------------|------------------|
| SendGrid | 100 emails/day | ✅ Yes | Easy |
| Mailgun | 5,000 emails/month | ✅ Yes | Easy |
| Gmail SMTP | Unlimited | ❌ Blocked | N/A |
| Console Logging | Unlimited | ✅ Yes | Already setup |

The app is now resilient and will work even if email services fail!