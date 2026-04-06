/**
 * Rich program-book content for CoSET SAFE AI workshop (coset-safe-ai-communication-success).
 * Source: submitter text; used for layout instead of a single verbatim block.
 */

export type CosetWorkshopPresenterDetail = {
  name: string;
  /** Omit when no public email should be shown. */
  email?: string;
  /** Omit when the presenter has no organizational affiliation. */
  organization?: string;
  bio: string;
  /** Public path under `/public`, e.g. `/summit-2026/photos/…` */
  photoUrl?: string | null;
  /** Optional crop/position tweaks for the headshot. */
  photoImgClassName?: string;
};

export const COSET_SAFE_AI_WORKSHOP_SLUG = 'coset-safe-ai-communication-success' as const;

export const COSET_SAFE_AI_PRESENTER_DETAILS: CosetWorkshopPresenterDetail[] = [
  {
    name: 'Abraham Glasser',
    email: 'abraham.glasser@gallaudet.edu',
    organization: 'Gallaudet University',
    bio: 'Dr. Abraham Glasser is an Assistant Professor in the MS/PhD Accessible Human Centered Computing and Policy (AHCP) program at Gallaudet University. He is an active member of CoSET.',
  },
  {
    name: 'Stephanie Kent',
    email: 'steph.kent@coset.org',
    organization: 'CoSET',
    bio: 'Steph is an action researcher of communication, interpreting and social change; and founder of the Learning Lab for Resiliency®.',
  },
  {
    name: 'Erin Sanders-Sigmon',
    email: 'erinfran777@gmail.com',
    organization: 'CoSET',
    bio: 'Erin Sanders-Sigmon is a Deaf Interpreter (MCDHH DI, 2018). She is a filmmaker and justice advocate, and contributes to the Coalition on Sign Language Equity in Technology (CoSET).',
  },
  {
    name: 'Jeff Shaul',
    email: 'Jeff@sign-speak.com',
    organization: 'Sign-Speak',
    photoUrl: '/summit-2026/photos/jeff-shaul.png',
    bio: 'Jeff Shaul is a Deaf backend engineer building sign language–first systems. At Sign-Speak, he develops production platforms for language technologies. His background spans large-scale data systems and software engineering. He is a part owner of GoSign.AI and contributes to CoSET’s work on ethical evaluation frameworks for sign language AI. Using ASL and written English to communicate, he is currently based in Rochester, New York.',
  },
];

/** Full workshop description (formerly proposal text). */
export const COSET_SAFE_AI_WORKSHOP_DESCRIPTION = `This 50-minute workshop will introduce the Coalition for Sign Language Equity in Technology (CoSET), giving an overview of who we are, what we’ve accomplished, and what we aim to do with sign languages and artificial intelligence (AI). We’ll describe the 3D Risk Framework introduced in the AI Interpreting Solutions Evaluation Toolkit Part A: Organization, Implementation, and Management and the Hazard Triangle and SAFE Zone which is illustrated in the Toolkit Part B: Technical Specifications. The presentation will include our Vision, Mission, and Purpose to institute an objective technical harness and innovative social testbed for the identification of risk factors that must be managed in communication technologies intended to provide language access in live, real-world human-to-human interactions. We will provide ample time for Q&A.`;

export const COSET_SAFE_AI_LEARNING_OBJECTIVE =
  'Participants will leave with a clearer framework for assessing systems, setting requirements, and communicating limitations responsibly.';
