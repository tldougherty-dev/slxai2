import React, { useEffect, useState } from 'react';
import { Card } from './ui/card';
import { useLanguage } from '@/contexts/LanguageContext';

export default function InterestedCompanies() {
  const { language, translate } = useLanguage();
  const [translatedContent, setTranslatedContent] = useState<Record<string, string>>({});

  const companyCount = '250+';
  const countryCount = '50+';

  useEffect(() => {
    const translateSections = async () => {
      if (language === 'en') {
        setTranslatedContent({});
        return;
      }

      const sections = {
        title: 'Organization Members Interested',
        membersLabel: 'Members',
        countriesLabel: 'Countries',
        description:
          'Leading industry leaders in the sign language x AI space have already expressed interest in becoming founding members.',
      };

      const translated: Record<string, string> = {};
      for (const [key, value] of Object.entries(sections)) {
        translated[key] = await translate(value);
      }
      setTranslatedContent(translated);
    };

    translateSections();
  }, [language, translate]);

  const getText = (key: string, fallback: string) => {
    return translatedContent[key] || fallback;
  };

  return (
    <section className="py-4">
      <div className="flex flex-row justify-center gap-4 sm:gap-6 mb-6">
        <Card
          className="text-center p-4 sm:p-8 border-2 border-blue-500 shadow-none flex-1 sm:w-56 rounded-lg"
          style={{
            filter: 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3))',
            transform: 'translateY(-2px)',
          }}
        >
          <div className="text-4xl sm:text-6xl font-bold text-blue-600">{companyCount}</div>
          <div className="text-xs sm:text-sm text-muted-foreground">{getText('membersLabel', 'Members')}</div>
        </Card>
        <Card
          className="text-center p-4 sm:p-8 border-2 border-blue-500 shadow-none flex-1 sm:w-56 rounded-lg"
          style={{
            filter: 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3))',
            transform: 'translateY(-2px)',
          }}
        >
          <div className="text-4xl sm:text-6xl font-bold text-blue-600">{countryCount}</div>
          <div className="text-xs sm:text-sm text-muted-foreground">{getText('countriesLabel', 'Countries')}</div>
        </Card>
      </div>

      <p className="text-center text-muted-foreground max-w-2xl mx-auto text-sm">
        {getText(
          'description',
          'Leading industry leaders in the sign language x AI space have already expressed interest in becoming founding members.'
        )}
      </p>
    </section>
  );
}
