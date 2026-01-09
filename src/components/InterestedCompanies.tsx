import React, { useEffect, useState } from "react";
import { Card } from "./ui/card";
import { useLanguage } from "@/contexts/LanguageContext";

// Get flag image URL from flagcdn.com (small size)
const getFlagImageUrl = (code: string): string => {
  const codeLower = code.toLowerCase();
  return `https://flagcdn.com/w20/${codeLower}.png`;
};

const companies = [
  { name: "360 Direct Access", country: "USA", code: "us" },
  { name: "Action & Brain Lab, Gallaudet University", country: "USA", code: "us" },
  { name: "American Corner of Zinder/Maradi", country: "Niger", code: "ne" },
  { name: "ASL Nexus Company", country: "United States", code: "us" },
  { name: "AvocadoWeb Services", country: "USA", code: "us" },
  { name: "Cisco Systems", country: "USA", code: "us" },
  { name: "Clear View Innovations", country: "USA", code: "us" },
  { name: "CoSET", country: "USA", code: "us" },
  { name: "Congress Rental New Zealans", country: "New Zealand", code: "nz" },
  { name: "Convo", country: "Australia", code: "au" },
  { name: "Deaf eLima Plus", country: "Kenya", code: "ke" },
  { name: "Deaf Inclusion and Development Initiative", country: "Nigeria", code: "ng" },
  { name: "Deaf Studies at Boston University", country: "USA", code: "us" },
  { name: "DeepSignAI", country: "USA", code: "us" },
  { name: "DeepVisionTech.AI", country: "India", code: "in" },
  { name: "DeafCloud Communications", country: "Canada", code: "ca" },
  { name: "DeafSkills International Association", country: "Canada", code: "ca" },
  { name: "Dillo.ai", country: "Argentina", code: "ar" },
  { name: "DOOR International", country: "United States of America", code: "us" },
  { name: "Dozanü Innovations", country: "USA", code: "us" },
  { name: "EQ4ALL", country: "Korea", code: "kr" },
  { name: "Framingham State University", country: "USA", code: "us" },
  { name: "German Deaf Association", country: "Germany", code: "de" },
  { name: "GLWMax", country: "Belgium", code: "be" },
  { name: "GoSign.AI", country: "USA", code: "us" },
  { name: "GoVoBo.ai", country: "USA", code: "us" },
  { name: "Hand Talk", country: "Brazil", code: "br" },
  { name: "Hands United", country: "USA", code: "us" },
  { name: "Handy Signs", country: "Italy", code: "it" },
  { name: "Hillcrest hospital south", country: "USA", code: "us" },
  { name: "Holtzi", country: "Turkey", code: "tr" },
  { name: "HU University of Applied Sciences Utrecht", country: "Netherlands", code: "nl" },
  { name: "Hugrun", country: "Australia", code: "au" },
  { name: "Inclusic.co", country: "Pakistan", code: "pk" },
  { name: "Influential Prose", country: "USA", code: "us" },
  { name: "Kara Technologies", country: "New Zealand", code: "nz" },
  { name: "Leeper Digital", country: "United States", code: "us" },
  { name: "Lingvano", country: "Austria", code: "at" },
  { name: "Middle East Technical University", country: "Türkey", code: "tr" },
  { name: "Migam.ai", country: "Poland", code: "pl" },
  { name: "MocapLab", country: "France", code: "fr" },
  { name: "Motionsign", country: "USA", code: "us" },
  { name: "Nagish", country: "USA", code: "us" },
  { name: "NHK Enterprises", country: "Japan", code: "jp" },
  { name: "NVIDIA", country: "USA", code: "us" },
  { name: "Omnibridge", country: "USA", code: "us" },
  { name: "Open Mind Software", country: "Germany", code: "de" },
  { name: "Pi Network and Pi Ventures", country: "United States", code: "us" },
  { name: "Sign AI", country: "USA", code: "us" },
  { name: "Sign-Speak", country: "USA", code: "us" },
  { name: "SignAvatar", country: "Serbia", code: "rs" },
  { name: "SignForDeaf", country: "Turkey", code: "tr" },
  { name: "SignLab", country: "Norway", code: "no" },
  { name: "SignLang Consultancy", country: "South Africa", code: "za" },
  { name: "SignaVision Solutions", country: "Canada", code: "ca" },
  { name: "Sign.mt", country: "Israel", code: "il" },
  { name: "Signapse", country: "UK", code: "gb" },
  { name: "Signly", country: "England", code: "gb" },
  { name: "SignUp Media", country: "USA", code: "us" },
  { name: "SignWave AI", country: "UK", code: "gb" },
  { name: "SignWow", country: "USA", code: "us" },
  { name: "Silence Speaks", country: "UK", code: "gb" },
  { name: "Sorenson", country: "USA", code: "us" },
  { name: "Spokhand", country: "USA", code: "us" },
  { name: "TDIforAccess", country: "USA", code: "us" },
  { name: "Teckenbro", country: "Sweden", code: "se" },
  { name: "The ASL Shop", country: "USA", code: "us" },
  { name: "Ugunja Deaf Self Help Group", country: "Kenya", code: "ke" },
  { name: "University College London", country: "UK", code: "gb" },
  { name: "University of Surrey", country: "UK", code: "gb" },
  { name: "VSL Labs", country: "Israel", code: "il" },
  { name: "With Direction", country: "USA", code: "us" },
].sort((a, b) => a.name.localeCompare(b.name));

