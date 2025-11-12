import React from "react";
import { Card } from "./ui/card";

const companies = [
  { name: "360 Direct Access", country: "USA", code: "us" },
  { name: "Action & Brain Lab, Gallaudet University", country: "USA", code: "us" },
  { name: "American Corner of Zinder/Maradi", country: "Niger", code: "ne" },
  { name: "AvocadoWeb Services", country: "USA", code: "us" },
  { name: "Cisco Systems", country: "USA", code: "us" },
  { name: "CoSET", country: "USA", code: "us" },
  { name: "Convo", country: "Australia", code: "au" },
  { name: "Deaf eLima Plus", country: "Kenya", code: "ke" },
  { name: "Deaf Inclusion and Development Initiative", country: "Nigeria", code: "ng" },
  { name: "Deaf Studies at\nBoston University", country: "USA", code: "us" },
  { name: "DeepSignAI", country: "USA", code: "us" },
  { name: "DeepVisionTech.AI", country: "India", code: "in" },
  { name: "DeafCloud Communications", country: "Canada", code: "ca" },
  { name: "DeafSkills International Association", country: "Canada", code: "ca" },
  { name: "Dillo.ai", country: "Argentina", code: "ar" },
  { name: "Dozanü Innovations", country: "USA", code: "us" },
  { name: "Framingham State University", country: "USA", code: "us" },
  { name: "German Deaf Association", country: "Germany", code: "de" },
  { name: "GLWMax", country: "Belgium", code: "be" },
  { name: "GoSign.AI", country: "USA", code: "us" },
  { name: "GoVoBo.ai", country: "USA", code: "us" },
  { name: "Hand Talk", country: "Brazil", code: "br" },
  { name: "Hands United", country: "USA", code: "us" },
  { name: "Handy Signs", country: "Italy", code: "it" },
  { name: "HU University of Applied Sciences Utrecht", country: "Netherlands", code: "nl" },
  { name: "Inclusic.co", country: "Pakistan", code: "pk" },
  { name: "Kara Technologies", country: "New Zealand", code: "nz" },
  { name: "Lingvano", country: "Austria", code: "at" },
  { name: "Migam.ai", country: "Poland", code: "pl" },
  { name: "MocapLab", country: "France", code: "fr" },
  { name: "Motionsign", country: "USA", code: "us" },
  { name: "Nagish", country: "USA", code: "us" },
  { name: "NHK Enterprises", country: "Japan", code: "jp" },
  { name: "NVIDIA", country: "USA", code: "us" },
  { name: "Omnibridge", country: "USA", code: "us" },
  { name: "Open Mind Software", country: "Germany", code: "de" },
  { name: "Sign AI", country: "USA", code: "us" },
  { name: "Sign-Speak", country: "USA", code: "us" },
  { name: "SignAvatar", country: "Serbia", code: "rs" },
  { name: "SignForDeaf", country: "Turkey", code: "tr" },
  { name: "SignLab", country: "Norway", code: "no" },
  { name: "SignLang Consultancy", country: "South Africa", code: "za" },
  { name: "SignaVision Solutions", country: "Canada", code: "ca" },
  { name: "Sign.mt", country: "Israel", code: "il" },
  { name: "Signapse", country: "UK", code: "gb" },
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
];

