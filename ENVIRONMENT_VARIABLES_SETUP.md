# Environment Variables Setup Guide

This guide explains how to ensure all required environment variables are set correctly in production.

## Required Environment Variables

### Critical (Must Have)
1. **VITE_SUPABASE_URL**
   - Your Supabase project URL
   - Format: `https://your-project-id.supabase.co`
   - Example: `https://vkeuqauhfjgtcjigiymm.supabase.co`

2. **VITE_SUPABASE_ANON_KEY**
   - Your Supabase anonymous/public key
   - Found in: Supabase Dashboard → Settings → API → Project API keys → `anon` `public`
   - This is safe to expose in frontend code

3. **VITE_RESEND_API_KEY**
   - Your Resend API key for sending emails
   - Format: `re_xxxxxxxxxxxxx`
   - Found in: Resend Dashboard → API Keys

### Optional (Recommended)
4. **VITE_TRANSLATION_API_KEY**
   - Google Translate API key (if using translation features)
   - Format: `AIzaSyxxxxxxxxxxxxx`
   - Found in: Google Cloud Console → APIs & Services → Credentials

---

## Setting Environment Variables by Platform

### 🚀 Vercel

1. **Go to your project** in Vercel Dashboard
2. **Click "Settings"** → **"Environment Variables"**
3. **Add each variable**:
   - Click "Add New"
   - Enter variable name (e.g., `VITE_SUPABASE_URL`)
   - Enter variable value
   - Select environments: Production, Preview, Development (or as needed)
   - Click "Save"
4. **Redeploy** your application after adding variables

**Via CLI:**
```bash
vercel env add VITE_SUPABASE_URL production
vercel env add VITE_SUPABASE_ANON_KEY production
vercel env add VITE_RESEND_API_KEY production
```

**Verify:**
```bash
vercel env ls
```

---

### 🌐 Netlify

1. **Go to your site** in Netlify Dashboard
2. **Click "Site settings"** → **"Environment variables"**
3. **Click "Add a variable"**
4. **Enter**:
   - Key: `VITE_SUPABASE_URL`
   - Value: Your value
   - Scope: Production, Deploy previews, Branch deploys (select as needed)
5. **Click "Create variable"**
6. **Repeat** for all variables
7. **Trigger a new deploy** (variables are applied on next deploy)

**Via CLI:**
```bash
netlify env:set VITE_SUPABASE_URL "your-value" --context production
netlify env:set VITE_SUPABASE_ANON_KEY "your-value" --context production
netlify env:set VITE_RESEND_API_KEY "your-value" --context production
```

**Verify:**
```bash
netlify env:list
```

---

### ☁️ Cloudflare Pages

1. **Go to your project** in Cloudflare Dashboard
2. **Click "Settings"** → **"Environment variables"**
3. **Add variables**:
   - Click "Add variable"
   - Enter name and value
   - Select environment (Production, Preview, etc.)
   - Click "Save"
4. **Redeploy** your site

---

### 🐳 Docker / Self-Hosted

**Option 1: .env file** (for development)
```bash
# Create .env file in project root
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_RESEND_API_KEY=your-resend-key
```

**Option 2: Environment variables** (for production)
```bash
# Set in your shell/system
export VITE_SUPABASE_URL="https://your-project.supabase.co"
export VITE_SUPABASE_ANON_KEY="your-anon-key"
export VITE_RESEND_API_KEY="your-resend-key"

# Or in docker-compose.yml
environment:
  - VITE_SUPABASE_URL=https://your-project.supabase.co
  - VITE_SUPABASE_ANON_KEY=your-anon-key
  - VITE_RESEND_API_KEY=your-resend-key
```

---

## Verification Methods

### 1. Check in Application Code

The application already validates environment variables. Check the browser console (in development) or network tab for errors.

**Files that check variables:**
- `src/lib/supabase.ts` - Checks Supabase credentials
- `src/lib/email.ts` - Checks Resend API key
- `src/lib/translation.ts` - Checks Translation API key

### 2. Build-Time Verification

Add this to your build script to verify variables are set:

```bash
# In package.json scripts
"build:verify": "node -e \"const required = ['VITE_SUPABASE_URL', 'VITE_SUPABASE_ANON_KEY', 'VITE_RESEND_API_KEY']; const missing = required.filter(v => !process.env[v]); if (missing.length) { console.error('Missing env vars:', missing); process.exit(1); }\" && vite build"
```

### 3. Runtime Verification

The application will show warnings in development if variables are missing. In production, features will gracefully degrade if variables are not set.

---

## Testing Environment Variables

### Local Testing

1. **Create `.env` file** in project root:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_RESEND_API_KEY=your-resend-key
VITE_TRANSLATION_API_KEY=your-translation-key
```

2. **Restart dev server**:
```bash
npm run dev
```

3. **Check browser console** - should see no warnings about missing credentials

### Production Testing

1. **Deploy with variables set**
2. **Test critical features**:
   - Signup/Login (requires Supabase)
   - Email sending (requires Resend)
   - Password reset (requires Supabase + Resend)
3. **Check browser console** - should have no errors
4. **Check network tab** - API calls should succeed

---

## Troubleshooting

### Variables Not Working?

1. **Check variable names** - Must start with `VITE_` for Vite to expose them
2. **Redeploy** - Variables are only available after redeploy
3. **Check environment scope** - Ensure variables are set for the correct environment (Production/Preview)
4. **Check for typos** - Variable names are case-sensitive
5. **Clear cache** - Sometimes browsers cache old builds

### Common Issues

**Issue**: "Supabase credentials not found"
- **Solution**: Ensure `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are set

**Issue**: "Email sending failed"
- **Solution**: Check `VITE_RESEND_API_KEY` is set and valid

**Issue**: Variables work locally but not in production
- **Solution**: Ensure variables are set in your deployment platform, not just `.env` file

---

## Security Best Practices

1. ✅ **Never commit `.env` files** - Already in `.gitignore`
2. ✅ **Use different keys for dev/prod** - Set separate variables for each environment
3. ✅ **Rotate keys regularly** - Update API keys periodically
4. ✅ **Limit key permissions** - Use least privilege principle
5. ✅ **Monitor usage** - Watch for unexpected API usage

---

## Quick Reference

### Required Variables Checklist

- [ ] `VITE_SUPABASE_URL` - Set in production
- [ ] `VITE_SUPABASE_ANON_KEY` - Set in production
- [ ] `VITE_RESEND_API_KEY` - Set in production
- [ ] `VITE_TRANSLATION_API_KEY` - Optional, set if using translations

### After Setting Variables

1. ✅ Redeploy application
2. ✅ Test signup flow
3. ✅ Test login flow
4. ✅ Test password reset
5. ✅ Verify email sending works
6. ✅ Check browser console for errors

---

## Need Help?

If you're unsure about any variable:
1. Check the relevant service dashboard (Supabase, Resend, etc.)
2. Review the service documentation
3. Check `src/lib/supabase.ts`, `src/lib/email.ts` for variable usage
4. Test in development first with `.env` file

