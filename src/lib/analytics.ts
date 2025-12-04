// Analytics and metrics tracking - 100% Supabase, no localStorage
import { supabase } from './supabase';

export interface AnalyticsEvent {
  id: string;
  type: 'page_view' | 'click' | 'vote' | 'file_upload' | 'search' | 'export' | 'member_action' | 'discussion' | 'file';
  category: string;
  action: string;
  label?: string;
  value?: number;
  userId?: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

export interface AnalyticsMetrics {
  totalPageViews: number;
  totalVotes: number;
  totalFileUploads: number;
  totalSearches: number;
  totalExports: number;
  activeUsers: number;
  popularPages: { path: string; views: number }[];
  recentActivity: AnalyticsEvent[];
}

// Track an analytics event
export async function trackEvent(event: Omit<AnalyticsEvent, 'id' | 'timestamp'>): Promise<void> {
  try {
    const { error } = await supabase
      .from('analytics_events')
      .insert({
        type: event.type,
        category: event.category,
        action: event.action,
        label: event.label,
        value: event.value,
        user_id: event.userId,
        metadata: event.metadata,
      });

    if (error) {
      console.error('Error tracking event:', error);
      // Don't throw - analytics are non-critical
    }
  } catch (error) {
    console.error('Error tracking event:', error);
    // Don't throw - analytics are non-critical
  }
}

// Track page view
export function trackPageView(path: string, userId?: string): void {
  trackEvent({
    type: 'page_view',
    category: 'navigation',
    action: 'page_view',
    label: path,
    userId,
  });
}

// Get analytics metrics
export async function getMetrics(days: number = 30): Promise<AnalyticsMetrics> {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const { data: events, error } = await supabase
      .from('analytics_events')
      .select('*')
      .gte('created_at', cutoffDate.toISOString())
      .order('created_at', { ascending: false });

    if (error) throw error;
    if (!events) return getEmptyMetrics();

    const analyticsEvents: AnalyticsEvent[] = events.map((e: any) => ({
      id: e.id,
      type: e.type,
      category: e.category,
      action: e.action,
      label: e.label,
      value: e.value,
      userId: e.user_id,
      timestamp: new Date(e.created_at),
      metadata: e.metadata,
    }));

    const pageViews = analyticsEvents.filter(e => e.type === 'page_view');
    const votes = analyticsEvents.filter(e => e.type === 'vote');
    const fileUploads = analyticsEvents.filter(e => e.type === 'file_upload');
    const searches = analyticsEvents.filter(e => e.type === 'search');
    const exports = analyticsEvents.filter(e => e.type === 'export');

    // Get unique users
    const uniqueUsers = new Set(analyticsEvents.map(e => e.userId).filter(Boolean));

    // Get popular pages
    const pageViewMap = new Map<string, number>();
    pageViews.forEach(e => {
      const path = e.label || 'unknown';
      pageViewMap.set(path, (pageViewMap.get(path) || 0) + 1);
    });
    const popularPages = Array.from(pageViewMap.entries())
      .map(([path, views]) => ({ path, views }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 10);

    return {
      totalPageViews: pageViews.length,
      totalVotes: votes.length,
      totalFileUploads: fileUploads.length,
      totalSearches: searches.length,
      totalExports: exports.length,
      activeUsers: uniqueUsers.size,
      popularPages,
      recentActivity: analyticsEvents.slice(0, 20).reverse(),
    };
  } catch (error) {
    console.error('Error getting metrics:', error);
    return getEmptyMetrics();
  }
}

// Get empty metrics (fallback)
function getEmptyMetrics(): AnalyticsMetrics {
  return {
    totalPageViews: 0,
    totalVotes: 0,
    totalFileUploads: 0,
    totalSearches: 0,
    totalExports: 0,
    activeUsers: 0,
    popularPages: [],
    recentActivity: [],
  };
}

// Clear analytics data (admin only)
export async function clearAnalytics(): Promise<void> {
  try {
    const { error } = await supabase
      .from('analytics_events')
      .delete()
      .neq('id', ''); // Delete all

    if (error) throw error;
  } catch (error) {
    console.error('Error clearing analytics:', error);
    throw error;
  }
}
