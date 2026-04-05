/**
 * Program book copy for /2026: welcome letter, SLxAI story, and committee.
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

export const SUMMIT_2026_STORY_SLXAI_PARAGRAPHS: string[] = [
  'SLxAI began at the 2025 CSUN Assistive Technology Conference in California. Travis Dougherty attended while representing Migam.ai. During the event, he met with Sławek Łuczyński of Migam and Endre Elvestad of signlab.co. What was scheduled as a one hour meeting turned into a three hour conversation, supported by an outstanding interpreter who made a complex global discussion possible.',
  'During that conversation, perspectives were shared from across regions and organizations. The discussion centered on rapid advances in sign language and AI, emerging deployments, and growing concerns about risks. Themes surfaced around ethics, data governance, model accuracy, representation, and the potential harm of deploying systems without meaningful collaboration. It became clear that awareness needed to increase and that a shared space for dialogue was missing.',
  'After that meeting, Travis continued having similar conversations with other companies and organizations. Each discussion reinforced the same urgency. The people he met were incredible in their own ways, bringing unique perspectives, experiences, and dedication to the space. He felt blessed and honored to know each of them and grateful for their openness in sharing both opportunities and concerns. Those continued conversations built trust and momentum, and ultimately led to the realization that something larger needed to happen.',
  'Over the following months, Travis reflected on how to bring accountability to a fast moving field. Having previously hosted the 2023 and 2024 NASRA conferences, he recognized that convening leaders in one space could accelerate alignment. The idea formed to bring together organizations working in sign language and AI to collaborate on ethics, deployment practices, benchmarks, and responsible data governance.',
  'In November 2025, Travis convened a global virtual meeting. More than 100 representatives from over 60 organizations across 26 countries attended. The group agreed to work together and supported making an SLxAI summit possible. There was also strong support for forming bylaws to ensure continuity, neutrality, and long term governance.',
  'At the end of December, Travis met with Dr. Naomi Caselli to share the vision for SLxAI. Naomi offered to host the inaugural summit at Boston University. By January, Travis formed both the bylaws committee and the summit planning committee. Volunteers from around the world stepped forward to help shape the event and the organization.',
  'Within seven weeks, the summit sold out with five weeks still remaining. The waitlist continued to grow, and momentum quickly made it clear that planning for the following year would be necessary. The outpouring of global support demonstrated how strongly the community wanted a collaborative space focused on responsibility, innovation, and shared progress.',
  'What started as one unexpected three hour conversation became many more. Those conversations grew into a shared realization that the field needed collaboration, transparency, and accountability. SLxAI was created to bring those voices together and ensure the future of sign language and AI is shaped collectively. From one conversation to a global summit, SLxAI represents what happens when collaboration replaces competition and accountability becomes shared. The journey has just begun.',
];

/** Program book: Master of Ceremonies, Day 1 (Andrew Bottoms). */
export const SUMMIT_2026_MOC_ANDREW_BOTTOMS_BIO =
  'Andrew Bottoms is the Program Director of Deaf Studies at Boston University, where he provides strategic leadership in curriculum innovation, program development, and community engagement. He was instrumental in establishing the American Sign Language program at Harvard University, where he designed and advanced a comprehensive ASL curriculum that significantly expanded access to Deaf-centered education. He also teaches American Sign Language courses at the Massachusetts Institute of Technology (MIT).\n\n' +
  'A native ASL user from a Deaf family, Andrew brings a deeply rooted personal and cultural perspective to his work. His experiences drive a strong commitment to ensuring that Deaf children have full access to language and education, while embracing Deaf identity and community.\n\n' +
  "With over a decade of experience in ASL and Deaf Studies, Andrew's work is distinguished by his focus on ASL literature, storytelling, and transformative pedagogical approaches that move beyond traditional frameworks. He is dedicated to elevating Deaf cultural narratives while cultivating immersive and accessible learning environments for diverse communities.\n\n" +
  'His current work includes the development of initiatives centered on ASL storytelling, Deaf folklore, and community-based scholarship, with the aim of strengthening the relationship between academic institutions and the Deaf community.';

export type Summit2026CommitteeMember = {
  name: string;
  organization: string;
  /** Public path under `/public`, e.g. `/summit-2026/photos/…` (same assets as workshop presenters where applicable). */
  photoUrl?: string | null;
  /** Optional crop/position tweaks for the headshot, matching workshop `photoImgClassName` when shared. */
  photoImgClassName?: string;
};

export const SUMMIT_2026_COMMITTEE_MEMBERS: Summit2026CommitteeMember[] = [
  { name: 'Joseph Brzezowski', organization: 'AvocadoWeb Services', photoUrl: '/summit-2026/photos/joseph-brzezowski.png' },
  { name: 'Naomi Caselli', organization: 'Boston University', photoUrl: '/summit-2026/photos/naomi-caselli.png' },
  { name: 'Travis Dougherty', organization: 'Signapse', photoUrl: '/summit-2026/photos/travis-dougherty.png' },
  { name: 'Molly Glass', organization: 'Kara Technologies', photoUrl: '/summit-2026/photos/molly-glass.png' },
  {
    name: 'Andy Van Hoorebeke',
    organization: 'GLWMax',
    photoUrl: '/summit-2026/photos/andy-van-hoorebeke.png',
    photoImgClassName: 'scale-[1.45] object-top translate-y-2',
  },
  { name: 'Thomas Horejes', organization: 'SignWow', photoUrl: '/summit-2026/photos/thomas-horejes.png' },
  { name: 'Yeh Kim', organization: 'Kara Technologies', photoUrl: '/summit-2026/photos/yeh-jun-kim.png' },
  { name: 'Adam Munder', organization: 'Sorenson', photoUrl: '/summit-2026/photos/adam-munder.png' },
  { name: 'Marcus Oaten', organization: 'Signapse', photoUrl: '/summit-2026/photos/marcus-oaten.png' },
  { name: 'Daniel Sommer', organization: 'Birnbaum Interpreting Services', photoUrl: '/summit-2026/photos/daniel-sommer.png' },
];
