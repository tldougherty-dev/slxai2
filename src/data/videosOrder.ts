// Videos order management with Supabase
import { supabase } from '@/lib/supabase';
import { getCompanyVideosAsResources } from './companyVideos';

export interface VideoResource {
  id: string;
  name: string;
  type: 'video';
  lastModified: string;
  uploadedBy: string;
  description?: string;
  embedUrl: string;
}

// Fallback data
const fallbackVideos: VideoResource[] = getCompanyVideosAsResources();

// Helper: Convert Supabase row to VideoResource
function supabaseRowToVideo(row: any): VideoResource {
  return {
    id: row.id,
    name: row.name,
    type: 'video',
    lastModified: row.updated_at ? new Date(row.updated_at).toLocaleDateString() : new Date(row.created_at).toLocaleDateString(),
    uploadedBy: row.uploaded_by || 'Unknown',
    description: row.description,
    embedUrl: row.embed_url,
  };
}

// Get ordered videos (newest first)
export async function getOrderedVideos(): Promise<VideoResource[]> {
  try {
    const { data: videos, error } = await supabase
      .from('videos')
      .select('*')
      .order('created_at', { ascending: false }); // Newest first

    if (error) throw error;
    if (!videos || videos.length === 0) return [...fallbackVideos];

    return videos.map(supabaseRowToVideo);
  } catch (error) {
    console.error('Error fetching videos from Supabase:', error);
    return [...fallbackVideos];
  }
}

// Get current order (returns array of IDs)
export async function getVideosOrder(): Promise<string[]> {
  try {
    const videos = await getOrderedVideos();
    return videos.map(v => v.id);
  } catch (error) {
    console.error('Error getting videos order:', error);
    return fallbackVideos.map(v => v.id);
  }
}

// Update videos order
export async function updateVideosOrder(newOrder: string[]): Promise<void> {
  try {
    // For now, we'll update the order by updating created_at timestamps
    // In a production system, you'd want a dedicated `order` column
    // For simplicity, we'll just ensure the order is maintained by the order array
    // The actual ordering will be handled by the frontend
    
    // If you want to persist order, you could add an `order` column to the videos table
    // For now, we'll just return successfully
    // The order is maintained client-side and videos are ordered by created_at DESC
  } catch (error) {
    console.error('Error updating videos order:', error);
    throw error;
  }
}

// Add a new video
export async function addVideo(video: VideoResource): Promise<void> {
  try {
    const { error } = await supabase
      .from('videos')
      .insert({
        id: video.id,
        name: video.name,
        description: video.description,
        embed_url: video.embedUrl,
        uploaded_by: video.uploadedBy,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

    if (error) throw error;
  } catch (error) {
    console.error('Error adding video to Supabase:', error);
    throw error;
  }
}

// Update a video
export async function updateVideo(videoId: string, updates: Partial<VideoResource>): Promise<void> {
  try {
    const updateData: any = {
      updated_at: new Date().toISOString(),
    };

    if (updates.name !== undefined) updateData.name = updates.name;
    if (updates.description !== undefined) updateData.description = updates.description;
    if (updates.embedUrl !== undefined) updateData.embed_url = updates.embedUrl;
    if (updates.uploadedBy !== undefined) updateData.uploaded_by = updates.uploadedBy;

    const { error } = await supabase
      .from('videos')
      .update(updateData)
      .eq('id', videoId);

    if (error) throw error;
  } catch (error) {
    console.error('Error updating video in Supabase:', error);
    throw error;
  }
}

// Delete a video
export async function deleteVideo(videoId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('videos')
      .delete()
      .eq('id', videoId);

    if (error) throw error;
  } catch (error) {
    console.error('Error deleting video from Supabase:', error);
    throw error;
  }
}
