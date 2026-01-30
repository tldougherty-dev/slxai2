# Supabase Email Troubleshooting Guide

## Issue: Password Reset Email Not Received

If you're not receiving password reset emails from Supabase, here are the steps to diagnose and fix:

## Common Causes

### 1. **Supabase Email Not Configured**
Supabase uses its own email service by default, but it may need configuration.

**Check:**
1. Go to Supabase Dashboard → **Authentication** → **Email Templates**
2. Verify the "Reset Password" template exists
3. Check if emails are enabled

**Fix:**
- Supabase sends emails automatically, but you may need to configure SMTP for production
- For development, Supabase should send emails automatically

### 2. **Email Going to Spam**
Password reset emails often go to spam/junk folders.

**Check:**
- Spam/Junk folder
- Promotions tab (Gmail)
- Check email filters

### 3. **User Doesn't Exist**
Supabase returns success even if the user doesn't exist (for security). The email won't be sent.

**Check:**
1. Verify the email address is registered in Supabase
2. Go to Supabase Dashboard → **Authentication** → **Users**
3. Search for the email address

### 4. **Redirect URL Not Configured**
The redirect URL must be whitelisted in Supabase.

**Fix:**
1. Go to Supabase Dashboard → **Authentication** → **URL Configuration**
2. Add to **Redirect URLs**:
   - `http://localhost:8080/reset-password` (development)
   - `https://yourdomain.com/reset-password` (production)

### 5. **SMTP Not Configured (Production)**
For production, you may need to configure custom SMTP.

**Check:**
1. Go to Supabase Dashboard → **Project Settings** → **Auth**
2. Check "SMTP Settings"
3. If not configured, Supabase uses its default email service

## Diagnostic Steps

### Step 1: Check Browser Console
Open browser DevTools (F12) → Console tab
- Look for any errors when clicking "Send Reset Link"
- Check for Supabase-related errors

### Step 2: Check Supabase Logs
1. Go to Supabase Dashboard → **Logs** → **Auth Logs**
2. Look for password reset attempts
3. Check for any errors

### Step 3: Verify Email Address
1. Make sure the email address is correct
2. Check for typos
3. Verify the email is registered in Supabase

### Step 4: Test with Different Email
Try with a different email address to see if the issue is email-specific.

### Step 5: Check Rate Limiting
Supabase has rate limits. If you've requested multiple resets:
- Wait 1 hour before trying again
- Check Supabase logs for rate limit errors

## Quick Fixes

### Fix 1: Configure Redirect URL
```bash
# In Supabase Dashboard:
# Authentication → URL Configuration → Redirect URLs
# Add: http://localhost:8080/reset-password
```

### Fix 2: Check Email Template
```bash
# In Supabase Dashboard:
# Authentication → Email Templates → Reset Password
# Make sure template includes: {{ .ConfirmationURL }}
```

### Fix 3: Verify User Exists
```sql
-- Run in Supabase SQL Editor:
SELECT email, created_at 
FROM auth.users 
WHERE email = 'your-email@example.com';
```

### Fix 4: Enable Email Auth Provider
```bash
# In Supabase Dashboard:
# Authentication → Providers → Email
# Make sure "Enable Email provider" is ON
```

## Alternative: Use Resend for Password Reset

Since you already have Resend configured, we can create a custom password reset flow using Resend instead of Supabase's built-in email.

**Benefits:**
- More control over email content
- Better deliverability
- Custom branding
- Email tracking

**Would you like me to implement a Resend-based password reset?**

## Testing Checklist

- [ ] Redirect URL configured in Supabase
- [ ] Email address exists in Supabase users
- [ ] Checked spam/junk folder
- [ ] No rate limiting errors
- [ ] Browser console shows no errors
- [ ] Supabase logs show email attempt
- [ ] Email provider not blocking Supabase emails

## Still Not Working?

If none of the above fixes work:

1. **Check Supabase Status**: https://status.supabase.com
2. **Contact Supabase Support**: Check their documentation
3. **Use Resend Instead**: We can implement custom password reset with Resend
4. **Check Email Provider**: Some providers block automated emails

## Next Steps

1. Check the browser console for errors
2. Verify redirect URL is configured
3. Check Supabase logs
4. Verify user exists in Supabase
5. Consider using Resend for better control

