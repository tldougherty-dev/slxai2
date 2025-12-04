// Real-time updates system using Supabase subscriptions with polling fallback
import { supabase } from './supabase';
import { RealtimeChannel } from '@supabase/supabase-js';

export interface RealtimeUpdate {
  type: 'vote' | 'discussion' | 'file' | 'member' | 'vote_result' | 'video';
  id: string;
  action: 'created' | 'updated' | 'deleted';
  data: any;
  timestamp: Date;
}

type UpdateCallback = (update: RealtimeUpdate) => void;

class RealtimeManager {
  private callbacks: Set<UpdateCallback> = new Set();
  private channels: Map<string, RealtimeChannel> = new Map();
  private subscriptions: Map<string, any> = new Map();
  private pollInterval: number | null = null;
  private lastCheckTime: Date = new Date();
  private usePolling: boolean = false; // Fallback to polling if subscriptions fail

  // Subscribe to real-time updates
  subscribe(callback: UpdateCallback): () => void {
    this.callbacks.add(callback);
    
    // Start subscriptions if not already started
    if (this.callbacks.size === 1) {
      this.startSubscriptions();
    }
    
    // Return unsubscribe function
    return () => {
      this.callbacks.delete(callback);
      if (this.callbacks.size === 0) {
        this.stopSubscriptions();
      }
    };
  }

  // Start Supabase real-time subscriptions (with polling fallback)
  private async startSubscriptions() {
    try {
      // Try to set up real-time subscriptions
      await this.setupRealtimeSubscriptions();
      
      // If subscriptions failed, fall back to polling
      if (this.usePolling) {
        if (process.env.NODE_ENV === 'development') {
          console.log('Real-time subscriptions not available, using polling fallback');
        }
        this.startPolling();
      } else if (process.env.NODE_ENV === 'development') {
        console.log(`Real-time subscriptions active (${this.channels.size} channels)`);
      }
    } catch (error) {
      // This shouldn't happen now since we resolve instead of reject
      this.usePolling = true;
      this.startPolling();
    }
  }

