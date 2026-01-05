import { Language } from '@/contexts/LanguageContext';

// Translation API configuration
// Google Translate API v2
const TRANSLATION_API_ENABLED = true; // Enabled with Google Translate API
const TRANSLATION_API_URL = import.meta.env.VITE_TRANSLATION_API_URL || 'https://translation.googleapis.com/language/translate/v2';
// Get API key from environment variable only (no fallback for production security)
const TRANSLATION_API_KEY = import.meta.env.VITE_TRANSLATION_API_KEY;

// Debug: Log environment variables on module load (dev only)
if (import.meta.env.DEV) {
  const config = {
    enabled: TRANSLATION_API_ENABLED,
    url: TRANSLATION_API_URL,
    hasKey: !!TRANSLATION_API_KEY,
    keyLength: TRANSLATION_API_KEY?.length || 0,
    keyPreview: TRANSLATION_API_KEY ? TRANSLATION_API_KEY.substring(0, 15) + '...' : 'NOT SET',
    envKeyExists: !!import.meta.env.VITE_TRANSLATION_API_KEY,
    envKeyLength: import.meta.env.VITE_TRANSLATION_API_KEY?.length || 0,
    allEnvKeys: Object.keys(import.meta.env).filter(k => k.includes('TRANSLATION')),
  };
  console.log('Translation API Config Check:', config);
}

// Cache for translations to avoid repeated API calls
// Uses localStorage for persistence across page refreshes
const CACHE_KEY_PREFIX = 'translation_cache_';
const MAX_CACHE_SIZE = 10000; // Maximum number of cached translations

// Load cache from localStorage on initialization
function loadCacheFromStorage(): Map<string, string> {
  const cache = new Map<string, string>();
  try {
    const stored = localStorage.getItem(CACHE_KEY_PREFIX + 'data');
    if (stored) {
      const data = JSON.parse(stored);
      Object.entries(data).forEach(([key, value]) => {
        cache.set(key, value as string);
      });
    }
  } catch (error) {
    if (import.meta.env.DEV) {
      console.warn('Failed to load translation cache from storage:', error);
    }
  }
  return cache;
}

// Save cache to localStorage
function saveCacheToStorage(cache: Map<string, string>) {
  try {
    const data: Record<string, string> = {};
    cache.forEach((value, key) => {
      data[key] = value;
    });
    localStorage.setItem(CACHE_KEY_PREFIX + 'data', JSON.stringify(data));
    localStorage.setItem(CACHE_KEY_PREFIX + 'timestamp', Date.now().toString());
  } catch (error) {
    if (import.meta.env.DEV) {
      console.warn('Failed to save translation cache to storage:', error);
    }
  }
}

const translationCache = loadCacheFromStorage();

// Language code mapping for translation APIs
const LANGUAGE_CODE_MAP: Record<Language, string> = {
  en: 'en',
  es: 'es',
  fr: 'fr',
  de: 'de',
  it: 'it',
  pt: 'pt',
  zh: 'zh',
  ja: 'ja',
  ko: 'ko',
  ar: 'ar',
  hi: 'hi',
  ru: 'ru',
  nl: 'nl',
  pl: 'pl',
  tr: 'tr',
  sv: 'sv',
  da: 'da',
  no: 'no',
  fi: 'fi',
  cs: 'cs',
  ro: 'ro',
  hu: 'hu',
  el: 'el',
  th: 'th',
  vi: 'vi',
  id: 'id',
  he: 'he',
  uk: 'uk',
  bg: 'bg',
  hr: 'hr',
  sk: 'sk',
  sl: 'sl',
};

/**
 * Translate text using translation API
 * Falls back to original text if translation fails or API is disabled
 */
