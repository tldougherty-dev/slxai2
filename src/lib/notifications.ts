// In-app notifications system - 100% Supabase, no localStorage
import { supabase } from './supabase';

export interface Notification {
  id: string;
  type: 'vote' | 'mention' | 'reply' | 'file' | 'member' | 'system';
  title: string;
  message: string;
  userId?: string;
  link?: string;
  read: boolean;
  timestamp: Date;
  metadata?: Record<string, any>;
}

// Get all notifications for current user
export async function getNotifications(userId?: string): Promise<Notification[]> {
  try {
    let query = supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);

    if (userId) {
      query = query.eq('user_id', userId);
    }

    const { data, error } = await query;

    if (error) throw error;
    if (!data) return [];

    return data.map((n: any) => ({
      id: n.id,
      type: n.type,
      title: n.title,
      message: n.message,
      userId: n.user_id,
      link: n.link,
      read: n.read,
      timestamp: new Date(n.created_at),
      metadata: n.metadata,
    }));
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return [];
  }
}

// Get unread notifications count
export async function getUnreadCount(userId?: string): Promise<number> {
  try {
    const notifications = await getNotifications(userId);
    return notifications.filter(n => !n.read).length;
  } catch (error) {
    console.error('Error getting unread count:', error);
    return 0;
  }
}

// Add a notification
export async function addNotification(notification: Omit<Notification, 'id' | 'read' | 'timestamp'>): Promise<void> {
  try {
    const { error } = await supabase
      .from('notifications')
      .insert({
        type: notification.type,
        title: notification.title,
        message: notification.message,
        user_id: notification.userId,
        link: notification.link,
        read: false,
        metadata: notification.metadata,
      });

    if (error) throw error;

    // Trigger custom event for real-time updates
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('notification', { detail: notification }));
    }
  } catch (error) {
    console.error('Error adding notification:', error);
  }
}

// Mark notification as read
export async function markAsRead(notificationId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', notificationId);

    if (error) throw error;
  } catch (error) {
    console.error('Error marking notification as read:', error);
  }
}

// Mark all as read
export async function markAllAsRead(userId?: string): Promise<void> {
  try {
    let query = supabase
      .from('notifications')
      .update({ read: true });

    if (userId) {
      query = query.eq('user_id', userId);
    }

    const { error } = await query;

    if (error) throw error;
  } catch (error) {
    console.error('Error marking all as read:', error);
  }
}

// Delete notification
export async function deleteNotification(notificationId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', notificationId);

    if (error) throw error;
  } catch (error) {
    console.error('Error deleting notification:', error);
  }
}

// Clear all notifications
export async function clearNotifications(userId?: string): Promise<void> {
  try {
    let query = supabase
      .from('notifications')
      .delete();

    if (userId) {
      query = query.eq('user_id', userId);
    }

    const { error } = await query;

    if (error) throw error;
  } catch (error) {
    console.error('Error clearing notifications:', error);
  }
}
