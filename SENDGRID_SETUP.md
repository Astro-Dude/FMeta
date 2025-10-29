# SendGrid Setup Guide for F*Meta

## Why SendGrid?
SendGrid works perfectly with hosting providers like Render that block direct SMTP connections. It's reliable, has excellent deliverability, and a generous free tier.

## Step 1: Create SendGrid Account

1. Go to https://sendgrid.com
2. Sign up for a free account (100 emails/day free forever)
3. Complete email verification for your SendGrid account

## Step 2: Verify Your Sender Email

### Option A: Single Sender Verification (Recommended for Quick Setup)

1. In SendGrid dashboard, go to **Settings** → **Sender Authentication**
2. Click **Verify a Single Sender**
3. Fill in the form:
   - **From Name**: F*Meta Team
   - **From Email Address**: Your email (e.g., your-email@gmail.com)
   - **Reply To**: Same as above or different
   - **Company Address**: Your address details
4. Click **Create**
5. Check your email and click the verification link
6. Once verified, you'll see a green checkmark

### Option B: Domain Authentication (For Custom Domain - Advanced)

1. Go to **Settings** → **Sender Authentication**
2. Click **Authenticate Your Domain**
3. Follow the DNS setup instructions
4. Wait for DNS propagation (can take up to 48 hours)

## Step 3: Create API Key

1. In SendGrid dashboard, go to **Settings** → **API Keys**
2. Click **Create API Key**
3. Give it a name: `FMeta Production`
4. Select **Full Access** (or at minimum, **Mail Send** permissions)
5. Click **Create & View**
6. **IMPORTANT**: Copy the API key NOW - you won't see it again!
   - It looks like: `SG.xxxxxxxxxxxxxxxxxx.yyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyy`

## Step 4: Add DNS Records for Domain (From your screenshot)

If you're using a custom domain with Netlify, add these DNS records to your domain provider:

```
Type: CNAME
Host: em3967.fmet69.netlify.app/
Value: u57015280.wl031.sendgrid.net

Type: CNAME
Host: s1._domainkey.fmet69.netlify.app/
Value: s1.domainkey.u57015280.wl031.sendgrid.net

Type: CNAME
Host: s2._domainkey.fmet69.netlify.app/
Value: s2.domainkey.u57015280.wl031.sendgrid.net

Type: TXT
Host: _dmarc.fmet69.netlify.app/
Value: v=DMARC1; p=none;
```

**Note**: These records improve email deliverability and authentication.

## Step 5: Configure Environment Variables

### For Local Development (.env file):

```env
# SendGrid Configuration (Primary)
SENDGRID_API_KEY=SG.your_api_key_here
SENDGRID_VERIFIED_SENDER=your-verified-email@example.com

# Fallback to Gmail (Optional - for local development)
Email=your-gmail@gmail.com
EmailPassword=your-gmail-app-password

# Other required variables
JWT_SECRET=your-super-secret-jwt-key-here
MONGODB_URI=your-mongodb-connection-string
FRONTEND_URL=http://localhost:5173
NODE_ENV=development
```

### For Render Production:

Go to your Render dashboard → Your service → Environment tab and add:

```
SENDGRID_API_KEY=SG.your_api_key_here
SENDGRID_VERIFIED_SENDER=your-verified-email@example.com
JWT_SECRET=your-super-secret-jwt-key-here
MONGODB_URI=your-mongodb-connection-string
FRONTEND_URL=https://fmet69.netlify.app
NODE_ENV=production
```

## Step 6: Test Email Sending

1. Deploy your backend with the new environment variables
2. Try registering a new user
3. Check SendGrid dashboard for email activity:
   - Go to **Activity** tab to see email delivery status
   - Check for any bounces or blocks

## How It Works

Your app now supports **two email methods**:

1. **SendGrid** (Priority): If `SENDGRID_API_KEY` is set, it will use SendGrid
2. **Gmail SMTP** (Fallback): If SendGrid is not configured, it falls back to Gmail

## Troubleshooting

### Issue: "Email not sending"
**Solution**: Check SendGrid Activity dashboard for errors. Common issues:
- Unverified sender email
- API key doesn't have Mail Send permissions
- Daily sending limit exceeded (100/day on free tier)

### Issue: "Emails going to spam"
**Solution**: 
- Complete domain authentication (DNS records)
- Use a verified custom domain instead of Gmail
- Avoid spam trigger words in subject/content

### Issue: "Access forbidden" error
**Solution**: 
- Regenerate API key with proper permissions
- Make sure you copied the full API key

## SendGrid Free Tier Limits

- ✅ 100 emails per day (forever free)
- ✅ All email types (transactional, marketing)
- ✅ API access
- ✅ Email validation
- ✅ Analytics and reporting

## Upgrade Plans (if needed later)

- **Essentials**: $19.95/mo - 50,000 emails/month
- **Pro**: $89.95/mo - 100,000 emails/month

## Email Best Practices

1. **Keep it short**: Concise subject lines perform better
2. **Avoid spam words**: Free, winner, urgent, click here
3. **Test first**: Send test emails before going live
4. **Monitor metrics**: Check SendGrid analytics regularly
5. **Verify senders**: Always use verified email addresses

## Support

- SendGrid Docs: https://docs.sendgrid.com
- SendGrid Support: https://support.sendgrid.com
- Status Page: https://status.sendgrid.com

---

Your app is now configured to use SendGrid! 🚀
