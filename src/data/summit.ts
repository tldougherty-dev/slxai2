import { supabase } from '@/lib/supabase';

export interface SummitMember {
  id: string;
  email: string;
  name: string;
  organizationId?: string;
  organizationName?: string;
  addedAt: Date;
}

export interface SummitTask {
  id: string;
  title: string;
  description?: string;
  status: 'todo' | 'in_progress' | 'review' | 'done';
  ownerEmail: string;
  ownerName: string;
  dueDate?: Date;
  createdAt: Date;
  updatedAt: Date;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  tags: string[];
}

// Get all summit members
export async function getSummitMembers(): Promise<SummitMember[]> {
  try {
    const { data, error } = await supabase
      .from('summit_members')
      .select('*')
      .order('added_at', { ascending: false });

    if (error) {
      // Log the full error for debugging
      console.error('Summit members query error:', {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint,
      });
      
      // Provide more helpful error messages
      if (error.code === 'PGRST116' || error.code === '42P01' || error.message?.includes('relation') || error.message?.includes('does not exist')) {
        throw new Error('Summit tables not found. Please run SUMMIT_SCHEMA.sql in Supabase SQL Editor.');
      }
      throw error;
    }
    if (!data) return [];

    return data.map(row => ({
      id: row.id,
      email: row.email,
      name: row.name,
      organizationId: row.organization_id,
      organizationName: row.organization_name,
      addedAt: new Date(row.added_at),
    }));
  } catch (error: any) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Error fetching summit members:', error);
    }
    // Re-throw with better error message if it's a table not found error
    if (error instanceof Error && error.message.includes('Summit tables not found')) {
      throw error;
    }
    throw new Error(`Failed to load summit members: ${error?.message || 'Unknown error'}`);
  }
}

// Add a summit member
export async function addSummitMember(member: {
  email: string;
  name: string;
  organizationId?: string;
  organizationName?: string;
}): Promise<void> {
  try {
    const { data, error } = await supabase
      .from('summit_members')
      .insert({
        email: member.email,
        name: member.name,
        organization_id: member.organizationId,
        organization_name: member.organizationName,
      })
      .select();

    if (error) {
      // Log detailed error for debugging
      console.error('Error adding summit member:', {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint,
      });
      throw error;
    }
  } catch (error: any) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Error adding summit member:', error);
    }
    // Provide more helpful error messages
    if (error?.code === '42501') {
      throw new Error('Permission denied: You must be an admin or super admin to add summit members.');
    }
    throw error;
  }
}

// Remove a summit member
export async function removeSummitMember(email: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('summit_members')
      .delete()
      .eq('email', email);

    if (error) throw error;
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Error removing summit member:', error);
    }
    throw error;
  }
}

// Check if user is a summit member
export async function isSummitMember(email: string): Promise<boolean> {
  try {
    // Use RPC function to avoid RLS recursion issues
    const { data, error } = await supabase.rpc('check_is_summit_member', {
      user_email: email
    });

    if (error) {
      // Fallback to direct query if function doesn't exist yet
      if (error.code === '42883' || error.message?.includes('function') || error.message?.includes('does not exist')) {
        const { data: fallbackData, error: fallbackError } = await supabase
          .from('summit_members')
          .select('email')
          .eq('email', email)
          .single();
        
        if (fallbackError && fallbackError.code !== 'PGRST116') {
          console.error('Error checking summit member (fallback):', fallbackError);
          return false;
        }
        return !!fallbackData;
      }
      console.error('Error checking summit member:', error);
      return false;
    }
    
    return data === true;
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Error checking summit member:', error);
    }
    return false;
  }
}

// Get all summit tasks
export async function getSummitTasks(): Promise<SummitTask[]> {
  try {
    const { data, error } = await supabase
      .from('summit_tasks')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      // Log the full error for debugging
      console.error('Summit tasks query error:', {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint,
      });
      
      // Provide more helpful error messages
      if (error.code === 'PGRST116' || error.code === '42P01' || error.message?.includes('relation') || error.message?.includes('does not exist')) {
        throw new Error('Summit tables not found. Please run SUMMIT_SCHEMA.sql in Supabase SQL Editor.');
      }
      throw error;
    }
    if (!data) return [];

    return data.map(row => ({
      id: row.id,
      title: row.title,
      description: row.description,
      status: row.status,
      ownerEmail: row.owner_email,
      ownerName: row.owner_name,
      dueDate: row.due_date ? new Date(row.due_date) : undefined,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
      priority: row.priority,
      tags: row.tags || [],
    }));
  } catch (error: any) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Error fetching summit tasks:', error);
    }
    // Re-throw with better error message if it's a table not found error
    if (error instanceof Error && error.message.includes('Summit tables not found')) {
      throw error;
    }
    throw new Error(`Failed to load summit tasks: ${error?.message || 'Unknown error'}`);
  }
}

// Create a new task
export async function createSummitTask(task: {
  title: string;
  description?: string;
  status?: 'todo' | 'in_progress' | 'review' | 'done';
  ownerEmail: string;
  ownerName: string;
  dueDate?: Date;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  tags?: string[];
}): Promise<SummitTask> {
  try {
    const { data, error } = await supabase
      .from('summit_tasks')
      .insert({
        title: task.title,
        description: task.description,
        status: task.status || 'todo',
        owner_email: task.ownerEmail,
        owner_name: task.ownerName,
        due_date: task.dueDate?.toISOString(),
        priority: task.priority || 'medium',
        tags: task.tags || [],
      })
      .select()
      .single();

    if (error) throw error;
    if (!data) throw new Error('Failed to create task');

    return {
      id: data.id,
      title: data.title,
      description: data.description,
      status: data.status,
      ownerEmail: data.owner_email,
      ownerName: data.owner_name,
      dueDate: data.due_date ? new Date(data.due_date) : undefined,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
      priority: data.priority,
      tags: data.tags || [],
    };
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Error creating summit task:', error);
    }
    throw error;
  }
}

// Update a task
export async function updateSummitTask(
  taskId: string,
  updates: {
    title?: string;
    description?: string;
    status?: 'todo' | 'in_progress' | 'review' | 'done';
    ownerEmail?: string;
    ownerName?: string;
    dueDate?: Date;
    priority?: 'low' | 'medium' | 'high' | 'urgent';
    tags?: string[];
  }
): Promise<void> {
  try {
    const updateData: any = {};
    if (updates.title !== undefined) updateData.title = updates.title;
    if (updates.description !== undefined) updateData.description = updates.description;
    if (updates.status !== undefined) updateData.status = updates.status;
    if (updates.ownerEmail !== undefined) updateData.owner_email = updates.ownerEmail;
    if (updates.ownerName !== undefined) updateData.owner_name = updates.ownerName;
    if (updates.dueDate !== undefined) updateData.due_date = updates.dueDate?.toISOString();
    if (updates.priority !== undefined) updateData.priority = updates.priority;
    if (updates.tags !== undefined) updateData.tags = updates.tags;

    const { error } = await supabase
      .from('summit_tasks')
      .update(updateData)
      .eq('id', taskId);

    if (error) throw error;
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Error updating summit task:', error);
    }
    throw error;
  }
}

// Delete a task
export async function deleteSummitTask(taskId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('summit_tasks')
      .delete()
      .eq('id', taskId);

    if (error) throw error;
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Error deleting summit task:', error);
    }
    throw error;
  }
}

