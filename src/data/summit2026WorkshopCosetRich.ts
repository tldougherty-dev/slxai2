/**
 * Rich program-book content for CoSET SAFE AI workshop (coset-safe-ai-communication-success).
 * Source: submitter text; used for layout instead of a single verbatim block.
 */

export type CosetWorkshopPresenterDetail = {
  name: string;
  email: string;
  organization: string;
  bio: string;
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
    name: 'Tim Riker',
    email: 'tim.riker@coset.org',
    organization: 'CoSET',
    bio: 'Tim Riker is a Certified Deaf Interpreter, educator, and community advocate serving on the Coalition on Sign Language Equity in Technology (CoSET). He works at the intersection of Deaf-led design, language justice, and AI, advancing ethical, accessible technologies that center Deaf, DeafBlind, and multilingual communities through collaboration, research, and systems change.',
  },
  {
    name: 'Stephanie Kent',
    email: 'steph.kent@coset.org',
    organization: 'CoSET',
    bio: 'Steph is an action researcher of communication, interpreting and social change; and founder of the Learning Lab for Resiliency®.',
  },
  {
    name: 'Celena Ponce',
    email: 'celena.ponce@coset.org',
    organization: 'CoSET',
    bio: 'Celena Ponce holds a BS in Electrical Engineering with a focus in Digital Sign Processing and Masters in Electrical Engineering and Computer Science with a focus on sign language recognition. She runs a disability- and immigrant-forward nonprofit called Hands United.',
  },
  {
    name: 'Jeff Shaul',
    email: 'Jeff@sign-speak.com',
    organization: 'Sign-Speak',
    bio: 'Jeff Shaul is a Deaf backend engineer building sign language-first systems. At Sign-Speak, he develops production platforms for language technologies. His background spans large-scale data systems and software engineering. He is a part owner of Signapse and contributes to CoSET’s work on ethical evaluation frameworks for sign language AI.',
  },
];

/** Full workshop description (formerly proposal text). */
export const COSET_SAFE_AI_WORKSHOP_DESCRIPTION = `This 50-minute workshop will introduce the Coalition for Sign Language Equity in Technology (CoSET), giving an overview of who we are, what we’ve accomplished, and what we aim to do with sign languages and artificial intelligence (AI). We’ll describe the 3D Risk Framework introduced in the AI Interpreting Solutions Evaluation Toolkit Part A: Organization, Implementation, and Management and the Hazard Triangle and SAFE Zone which is illustrated in the Toolkit Part B: Technical Specifications. The presentation will include our Vision, Mission, and Purpose to institute an objective technical harness and innovative social testbed for the identification of risk factors that must be managed in communication technologies intended to provide language access in live, real-world human-to-human interactions. We will provide ample time for Q&A.`;

export const COSET_SAFE_AI_LEARNING_OBJECTIVE =
  'Participants will leave with a clearer framework for assessing systems, setting requirements, and communicating limitations responsibly.';