export async function translateText(
  text: string,
  targetLanguage: Language,
  sourceLanguage: Language = 'en'
): Promise<string> {
  // Don't translate if target is English or same as source
  if (targetLanguage === 'en' || targetLanguage === sourceLanguage) {
    return text;
  }

  // Check cache first
  const cacheKey = `${sourceLanguage}-${targetLanguage}-${text}`;
  if (translationCache.has(cacheKey)) {
    return translationCache.get(cacheKey)!;
  }

  // If API is not enabled, return original text
  if (!TRANSLATION_API_ENABLED) {
    if (import.meta.env.DEV) {
      console.warn('Translation API is disabled');
    }
    return text;
  }
  
  if (!TRANSLATION_API_URL || !TRANSLATION_API_KEY) {
    if (import.meta.env.DEV) {
      console.warn('Translation API key or URL missing:', { 
        hasUrl: !!TRANSLATION_API_URL, 
        hasKey: !!TRANSLATION_API_KEY,
        url: TRANSLATION_API_URL,
        keyLength: TRANSLATION_API_KEY?.length || 0,
        envKey: import.meta.env.VITE_TRANSLATION_API_KEY ? 'SET' : 'NOT FOUND'
      });
    }
    return text;
  }

  try {
    // Google Translate API v2 implementation
    // API key is passed as query parameter, not in Authorization header
    const url = `${TRANSLATION_API_URL}?key=${TRANSLATION_API_KEY}`;
    if (import.meta.env.DEV) {
      console.log('Calling translation API:', { url: url.replace(TRANSLATION_API_KEY || '', '***'), text: text.substring(0, 50) });
    }
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        q: text,
        source: LANGUAGE_CODE_MAP[sourceLanguage],
        target: LANGUAGE_CODE_MAP[targetLanguage],
        format: 'text',
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      if (import.meta.env.DEV) {
        console.error('Translation API error:', response.status, errorData);
      }
      throw new Error(`Translation API error: ${response.status} - ${JSON.stringify(errorData)}`);
    }

    const data = await response.json();
    const translatedText = data.data?.translations?.[0]?.translatedText || text;
    if (import.meta.env.DEV) {
      console.log('Translation successful:', { original: text.substring(0, 50), translated: translatedText.substring(0, 50) });
    }

    // Cache the translation
    translationCache.set(cacheKey, translatedText);
    
    // Limit cache size to prevent localStorage overflow
    if (translationCache.size > MAX_CACHE_SIZE) {
      const firstKey = translationCache.keys().next().value;
      translationCache.delete(firstKey);
    }
    
    // Save to localStorage immediately for persistence
    saveCacheToStorage(translationCache);
    
    return translatedText;
  } catch (error) {
    // Always log errors, but don't expose details in production
    if (import.meta.env.DEV) {
      console.error('Translation failed, returning original text:', error);
    }
    return text;
  }
}

/**
 * Translate multiple texts in batch (more efficient)
 */
export async function translateBatch(
  texts: string[],
  targetLanguage: Language,
  sourceLanguage: Language = 'en'
): Promise<string[]> {
  if (targetLanguage === 'en' || targetLanguage === sourceLanguage) {
    return texts;
  }

  if (!TRANSLATION_API_ENABLED || !TRANSLATION_API_URL || !TRANSLATION_API_KEY) {
    return texts;
  }

  try {
    // Google Translate API v2 batch translation
    // API key is passed as query parameter
    const response = await fetch(`${TRANSLATION_API_URL}?key=${TRANSLATION_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        q: texts,
        source: LANGUAGE_CODE_MAP[sourceLanguage],
        target: LANGUAGE_CODE_MAP[targetLanguage],
        format: 'text',
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Translation API error: ${response.status} - ${JSON.stringify(errorData)}`);
    }

    const data = await response.json();
    const translations = data.data?.translations?.map((t: any) => t.translatedText) || texts;

    // Cache translations
    texts.forEach((text, index) => {
      const cacheKey = `${sourceLanguage}-${targetLanguage}-${text}`;
      translationCache.set(cacheKey, translations[index]);
      
      // Limit cache size
      if (translationCache.size > MAX_CACHE_SIZE) {
        const firstKey = translationCache.keys().next().value;
        translationCache.delete(firstKey);
      }
    });
    
    // Save to localStorage
    saveCacheToStorage(translationCache);

    return translations;
  } catch (error) {
    if (import.meta.env.DEV) {
      console.warn('Batch translation failed, returning original texts:', error);
    }
    return texts;
  }
}

/**
 * Clear translation cache (both memory and localStorage)
 */
export function clearTranslationCache() {
  translationCache.clear();
  try {
    localStorage.removeItem(CACHE_KEY_PREFIX + 'data');
    localStorage.removeItem(CACHE_KEY_PREFIX + 'timestamp');
  } catch (error) {
    if (import.meta.env.DEV) {
      console.warn('Failed to clear translation cache from storage:', error);
    }
  }
}

/**
 * Get cache statistics
 */
export function getCacheStats() {
  return {
    size: translationCache.size,
    maxSize: MAX_CACHE_SIZE,
  };
}

/**
 * Simple client-side translation using browser's built-in API (experimental)
 * Note: This is less accurate but doesn't require API keys
 */
export async function translateTextClientSide(
  text: string,
  targetLanguage: Language,
  sourceLanguage: Language = 'en'
): Promise<string> {
  if (targetLanguage === 'en' || targetLanguage === sourceLanguage) {
    return text;
  }

  // Check if browser supports translation API
  if (!('translate' in document.documentElement)) {
    return text;
  }

  try {
    // This is experimental and may not work in all browsers
    const element = document.createElement('div');
    element.textContent = text;
    element.setAttribute('translate', 'yes');
    document.body.appendChild(element);

    // Trigger browser translation
    await new Promise(resolve => setTimeout(resolve, 100));

    const translated = element.textContent || text;
    document.body.removeChild(element);

    return translated;
  } catch (error) {
    if (import.meta.env.DEV) {
      console.warn('Client-side translation failed:', error);
    }
    return text;
  }
}

