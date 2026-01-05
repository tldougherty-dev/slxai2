# Resend Email Service Setup Guide

## ✅ Setup Complete

The Resend email service has been integrated into your application. Here's what was set up:

### Files Created/Modified

1. **`src/lib/email.ts`** - Complete email service with:
   - Resend integration
   - Notification preference checking
   - Email templates
   - Multiple notification types support

2. **`src/pages/membership-portal/Admin.tsx`** - Updated to use real email service

3. **`.env.example`** - Template for environment variables

## 🔑 Setting Up Your API Key

### Step 1: Create `.env` file

Create a `.env` file in the root of your project (same directory as `package.json`) with:

```env
VITE_RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

**Important:** 
- The `.env` file is already in `.gitignore` (it won't be committed to git)
- Never commit your API keys to version control
- For production, set this as an environment variable in your hosting platform

### Step 2: Restart Development Server

After creating/updating `.env`, restart your dev server:

```bash
# Stop the current server (Ctrl+C)
# Then restart:
npm run dev
```

### Step 3: Verify Domain in Resend

1. Go to [Resend Dashboard](https://resend.com/domains)
2. Add and verify your domain (e.g., `slxai.org`)
3. Update the `DEFAULT_FROM_EMAIL` in `src/lib/email.ts` to use your verified domain

**For testing:** You can use Resend's test domain `onboarding@resend.dev` temporarily, but you'll need a verified domain for production.

## 📧 Email Functions Available

All email functions automatically check user notification preferences before sending:

### Core Functions
- `sendApprovalEmail()` - Member approval emails
- `sendNewPostNotification()` - New feed posts
- `sendReplyNotification()` - Post/comment replies
- `sendNewVoteNotification()` - New votes created
- `sendVoteEndingSoonNotification()` - Vote reminders
- `sendNewFileNotification()` - New file uploads
- `sendDiscussionMessageNotification()` - Discussion messages
- `sendMentionNotification()` - User mentions
- `sendSystemAnnouncement()` - System announcements

### Usage Example

```typescript
import { sendNewPostNotification } from '@/lib/email';

// This will automatically check if user wants feed notifications
await sendNewPostNotification(
  userEmail,
  'John Doe',
  'Check out this new research!',
  'https://slxai.org/membership-portal/feed/post-123',
  userId
);
```

## 🎨 Email Templates

All emails use a consistent template with:
- SLxAI branding
- Responsive design
- Action buttons (when applicable)
- Unsubscribe/manage preferences links

## 🔒 Security Features

1. **API Key Protection**
   - Stored in environment variables
   - Never exposed to client-side code
   - Checked before sending emails

2. **Notification Preferences**
   - All emails respect user preferences
   - Users can unsubscribe via link in emails
   - Preferences stored securely in database

3. **Error Handling**
   - Graceful failures (won't crash app)
   - Development mode logging
   - Production mode silent failures

## 🧪 Testing

### Test Email Sending

1. Make sure `.env` file has your API key
2. Restart dev server
3. Try approving an interest submission in Admin panel
4. Check Resend dashboard for sent emails

### Test Notification Preferences

1. Go to `/membership-portal/notifications`
2. Disable a notification type (e.g., "New Posts")
3. Trigger that notification type
4. Verify email is NOT sent

## 📊 Resend Dashboard

Monitor your emails at:
- **Dashboard:** https://resend.com/emails
- **API Keys:** https://resend.com/api-keys
- **Domains:** https://resend.com/domains
- **Logs:** https://resend.com/logs

## 🚀 Production Deployment

### Environment Variables

Set these in your hosting platform (Vercel, Netlify, etc.):

```
VITE_RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### Domain Verification

1. Add your domain in Resend dashboard
2. Add DNS records as instructed
3. Wait for verification (usually 5-10 minutes)
4. Update `DEFAULT_FROM_EMAIL` in `src/lib/email.ts`

### Rate Limits

- **Free Tier:** 3,000 emails/month, 100 emails/day
- **Pro Tier ($20/mo):** 50,000 emails/month

Monitor usage in Resend dashboard.

## 🔧 Troubleshooting

### Emails Not Sending

1. **Check API Key**
   - Verify `.env` file exists and has correct key
   - Restart dev server after adding `.env`
   - Check for typos in variable name

2. **Check Resend Dashboard**
   - Look for error messages
   - Check API key is active
   - Verify domain is verified (for production)

3. **Check Console**
   - Development mode shows email logs
   - Check for error messages

### "Email service not configured" Warning

- Make sure `VITE_RESEND_API_KEY` is set in `.env`
- Restart dev server
- Check variable name matches exactly

### Domain Not Verified

- For testing: Use `onboarding@resend.dev`
- For production: Verify domain in Resend dashboard
- Update `DEFAULT_FROM_EMAIL` after verification

## 📝 Next Steps

1. ✅ Create `.env` file with API key
2. ✅ Restart dev server
3. ✅ Test email sending (approve an interest submission)
4. ⏳ Verify domain in Resend (for production)
5. ⏳ Update `DEFAULT_FROM_EMAIL` to your domain
6. ⏳ Integrate email sending into other features:
   - Feed posts
   - Comments/replies
   - Votes
   - File uploads
   - Discussion messages

## 🎯 Integration Points

Here are places where you can add email notifications:

1. **Feed Posts** (`src/data/feed.ts`)
   - When new post created → `sendNewPostNotification()`

2. **Comments** (`src/data/feed.ts`)
   - When comment added → `sendReplyNotification()`

3. **Votes** (`src/data/votes.ts`)
   - When vote created → `sendNewVoteNotification()`
   - 24h before vote ends → `sendVoteEndingSoonNotification()`

4. **Files** (`src/data/filesOrder.ts`)
   - When file uploaded → `sendNewFileNotification()`

5. **Discussions** (`src/data/discussions.ts`)
   - When message posted → `sendDiscussionMessageNotification()`
   - When mentioned → `sendMentionNotification()`

All functions automatically check notification preferences!