export default function InterestedCompanies() {
  // Calculate unique countries
  const uniqueCountries = new Set(companies.map(company => company.country));
  const countryCount = uniqueCountries.size;
  const companyCount = companies.length;

  return (
    <section className="py-12">
      <h2 className="text-3xl font-bold mb-4 text-center text-gray-900">Members Already Interested</h2>
      
      {/* Infographics */}
      <div className="flex justify-center gap-8 mb-8">
        <Card 
          className="text-center p-6 border-2 border-blue-500 shadow-none w-32"
          style={{
            filter: 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3))',
            transform: 'translateY(-2px)'
          }}
        >
                     <div className="text-4xl font-bold text-blue-600">{companyCount}</div>
           <div className="text-sm text-muted-foreground">Members</div>
        </Card>
        <Card 
          className="text-center p-6 border-2 border-blue-500 shadow-none w-32"
          style={{
            filter: 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3))',
            transform: 'translateY(-2px)'
          }}
        >
          <div className="text-4xl font-bold text-blue-600">{countryCount}</div>
          <div className="text-sm text-muted-foreground">Countries</div>
        </Card>
      </div>

      <p className="text-center mb-8 text-muted-foreground max-w-2xl mx-auto">
        Leading industry leaders in the sign language x AI space 
        <br />
        have already expressed interest in becoming founding members.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
        {companies.map((company) => (
          <Card 
            key={company.name} 
            className="flex flex-col items-center pt-6 pb-6 px-6 border-2 border-green-500 shadow-none"
            style={{
              filter: 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3))',
              transform: 'translateY(-2px)'
            }}
          >
            <img
              src={company.code === 'il' ? '/flags/flag-of-israel.webp' : 
                   company.code === 'us' ? '/flags/usa.webp' : 
                   company.code === 'be' ? '/flags/belgium.webp' :
                   company.code === 'se' ? '/flags/sweden.webp' :
                   company.code === 'ch' ? '/flags/switzerland.webp' :
                   company.code === 'de' ? '/flags/germany-flag.webp' :
                   company.code === 'gb' ? '/flags/british-flag.svg' :
                   company.code === 'au' ? '/flags/Flag_of_Australia.png' :
                   company.code === 'at' ? '/flags/Austria.svg' :
                   company.code === 'nl' ? '/flags/Flag_of_the_Netherlands.svg' :
                   company.code === 'pk' ? '/flags/Flag_of_Pakistan.svg' :
                   company.code === 'tr' ? '/flags/Flag_of_Turkey.svg' :
                   company.code === 'ke' ? '/flags/Flag_of_Kenya.svg' :
                   company.code === 'ne' ? '/flags/Flag_of_Niger.svg' :
                   company.code === 'ng' ? '/flags/Flag_of_Nigeria.svg' :
                   company.code === 'za' ? '/flags/Flag_of_South_Africa.svg' :
                   company.code === 'in' ? '/flags/Flag_of_India.svg' :
                   `/flags/${company.code}.svg`}
              alt={`${company.country} flag`}
              style={{ 
                height: company.code === 'gb' ? '3.069em' : (company.code === 'il' || company.code === 'be' || company.code === 'se' || company.code === 'ch' || company.code === 'au' || company.code === 'at' || company.code === 'nl' || company.code === 'pk' || company.code === 'tr' || company.code === 'ke' || company.code === 'ne' || company.code === 'ng' || company.code === 'za' || company.code === 'in') ? '3.3em' : '3em', 
                width: 'auto', 
                display: 'block', 
                margin: '0 auto 1em auto',
                filter: 'drop-shadow(0 8px 16px rgba(0, 0, 0, 0.6))',
                transform: 'translateY(-4px)',
                objectFit: 'contain',
                maxHeight: company.code === 'gb' ? '3.069em' : (company.code === 'il' || company.code === 'be' || company.code === 'se' || company.code === 'ch' || company.code === 'au' || company.code === 'at' || company.code === 'nl' || company.code === 'pk' || company.code === 'tr' || company.code === 'ke' || company.code === 'ne' || company.code === 'ng' || company.code === 'za' || company.code === 'in') ? '3.3em' : '3em'
              }}
              loading="lazy"
              onError={(e) => {
                console.error(`Failed to load flag for ${company.country}:`, e);
              }}
            />
            <div className="text-lg font-semibold text-center mt-2">{company.name}</div>
            <div className="text-sm text-muted-foreground text-center">{company.country}</div>
          </Card>
        ))}
      </div>

    </section>
  );
} 