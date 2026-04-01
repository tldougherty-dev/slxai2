/** Copy and structured data for /summit2027 sponsorship page */

export const CONTACT_EMAIL = 'contact@slxai.org';

/** Conference dates for SLxAI Summit 2027 (Miami, FL) */
export const SUMMIT_2027_DATES = 'April 20-21, 2027';

export type WhySponsorPoint = {
  title: string;
  body: string;
  /** Prefer a single line for the title pill (e.g. long phrase with &) */
  titleSingleLine?: boolean;
};

export const WHY_SPONSOR_POINTS: readonly WhySponsorPoint[] = [
  {
    title: 'Reach a high-value niche audience',
    body: 'Connect with professionals and organizations invested in sign language technology, accessibility, and responsible AI, not broad, untargeted traffic.',
  },
  {
    title: 'Meet researchers, founders, and decision makers',
    body: 'Engage people who shape product roadmaps, research agendas, and partnerships across industry and academia.',
  },
  {
    title: 'Align with ethical, inclusive innovation',
    body: 'Associate your brand with a summit that prioritizes Deaf leadership, accessibility, and thoughtful use of AI.',
  },
  {
    title: 'Showcase products to a focused community',
    body: 'Demonstrate tools and services to attendees who evaluate and implement sign language and accessibility solutions.',
  },
  {
    title: 'Support communication access & responsible AI',
    body: 'Demonstrate commitment to communication equity and standards that benefit Deaf and hard-of-hearing communities.',
    titleSingleLine: true,
  },
  {
    title: 'Visibility before, during, and after the summit',
    body: 'Benefit from recognition across digital channels, on-site touchpoints, and program materials surrounding the event.',
  },
];

export const AUDIENCE_CATEGORIES = [
  'AI and machine learning companies',
  'Sign language technology companies',
  'Universities and research labs',
  'Accessibility and interpreting organizations',
  'Public sector and policy leaders',
  'Deaf community advocates and ecosystem builders',
] as const;

export type TierId = 'title' | 'platinum' | 'gold' | 'silver';

export const SPONSORSHIP_TIERS: {
  id: TierId;
  name: string;
  price: string;
  /** Short line emphasizing how many sponsors are available at this tier */
  availability: string;
  benefits: string[];
  featured?: boolean;
}[] = [
  {
    id: 'title',
    name: 'Title Sponsor',
    price: '$150,000',
    featured: true,
    availability: 'Exclusive: only 1 Title sponsor for the entire summit',
    benefits: [
      '“Presented by” branding across summit materials',
      'Opening remarks opportunity',
      'Keynote introduction opportunity',
      'Largest logo placement across digital and print materials',
      '30x30 centerpiece exhibit included',
      '12 summit passes',
      'Recognition at reception and featured moments',
    ],
  },
  {
    id: 'platinum',
    name: 'Platinum Sponsor',
    price: '$50,000',
    availability: 'Limited: only 3 Platinum sponsors',
    benefits: [
      'Prominent logo placement',
      '20x20 exhibit included',
      'Panel or featured visibility opportunity',
      '6 summit passes',
      'Website and program recognition',
      'On-site signage recognition',
    ],
  },
  {
    id: 'gold',
    name: 'Gold Sponsor',
    price: '$20,000',
    availability: 'Limited: 10 Gold sponsors',
    benefits: [
      '20x10 exhibit included',
      '4 summit passes',
      'Logo on website and program',
      'On-site signage recognition',
    ],
  },
  {
    id: 'silver',
    name: 'Silver Sponsor',
    price: '$10,000',
    availability: 'Additional capacity: many Silver sponsors welcome',
    benefits: [
      '10x10 exhibit included',
      'Logo placement',
      '2 summit passes',
      'Website listing',
      'Program listing',
    ],
  },
];

export const ADD_ON_OPPORTUNITIES: { name: string; price: string }[] = [
  { name: 'Reception Sponsor', price: '$25,000' },
  { name: 'Lunch Sponsor Day 1', price: '$20,000' },
  { name: 'Lunch Sponsor Day 2', price: '$20,000' },
  { name: 'Badge Sponsor', price: '$15,000' },
  { name: 'Lanyard Sponsor', price: '$15,000' },
  { name: 'WiFi Sponsor', price: '$10,000' },
];

export const EXHIBIT_LEVELS: { name: string; price: string; benefits: string[] }[] = [
  {
    name: 'Academic/Nonprofit',
    price: '$1,000',
    benefits: [
      '10x10 exhibit space',
      'For eligible academic institutions and nonprofit organizations',
      'Company/organization listing',
      'Attendee visibility',
    ],
  },
  {
    name: 'Startup',
    price: '$1,500',
    benefits: [
      '10x10 exhibit space',
      'Located in exhibit halls across Biscayne Ballroom and Chopin Ballroom',
      'Company listing',
      'Attendee visibility',
      'Optional bundle with sponsorship',
    ],
  },
  {
    name: 'Standard',
    price: '$3,000',
    benefits: [
      '10x20 exhibit space',
      'Located in exhibit halls across Biscayne Ballroom and Chopin Ballroom',
      'Company listing',
      'Attendee visibility',
      'Optional bundle with sponsorship',
    ],
  },
  {
    name: 'Premium',
    price: '$6,000',
    benefits: [
      '20x20 exhibit space',
      'Located in exhibit halls across Biscayne Ballroom and Chopin Ballroom',
      'Company listing',
      'Attendee visibility',
      'Optional bundle with sponsorship',
    ],
  },
];
