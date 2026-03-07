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
  { name: "Gallaudet University", country: "USA", code: "us" },
  { name: "American Corner of Zinder/Maradi", country: "Niger", code: "ne" },
  { name: "ASL Nexus Company", country: "United States", code: "us" },
  { name: "AvocadoWeb Services", country: "USA", code: "us" },
  { name: "Birnbaum Interpreting Services", country: "USA", code: "us" },
  { name: "Cisco Systems", country: "USA", code: "us" },
  { name: "Clear View Innovations", country: "USA", code: "us" },
  { name: "Coalition for Sign Language Equity in Technology (CoSET)", country: "USA", code: "us" },
  { name: "Congress Rental New Zealans", country: "New Zealand", code: "nz" },
  { name: "Convo Relay", country: "USA", code: "us" },
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
  { name: "Microsoft", country: "USA", code: "us" },
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
  { name: "DCAL, University College London", country: "UK", code: "gb" },
  { name: "University of Surrey", country: "UK", code: "gb" },
  { name: "VSL Labs", country: "Israel", code: "il" },
  { name: "With Direction", country: "USA", code: "us" },
  { name: "American School for the Deaf", country: "USA", code: "us" },
  { name: "Apple", country: "USA", code: "us" },
  { name: "Applied Development", country: "USA", code: "us" },
  { name: "ASL Education Center", country: "USA", code: "us" },
  { name: "ASL Flurry", country: "USA", code: "us" },
  { name: "Austin Community College", country: "USA", code: "us" },
  { name: "BePivot", country: "USA", code: "us" },
  { name: "Boston University", country: "USA", code: "us" },
  { name: "Canadian Administrator of VRS", country: "Canada", code: "ca" },
  { name: "CSD", country: "USA", code: "us" },
  { name: "Deaf Aotearoa", country: "New Zealand", code: "nz" },
  { name: "Deaf and Hard of Hearing Interpreting Services / Sign Language Center", country: "USA", code: "us" },
  { name: "Deaf Connect", country: "Australia", code: "au" },
  { name: "Deaf Missions", country: "Canada", code: "ca" },
  { name: "Deaf Unity Association", country: "USA", code: "us" },
  { name: "Deaf Wireless Canada Committee", country: "Canada", code: "ca" },
  { name: "Echo360", country: "USA", code: "us" },
  { name: "Entertainment Interpreting", country: "USA", code: "us" },
  { name: "Eversa", country: "Canada", code: "ca" },
  { name: "Federal Communications Commission", country: "USA", code: "us" },
  { name: "GoMav", country: "USA", code: "us" },
  { name: "Google DeepMind", country: "USA", code: "us" },
  { name: "Handsin", country: "USA", code: "us" },
  { name: "Hands in Hand Education of Canada", country: "Canada", code: "ca" },
  { name: "Inclusify Studio", country: "USA", code: "us" },
  { name: "Innivee Strategies", country: "USA", code: "us" },
  { name: "Interpreter-Now", country: "USA", code: "us" },
  { name: "Linguabee", country: "USA", code: "us" },
  { name: "MAIG Solutions Inc", country: "USA", code: "us" },
  { name: "Matanah", country: "USA", code: "us" },
  { name: "Mind Your Language", country: "USA", code: "us" },
  { name: "Northeastern University", country: "USA", code: "us" },
  { name: "Partners Interpreting", country: "USA", code: "us" },
  { name: "Rochester Institute of Technology", country: "USA", code: "us" },
  { name: "T-Mobile", country: "USA", code: "us" },
  { name: "The Learning Center for the Deaf", country: "USA", code: "us" },
  { name: "Tulane University", country: "USA", code: "us" },
  { name: "TWA Innovations LLC", country: "USA", code: "us" },
  { name: "Unlearning Words", country: "USA", code: "us" },
  { name: "University of Chicago", country: "USA", code: "us" },
  { name: "University of Colorado Boulder", country: "USA", code: "us" },
  { name: "University of New Hampshire", country: "USA", code: "us" },
  { name: "University of Rochester", country: "USA", code: "us" },
  { name: "World Federation for the Deaf", country: "USA", code: "us" },
  { name: "Yale University", country: "USA", code: "us" },
  { name: "ZP Better Together", country: "USA", code: "us" },
].sort((a, b) => a.name.localeCompare(b.name));

export default function InterestedCompanies() {
  const { language, translate } = useLanguage();
  const [translatedContent, setTranslatedContent] = useState<Record<string, string>>({});
  
  // Set member and country counts
  const companyCount = "250+";
  const countryCount = "50+";

  // Translate content
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
      {/* Infographics */}
      <div className="flex flex-row justify-center gap-4 sm:gap-6 mb-6">
        <Card 
          className="text-center p-4 sm:p-8 border-2 border-blue-500 shadow-none flex-1 sm:w-56 rounded-lg"
          style={{
            filter: 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3))',
            transform: 'translateY(-2px)'
          }}
        >
          <div className="text-4xl sm:text-6xl font-bold text-blue-600">{companyCount}</div>
          <div className="text-xs sm:text-sm text-muted-foreground">{getText('membersLabel', 'Members')}</div>
        </Card>
        <Card 
          className="text-center p-4 sm:p-8 border-2 border-blue-500 shadow-none flex-1 sm:w-56 rounded-lg"
          style={{
            filter: 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3))',
            transform: 'translateY(-2px)'
          }}
        >
          <div className="text-4xl sm:text-6xl font-bold text-blue-600">{countryCount}</div>
          <div className="text-xs sm:text-sm text-muted-foreground">{getText('countriesLabel', 'Countries')}</div>
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
        <div className="col-span-full text-center py-2 text-2xl font-bold text-gray-600 italic">
          and many more members!
        </div>
      </div>
    </section>
  );
} 