// File order management with Supabase
import { supabase } from '@/lib/supabase';

export type ResourceType = 'document' | 'spreadsheet' | 'ebook' | 'other';

export interface FileCategory {
  id: string;
  name: string;
  color?: string; // Optional color for visual distinction
  displayOrder?: number; // Order for display
  _uuid?: string; // Internal UUID from database (if different from id)
}

export interface FileResource {
  id: string;
  name: string;
  type: ResourceType;
  size: string;
  lastModified: string;
  uploadedBy: string;
  description?: string;
  categoryId?: string; // Category ID
  fileUrl?: string; // URL to the file in storage
  fileMonth?: number; // Optional month (1-12)
  fileYear?: number; // Required year
  authors?: string[]; // Array of author names
}

// Default categories (stored in-memory for now)
let categories: FileCategory[] = [
  { id: 'research', name: 'Research', color: '#3b82f6' },
  { id: 'meeting-minutes', name: 'Meeting Minutes', color: '#10b981' },
  { id: 'standards', name: 'Standards', color: '#f59e0b' },
  { id: 'governance', name: 'Governance', color: '#8b5cf6' },
  { id: 'other', name: 'Other', color: '#6b7280' },
];

// Fallback files data
const fallbackFiles: FileResource[] = [];

// Helper: Convert Supabase row to FileResource
function supabaseRowToFile(row: any): FileResource {
  // Parse authors from JSONB array or comma-separated string
  let authors: string[] | undefined = undefined;
  if (row.authors) {
    if (Array.isArray(row.authors)) {
      authors = row.authors;
    } else if (typeof row.authors === 'string') {
      try {
        const parsed = JSON.parse(row.authors);
        authors = Array.isArray(parsed) ? parsed : [row.authors];
      } catch {
        // If not JSON, treat as comma-separated string
        authors = row.authors.split(',').map((a: string) => a.trim()).filter((a: string) => a.length > 0);
      }
    }
  }
  
  return {
    id: row.id,
    name: row.name,
    type: (row.type as ResourceType) || 'other',
    size: '0 MB', // Size not stored in DB, will be calculated from file_url if needed
    lastModified: row.updated_at ? new Date(row.updated_at).toLocaleDateString() : new Date(row.created_at).toLocaleDateString(),
    uploadedBy: row.uploaded_by || 'Unknown',
    description: row.description,
    categoryId: row.category_id,
    fileUrl: row.file_url,
    fileMonth: row.file_month || undefined,
    fileYear: row.file_year || undefined,
    authors: authors,
  };
}

// Get all categories (from Supabase if available, otherwise from memory)
export async function getCategories(): Promise<FileCategory[]> {
  try {
    // Try to order by display_order first, but fall back to created_at if column doesn't exist
    let { data, error } = await supabase
      .from('file_categories')
      .select('*')
      .order('display_order', { ascending: true, nullsFirst: false })
      .order('created_at', { ascending: true });

    // If display_order column doesn't exist, try without it
    if (error && error.message?.includes('display_order')) {
      if (process.env.NODE_ENV === 'development') {
        console.warn('display_order column not found, ordering by created_at only');
      }
      const result = await supabase
        .from('file_categories')
        .select('*')
        .order('created_at', { ascending: true });
      data = result.data;
      error = result.error;
    }

    if (error) throw error;
    
    if (data && data.length > 0) {
      return data.map((row: any) => {
        // Use UUID from database as the ID (since database uses UUIDs)
        // This ensures we can update categories correctly
        return {
          id: row.id, // Use the UUID directly from database
          name: row.name,
          color: row.color,
          displayOrder: row.display_order || 0,
        };
      });
    }
    
    // Fallback to in-memory categories
    return [...categories];
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Error fetching categories from Supabase:', error);
    }
    // Fallback to in-memory categories
    return [...categories];
  }
}

// Get categories synchronously (for backward compatibility)
export function getCategoriesSync(): FileCategory[] {
  return [...categories];
}

// Add a new category
export async function addCategory(category: FileCategory): Promise<void> {
  try {
    // Get max display_order to add new category at the end
    const existingCategories = await getCategories();
    const maxOrder = existingCategories.reduce((max, cat) => 
      Math.max(max, cat.displayOrder || 0), 0
    );

    const { error } = await supabase
      .from('file_categories')
      .insert({
        id: category.id,
        name: category.name,
        color: category.color || '#3b82f6',
        display_order: maxOrder + 1,
      });

    if (error) throw error;
    
    // Update local cache
    categories.push({ ...category, displayOrder: maxOrder + 1 });
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Error adding category to Supabase:', error);
    }
    // Fallback to in-memory
    categories.push(category);
    throw error;
  }
}

