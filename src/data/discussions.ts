import { supabase } from '@/lib/supabase';
import { sendDiscussionMessageNotification } from '@/lib/email';
import { notifyUser } from '@/lib/emailNotifications';

export interface Channel {
  id: string;
  name: string;
  description?: string;
  isPrivate?: boolean;
  displayOrder?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Message {
  id: string;
  channelId: string;
  author: string;
  authorEmail?: string;
  content: string;
  isPinned: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface MessageReaction {
  id: string;
  messageId: string;
  emoji: string;
  userId: string;
  userEmail?: string;
  createdAt: Date;
}

export interface ThreadReply {
  id: string;
  messageId: string;
  author: string;
  authorEmail?: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

// Aggregated reaction data for display
export interface AggregatedReaction {
  emoji: string;
  count: number;
  users: string[]; // User emails who reacted
}

// Get all channels
export async function getChannels(): Promise<Channel[]> {
  try {
    const { data, error } = await supabase
      .from('channels')
      .select('*')
      .order('display_order', { ascending: true, nullsFirst: false })
      .order('created_at', { ascending: true });

    if (error) {
      // Provide more helpful error messages
      if (error.code === 'PGRST116' || error.message?.includes('relation') || error.message?.includes('does not exist')) {
        throw new Error('Discussions tables not found. Please run DISCUSSIONS_SCHEMA.sql in Supabase SQL Editor.');
      }
      throw error;
    }

    return (data || []).map(row => ({
      id: row.id,
      name: row.name,
      description: row.description || undefined,
      isPrivate: row.is_private || false,
      displayOrder: row.display_order || 0,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    }));
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Error fetching channels:', error);
    }
    throw error;
  }
}

// Get messages for a channel
export async function getMessages(channelId: string): Promise<Message[]> {
  try {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('channel_id', channelId)
      .order('created_at', { ascending: true });

    if (error) throw error;

    return (data || []).map(row => ({
      id: row.id,
      channelId: row.channel_id,
      author: row.author,
      authorEmail: row.author_email || undefined,
      content: row.content,
      isPinned: row.is_pinned || false,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    }));
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Error fetching messages:', error);
    }
    throw error;
  }
}

// Create a new message
export async function createMessage(
  channelId: string,
  content: string,
  authorName: string,
  authorEmail: string
): Promise<Message> {
  try {
    const { data, error } = await supabase
      .from('messages')
      .insert({
        channel_id: channelId,
        author: authorName,
        author_email: authorEmail,
        content: content,
        is_pinned: false,
      })
      .select()
      .single();

    if (error) throw error;

    const message = {
      id: data.id,
      channelId: data.channel_id,
      author: data.author,
      authorEmail: data.author_email || undefined,
      content: data.content,
      isPinned: data.is_pinned || false,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };

    // Get channel name for notification
    const { data: channelData } = await supabase
      .from('channels')
      .select('name')
      .eq('id', channelId)
      .single();

    const channelName = channelData?.name || 'Discussion';

    // Send email notifications to all users who want discussion notifications
    // (excluding the message author)
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://slxai.org';
    const messageUrl = `${baseUrl}/membership-portal/discussions?channel=${channelId}`;
    
    import('@/lib/emailNotifications').then(({ notifyAllUsers }) => {
      notifyAllUsers('discussionNewMessage', async (email, userId) => {
        // Don't notify the author
        if (email === authorEmail) return false;
        
        return sendDiscussionMessageNotification(
          email,
          channelName,
          authorName,
          content,
          messageUrl,
          userId
        );
      }).catch(err => {
        if (import.meta.env.DEV) {
          console.error('Error sending discussion notifications:', err);
        }
      });
    });

    return message;
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Error creating message:', error);
    }
    throw error;
  }
}

