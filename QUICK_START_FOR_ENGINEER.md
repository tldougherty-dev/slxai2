# Quick Start Guide for Engineer

**TL;DR:** Set 3 environment variables, deploy, test signup/login.

---

## 🚀 Quick Deployment (5 minutes)

### 1. Set These 3 Variables in Your Deployment Platform:

```
VITE_SUPABASE_URL=https://vkeuqauhfjgtcjigiymm.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZrZXVxYXVoZmpndGNqaWdpeW1tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM5Mjc3NjUsImV4cCI6MjA3OTUwMzc2NX0.s-TjC-qGxleLZGT2xy80KhESIgpZ99Ylzo57KJI45BA
RESEND_API_KEY=your_resend_api_key_here
```

### 2. Deploy

**Vercel:**
- Import repo: `tldougherty-dev/slxai`
- Framework: Vite
- Build: `npm run build`
- Output: `dist`
- Add variables above
- Deploy

**Netlify:**
- Import repo: `tldougherty-dev/slxai`
- Build: `npm run build`
- Publish: `dist`
- Add variables above
- Deploy

### 3. Test (2 minutes)

1. Visit deployed site
2. Go to `/login`
3. Click "Sign Up"
4. Fill form, submit
5. Check email for verification
6. Verify email, login
7. Should land on feed page ✅

---

## ✅ Verification Commands

```bash
# Check variables locally
npm run verify-env

# Test production build
npm run build && npm run preview
```

---

## 🐛 Common Issues

**"Supabase credentials not found"**
→ Variables not set or need redeploy

**"Failed to fetch"**
→ Check Supabase URL is correct

**Email not sending**
→ Check Resend API key is set

**Build fails**
→ Check Node.js version (18+)

---

## 📖 Full Instructions

See `DEPLOYMENT_INSTRUCTIONS.md` for complete guide.

---

**That's it!** If signup/login works, you're good to go. 🎉

