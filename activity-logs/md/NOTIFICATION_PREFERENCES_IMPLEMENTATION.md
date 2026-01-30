# Notification Preferences Implementation

## Overview

A comprehensive notification preferences system has been implemented that allows members to control which email notifications they receive. Members can customize their preferences through a dedicated settings page accessible from the membership portal menu.

## Features Implemented

### 1. Database Schema
**File:** `CREATE_NOTIFICATION_PREFERENCES_TABLE.sql`

- Created `user_notification_preferences` table with comprehensive notification options
- Includes RLS (Row Level Security) policies for data protection
- Auto-updating `updated_at` timestamp
- Unique constraints on `user_id` and `email`

### 2. Notification Preferences Library
**File:** `src/lib/notificationPreferences.ts`

Functions provided:
- `getNotificationPreferences()` - Get user's preferences
- `getOrCreateNotificationPreferences()` - Get or create with defaults
- `saveNotificationPreferences()` - Save/update preferences
- `shouldSendEmailNotification()` - Check if email should be sent for a specific type
- `getUnsubscribeUrl()` - Generate unsubscribe link for emails

### 3. Notification Preferences Page
**File:** `src/pages/membership-portal/NotificationPreferences.tsx`

Features:
- Full UI for managing all notification preferences
- Organized by category (Feed, Files, Discussions, Posts/Comments, Voting, Summit, Members, System)
- Email frequency settings (Immediate, Daily, Weekly, Never)
- Unsubscribe link support (via URL parameters)
- Save/Cancel/Reset to defaults functionality
- Real-time validation and feedback

### 4. Menu Integration
- Added "Notifications" menu item to `MembershipPortalLayout`
- Added route in `App.tsx`
- Added translation key in `en.json`

## Notification Types Included

### Feed Notifications
- ✅ **New Posts** - New posts on global feed
- ✅ **New Comments** - New comments on feed posts

### File Notifications
- ✅ **New File Uploads** - New files uploaded
- ✅ **Category Updates** - Files added to watched categories

### Discussion Notifications
- ✅ **New Messages** - New messages in discussions
- ✅ **New Channels** - New discussion channels created
- ✅ **Mentions** - Mentioned in discussion

### Post & Comment Notifications
- ✅ **Post Replies** - Replies to user's posts
- ✅ **Comment Replies** - Replies to user's comments
- ✅ **Post Mentions** - Mentioned in a post

### Voting Notifications
- ✅ **New Votes** - New votes created
- ✅ **Votes Ending Soon** - 24-hour reminder before votes close
- ✅ **Vote Results** - Vote results available

### Summit Notifications
- ✅ **New Workshop Submissions** - New workshop submissions
- ✅ **New Sponsor Submissions** - New sponsor submissions
- ✅ **Deadline Reminders** - Upcoming summit deadlines

### Member Notifications
- ✅ **New Organizations** - New organizations joined
- ✅ **Profile Updates** - Organization profile updated

### System Notifications
- ✅ **System Announcements** - Important system announcements
- ✅ **Maintenance Notifications** - Scheduled maintenance

## Additional Notification Types Suggested

Based on common patterns, here are additional notification types you might want to consider:

### Activity-Based
- **Reactions to Posts** - When someone reacts to your post
- **Reactions to Comments** - When someone reacts to your comment
- **Post Shares** - When someone shares your post
- **File Downloads** - When someone downloads your uploaded file

### Collaboration
- **Workshop Collaborations** - Invitations to collaborate on workshops
- **Document Collaborations** - Shared document access/edits
- **Meeting Invitations** - Upcoming meetings/events

### Administrative
- **Role Changes** - When your role/permissions change
- **Organization Approvals** - When your organization is approved
- **Voting Representative Changes** - When voting rep status changes

### Summit-Specific
- **Workshop Acceptance** - When workshop submission is accepted
- **Workshop Rejection** - When workshop submission is rejected
- **Sponsor Package Updates** - Changes to sponsor packages
- **Summit Schedule Changes** - Updates to summit schedule

### Engagement
- **Follow Activity** - Activity from members you follow (if implemented)
- **Trending Topics** - Popular discussions/posts
- **Weekly Digest** - Summary of weekly activity

## Email Frequency Options

- **Immediate** - Receive emails as they happen (default)
- **Daily Digest** - One email per day with all notifications
- **Weekly Digest** - One email per week with all notifications
- **Never** - Only receive in-app notifications

## Unsubscribe Functionality

### Implementation
1. Generate unsubscribe URL using `getUnsubscribeUrl(userId, email)`
2. Include in email footer: "Manage your notification preferences or unsubscribe"
3. URL format: `/membership-portal/notifications?unsubscribe=true&email={email}`
4. Page detects unsubscribe parameter and shows special message

### Security Considerations
**Current Implementation:** Uses email in URL (for MVP)
**Production Recommendation:** Use secure tokens instead:
- Generate unique unsubscribe token per user
- Store token in database with expiration
- Validate token before allowing preference changes
- Example: `/membership-portal/notifications?token={secure_token}`

## Usage Examples

### Check if user wants email notification
```typescript
import { shouldSendEmailNotification } from '@/lib/notificationPreferences';

// Before sending email
const shouldSend = await shouldSendEmailNotification('postReply', userId, email);
if (shouldSend) {
  // Send email
}
```

### Get user preferences
```typescript
import { getNotificationPreferences } from '@/lib/notificationPreferences';

const preferences = await getNotificationPreferences(userId, email);
if (preferences?.feedNewPost) {
  // User wants feed notifications
}
```

### Save preferences
```typescript
import { saveNotificationPreferences } from '@/lib/notificationPreferences';

await saveNotificationPreferences({
  feedNewPost: false,
  emailFrequency: 'daily',
});
```

## Database Setup

1. Run `CREATE_NOTIFICATION_PREFERENCES_TABLE.sql` in Supabase SQL Editor
2. Verify RLS policies are active
3. Test with a user account

## Next Steps

1. **Integrate with Email Service**
   - Update email sending functions to check preferences
   - Add unsubscribe links to email templates
   - Implement daily/weekly digest functionality

2. **Add More Notification Types**
   - Implement any additional types from the suggested list
   - Update database schema if needed
   - Update UI to include new options

3. **Security Enhancements**
   - Implement secure token-based unsubscribe
   - Add rate limiting for preference updates
   - Add audit logging for preference changes

4. **Analytics**
   - Track which notification types are most/least popular
   - Monitor unsubscribe rates
   - A/B test notification frequencies

5. **User Experience**
   - Add "Quick Actions" (e.g., "Disable all", "Enable important only")
   - Show notification preview/test emails
   - Add notification history/log

## Files Created/Modified

### Created
- `CREATE_NOTIFICATION_PREFERENCES_TABLE.sql` - Database schema
- `src/lib/notificationPreferences.ts` - Preferences management library
- `src/pages/membership-portal/NotificationPreferences.tsx` - Preferences UI page

### Modified
- `src/App.tsx` - Added route
- `src/components/MembershipPortalLayout.tsx` - Added menu item
- `src/locales/en.json` - Added translation key

## Testing Checklist

- [ ] Database table created successfully
- [ ] RLS policies working correctly
- [ ] Preferences page loads and displays correctly
- [ ] Can toggle notification preferences
- [ ] Can save preferences
- [ ] Can reset to defaults
- [ ] Unsubscribe link works
- [ ] Email frequency selection works
- [ ] Preferences persist after page refresh
- [ ] Multiple users can have different preferences
- [ ] Default preferences work for new users