// Update a category
export async function updateCategory(categoryId: string, updates: Partial<FileCategory>): Promise<void> {
  try {
    const updateData: any = {};
    
    if (updates.name !== undefined) updateData.name = updates.name;
    if (updates.color !== undefined) updateData.color = updates.color;
    if (updates.displayOrder !== undefined) updateData.display_order = updates.displayOrder;

    const { error } = await supabase
      .from('file_categories')
      .update(updateData)
      .eq('id', categoryId);

    if (error) throw error;
    
    // Update local cache
    const index = categories.findIndex(c => c.id === categoryId);
    if (index !== -1) {
      categories[index] = { ...categories[index], ...updates };
    }
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Error updating category in Supabase:', error);
    }
    // Fallback to in-memory
    const index = categories.findIndex(c => c.id === categoryId);
    if (index !== -1) {
      categories[index] = { ...categories[index], ...updates };
    }
    throw error;
  }
}

// Delete a category
export async function deleteCategory(categoryId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('file_categories')
      .delete()
      .eq('id', categoryId);

    if (error) throw error;
    
    // Update local cache
    categories = categories.filter(c => c.id !== categoryId);
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Error deleting category from Supabase:', error);
    }
    // Fallback to in-memory
    categories = categories.filter(c => c.id !== categoryId);
    throw error;
  }
}

// Update categories order
export async function updateCategoriesOrder(newOrder: string[]): Promise<void> {
  try {
    
    // First, get all categories to map the category IDs (which might be UUIDs or string IDs) to actual UUIDs
    const { data: allCategories, error: fetchError } = await supabase
      .from('file_categories')
      .select('id, name, display_order');
    
    if (fetchError) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error fetching categories:', fetchError);
      }
      throw new Error(`Failed to fetch categories: ${fetchError.message}`);
    }
    
    if (!allCategories || allCategories.length === 0) {
      if (process.env.NODE_ENV === 'development') {
        console.warn('No categories found in database');
      }
      throw new Error('No categories found in database');
    }
    
    
    // Create a mapping: categoryId (from newOrder) -> UUID (from database)
    const idToUuid = new Map<string, string>();
    
    // Map UUIDs directly
    allCategories.forEach((cat: any) => {
      idToUuid.set(cat.id, cat.id); // UUID -> UUID
      
      // Also create name-based mapping (e.g., 'research' -> UUID) for fallback
      if (cat.name) {
        const nameKey = cat.name.toLowerCase().replace(/\s+/g, '-');
        idToUuid.set(nameKey, cat.id);
        idToUuid.set(cat.name.toLowerCase(), cat.id);
      }
    });
    
    
    // Update display_order for each category based on its position in the newOrder array
    const updatePromises = newOrder.map(async (categoryId, index) => {
      // Try to find the UUID
      let uuid = idToUuid.get(categoryId);
      
      // If not found, try case-insensitive match
      if (!uuid) {
        for (const [key, value] of idToUuid.entries()) {
          if (key.toLowerCase() === categoryId.toLowerCase()) {
            uuid = value;
            break;
          }
        }
      }
      
      if (!uuid) {
        const errorMsg = `Could not find UUID for category ID: ${categoryId}. Available IDs: ${Array.from(idToUuid.keys()).join(', ')}`;
        if (process.env.NODE_ENV === 'development') {
          console.error(errorMsg);
        }
        return { error: new Error(errorMsg) };
      }
      
      
      const { data, error } = await supabase
        .from('file_categories')
        .update({ display_order: index })
        .eq('id', uuid)
        .select();
      
      if (error) {
        if (process.env.NODE_ENV === 'development') {
          console.error(`Error updating category ${categoryId} (UUID: ${uuid}):`, error);
        }
        return { error };
      }
      
      return { error: null };
    });

    // Execute all updates
    const results = await Promise.all(updatePromises);
    
    // Check for errors
    const errors = results.filter(result => result.error);
    if (errors.length > 0) {
      const errorMessages = errors.map(e => e.error?.message || 'Unknown error').join('; ');
      if (process.env.NODE_ENV === 'development') {
        console.error('Some category order updates failed:', errors);
      }
      throw new Error(`Failed to update category order: ${errorMessages}`);
    }
    
  } catch (error: any) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Error updating categories order:', error);
    }
    throw error;
  }
}

// Get category by ID
export function getCategoryById(categoryId: string): FileCategory | undefined {
  return categories.find(c => c.id === categoryId);
}

// Get all files
export async function getAllFiles(): Promise<FileResource[]> {
  try {
    const { data: files, error } = await supabase
      .from('files')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    if (!files || files.length === 0) return [...fallbackFiles];

    return files.map(supabaseRowToFile);
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Error fetching files from Supabase:', error);
    }
    return [...fallbackFiles];
  }
}

