# Troubleshooting "api.supabase failed to fetch" Error

If you're getting this error when trying to create users in Supabase Dashboard, try these solutions:

## Quick Fixes

### 1. Refresh the Page
- Hard refresh: `Ctrl + Shift + R` (Windows) or `Cmd + Shift + R` (Mac)
- Or clear browser cache and reload

### 2. Check Your Internet Connection
- Make sure you have a stable internet connection
- Try accessing other Supabase Dashboard pages to see if it's a general issue

### 3. Try a Different Browser
- Switch to Chrome, Firefox, or Edge
- Sometimes browser extensions can interfere

### 4. Check Supabase Status
- Visit https://status.supabase.com to see if there are any outages
- Check if your project is still active

---

## Alternative: Use SQL to Create Users (If Dashboard Fails)

If the Dashboard keeps failing, you can create users directly via SQL using Supabase's built-in functions:

### Method 1: Use `auth.users` Table Directly (Not Recommended)
⚠️ **Warning**: Direct SQL insertion can cause issues. Use the function below instead.

### Method 2: Use Supabase Auth Functions (Recommended)

Run this SQL script in Supabase SQL Editor:

```sql
-- Create a function to add users via SQL
-- Note: This requires the auth schema to be accessible

-- First, check if you can access auth schema
SELECT current_schema();

-- If you can't directly insert, you'll need to use the Admin API or Dashboard
```

---

## Alternative: Use Supabase CLI

### Step 1: Install Supabase CLI
```bash
npm install -g supabase
```

### Step 2: Login
```bash
supabase login
```

### Step 3: Link Your Project
```bash
supabase link --project-ref vkeuqauhfjgtcjigiymm
```

### Step 4: Create Users via CLI
Unfortunately, Supabase CLI doesn't have a direct user creation command, so you'll need to use the Admin API.

---

## Best Alternative: Use Node.js Script with Admin API

Create a file `create-users.js`:

```javascript
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://vkeuqauhfjgtcjigiymm.supabase.co';
const supabaseServiceKey = 'YOUR_SERVICE_ROLE_KEY'; // Get from Dashboard → Settings → API → service_role key

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

const emails = [
  'pinky@360magicians.com',
  'sam@accessibilityglobal.com',
  'amirali.rezaei@aisa.solutions',
  'melissa@aslflurry.com',
  'star@aslflurry.com',
  'beryld@dawnsign.com',
  'alieber@bu.edu',
  'wrinella@csdr-cde.ca.gov',
  'joshua.finkle@dhisnyc.com',
  'nnibagwire2000@gmail.com',
  'lee.kezar@gallaudet.edu',
  'tibo@glwmax.com',
  'tiina@glwmax.com',
  'imaginashawn@gmail.com',
  'calvin@signapse.ai',
  'hasan.dikyuva@mpi.nl',
  'maciej.lewandowski@migam.org',
  'pk@migam.org',
  'lucas.soto@mindyourlanguageinc.com',
  'patrick.costello@nfrdct.com',
  'l.whynot@northeastern.edu',
  't.phillips@openmind-sw.de',
  'pault@partnersinterpreting.com',
  'john@pendulum.graphics',
  'darren@sign-ai.co',
  'skarabuklu@ttic.edu',
  'greg@ttic.edu',
  'shelley@truewayasl.com',
  'pamela.macias@colorado.edu'
];

async function createUsers() {
  console.log('Starting user creation...\n');
  
  for (const email of emails) {
    try {
      const tempPassword = Math.random().toString(36).slice(-12) + 'A1!';
      
      const { data, error } = await supabase.auth.admin.createUser({
        email: email,
        password: tempPassword,
        email_confirm: true,
      });
      
      if (error) {
        if (error.message.includes('already registered')) {
          console.log(`⏭️  Skipped (exists): ${email}`);
        } else {
          console.error(`❌ Failed: ${email} - ${error.message}`);
        }
      } else {
        console.log(`✅ Created: ${email}`);
      }
      
      // Small delay to avoid rate limits
      await new Promise(resolve => setTimeout(resolve, 200));
    } catch (error) {
      console.error(`❌ Error: ${email} - ${error.message}`);
    }
  }
  
  console.log('\n✅ Done!');
}

createUsers().catch(console.error);
```

### Run the Script:
```bash
npm install @supabase/supabase-js
node create-users.js
```

---

## Get Your Service Role Key

1. Go to Supabase Dashboard
2. Click **Settings** → **API**
3. Find **"service_role"** key (⚠️ Keep this secret!)
4. Copy it and replace `YOUR_SERVICE_ROLE_KEY` in the script above

---

## If Dashboard Still Doesn't Work

### Check Browser Console
1. Open browser DevTools (F12)
2. Go to Console tab
3. Look for specific error messages
4. Check Network tab for failed requests

### Common Issues:
- **CORS errors**: Usually means API endpoint issue
- **401/403 errors**: Authentication/permission issue
- **Network errors**: Connection issue
- **Rate limiting**: Too many requests

### Contact Supabase Support
If nothing works:
1. Go to https://supabase.com/support
2. Describe the error
3. Include browser console errors
4. Mention you're trying to create users via Dashboard

---

## Quick Workaround: Create Users One at a Time

If bulk creation fails:
1. Try creating users one at a time in Dashboard
2. Wait a few seconds between each creation
3. This avoids rate limiting issues

---

**The Node.js script above is the most reliable method if Dashboard continues to fail.**
