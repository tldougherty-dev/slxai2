# How to Create Users in Supabase Dashboard

This guide shows you how to create auth.users entries for pending member_persons so they can log in.

## Method 1: Add Users One by One (Recommended for Small Numbers)

### Step 1: Navigate to Authentication
1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Click on **"Authentication"** in the left sidebar
4. Click on **"Users"** tab

### Step 2: Add a New User
1. Click the **"Add User"** button (usually in the top right)
2. Fill in the form:
   - **Email**: Enter the user's email address (e.g., `pinky@360magicians.com`)
   - **Password**: Set a temporary password (they can change it later)
   - **Auto Confirm User**: ✅ **Check this box** (this verifies their email automatically)
   - **Send Invite Email**: Optional - uncheck if you don't want to send an email
3. Click **"Create User"**

### Step 3: Repeat for Each User
Repeat Step 2 for each pending member_person email address.

---

## Method 2: Bulk Import Using CSV (Recommended for Many Users)

### Step 1: Prepare CSV File
Create a CSV file with the following columns:
```csv
email,password,email_confirmed
pinky@360magicians.com,TempPass123!,true
sam@accessibilityglobal.com,TempPass123!,true
amirali.rezaei@aisa.solutions,TempPass123!,true
```

**Important:**
- First row should be headers: `email,password,email_confirmed`
- Set `email_confirmed` to `true` to auto-verify emails
- Use a temporary password (users can reset it)

### Step 2: Use Supabase CLI or API
Unfortunately, Supabase Dashboard doesn't have a built-in CSV import. You'll need to:

**Option A: Use Supabase CLI** (if you have it installed)
```bash
# Install Supabase CLI if needed
npm install -g supabase

# Login
supabase login

# Link your project
supabase link --project-ref your-project-ref

# Import users (you'll need to write a script)
```

**Option B: Use Supabase Admin API** (programmatic)
See the script below for bulk creation.

---

## Method 3: Use SQL to Create Users (Advanced)

⚠️ **Warning**: Direct SQL insertion into `auth.users` is not recommended and may cause issues. Use the Admin API instead.

---

## Method 4: Bulk Create Using Admin API Script

Create a script to bulk create users. Here's a Node.js example:

### Step 1: Get Your Service Role Key
1. Go to Supabase Dashboard → **Settings** → **API**
2. Copy your **`service_role`** key (⚠️ Keep this secret!)

### Step 2: Create a Script
Create a file `bulk-create-users.js`:

```javascript
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://vkeuqauhfjgtcjigiymm.supabase.co';
const supabaseServiceKey = 'YOUR_SERVICE_ROLE_KEY'; // Get from Dashboard → Settings → API

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// List of emails from your pending member_persons
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
  'calvin@gosign.ai',
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
  const results = [];
  
  for (const email of emails) {
    try {
      // Generate a random password
      const tempPassword = Math.random().toString(36).slice(-12) + 'A1!';
      
      const { data, error } = await supabase.auth.admin.createUser({
        email: email,
        password: tempPassword,
        email_confirm: true, // Auto-confirm email
        user_metadata: {
          // You can add metadata here
        }
      });
      
      if (error) {
        console.error(`Failed to create ${email}:`, error.message);
        results.push({ email, success: false, error: error.message });
      } else {
        console.log(`✅ Created: ${email}`);
        results.push({ email, success: true, userId: data.user.id });
      }
      
      // Small delay to avoid rate limits
      await new Promise(resolve => setTimeout(resolve, 100));
    } catch (error) {
      console.error(`Error creating ${email}:`, error);
      results.push({ email, success: false, error: error.message });
    }
  }
  
  console.log('\n=== Summary ===');
  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  console.log(`✅ Created: ${successful}`);
  console.log(`❌ Failed: ${failed}`);
  
  if (failed > 0) {
    console.log('\nFailed emails:');
    results.filter(r => !r.success).forEach(r => {
      console.log(`  - ${r.email}: ${r.error}`);
    });
  }
}

createUsers();
```

### Step 3: Run the Script
```bash
npm install @supabase/supabase-js
node bulk-create-users.js
```

---

## Quick Method: Dashboard One-by-One (Easiest)

For 29 users, the fastest method is probably using the Dashboard:

1. **Open Supabase Dashboard** → Authentication → Users
2. **Click "Add User"** for each email
3. **Use these settings:**
   - Email: (the person's email)
   - Password: `TempPass123!` (or generate random passwords)
   - ✅ **Auto Confirm User**: Check this
   - ❌ **Send Invite Email**: Uncheck (optional)

4. **After creating**, users can:
   - Log in with their email and the temporary password
   - Reset their password using "Forgot Password"

---

## Tips

- **Temporary Passwords**: Use a consistent format like `TempPass123!` and tell users to change it
- **Email Verification**: Always check "Auto Confirm User" so they don't need to verify
- **Bulk Operations**: For many users, consider using the Admin API script above
- **Password Reset**: Users can reset passwords via the login page if needed

---

## Verify Users Were Created

Run this SQL query in Supabase SQL Editor:

```sql
SELECT 
  email,
  email_confirmed_at,
  created_at
FROM auth.users
WHERE email IN (
  'pinky@360magicians.com',
  'sam@accessibilityglobal.com',
  -- ... add all emails
)
ORDER BY email;
```

---

**That's it!** Once users are created, they can log in with their email and the temporary password you set.
