/**
 * Program book copy for /2026: welcome letter and committee.
 * Edit this file to update public text (English source of truth).
 */

export const SUMMIT_2026_WELCOME_LETTER_PARAGRAPHS: string[] = [
  'Dear SLxAI Attendees,',
  'Welcome to SLxAI. I am honored to have you join us for this inaugural gathering focused on the future of sign language and artificial intelligence. This summit brings together researchers, developers, companies, organizations, and community leaders from around the world with a shared purpose, to collaborate, learn from one another, and move the field forward responsibly.',
  'SLxAI was created to provide a space for open dialogue and meaningful collaboration. The pace of innovation in sign language AI is accelerating, and with that progress comes both opportunity and responsibility. This summit is designed to encourage thoughtful discussion around ethics, deployment, benchmarks, data governance, accessibility, and real world impact. Most importantly, it is an opportunity to build relationships and strengthen collaboration across the global community.',
  'We are proud to welcome attendees representing diverse perspectives, experiences, and expertise. Your participation is what makes this gathering meaningful. Whether you are presenting, participating in discussions, demonstrating technology, or simply learning, your presence contributes to the collective progress we hope to achieve together.',
  'I would also like to extend sincere appreciation to our planning committee, bylaws committee, volunteers, interpreters, and sponsors. Their dedication and support made this summit possible. We are also deeply grateful to Boston University for hosting and supporting this inaugural event.',
  'Over the next two days, I encourage you to engage openly, ask questions, share ideas, and connect with one another. SLxAI is not just a conference. It is the beginning of a collaborative effort to shape the future of sign language and AI together.',
  'Thank you for being part of SLxAI. I look forward to the conversations, ideas, and partnerships that will emerge from this gathering.',
];

/** Closing line, name, role — rendered below the letter body. */
export const SUMMIT_2026_WELCOME_LETTER_SIGNATURE = {
  closing: 'Cheers,',
  name: 'Travis Dougherty',
  role: 'Chief Experience Officer, Signapse',
} as const;

/** Program book: Master of Ceremonies, Day 1 (Andrew Bottoms). */
export const SUMMIT_2026_MOC_ANDREW_BOTTOMS_BIO =
  'Andrew Bottoms is the Program Director of Deaf Studies at Boston University, where he provides strategic leadership in curriculum innovation, program development, and community engagement. He was instrumental in establishing the American Sign Language program at Harvard University, where he designed and advanced a comprehensive ASL curriculum that significantly expanded access to Deaf-centered education. He also teaches American Sign Language courses at the Massachusetts Institute of Technology (MIT).\n\n' +
  'A native ASL user from a Deaf family, Andrew brings a deeply rooted personal and cultural perspective to his work. His experiences drive a strong commitment to ensuring that Deaf children have full access to language and education, while embracing Deaf identity and community.\n\n' +
  "With over a decade of experience in ASL and Deaf Studies, Andrew's work is distinguished by his focus on ASL literature, storytelling, and transformative pedagogical approaches that move beyond traditional frameworks. He is dedicated to elevating Deaf cultural narratives while cultivating immersive and accessible learning environments for diverse communities.\n\n" +
  'His current work includes the development of initiatives centered on ASL storytelling, Deaf folklore, and community-based scholarship, with the aim of strengthening the relationship between academic institutions and the Deaf community.';

/** Program book: Master of Ceremonies, Day 2 (Dr. Barbara Spiecker). */
export const SUMMIT_2026_MOC_BARBARA_SPIECKER_BIO =
  'Barbara Spiecker (she/her) is a deaf marine ecologist whose research combines mathematical and statistical tools with experimental and field-based approaches to understand how marine communities respond to climate change and to strengthen the monitoring and management of marine habitats. She also serves as director of outreach and training at the Boston University Deaf Center and as co-founder and executive director of Atomic Hands, a nonprofit that makes science, technology, engineering, and mathematics (STEM) engaging and accessible through American Sign Language (ASL). She holds a Ph.D. in Integrative Biology from Oregon State University, an M.S. in Marine Biology from Northeastern University, and a B.S. in Biology from the Rochester Institute of Technology.';

export type Summit2026CommitteeMember = {
  name: string;
  organization: string;
  /** Public path under `/public`, e.g. `/summit-2026/photos/…` (same assets as workshop presenters where applicable). */
  photoUrl?: string | null;
  /** Optional crop/position tweaks for the headshot, matching workshop `photoImgClassName` when shared. */
  photoImgClassName?: string;
};

export const SUMMIT_2026_COMMITTEE_MEMBERS: Summit2026CommitteeMember[] = [
  {
    name: 'Joseph Brzezowski',
    organization: 'AvocadoWeb Services',
    photoUrl: '/summit-2026/photos/joseph-brzezowski.png',
    photoImgClassName: 'origin-top scale-[1.38] object-[66%_0]',
  },
  { name: 'Dr. Naomi Caselli', organization: 'Boston University', photoUrl: '/summit-2026/photos/naomi-caselli.png' },
  { name: 'Travis Dougherty', organization: 'Signapse', photoUrl: '/summit-2026/photos/travis-dougherty.png' },
  { name: 'Molly Glass', organization: 'Kara Technologies', photoUrl: '/summit-2026/photos/molly-glass.png' },
  {
    name: 'Andy Van Hoorebeke',
    organization: 'GLWMax',
    photoUrl: '/summit-2026/photos/andy-van-hoorebeke.png',
    photoImgClassName: 'scale-[1.45] object-top translate-y-2',
  },
  { name: 'Dr. Thomas P. Horejes', organization: 'SignWow', photoUrl: '/summit-2026/photos/thomas-horejes.png' },
  {
    name: 'Yeh Kim',
    organization: 'Kara Technologies',
    photoUrl: '/summit-2026/photos/yeh-jun-kim.png',
    photoImgClassName: 'object-top',
  },
  {
    name: 'Adam Munder',
    organization: 'Sorenson',
    photoUrl: '/summit-2026/photos/adam-munder.png',
    photoImgClassName: 'origin-top scale-[1.2] object-[56%_0]',
  },
  { name: 'Marcus Oaten', organization: 'Signapse', photoUrl: '/summit-2026/photos/marcus-oaten.png' },
  { name: 'Daniel Sommer', organization: 'Birnbaum Interpreting Services', photoUrl: '/summit-2026/photos/daniel-sommer.png' },
];
