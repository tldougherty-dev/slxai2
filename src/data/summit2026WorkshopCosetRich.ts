/**
 * Rich program-book content for CoSET S.A.F.E. AI workshop (coset-safe-ai-communication-success).
 * Source: submitter text; used for layout instead of a single verbatim block.
 */

export type CosetWorkshopPresenterDetail = {
  name: string;
  title?: string;
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
    title: 'Co-Director, Deaf and Hard of Hearing Technology Rehabilitation Engineering Research Center',
    email: 'abraham.glasser@gallaudet.edu',
    organization: 'Gallaudet University',
    photoUrl: '/summit-2026/photos/abraham-glasser.png',
    bio: 'Dr. Abraham Glasser is a faculty member in the Accessible Human-Centered Computing and Policy program at Gallaudet University, where he is also co-director of the Rehabilitation Engineering Research Center on Technology for the Deaf and Hard of Hearing (DHH RERC). He is a member of the Coalition for Sign Language Equity in Technology (CoSET), has contributed to published resources supporting standards work including AI-based interpreting, and serves on committees and working groups including WFD and W3C. Overall, he and his students conduct Human Computer Interaction (HCI) research involving AI, immersive technologies, and accessible computing for Deaf and Hard of Hearing users.',
  },
  {
    name: 'Stephanie Jo Kent',
    email: 'steph.kent@coset.org',
    organization: 'CoSET',
    photoUrl: '/summit-2026/photos/stephanie-kent.png',
    bio: 'Steph is an action researcher of communication, interpreting, and social change; and founder of the Learning Lab for Resiliency®.',
  },
  {
    name: 'Erin Sanders-Sigmon',
    email: 'erinfran777@gmail.com',
    organization: 'CoSET',
    photoUrl: '/summit-2026/photos/erin-sanders-sigmon.png',
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

/** Publication-style titles for italics in the workshop description (CoSET S.A.F.E. AI). */
export const COSET_AI_TOOLKIT_PART_A_TITLE =
  'AI Interpreting Solutions Evaluation Toolkit Part A: Organization, Implementation, and Management';
export const COSET_AI_TOOLKIT_PART_B_TITLE = 'Toolkit Part B: Technical Specifications';

/** Plain text segments around the italic toolkit titles (see CosetWorkshopProgramSections). */
export const COSET_SAFE_AI_WORKSHOP_DESCRIPTION_LEAD =
  'This 50-minute workshop will introduce the Coalition for Sign Language Equity in Technology (CoSET), giving an overview of who we are, what we’ve accomplished, and what we aim to do with sign languages and artificial intelligence (AI). We’ll describe the 3D Risk Framework introduced in the ';
export const COSET_SAFE_AI_WORKSHOP_DESCRIPTION_MIDDLE =
  ' and the Hazard Triangle and S.A.F.E. Zone which will be illustrated in the ';
export const COSET_SAFE_AI_WORKSHOP_DESCRIPTION_TAIL =
  '. The presentation will include our Vision, Mission, and Purpose to institute an objective technical harness and innovative social testbed for the identification of risk factors that must be managed in communication technologies intended to provide language access in live, real-world human-to-human interactions. We will provide ample time for Q&A.';

export const COSET_SAFE_AI_LEARNING_OBJECTIVE =
  'Participants will consider the analytical lens of sociotechnical systems as the benchmarking risk framework for metrics related to automated interpreting.';
