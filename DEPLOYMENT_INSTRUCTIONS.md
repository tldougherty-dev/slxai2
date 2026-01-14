# Deployment Instructions for Production

**Project:** SLxAI Membership Portal  
**Status:** Ready for Production  
**Last Updated:** January 2025

---

## 📋 Pre-Deployment Checklist

Before deploying, ensure you have access to:
- [ ] GitHub repository access
- [ ] Deployment platform access (Vercel/Netlify/etc.)
- [ ] Supabase project dashboard access
- [ ] Resend dashboard access (for email)
- [ ] Google Cloud Console access (optional, for translations)

---

## 🔐 Step 1: Set Environment Variables

### Required Variables (CRITICAL)

Set these in your deployment platform **before** deploying:

#### 1. VITE_SUPABASE_URL
- **Value:** `https://vkeuqauhfjgtcjigiymm.supabase.co`
- **Where to find:** Supabase Dashboard → Settings → API → Project URL
- **Required:** Yes

#### 2. VITE_SUPABASE_ANON_KEY
- **Value:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZrZXVxYXVoZmpndGNqaWdpeW1tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM5Mjc3NjUsImV4cCI6MjA3OTUwMzc2NX0.s-TjC-qGxleLZGT2xy80KhESIgpZ99Ylzo57KJI45BA`
- **Where to find:** Supabase Dashboard → Settings → API → Project API keys → `anon` `public`
- **Required:** Yes

#### 3. RESEND_API_KEY (Server-side - for API endpoint)
- **Value:** Your Resend API key (starts with `re_`)
- **Where to find:** Resend Dashboard → API Keys
- **Required:** Yes
- **Note:** This is used by the serverless API endpoint (`/api/send-email`). Do NOT use `VITE_` prefix as this is a server-side variable. Set this in your Vercel project environment variables.

### Optional Variables

#### 4. VITE_TRANSLATION_API_KEY
- **Value:** Your Google Translate API key
- **Where to find:** Google Cloud Console → APIs & Services → Credentials
- **Required:** No (but recommended if using translations)

---

## 🚀 Step 2: Deploy to Production

### Option A: Vercel (Recommended)

1. **Connect Repository**
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "Add New Project"
   - Import from GitHub: `tldougherty-dev/slxai`
   - Select repository

2. **Configure Project**
   - Framework Preset: **Vite**
   - Root Directory: `./` (default)
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

3. **Set Environment Variables**
   - Go to Project Settings → Environment Variables
   - Add each variable from Step 1:
     - Click "Add New"
     - Enter variable name (e.g., `VITE_SUPABASE_URL`)
     - Enter variable value
     - Select environments: **Production**, **Preview**, **Development**
     - Click "Save"
   - Repeat for all 3-4 variables

4. **Deploy**
   - Click "Deploy"
   - Wait for build to complete
   - Verify deployment URL

### Option B: Netlify

1. **Connect Repository**
   - Go to [Netlify Dashboard](https://app.netlify.com)
   - Click "Add new site" → "Import an existing project"
   - Connect to GitHub: `tldougherty-dev/slxai`

2. **Configure Build Settings**
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Base directory: `./`

3. **Set Environment Variables**
   - Go to Site Settings → Environment Variables
   - Click "Add a variable"
   - Add each variable from Step 1:
     - Key: `VITE_SUPABASE_URL`
     - Value: (your value)
     - Scope: **Production**, **Deploy previews**, **Branch deploys**
     - Click "Create variable"
   - Repeat for all variables

4. **Deploy**
   - Click "Deploy site"
   - Wait for build to complete

---

## ✅ Step 3: Verify Deployment

### 3.1 Check Environment Variables

Run this locally first to verify variables are set correctly:

```bash
npm install
npm run verify-env
```

Expected output:
```
✅ VITE_SUPABASE_URL: https://vkeuqauhfjgtcjigiymm.supabase.co
✅ VITE_SUPABASE_ANON_KEY: eyJhbGci...
✅ VITE_RESEND_API_KEY: re_gQBSq...
✅ SUCCESS: All environment variables are set correctly!
```

### 3.2 Test Production Build Locally

```bash
npm run build
npm run preview
```

Visit `http://localhost:4173` and test:
- [ ] Page loads without errors
- [ ] No console errors (check browser DevTools)
- [ ] Can navigate between pages

### 3.3 Test Production Site

After deployment, test these critical flows:

