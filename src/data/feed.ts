// Feed system data management
import { supabase } from '@/lib/supabase';
import { sendNewPostNotification } from '@/lib/email';
import { notifyAllUsers } from '@/lib/emailNotifications';

export type PostType = 'video' | 'document' | 'link' | 'text';
export type ReactionType = 'like' | 'love' | 'celebrate' | 'insightful' | 'curious';

export interface FeedPost {
  id: string;
  organizationId: string;
  organizationName?: string;
  organizationLogo?: string;
  authorId: string;
  authorName: string;
  authorEmail: string;
  content: string;
  postType: PostType;
  mediaUrl?: string;
  mediaTitle?: string;
  mediaDescription?: string;
  createdAt: Date;
  updatedAt: Date;
  postSource?: 'profile' | 'organization';
  reactionCounts?: { [key in ReactionType]: number };
  userReactions?: ReactionType[];
  commentCount?: number;
}

export interface PostComment {
  id: string;
  postId: string;
  authorId: string;
  authorName: string;
  authorEmail: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PostReaction {
  id: string;
  postId: string;
  userId: string;
  userEmail: string;
  reactionType: ReactionType;
  createdAt: Date;
}

// Get posts for a specific organization
export async function getOrganizationPosts(organizationId: string): Promise<FeedPost[]> {
  try {
    const { data, error } = await supabase
      .from('feed_posts')
      .select(`
        *,
        members!feed_posts_organization_id_fkey(organization_name, logo)
      `)
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    if (!data) return [];

    // Get reaction counts and user reactions for each post
    const postsWithReactions = await Promise.all(
      data.map(async (post: any) => {
        const postId = post.id;
        const userId = (await supabase.auth.getUser()).data.user?.id;

        // Get reaction counts
        const { data: reactions } = await supabase
          .from('feed_post_reactions')
          .select('reaction_type')
          .eq('post_id', postId);

        const reactionCounts: { [key in ReactionType]: number } = {
          like: 0,
          love: 0,
          celebrate: 0,
          insightful: 0,
          curious: 0,
        };

        reactions?.forEach((r: any) => {
          reactionCounts[r.reaction_type as ReactionType]++;
        });

        // Get user's reactions
        const userReactions: ReactionType[] = [];
        if (userId) {
          const { data: userReacts } = await supabase
            .from('feed_post_reactions')
            .select('reaction_type')
            .eq('post_id', postId)
            .eq('user_id', userId);

          userReacts?.forEach((r: any) => {
            userReactions.push(r.reaction_type as ReactionType);
          });
        }

        // Get comment count
        const { count } = await supabase
          .from('feed_post_comments')
          .select('*', { count: 'exact', head: true })
          .eq('post_id', postId);

        return {
          id: post.id,
          organizationId: post.organization_id,
          organizationName: post.members?.organization_name,
          organizationLogo: post.members?.logo,
          authorId: post.author_id,
          authorName: post.author_name,
          authorEmail: post.author_email,
          content: post.content,
          postType: post.post_type as PostType,
          mediaUrl: post.media_url,
          mediaTitle: post.media_title,
          mediaDescription: post.media_description,
          createdAt: new Date(post.created_at),
          updatedAt: new Date(post.updated_at),
          postSource: post.post_source || 'profile',
          reactionCounts,
          userReactions,
          commentCount: count || 0,
        };
      })
    );

    return postsWithReactions;
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Error fetching organization posts:', error);
    }
    return [];
  }
}

