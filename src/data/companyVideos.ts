// Company YouTube Videos Data
// Real YouTube video IDs from member companies

import { members } from './members';

export interface CompanyVideo {
  id: string;
  organizationName: string;
  pocName: string;
  videoTitle: string;
  videoId: string; // YouTube video ID
  description: string;
  uploadedDate: string;
}

// Real videos from member companies (last 2 years)
export const companyVideos: CompanyVideo[] = [
  // Sign-Speak (USA) - CES 2025 (Most Recent)
  {
    id: 'signspeak-1',
    organizationName: 'Sign-Speak',
    pocName: 'Yamillet Payano',
    videoTitle: 'CES 2025: Sign-Speak Sign Language AI',
    videoId: 'hZlHyl9R4I0',
    description: 'A CES 2025 interview in which Allison Sheridan talks with Sign-Speak co-founder Nicholas Wilkins about their AI system for sign language recognition.',
    uploadedDate: '1 month ago',
  },
  
  // Kara Technologies (New Zealand) - Aug 2, 2024
  {
    id: 'kara-1',
    organizationName: 'Kara Technologies',
    pocName: 'Yeh Kim',
    videoTitle: 'Kara Technologies on Seven Sharp (Aug 2, 2024)',
    videoId: 'llDk3f1DX5w',
    description: 'A TVNZ Seven Sharp segment profiling Kara Technologies, a Deaf-led Kiwi tech company making digital sign language avatars.',
    uploadedDate: '6 months ago',
  },
  
  // VSL Labs (Israel) - 2024
  {
    id: 'vsllabs-1',
    organizationName: 'VSL Labs',
    pocName: 'Tal Meged',
    videoTitle: 'Leveraging GenAI for Accurate and Culturally Sensitive Sign Language Translation',
    videoId: 'NADMak9W9kg',
    description: 'A conference presentation by VSL Labs CTO Yaniv Eytani on using generative AI to produce accurate, culturally sensitive 3D sign language translations.',
    uploadedDate: '7 months ago',
  },
  
  // Teckenbro (Sweden) - 2024
  {
    id: 'teckenbro-1',
    organizationName: 'Teckenbro',
    pocName: 'Joel Kankkonen',
    videoTitle: 'European Capital of Sign Language: Örebro, Sweden!',
    videoId: 'kWdjgXc30do',
    description: 'A mini-documentary from Sorenson\'s "Deaf Life" series (2024) celebrating Örebro, Sweden as the European Capital of Sign Language.',
    uploadedDate: '8 months ago',
  },
  
  // TDI for Access (USA) - 2024
  {
    id: 'tdi-1',
    organizationName: 'TDIforAccess',
    pocName: 'AnnMarie Killian',
    videoTitle: 'Driving Accessible Communication and Advocacy for the Deaf and Hard of Hearing',
    videoId: 'QZm5YLpq0o4',
    description: 'A recorded webinar (2024) in which TDI\'s Executive Director addresses the HLAA-DC chapter, detailing TDI\'s advocacy in telecom, media, and tech policy.',
    uploadedDate: '8 months ago',
  },
  
  // Migam.ai (Poland) - April 29, 2024
  {
    id: 'migam-1',
    organizationName: 'Migam.ai',
    pocName: 'Przemek Kusmierek',
    videoTitle: 'Bridging communication gaps with AI-powered ASL translation',
    videoId: '9LQE6fZOfrM',
    description: 'A launch announcement by Migam.ai unveiling their AI avatar for sign language translation.',
    uploadedDate: '9 months ago',
  },
  
  // Handy Signs (Italy)
  {
    id: 'handysigns-1',
    organizationName: 'Handy Signs',
    pocName: 'Emanuele Chiusaroli',
    videoTitle: 'Handy Signs Crowned Startup of the Year at SG Rome',
    videoId: 'bEHwC2GL1i8',
    description: 'A short feature highlighting Handy Signs, an Italian startup offering the first real-time, AI-powered Italian Sign Language translation app (for voice/text to LIS).',
    uploadedDate: '10 months ago',
  },
  
  // DeafCloud Communications / Signapse (Canada/USA)
  {
    id: 'signapse-deafcloud-1',
    organizationName: 'Signapse',
    pocName: 'Jeffrey Shaul',
    videoTitle: 'Deaf in the Cloud interviews the Signapse team',
    videoId: 'XihnDNA_LzA',
    description: 'An interview webisode where Deaf in the Cloud host Rob Koch (of DeafCloud) and Destiny O\'Connor chat with Ryan Hait-Campbell and Jeff Shaul of Signapse about their AI-driven sign language translation technology.',
    uploadedDate: '11 months ago',
  },
  
  // NHK Enterprises (Japan)
  {
    id: 'nhk-1',
    organizationName: 'NHK Enterprises',
    pocName: 'Takashi Koyano',
    videoTitle: 'Virtual Human Sign Interpreter',
    videoId: 'SlabOYpNN5I',
    description: 'A clip showcasing "KIKI," NHK\'s highly realistic sign language CG avatar. Developed with over 16,000 motion-captured gestures, KIKI can render Japanese Sign Language in real time.',
    uploadedDate: '1 year ago',
  },
  
  // SignAvatar (Serbia)
  {
    id: 'signavatar-1',
    organizationName: 'SignAvatar',
    pocName: 'Uroš Milenković',
    videoTitle: 'TransportSign: Serbian Railways Integration',
    videoId: '_WedOEyQC2M',
    description: 'A demo of SignAvatar\'s TransportSign system, which uses AI avatars to translate public announcements into sign language in real time.',
    uploadedDate: '1 year ago',
  },
  
  // OmniBridge (USA)
  {
    id: 'omnibridge-1',
    organizationName: 'Omnibridge',
    pocName: 'Adam Munder',
    videoTitle: 'How AI Can Bridge the Deaf and Hearing Worlds: Adam Munder',
    videoId: 'N4RikDjIneg',
    description: 'A TEDx-style talk by Adam Munder introducing OmniBridge, an AI platform that translates American Sign Language into English text in real time.',
    uploadedDate: '1 year ago',
  },
  
  // Deaf Inclusion & Development Initiative (Nigeria)
  {
    id: 'deafinclusion-1',
    organizationName: 'Deaf Inclusion and Development Initiative',
    pocName: 'Sola Aderibigbe',
    videoTitle: 'Nigerian initiative paves way for deaf inclusion in tech',
    videoId: 'CX2pVA88kZY',
    description: 'A Voice of America news feature on efforts in Nigeria to empower Deaf people in the tech sector.',
    uploadedDate: '1 year ago',
  },
  
  // Deaf eLimu Plus (Kenya)
  {
    id: 'deafelimu-1',
    organizationName: 'Deaf eLimu Plus',
    pocName: 'Hudson Asiema',
    videoTitle: 'From the Lost Generation to Generation Alpha in Kenyan Sign Language',
    videoId: '2hXrFxUCS6Q',
    description: 'An educational webinar by Deaf eLimu Plus in Kenya discussing generational differences in Kenyan Sign Language (KSL).',
    uploadedDate: '1 year ago',
  },
  
  // Hand Talk (Brazil)
  {
    id: 'handtalk-1',
    organizationName: 'Hand Talk',
    pocName: 'Ronaldo Tenório',
    videoTitle: 'Hand Talk App: American Sign Language Translator',
    videoId: '9dsUad9K53U',
    description: 'An official promo demonstrating the Hand Talk app, which uses an animated 3D character "Hugo" to automatically translate text and voice into sign language (ASL or Libras) via AI.',
    uploadedDate: '1 year ago',
  },
  
  // 360 Direct Access (USA)
  {
    id: '360direct-1',
    organizationName: '360 Direct Access',
    pocName: 'Craig Radford',
    videoTitle: '360 Direct Access: New Brand (Direct Video Calling)',
    videoId: 'dGp8reO3LKA',
    description: 'A short rebranding video announcing 360 Direct Video\'s evolution into 360 Direct Access.',
    uploadedDate: '1 year ago',
  },
  
  // Coalition for Sign Language Equity in Technology (Co-SET) (Global)
  {
    id: 'coset-1',
    organizationName: 'Coalition for Sign Language Equity in Technology (CoSET)',
    pocName: 'Abraham Glasser',
    videoTitle: 'Artificial Intelligence (AI) and ASL Interpreting',
    videoId: 'lhbjH1YBOsI',
    description: 'A short Registry of Interpreters for the Deaf (RID) video featuring Co-SET leaders discussing how emerging AI, machine learning, and computer-vision tools are impacting ASL interpreting.',
    uploadedDate: '1 year ago',
  },
  
  // DeepVisionTech.AI (India)
  {
    id: 'deepvision-1',
    organizationName: 'DeepVisionTech.AI',
    pocName: 'Jayasudan Munsamy',
    videoTitle: 'DeepVisionTech.AI\'s Let\'sTalkSign: 1min Video',
    videoId: 'yvIN5SvGVjU',
    description: 'A one-minute overview of Let\'sTalkSign by DeepVisionTech.AI, showcasing its AI-driven platform for sign language interpretation in communication and education.',
    uploadedDate: '1 year ago',
  },
  
  // Lingvano (Austria)
  {
    id: 'lingvano-1',
    organizationName: 'Lingvano',
    pocName: 'Gabriel Kwakyi',
    videoTitle: 'Inside Lingvano HQ | Sign Language Learning App',
    videoId: 'xc-aJ2T1NsQ',
    description: 'A behind-the-scenes tour of Lingvano, an Austrian e-learning startup whose mission is to break down barriers between hearing and Deaf communities through an ASL learning app.',
    uploadedDate: '18 months ago',
  },
  
  // Dillo.ai (Argentina)
  {
    id: 'dillo-1',
    organizationName: 'Dillo.ai',
    pocName: 'Flores Manuel',
    videoTitle: '¡Dillo, una aplicación que traduce lengua de señas a texto!',
    videoId: 'sneyeQo9Xys',
    description: 'A Spanish-language news segment (El Doce TV) featuring Dillo.ai, an Argentinian startup developing a real-time AI sign language interpreter that translates sign language to text.',
    uploadedDate: '2 years ago',
  },
];

// Helper function to convert company videos to Resource format
export function getCompanyVideosAsResources(): Array<{
  id: string;
  name: string;
  type: 'video';
  url: string;
  embedUrl: string;
  lastModified: string;
  uploadedBy: string;
  description: string;
}> {
  return companyVideos.map((video) => ({
    id: video.id,
    name: video.videoTitle,
    type: 'video' as const,
    url: `https://www.youtube.com/watch?v=${video.videoId}`,
    embedUrl: `https://www.youtube.com/embed/${video.videoId}`,
    lastModified: video.uploadedDate,
    uploadedBy: video.organizationName,
    description: video.description,
  }));
}
