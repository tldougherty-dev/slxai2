// Activity log management - 100% Supabase, no localStorage
import { supabase } from './supabase';

export interface Activity {
  id: string;
  type: 'member' | 'vote' | 'discussion' | 'file' | 'video' | 'settings';
  action: string;
  name: string;
  userId?: string;
  organizationId?: string;
  timestamp: Date;
  status: 'pending' | 'active' | 'approved' | 'rejected';
  metadata?: Record<string, any>;
}

// Get all activities
export async function getActivities(limit?: number): Promise<Activity[]> {
  try {
    let query = supabase
      .from('activities')
      .select('*')
      .order('created_at', { ascending: false });

    if (limit) {
      query = query.limit(limit);
    } else {
      query = query.limit(100); // Default limit
    }

    const { data, error } = await query;

    if (error) throw error;
    if (!data) return [];

    return data.map((a: any) => ({
      id: a.id,
      type: a.type,
      action: a.action,
      name: a.name,
      userId: a.user_id,
      organizationId: a.organization_id,
      timestamp: new Date(a.created_at),
      status: a.status,
      metadata: a.metadata,
    }));
  } catch (error) {
    console.error('Error fetching activities:', error);
    return [];
  }
}

// Add activity
export async function addActivity(activity: Omit<Activity, 'id' | 'timestamp'>): Promise<void> {
  try {
    const { error } = await supabase
      .from('activities')
      .insert({
        type: activity.type,
        action: activity.action,
        name: activity.name,
        user_id: activity.userId,
        organization_id: activity.organizationId,
        status: activity.status || 'active',
        metadata: activity.metadata,
      });

    if (error) throw error;
  } catch (error) {
    console.error('Error adding activity:', error);
    // Don't throw - activities are non-critical
  }
}

// Clear activities (admin only)
export async function clearActivities(): Promise<void> {
  try {
    const { error } = await supabase
      .from('activities')
      .delete()
      .neq('id', ''); // Delete all

    if (error) throw error;
  } catch (error) {
    console.error('Error clearing activities:', error);
    throw error;
  }
}