  // Set up Supabase real-time subscriptions
  private async setupRealtimeSubscriptions(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        let subscriptionCount = 0;
        let errorCount = 0;
        const totalSubscriptions = 5; // votes, vote_options, files, videos, members
        let resolved = false;

        const checkCompletion = () => {
          if (resolved) return;
          
          // If we have at least one subscription, consider it successful
          if (subscriptionCount > 0) {
            resolved = true;
            resolve();
            return;
          }
          
          // If all subscriptions failed or timed out, use polling
          if (errorCount === totalSubscriptions) {
            resolved = true;
            this.usePolling = true;
            // Don't reject - just silently fall back to polling
            resolve();
            return;
          }
        };

        // Subscribe to votes table
        const votesChannel = supabase
          .channel('votes-changes')
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'votes',
            },
            (payload) => {
              this.handleUpdate({
                type: 'vote',
                id: payload.new?.id || payload.old?.id || '',
                action: this.getAction(payload.eventType),
                data: payload.new || payload.old,
                timestamp: new Date(),
              });
            }
          )
          .subscribe((status) => {
            if (status === 'SUBSCRIBED') {
              this.channels.set('votes', votesChannel);
              subscriptionCount++;
              checkCompletion();
            } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT' || status === 'CLOSED') {
              errorCount++;
              checkCompletion();
            }
          });

        // Subscribe to vote_options table
        const voteOptionsChannel = supabase
          .channel('vote-options-changes')
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'vote_options',
            },
            (payload) => {
              this.handleUpdate({
                type: 'vote_result',
                id: payload.new?.vote_id || payload.old?.vote_id || '',
                action: this.getAction(payload.eventType),
                data: payload.new || payload.old,
                timestamp: new Date(),
              });
            }
          )
          .subscribe((status) => {
            if (status === 'SUBSCRIBED') {
              this.channels.set('vote_options', voteOptionsChannel);
              subscriptionCount++;
              checkCompletion();
            } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT' || status === 'CLOSED') {
              errorCount++;
              checkCompletion();
            }
          });

        // Subscribe to files table
        const filesChannel = supabase
          .channel('files-changes')
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'files',
            },
            (payload) => {
              this.handleUpdate({
                type: 'file',
                id: payload.new?.id || payload.old?.id || '',
                action: this.getAction(payload.eventType),
                data: payload.new || payload.old,
                timestamp: new Date(),
              });
            }
          )
          .subscribe((status) => {
            if (status === 'SUBSCRIBED') {
              this.channels.set('files', filesChannel);
              subscriptionCount++;
              checkCompletion();
            } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT' || status === 'CLOSED') {
              errorCount++;
              checkCompletion();
            }
          });

        // Subscribe to videos table
        const videosChannel = supabase
          .channel('videos-changes')
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'videos',
            },
            (payload) => {
              this.handleUpdate({
                type: 'video',
                id: payload.new?.id || payload.old?.id || '',
                action: this.getAction(payload.eventType),
                data: payload.new || payload.old,
                timestamp: new Date(),
              });
            }
          )
          .subscribe((status) => {
            if (status === 'SUBSCRIBED') {
              this.channels.set('videos', videosChannel);
              subscriptionCount++;
              checkCompletion();
            } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT' || status === 'CLOSED') {
              errorCount++;
              checkCompletion();
            }
          });

        // Subscribe to members table
        const membersChannel = supabase
          .channel('members-changes')
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'members',
            },
            (payload) => {
              this.handleUpdate({
                type: 'member',
                id: payload.new?.id || payload.old?.id || '',
                action: this.getAction(payload.eventType),
                data: payload.new || payload.old,
                timestamp: new Date(),
              });
            }
          )
          .subscribe((status) => {
            if (status === 'SUBSCRIBED') {
              this.channels.set('members', membersChannel);
              subscriptionCount++;
              checkCompletion();
            } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT' || status === 'CLOSED') {
              errorCount++;
              checkCompletion();
            }
          });

        // Fallback timeout - if no subscriptions succeed after 3 seconds, use polling
        setTimeout(() => {
          if (!resolved) {
            resolved = true;
            if (subscriptionCount === 0) {
              this.usePolling = true;
              // Silently resolve to use polling fallback
              resolve();
            } else {
              // Some subscriptions succeeded, that's good enough
              resolve();
            }
          }
        }, 3000);
      } catch (error) {
        this.usePolling = true;
        // Don't reject - just resolve to use polling fallback
        resolve();
      }
    });
  }

  // Start polling for updates (fallback method)
  private startPolling() {
    if (this.pollInterval !== null) return; // Already polling
    
    // Poll every 5 seconds
    this.pollInterval = window.setInterval(() => {
      this.checkForUpdates();
    }, 5000);
  }

  // Stop polling
  private stopPolling() {
    if (this.pollInterval !== null) {
      clearInterval(this.pollInterval);
      this.pollInterval = null;
    }
  }

  // Check for updates (polling method)
  private async checkForUpdates() {
    try {
      const now = new Date();
      
      // Check votes (simplified - just trigger refresh)
      // Components will handle fetching fresh data
      this.handleUpdate({
        type: 'vote',
        id: 'poll',
        action: 'updated',
        data: { timestamp: now },
        timestamp: now,
      });

      // Check files
      this.handleUpdate({
        type: 'file',
        id: 'poll',
        action: 'updated',
        data: { timestamp: now },
        timestamp: now,
      });

      // Check videos
      this.handleUpdate({
        type: 'video',
        id: 'poll',
        action: 'updated',
        data: { timestamp: now },
        timestamp: now,
      });

      // Check members
      this.handleUpdate({
        type: 'member',
        id: 'poll',
        action: 'updated',
        data: { timestamp: now },
        timestamp: now,
      });

      this.lastCheckTime = now;
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error checking for updates:', error);
      }
    }
  }

  // Stop all subscriptions
  private stopSubscriptions() {
    this.channels.forEach((channel) => {
      supabase.removeChannel(channel);
    });
    this.channels.clear();
    this.subscriptions.clear();
    this.stopPolling();
  }

  // Handle update from Supabase or polling
  private handleUpdate(update: RealtimeUpdate) {
    this.callbacks.forEach(callback => {
      try {
        callback(update);
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          console.error('Error in realtime callback:', error);
        }
      }
    });
  }

  // Convert Supabase event type to our action type
  private getAction(eventType: string): 'created' | 'updated' | 'deleted' {
    switch (eventType) {
      case 'INSERT':
        return 'created';
      case 'UPDATE':
        return 'updated';
      case 'DELETE':
        return 'deleted';
      default:
        return 'updated';
    }
  }

  // Manually trigger an update (for local changes)
  triggerUpdate(update: RealtimeUpdate) {
    this.handleUpdate(update);
  }

  // Cleanup
  destroy() {
    this.stopSubscriptions();
    this.callbacks.clear();
  }
}

// Singleton instance
export const realtimeManager = new RealtimeManager();

// Import React for the hook
import { useEffect } from 'react';

// Hook for React components
export function useRealtimeUpdates(callback: UpdateCallback, deps: any[] = []) {
  useEffect(() => {
    const unsubscribe = realtimeManager.subscribe(callback);
    return unsubscribe;
  }, deps);
}
