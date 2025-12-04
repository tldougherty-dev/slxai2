// Flag storage management - 100% Supabase Storage, no local files
import { supabase } from './supabase';

const FLAGS_BUCKET = 'flags';

/**
 * Get flag URL from Supabase Storage
 * Returns Supabase Storage public URL for the flag file
 */
export function getFlagUrl(filename: string): string {
  if (!filename) {
    console.warn('getFlagUrl: No filename provided');
    return '';
  }
  
  // Check if Supabase is initialized
  if (!supabase) {
    console.error('getFlagUrl: Supabase client not initialized');
    return '';
  }
  
  // Remove leading slash if present
  const cleanFilename = filename.replace(/^\//, '').replace(/^flags\//, '');
  
  try {
    // Get public URL from Supabase Storage
    // Note: getPublicUrl doesn't make a network request, it just constructs the URL
    const { data } = supabase.storage
      .from(FLAGS_BUCKET)
      .getPublicUrl(cleanFilename);
    
    if (!data || !data.publicUrl) {
      console.error(`No public URL returned for ${cleanFilename}`);
      return '';
    }
    
    const url = data.publicUrl;
    console.log(`Flag URL for "${cleanFilename}":`, url);
    console.log(`Full path: ${FLAGS_BUCKET}/${cleanFilename}`);
    
    // Verify URL format
    if (!url || !url.includes('supabase.co/storage')) {
      console.error(`Invalid URL format: ${url}`);
    }
    
    return url;
  } catch (error) {
    console.error(`Exception getting flag URL for ${cleanFilename}:`, error);
    return '';
  }
}

/**
 * List all files in flags bucket (for debugging)
 */
export async function listFlagFiles(): Promise<void> {
  try {
    const { data, error } = await supabase.storage
      .from(FLAGS_BUCKET)
      .list('', {
        limit: 100,
        offset: 0,
      });

    if (error) {
      console.error('Error listing flag files:', error);
      return;
    }

    console.log('Files in flags bucket:');
    console.table(data?.map(f => ({ name: f.name, size: f.metadata?.size, updated: f.updated_at })));
  } catch (error) {
    console.error('Exception listing flag files:', error);
  }
}

/**
 * Get flag URL by country code (for InterestedCompanies component)
 */
export function getFlagUrlByCode(code: string): string {
  const flagMap: { [key: string]: string } = {
    'il': 'flag-of-israel.webp',
    'us': 'usa.webp',
    'be': 'belgium.webp',
    'se': 'sweden.webp',
    'ch': 'switzerland.webp',
    'de': 'germany-flag.webp',
    'gb': 'british-flag.svg',
    'au': 'Flag_of_Australia.png',
    'at': 'Austria.svg',
    'nl': 'Flag_of_the_Netherlands.svg',
    'pk': 'Flag_of_Pakistan.svg',
    'tr': 'Flag_of_Turkey.svg',
    'ke': 'Flag_of_Kenya.svg',
    'ne': 'Flag_of_Niger.svg',
    'ng': 'Flag_of_Nigeria.svg',
    'za': 'Flag_of_South_Africa.svg',
    'in': 'Flag_of_India.svg',
  };

  const filename = flagMap[code.toLowerCase()] || `${code.toLowerCase()}.svg`;
  return getFlagUrl(filename);
}

/**
 * Upload a flag file to Supabase Storage
 */
export async function uploadFlag(file: File, filename: string): Promise<string> {
  try {
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(FLAGS_BUCKET)
      .upload(filename, file, {
        cacheControl: '31536000', // 1 year cache
        upsert: true, // Overwrite if exists
      });

    if (uploadError) throw uploadError;

    // Get public URL
    const { data: urlData } = supabase.storage
      .from(FLAGS_BUCKET)
      .getPublicUrl(filename);

    return urlData.publicUrl;
  } catch (error) {
    console.error('Error uploading flag:', error);
    throw error;
  }
}

/**
 * Check if flag exists in storage
 */
export async function flagExists(filename: string): Promise<boolean> {
  try {
    const { data, error } = await supabase.storage
      .from(FLAGS_BUCKET)
      .list('', {
        search: filename,
      });

    if (error) return false;
    return (data || []).some(file => file.name === filename);
  } catch (error) {
    return false;
  }
}
