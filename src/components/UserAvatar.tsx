import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useState, useEffect } from 'react';
import { getUserProfilePictureByEmail } from '@/lib/userProfile';
import { getCurrentUser } from '@/lib/auth';

interface UserAvatarProps {
  email?: string;
  name?: string;
  profilePicture?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  className?: string;
}

const sizeClasses = {
  sm: 'h-6 w-6 text-xs',
  md: 'h-8 w-8 text-xs',
  lg: 'h-10 w-10 text-sm',
  xl: 'h-12 w-12 text-base',
  '2xl': 'h-[60px] w-[60px] text-base', // 75% of h-20 (60px instead of 80px)
};

export function UserAvatar({ email, name, profilePicture, size = 'md', className = '' }: UserAvatarProps) {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(profilePicture || null);
  const [isLoading, setIsLoading] = useState(!profilePicture && !!email);

  // Fetch profile picture from user metadata if not provided
  useEffect(() => {
    // If profilePicture is provided, use it
    if (profilePicture) {
      setAvatarUrl(profilePicture);
      setIsLoading(false);
      return;
    }

    // If current user matches, get from current user state
    const currentUser = getCurrentUser();
    if (currentUser && email && email.toLowerCase() === currentUser.email.toLowerCase()) {
      if (currentUser.profilePicture) {
        setAvatarUrl(currentUser.profilePicture);
        setIsLoading(false);
        return;
      }
    }

    // Try to fetch from cache or database
    if (email) {
      const fetchUserAvatar = async () => {
        try {
          const url = await getUserProfilePictureByEmail(email);
          if (url) {
            setAvatarUrl(url);
          }
        } catch (error) {
          console.error('Error fetching user avatar:', error);
        } finally {
          setIsLoading(false);
        }
      };
      fetchUserAvatar();
    } else {
      setIsLoading(false);
    }
  }, [email, profilePicture]);

  // Get initials from name
  const getInitials = (nameStr?: string) => {
    if (!nameStr) return '?';
    const parts = nameStr.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return nameStr.substring(0, 2).toUpperCase();
  };

  const initials = getInitials(name);

  // If className contains height/width overrides, don't apply size height/width classes but keep text size
  const hasSizeOverride = className && (className.includes('h-[') || className.includes('!h-') || className.includes('w-[') || className.includes('!w-'));
  const sizeClassParts = sizeClasses[size].split(' ');
  const textSizeClass = sizeClassParts.find(part => part.startsWith('text-')) || '';
  const avatarClassName = hasSizeOverride 
    ? `${textSizeClass} ${className}`.trim()
    : `${sizeClasses[size]} ${className}`.trim();

  return (
    <Avatar className={avatarClassName}>
      {avatarUrl && !isLoading ? (
        <AvatarImage src={avatarUrl} alt={name || email || 'User'} />
      ) : null}
      <AvatarFallback className="bg-electric-blue/20 text-electric-blue font-semibold">
        {initials}
      </AvatarFallback>
    </Avatar>
  );
}

// Helper function to get profile picture URL from user email
// This can be used to fetch profile pictures from Supabase
export async function getUserProfilePicture(email: string): Promise<string | null> {
  try {
    // In production, you might want to:
    // 1. Create an RPC function that returns user metadata including profile_picture
    // 2. Or store profile pictures in a public table with email as key
    // For now, we'll return null and rely on the profilePicture prop
    return null;
  } catch (error) {
    console.error('Error fetching profile picture:', error);
    return null;
  }
}

