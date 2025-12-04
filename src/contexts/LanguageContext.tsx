import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { translateText } from '@/lib/translation';

export type Language = 'en' | 'es' | 'fr' | 'de' | 'it' | 'pt' | 'zh' | 'ja' | 'ko' | 'ar' | 'hi' | 'ru' | 'nl' | 'pl' | 'tr' | 'sv' | 'da' | 'no' | 'fi' | 'cs' | 'ro' | 'hu' | 'el' | 'th' | 'vi' | 'id' | 'he' | 'uk' | 'bg' | 'hr' | 'sk' | 'sl';

export interface LanguageInfo {
  code: Language;
  name: string;
  nativeName: string;
  flag: string;
}

export const SUPPORTED_LANGUAGES: LanguageInfo[] = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano', flag: '🇮🇹' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português', flag: '🇵🇹' },
  { code: 'zh', name: 'Chinese', nativeName: '中文', flag: '🇨🇳' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵' },
  { code: 'ko', name: 'Korean', nativeName: '한국어', flag: '🇰🇷' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский', flag: '🇷🇺' },
  { code: 'nl', name: 'Dutch', nativeName: 'Nederlands', flag: '🇳🇱' },
  { code: 'pl', name: 'Polish', nativeName: 'Polski', flag: '🇵🇱' },
  { code: 'tr', name: 'Turkish', nativeName: 'Türkçe', flag: '🇹🇷' },
  { code: 'sv', name: 'Swedish', nativeName: 'Svenska', flag: '🇸🇪' },
  { code: 'da', name: 'Danish', nativeName: 'Dansk', flag: '🇩🇰' },
  { code: 'no', name: 'Norwegian', nativeName: 'Norsk', flag: '🇳🇴' },
  { code: 'fi', name: 'Finnish', nativeName: 'Suomi', flag: '🇫🇮' },
  { code: 'cs', name: 'Czech', nativeName: 'Čeština', flag: '🇨🇿' },
  { code: 'ro', name: 'Romanian', nativeName: 'Română', flag: '🇷🇴' },
  { code: 'hu', name: 'Hungarian', nativeName: 'Magyar', flag: '🇭🇺' },
  { code: 'el', name: 'Greek', nativeName: 'Ελληνικά', flag: '🇬🇷' },
  { code: 'th', name: 'Thai', nativeName: 'ไทย', flag: '🇹🇭' },
  { code: 'vi', name: 'Vietnamese', nativeName: 'Tiếng Việt', flag: '🇻🇳' },
  { code: 'id', name: 'Indonesian', nativeName: 'Bahasa Indonesia', flag: '🇮🇩' },
  { code: 'he', name: 'Hebrew', nativeName: 'עברית', flag: '🇮🇱' },
  { code: 'uk', name: 'Ukrainian', nativeName: 'Українська', flag: '🇺🇦' },
  { code: 'bg', name: 'Bulgarian', nativeName: 'Български', flag: '🇧🇬' },
  { code: 'hr', name: 'Croatian', nativeName: 'Hrvatski', flag: '🇭🇷' },
  { code: 'sk', name: 'Slovak', nativeName: 'Slovenčina', flag: '🇸🇰' },
  { code: 'sl', name: 'Slovenian', nativeName: 'Slovenščina', flag: '🇸🇮' },
];

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  translate: (text: string, sourceLanguage?: Language) => Promise<string>;
  isTranslating: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Translation storage - will be populated from translation files
let translations: Record<Language, Record<string, string>> = {} as Record<Language, Record<string, string>>;

// Load translations dynamically
async function loadTranslations(lang: Language): Promise<Record<string, string>> {
  try {
    const module = await import(`../locales/${lang}.json`);
    return module.default || {};
  } catch (error) {
    // Fallback to English if translation file doesn't exist
    if (lang !== 'en') {
      try {
        const module = await import(`../locales/en.json`);
        return module.default || {};
      } catch {
        return {};
      }
    }
    return {};
  }
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    // Check localStorage first
    const savedLanguage = localStorage.getItem('language') as Language;
    if (savedLanguage && SUPPORTED_LANGUAGES.find(l => l.code === savedLanguage)) {
      return savedLanguage;
    }
    // Check browser language
    const browserLang = navigator.language.split('-')[0] as Language;
    if (SUPPORTED_LANGUAGES.find(l => l.code === browserLang)) {
      return browserLang;
    }
    return 'en';
  });

  const [currentTranslations, setCurrentTranslations] = useState<Record<string, string>>({});
  const [isTranslating, setIsTranslating] = useState(false);

  useEffect(() => {
    loadTranslations(language).then(trans => {
      translations[language] = trans;
      setCurrentTranslations(trans);
    });
  }, [language]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('language', lang);
    loadTranslations(lang).then(trans => {
      translations[lang] = trans;
      setCurrentTranslations(trans);
    });
  };

  const t = (key: string): string => {
    // Handle nested keys like "common.globalFeed"
    const keys = key.split('.');
    let value: any = currentTranslations || translations[language] || {};
    
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        return key; // Return key if translation not found
      }
    }
    
    return typeof value === 'string' ? value : key;
  };

  // Auto-translate function for dynamic content (posts, comments, etc.)
  const translate = useCallback(async (text: string, sourceLanguage: Language = 'en'): Promise<string> => {
    if (!text || language === sourceLanguage || language === 'en') {
      return text;
    }

    setIsTranslating(true);
    try {
      const translated = await translateText(text, language, sourceLanguage);
      return translated;
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.warn('Translation error:', error);
      }
      return text;
    } finally {
      setIsTranslating(false);
    }
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, translate, isTranslating }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