// Get reactions for a message
export async function getMessageReactions(messageId: string): Promise<AggregatedReaction[]> {
  try {
    const { data, error } = await supabase
      .from('message_reactions')
      .select('*')
      .eq('message_id', messageId);

    if (error) throw error;

    // Aggregate reactions by emoji
    const reactionMap = new Map<string, AggregatedReaction>();
    
    (data || []).forEach(reaction => {
      const existing = reactionMap.get(reaction.emoji);
      if (existing) {
        existing.count++;
        if (reaction.user_id && !existing.users.includes(reaction.user_id)) {
          existing.users.push(reaction.user_id);
        }
      } else {
        reactionMap.set(reaction.emoji, {
          emoji: reaction.emoji,
          count: 1,
          users: reaction.user_id ? [reaction.user_id] : [],
        });
      }
    });

    return Array.from(reactionMap.values());
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Error fetching message reactions:', error);
    }
    throw error;
  }
}

// Toggle reaction (add if not exists, remove if exists)
export async function toggleReaction(
  messageId: string,
  emoji: string,
  userId: string
): Promise<void> {
  try {
    // Check if reaction already exists
    const { data: existing } = await supabase
      .from('message_reactions')
      .select('id')
      .eq('message_id', messageId)
      .eq('emoji', emoji)
      .eq('user_id', userId)
      .single();

    if (existing) {
      // Remove reaction
      const { error } = await supabase
        .from('message_reactions')
        .delete()
        .eq('message_id', messageId)
        .eq('emoji', emoji)
        .eq('user_id', userId);

      if (error) throw error;
    } else {
      // Add reaction
      const { error } = await supabase
        .from('message_reactions')
        .insert({
          message_id: messageId,
          emoji: emoji,
          user_id: userId,
        });

      if (error) throw error;
    }
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Error toggling reaction:', error);
    }
    throw error;
  }
}

// Toggle pin status
export async function togglePin(messageId: string, isPinned: boolean): Promise<void> {
  try {
    const { error } = await supabase
      .from('messages')
      .update({ is_pinned: isPinned })
      .eq('id', messageId);

    if (error) throw error;
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Error toggling pin:', error);
    }
    throw error;
  }
}

// Get thread replies for a message
export async function getThreadReplies(messageId: string): Promise<ThreadReply[]> {
  try {
    const { data, error } = await supabase
      .from('thread_replies')
      .select('*')
      .eq('message_id', messageId)
      .order('created_at', { ascending: true });

    if (error) throw error;

    return (data || []).map(row => ({
      id: row.id,
      messageId: row.message_id,
      author: row.author,
      authorEmail: row.author_email || undefined,
      content: row.content,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    }));
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Error fetching thread replies:', error);
    }
    throw error;
  }
}

// Create a thread reply
export async function createThreadReply(
  messageId: string,
  content: string,
  authorName: string,
  authorEmail: string
): Promise<ThreadReply> {
  try {
    const { data, error } = await supabase
      .from('thread_replies')
      .insert({
        message_id: messageId,
        author: authorName,
        author_email: authorEmail,
        content: content,
      })
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      messageId: data.message_id,
      author: data.author,
      authorEmail: data.author_email || undefined,
      content: data.content,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Error creating thread reply:', error);
    }
    throw error;
  }
}

// Create a new channel
export async function createChannel(
  name: string,
  description: string,
  createdBy: string
): Promise<Channel> {
  try {
    const { data, error } = await supabase
      .from('channels')
      .insert({
        name: name.toLowerCase().trim(),
        description: description || null,
        is_private: false,
        created_by: createdBy,
      })
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      name: data.name,
      description: data.description || undefined,
      isPrivate: data.is_private || false,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Error creating channel:', error);
    }
    throw error;
  }
}

// Delete a channel
export async function deleteChannel(channelId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('channels')
      .delete()
      .eq('id', channelId);

    if (error) throw error;
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Error deleting channel:', error);
    }
    throw error;
  }
}

// Delete a message
export async function deleteMessage(messageId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('messages')
      .delete()
      .eq('id', messageId);

    if (error) throw error;
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Error deleting message:', error);
    }
    throw error;
  }
}

// Update channels order
export async function updateChannelsOrder(channelIds: string[]): Promise<void> {
  try {
    // Update each channel's display_order based on its position in the array
    const updates = channelIds.map((channelId, index) => 
      supabase
        .from('channels')
        .update({ display_order: index })
        .eq('id', channelId)
    );

    const results = await Promise.all(updates);
    
    // Check for any errors
    for (const result of results) {
      if (result.error) {
        throw result.error;
      }
    }
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Error updating channels order:', error);
    }
    throw error;
  }
}

