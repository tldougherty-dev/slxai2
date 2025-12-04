# Testing Guide for New Members

This guide will help you test the application from a new member's perspective, including the onboarding flow, profile setup, and all features.

## 🧪 Quick Testing Steps

### 1. Create a New Test Account

1. **Navigate to Login Page**
   - Go to `http://localhost:8080/login`
   - Click on the "Sign Up" tab

2. **Fill Out Signup Form**
   - **Full Name**: Test User (or any name)
   - **Email**: Use a unique email like `test+newmember@example.com` (you can use `+` to create variations)
   - **Organization Name**: Test Organization
   - **Password**: Must meet requirements:
     - At least 10 characters
     - One uppercase letter
     - One lowercase letter
     - One number
     - One special character
   - **Confirm Password**: Same as password

3. **Verify Email**
   - Check your email inbox (and spam folder)
   - Click the verification link
   - Return to the login page

4. **Login**
   - Enter your email and password
   - Check "Remember me" if you want to test that feature
   - Click "Sign In"

### 2. Test Onboarding Flow

After logging in for the first time, you should see the onboarding wizard:

**Step 1: Welcome**
- Should see welcome message
- Click "Next"

**Step 2: Explore Features**
- Should see feature cards (Global Feed, Discussions, Voting, Files, Directory, Organization)
- Click "Next"

**Step 3: Complete Your Profile** ⚠️ **REQUIRED**
- Should see message about required fields
- Click "Go to My Profile" button
- You'll be redirected to the profile page

**Profile Requirements:**
- ✅ **Organization Name**: Should already be set (from signup)
- ✅ **Name**: Should already be set (from signup)
- ⚠️ **Title**: **REQUIRED** - Fill this in (e.g., "Software Engineer")
- ✅ **Email**: Already set (read-only)

**After Filling Required Fields:**
- Click "Save Changes"
- Return to onboarding (if still open) or refresh the page
- You should be able to complete onboarding

### 3. Reset Onboarding (To Test Again)

If you want to test the onboarding flow again:

1. **Open Browser Developer Tools** (F12)
2. **Go to Console tab**
3. **Run this command:**
   ```javascript
   localStorage.removeItem('onboarding_complete');
   ```
4. **Refresh the page** (F5)
5. Onboarding should appear again

### 4. Test Profile Completion Validation

1. **Go to My Profile** (`/membership-portal/my-profile`)
2. **Click "Edit Profile"**
3. **Try to save without filling required fields:**
   - Clear the "Title" field
   - Click "Save Changes"
   - Should see error: "Title is required."
4. **Fill in required fields and save**

### 5. Test Key Features

#### Global Feed
- Navigate to `/membership-portal/feed`
- Create a post with a URL (e.g., `https://www.youtube.com/watch?v=PyErLuSHHtw&t=8s`)
- Verify URL displays correctly (not encoded)
- Test reactions, comments

#### Discussions
- Navigate to `/membership-portal/discussions`
- Create a new channel
- Post messages
- Verify you can't create channels starting with "summit-"

#### Voting
- Navigate to `/membership-portal/voting`
- View active votes
- Test voting (if any votes are available)
- Verify confirmation dialog appears

#### Files
- Navigate to `/membership-portal/files`
- Upload a file
- Test search functionality
- Click eye icon to view file

#### Directory
- Navigate to `/membership-portal/directory`
- Browse member directory
- Search for members

### 6. Test Edge Cases

#### Test "Remember Me" Feature
1. Logout
2. Login with "Remember me" checked
3. Close browser completely
4. Reopen and go to login page
5. Email should be pre-filled

#### Test Profile Without Organization
1. Create account but don't link to organization
2. Try to complete profile
3. Should see error about organization being required

#### Test URL Encoding Fix
1. Create a post with URL: `https://www.youtube.com/watch?v=PyErLuSHHtw&t=8s`
2. Verify it displays as: `https://www.youtube.com/watch?v=PyErLuSHHtw&t=8s`
3. Should NOT show: `https:&#x2F;&#x2F;www.youtube.com&#x2F;watch?v=PyErLuSHHtw&amp;t=8s`

### 7. Test Mobile Experience

1. **Open Developer Tools** (F12)
2. **Toggle Device Toolbar** (Ctrl+Shift+M or Cmd+Shift+M)
3. **Select a mobile device** (e.g., iPhone 12)
4. **Test:**
   - Sidebar navigation
   - File upload dialog
   - Form inputs
   - Button sizes (should be touch-friendly)

### 8. Test Error Scenarios

#### Invalid Login
1. Try logging in with wrong password
2. Should see rate limiting after multiple attempts
3. Should see specific error messages

#### Profile Validation
1. Try saving profile with:
   - Empty name → Should show error
   - Empty title → Should show error
   - Title > 200 characters → Should show error
   - Bio > 1000 characters → Should show error

## 🔍 What to Look For

### ✅ Should Work Correctly

- Onboarding appears for new users
- Profile completion is enforced
- Required fields are marked with red asterisks (*)
- URLs display correctly (not encoded)
- "Remember me" saves email
- Breadcrumbs appear on all pages
- Page titles are centered in white boxes
- All forms validate input
- Error messages are user-friendly

### ⚠️ Potential Issues to Watch For

- Onboarding doesn't appear (check localStorage)
- Profile can be saved without required fields
- URLs still show encoded characters
- "Remember me" doesn't persist email
- Forms don't validate properly
- Mobile experience is poor

## 🛠️ Developer Tools Commands

### Clear All Local Storage
```javascript
localStorage.clear();
```

### Check Onboarding Status
```javascript
localStorage.getItem('onboarding_complete');
```

### Check Remembered Email
```javascript
localStorage.getItem('rememberedEmail');
```

### Simulate New User
```javascript
localStorage.removeItem('onboarding_complete');
localStorage.removeItem('rememberedEmail');
location.reload();
```

## 📝 Testing Checklist

- [ ] Can create new account
- [ ] Email verification works
- [ ] Can login successfully
- [ ] Onboarding wizard appears
- [ ] Can navigate through onboarding steps
- [ ] Profile completion is enforced
- [ ] Required fields are marked
- [ ] Can save profile with all required fields
- [ ] URLs display correctly in posts
- [ ] "Remember me" works
- [ ] Can create posts
- [ ] Can upload files
- [ ] Can participate in discussions
- [ ] Can vote (if votes available)
- [ ] Mobile experience is good
- [ ] Error messages are clear
- [ ] Breadcrumbs work correctly

## 🎯 Quick Test Script

Run this in browser console to quickly test:

```javascript
// 1. Clear onboarding to test flow
localStorage.removeItem('onboarding_complete');

// 2. Check current user
console.log('Current user:', localStorage.getItem('rememberedEmail'));

// 3. Reload to see onboarding
location.reload();
```

## 💡 Tips

1. **Use Incognito/Private Mode**: Test in a fresh browser session
2. **Use Different Emails**: Use `test+1@example.com`, `test+2@example.com` for multiple accounts
3. **Check Console**: Look for errors in browser console (F12)
4. **Test Network Tab**: Check API calls in Network tab
5. **Test Responsive**: Use device toolbar to test mobile

## 🐛 Reporting Issues

If you find issues, note:
- What you were trying to do
- What happened vs. what you expected
- Browser and version
- Screenshots if helpful
- Console errors (if any)

