// User notification preferences management
import { supabase } from './supabase';
import { getCurrentUser } from './auth';

export interface NotificationPreferences {
  id?: string;
  userId: string;
  email: string;
  
  // Feed notifications
  feedNewPost: boolean;
  feedNewComment: boolean;
  
  // File notifications
  fileNewUpload: boolean;
  fileCategoryUpdate: boolean;
  
  // Discussion notifications
  discussionNewMessage: boolean;
  discussionNewChannel: boolean;
  discussionMention: boolean;
  
  // Post/Comment notifications
  postReply: boolean;
  commentReply: boolean;
  postMention: boolean;
  
  // Voting notifications
  voteNew: boolean;
  voteEndingSoon: boolean;
  voteResult: boolean;
  
  // Member notifications
  memberNewOrganization: boolean;
  memberProfileUpdate: boolean;
  
  // Summit notifications
  summitNewWorkshop: boolean;
  summitNewSponsor: boolean;
  summitDeadlineReminder: boolean;
  
  // System notifications
  systemAnnouncement: boolean;
  systemMaintenance: boolean;
  
  // Email frequency
  emailFrequency: 'immediate' | 'daily' | 'weekly' | 'never';
  
  createdAt?: Date;
  updatedAt?: Date;
}

const DEFAULT_PREFERENCES: Omit<NotificationPreferences, 'userId' | 'email'> = {
  feedNewPost: true,
  feedNewComment: false, // OFF by default
  fileNewUpload: false, // OFF by default
  fileCategoryUpdate: false,
  discussionNewMessage: false, // OFF by default
  discussionNewChannel: false,
  discussionMention: true,
  postReply: true,
  commentReply: true,
  postMention: true,
  voteNew: true,
  voteEndingSoon: true,
  voteResult: true,
  memberNewOrganization: false,
  memberProfileUpdate: false,
  summitNewWorkshop: true,
  summitNewSponsor: false,
  summitDeadlineReminder: true,
  systemAnnouncement: true,
  systemMaintenance: true,
  emailFrequency: 'immediate',
};

// Get user's notification preferences
export async function getNotificationPreferences(
  userId?: string,
  email?: string
): Promise<NotificationPreferences | null> {
  try {
    const user = getCurrentUser();
    const targetUserId = userId || user?.id;
    const targetEmail = email || user?.email;

    if (!targetUserId && !targetEmail) {
      return null;
    }

    let query = supabase.from('user_notification_preferences').select('*');

    if (targetUserId) {
      query = query.eq('user_id', targetUserId);
    } else if (targetEmail) {
      query = query.eq('email', targetEmail);
    }

    const { data, error } = await query.single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No preferences found, return defaults
        return null;
      }
      throw error;
    }

    if (!data) return null;

    return mapDbToPreferences(data);
  } catch (error) {
    if (import.meta.env.DEV) {
      console.error('Error fetching notification preferences:', error);
    }
    return null;
  }
}

// Get or create user's notification preferences (returns defaults if not found)
export async function getOrCreateNotificationPreferences(
  userId?: string,
  email?: string
): Promise<NotificationPreferences> {
  const existing = await getNotificationPreferences(userId, email);
  if (existing) {
    return existing;
  }

  const user = getCurrentUser();
  const targetUserId = userId || user?.id || '';
  const targetEmail = email || user?.email || '';

  return {
    ...DEFAULT_PREFERENCES,
    userId: targetUserId,
    email: targetEmail,
  };
}

// Save notification preferences
export async function saveNotificationPreferences(
  preferences: Partial<NotificationPreferences>
): Promise<NotificationPreferences> {
  try {
    const user = getCurrentUser();
    const userId = preferences.userId || user?.id || '';
    const email = preferences.email || user?.email || '';

    if (!userId && !email) {
      throw new Error('User ID or email is required');
    }

    // Get existing preferences or use defaults
    const existing = await getNotificationPreferences(userId, email);
    const updated = {
      ...(existing || { ...DEFAULT_PREFERENCES, userId, email }),
      ...preferences,
      userId,
      email,
    };

    const dbData = mapPreferencesToDb(updated);

    const { data, error } = await supabase
      .from('user_notification_preferences')
      .upsert(dbData, {
        onConflict: userId ? 'user_id' : 'email',
      })
      .select()
      .single();

    if (error) throw error;

    return mapDbToPreferences(data);
  } catch (error) {
    if (import.meta.env.DEV) {
      console.error('Error saving notification preferences:', error);
    }
    throw error;
  }
}

