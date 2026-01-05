// Helper functions for sending email notifications to multiple users
import { supabase } from './supabase';
import {
  sendNewPostNotification,
  sendReplyNotification,
  sendNewVoteNotification,
  sendNewFileNotification,
  sendDiscussionMessageNotification,
} from './email';
import { shouldSendEmailNotification } from './notificationPreferences';

// Get all active member emails
export async function getAllMemberEmails(): Promise<Array<{ email: string; userId?: string; name?: string }>> {
  try {
    // Get all active members
    const { data: members, error } = await supabase
      .from('members')
      .select('id, poc_email, poc_name, status')
      .eq('status', 'active');

    if (error) throw error;

    const emails: Array<{ email: string; userId?: string; name?: string }> = [];

    // Get all member persons
    if (members && members.length > 0) {
      const memberIds = members.map(m => m.id);
      const { data: persons, error: personsError } = await supabase
        .from('member_persons')
        .select('email, member_id, name')
        .in('member_id', memberIds);

      if (!personsError && persons) {
        persons.forEach(person => {
          if (person.email) {
            emails.push({
              email: person.email,
              name: person.name,
            });
          }
        });
      }

      // Also add POC emails
      members.forEach(member => {
        if (member.poc_email && !emails.find(e => e.email === member.poc_email)) {
          emails.push({
            email: member.poc_email,
            name: member.poc_name,
          });
        }
      });
    }

    return emails;
  } catch (error) {
    if (import.meta.env.DEV) {
      console.error('Error fetching member emails:', error);
    }
    return [];
  }
}

// Send notification to all users who want it
export async function notifyAllUsers(
  notificationType: Parameters<typeof shouldSendEmailNotification>[0],
  sendFn: (email: string, userId?: string) => Promise<boolean>
): Promise<void> {
  try {
    const emails = await getAllMemberEmails();
    
    // Send emails in parallel (but limit concurrency to avoid rate limits)
    const BATCH_SIZE = 10;
    for (let i = 0; i < emails.length; i += BATCH_SIZE) {
      const batch = emails.slice(i, i + BATCH_SIZE);
      await Promise.all(
        batch.map(async ({ email, userId }) => {
          const shouldSend = await shouldSendEmailNotification(notificationType, userId, email);
          if (shouldSend) {
            await sendFn(email, userId);
          }
        })
      );
      
      // Small delay between batches to avoid rate limits
      if (i + BATCH_SIZE < emails.length) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
  } catch (error) {
    if (import.meta.env.DEV) {
      console.error('Error sending notifications to all users:', error);
    }
  }
}

// Send notification to specific user
export async function notifyUser(
  email: string,
  notificationType: Parameters<typeof shouldSendEmailNotification>[0],
  sendFn: (email: string, userId?: string) => Promise<boolean>,
  userId?: string
): Promise<void> {
  try {
    const shouldSend = await shouldSendEmailNotification(notificationType, userId, email);
    if (shouldSend) {
      await sendFn(email, userId);
    }
  } catch (error) {
    if (import.meta.env.DEV) {
      console.error('Error sending notification to user:', error);
    }
  }
}

