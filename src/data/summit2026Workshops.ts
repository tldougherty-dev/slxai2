/**
 * Summit 2026 workshop / panel program book entries.
 * Photos: set `photoUrl` to a path under /public when available; omit or null for placeholder.
 */

import { SUMMIT_2026_SCHEDULE } from '@/data/summit2026Schedule';
import { TRUST_AND_ACCOUNTABILITY_ADDITIONAL_INFORMATION } from '@/data/summit2026TrustWorkshopAdditionalInformation';

export type SummitWorkshopPresenter = {
  name: string;
  /** Role or credential line, e.g. PhD, Ed.D., CEO */
  title?: string;
  organization?: string;
  /** Optional program-book bio (shown when set) */
  bio?: string;
  /** Optional contact email (mailto link in program book) */
  email?: string;
  /** Public URL path e.g. /summit-2026/photos/ryan-h.jpg; null/undefined shows placeholder */
  photoUrl?: string | null;
};

export type Summit2026Workshop = {
  slug: string;
  sessionTitle: string;
  summary: string;
  /** One-line credit for list cards (matches former “Presenter(s):” line) */
  presentersLine: string;
  presenters: SummitWorkshopPresenter[];
  /** Optional extra section after presenters on the program book workshop page */
  additionalInformation?: string;
};

