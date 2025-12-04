import { supabase } from './supabase';

// Cache for user profile pictures
const profilePictureCache = new Map<string, string | null>();

/**
 * Get user profile picture URL by email
 * Uses RPC function to fetch profile pictures from auth.users metadata
 */
export async function getUserProfilePictureByEmail(email: string): Promise<string | null> {
  if (!email) return null;

  // Check cache first
  const cached = profilePictureCache.get(email.toLowerCase());
  if (cached !== undefined) {
    return cached;
  }

  try {
    // Use RPC function to get profile picture
    const { data, error } = await supabase.rpc('get_user_profile_pictures', {
      user_emails: [email.toLowerCase()]
    });

    if (error) {
      console.error('Error fetching profile picture:', error);
      profilePictureCache.set(email.toLowerCase(), null);
      return null;
    }

    if (data && data.length > 0 && data[0].profile_picture) {
      const url = data[0].profile_picture;
      profilePictureCache.set(email.toLowerCase(), url);
      return url;
    }

    // No profile picture found
    profilePictureCache.set(email.toLowerCase(), null);
    return null;
  } catch (error) {
    console.error('Error in getUserProfilePictureByEmail:', error);
    profilePictureCache.set(email.toLowerCase(), null);
    return null;
  }
}

/**
 * Clear the profile picture cache
 */
export function clearProfilePictureCache(): void {
  profilePictureCache.clear();
}

/**
 * Set a profile picture in cache (useful when user updates their picture)
 */
export function setProfilePictureInCache(email: string, url: string | null): void {
  profilePictureCache.set(email.toLowerCase(), url);
}