// Get ordered files (by display_order, then by created_at DESC)
export async function getOrderedFiles(): Promise<FileResource[]> {
  try {
    // Try to order by display_order first, but fall back to created_at if column doesn't exist
    let { data: files, error } = await supabase
      .from('files')
      .select('*')
      .order('display_order', { ascending: true, nullsFirst: true })
      .order('created_at', { ascending: false });

    // If display_order column doesn't exist, try without it
    if (error && error.message?.includes('display_order')) {
      if (process.env.NODE_ENV === 'development') {
        console.warn('display_order column not found for files, ordering by created_at only');
      }
      const result = await supabase
        .from('files')
        .select('*')
        .order('created_at', { ascending: false });
      files = result.data;
      error = result.error;
    }

    if (error) throw error;
    if (!files || files.length === 0) return [...fallbackFiles];

    return files.map(supabaseRowToFile);
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Error fetching ordered files from Supabase:', error);
    }
    // Fallback to getAllFiles if display_order ordering fails
    return getAllFiles();
  }
}

// Update a file
export async function updateFile(fileId: string, updates: Partial<FileResource>): Promise<void> {
  try {
    const updateData: any = {
      updated_at: new Date().toISOString(),
    };

    if (updates.name !== undefined) updateData.name = updates.name;
    if (updates.type !== undefined) updateData.type = updates.type;
    if (updates.description !== undefined) updateData.description = updates.description;
    if (updates.categoryId !== undefined) updateData.category_id = updates.categoryId;
    if (updates.uploadedBy !== undefined) updateData.uploaded_by = updates.uploadedBy;
    if (updates.fileMonth !== undefined) updateData.file_month = updates.fileMonth;
    if (updates.fileYear !== undefined) updateData.file_year = updates.fileYear;
    if (updates.authors !== undefined) updateData.authors = updates.authors && updates.authors.length > 0 ? updates.authors : null;

    const { error } = await supabase
      .from('files')
      .update(updateData)
      .eq('id', fileId);

    if (error) throw error;
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Error updating file in Supabase:', error);
    }
    throw error;
  }
}

// Add a new file
export async function addFile(file: FileResource): Promise<void> {
  try {
    const { error } = await supabase
      .from('files')
      .insert({
        id: file.id,
        name: file.name,
        type: file.type,
        description: file.description,
        category_id: file.categoryId,
        file_url: '', // Will be set when file is uploaded to storage
        uploaded_by: file.uploadedBy,
        file_month: file.fileMonth || null,
        file_year: file.fileYear || null,
        authors: file.authors && file.authors.length > 0 ? file.authors : null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

    if (error) throw error;

    // Get category name for notification
    let categoryName = 'Files';
    if (file.categoryId) {
      const { data: categoryData } = await supabase
        .from('file_categories')
        .select('name')
        .eq('id', file.categoryId)
        .single();
      
      if (categoryData) {
        categoryName = categoryData.name;
      }
    }

    // Send email notifications to all users who want file notifications
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://slxai.org';
    const fileUrl = `${baseUrl}/membership-portal/files`;
    
    import('@/lib/emailNotifications').then(({ notifyAllUsers }) => {
      import('@/lib/email').then(({ sendNewFileNotification }) => {
        notifyAllUsers('fileNewUpload', async (email, userId) => {
          return sendNewFileNotification(
            email,
            file.name,
            categoryName,
            fileUrl,
            userId
          );
        }).catch(err => {
          if (import.meta.env.DEV) {
            console.error('Error sending file notifications:', err);
          }
        });
      });
    });
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Error adding file to Supabase:', error);
    }
    throw error;
  }
}

// Delete a file
export async function deleteFile(fileId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('files')
      .delete()
      .eq('id', fileId);

    if (error) throw error;
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Error deleting file from Supabase:', error);
    }
    throw error;
  }
}

// Update files order (for drag-and-drop reordering)
export async function updateFilesOrder(newOrder: string[]): Promise<void> {
  try {
    // Update display_order for each file based on its position in the newOrder array
    // Use Promise.all to update all files in parallel
    const updatePromises = newOrder.map((fileId, index) => {
      return supabase
        .from('files')
        .update({ 
          display_order: index,
          updated_at: new Date().toISOString() 
        })
        .eq('id', fileId);
    });

    // Execute all updates
    const results = await Promise.all(updatePromises);
    
    // Check for errors
    const errors = results.filter(result => result.error);
    if (errors.length > 0) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Some file order updates failed:', errors);
      }
      throw errors[0].error;
    }
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Error updating files order:', error);
    }
    throw error;
  }
}

// Get current order (returns array of IDs)
export async function getFilesOrder(): Promise<string[]> {
  try {
    const files = await getOrderedFiles();
    return files.map(f => f.id);
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Error getting files order:', error);
    }
    return [];
  }
}
