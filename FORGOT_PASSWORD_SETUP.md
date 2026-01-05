# Forgot Password Feature - Setup Guide

## Overview

The forgot password feature allows users to reset their password via email confirmation. This feature is now fully integrated into the application.

## How It Works

1. **User clicks "Forgot password?"** on the login page
2. **User enters email** in the forgot password dialog
3. **System sends reset email** via Supabase Auth
4. **User clicks link** in email (redirects to `/reset-password`)
5. **User enters new password** on reset page
6. **Password is updated** and user can log in

## Files Created/Modified

### New Files
- ✅ `src/pages/ResetPassword.tsx` - Password reset page component

### Modified Files
- ✅ `src/pages/Login.tsx` - Added "Forgot password?" link and dialog
- ✅ `src/App.tsx` - Added `/reset-password` route

## Features

### Login Page
- ✅ "Forgot password?" link next to "Remember me" checkbox
- ✅ Dialog for entering email address
- ✅ Success confirmation when email is sent
- ✅ Error handling for invalid emails

### Reset Password Page
- ✅ Password validation (8+ chars, uppercase, lowercase, number, special char)
- ✅ Password confirmation matching
- ✅ Clear error messages
- ✅ Success screen with auto-redirect
- ✅ Link back to login page

## Supabase Configuration Required

### 1. Set Redirect URL in Supabase Dashboard

1. Go to your Supabase project dashboard
2. Navigate to **Authentication** → **URL Configuration**
3. Add your reset password URL to **Redirect URLs**:
   - Development: `http://localhost:8080/reset-password`
   - Production: `https://yourdomain.com/reset-password`

### 2. Email Template (Optional)

Supabase sends password reset emails automatically. You can customize the email template:

1. Go to **Authentication** → **Email Templates**
2. Select **Reset Password** template
3. Customize the email content
4. Make sure the redirect URL includes: `{{ .ConfirmationURL }}`

Example email template:
```
Click the link below to reset your password:

{{ .ConfirmationURL }}

This link will expire in 1 hour.

If you didn't request this, please ignore this email.
```

## Security Features

- ✅ Rate limiting (handled by Supabase)
- ✅ Secure token-based reset links
- ✅ Token expiration (default: 1 hour)
- ✅ Password strength requirements
- ✅ Session validation before password update
- ✅ Prevents password reuse (if configured in Supabase)

## Password Requirements

Users must create passwords that meet these requirements:
- ✅ At least 8 characters long
- ✅ At least one uppercase letter (A-Z)
- ✅ At least one lowercase letter (a-z)
- ✅ At least one number (0-9)
- ✅ At least one special character (!@#$%^&*...)

## Testing

### Test Forgot Password Flow

1. **Go to login page** (`/login`)
2. **Click "Forgot password?"** link
3. **Enter email address** (must be registered)
4. **Click "Send Reset Link"**
5. **Check email** for reset link
6. **Click link** in email
7. **Enter new password** (meets requirements)
8. **Confirm password**
9. **Click "Reset Password"**
10. **Verify success** and redirect to login

### Test Error Cases

- ✅ Invalid email format
- ✅ Email not registered (still shows success for security)
- ✅ Expired reset link
- ✅ Weak password
- ✅ Passwords don't match
- ✅ Same password as current (if configured)

## User Experience Flow

```
Login Page
  ↓
Click "Forgot password?"
  ↓
Enter Email Dialog
  ↓
Email Sent Confirmation
  ↓
[User checks email]
  ↓
Click Reset Link
  ↓
Reset Password Page
  ↓
Enter New Password
  ↓
Password Updated Successfully
  ↓
Redirect to Login Page
```

## Troubleshooting

### Email Not Received

1. Check spam/junk folder
2. Verify email address is correct
3. Check Supabase email logs
4. Verify redirect URL is configured in Supabase
5. Check rate limiting (may need to wait)

### Reset Link Not Working

1. Verify redirect URL is set in Supabase dashboard
2. Check if link has expired (1 hour default)
3. Ensure URL matches exactly (including protocol)
4. Check browser console for errors

### Password Update Fails

1. Verify password meets all requirements
2. Check if passwords match
3. Verify session is valid (user clicked email link)
4. Check Supabase logs for errors

## Production Checklist

Before deploying to production:

- ✅ Configure redirect URL in Supabase dashboard
- ✅ Set production domain in redirect URL
- ✅ Customize email template (optional)
- ✅ Test full flow in production environment
- ✅ Verify email delivery works
- ✅ Test with different email providers
- ✅ Configure rate limiting (if needed)
- ✅ Set up email monitoring/alerts

## Notes

- Supabase handles email sending automatically
- Reset links expire after 1 hour (configurable in Supabase)
- Users can request multiple reset emails (rate limited by Supabase)
- Password reset invalidates all existing sessions for security
- The reset page automatically detects if user came from email link

## Support

If you encounter issues:
1. Check Supabase dashboard logs
2. Verify redirect URL configuration
3. Test with a known working email address
4. Check browser console for errors
5. Verify Supabase project settings

