import { supabase } from '@/lib/supabase';

export async function uploadNewsletterImage(file: File, userId: string): Promise<string> {
  const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
  const allowed = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
  if (!allowed.includes(fileExt)) {
    throw new Error('Use JPG, PNG, GIF, or WebP images.');
  }
  if (file.size > 8 * 1024 * 1024) {
    throw new Error('Image must be 8 MB or smaller.');
  }

  const filePath = `newsletter/${userId}-${Date.now()}.${fileExt}`;
  const { error } = await supabase.storage.from('post-images').upload(filePath, file, {
    cacheControl: '3600',
    upsert: false,
  });
  if (error) throw new Error(`Upload failed: ${error.message}`);

  const { data } = supabase.storage.from('post-images').getPublicUrl(filePath);
  return data.publicUrl;
}