export const SUMMIT_2026_WORKSHOPS: Summit2026Workshop[] = [
  {
    slug: 'keynote-breaking-communication-barriers',
    sessionTitle: 'Keynote Speaker Title: Breaking Communication Barriers',
    presentersLine: 'Presenter: Ryan Hait-Campbell, Convo Communications',
    summary:
      'Ryan will open the summit with a look back at the early commercial foundations of sign language and AI and how the ecosystem has evolved since then. He will also outline what the next phase demands from the field, including quality, trust, and real world usability.',
    presenters: [
      {
        name: 'Ryan Hait-Campbell',
        title: 'Presenter',
        organization: 'Convo Communications',
        photoUrl: '/summit-2026/photos/ryan-hait-campbell.png',
      },
    ],
  },
  {
    slug: 'ethics-where-does-it-stop',
    sessionTitle: 'Ethics: Where Does It Stop?',
    presentersLine:
      'Presenters: Dr. Abraham Glasser, PhD, Gallaudet University; Adam Munder, Sorenson Communications; Thomas Horejes, Ph.D., CDI, SignWow; Dr. Maartje De Meulder, University of Applied Sciences Utrecht; Dr. Naomi Caselli, Boston University',
    summary:
      'A panel on ethical boundaries and who carries responsibility when sign language AI systems are deployed at scale. Discussion will focus on power, consent, accountability, and what guardrails should be expected across research, product development, and procurement.',
    presenters: [
      { name: 'Dr. Abraham Glasser', title: 'PhD', organization: 'Gallaudet University' },
      { name: 'Adam Munder', organization: 'Sorenson Communications' },
      { name: 'Thomas Horejes', title: 'Ph.D., CDI', organization: 'SignWow' },
      { name: 'Dr. Maartje De Meulder', organization: 'University of Applied Sciences Utrecht' },
      { name: 'Dr. Naomi Caselli', organization: 'Boston University' },
    ],
  },
  {
    slug: 'trust-and-accountability-sign-language-ai',
    sessionTitle: 'Trust and Accountability in Sign Language AI Innovation',
    presentersLine: 'Presenters: Dr. Melissa Smith, Ed.D., and Rupert Dubler, ASL Flurry',
    summary: `As sign language AI systems increasingly rely on large-scale video, translation, annotation, and written-language representations to train avatar and language models, trust between the Deaf community and technology companies has become a critical foundation for innovation. This workshop examines how trust is built and sustained across the full lifecycle of sign language AI development, from early, least-accurate models to real-world comprehension by diverse Deaf users.

AI development requires more than data. It requires human expertise at multiple stages, including translation, cultural and linguistic annotation, video production, model review, and iterative feedback. Deaf professionals play essential roles across these stages, yet Deaf identity alone does not equate to expertise in all domains.

Trust, Leadership, and Human Infrastructure
Trust within the Deaf community is built over decades through accountability, relationships, and respect for language and culture. Technology companies, however, often operate on rapid development timelines. This workshop explores how leadership, vetting, and organizational infrastructure can bridge these differing expectations while supporting responsible innovation.

Equity and Access
More than 80% of Deaf and hard of hearing individuals in the United States experience early language deprivation, affecting comprehension, education, and access. Without intentional design and review, sign language AI risks serving only highly bilingual or academically elite users. This workshop emphasizes that "getting it right" requires designing for comprehension, not just accuracy.`,
    presenters: [
      {
        name: 'Dr. Melissa Smith',
        title: 'Ed.D.',
        organization: 'ASL Flurry',
        photoUrl: '/summit-2026/photos/melissa-smith.png',
        bio: `Melissa, a professor emeritus and former director of the ASL-English interpreting program at Palomar College (1997–2021), holds a doctorate and master's in Teaching and Learning from UC San Diego. Her research on interpreters in public schools was published by Gallaudet University Press.

With a background in education, language acquisition, and interpreting, she brings a multidimensional perspective to her work. As a parent of a Deaf young adult and former foster parent to Deaf children, her passion for sign language education is deeply personal, driving her commitment to building meaningful connections and accessibility.`,
      },
      {
        name: 'Rupert Dubler',
        organization: 'ASL Flurry',
        photoUrl: '/summit-2026/photos/rupert-dubler.png',
        bio: `For over a decade, I have worked at the intersection of accessible technology, workforce readiness, and the Deaf community. My experience includes interpreting for governors, mayors, and the White House, managing multimillion-dollar relay operations, directing federal grant programs, and designing ASL-first curriculum grounded in universal design.

I co-developed the Deaf Interpreting Workshop, delivering more than 500 hours of CDI training across seven states, and contributed to expanding the national pipeline.

Today I lead AI partnership strategy and sign language data initiatives at ASL Flurry, connecting large ASL media libraries with enterprise AI partners. I am a retired Certified Deaf Interpreter whose work has been covered nationally and cited in the NAD v. Trump lawsuit, and I continue advancing professional standards in the field.`,
      },
    ],
    additionalInformation: TRUST_AND_ACCOUNTABILITY_ADDITIONAL_INFORMATION,
  },
  {
    slug: 'research-data-collection-partnerships',
    sessionTitle: 'Research and Data Collection: Strengthening Validity Through Partnerships',
    presentersLine: 'Presenter: Pamela Macias, University of Colorado Boulder',
    summary:
      "Data collection grounded in Deaf individuals' experiences can strengthen AI companies' credibility and accountability. Using a University of Colorado study on AI-generated ASL videos as an example, the session shows how university collaboration supports data quality, rigor, and ethical accountability, and highlights practices that center Deaf expertise in research.",
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
      'This workshop explores when automated sign language translation and hybrid, human-in-the-loop approaches fit real-time Deaf access, from emergency and templated notifications to evolving communication needs. It compares automated, hybrid, and human-led models, and discusses quality, accountability, and realistic expectations in context.',
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
    summary: `AI sign language translation is advancing rapidly, but how does the Deaf community actually want to see it used? This workshop showcases Signapse's latest photo-realistic BSL and ASL translation technology, from the Text to Sign pipeline through to real-world deployments. Through real-world examples, we'll highlight what the technology is capable of today and where its current limitations lie.

Participants will explore which use cases best serve Deaf communities and which are gaining the most commercial traction, including SignStream for real-time translation in live environments, and SignStudio for translating post-production video content. With case studies from streaming, HR training and enterprise, we'll discuss what practical, scalable sign language accessibility looks like. We'll also examine how Signapse works with the Deaf community throughout AI and product development, and the path forward for "closed signing" to become as standard as closed captions.`,
    presenters: [
      {
        name: 'Ben Saunders',
        organization: 'Signapse',
        photoUrl: '/summit-2026/photos/ben-saunders.png',
        bio: "Dr Ben Saunders is Co-Founder and Chief Scientist at Signapse, a UK-based company developing photo-realistic sign language translation using artificial intelligence. He completed his PhD in Artificial Intelligence at the University of Surrey's Centre for Vision, Speech and Signal Processing. His doctoral and postdoctoral research has focused on AI-generated sign language production, translating spoken or written input into continuous, human-like signed output in both British and American Sign Language.",
      },
      {
        name: 'Marcus Oaten',
        organization: 'Signapse',
        photoUrl: '/summit-2026/photos/marcus-oaten.png',
      },
    ],
  },
  {
    slug: 'beyond-gloss-framework-sign-language-data',
    sessionTitle: 'Beyond Gloss: A New Framework for Sign Language Data',
    presentersLine: 'Presenters: Emanuele Chiusaroli and Manuel Granchelli, Handy Signs',
    summary:
      'Beyond glosses: structured, machine-readable representations for sign languages. Most Sign Language Translation and Sign Language Processing pipelines rely on glosses as an intermediate representation between visual input and spoken-language text. However, glosses constitute an inherently lossy representation and are poorly suited to encode core properties of sign languages, such as non-manual markers, spatial indexing, and information structure. This session discusses structured, declarative, and multi-level representations that go beyond glosses, including a sparse, machine-readable schema for annotation, models, and applied systems.',
    presenters: [
      {
        name: 'Emanuele Chiusaroli',
        organization: 'Handy Signs',
        email: 'emanuele@handysigns.it',
        photoUrl: '/summit-2026/photos/emanuele-chiusaroli.png',
        bio: 'Emanuele coordinates the development teams and handles funding. He is an experienced Project Manager and Scrum Master with 25 years of experience in Telco and 3 years in Enterprise Sales.',
      },
      {
        name: 'Manuel Granchelli',
        organization: 'Handy Signs',
        email: 'manuel@handysigns.it',
      },
    ],
  },
  {
    slug: 'bridging-gap-ai-avatars-sign-language-animation',
    sessionTitle: 'Bridging the Gap: Real Time AI Avatars and Sign Language Animation',
    presentersLine: 'Presenters: Egehan Karabulut and Dr. Burak Uyanık, Vosia.ai',
    summary: `This session presents Vosia.ai's real-time approach to sign language animation and critically examines the role of AI avatars in advancing accessible communication across everyday and institutional contexts. It begins by addressing the persistent gap in real-time access for sign language users and argues that sign language generation cannot be reduced to a simple word-for-word transformation of spoken language. Rather, effective sign language animation requires the coordinated modeling of linguistic structure, temporal alignment, facial expression, upper-body movement, and low-latency interaction in order to produce output that is both intelligible and naturalistic.

The session then introduces a practical real-time generation pipeline encompassing streaming input, language planning, sign structure generation, motion planning, avatar control, and rendering. Particular attention is given to the technical principles that characterize high-performing systems, including streaming-first architecture, multimodal coordination, chunk-based motion generation, latency optimization, and confidence-aware fallback strategies. In this context, the presentation also discusses the current state of development at Vosia.ai, including a live prototype for Turkish Sign Language, AI-assisted speech-to-text and grammar conversion, and interpreter-reviewed processes for sign language data and output validation.

Finally, the session considers possible deployment models, including web-based delivery, cloud-supported streaming, and secure on-site deployment through dedicated hardware. Taken together, the presentation offers a technical and applied perspective on the design of real-time AI avatar systems for sign language animation, emphasizing their potential to enhance accessibility, operational reliability, and future adaptation across diverse sign languages and real-world communication environments.`,
    presenters: [
      {
        name: 'Egehan Karabulut',
        organization: 'Vosia.ai',
        email: 'egehann46@hotmail.com',
        photoUrl: '/summit-2026/photos/egehan-karabulut.png',
        bio: 'Egehan Karabulut is a senior student in Management Information Systems at Sakarya University and Co-Founder of Vosia.ai. He is involved in product strategy, technical development coordination, and the implementation of AI-powered systems, interactive interfaces, and 3D avatar technologies. His areas of expertise include Python, JavaScript, React, Three.js, natural language processing, computer vision, machine learning, SQL, and Blender.',
      },
      {
        name: 'Dr. Burak Uyanık',
        organization: 'Vosia.ai',
        email: 'dr.buyanik@gmail.com',
        photoUrl: '/summit-2026/photos/burak-uyanik.png',
        bio: 'Dr. Burak Uyanık is a deaf software engineer, researcher, and civil society leader working in accessibility, education, and technology. He completed his PhD in Computer Engineering in 2023 and is recognized as the first hearing-impaired computer engineer in Türkiye to complete a doctoral degree. He has worked in software, automation, AI, and R&D across industry and public-sector institutions, and he is also the President of the Association of Hearing Impaired Solidarity, where he leads projects focused on accessibility, STEM, and inclusive participation.',
      },
    ],
  },
  {
    slug: 'better-world-technology-shaped-by-deaf',
    sessionTitle: 'A Better World, Driven by Technology, Shaped by the Deaf',
    presentersLine:
      'Presenters: Sławek Łuczywek, Ashod Derandonyan, and Michał Plaza, Migam.ai',
    summary:
      'Migam outlines how AI can transform sign language translation and interpretation when development is grounded in real communication challenges, using the migam.ai case study. The session stresses integrating Deaf colleagues and experts throughout the entire AI lifecycle (from design and data through testing, deployment, and ongoing dialogue with Deaf communities), so technology is shaped by Deaf expertise, not only powered by models.',
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
      'Sign language processing often stalls at the gap between video-based signing and text-based AI. This session presents SignWriting as a universal transcription layer that connects the two: enabling translation and generation in both directions, clarifying how NLP and computer vision can divide labor in sign language pipelines, and arguing that the right basic representation, including transcription, is central to evaluation, product design, and realistic expectations.',
    presenters: [
      {
        name: 'Dr. Amit Moryossef',
        organization: 'Nagish',
        email: 'amit@nagish.com',
        photoUrl: '/summit-2026/photos/amit-moryossef.png',
        bio: 'Dr. Amit Moryossef is a researcher and entrepreneur in sign-language technology. He completed his Ph.D. at Bar-Ilan University and a postdoc at the University of Zurich. He founded sign.mt, a real-time sign-language translation platform, which was recently acquired by Nagish, where he now leads research. His work has received multiple best paper awards at ACL and EMNLP, focusing on making signed languages accessible through machine learning.',
      },
    ],
  },
  {
    slug: 'human-ai-collaboration-sign-language-technology',
    sessionTitle: 'Human AI Collaboration in Sign Language Technology',
    presentersLine: 'Presenters: Craig Radford, Brandon Dopf, 360 Direct Access',
    summary:
      'As sign language AI moves from research into real world deployment, the technical questions are increasingly inseparable from ethical ones. Who decides what counts as "good enough" accuracy, and who carries the cost when a product fails? Whose signing is in the training data, and what happens to sign language diversity when models scale toward a dominant variety?\n\nThis workshop uses a statement based format to work through a series of issues: data scarcity and governance, what accuracy benchmarks actually measure and for whom, what happens to sign language diversity at scale, and the difference between advising on a product and having real decision making power over it. Drawing on research across Deaf Studies, sign language studies, Human Computer Interaction, and language technology, the session is designed for practitioners building or deploying sign language AI who want to move beyond technical metrics toward more rigorous thinking about real world impact.',
    presenters: [
      {
        name: 'Craig Radford',
        organization: '360 Direct Access',
        email: 'craig@360directaccess.com',
        bio: `Craig Radford is a nationally recognized business leader, motivational speaker, and cofounder and CEO of 360 Direct Access. With over 25 years of experience advancing communication equity, he has pioneered innovations in Video Relay Service (VRS), Video Remote Interpreting (VRI), and Direct Video Calling (DVC).

A serial entrepreneur with three successful exits including one nearing $1 billion, Craig has been featured in Forbes, Business Insider, and CNN. He also serves as Executive Director of USA Deaf Basketball, preparing U.S. national teams for the 2025 Deaflympics. Previously, he was on the coaching staff for the USA Deaf Men's Basketball Team, where he helped lead the team to a gold medal in one year and a silver medal in another.`,
      },
      {
        name: 'Brandon Dopf',
        organization: '360 Direct Access',
        email: 'brandon@360directaccess.com',
        photoUrl: '/summit-2026/photos/brandon-dopf.png',
        bio: `Brandon Dopf is a Deaf professional with over 20 years of experience spanning project management, IT, and customer service. He currently leads the Customer Success Program at 360 Direct Access, where he focuses on delivering accessible, high-quality customer experiences for Deaf, DeafBlind, and Hard of Hearing communities. He holds a Master's degree in Information Security and Project Management and began his career supporting a Fortune 500 initiative, managing a multi-million-dollar project that helped shape his approach to execution, collaboration, and results.

Throughout his career, Brandon has taken on roles such as sales engineer, product manager, and project manager, consistently working at the intersection of technology and accessibility. He has played a key role in launching sign language-based customer service contact centers, helping design training and quality programs that center both communication and experience.

Known for his practical mindset and passion for inclusion, Brandon is driven by a simple goal: to make sure accessibility is not an afterthought, but the standard.`,
      },
    ],
  },
  {
    slug: 'learning-with-signers-educational-slxai',
    sessionTitle: 'Learning with Signers: Educational Applications of SLxAI',
    presentersLine:
      'Presenters: Dr. Lee Kezar, Dr. Lorna Quandt, Dr. Athena Willis, Laurel Aichler, Gallaudet University',
    summary:
      'Researchers in educational neuroscience and SLxAI discuss how to make AI-assisted learning more accessible to students who use sign language, through collaboration among teachers, students, researchers, and systems. Topics include augmented reality interface design, domain-specific terms in sign language models, and evaluating student outcomes.',
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
      'As sign language AI moves from research into real-world deployment, the technical questions are increasingly inseparable from ethical ones. Who decides what counts as "good enough" accuracy — and who carries the cost when a product fails? Whose signing is in the training data, and what happens to sign language diversity when models scale toward a dominant variety?\n\nThis workshop uses a statement-based format to work through a series of statements: about data scarcity and governance, about what accuracy benchmarks actually measure and for whom, about what happens to sign language diversity at scale, and about the difference between advising on a product and having real decision-making power over it. Drawing on research across Deaf Studies, sign language studies, Human-Computer Interaction, and language technology, the session is designed for practitioners building or deploying sign language AI who want to move beyond technical metrics toward more rigorous thinking about real-world impact.',
    presenters: [
      {
        name: 'Dr. Maartje De Meulder',
        organization: 'HU University of Applied Sciences Utrecht (Hogeschool Utrecht)',
        photoUrl: '/summit-2026/photos/maartje-de-meulder.png',
        bio: 'Dr. Maartje De Meulder combines Deaf Studies, language policy, and the wider social sciences to make sense of how language technologies meet deaf lives, with a particular focus on sign language AI. She is interested in how technological affordances shape language, communication, and access, and how deaf people use these technologies in their everyday lives. Alongside her academic work, she regularly collaborates with deaf organisations, interpreting professionals, and technology stakeholders to help the think critically about key questions surrounding ethics, access, and governance of language technologies. Across her work, she aims to build bridges between research, policy and practice: developing concepts and evidence that make sense to deaf communities themselves, while also challenging dominant assumptions about “access” and “inclusion” in tech development, education, and public services.',
      },
    ],
  },
  {
    slug: 'linguistic-approach-sign-language-data-ai',
    sessionTitle: 'A Linguistic Approach to Sign Language Data in AI Model Development',
    presentersLine: 'Presenters: Dr. Naomi Caselli, Dr. Kaj Kraus, Boston University',
    summary: `Sign languages are among the most complex human behaviors. They are visual-manual languages with rich grammatical structure. Building technology for them is a multimodal challenge spanning computer vision, computer graphics, and natural language processing, and it requires deep knowledge of how sign languages are structured and used. Yet too often sign language technologies have treated sign languages as gesture or as a vision problem rather than as a language. This session considers how more than 70 years of sign language linguistics can inform new technologies by focusing on two core issues.

The first is how to account for the unique properties of sign languages in ways that support computational modeling. Unlike spoken languages, sign languages are highly simultaneous: handshape, movement, location, facial expression, and eye gaze can all carry grammatical meaning at the same time. Many signs are iconic, bearing a visual resemblance to what they represent, and signing can be grounded in the immediate environment, with signers pointing to or interacting with objects and people that are physically present. Eye gaze is critical for sign languages in ways that it is not for spoken languages: a signer can only be understood if the perceiver is looking at them. All of these modality differences are critical to successful communication, and annotation schemes and model development should consider how to account for these features.

The second is error analysis. Sign language users can often tell when a model has failed, but much of our knowledge of language is intuitive and difficult for non-linguists to articulate. A user may recognize that something is wrong without being able to explain what or why. Linguists have a suite of tools that can help bridge that gap. Error analysis can take a user's judgment that something "looks off" and identify the precise source of the failure. Language assessments, eye tracking, brain imaging, and many other tools can also help identify sources of model failure.

Sign language linguists offer more than annotation skills. We argue for a linguistically grounded approach to sign language technology, one that treats sign languages as languages and brings linguistics into the full development pipeline, from data collection and annotation through model design and evaluation.`,
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
    summary: `Deaf ASL experts are not interchangeable with Deaf signers, and sign language data is not interchangeable with sign language knowledge. This workshop, led by the team behind TWA Innovations, one of the most comprehensive Deaf-authored ASL textbook, dictionary, and learning platforms, makes that argument with specificity, evidence, and urgency.

Drawing on more than a decade of daily work filming, documenting, curating, and teaching ASL, the presenters walk through eight concrete points where AI sign language projects most commonly fail and why those failures are not technical problems but authority problems.

The session examines the 2D flattening of three-dimensional signing space, the linguistic complexity of joint point and proximalization that standard parameter models miss, the difference between naturalistic XMH signing and pedagogical HMH forms, the infinite generativity of unrealized inceptive aspect, the limits of English gloss labels, the mismatch between sign language simultaneity and sequential AI processing, the sociolinguistic reality of Deaf code switching, and the "24/7 Effect," the finding that Deaf signers who use ASL exclusively produce measurably stronger ASL outcomes.

Throughout, the presenters distinguish between Deaf-sourced projects, where Deaf people provide data but hearing teams control design, labeling, and validation, and truly Deaf-powered ones, where Deaf ASL experts hold authority at every stage. The workshop closes with a challenge to the field: the question is not whether a team includes a Deaf person, but whether Deaf expertise shapes decisions from capture through deployment.`,
    presenters: [
      {
        name: 'Elisa Abenchuchan Vita',
        organization: 'TWA Innovations LLC',
        email: 'hello@truewayasl.com',
        photoUrl: '/summit-2026/photos/elisa-abenchuchan-vita.png',
        bio: 'Elisa Abenchuchan Vita brings expertise in ASL linguistics, education, and language learning. As ASL Dictionary Curator and Project Manager for the TWA Dictionary, she leads linguistic research, community-used sign documentation, filming, and entries for accuracy and accessibility as ASL resources intersect with AI.',
      },
      {
        name: 'Lisa Gelineau',
        organization: 'TWA Innovations LLC',
        email: 'hello@truewayasl.com',
        photoUrl: '/summit-2026/photos/lisa-gelineau.png',
        bio: 'Lisa Gelineau brings decades of experience in ASL education, proficiency evaluation, and curriculum development. She is co-founder of TWA Innovations and a professor at Austin Community College, focused on how technology, including AI, can support rather than oversimplify signed languages.',
      },
      {
        name: 'Raychelle Harris',
        title: 'PhD',
        organization: 'TWA Innovations LLC',
        email: 'hello@truewayasl.com',
        photoUrl: '/summit-2026/photos/raychelle-harris.png',
        bio: 'Raychelle Harris is a Deaf ASL educator and co-owner of TWA Innovations, with academic leadership for the TWA Textbook, Dictionary, and Academy. Her work focuses on ASL teaching methods, assessment, ethical representation of signed languages in digital systems, and Deaf-led expert authority in emerging technologies.',
      },
      {
        name: 'Shelley Oishi',
        organization: 'TWA Innovations LLC',
        email: 'hello@truewayasl.com',
        photoUrl: '/summit-2026/photos/shelley-oishi.png',
        bio: 'Shelley Oishi is CEO of TWA Innovations, advancing accessible, language-centered technology for the Deaf community across the TWA Textbook, Dictionary, and Academy. She focuses on responsible integration of AI into sign language resources with linguistic accuracy and ethical design.',
      },
    ],
  },
  {
    slug: 'eud-sign-language-era-ai',
    sessionTitle: 'EUD: Sign Language in the Era of Artificial Intelligence',
    presentersLine: 'Presenter: Andy Van Hoorebeke, European Union of the Deaf',
    summary: `This session presents the European Union of the Deaf (EUD) perspective on sign language in the era of artificial intelligence. As a key stakeholder in the EU policy landscape, EUD builds on its AI work to develop tailored policy recommendations for EU institutions, aiming to ensure that the rights of Deaf sign language users are reflected in the implementation of the AI Act and related digital legislation.

The development and implementation of EUD's strategic approach to artificial intelligence is driven by EUD staff, who are responsible for research, policy development, and operational follow-up. Andy Van Hoorebeke is a strong supporter of this work at the board level and plays an important role in promoting and disseminating staff-led outputs, including EUD's landmark AI report—the first of its kind globally—which outlines ethical principles and policy recommendations on sign language technologies and AI development.`,
    presenters: [
      {
        name: 'Andy Van Hoorebeke',
        organization: 'European Union of the Deaf',
        photoUrl: '/summit-2026/photos/andy-van-hoorebeke.png',
        bio: `Andy Van Hoorebeke is a Belgian ICT professional with extensive expertise in network, systems and security management, and a strong interest in digital accessibility and emerging technologies.

He serves as a Board Member of the European Union of the Deaf (EUD), where he leads EUD's Working Group on ICT & Technology. In this role, he provides strategic guidance and political support for EUD's work in technology and artificial intelligence.`,
      },
    ],
  },
  {
    slug: 'sign-language-ai-international-policy',
    sessionTitle: 'Sign Language AI and International Policy Spaces',
    presentersLine: 'Presenter: Dr. Joseph J. Murray, World Federation of the Deaf',
    summary:
      'A global policy session on how sign language AI is showing up in international forums, standards discussions, and advocacy work. Attendees will learn what issues are emerging and how to participate responsibly across countries and sign languages.',
    presenters: [
      {
        name: 'Dr. Joseph J. Murray',
        organization: 'World Federation of the Deaf',
        photoUrl: '/summit-2026/photos/joseph-j-murray.png',
      },
    ],
  },
  {
    slug: 'fireside-chat-fcc',
    sessionTitle: 'Fireside Chat with Federal Communications Commission',
    presentersLine: 'Featuring: Travis Dougherty, Signapse; Suzy Rosen Singleton, Federal Communications Commission',
    summary: `FCC's accessibility work will be discussed, including proceedings and activities that touch on sign language driven by artificial intelligence in the spaces of video programming, modern communications, and emergency communications.

Information will be shared about the FCC's advisory committees and existing ways for the public to engage with the FCC via the FCC's ASL Line, and filing comments and complaints.`,
    presenters: [
      {
        name: 'Travis Dougherty',
        title: 'Chief Experience Officer',
        organization: 'Signapse',
        email: 'travis@signapse.ai',
        bio: 'Travis Dougherty is Chief Experience Officer at Signapse. He previously spent five years with Maryland Relay for Telecommunications Access of Maryland, served the National Association of State Relay Administrators (NASRA) in several leadership roles, including Member at Large, Vice Chair, and Chair, and worked with state and federal agencies. He participated in the Deaf and Hard of Hearing Consumer Advocacy Network (DHHCAN), the Safe AI Taskforce, and the FCC Disability Advisory Committee (5th term). He coauthored “Virginia Relay Digital Modernization” (January 2026).',
      },
      {
        name: 'Suzy Rosen Singleton',
        organization: 'Federal Communications Commission',
        email: 'Suzanne.Singleton@fcc.gov',
        photoUrl: '/summit-2026/photos/suzy-rosen-singleton.png',
        bio: 'Suzy Rosen Singleton, a native user of American Sign Language, is Chief of the Disability Rights Office in the Consumer and Governmental Affairs Bureau of the Federal Communications Commission (since 2012). Her career includes civil rights litigation, government affairs for the National Association of the Deaf, special education compliance at the U.S. Department of Education, and ombuds work at Gallaudet University. She holds a J.D. from UCLA School of Law.',
      },
    ],
  },
  {
    slug: 'coset-safe-ai-communication-success',
    sessionTitle: 'CoSET SAFE AI: Designing for Communication Success',
    presentersLine:
      'Presenters: Dr. Abraham Glasser, PhD, Gallaudet University; Stephanie Jo Kent, CoSET; Erin Sanders-Sigmon, CoSET; Jeffrey Shaul, Sign-Speak',
    summary:
      'A structured session introducing the CoSET SAFE AI approach and how it can be used to evaluate communication outcomes, safety, and reliability. Participants will leave with a clearer framework for assessing systems, setting requirements, and communicating limitations responsibly.',
    presenters: [
      { name: 'Dr. Abraham Glasser', title: 'PhD', organization: 'Gallaudet University' },
      { name: 'Stephanie Jo Kent', organization: 'CoSET' },
      { name: 'Erin Sanders-Sigmon', email: 'erinfran777@gmail.com', organization: 'CoSET' },
      { name: 'Jeffrey Shaul', organization: 'Sign-Speak' },
    ],
  },
];

/** Workshop / panel order as in `summit2026Schedule.ts` (Day 1 then Day 2). */
export function getSummit2026WorkshopsInScheduleOrder(): Summit2026Workshop[] {
  const slugs: string[] = [];
  for (const day of SUMMIT_2026_SCHEDULE) {
    for (const row of day.rows) {
      if (row.workshopSlug) slugs.push(row.workshopSlug);
    }
  }
  const bySlug = new Map(SUMMIT_2026_WORKSHOPS.map((w) => [w.slug, w] as const));
  return slugs.map((slug) => bySlug.get(slug)).filter((w): w is Summit2026Workshop => w != null);
}

export function getSummit2026WorkshopBySlug(slug: string | undefined): Summit2026Workshop | undefined {
  if (!slug) return undefined;
  return SUMMIT_2026_WORKSHOPS.find((w) => w.slug === slug);
}
