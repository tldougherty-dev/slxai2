/** Summit 2026 program book: sponsors by tier (linked list after schedule). */

export type Summit2026TieredSponsor = {
  name: string;
  url: string;
  /** Path under site root, e.g. `/sponsors/foo.png`. Omit when no asset yet. */
  logo?: string;
};

export type Summit2026SponsorTierGroup = {
  tierLabel: string;
  sponsors: Summit2026TieredSponsor[];
};

export const SUMMIT_2026_SPONSORS_BY_TIER: Summit2026SponsorTierGroup[] = [
  {
    tierLabel: 'Title Sponsor',
    sponsors: [
      {
        name: 'Boston University',
        url: 'https://www.bu.edu',
        logo: '/sponsors/boston-university.png',
      },
    ],
  },
  {
    tierLabel: 'Platinum Sponsors',
    sponsors: [
      {
        name: 'Kara Technologies',
        url: 'https://www.kara.tech',
        logo: '/sponsors/kara-technologies.png',
      },
      {
        name: 'MCDHH',
        url: 'https://www.mass.gov/orgs/massachusetts-commission-for-the-deaf-and-hard-of-hearing',
        logo: '/sponsors/mcdhh.png',
      },
      {
        name: 'TCS Teams',
        url: 'https://iyellowgroup.com',
        logo: '/sponsors/tcs-interpreting-captions.png',
      },
    ],
  },
  {
    tierLabel: 'Gold Sponsors',
    sponsors: [
      {
        name: 'AvocadoWeb Services',
        url: 'https://avocadoweb.net',
        logo: '/sponsors/avocadoweb-services.png',
      },
      {
        name: 'Microsoft',
        url: 'https://www.microsoft.com',
        logo: '/sponsors/microsoft.png',
      },
      {
        name: 'SignLab',
        url: 'https://signlab.co',
        logo: '/sponsors/signlab.png',
      },
    ],
  },
  {
    tierLabel: 'Silver Sponsors',
    sponsors: [
      {
        name: 'Partners Interpreting',
        url: 'https://www.partnersinterpreting.com/',
        logo: '/sponsors/partners-interpreting.png',
      },
      {
        name: 'With Direction LLC',
        url: 'https://withdirection.co/',
        logo: '/sponsors/with-direction-llc.png',
      },
      {
        name: 'TWA Innovations',
        url: 'https://twainnovations.com',
        logo: '/sponsors/twa-innovations.png',
      },
      {
        name: 'Alangu GmbH',
        url: 'https://alangu.de',
        logo: '/sponsors/alangu.png',
      },
      {
        name: 'ASL Flurry',
        url: 'https://aslflurry.com/',
        logo: '/sponsors/asl-flurry.png',
      },
    ],
  },
  {
    tierLabel: 'Bronze Sponsors',
    sponsors: [
      {
        name: 'Nagish',
        url: 'https://nagish.com',
        logo: '/sponsors/nagish.png',
      },
      {
        name: 'Sorenson',
        url: 'https://sorenson.com',
        logo: '/sponsors/sorenson.png',
      },
    ],
  },
  {
    tierLabel: 'Friends of SLxAI',
    sponsors: [
      {
        name: 'GLWMax',
        url: 'https://glwmax.com',
        logo: '/sponsors/glwmax.png',
      },
    ],
  },
];