#### Authentication Tests
- [ ] **Signup Flow**
  - Go to `/login` → Click "Sign Up" tab
  - Fill out form with test email
  - Submit form
  - Verify email verification dialog appears
  - Check email inbox for verification email
  - Click verification link
  - Should redirect to login page

- [ ] **Login Flow**
  - Login with verified account
  - Should redirect to `/membership-portal/feed` (global feed)
  - No errors in console

- [ ] **Password Reset**
  - Click "Forgot password?" on login page
  - Enter email
  - Check email for reset link
  - Click reset link
  - Set new password
  - Login with new password

#### Feature Tests
- [ ] **Global Feed** - Can view and create posts
- [ ] **Discussions** - Can access and post messages
- [ ] **Voting** - Can view and participate in votes
- [ ] **Files** - Can view and upload files
- [ ] **Profile** - Can view and edit profile
- [ ] **Admin Panel** - Admin users can access (if applicable)

---

## 🔍 Step 4: Post-Deployment Verification

### Check Browser Console
1. Open production site
2. Open browser DevTools (F12)
3. Go to Console tab
4. **Expected:** No errors, only warnings about missing optional features (if any)
5. **Not Expected:** 
   - "Supabase credentials not found"
   - "Failed to fetch" errors
   - Network errors

### Check Network Tab
1. Open browser DevTools → Network tab
2. Reload page
3. Check for failed requests (red entries)
4. Verify API calls to Supabase succeed (status 200)

### Check Email Functionality
1. Test signup with real email
2. Verify email arrives (check spam folder)
3. Test password reset
4. Verify reset email arrives

---

## 🐛 Troubleshooting

### Issue: "Supabase credentials not found"

**Solution:**
1. Verify environment variables are set in deployment platform
2. Ensure variables start with `VITE_`
3. Redeploy after adding variables
4. Check variable names for typos (case-sensitive)

### Issue: "Failed to fetch" or Network Errors

**Solution:**
1. Check Supabase URL is correct
2. Verify Supabase project is active
3. Check browser console for CORS errors
4. Verify Supabase RLS policies allow access

### Issue: Email Not Sending

**Solution:**
1. Verify `VITE_RESEND_API_KEY` is set correctly
2. Check Resend dashboard for API key status
3. Verify sender email domain is verified in Resend
4. Check Resend dashboard for email logs/errors

### Issue: Build Fails

**Solution:**
1. Check build logs in deployment platform
2. Verify Node.js version (should be 18+)
3. Check for TypeScript errors: `npm run lint`
4. Verify all dependencies install correctly

### Issue: Variables Work Locally But Not in Production

**Solution:**
1. Ensure variables are set in deployment platform (not just `.env`)
2. Verify environment scope (Production vs Preview)
3. Redeploy after adding variables
4. Clear browser cache

---

## 📊 Monitoring Checklist

After deployment, monitor:

- [ ] **Error Rates** - Check deployment platform logs
- [ ] **API Usage** - Monitor Supabase dashboard
- [ ] **Email Delivery** - Check Resend dashboard
- [ ] **User Signups** - Verify signup flow works
- [ ] **Performance** - Check page load times
- [ ] **Uptime** - Monitor site availability

---

## 🔄 Rollback Plan

If issues occur:

1. **Quick Fix:** Update environment variables and redeploy
2. **Rollback:** Use deployment platform's rollback feature
3. **Emergency:** Revert to previous Git commit:
   ```bash
   git revert HEAD
   git push origin main
   ```

---

## 📞 Support Contacts

- **Supabase Issues:** Check Supabase Dashboard → Support
- **Resend Issues:** Check Resend Dashboard → Support
- **Deployment Issues:** Check deployment platform documentation
- **Code Issues:** Check GitHub repository issues

---

## 📝 Additional Resources

- **Environment Setup Guide:** `ENVIRONMENT_VARIABLES_SETUP.md`
- **Production Readiness Report:** `PRODUCTION_READINESS_FINAL.md`
- **Verification Script:** `scripts/verify-env.js`
- **GitHub Repository:** `https://github.com/tldougherty-dev/slxai`

---

## ✅ Final Checklist

Before marking deployment as complete:

- [ ] All environment variables set in production
- [ ] Build succeeds without errors
- [ ] Site loads without console errors
- [ ] Signup flow works end-to-end
- [ ] Login flow works
- [ ] Password reset works
- [ ] Email sending works
- [ ] All major features accessible
- [ ] No critical errors in logs
- [ ] Performance is acceptable

---

**Deployment Status:** ✅ Ready  
**Last Verified:** January 2025  
**Next Review:** After first production deployment

