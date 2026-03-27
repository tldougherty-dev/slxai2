import { UserRole } from '@/lib/roles';

export interface SocialMedia {
  facebook?: string;
  x?: string;
  linkedin?: string;
  instagram?: string;
  youtube?: string;
  tiktok?: string;
}

export interface MemberPerson {
  id: string;
  name: string;
  title?: string;
  email: string;
  isVotingRep?: boolean;
  role?: UserRole;
  socialMedia?: SocialMedia;
  isRegistered?: boolean;
  status?: 'pending' | 'active'; // pending = approved but not signed up, active = signed up and email confirmed
}

export interface Member {
  id: string;
  organizationName: string;
  country: string;
  pocName: string;
  pocEmail: string;
  pocTitle?: string;
  memberCount: number;
  members: MemberPerson[];
  bio?: string;
  logo?: string;
  website?: string;
  socialMedia?: SocialMedia;
  status?: 'pending' | 'active'; // pending = approved but not signed up, active = signed up and email confirmed
}

export const members: Member[] = [
  {
    id: '1',
    organizationName: 'Dillo.ai',
    country: 'Argentina',
    pocName: 'Flores Manuel',
    pocEmail: 'manuel@dillo.ai',
    pocTitle: 'Voting Representative',
    memberCount: 1,
    members: [
      { id: '1-1', name: 'Flores Manuel', email: 'manuel@dillo.ai', isVotingRep: true }
    ]
  },
  {
    id: '2',
    organizationName: 'Convo',
    country: 'Australia',
    pocName: 'Ravi Vasavan',
    pocEmail: 'ravi.vasavan@convorelay.com',
    pocTitle: 'Voting Representative',
    memberCount: 2,
    members: [
      { id: '2-1', name: 'Ravi Vasavan', email: 'ravi.vasavan@convorelay.com', isVotingRep: true },
      { id: '2-2', name: 'Ryan Haitcampbell', email: 'ryan.haitcampbell@convorelay.com' }
    ]
  },
  {
    id: '3',
    organizationName: 'Hugrun',
    country: 'Australia',
    pocName: 'James Blyth',
    pocEmail: 'james@hugrun.ai',
    pocTitle: 'Voting Representative',
    memberCount: 1,
    members: [
      { id: '3-1', name: 'James Blyth', email: 'james@hugrun.ai', isVotingRep: true }
    ]
  },
  {
    id: '4',
    organizationName: 'Lingvano',
    country: 'Austria',
    pocName: 'Gabriel Kwakyi',
    pocEmail: 'gabriel.kwakyi@lingvano.com',
    pocTitle: 'Voting Representative',
    memberCount: 3,
    members: [
      { id: '4-1', name: 'Gabriel Kwakyi', email: 'gabriel.kwakyi@lingvano.com', isVotingRep: true },
      { id: '4-2', name: 'Matthias Fischer', email: 'matthias.fischer@lingvano.com' },
      { id: '4-3', name: 'Nicolas Molcik', email: 'nicolas.molcik@lingvano.com' }
    ]
  },
  {
    id: '5',
    organizationName: 'GLWMax',
    country: 'Belgium',
    pocName: 'Andy Hoorebeke',
    pocEmail: 'andy@glwmax.com',
    pocTitle: 'Voting Representative',
    memberCount: 1,
    members: [
      { id: '5-1', name: 'Andy Hoorebeke', email: 'andy@glwmax.com', isVotingRep: true }
    ]
  },
  {
    id: '6',
    organizationName: 'Hand Talk',
    country: 'Brazil',
    pocName: 'Ronaldo Tenório',
    pocEmail: 'ronaldo@handtalk.me',
    pocTitle: 'Voting Representative',
    memberCount: 1,
    members: [
      { id: '6-1', name: 'Ronaldo Tenório', email: 'ronaldo@handtalk.me', isVotingRep: true }
    ]
  },
  {
    id: '7',
    organizationName: 'DeafCloud Communications',
    country: 'Canada',
    pocName: 'Michael Zagozdzon',
    pocEmail: 'michael@deafcloud.com',
    pocTitle: 'Voting Representative',
    memberCount: 1,
    members: [
      { id: '7-1', name: 'Michael Zagozdzon', email: 'michael@deafcloud.com', isVotingRep: true }
    ]
  },
  {
    id: '8',
    organizationName: 'DeafSkills International Association',
    country: 'Canada',
    pocName: 'Vyacheslav (Slava) Klimov',
    pocEmail: 'Klimov.slava@gmail.com',
    pocTitle: 'Voting Representative',
    memberCount: 1,
    members: [
      { id: '8-1', name: 'Vyacheslav (Slava) Klimov', email: 'Klimov.slava@gmail.com', isVotingRep: true }
    ]
  },
  {
    id: '9',
    organizationName: 'SignaVision Solutions Inc',
    country: 'Canada',
    pocName: 'Jeff Panasuik',
    pocEmail: 'Info@signavision.ca',
    pocTitle: 'Voting Representative',
    memberCount: 1,
    members: [
      { id: '9-1', name: 'Jeff Panasuik', email: 'Info@signavision.ca', isVotingRep: true }
    ]
  },
  {
    id: '10',
    organizationName: 'MocapLab',
    country: 'France',
    pocName: 'Remi Brun',
    pocEmail: 'remi.brun@mocaplab.com',
    pocTitle: 'Voting Representative',
    memberCount: 4,
    members: [
      { id: '10-1', name: 'Remi Brun', email: 'remi.brun@mocaplab.com', isVotingRep: true },
      { id: '10-2', name: 'Robin Gaune', email: 'robin.gaune@mocaplab.com' },
      { id: '10-3', name: 'Boris Dauriac', email: 'boris.dauriac@mocaplab.com' },
      { id: '10-4', name: 'Stephanie Sidhu', email: 'stephanie.sidhu@mocaplab.com' }
    ]
  },
  {
    id: '11',
    organizationName: 'German Deaf Association',
    country: 'Germany',
    pocName: 'Ralph Raule',
    pocEmail: 'r.raule@gehoerlosenbund.de',
    pocTitle: 'Voting Representative',
    memberCount: 1,
    members: [
      { id: '11-1', name: 'Ralph Raule', email: 'r.raule@gehoerlosenbund.de', isVotingRep: true }
    ]
  },
  {
    id: '12',
    organizationName: 'Open Mind Software GmbH',
    country: 'Germany',
    pocName: 'Manuel Gnerlich',
    pocEmail: 'm.gnerlich@openmind-sw.de',
    pocTitle: 'Voting Representative',
    memberCount: 1,
    members: [
      { id: '12-1', name: 'Manuel Gnerlich', email: 'm.gnerlich@openmind-sw.de', isVotingRep: true }
    ]
  },
  {
    id: '13',
    organizationName: 'Coalition for Sign Language Equity in Technology (CoSET)',
    country: 'Global',
    pocName: 'Abraham Glasser',
    pocEmail: 'abraham.glasser@gallaudet.edu',
    pocTitle: 'Voting Representative',
    memberCount: 4,
    members: [
      { id: '13-1', name: 'Abraham Glasser', email: 'abraham.glasser@gallaudet.edu', isVotingRep: true },
      { id: '13-2', name: 'Timothy Riker', email: 'timrikercdi@gmail.com' },
      { id: '13-3', name: 'Molly Glass', email: 'molly.glass@coset.org' },
      { id: '13-4', name: 'Steph Kent', email: 'steph.kent@coset.org' }
    ]
  },
  {
    id: '14',
    organizationName: 'DeepVisionTech.AI',
    country: 'India',
    pocName: 'Jayasudan Munsamy',
    pocEmail: 'Jayasudan@DeepVisionTech.AI',
    pocTitle: 'Voting Representative',
    memberCount: 1,
    members: [
      { id: '14-1', name: 'Jayasudan Munsamy', email: 'Jayasudan@DeepVisionTech.AI', isVotingRep: true }
    ]
  },
  {
    id: '15',
    organizationName: 'sign.mt',
    country: 'Israel',
    pocName: 'Amit Moryossef',
    pocEmail: 'amit@sign.mt',
    pocTitle: 'Voting Representative',
    memberCount: 1,
    members: [
      { id: '15-1', name: 'Amit Moryossef', email: 'amit@sign.mt', isVotingRep: true }
    ]
  },
  {
    id: '16',
    organizationName: 'VSL Labs',
    country: 'Israel',
    pocName: 'Tal Meged',
    pocEmail: 'tal@vsllabs.com',
    pocTitle: 'Voting Representative',
    memberCount: 1,
    members: [
      { id: '16-1', name: 'Tal Meged', email: 'tal@vsllabs.com', isVotingRep: true }
    ]
  },
  {
    id: '17',
    organizationName: 'Handy Signs',
    country: 'Italy',
    pocName: 'Emanuele Chiusaroli',
    pocEmail: 'emanuele@handysigns.it',
    pocTitle: 'Voting Representative',
    memberCount: 1,
    members: [
      { id: '17-1', name: 'Emanuele Chiusaroli', email: 'emanuele@handysigns.it', isVotingRep: true }
    ]
  },
  {
    id: '18',
    organizationName: 'NHK Enterprises',
    country: 'Japan',
    pocName: 'Takashi Koyano',
    pocEmail: 'koyano-ta@nhk-ep.co.jp',
    pocTitle: 'Voting Representative',
    memberCount: 1,
    members: [
      { id: '18-1', name: 'Takashi Koyano', email: 'koyano-ta@nhk-ep.co.jp', isVotingRep: true }
    ]
  },
  {
    id: '19',
    organizationName: 'Deaf eLimu Plus',
    country: 'Kenya',
    pocName: 'Hudson Asiema',
    pocEmail: 'Hudson@deafelimuplus.co.ke',
    pocTitle: 'Voting Representative',
    memberCount: 1,
    members: [
      { id: '19-1', name: 'Hudson Asiema', email: 'Hudson@deafelimuplus.co.ke', isVotingRep: true }
    ]
  },
  {
    id: '20',
    organizationName: 'Ugunja Deaf Self Help Group',
    country: 'Kenya',
    pocName: 'Boniface Ogutu',
    pocEmail: 'Ugunjadeafshgp@gmail.com',
    pocTitle: 'Voting Representative',
    memberCount: 1,
    members: [
      { id: '20-1', name: 'Boniface Ogutu', email: 'Ugunjadeafshgp@gmail.com', isVotingRep: true }
    ]
  },
  {
    id: '21',
    organizationName: 'Kara Technologies',
    country: 'New Zealand',
    pocName: 'Yeh Kim',
    pocEmail: 'yeh@kara.tech',
    pocTitle: 'Voting Representative',
    memberCount: 1,
    members: [
      { id: '21-1', name: 'Yeh Kim', email: 'yeh@kara.tech', isVotingRep: true }
    ]
  },
  {
    id: '22',
    organizationName: 'American corner of Zinder/maradi',
    country: 'Niger',
    pocName: 'Ahmed moussa',
    pocEmail: 'ahmedmusazubairu777@gmail.com',
    pocTitle: 'Voting Representative',
    memberCount: 1,
    members: [
      { id: '22-1', name: 'Ahmed moussa', email: 'ahmedmusazubairu777@gmail.com', isVotingRep: true }
    ]
  },
  {
    id: '23',
    organizationName: 'Deaf Inclusion and Development Initiative',
    country: 'Nigeria',
    pocName: 'Sola Aderibigbe',
    pocEmail: 'deafinclusion2024@gmail.com',
    pocTitle: 'Voting Representative',
    memberCount: 1,
    members: [
      { id: '23-1', name: 'Sola Aderibigbe', email: 'deafinclusion2024@gmail.com', isVotingRep: true }
    ]
  },
  {
    id: '24',
    organizationName: 'Sign Labs',
    country: 'Norway',
    pocName: 'Endre Elvestad',
    pocEmail: 'endre@signlab.co',
    pocTitle: 'Voting Representative',
    memberCount: 1,
    members: [
      { id: '24-1', name: 'Endre Elvestad', email: 'endre@signlab.co', isVotingRep: true }
    ]
  },
  {
    id: '25',
    organizationName: 'Inclusic.co',
    country: 'Pakistan',
    pocName: 'Muhammad Shayan Ali Qureshi',
    pocEmail: 'shayanmuhammad006@gmail.com',
    pocTitle: 'Voting Representative',
    memberCount: 1,
    members: [
      { id: '25-1', name: 'Muhammad Shayan Ali Qureshi', email: 'shayanmuhammad006@gmail.com', isVotingRep: true }
    ]
  },
  {
    id: '26',
    organizationName: 'Migam.ai',
    country: 'Poland',
    pocName: 'Przemek Kusmierek',
    pocEmail: 'pk@migam.org',
    pocTitle: 'Voting Representative',
    memberCount: 2,
    members: [
      { id: '26-1', name: 'Przemek Kusmierek', email: 'pk@migam.org', isVotingRep: true },
      { id: '26-2', name: 'Slawek Luczywek', email: 'slawek.luczywek@migam.org' }
    ]
  },
  {
    id: '27',
    organizationName: 'SignAvatar',
    country: 'Serbia',
    pocName: 'Uroš Milenković',
    pocEmail: 'lemon@signavatar.org',
    pocTitle: 'Voting Representative',
    memberCount: 1,
    members: [
      { id: '27-1', name: 'Uroš Milenković', email: 'lemon@signavatar.org', isVotingRep: true }
    ]
  },
  {
    id: '28',
    organizationName: 'SignLang Consultancy',
    country: 'South Africa',
    pocName: 'Lorato Rasebopye',
    pocEmail: 'bontlelorato@gmail.com',
    pocTitle: 'Voting Representative',
    memberCount: 1,
    members: [
      { id: '28-1', name: 'Lorato Rasebopye', email: 'bontlelorato@gmail.com', isVotingRep: true }
    ]
  },
  {
    id: '29',
    organizationName: 'Teckenbro',
    country: 'Sweden',
    pocName: 'Joel Kankkonen',
    pocEmail: 'joel@teckenbro.com',
    pocTitle: 'Voting Representative',
    memberCount: 1,
    members: [
      { id: '29-1', name: 'Joel Kankkonen', email: 'joel@teckenbro.com', isVotingRep: true }
    ]
  },
  {
    id: '30',
    organizationName: 'HU University of Applied Sciences Utrecht',
    country: 'the Netherlands',
    pocName: 'Maartje De Meulder',
    pocEmail: 'maartje.demeulder@hu.nl',
    pocTitle: 'Voting Representative',
    memberCount: 1,
    members: [
      { id: '30-1', name: 'Maartje De Meulder', email: 'maartje.demeulder@hu.nl', isVotingRep: true }
    ]
  },
  {
    id: '31',
    organizationName: 'SignForDeaf',
    country: 'Türkiye',
    pocName: 'Özer Çelik',
    pocEmail: 'ozer.celik@signfordeaf.com',
    pocTitle: 'Voting Representative',
    memberCount: 1,
    members: [
      { id: '31-1', name: 'Özer Çelik', email: 'ozer.celik@signfordeaf.com', isVotingRep: true }
    ]
  },
  {
    id: '32',
    organizationName: 'Signapse',
    country: 'UK',
    pocName: 'Sally Chalk',
    pocEmail: 'sally@signapse.ai',
    pocTitle: 'Voting Representative',
    memberCount: 3,
    members: [
      { id: '32-1', name: 'Sally Chalk', email: 'sally@signapse.ai', isVotingRep: true },
      {
        id: '32-2',
        name: 'Travis Dougherty',
        email: 'travis@signapse.ai',
        isVotingRep: true,
        isRegistered: true,
      },
      {
        id: '32-3',
        name: 'Jeffrey Shaul',
        email: 'jeff@signapse.ai',
        isVotingRep: true,
        isRegistered: false,
      },
    ]
  },
  {
    id: '33',
    organizationName: 'University of Surrey',
    country: 'UK',
    pocName: 'Richard Bowden',
    pocEmail: 'r.bowden@surrey.ac.uk',
    pocTitle: 'Voting Representative',
    memberCount: 1,
    members: [
      { id: '33-1', name: 'Richard Bowden', email: 'r.bowden@surrey.ac.uk', isVotingRep: true }
    ]
  },
  {
    id: '34',
    organizationName: 'Deafness Cognition and Language Research Centre, University College London',
    country: 'United Kingdom',
    pocName: 'Kearsy Cormier',
    pocEmail: 'k.cormier@ucl.ac.uk',
    pocTitle: 'Voting Representative',
    memberCount: 1,
    members: [
      { id: '34-1', name: 'Kearsy Cormier', email: 'k.cormier@ucl.ac.uk', isVotingRep: true }
    ]
  },
  {
    id: '35',
    organizationName: 'SignWave AI',
    country: 'United Kingdom',
    pocName: 'Priyesh Patel',
    pocEmail: 'signwaveai@gmail.com',
    pocTitle: 'Voting Representative',
    memberCount: 1,
    members: [
      { id: '35-1', name: 'Priyesh Patel', email: 'signwaveai@gmail.com', isVotingRep: true }
    ]
  },
  {
    id: '36',
    organizationName: 'Silence speaks ltd',
    country: 'United kingdom',
    pocName: 'Pavan madduru',
    pocEmail: 'Pavan.madduru@silencespeaks.io',
    pocTitle: 'Voting Representative',
    memberCount: 1,
    members: [
      { id: '36-1', name: 'Pavan madduru', email: 'Pavan.madduru@silencespeaks.io', isVotingRep: true }
    ]
  },
  {
    id: '37',
    organizationName: 'Signly',
    country: 'UK',
    pocName: 'Mark Applin',
    pocEmail: 'mark@signly.co',
    pocTitle: 'Voting Representative',
    memberCount: 1,
    members: [
      { id: '37-1', name: 'Mark Applin', email: 'mark@signly.co', isVotingRep: true }
    ]
  },
  {
    id: '38',
    organizationName: '360 Direct Access',
    country: 'United States',
    pocName: 'Craig Radford',
    pocEmail: 'Craig@360directaccess.com',
    pocTitle: 'Voting Representative',
    memberCount: 1,
    members: [
      { id: '38-1', name: 'Craig Radford', email: 'Craig@360directaccess.com', isVotingRep: true }
    ]
  },
  {
    id: '39',
    organizationName: 'Hands United',
    country: 'United States',
    pocName: 'Celena Ponce',
    pocEmail: 'celena.a.ponce@gmail.com',
    pocTitle: 'Voting Representative',
    memberCount: 1,
    members: [
      { id: '39-1', name: 'Celena Ponce', email: 'celena.a.ponce@gmail.com', isVotingRep: true }
    ]
  },
  {
    id: '40',
    organizationName: 'TDIforAccess',
    country: 'United States',
    pocName: 'AnnMarie Killian',
    pocEmail: 'amkillian@tdiforaccess.org',
    pocTitle: 'Voting Representative',
    memberCount: 1,
    members: [
      { id: '40-1', name: 'AnnMarie Killian', email: 'amkillian@tdiforaccess.org', isVotingRep: true }
    ]
  },
  {
    id: '41',
    organizationName: 'spokhand',
    country: 'United States',
    pocName: 'Florian Méloux',
    pocEmail: 'florian@spokhand.org',
    pocTitle: 'Voting Representative',
    memberCount: 1,
    members: [
      { id: '41-1', name: 'Florian Méloux', email: 'florian@spokhand.org', isVotingRep: true }
    ]
  },
  {
    id: '42',
    organizationName: 'Deaf Studies at Boston University',
    country: 'United States of America',
    pocName: 'Naomi Caselli',
    pocEmail: 'nkc@bu.edu',
    pocTitle: 'Voting Representative',
    memberCount: 1,
    members: [
      { id: '42-1', name: 'Naomi Caselli', email: 'nkc@bu.edu', isVotingRep: true }
    ]
  },
  {
    id: '43',
    organizationName: 'DeepSignAI',
    country: 'United States of America',
    pocName: 'Timothy Blonksy',
    pocEmail: 'Timblonsky@gmail.com',
    pocTitle: 'Voting Representative',
    memberCount: 1,
    members: [
      { id: '43-1', name: 'Timothy Blonksy', email: 'Timblonsky@gmail.com', isVotingRep: true }
    ]
  },
  {
    id: '45',
    organizationName: 'Omnibridge',
    country: 'United States of America',
    pocName: 'Adam Munder',
    pocEmail: 'AMunder@sorenson.com',
    pocTitle: 'Voting Representative',
    memberCount: 1,
    members: [
      { id: '45-1', name: 'Adam Munder', email: 'AMunder@sorenson.com', isVotingRep: true }
    ]
  },
  {
    id: '46',
    organizationName: 'Sign AI',
    country: 'United States of America',
    pocName: 'Greg Rutty',
    pocEmail: 'greg@sign-ai.co',
    pocTitle: 'Voting Representative',
    memberCount: 1,
    members: [
      { id: '46-1', name: 'Greg Rutty', email: 'greg@sign-ai.co', isVotingRep: true }
    ]
  },
  {
    id: '47',
    organizationName: 'Sign-Speak',
    country: 'United States of America',
    pocName: 'Yamillet Payano',
    pocEmail: 'yami@sign-speak.com',
    pocTitle: 'Voting Representative',
    memberCount: 2,
    members: [
      { id: '47-1', name: 'Yamillet Payano', email: 'yami@sign-speak.com', isVotingRep: true },
      { id: '47-2', name: 'Nikolas Kelly', email: 'niko@sign-speak.com' }
    ]
  },
  {
    id: '48',
    organizationName: 'Sorenson',
    country: 'United States of America',
    pocName: 'Afraaz Masters',
    pocEmail: 'amasters@sorenson.com',
    pocTitle: 'Voting Representative',
    memberCount: 3,
    members: [
      { id: '48-1', name: 'Afraaz Masters', email: 'amasters@sorenson.com', isVotingRep: true },
      { id: '48-2', name: 'Jessica Bellewood', email: 'jbellewood@sorenson.com' },
      { id: '48-3', name: 'C Kennedy', email: 'CKennedy@sorenson.com' }
    ]
  },
  {
    id: '49',
    organizationName: 'PIVOT - dozanü innovations',
    country: 'United States of America & Canada',
    pocName: 'Katherine Lees',
    pocEmail: 'katherine@dozanu.com',
    pocTitle: 'Voting Representative',
    memberCount: 1,
    members: [
      { id: '49-1', name: 'Katherine Lees', email: 'katherine@dozanu.com', isVotingRep: true }
    ]
  },
  {
    id: '50',
    organizationName: 'Action & Brain Lab, Gallaudet University',
    country: 'USA',
    pocName: 'Lorna Quandt',
    pocEmail: 'lorna.quandt@gallaudet.edu',
    pocTitle: 'Voting Representative',
    memberCount: 1,
    members: [
      { id: '50-1', name: 'Lorna Quandt', email: 'lorna.quandt@gallaudet.edu', isVotingRep: true }
    ]
  },
  {
    id: '51',
    organizationName: 'AvocadoWeb Services LLC',
    country: 'USA',
    pocName: 'Joseph Brzezowski',
    pocEmail: 'joseph@avocadoweb.net',
    pocTitle: 'Voting Representative',
    memberCount: 1,
    members: [
      { id: '51-1', name: 'Joseph Brzezowski', email: 'joseph@avocadoweb.net', isVotingRep: true }
    ]
  },
  {
    id: '52',
    organizationName: 'Cisco systems',
    country: 'USA',
    pocName: 'Frank Murphy',
    pocEmail: 'Frankmur@cisco.com',
    pocTitle: 'Voting Representative',
    memberCount: 1,
    members: [
      { id: '52-1', name: 'Frank Murphy', email: 'Frankmur@cisco.com', isVotingRep: true }
    ]
  },
  {
    id: '53',
    organizationName: 'Framingham State U ASL Program',
    country: 'USA',
    pocName: 'Bruce Bucci',
    pocEmail: 'Bbucci@framingham.edu',
    pocTitle: 'Voting Representative',
    memberCount: 1,
    members: [
      { id: '53-1', name: 'Bruce Bucci', email: 'Bbucci@framingham.edu', isVotingRep: true }
    ]
  },
  {
    id: '54',
    organizationName: 'GoVoBo.ai',
    country: 'USA',
    pocName: 'Michael Veronis',
    pocEmail: 'mveronis@govobo.ai',
    pocTitle: 'Voting Representative',
    memberCount: 1,
    members: [
      { id: '54-1', name: 'Michael Veronis', email: 'mveronis@govobo.ai', isVotingRep: true }
    ]
  },
  {
    id: '55',
    organizationName: 'Motionsign',
    country: 'USA',
    pocName: 'Albert Liu',
    pocEmail: 'albert.liu@motionsign.ai',
    pocTitle: 'Voting Representative',
    memberCount: 1,
    members: [
      { id: '55-1', name: 'Albert Liu', email: 'albert.liu@motionsign.ai', isVotingRep: true }
    ]
  },
  {
    id: '56',
    organizationName: 'Nagish',
    country: 'USA',
    pocName: 'Tomer Aharoni',
    pocEmail: 'tomer@nagish.com',
    pocTitle: 'Voting Representative',
    memberCount: 2,
    members: [
      { id: '56-1', name: 'Tomer Aharoni', email: 'tomer@nagish.com', isVotingRep: true },
      { id: '56-2', name: 'Matt Sherman', email: 'matt@nagish.com' }
    ]
  },
  {
    id: '57',
    organizationName: 'NVIDIA',
    country: 'USA',
    pocName: 'Michael Boone',
    pocEmail: 'mboone@nvidia.com',
    pocTitle: 'Voting Representative',
    memberCount: 1,
    members: [
      { id: '57-1', name: 'Michael Boone', email: 'mboone@nvidia.com', isVotingRep: true }
    ]
  },
  {
    id: '58',
    organizationName: 'SignUp Media',
    country: 'USA',
    pocName: 'Mariella Satow',
    pocEmail: 'msatow@signupmedia.com',
    pocTitle: 'Voting Representative',
    memberCount: 2,
    members: [
      { id: '58-1', name: 'Mariella Satow', email: 'msatow@signupmedia.com', isVotingRep: true },
      { id: '58-2', name: 'Larry Goldberg', email: 'Larry@SignUpMedia.com' }
    ]
  },
  {
    id: '59',
    organizationName: 'SignWow United States',
    country: 'USA',
    pocName: 'Thomas Horejes',
    pocEmail: 'thomas.horejes@signwow.com',
    pocTitle: 'Voting Representative',
    memberCount: 1,
    members: [
      { id: '59-1', name: 'Thomas Horejes', email: 'thomas.horejes@signwow.com', isVotingRep: true }
    ]
  },
  {
    id: '60',
    organizationName: 'The ASL Shop',
    country: 'USA',
    pocName: 'Stephanie Zornoza',
    pocEmail: 'admin@theaslshop.com',
    pocTitle: 'Voting Representative',
    memberCount: 1,
    members: [
      { id: '60-1', name: 'Stephanie Zornoza', email: 'admin@theaslshop.com', isVotingRep: true }
    ]
  },
  {
    id: '61',
    organizationName: 'With Direction, LLC',
    country: 'USA',
    pocName: 'Christopher Tester',
    pocEmail: 'christopher@withdirection.co',
    pocTitle: 'Voting Representative',
    memberCount: 1,
    members: [
      { id: '61-1', name: 'Christopher Tester', email: 'christopher@withdirection.co', isVotingRep: true }
    ]
  }
];

