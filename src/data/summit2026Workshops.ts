/**
 * Summit 2026 workshop / panel program book entries.
 * Photos: set `photoUrl` to a path under /public when available; omit or null for placeholder.
 */

export type SummitWorkshopPresenter = {
  name: string;
  /** Role or credential line, e.g. PhD, Ed.D., CEO */
  title?: string;
  organization?: string;
  /** Optional program-book bio (shown when set) */
  bio?: string;
  /** Optional contact email (mailto link in program book) */
  email?: string;
  /** Public URL path e.g. /summit-2026/photos/ryan-h.jpg — null/undefined shows placeholder */
  photoUrl?: string | null;
};

export type Summit2026Workshop = {
  slug: string;
  sessionTitle: string;
  summary: string;
  /** One-line credit for list cards (matches former “Presenter(s):” line) */
  presentersLine: string;
  presenters: SummitWorkshopPresenter[];
};

export const SUMMIT_2026_WORKSHOPS: Summit2026Workshop[] = [
  {
    slug: 'keynote-breaking-communication-barriers',
    sessionTitle: 'Keynote Speaker Title: Breaking Communication Barriers',
    presentersLine: 'Presenter: Ryan Hait-Campbell, Convo Communications',
    summary:
      'Ryan will open the summit with a look back at the early commercial foundations of sign language and AI and how the ecosystem has evolved since then. He will also outline what the next phase demands from the field, including quality, trust, and real world usability.',
    presenters: [
      { name: 'Ryan Hait-Campbell', title: 'Presenter', organization: 'Convo Communications' },
    ],
  },
  {
    slug: 'ethics-where-does-it-stop',
    sessionTitle: 'Ethics: Where Does It Stop?',
    presentersLine:
      'Presenters: Dr. Abraham Glasser, PhD, Adam Munder, Thomas Horejes, Ph.D., CDI, Dr. Maartje De Meulder, Dr. Naomi Caselli',
    summary:
      'A panel on ethical boundaries and who carries responsibility when sign language AI systems are deployed at scale. Discussion will focus on power, consent, accountability, and what guardrails should be expected across research, product development, and procurement.',
    presenters: [
      { name: 'Dr. Abraham Glasser', title: 'PhD' },
      { name: 'Adam Munder' },
      { name: 'Thomas Horejes', title: 'Ph.D., CDI' },
      { name: 'Dr. Maartje De Meulder' },
      { name: 'Dr. Naomi Caselli' },
    ],
  },
  {
    slug: 'trust-and-accountability-sign-language-ai',
    sessionTitle: 'Trust and Accountability in Sign Language AI Innovation',
    presentersLine: 'Presenter: Dr. Melissa Smith, Ed.D., ASL Flurry',
    summary:
      'As sign language AI systems increasingly rely on large-scale video, translation, annotation, and written-language representations to train avatar and language models, trust between the Deaf community and technology companies has become a critical foundation for innovation. This workshop examines how trust is built and sustained across the full lifecycle of sign language AI development, from early, least-accurate models to real-world comprehension by diverse Deaf users. AI development requires more than data. It requires human expertise at multiple stages, including translation, cultural and linguistic annotation, video production, model review, and iterative feedback. Deaf professionals play essential roles across these stages, yet Deaf identity alone does not equate to expertise in all domains.',
    presenters: [
      { name: 'Dr. Melissa Smith', title: 'Ed.D.', organization: 'ASL Flurry' },
    ],
  },
  {
    slug: 'research-data-collection-partnerships',
    sessionTitle: 'Research and Data Collection: Strengthening Validity Through Partnerships',
    presentersLine: 'Presenter: Pamela Macias, University of Colorado Boulder',
    summary:
      "Data collection grounded in Deaf individuals' experiences can strengthen AI companies' credibility and accountability. Using a University of Colorado study on AI-generated ASL videos as an example, the session shows how university collaboration supports data quality, rigor, and ethical accountability—and highlights practices that center Deaf expertise in research.",
    presenters: [
      {
        name: 'Pamela Macias',
        organization: 'University of Colorado Boulder',
        email: 'pamela.macias@colorado.edu',
      },
    ],
  },
  {
    slug: 'intentional-design-sl-translation-hybrid',
    sessionTitle: 'Intentional Design for SL Translation: AI and Hybrid Approaches',
    presentersLine: 'Presenters: Noreen Wilson, Molly Glass, Yeh Jun Kim, Kara Technologies',
    summary:
      'This workshop explores when automated sign language translation and hybrid, human-in-the-loop approaches fit real-time Deaf access—from emergency and templated notifications to evolving communication needs. It compares automated, hybrid, and human-led models, and discusses quality, accountability, and realistic expectations in context.',
    presenters: [
      {
        name: 'Noreen Wilson',
        organization: 'Kara Technologies',
        email: 'noreen@kara.tech',
        bio: 'Noreen Wilson is the Chief Delivery Officer at Kara Technologies. As a CODA, bilingual in American and New Zealand Sign Languages, she brings a cross-cultural lens to inclusive technology. With a background in accessible resource leadership, sign language interpreting, and founding a translation company, she leads complex initiatives with a Deaf-first mindset and AI-supported solutions that bridge accessibility gaps.',
      },
      {
        name: 'Molly Glass',
        organization: 'Kara Technologies',
        email: 'molly@kara.tech',
        bio: 'Molly Glass is a CDI Translation Specialist and Project Coordinator at Kara Technologies, with expertise in signed language access within emerging technologies. She contributes to development and quality assurance of sign language translations, with a focus on usability, linguistic accuracy, and Deaf community needs. She holds certificates in Deaf Interpreting and Signed Language Translation from NTID.',
      },
      {
        name: 'Yeh Jun Kim',
        organization: 'Kara Technologies',
        email: 'yeh@kara.tech',
        bio: 'Yeh Jun Kim is an AI Sign Linguistics and Community Engagement Advisor at Kara Technologies. He brings experience in interpreting, translation, ASL and KSL teaching, and graduate research in language and communication. He supports evaluation and refinement of automated sign language translation through linguistic review, database quality, and human-in-the-loop workflows, centering Deaf and DeafDisabled communities.',
      },
    ],
  },
  {
    slug: 'lessons-dataset-creation-sustainable-sl-ai',
    sessionTitle: 'Lessons from Dataset Creation for Sustainable Sign Language AI',
    presentersLine: 'Presenters: Brian Birnbaum, Daniel Sommer, Birnbaum Interpreting Services',
    summary:
      'Lessons from large-scale sign language dataset work with interpreters: how early choices encode assumptions about labor, variation, and use; how those assumptions shape evaluation, product claims, and deployment; and how interpreter expertise in dataset and downstream decisions supports sustainable, responsible sign language AI.',
    presenters: [
      {
        name: 'Brian Birnbaum',
        organization: 'Birnbaum Interpreting Services',
        email: 'brian.birnbaum@bisworld.com',
        bio: 'Brian Birnbaum is a CODA whose father, David, was the first Deaf founder and owner of a nationwide sign language interpreting agency. He now runs Birnbaum Interpreting Services and has built a streamlined data aggregation platform from experience with Deaf access systems at scale, emphasizing ethical practice, professional sustainability, and responsible integration of emerging technologies into sign language access.',
      },
      {
        name: 'Daniel Sommer',
        organization: 'Birnbaum Interpreting Services',
        email: 'daniel.sommer@bisworld.com',
        bio: 'Daniel Sommer works at the intersection of accessibility, language, and AI-adjacent systems. He began in real-time and post-production captioning and now works in project management and technology across captioning, audio description, and ASL localization, with accessibility guiding system design and decision-making.',
      },
    ],
  },
  {
    slug: 'practical-applications-ai-sl-translation',
    sessionTitle: 'Practical Applications of AI Sign Language Translation',
    presentersLine: 'Presenters: Ben Saunders, Marcus Oaten, Signapse',
    summary:
      'AI sign language translation is advancing rapidly - but what does the Deaf community actually need from it? This workshop showcases Signapse\'s latest photo-realistic BSL and ASL generation technology, then opens a collaborative discussion on how it should be applied. Participants will explore which use cases (live translation, pre-recorded content, public information, and beyond) best serve Deaf communities, and how centering Deaf perspectives in AI and product development leads to technology that truly meets real-world needs.',
    presenters: [
      {
        name: 'Ben Saunders',
        organization: 'Signapse',
        bio: "Dr Ben Saunders is Co-Founder and Chief Scientist at Signapse, a UK-based company developing photo-realistic sign language translation using artificial intelligence. He completed his PhD in Artificial Intelligence at the University of Surrey's Centre for Vision, Speech and Signal Processing. His doctoral and postdoctoral research has focused on AI-generated sign language production, translating spoken or written input into continuous, human-like signed output in both British and American Sign Language.",
      },
      { name: 'Marcus Oaten', organization: 'Signapse' },
    ],
  },
  {
    slug: 'beyond-gloss-framework-sign-language-data',
    sessionTitle: 'Beyond Gloss: A New Framework for Sign Language Data',
    presentersLine: 'Presenters: Emanuele Chiusaroli, Marta Sanzari, Handy Signs',
    summary:
      'Beyond glosses: structured, machine-readable representations for sign languages. Most Sign Language Translation and Sign Language Processing pipelines rely on glosses as an intermediate representation between visual input and spoken-language text. However, glosses constitute an inherently lossy representation and are poorly suited to encode core properties of sign languages, such as non-manual markers, spatial indexing, and information structure. This session discusses structured, declarative, and multi-level representations that go beyond glosses, including a sparse, machine-readable schema for annotation, models, and applied systems.',
    presenters: [
      {
        name: 'Emanuele Chiusaroli',
        organization: 'Handy Signs',
        email: 'emanuele@handysigns.it',
        bio: 'Emanuele coordinates the development teams and handles funding. He is an experienced Project Manager and Scrum Master with 25 years of experience in Telco and 3 years in Enterprise Sales.',
      },
      { name: 'Marta Sanzari', organization: 'Handy Signs', email: 'marta@handysigns.it' },
    ],
  },
  {
    slug: 'bridging-gap-ai-avatars-sign-language-animation',
    sessionTitle: 'Bridging the Gap: Real Time AI Avatars and Sign Language Animation',
    presentersLine: 'Presenter: Dr. Burak Uyanık, Vosia.ai',
    summary:
      'This session introduces a novel approach to automated sign language generation from vosia.ai, including real-time, high-fidelity 3D sign language avatars. The discussion focuses on text-to-sign conversion, performance benchmarks, and challenges in processing authentic mimic and gesture nuances, together with community-informed design for accessible AI tools.',
    presenters: [
      {
        name: 'Dr. Burak Uyanık',
        organization: 'Vosia.ai',
        email: 'dr.buyanik@gmail.com',
        bio: 'Dr. Burak Uyanık is a Computer Engineer and a pioneering researcher at Vosia.ai. He holds the distinction of being the first Deaf person in Turkey to earn a PhD, having completed his doctoral studies in Computer Engineering at Kocaeli University. In addition to his role as a Lead Developer at a leading technology corporation, he serves as a core team member at Vosia.ai. Combining his high-level technical background with his native fluency in sign language, he leads our R&D efforts in accessible AI technologies.',
      },
    ],
  },
  {
    slug: 'better-world-technology-shaped-by-deaf',
    sessionTitle: 'A Better World, Driven by Technology, Shaped by the Deaf',
    presentersLine:
      'Presenters: Sławek Łuczywek, Ashod Derandonyan, and Michał Plaza, Migam.ai',
    summary:
      'Migam outlines how AI can transform sign language translation and interpretation when development is grounded in real communication challenges, using the migam.ai case study. The session stresses integrating Deaf colleagues and experts throughout the entire AI lifecycle—from design and data through testing, deployment, and ongoing dialogue with Deaf communities—so technology is shaped by Deaf expertise, not only powered by models.',
    presenters: [
      {
        name: 'Sławek Łuczywek',
        organization: 'Migam.ai',
        email: 'slawek.luczywek@migam.org',
      },
      { name: 'Ashod Derandonyan', organization: 'Migam.ai', email: 'ashod@migam.org' },
      { name: 'Michał Plaza', organization: 'Migam.ai', email: 'michal.plaza@migam.org' },
    ],
  },
  {
    slug: 'future-sl-translation-is-transcription',
    sessionTitle: 'The Future of Sign Language Translation is Transcription',
    presentersLine: 'Presenter: Dr. Amit Moryossef, Nagish',
    summary:
      'Sign language processing often stalls at the gap between video-based signing and text-based AI. This session presents SignWriting as a universal transcription layer that connects the two: enabling translation and generation in both directions, clarifying how NLP and computer vision can divide labor in sign language pipelines, and arguing that the right basic representation—including transcription—is central to evaluation, product design, and realistic expectations.',
    presenters: [
      {
        name: 'Dr. Amit Moryossef',
        organization: 'Nagish',
        email: 'amit@nagish.com',
        bio: 'Dr. Amit Moryossef is a researcher and entrepreneur in sign-language technology. He completed his Ph.D. at Bar-Ilan University and a postdoc at the University of Zurich. He founded sign.mt, a real-time sign-language translation platform, which was recently acquired by Nagish, where he now leads research. His work has received multiple best paper awards at ACL and EMNLP, focusing on making signed languages accessible through machine learning.',
      },
    ],
  },
  {
    slug: 'human-ai-collaboration-sign-language-technology',
    sessionTitle: 'Human AI Collaboration in Sign Language Technology',
    presentersLine: 'Presenters: Craig Radford, Brandon Dopf, 360 Direct Access',
    summary:
      'This workshop examines how people and AI can collaborate in real deployments without degrading service quality. It will cover practical patterns for hybrid delivery, reliability expectations, and what breaks when organizations treat AI as a full replacement.',
    presenters: [
      {
        name: 'Craig Radford',
        organization: '360 Direct Access',
        email: 'craig@360directaccess.com',
        bio: `Craig Radford is a nationally recognized business leader, motivational speaker, and cofounder and CEO of 360 Direct Access. With over 25 years of experience advancing communication equity, he has pioneered innovations in Video Relay Service (VRS), Video Remote Interpreting (VRI), and Direct Video Calling (DVC).

A serial entrepreneur with three successful exits including one nearing $1 billion, Craig has been featured in Forbes, Business Insider, and CNN. He also serves as Executive Director of USA Deaf Basketball, preparing U.S. national teams for the 2025 Deaflympics. Previously, he was on the coaching staff for the USA Deaf Men's Basketball Team, where he helped lead the team to a gold medal in one year and a silver medal in another.`,
      },
      { name: 'Brandon Dopf', organization: '360 Direct Access', email: 'brandon@360directaccess.com' },
    ],
  },
  {
    slug: 'learning-with-signers-educational-slxai',
    sessionTitle: 'Learning with Signers: Educational Applications of SLxAI',
    presentersLine:
      'Presenters: Dr. Lee Kezar, Dr. Lorna Quandt, Dr. Athena Willis, Laurel Aichler, Gallaudet University',
    summary:
      'Researchers in educational neuroscience and SLxAI discuss how to make AI-assisted learning more accessible to students who use sign language—through collaboration among teachers, students, researchers, and systems. Topics include augmented reality interface design, domain-specific terms in sign language models, and evaluating student outcomes.',
    presenters: [
      {
        name: 'Dr. Lee Kezar',
        organization: 'Gallaudet University',
        email: 'lee.kezar@gallaudet.edu',
        bio: 'Dr. Lee Kezar is a computer scientist and postdoctoral researcher at Gallaudet University with a focus on linguistically informed machine learning models of American Sign Language.',
      },
      {
        name: 'Dr. Lorna Quandt',
        title: 'Ph.D.',
        organization: 'Gallaudet University',
        email: 'lorna.quandt@gallaudet.edu',
        bio: 'Dr. Lorna Quandt is an associate professor of Educational Neuroscience at Gallaudet University. Her work examines how emerging technologies can facilitate education for sign language users at the intersection of learning science and neuroscience.',
      },
      {
        name: 'Dr. Athena Willis',
        organization: 'Independent researcher',
        email: 'athena.s.willis@gmail.com',
        bio: 'Dr. Athena Willis is an independent researcher in HCI and educational neuroscience, focusing on the design and evaluation of AI and augmented reality systems that collaborate with signing users for intellectual and language development.',
      },
      {
        name: 'Laurel Aichler',
        organization: 'Gallaudet University',
        email: 'laurel.aichler@gallaudet.edu',
        bio: 'Laurel Aichler is a doctoral student in Educational Neuroscience at Gallaudet and a research assistant in the Action and Brain Lab. She holds an M.A. in Linguistics (sign languages) and was an ASL interpreter for about a decade, with work on STEM learning for signing users.',
      },
    ],
  },
  {
    slug: 'good-enough-for-whom-ethics-power-accountability',
    sessionTitle:
      'Good Enough for Whom? Ethics, Power, and Accountability in Sign Language AI Deployment',
    presentersLine:
      'Presenter: Dr. Maartje De Meulder, HU University of Applied Sciences Utrecht (Hogeschool Utrecht)',
    summary:
      'Sign language AI risks to be deployed before it is linguistically, socially, and culturally ready, and once a system is seen as "good enough", institutions may treat it as default access – quietly reshaping choices, standards, and rights in practice. This workshop argues that technical and commercial decisions become standards: dataset provenance and inclusion rules determine what signing becomes learnable by AI; benchmarks define "quality"; and procurement contracts define what counts as "supported language" and "sufficient access".',
    presenters: [
      {
        name: 'Dr. Maartje De Meulder',
        organization: 'HU University of Applied Sciences Utrecht (Hogeschool Utrecht)',
        bio: 'Dr. Maartje De Meulder combines Deaf Studies, language policy, and the wider social sciences to make sense of how language technologies meet deaf lives – with a particular focus on sign language AI. She is interested in how technological affordances shape language, communication, and access, and how deaf people use these technologies in their everyday lives. Alongside her academic work, she regularly collaborates with deaf organisations, interpreting professionals, and technology stakeholders to help the think critically about key questions surrounding ethics, access, and governance of language technologies. Across her work, she aims to build bridges between research, policy and practice: developing concepts and evidence that make sense to deaf communities themselves, while also challenging dominant assumptions about “access” and “inclusion” in tech development, education, and public services.',
      },
    ],
  },
  {
    slug: 'linguistic-approach-sign-language-data-ai',
    sessionTitle: 'A Linguistic Approach to Sign Language Data in AI Model Development',
    presentersLine: 'Presenters: Dr. Naomi Caselli, Dr. Kaj Kraus, Boston University',
    summary:
      'This session brings a linguistic lens to data design for sign language AI, including what must be captured to represent the language faithfully. It will connect linguistic structure to practical annotation and modeling choices that affect performance and usability.',
    presenters: [
      { name: 'Dr. Naomi Caselli', organization: 'Boston University' },
      { name: 'Dr. Kaj Kraus', organization: 'Boston University' },
    ],
  },
  {
    slug: 'asl-ai-authority-deaf-experts',
    sessionTitle: 'ASL, AI, and Authority: Centering Deaf ASL Experts in Language Technologies',
    presentersLine:
      'Presenters: Elisa Abenchuchan Vita, Lisa Gelineau, Raychelle Harris, PhD, Shelley Oishi, TWA Innovations LLC',
    summary:
      'American Sign Language is often treated as a technical problem rather than a living language shaped by history, pedagogy, and community practice. This session argues that putting Deaf signers on camera is not the same as placing Deaf ASL experts in leadership—and examines documentation labor, governance, and ethical ASL–AI work that centers authority, not token inclusion.',
    presenters: [
      {
        name: 'Elisa Abenchuchan Vita',
        organization: 'TWA Innovations LLC',
        email: 'hello@truewayasl.com',
        bio: 'Elisa Abenchuchan Vita brings expertise in ASL linguistics, education, and language learning. As ASL Dictionary Curator and Project Manager for the TWA Dictionary, she leads linguistic research, community-used sign documentation, filming, and entries for accuracy and accessibility as ASL resources intersect with AI.',
      },
      {
        name: 'Lisa Gelineau',
        organization: 'TWA Innovations LLC',
        email: 'hello@truewayasl.com',
        bio: 'Lisa Gelineau brings decades of experience in ASL education, proficiency evaluation, and curriculum development. She is co-founder of TWA Innovations and a professor at Austin Community College, focused on how technology—including AI—can support rather than oversimplify signed languages.',
      },
      {
        name: 'Raychelle Harris',
        title: 'PhD',
        organization: 'TWA Innovations LLC',
        email: 'hello@truewayasl.com',
        bio: 'Raychelle Harris is a Deaf ASL educator and co-owner of TWA Innovations, with academic leadership for the TWA Textbook, Dictionary, and Academy. Her work focuses on ASL teaching methods, assessment, ethical representation of signed languages in digital systems, and Deaf-led expert authority in emerging technologies.',
      },
      {
        name: 'Shelley Oishi',
        organization: 'TWA Innovations LLC',
        email: 'hello@truewayasl.com',
        bio: 'Shelley Oishi is CEO of TWA Innovations, advancing accessible, language-centered technology for the Deaf community across the TWA Textbook, Dictionary, and Academy. She focuses on responsible integration of AI into sign language resources with linguistic accuracy and ethical design.',
      },
    ],
  },
  {
    slug: 'eud-sign-language-era-ai',
    sessionTitle: 'EUD: Sign Language in the Era of Artificial Intelligence',
    presentersLine: 'Presenter: Andy Van Hoorebeke, European Union of the Deaf',
    summary:
      'The European Union of the Deaf outlines its perspective on sign language in the AI era: building on EUD’s AI-related work to shape policy recommendations for EU institutions so deaf sign language users’ rights are reflected in the AI Act and related digital legislation.',
    presenters: [{ name: 'Andy Van Hoorebeke', organization: 'European Union of the Deaf' }],
  },
  {
    slug: 'sign-language-ai-international-policy',
    sessionTitle: 'Sign Language AI and International Policy Spaces',
    presentersLine: 'Presenter: Dr. Joseph J. Murray, World Federation of the Deaf',
    summary:
      'A global policy session on how sign language AI is showing up in international forums, standards discussions, and advocacy work. Attendees will learn what issues are emerging and how to participate responsibly across countries and sign languages.',
    presenters: [{ name: 'Dr. Joseph J. Murray', organization: 'World Federation of the Deaf' }],
  },
  {
    slug: 'fireside-chat-fcc',
    sessionTitle: 'Fireside Chat with Federal Communications Commission',
    presentersLine: 'Featuring: Travis Dougherty, Signapse; Suzy Rosen Singleton, Federal Communications Commission',
    summary:
      'A fireside discussion on AI regulation from a U.S. government perspective, the emergency wireless act, and upcoming rulings relevant to the SLxAI industry—plus practical implications for accessibility policy and the sign language technology ecosystem.',
    presenters: [
      {
        name: 'Travis Dougherty',
        title: 'Chief Experience Officer',
        organization: 'Signapse',
        bio: 'Travis Dougherty is Chief Experience Officer at Signapse. He previously spent five years with Maryland Relay for Telecommunications Access of Maryland, served the National Association of State Relay Administrators (NASRA) in several leadership roles—including Member at Large, Vice Chair, and Chair—and worked with state and federal agencies. He participated in the Deaf and Hard of Hearing Consumer Advocacy Network (DHHCAN), the Safe AI Taskforce, and the FCC Disability Advisory Committee (5th term). He coauthored “Virginia Relay Digital Modernization” (January 2026).',
      },
      {
        name: 'Suzy Rosen Singleton',
        organization: 'Federal Communications Commission',
        bio: 'Suzy Rosen Singleton, a native user of American Sign Language, is Chief of the Disability Rights Office in the Consumer and Governmental Affairs Bureau of the Federal Communications Commission (since 2012). Her career includes civil rights litigation, government affairs for the National Association of the Deaf, special education compliance at the U.S. Department of Education, and ombuds work at Gallaudet University. She holds a J.D. from UCLA School of Law.',
      },
    ],
  },
  {
    slug: 'coset-safe-ai-communication-success',
    sessionTitle: 'CoSET SAFE AI: Designing for Communication Success',
    presentersLine:
      'Presenters: Dr. Abraham Glasser, PhD, Tim Riker, Stephanie Jo Kent, Celena Ponce, Jeffrey Shaul',
    summary:
      'A structured session introducing the CoSET SAFE AI approach and how it can be used to evaluate communication outcomes, safety, and reliability. Participants will leave with a clearer framework for assessing systems, setting requirements, and communicating limitations responsibly.',
    presenters: [
      { name: 'Dr. Abraham Glasser', title: 'PhD' },
      { name: 'Tim Riker' },
      { name: 'Stephanie Jo Kent' },
      { name: 'Celena Ponce' },
      { name: 'Jeffrey Shaul' },
    ],
  },
];

export function getSummit2026WorkshopBySlug(slug: string | undefined): Summit2026Workshop | undefined {
  if (!slug) return undefined;
  return SUMMIT_2026_WORKSHOPS.find((w) => w.slug === slug);
}
