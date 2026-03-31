/** Copy and structured data for /summit2027 sponsorship page */

export const CONTACT_EMAIL = 'contact@slxai.org';

export const WHY_SPONSOR_POINTS = [
  {
    title: 'Reach a high-value niche audience',
    body: 'Connect with professionals and organizations invested in sign language technology, accessibility, and responsible AI—not broad, untargeted traffic.',
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
    title: 'Support communication access and responsible AI',
    body: 'Demonstrate commitment to communication equity and standards that benefit Deaf and hard-of-hearing communities.',
  },
  {
    title: 'Visibility before, during, and after the summit',
    body: 'Benefit from recognition across digital channels, on-site touchpoints, and program materials surrounding the event.',
  },
] as const;

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
    availability: 'Exclusive — only 1 Title sponsor for the entire summit',
    benefits: [
      '“Presented by” branding across summit materials',
      'Opening remarks opportunity',
      'Keynote introduction opportunity',
      'Largest logo placement across digital and print materials',
      'Premium exhibit presence',
      '8 summit passes',
      'Recognition at reception and featured moments',
    ],
  },
  {
    id: 'platinum',
    name: 'Platinum Sponsor',
    price: '$50,000',
    availability: 'Limited — only 3 Platinum sponsors',
    benefits: [
      'Prominent logo placement',
      'Premium exhibit presence',
      'Panel or featured visibility opportunity',
      '5 summit passes',
      'Website and program recognition',
      'On-site signage recognition',
    ],
  },
  {
    id: 'gold',
    name: 'Gold Sponsor',
    price: '$20,000',
    availability: 'Limited — 10 Gold sponsors',
    benefits: [
      'Exhibit space included',
      '3 summit passes',
      'Logo on website and program',
      'On-site signage recognition',
    ],
  },
  {
    id: 'silver',
    name: 'Silver Sponsor',
    price: '$10,000',
    availability: 'Additional capacity — many Silver sponsors welcome',
    benefits: [
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
  { name: 'Program Sponsor', price: '$10,000' },
];

export const EXHIBIT_LEVELS: { name: string; price: string; benefits: string[] }[] = [
  {
    name: 'Startup Exhibit',
    price: '$3,000',
    benefits: ['Tabletop exhibit space', 'Company listing', 'Attendee visibility', 'Optional bundle with sponsorship'],
  },
  {
    name: 'Standard Exhibit',
    price: '$5,000',
    benefits: ['Tabletop exhibit space', 'Company listing', 'Attendee visibility', 'Optional bundle with sponsorship'],
  },
  {
    name: 'Premium Exhibit',
    price: '$7,500',
    benefits: ['Tabletop exhibit space', 'Company listing', 'Attendee visibility', 'Optional bundle with sponsorship'],
  },
];

export const DIFFERENTIATORS = [
  {
    title: 'Cross-sector focus on sign language and AI',
    body: 'A rare gathering that centers sign language, Deaf communities, and AI in one program—rather than spreading attention across generic “tech for good” themes.',
  },
  {
    title: 'Deaf leadership and participation',
    body: 'Community voices help shape conversations on ethics, access, and implementation—not as an afterthought, but as core to the agenda.',
  },
  {
    title: 'Technical, ethical, and real-world implementation',
    body: 'Sessions bridge research, product, policy, and practice so sponsors can connect technical depth with deployable outcomes.',
  },
  {
    title: 'Partnerships and ecosystem visibility',
    body: 'The summit is structured to spark long-term collaboration among companies, labs, advocates, and implementers.',
  },
] as const;

export const FAQ_ITEMS: { q: string; a: string }[] = [
  {
    q: 'Who should sponsor SLxAI?',
    a: 'Organizations that want to support ethical sign language and AI innovation while reaching researchers, product leaders, accessibility professionals, and Deaf community stakeholders. Technology companies, universities, foundations, and service providers are all strong fits.',
  },
  {
    q: 'Can we customize a sponsorship package?',
    a: 'Yes. We work with sponsors to combine tiers, add-ons, and exhibit space to meet your goals. Contact contact@slxai.org to discuss options.',
  },
  {
    q: 'Are exhibit opportunities available separately?',
    a: 'Exhibit packages can be purchased on their own or bundled with sponsorship. We can recommend the best fit based on your visibility and engagement objectives.',
  },
  {
    q: 'How many passes are included with each level?',
    a: 'Pass counts vary by tier (for example, Title includes 8 passes, Platinum 5, Gold 3, Silver 2). Exact counts are listed on each sponsorship card above. Custom packages can adjust pass allocations when appropriate.',
  },
  {
    q: 'Who do we contact for sponsorship questions?',
    a: 'Email contact@slxai.org for sponsorship inquiries, prospectus requests, and custom partnership discussions. We typically respond within a few business days.',
  },
];
