// Component for displaying country flags with actual flag images
import { useState } from 'react';
import { MapPin } from 'lucide-react';
import { getCountryFlag } from '@/lib/countryFlags';

interface CountryFlagProps {
  country: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showFallback?: boolean;
}

export function CountryFlag({ 
  country, 
  className = '', 
  size = 'md',
  showFallback = true 
}: CountryFlagProps) {
  const [imageError, setImageError] = useState(false);
  const flagUrl = getCountryFlag(country);

  // Size mapping for flagcdn.com
  // w20 = 20px, w40 = 40px, w80 = 80px, w160 = 160px
  const sizeMap = {
    sm: 'w20', // 20px width
    md: 'w40', // 40px width  
    lg: 'w80', // 80px width
  };

  // Replace size in URL if needed
  const getFlagUrlWithSize = (url: string | null, size: 'sm' | 'md' | 'lg'): string | null => {
    if (!url) return null;
    return url.replace(/w\d+/, sizeMap[size]);
  };

  const finalFlagUrl = getFlagUrlWithSize(flagUrl, size);

  const sizeClasses = {
    sm: 'h-3 w-5', // Small flag
    md: 'h-4 w-6', // Medium flag
    lg: 'h-5 w-8'  // Large flag
  };

  if (!finalFlagUrl || imageError) {
    if (showFallback) {
      const iconSizes = {
        sm: 'h-3 w-3',
        md: 'h-4 w-4',
        lg: 'h-5 w-5'
      };
      return <MapPin className={`${iconSizes[size]} text-gray-500 ${className}`} />;
    }
    return null;
  }

  return (
    <img 
      src={finalFlagUrl} 
      alt={`${country} flag`}
      className={`${sizeClasses[size]} object-cover rounded ${className}`}
      onError={() => {
        console.error(`Failed to load flag for ${country} from URL: ${finalFlagUrl}`);
        setImageError(true);
      }}
      loading="lazy"
    />
  );
}
