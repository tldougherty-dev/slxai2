export const SIGNAL_NEWSLETTER_BRAND = 'SLxAI Signal';

export const SIGNAL_NEWSLETTER_SECTIONS = [
  {
    key: 'editors_note',
    label: "Editor's Note",
    placeholder: 'Welcome readers and set the theme for this issue…',
  },
  {
    key: 'community_highlights',
    label: 'Community Highlights',
    placeholder: 'News from the SLxAI community, partnerships, and milestones…',
  },
  {
    key: 'academy_updates',
    label: 'Academy Updates',
    placeholder: 'New workshops, presenters, and learning opportunities…',
  },
  {
    key: 'ai_in_sign_language',
    label: 'AI in Sign Language',
    placeholder: 'Ethical AI, accessibility, research, and industry developments…',
  },
  {
    key: 'events',
    label: 'Upcoming Events',
    placeholder: 'Summits, webinars, and community gatherings…',
  },
  {
    key: 'member_spotlight',
    label: 'Member Spotlight',
    placeholder: 'Highlight a member organization or individual…',
  },
  {
    key: 'closing',
    label: 'Closing',
    placeholder: 'Thank readers and share how to get involved…',
  },
] as const;

export type SignalNewsletterSectionKey = (typeof SIGNAL_NEWSLETTER_SECTIONS)[number]['key'];

export type SignalNewsletterContent = Record<SignalNewsletterSectionKey, string>;

export const EMPTY_SIGNAL_CONTENT: SignalNewsletterContent = {
  editors_note: '',
  community_highlights: '',
  academy_updates: '',
  ai_in_sign_language: '',
  events: '',
  member_spotlight: '',
  closing: '',
};

export type SignalNewsletterStatus = 'draft' | 'scheduled' | 'published';

export type SignalNewsletter = {
  id: string;
  slug: string;
  title: string;
  issueNumber: number | null;
  status: SignalNewsletterStatus;
  scheduledAt: Date | null;
  publishedAt: Date | null;
  content: SignalNewsletterContent;
  createdBy: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export function slugifyNewsletterTitle(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

export function defaultNewsletterTitle(issueNumber?: number): string {
  const n = issueNumber ? ` #${issueNumber}` : '';
  return `${SIGNAL_NEWSLETTER_BRAND}${n}`;
}