// Check if user should receive email for a specific notification type
export async function shouldSendEmailNotification(
  notificationType: keyof Omit<NotificationPreferences, 'id' | 'userId' | 'email' | 'emailFrequency' | 'createdAt' | 'updatedAt'>,
  userId?: string,
  email?: string
): Promise<boolean> {
  const preferences = await getOrCreateNotificationPreferences(userId, email);
  
  // Check if email frequency is set to 'never'
  if (preferences.emailFrequency === 'never') {
    return false;
  }

  // Check the specific notification type preference
  return preferences[notificationType] ?? false;
}

// Map database row to preferences object
function mapDbToPreferences(data: any): NotificationPreferences {
  return {
    id: data.id,
    userId: data.user_id,
    email: data.email,
    feedNewPost: data.feed_new_post ?? DEFAULT_PREFERENCES.feedNewPost,
    feedNewComment: data.feed_new_comment ?? DEFAULT_PREFERENCES.feedNewComment,
    fileNewUpload: data.file_new_upload ?? DEFAULT_PREFERENCES.fileNewUpload,
    fileCategoryUpdate: data.file_category_update ?? DEFAULT_PREFERENCES.fileCategoryUpdate,
    discussionNewMessage: data.discussion_new_message ?? DEFAULT_PREFERENCES.discussionNewMessage,
    discussionNewChannel: data.discussion_new_channel ?? DEFAULT_PREFERENCES.discussionNewChannel,
    discussionMention: data.discussion_mention ?? DEFAULT_PREFERENCES.discussionMention,
    postReply: data.post_reply ?? DEFAULT_PREFERENCES.postReply,
    commentReply: data.comment_reply ?? DEFAULT_PREFERENCES.commentReply,
    postMention: data.post_mention ?? DEFAULT_PREFERENCES.postMention,
    voteNew: data.vote_new ?? DEFAULT_PREFERENCES.voteNew,
    voteEndingSoon: data.vote_ending_soon ?? DEFAULT_PREFERENCES.voteEndingSoon,
    voteResult: data.vote_result ?? DEFAULT_PREFERENCES.voteResult,
    memberNewOrganization: data.member_new_organization ?? DEFAULT_PREFERENCES.memberNewOrganization,
    memberProfileUpdate: data.member_profile_update ?? DEFAULT_PREFERENCES.memberProfileUpdate,
    summitNewWorkshop: data.summit_new_workshop ?? DEFAULT_PREFERENCES.summitNewWorkshop,
    summitNewSponsor: data.summit_new_sponsor ?? DEFAULT_PREFERENCES.summitNewSponsor,
    summitDeadlineReminder: data.summit_deadline_reminder ?? DEFAULT_PREFERENCES.summitDeadlineReminder,
    systemAnnouncement: data.system_announcement ?? DEFAULT_PREFERENCES.systemAnnouncement,
    systemMaintenance: data.system_maintenance ?? DEFAULT_PREFERENCES.systemMaintenance,
    emailFrequency: data.email_frequency || DEFAULT_PREFERENCES.emailFrequency,
    createdAt: data.created_at ? new Date(data.created_at) : undefined,
    updatedAt: data.updated_at ? new Date(data.updated_at) : undefined,
  };
}

// Map preferences object to database row
function mapPreferencesToDb(preferences: NotificationPreferences): any {
  return {
    user_id: preferences.userId,
    email: preferences.email,
    feed_new_post: preferences.feedNewPost,
    feed_new_comment: preferences.feedNewComment,
    file_new_upload: preferences.fileNewUpload,
    file_category_update: preferences.fileCategoryUpdate,
    discussion_new_message: preferences.discussionNewMessage,
    discussion_new_channel: preferences.discussionNewChannel,
    discussion_mention: preferences.discussionMention,
    post_reply: preferences.postReply,
    comment_reply: preferences.commentReply,
    post_mention: preferences.postMention,
    vote_new: preferences.voteNew,
    vote_ending_soon: preferences.voteEndingSoon,
    vote_result: preferences.voteResult,
    member_new_organization: preferences.memberNewOrganization,
    member_profile_update: preferences.memberProfileUpdate,
    summit_new_workshop: preferences.summitNewWorkshop,
    summit_new_sponsor: preferences.summitNewSponsor,
    summit_deadline_reminder: preferences.summitDeadlineReminder,
    system_announcement: preferences.systemAnnouncement,
    system_maintenance: preferences.systemMaintenance,
    email_frequency: preferences.emailFrequency,
  };
}

// Get unsubscribe URL for email notifications
export function getUnsubscribeUrl(userId: string, email: string): string {
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://slxai.org';
  // In production, you'd want to use a secure token instead of plain email
  return `${baseUrl}/membership-portal/notifications?unsubscribe=true&email=${encodeURIComponent(email)}`;
}

