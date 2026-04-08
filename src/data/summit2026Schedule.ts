/**
 * Final SLxAI Summit Schedule — matches the published PDF
 * (Final SLxAI Summit Schedule - slxai_summit_schedule).
 */

export type SummitScheduleRow = {
  time: string;
  sessionType: string;
  title: string;
  presenters: string;
  /** When set, Session column links to /2026/workshop/:slug */
  workshopSlug?: string;
};

export type SummitScheduleDay = {
  dayLabel: string;
  /** Shown after the day label in the program book schedule table, e.g. April 16, 2026 */
  dayDate?: string;
  rows: SummitScheduleRow[];
};

export const SUMMIT_2026_SCHEDULE: SummitScheduleDay[] = [
  {
    dayLabel: 'Day 1',
    dayDate: 'April 16, 2026',
    rows: [
      {
        time: '8:45 AM to 8:50 AM',
        sessionType: 'Keynote',
        title: 'Welcome to SLxAI',
        presenters: 'Travis Dougherty',
      },
      {
        time: '8:50 AM to 9:00 AM',
        sessionType: 'Keynote',
        title: 'Opening Remarks From Boston University',
        presenters:
          'Associate Provost Azer Bestavros, Dean Penny Bishop, Dr. Naomi Caselli, Andrew Bottoms',
      },
      {
        time: '9:00 AM to 9:15 AM',
        sessionType: 'Keynote',
        title: 'Keynote: Breaking Communication Barriers',
        presenters: 'Ryan Hait Campbell, Convo',
        workshopSlug: 'keynote-breaking-communication-barriers',
      },
      { time: '9:15 AM to 9:20 AM', sessionType: 'Break', title: 'Break', presenters: '' },
      {
        time: '9:20 AM to 10:05 AM',
        sessionType: 'Panel',
        title: 'Ethics: Where Does It Stop?',
        presenters:
          'Dr. Naomi Caselli, Boston University; Dr. Maartje De Meulder, University of Applied Sciences Utrecht; Dr. Abraham Glasser, Gallaudet University; Adam Munder, Sorenson Communications; Dr. Thomas P. Horejes, SignWow',
        workshopSlug: 'ethics-where-does-it-stop',
      },
      { time: '10:05 AM to 10:15 AM', sessionType: 'Break', title: 'Break', presenters: '' },
      {
        time: '10:15 AM to 11:05 AM',
        sessionType: 'Panel',
        title: 'CoSET S.A.F.E. AI: Designing for Communication Success',
        presenters:
          'Dr. Abraham Glasser, Gallaudet University; Stephanie Jo Kent, CoSET; Erin Sanders-Sigmon, CoSET; Jeff Shaul, Sign-Speak',
        workshopSlug: 'coset-safe-ai-communication-success',
      },
      { time: '11:05 AM to 11:15 AM', sessionType: 'Break', title: 'Break', presenters: '' },
      {
        time: '11:15 AM to 12:00 PM',
        sessionType: 'Session',
        title:
          'Good Enough for Whom? Ethics, Power, and Accountability in Sign Language AI Deployment',
        presenters: 'Dr. Maartje De Meulder, University of Applied Sciences Utrecht',
        workshopSlug: 'good-enough-for-whom-ethics-power-accountability',
      },
      {
        time: '12:00 PM to 1:00 PM',
        sessionType: 'Lunch',
        title: 'Lunch: Sponsored by Alangu',
        presenters: 'Eleftherios Avramidis',
      },
      {
        time: '1:00 PM to 1:40 PM',
        sessionType: 'Session',
        title: 'Trust and Accountability in Sign Language AI Innovation',
        presenters: 'Dr. Melissa Smith, Rupert Dubler',
        workshopSlug: 'trust-and-accountability-sign-language-ai',
      },
      { time: '1:40 PM to 1:50 PM', sessionType: 'Break', title: 'Break', presenters: '' },
      {
        time: '1:50 PM to 2:30 PM',
        sessionType: 'Session',
        title: 'Human AI Collaboration in Sign Language Technology',
        presenters: 'Craig Radford, Brandon Dopf',
        workshopSlug: 'human-ai-collaboration-sign-language-technology',
      },
      { time: '2:30 PM to 2:40 PM', sessionType: 'Break', title: 'Break', presenters: '' },
      {
        time: '2:40 PM to 3:10 PM',
        sessionType: 'Session',
        title: 'Practical Applications of AI Sign Language Translation',
        presenters: 'Ben Saunders, Marcus Oaten',
        workshopSlug: 'practical-applications-ai-sl-translation',
      },
      {
        time: '3:10 PM to 3:40 PM',
        sessionType: 'Session',
        title: 'Beyond Gloss: A New Framework for Sign Language Data',
        presenters: 'Emanuele Chiusaroli, Manuel Granchelli',
        workshopSlug: 'beyond-gloss-framework-sign-language-data',
      },
      { time: '3:40 PM to 3:50 PM', sessionType: 'Break', title: 'Break', presenters: '' },
      {
        time: '3:50 PM to 4:20 PM',
        sessionType: 'Session',
        title: 'Bridging the Gap: Real Time AI Avatars and Sign Language Animation',
        presenters: 'Egehan Karabulut, Dr. Burak Uyanık',
        workshopSlug: 'bridging-gap-ai-avatars-sign-language-animation',
      },
      {
        time: '4:20 PM to 4:50 PM',
        sessionType: 'Session',
        title: 'A Better World, Driven by Technology, Shaped by the Deaf',
        presenters: 'Sławek Łuczywek, Ashod Derandonyan, Michał Plaza',
        workshopSlug: 'better-world-technology-shaped-by-deaf',
      },
      { time: '4:50 PM to 5:00 PM', sessionType: 'Break', title: 'Break', presenters: '' },
      {
        time: '5:00 PM to 5:20 PM',
        sessionType: 'Session',
        title: 'The Future of Sign Language Translation is Transcription',
        presenters: 'Dr. Amit Moryossef, Nagish',
        workshopSlug: 'future-sl-translation-is-transcription',
      },
    ],
  },
  {
    dayLabel: 'Day 2',
    dayDate: 'April 17, 2026',
    rows: [
      {
        time: '8:45 AM to 9:30 AM',
        sessionType: 'Session',
        title: 'Lessons from Dataset Creation for Sustainable Sign Language AI',
        presenters: 'Brian Birnbaum, Daniel Sommer',
        workshopSlug: 'lessons-dataset-creation-sustainable-sl-ai',
      },
      { time: '9:30 AM to 9:40 AM', sessionType: 'Break', title: 'Break', presenters: '' },
      {
        time: '9:40 AM to 10:25 AM',
        sessionType: 'Session',
        title: 'Research & Data Collection: Strengthening Validity Through Partnerships',
        presenters: 'Pamela Macias, University of Colorado Boulder',
        workshopSlug: 'research-data-collection-partnerships',
      },
      { time: '10:25 AM to 10:35 AM', sessionType: 'Break', title: 'Break', presenters: '' },
      {
        time: '10:35 AM to 11:10 AM',
        sessionType: 'Session',
        title: 'ASL, AI, and Authority: Centering Deaf ASL Experts in Language Technologies',
        presenters:
          'Elisa Abenchuchan Vita, Lisa Gelineau, Dr. Raychelle Harris, Shelley Oishi, TWA Innovations',
        workshopSlug: 'asl-ai-authority-deaf-experts',
      },
      { time: '11:10 AM to 11:20 AM', sessionType: 'Break', title: 'Break', presenters: '' },
      {
        time: '11:30 AM to 12:00 PM',
        sessionType: 'Session',
        title: 'Fireside Chat with Federal Communications Commission',
        presenters: 'Travis Dougherty, Suzy Rosen Singleton',
        workshopSlug: 'fireside-chat-fcc',
      },
      {
        time: '12:00 PM to 1:00 PM',
        sessionType: 'Lunch',
        title: 'Lunch: Sponsored by TCS Teams',
        presenters: 'Jessica Aiello, Kevin Bendickson',
      },
      {
        time: '1:00 PM to 1:50 PM',
        sessionType: 'Session',
        title: 'Intentional Design for SL Translation: AI and Hybrid Approaches',
        presenters: 'Noreen Wilson, Molly Glass, Yeh Kim, Kara Technologies',
        workshopSlug: 'intentional-design-sl-translation-hybrid',
      },
      { time: '1:50 PM to 2:00 PM', sessionType: 'Break', title: 'Break', presenters: '' },
      {
        time: '2:00 PM to 2:50 PM',
        sessionType: 'Session',
        title: 'Learning with Signers: Educational Applications of SLxAI',
        presenters:
          'Dr. Lee Kezar, Lorna Quandt, Athena Willis, Laurel Aichler, Gallaudet University',
        workshopSlug: 'learning-with-signers-educational-slxai',
      },
      { time: '2:50 PM to 3:00 PM', sessionType: 'Break', title: 'Break', presenters: '' },
      {
        time: '3:00 PM to 3:30 PM',
        sessionType: 'Session',
        title: 'EUD: Sign Language in the Era of Artificial Intelligence',
        presenters: 'Andy Van Hoorebeke, European Union of the Deaf',
        workshopSlug: 'eud-sign-language-era-ai',
      },
      {
        time: '3:30 PM to 4:00 PM',
        sessionType: 'Session',
        title: 'Sign Language AI and International Policy Spaces',
        presenters: 'Dr. Joseph J. Murray, World Federation of the Deaf',
        workshopSlug: 'sign-language-ai-international-policy',
      },
      { time: '4:00 PM to 4:10 PM', sessionType: 'Break', title: 'Break', presenters: '' },
      {
        time: '4:10 PM to 4:40 PM',
        sessionType: 'Session',
        title: 'A Linguistic Approach to Sign Language Data in AI Model Development',
        presenters: 'Dr. Naomi Caselli, Kaj Kraus',
        workshopSlug: 'linguistic-approach-sign-language-data-ai',
      },
      { time: '4:40 PM to 4:45 PM', sessionType: 'Break', title: 'Break', presenters: '' },
      {
        time: '4:45 PM to 4:55 PM',
        sessionType: 'Closing',
        title: 'The voting session to approve and adopt the bylaws, and final words.',
        presenters: 'Travis Dougherty, SLxAI',
      },
      {
        time: '4:55 PM to 5:10 PM',
        sessionType: 'Closing',
        title: 'Closing Remarks by Boston University',
        presenters: 'Distinguished Professor Yannis Paschalidis',
      },
    ],
  },
];

/** Day label, optional calendar date, and time range for a session linked from the published schedule. */
export function getWorkshopScheduleSlotForSlug(
  slug: string,
): { dayLabel: string; time: string; dayDate?: string } | undefined {
  for (const day of SUMMIT_2026_SCHEDULE) {
    for (const row of day.rows) {
      if (row.workshopSlug === slug) {
        return { dayLabel: day.dayLabel, time: row.time, dayDate: day.dayDate };
      }
    }
  }
  return undefined;
}