// Get posts by a specific author (user's own posts)
export async function getUserPosts(authorId: string): Promise<FeedPost[]> {
  try {
    const { data, error } = await supabase
      .from('feed_posts')
      .select(`
        *,
        members!feed_posts_organization_id_fkey(organization_name, logo)
      `)
      .eq('author_id', authorId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    if (!data) return [];

    // Get reaction counts and user reactions for each post
    const postsWithReactions = await Promise.all(
      data.map(async (post: any) => {
        const postId = post.id;
        const userId = (await supabase.auth.getUser()).data.user?.id;

        // Get reaction counts
        const { data: reactions } = await supabase
          .from('feed_post_reactions')
          .select('reaction_type')
          .eq('post_id', postId);

        const reactionCounts: { [key in ReactionType]: number } = {
          like: 0,
          love: 0,
          celebrate: 0,
          insightful: 0,
          curious: 0,
        };

        reactions?.forEach((r: any) => {
          reactionCounts[r.reaction_type as ReactionType]++;
        });

        // Get user's reactions
        const userReactions: ReactionType[] = [];
        if (userId) {
          const { data: userReacts } = await supabase
            .from('feed_post_reactions')
            .select('reaction_type')
            .eq('post_id', postId)
            .eq('user_id', userId);

          userReacts?.forEach((r: any) => {
            userReactions.push(r.reaction_type as ReactionType);
          });
        }

        // Get comment count
        const { count } = await supabase
          .from('feed_post_comments')
          .select('*', { count: 'exact', head: true })
          .eq('post_id', postId);

        return {
          id: post.id,
          organizationId: post.organization_id,
          organizationName: post.members?.organization_name,
          organizationLogo: post.members?.logo,
          authorId: post.author_id,
          authorName: post.author_name,
          authorEmail: post.author_email,
          content: post.content,
          postType: post.post_type as PostType,
          mediaUrl: post.media_url,
          mediaTitle: post.media_title,
          mediaDescription: post.media_description,
          createdAt: new Date(post.created_at),
          updatedAt: new Date(post.updated_at),
          postSource: post.post_source || 'profile',
          reactionCounts,
          userReactions,
          commentCount: count || 0,
        };
      })
    );

    return postsWithReactions;
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Error fetching user posts:', error);
    }
    return [];
  }
}

