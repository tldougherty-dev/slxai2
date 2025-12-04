// Map country names to flag image URLs
// Using flagcdn.com CDN for reliable flag images

export const getCountryFlag = (country: string): string | null => {
  if (!country) return null;
  
  const countryLower = country.toLowerCase().trim();
  
  // Normalize common variations
  const normalized = countryLower
    .replace(/^the\s+/, '') // Remove "the" prefix
    .replace(/\s+&/g, '') // Remove "&" 
    .replace(/\s+/g, ' '); // Normalize spaces
  
  // Map country names to ISO country codes (for flagcdn.com)
  const countryCodeMap: { [key: string]: string } = {
    // Exact matches
    'argentina': 'ar',
    'australia': 'au',
    'austria': 'at',
    'belgium': 'be',
    'beligum': 'be', // typo in data
    'brazil': 'br',
    'canada': 'ca',
    'france': 'fr',
    'germany': 'de',
    'global': null, // No flag for global
    'india': 'in',
    'israel': 'il',
    'italy': 'it',
    'japan': 'jp',
    'kenya': 'ke',
    'niger': 'ne',
    'nigeria': 'ng',
    'norway': 'no',
    'pakistan': 'pk',
    'poland': 'pl',
    'serbia': 'rs',
    'south africa': 'za',
    'sweden': 'se',
    'türkiye': 'tr',
    'turkey': 'tr',
    'netherlands': 'nl',
    'new zealand': 'nz',
    'united kingdom': 'gb',
    'uk': 'gb',
    'united states': 'us',
    'united states of america': 'us',
    'usa': 'us',
    'united states of america canada': 'us', // Use US flag for dual country
  };

  // Try exact match first
  let countryCode = countryCodeMap[normalized] || countryCodeMap[countryLower];
  
  // Try partial matches
  if (!countryCode) {
    for (const [key, value] of Object.entries(countryCodeMap)) {
      if (key && value && (normalized.includes(key) || key.includes(normalized))) {
        countryCode = value;
        break;
      }
    }
  }

  // Special handling for common variations
  if (!countryCode) {
    if (normalized.includes('united kingdom') || normalized === 'uk') {
      countryCode = 'gb';
    } else if (normalized.includes('united states') || normalized.includes('usa')) {
      countryCode = 'us';
    } else if (normalized.includes('netherlands') || normalized.includes('holland')) {
      countryCode = 'nl';
    } else if (normalized.includes('south africa')) {
      countryCode = 'za';
    } else if (normalized.includes('new zealand')) {
      countryCode = 'nz';
    }
  }

  if (!countryCode || countryCode === null) {
    return null;
  }

  // Return flag image URL from flagcdn.com
  // Using w20 for small flags (20px width), can be changed to w40, w80, w160, w320
  return `https://flagcdn.com/w20/${countryCode.toLowerCase()}.png`;
};