export default function InterestedCompanies() {
  const { language, translate } = useLanguage();
  const [translatedContent, setTranslatedContent] = useState<Record<string, string>>({});
  
  // Set member and country counts
  const companyCount = 90;
  const countryCount = 41;

  // Translate content
  useEffect(() => {
    const translateSections = async () => {
      if (language === 'en') {
        setTranslatedContent({});
        return;
      }

      const sections = {
        title: 'Organization Members Already Interested',
        membersLabel: 'Members',
        countriesLabel: 'Countries',
        description: 'Leading industry leaders in the sign language x AI space have already expressed interest in becoming founding members.',
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
      <h2 className="text-2xl font-bold mb-4 text-center text-gray-900">{getText('title', 'Organization Members Already Interested')}</h2>
      
      {/* Infographics */}
      <div className="flex justify-center gap-6 mb-6">
        <Card 
          className="text-center p-4 border-2 border-blue-500 shadow-none w-28"
          style={{
            filter: 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3))',
            transform: 'translateY(-2px)'
          }}
        >
          <div className="text-3xl font-bold text-blue-600">{companyCount}</div>
          <div className="text-xs text-muted-foreground">{getText('membersLabel', 'Members')}</div>
        </Card>
        <Card 
          className="text-center p-4 border-2 border-blue-500 shadow-none w-28"
          style={{
            filter: 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3))',
            transform: 'translateY(-2px)'
          }}
        >
          <div className="text-3xl font-bold text-blue-600">{countryCount}</div>
          <div className="text-xs text-muted-foreground">{getText('countriesLabel', 'Countries')}</div>
        </Card>
      </div>

      <p className="text-center mb-6 text-muted-foreground max-w-2xl mx-auto text-sm">
        {getText('description', 'Leading industry leaders in the sign language x AI space have already expressed interest in becoming founding members.')}
      </p>
      
      {/* List in 3 columns */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-2 max-w-5xl mx-auto">
        {companies.map((company) => (
          <div 
            key={company.name} 
            className="flex items-center gap-2 py-1 text-sm"
          >
            <img
              src={getFlagImageUrl(company.code)}
              alt={`${company.country} flag`}
              className="h-4 w-auto flex-shrink-0"
              loading="lazy"
              onError={(e) => {
                // Fallback to country code if image fails to load
                const target = e.target as HTMLImageElement;
                if (target) {
                  target.style.display = 'none';
                  const fallback = document.createElement('span');
                  fallback.className = 'text-xs font-semibold text-electric-blue';
                  fallback.textContent = `[${company.code.toUpperCase()}]`;
                  target.parentNode?.insertBefore(fallback, target);
                }
              }}
            />
            <span className="text-gray-900">{company.name}</span>
          </div>
        ))}
      </div>
    </section>
  );
} 