// Get all posts ordered by creation date (newest first)
export async function getFeedPosts(): Promise<FeedPost[]> {
  try {
    const { data, error } = await supabase
      .from('feed_posts')
      .select(`
        *,
        members!feed_posts_organization_id_fkey(organization_name, logo)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    if (!data) return [];

    // Get reaction counts and user reactions for each post
    const postsWithReactions = await Promise.all(
      data.map(async (post: any) => {
        const postId = post.id;
        const userId = (await supabase.auth.getUser()).data.user?.id;

        // Get reaction counts
        const { data: reactions } = await supabase
          .from('feed_post_reactions')
          .select('reaction_type')
          .eq('post_id', postId);

        const reactionCounts: { [key in ReactionType]: number } = {
          like: 0,
          love: 0,
          celebrate: 0,
          insightful: 0,
          curious: 0,
        };

        reactions?.forEach((r: any) => {
          reactionCounts[r.reaction_type as ReactionType]++;
        });

        // Get user's reactions
        const userReactions: ReactionType[] = [];
        if (userId) {
          const { data: userReacts } = await supabase
            .from('feed_post_reactions')
            .select('reaction_type')
            .eq('post_id', postId)
            .eq('user_id', userId);

          userReacts?.forEach((r: any) => {
            userReactions.push(r.reaction_type as ReactionType);
          });
        }

        // Get comment count
        const { count } = await supabase
          .from('feed_post_comments')
          .select('*', { count: 'exact', head: true })
          .eq('post_id', postId);

        return {
          id: post.id,
          organizationId: post.organization_id,
          organizationName: post.members?.organization_name,
          organizationLogo: post.members?.logo,
          authorId: post.author_id,
          authorName: post.author_name,
          authorEmail: post.author_email,
          content: post.content,
          postType: post.post_type as PostType,
          mediaUrl: post.media_url,
          mediaTitle: post.media_title,
          mediaDescription: post.media_description,
          createdAt: new Date(post.created_at),
          updatedAt: new Date(post.updated_at),
          postSource: post.post_source || 'profile',
          reactionCounts,
          userReactions,
          commentCount: count || 0,
        };
      })
    );

    return postsWithReactions;
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Error fetching feed posts:', error);
    }
    return [];
  }
}

// Create a new post
export async function createPost(post: {
  organizationId: string;
  content: string;
  postType: PostType;
  mediaUrl?: string;
  mediaTitle?: string;
  mediaDescription?: string;
  postSource?: 'profile' | 'organization';
}): Promise<void> {
  try {
    // Force refresh session token to get latest metadata (RLS uses the token!)
    const { data: { session }, error: sessionError } = await supabase.auth.refreshSession();
    if (sessionError) {
      throw new Error(`Session refresh error: ${sessionError.message}`);
    }
    
    const user = session?.user;
    if (!user) throw new Error('User not authenticated');

    // Convert organizationId to UUID format if it's a string
    const orgId = post.organizationId;

    const { data, error } = await supabase.from('feed_posts').insert({
      organization_id: orgId, // Supabase will handle UUID conversion
      author_id: user.id,
      author_name: user.user_metadata?.name || user.email?.split('@')[0] || 'User',
      author_email: user.email || '',
      content: post.content,
      post_type: post.postType,
      media_url: post.mediaUrl || null,
      media_title: post.mediaTitle || null,
      media_description: post.mediaDescription || null,
      post_source: post.postSource || 'profile',
    }).select();

    if (error) {
      // Log full error details (dev only)
      if (import.meta.env.DEV) {
        console.error('Supabase insert error:', {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint,
          organizationId: post.organizationId,
          userOrgId: user.user_metadata?.organization_id,
        });
      }
      
      // Provide more detailed error messages
      if (error.code === '42501') {
        // Log the full error for debugging (dev only)
        if (import.meta.env.DEV) {
          console.error('RLS Permission Denied - Full Error:', {
            errorCode: error.code,
            errorMessage: error.message,
            errorDetails: error.details,
            errorHint: error.hint,
            organizationId: post.organizationId,
            userOrgIdFromToken: user.user_metadata?.organization_id,
            userId: user.id,
          });
        }
        throw new Error(`Permission denied (RLS): Your org_id in token: ${user.user_metadata?.organization_id || 'null'}, Trying to post for: ${post.organizationId}. The RLS policy is blocking this.`);
      } else if (error.code === '23503') {
        throw new Error('Invalid organization: The organization ID does not exist.');
      } else {
        throw new Error(`Failed to create post: ${error.message} (Code: ${error.code})`);
      }
    }

    if (!data || data.length === 0) {
      throw new Error('Post was not created. Please try again.');
    }

    // Send email notifications to all users who want feed notifications
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://slxai.org';
    const postUrl = `${baseUrl}/membership-portal`;
    const authorName = user.user_metadata?.name || user.email?.split('@')[0] || 'User';
    
    // Send notifications asynchronously (don't block post creation)
    notifyAllUsers('feedNewPost', async (email, userId) => {
      return sendNewPostNotification(
        email,
        authorName,
        post.content,
        postUrl,
        userId
      );
    }).catch(err => {
      if (import.meta.env.DEV) {
        console.error('Error sending post notifications:', err);
      }
    });
  } catch (error: any) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Error creating post:', error);
    }
    // Re-throw with better error message
    if (error instanceof Error) {
      throw error;
    }
    throw new Error(`Failed to create post: ${error?.message || 'Unknown error'}`);
  }
}

// Get comments for a post
export async function getPostComments(postId: string): Promise<PostComment[]> {
  try {
    const { data, error } = await supabase
      .from('feed_post_comments')
      .select('*')
      .eq('post_id', postId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    if (!data) return [];

    return data.map((comment: any) => ({
      id: comment.id,
      postId: comment.post_id,
      authorId: comment.author_id,
      authorName: comment.author_name,
      authorEmail: comment.author_email,
      content: comment.content,
      createdAt: new Date(comment.created_at),
      updatedAt: new Date(comment.updated_at),
    }));
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Error fetching comments:', error);
    }
    return [];
  }
}

// Add a comment to a post
export async function addComment(postId: string, content: string): Promise<void> {
  try {
    const user = (await supabase.auth.getUser()).data.user;
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase.from('feed_post_comments').insert({
      post_id: postId,
      author_id: user.id,
      author_name: user.user_metadata?.name || user.email?.split('@')[0] || 'User',
      author_email: user.email || '',
      content: content,
    });

    if (error) throw error;

    // Get post author to notify them
    const { data: postData } = await supabase
      .from('feed_posts')
      .select('author_email, author_id, author_name, content')
      .eq('id', postId)
      .single();

    if (postData && postData.author_email && postData.author_email !== user.email) {
      const commentAuthorName = user.user_metadata?.name || user.email?.split('@')[0] || 'User';
      const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://slxai.org';
      const postUrl = `${baseUrl}/membership-portal`;
      
      // Send notification asynchronously
      import('@/lib/email').then(({ sendReplyNotification }) => {
        sendReplyNotification(
          postData.author_email,
          commentAuthorName,
          content,
          postUrl,
          false, // isCommentReply
          postData.author_id
        ).catch(err => {
          if (import.meta.env.DEV) {
            console.error('Error sending reply notification:', err);
          }
        });
      });
    }
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Error adding comment:', error);
    }
    throw error;
  }
}

// Delete a comment
export async function deleteComment(commentId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('feed_post_comments')
      .delete()
      .eq('id', commentId);

    if (error) throw error;
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Error deleting comment:', error);
    }
    throw error;
  }
}

// Add or update a reaction
export async function toggleReaction(postId: string, reactionType: ReactionType): Promise<void> {
  try {
    const user = (await supabase.auth.getUser()).data.user;
    if (!user) throw new Error('User not authenticated');

    // Check if user already has this reaction
    const { data: existing } = await supabase
      .from('feed_post_reactions')
      .select('id')
      .eq('post_id', postId)
      .eq('user_id', user.id)
      .eq('reaction_type', reactionType)
      .single();

    if (existing) {
      // Remove reaction
      const { error } = await supabase
        .from('feed_post_reactions')
        .delete()
        .eq('id', existing.id);

      if (error) throw error;
    } else {
      // Remove any existing reaction from this user on this post
      await supabase
        .from('feed_post_reactions')
        .delete()
        .eq('post_id', postId)
        .eq('user_id', user.id);

      // Add new reaction
      const { error } = await supabase.from('feed_post_reactions').insert({
        post_id: postId,
        user_id: user.id,
        user_email: user.email || '',
        reaction_type: reactionType,
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

// Delete a post
// Update a post
export async function updatePost(postId: string, updates: {
  content?: string;
  postType?: PostType;
  mediaUrl?: string | null;
  mediaTitle?: string | null;
  mediaDescription?: string | null;
}): Promise<void> {
  try {
    const user = (await supabase.auth.getUser()).data.user;
    if (!user) throw new Error('User not authenticated');

    const updateData: any = {
      updated_at: new Date().toISOString(),
    };

    if (updates.content !== undefined) {
      updateData.content = updates.content;
    }
    if (updates.postType !== undefined) {
      updateData.post_type = updates.postType;
    }
    if (updates.mediaUrl !== undefined) {
      updateData.media_url = updates.mediaUrl;
    }
    if (updates.mediaTitle !== undefined) {
      updateData.media_title = updates.mediaTitle;
    }
    if (updates.mediaDescription !== undefined) {
      updateData.media_description = updates.mediaDescription;
    }

    const { error } = await supabase
      .from('feed_posts')
      .update(updateData)
      .eq('id', postId);

    if (error) throw error;
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Error updating post:', error);
    }
    throw error;
  }
}

export async function deletePost(postId: string): Promise<void> {
  try {
    // Refresh session to ensure we have latest user metadata
    const { data: { session }, error: sessionError } = await supabase.auth.refreshSession();
    if (sessionError) {
      if (import.meta.env.DEV) {
        console.warn('Session refresh error:', sessionError);
      }
    }
    
    const user = session?.user;
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('feed_posts')
      .delete()
      .eq('id', postId);

    if (error) {
      // Log detailed error for debugging
      if (process.env.NODE_ENV === 'development') {
        console.error('Delete post error:', {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint,
          postId,
          userId: user.id,
          userRole: user.user_metadata?.role,
        });
      }
      
      // Provide more helpful error messages
      if (error.code === '42501') {
        throw new Error(`Permission denied: You don't have permission to delete this post. Only the post author, admins, and super admins can delete posts.`);
      }
      
      throw error;
    }
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Error deleting post:', error);
    }
    throw error;
  }
}

