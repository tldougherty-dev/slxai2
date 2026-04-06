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
  /** Optional extra Tailwind classes for the headshot <img> (e.g. object-position, scale) for tighter crops */
  photoImgClassName?: string;
};

/** Optional numbered learning outcomes on `/2026/workshop/:slug` (between description and presenters). */
export type SummitWorkshopLearningObjectives = {
  preamble?: string;
  items: string[];
};

export type Summit2026Workshop = {
  slug: string;
  sessionTitle: string;
  summary: string;
  /** One-line credit for list cards (matches former “Presenter(s):” line) */
  presentersLine: string;
  presenters: SummitWorkshopPresenter[];
  /** Optional learning objectives section before presenters */
  learningObjectives?: SummitWorkshopLearningObjectives;
  /** Optional extra section after presenters on the program book workshop page */
  additionalInformation?: string;
};

export const SUMMIT_2026_WORKSHOPS: Summit2026Workshop[] = [
  {
    slug: 'keynote-breaking-communication-barriers',
    sessionTitle: 'Keynote: Breaking Communication Barriers',
    presentersLine: 'Presenter: Ryan Hait-Campbell, Convo Communications',
    summary:
      'Ryan will open the summit with a look back at the early commercial foundations of sign language and AI and how the ecosystem has evolved since then. He will also outline what the next phase demands from the field, including quality, trust, and real world usability.',
    presenters: [
      {
        name: 'Ryan Hait-Campbell',
        title: 'Program Lead',
        organization: 'Convo Communications',
        photoUrl: '/summit-2026/photos/ryan-hait-campbell.png',
        bio: 'Ryan Hait-Campbell is a Deaf entrepreneur, designer, and technology leader working at the intersection of accessibility, innovation, and sign language technology. He currently serves as Program Lead at Convo, where he supports go-to-market initiatives and helps bring new ideas and products into the hands of the Deaf community. He is also widely known for his earlier leadership in sign language technology entrepreneurship, including MotionSavvy, and for his continued work advancing Deaf-led innovation.',
      },
    ],
  },
  {
    slug: 'ethics-where-does-it-stop',
    sessionTitle: 'Ethics: Where Does It Stop?',
    presentersLine:
      'Presenters: Dr. Naomi Caselli, Boston University; Dr. Maartje De Meulder, University of Applied Sciences Utrecht; Dr. Abraham Glasser, PhD, Gallaudet University; Adam Munder, Sorenson Communications; Thomas Horejes, Ph.D., CDI, SignWow',
    summary: `As sign language AI accelerates, ethical questions are no longer theoretical. They are immediate, complex, and deeply connected to language, identity, ownership, and power. This panel brings together leaders from research, industry, community, and policy to examine where innovation should move forward, and where boundaries must be set.

Topics will include data ownership, consent, compensation, cultural sovereignty, model deployment risks, governance, and the role of Deaf leadership in shaping the future of sign language AI. Panelists will explore real-world scenarios, competing priorities, and unresolved tensions that developers, companies, and communities are already facing.

Rather than presenting a single answer, this discussion focuses on defining ethical guardrails, identifying red lines, and determining how collaboration can move the field forward responsibly.

Participants will leave with a clearer understanding of the ethical landscape, practical questions to apply to their own work, and a shared framework for evaluating whether sign language AI development is advancing responsibly.

This aligns with SLxAI's mission to standardize, collaborate, and advocate for ethical and inclusive practices across sign language AI development.`,
    learningObjectives: {
      items: [
        'Examine the ethical boundaries of sign language AI, including data ownership, consent, compensation, and responsible deployment.',
        'Apply a practical framework for evaluating whether sign language AI initiatives align with community-driven, ethical, and accountable practices.',
      ],
    },
    presenters: [
      {
        name: 'Dr. Naomi Caselli',
        title: 'Co-Director of the Deaf Center, Director of the AI and Education Initiative',
        organization: 'Boston University',
        photoUrl: '/summit-2026/photos/naomi-caselli.png',
        bio: `Naomi's research investigates how early language experiences influence language development in deaf children, with a focus on making language science inclusive of sign languages. Her work explores the acquisition, structure, and processing of sign languages, and how artificial intelligence can be used to increase accessibility for sign language users.

Her research has been supported by more than $7 million in grants from the National Science Foundation (NSF), the National Institutes of Health (NIH), and the Administration for Community Living (ACL). In addition to her role at the Deaf Center, she leads the BU AI & Education Initiative. Caselli is internationally recognized for creating widely used open-access sign language databases that support research in language acquisition and processing. She has delivered more than 30 invited talks and authored 25 peer-reviewed articles in prominent journals, including Psychological Science, Cognition, and the Journal of Pediatrics.`,
      },
      {
        name: 'Dr. Maartje De Meulder',
        organization: 'University of Applied Sciences Utrecht',
        photoUrl: '/summit-2026/photos/maartje-de-meulder.png',
        bio: 'Dr. Maartje De Meulder combines Deaf Studies, language policy, and the wider social sciences to make sense of how language technologies meet deaf lives, with a particular focus on sign language AI. She is interested in how technological affordances shape language, communication, and access, and how deaf people use these technologies in their everyday lives. Alongside her academic work, she regularly collaborates with deaf organisations, interpreting professionals, and technology stakeholders to help the think critically about key questions surrounding ethics, access, and governance of language technologies. Across her work, she aims to build bridges between research, policy and practice: developing concepts and evidence that make sense to deaf communities themselves, while also challenging dominant assumptions about “access” and “inclusion” in tech development, education, and public services.',
      },
      {
        name: 'Dr. Abraham Glasser',
        title: 'PhD',
        organization: 'Gallaudet University',
        email: 'abraham.glasser@gallaudet.edu',
        bio: 'Dr. Abraham Glasser is an Assistant Professor in the MS/PhD Accessible Human Centered Computing and Policy (AHCP) program at Gallaudet University. He is an active member of CoSET.',
      },
      {
        name: 'Adam Munder',
        title: 'Head of Insights, AI Sign Language',
        organization: 'Sorenson Communications',
        photoUrl: '/summit-2026/photos/adam-munder.png',
        photoImgClassName: 'origin-top scale-[1.2] object-[56%_0]',
        bio: `Adam Munder is Head of Insights for Sorenson's AI Sign Language team, where he leads the effort to unify feedback, data, and real-world learning into a cohesive system that improves AI-driven communication. Deaf and a lifelong signer, Adam brings a deeply personal and systemic perspective to accessibility—shaping how organizations understand model quality, user trust, and real-world impact.

He is the founder and former General Manager of OmniBridge, an Intel-backed venture focused on real-time sign language translation, later acquired by Sorenson. His work sits at the intersection of AI, product, and community—ensuring that advances in technology are grounded in the lived experiences of Deaf and hard-of-hearing users.

Adam's career spans engineering, machine learning, and innovation strategy, but his core mission is clear: to break communication barriers by turning fragmented signals into meaningful insight—so AI systems can learn, improve, and truly serve the people they are built for.`,
      },
      {
        name: 'Thomas Horejes',
        title: 'Ph.D., CDI',
        organization: 'SignWow',
        photoUrl: '/summit-2026/photos/thomas-horejes.png',
      },
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
    learningObjectives: {
      preamble: 'Participants will:',
      items: [
        'Identify the types of human expertise required across the sign language AI lifecycle.',
        'Explain how trust is built between the Deaf community and technology companies.',
        'Recognize risks of designing AI systems only for elite bilingual users and articulate strategies for inclusive comprehension.',
      ],
    },
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
    sessionTitle: 'Research & Data Collection: Strengthening Validity Through Partnerships',
    presentersLine: 'Presenter: Pamela Macias, University of Colorado Boulder',
    summary: `This workshop covers how data collection—of experiences by Deaf individuals—can support AI companies' credibility. The session shares a University of Colorado study on AI-generated ASL videos and data collection as an example, illustrating how university collaboration strengthens data quality, research rigor, and ethical accountability.

The session highlights practices that center Deaf expertise in research. Participants will have the opportunity to discuss ideas and practices together.`,
    learningObjectives: {
      items: [
        'Learn how research, data, and partnerships look in practice and why they matter for AI credibility.',
      ],
    },
    presenters: [
      {
        name: 'Pamela Macias',
        title: 'Assistant Professor, ASL Program; Co-Principal Investigator',
        organization: 'University of Colorado Boulder',
        email: 'pamela.macias@colorado.edu',
        bio: "Pamela Macias is Assistant Professor in the ASL Program at the University of Colorado Boulder and Co-Principal Investigator of research on AI-generated ASL videos and related data collection. Her work examines how partnerships between universities, Deaf communities, and industry can strengthen validity, rigor, and ethical accountability in sign language AI.",
      },
    ],
  },
  {
    slug: 'intentional-design-sl-translation-hybrid',
    sessionTitle: 'Intentional Design for SL Translation: AI and Hybrid Approaches',
    presentersLine: 'Presenters: Noreen Wilson, Molly Glass, Yeh Jun Kim, Kara Technologies',
    summary:
      'This workshop explores when automated sign language translation and hybrid, human-in-the-loop approaches fit real-time Deaf access, from emergency and templated notifications to evolving communication needs. It compares automated, hybrid, and human-led models, and discusses quality, accountability, and realistic expectations in context.',
    learningObjectives: {
      items: [
        'Develop a shared understanding of automated, hybrid, and human-led approaches to signed language translation, including where each is appropriate and where caution is needed.',
        'Understand how human-in-the-loop models support and enhance quality, accountability, adaptability, and Deaf-centered outcomes within AI-supported areas.',
        'Engage in informed discussion about realistic expectations, limitations, and opportunities for AI in signed language access.',
      ],
    },
    presenters: [
      {
        name: 'Noreen Wilson',
        title: 'Chief Delivery Officer',
        organization: 'Kara Technologies',
        email: 'noreen@kara.tech',
        photoUrl: '/summit-2026/photos/noreen-wilson.png',
        photoImgClassName: 'origin-top object-top scale-[1.28]',
        bio: 'As a CODA, bilingual in American and New Zealand Sign Languages, she brings a unique cross-cultural lens to inclusive technology. With an extensive background in accessible resource leadership, sign language interpreting, and founding a translation company, she has comprehensive experience leading complex initiatives with strategic insight, collaboration, and a sharp eye for detail. Grounded in a Deaf-first mindset, Noreen focuses on AI-supported solutions that bridge accessibility gaps, working alongside the Deaf community to apply innovative, cutting-edge technology within meaningful and inclusive areas.',
      },
      {
        name: 'Molly Glass',
        title: 'CDI Translation Specialist & Project Coordinator',
        organization: 'Kara Technologies',
        email: 'molly@kara.tech',
        photoUrl: '/summit-2026/photos/molly-glass.png',
        bio: `She brings both lived experience and specialized expertise in signed language access within emerging and innovative technologies. For the past three years, she has worked at Kara Technologies as an ASL Specialist, where she contributes to the development and quality assurance of sign language translations. Her goal is to provide Deaf-centered solutions with a strong focus on usability, linguistic accuracy, and respect for Deaf community needs.

Molly holds certificates in Deaf Interpreting and Signed Language Translation from the National Technical Institute for the Deaf (NTID). In addition to her professional work, she serves on the leadership team of a Deaf-run, international coalition advancing safe, ethical, fair, and accountable standards for the use of artificial intelligence in translation and interpreting.`,
      },
      {
        name: 'Yeh Jun Kim',
        title: 'AI Sign Linguistics & Community Engagement Advisor',
        organization: 'Kara Technologies',
        email: 'yeh@kara.tech',
        photoUrl: '/summit-2026/photos/yeh-jun-kim.png',
        photoImgClassName: 'object-top',
        bio: `He brings over eight years of experience in sign language interpreting and translation, seven years of teaching American Sign Language (ASL), and several years of teaching Korean Sign Language (KSL), along with graduate-level research experience in language and communication.

Through close collaboration with Deaf professionals, educators, interpreters, and community organizations, he helps ensure that sign language AI reflects authentic language use, cultural integrity, and real-world communication needs. His work centers Deaf and DeafDisabled communities by bridging linguistic expertise, accessibility practice, and Deaf-led AI development. At Kara, he supports the evaluation and refinement of automated sign language translation through linguistic review, database quality, and human-in-the-loop workflows, primarily in ASL.`,
      },
    ],
  },
  {
    slug: 'lessons-dataset-creation-sustainable-sl-ai',
    sessionTitle: 'Lessons from Dataset Creation for Sustainable Sign Language AI',
    presentersLine: 'Presenters: Brian Birnbaum, Daniel Sommer, Birnbaum Interpreting Services',
    summary:
      'Lessons from large-scale sign language dataset work with interpreters: how early choices encode assumptions about labor, variation, and use; how those assumptions shape evaluation, product claims, and deployment; and how interpreter expertise in dataset and downstream decisions supports sustainable, responsible sign language AI.',
    learningObjectives: {
      items: [
        'Understand how dataset creation encodes assumptions that influence AI training, evaluation, and real-world deployment.',
        'Learn how interpreter lived experience during dataset creation provides critical context that data alone cannot capture.',
        'Identify risks of misuse and over-promotion of sign language AI tools based on lessons from accessibility history.',
        'Explore how keeping interpreter expertise in dialogue with AI teams supports responsible use and professional sustainability.',
      ],
    },
    presenters: [
      {
        name: 'Brian Birnbaum',
        title: 'CEO',
        organization: 'Birnbaum Interpreting Services',
        email: 'brian.birnbaum@bisworld.com',
        photoUrl: '/summit-2026/photos/brian-birnbaum.png',
        bio: 'Brian Birnbaum is a CODA whose father, David, was the first Deaf founder and owner of a nationwide sign language interpreting agency. He now runs Birnbaum Interpreting Services and has built a streamlined data aggregation platform from experience with Deaf access systems at scale, emphasizing ethical practice, professional sustainability, and responsible integration of emerging technologies into sign language access.',
      },
      {
        name: 'Daniel Sommer',
        title: 'Project Manager',
        organization: 'Birnbaum Interpreting Services',
        email: 'daniel.sommer@bisworld.com',
        photoUrl: '/summit-2026/photos/daniel-sommer.png',
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
    learningObjectives: {
      items: [
        'Describe what current photo-realistic BSL and ASL translation systems can and cannot do in practice, including real-time and post-production workflows such as SignStream and SignStudio.',
        'Compare use cases that align with Deaf community priorities and those gaining commercial traction, and discuss how Deaf-centered product development supports scalable, trusted sign language accessibility.',
      ],
    },
    presenters: [
      {
        name: 'Ben Saunders',
        title: 'Chief Scientist',
        organization: 'Signapse',
        photoUrl: '/summit-2026/photos/ben-saunders.png',
        bio: "Dr Ben Saunders is Co-Founder and Chief Scientist at Signapse, a UK-based company developing photo-realistic sign language translation using artificial intelligence. He completed his PhD in Artificial Intelligence at the University of Surrey's Centre for Vision, Speech and Signal Processing. His doctoral and postdoctoral research has focused on AI-generated sign language production, translating spoken or written input into continuous, human-like signed output in both British and American Sign Language.",
      },
      {
        name: 'Marcus Oaten',
        title: 'Deaf Impact Officer',
        organization: 'Signapse',
        photoUrl: '/summit-2026/photos/marcus-oaten.png',
        bio: `Marcus Oaten is a Deaf British Sign Language user and Deaf Impact Officer at Signapse. In this role, he works directly with Deaf communities to gather feedback, support user testing, and guide the development of AI-driven sign language products to ensure they reflect real-world communication needs.

He is also the human model behind Signapse's AI digital signer "Mars," helping shape how synthetic signers are designed, validated, and improved through community input. His work includes demonstrating AI tools, collecting user feedback at events, and feeding insights back into product and research teams to improve accessibility and linguistic accuracy.`,
      },
    ],
  },
  {
    slug: 'beyond-gloss-framework-sign-language-data',
    sessionTitle: 'Beyond Gloss: A New Framework for Sign Language Data',
    presentersLine: 'Presenters: Emanuele Chiusaroli and Manuel Granchelli, Handy Signs',
    summary:
      'Beyond glosses: structured, machine-readable representations for sign languages. Most Sign Language Translation and Sign Language Processing pipelines rely on glosses as an intermediate representation between visual input and spoken-language text. However, glosses constitute an inherently lossy representation and are poorly suited to encode core properties of sign languages, such as non-manual markers, spatial indexing, and information structure. This session discusses structured, declarative, and multi-level representations that go beyond glosses, including a sparse, machine-readable schema for annotation, models, and applied systems.',
    learningObjectives: {
      items: [
        'Learn about the company Handy Signs and the solutions developed so far, as well as its current and future vision.',
        'Attend a live demonstration of the application.',
        'Participants who are familiar with Italian Sign Language will have the opportunity to try it out.',
      ],
    },
    presenters: [
      {
        name: 'Emanuele Chiusaroli',
        title: 'Founder and CEO',
        organization: 'Handy Signs',
        email: 'emanuele@handysigns.it',
        photoUrl: '/summit-2026/photos/emanuele-chiusaroli.png',
        bio: `Emanuele Chiusaroli is the founder and CEO of Handy Signs, an Italian startup developing artificial intelligence technology for translation between Italian Sign Language and spoken Italian to improve accessibility in public services and everyday communication. He previously co-founded E lisir, an early online video interpreting service, where he began working closely with the Deaf community and identifying the need for scalable AI-based sign language communication tools.

At Handy Signs, Chiusaroli coordinates development teams and oversees funding and strategic partnerships. He is an experienced Project Manager and Scrum Master with more than 25 years of experience in the telecommunications sector and three years in enterprise sales. His work focuses on bringing AI-driven sign language solutions into real-world deployments across government services, healthcare, banking, and cultural institutions.`,
      },
      {
        name: 'Manuel Granchelli',
        title: 'AI Engineer',
        organization: 'Handy Signs',
        email: 'manuel@handysigns.it',
        bio: `Manuel Granchelli is an AI Engineer at Handy Signs, an Italian company developing AI-powered translation between Italian Sign Language and spoken Italian to improve accessibility in public services and everyday communication. He works on machine learning and technical development supporting real-time sign language interpretation technologies.

Handy Signs focuses on deploying AI-based LIS interpretation tools for environments such as public administration, tourism, and service counters, aiming to support communication between Deaf and hearing users.`,
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
    learningObjectives: {
      items: [
        'Examine the key challenges and solutions in real-time 3D sign language generation (e.g., latency, fluidity).',
        "Gain insights from a Deaf technologist's perspective on AI-driven accessibility.",
        'Identify practical strategies for ensuring semantic accuracy in avatar-based communication.',
      ],
    },
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
    summary: `This session introduces a shift from formal Responsible AI frameworks toward operational infrastructure for sign language technologies, focusing on real-world implementation at Migam.ai. While ethical principles and policy guidelines have advanced, a significant gap remains between intention and implementation in deployed systems.

Inspired by the EUD Ethical Framework on AI and Sign Language, research at Gallaudet University and practical experience in sign language AI development, the presentation outlines a Deaf-governed infrastructure model embedding Deaf expertise across the AI lifecycle—from data creation and linguistic structuring to validation, deployment, and continuous feedback.

Through product and AI perspectives, the session demonstrates how structured systems improve quality, consistency, and trust, and how the absence of such systems leads to failure even with advanced models.

Finally, it explores scalability across languages and regions, positioning Migam.ai as a key actor in building global sign language AI infrastructure grounded in Deaf leadership.`,
    learningObjectives: {
      items: [
        'Understand the gap between Responsible AI frameworks and real-world implementation, and why operational infrastructure is required to deploy reliable sign language AI systems.',
        'Explain how Deaf-governed infrastructure embeds Deaf expertise across the entire AI lifecycle, including data collection, annotation, validation, model evaluation, and continuous feedback.',
        'Evaluate how structured pipelines and governance systems improve accuracy, consistency, and scalability of sign language AI across languages, regions, and deployments.',
      ],
    },
    presenters: [
      {
        name: 'Sławek Łuczywek',
        title: 'Product Owner',
        organization: 'Migam.ai',
        email: 'slawek.luczywek@migam.org',
        photoUrl: '/summit-2026/photos/slawek-luczywek.png',
        bio:
          'Sławek Łuczywek is Product Owner at Migam.ai, where he leads the global deployment and strategic growth of AI-powered sign language solutions—including avatar-based translation systems, accessibility integrations, and enterprise partnerships. His work bridges technology, business, and the Deaf community, ensuring that AI products are not only scalable but also culturally and linguistically relevant.\n\nWith over 13 years of experience in accessibility and Deaf services, Sławek focuses on translating product innovation into real-world impact—working with corporations, governments, and NGOs to implement compliant, user-centered solutions aligned with frameworks such as the European Accessibility Act.\n\nHe plays a key role in building global partnerships, identifying market opportunities, and positioning Migam.ai as a leader in accessible AI—ensuring that Deaf users remain at the center of product design, delivery, and adoption.',
      },
      {
        name: 'Ashod Derandonyan',
        title: 'Deaf Experts Lead',
        organization: 'Migam.ai',
        email: 'ashod@migam.org',
        photoUrl: '/summit-2026/photos/ashod-derandonyan.png',
        bio:
          'Ashod Derandonyan is Deaf Experts Lead at Migam.ai, where he leads the integration of Deaf expertise across the full lifecycle of AI-driven sign language technologies—from dataset design and linguistic validation to model evaluation and ethical frameworks. His work ensures that sign language AI systems are accurate, culturally grounded, and built with Deaf communities, not just for them.\n\nWith a background in public policy, international development, and Deaf advocacy, Ashod focuses on embedding Deaf leadership into AI pipelines—shaping methodologies for data collection, annotation, and human-in-the-loop validation across multiple sign languages, including ASL and Bulgarian Sign Language.\n\nHe operates at the intersection of technology, research, and global partnerships—connecting engineers, researchers, and Deaf communities to co-create scalable, inclusive solutions that redefine accessibility standards in AI.',
      },
      {
        name: 'Michał Plaza',
        title: 'R&D Lead',
        organization: 'Migam.ai',
        email: 'michal.plaza@migam.org',
        photoUrl: '/summit-2026/photos/michal-plaza.png',
        bio:
          'Michał Plaza is R&D Lead at Migam.ai, where he leads the research and development of real-time sign language translation systems — spanning sign recognition, multimodal AI pipelines, and speech synthesis. His work focuses on building low-latency, production-grade AI that makes sign languages accessible at scale, starting with PJM and ASL with the goal of covering all major sign languages.\n\nWith a background in computer science and agentic AI systems, Michał specializes in designing high-performance architectures that integrate vision, language, and generative models into cohesive, real-world applications. Prior to Migam.ai, he developed AI systems for large-scale performance engineering automation and built tools that significantly optimized complex workflows in the renewable energy sector.\n\nAt Migam.ai, he drives the technical vision behind next-generation sign language translation, ensuring that cutting-edge research translates into robust, scalable products that meet the real needs of Deaf users globally.',
      },
    ],
  },
  {
    slug: 'future-sl-translation-is-transcription',
    sessionTitle: 'The Future of Sign Language Translation is Transcription',
    presentersLine: 'Presenter: Dr. Amit Moryossef, Nagish',
    summary:
      'Sign language processing often stalls at the gap between video-based signing and text-based AI. This session presents SignWriting as a universal transcription layer that connects the two: enabling translation and generation in both directions, clarifying how NLP and computer vision can divide labor in sign language pipelines, and arguing that the right basic representation, including transcription, is central to evaluation, product design, and realistic expectations.',
    learningObjectives: {
      items: [
        'Mindset shift, with the goal of thinking about sign language translation as a problem with the basic representation of sign language.',
      ],
    },
    presenters: [
      {
        name: 'Dr. Amit Moryossef',
        title: 'Head of Research',
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
    learningObjectives: {
      items: [
        'Describe how AI sign language recognition and avatar technologies are used in real-world accessibility solutions.',
        'Apply Deaf-centered and human-centered design principles to AI system development.',
        'Recognize ethical and cultural risks in sign language AI and identify strategies to mitigate them.',
        'Identify opportunities for responsible human-AI collaboration in accessible communication.',
      ],
    },
    presenters: [
      {
        name: 'Craig Radford',
        title: 'CEO and Co-Founder',
        organization: '360 Direct Access',
        email: 'craig@360directaccess.com',
        photoUrl: '/summit-2026/photos/craig-radford.png',
        bio: `Craig Radford is a nationally recognized business leader, motivational speaker, and cofounder and CEO of 360 Direct Access. With over 25 years of experience advancing communication equity, he has pioneered innovations in Video Relay Service (VRS), Video Remote Interpreting (VRI), and Direct Video Calling (DVC).

A serial entrepreneur with three successful exits including one nearing $1 billion, Craig has been featured in Forbes, Business Insider, and CNN. He also serves as Executive Director of USA Deaf Basketball, preparing U.S. national teams for the 2025 Deaflympics. Previously, he was on the coaching staff for the USA Deaf Men's Basketball Team, where he helped lead the team to a gold medal in one year and a silver medal in another.`,
      },
      {
        name: 'Brandon Dopf',
        title: 'Senior VP of Customer Success',
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
    learningObjectives: {
      items: [
        'Develop a nuanced understanding of how educational technologies can meaningfully include DHH students.',
        'Gain varying perspectives on the challenges associated with educational technology for sign languages.',
        'Become familiar with ongoing research in educational technology in DHH classrooms.',
      ],
    },
    presenters: [
      {
        name: 'Dr. Lee Kezar',
        title: 'Computer Scientist & Postdoctoral Researcher',
        organization: 'Gallaudet University',
        email: 'lee.kezar@gallaudet.edu',
        photoUrl: '/summit-2026/photos/lee-kezar.png',
        bio: 'Dr. Lee Kezar is a computer scientist and postdoctoral researcher at Gallaudet University with a focus on linguistically informed machine learning models of American Sign Language.',
      },
      {
        name: 'Dr. Lorna Quandt',
        title: 'Associate Professor of Educational Neuroscience',
        organization: 'Gallaudet University',
        email: 'lorna.quandt@gallaudet.edu',
        photoUrl: '/summit-2026/photos/lorna-quandt.png',
        bio: 'Dr. Lorna Quandt is an associate professor of Educational Neuroscience at Gallaudet University. Her work examines how emerging technologies can facilitate education for sign language users at the intersection of learning science and neuroscience.',
      },
      {
        name: 'Dr. Athena Willis',
        title: 'Independent Researcher, HCI & Educational Neuroscience',
        organization: 'Independent researcher',
        email: 'athena.s.willis@gmail.com',
        bio: 'Dr. Athena Willis is an independent researcher in HCI and educational neuroscience, focusing on the design and evaluation of AI and augmented reality systems that collaborate with signing users for intellectual and language development.',
      },
      {
        name: 'Laurel Aichler',
        title: 'Doctoral Student & Research Assistant, Action and Brain Lab',
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
    learningObjectives: {
      preamble: 'By the end of the workshop, participants will be able to:',
      items: [
        'Use a Deaf Studies/social science lens to place sign language AI within Deaf communication ecologies (not just “translation”).',
        'Assess power and inclusion in sign language AI: who benefits, who is left out.',
        'Judge “good enough” trade-offs: when speed/scale is acceptable, and when quality must be non-negotiable.',
        'Anticipate effects on interpreting and access: jobs, workflows, user choice, and friction.',
        'Understand “sign languages as data”: consent, representation, and consequences.',
        'Produce role-specific guardrails: transparency, deployment boundaries, pricing/access, and complaint/accountability processes.',
      ],
    },
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
    learningObjectives: {
      items: [
        'Understand how linguistic properties of sign languages such as simultaneity, iconicity, spatial grounding, and eye gaze influence computational modeling and must be incorporated into sign language AI design.',
        'Identify how treating sign languages as full languages rather than gestures changes annotation strategies, model architecture, and evaluation approaches for multimodal sign language technologies.',
        'Apply linguistically grounded error analysis methods to diagnose model failures and improve sign language AI using tools such as linguistic analysis, user judgments, eye tracking, and language assessment.',
      ],
    },
    presenters: [
      {
        name: 'Dr. Naomi Caselli',
        title: 'Co-Director of the Deaf Center, Director of the AI and Education Initiative',
        organization: 'Boston University',
        photoUrl: '/summit-2026/photos/naomi-caselli.png',
        bio: `Naomi's research investigates how early language experiences influence language development in deaf children, with a focus on making language science inclusive of sign languages. Her work explores the acquisition, structure, and processing of sign languages, and how artificial intelligence can be used to increase accessibility for sign language users.

Her research has been supported by more than $7 million in grants from the National Science Foundation (NSF), the National Institutes of Health (NIH), and the Administration for Community Living (ACL). In addition to her role at the Deaf Center, she leads the BU AI & Education Initiative. Caselli is internationally recognized for creating widely used open-access sign language databases that support research in language acquisition and processing. She has delivered more than 30 invited talks and authored 25 peer-reviewed articles in prominent journals, including Psychological Science, Cognition, and the Journal of Pediatrics.`,
      },
      {
        name: 'Dr. Kaj Kraus',
        title: 'Postdoctoral Scholar, Deaf Center',
        organization: 'Boston University',
        photoUrl: '/summit-2026/photos/kaj-kraus.png',
        bio: `Dr. Kaj Kraus is a postdoctoral associate in the Deaf Center at the Boston University Wheelock College of Education & Human Development. He studies how language and cognitive development are shaped by perceptual experience, language input, and modality.

His current work spans three projects that investigate: 1) how early language skills relate to later language skills in deaf and hard of hearing children; 2) how early language planning relates to language outcomes in deaf and hard of hearing children; and 3) how iconicity influences sign language learning.

He earned a PhD in Linguistics from Gallaudet University with a dissertation titled "Investigating relationships between L1 English reading comprehension, nonverbal working memory, and L2 ASL receptive comprehension in deaf and hard of hearing adults." He received a Doctoral Dissertation Research Improvement grant from the National Science Foundation for this work.`,
      },
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
    learningObjectives: {
      items: [
        'Distinguish between ASL fluency and ASL expertise, and explain why this distinction is critical in AI-driven language technologies.',
        'Identify common failures in ASL–AI projects that result from excluding Deaf ASL educators and linguists from leadership and design decisions.',
        'Describe the linguistic, pedagogical, and cultural complexities involved in documenting ASL beyond surface-level data collection.',
        'Apply a Deaf-led, interdisciplinary framework for ethically developing ASL-related AI systems that center linguistic authority, community validation, and long-term impact.',
      ],
    },
    presenters: [
      {
        name: 'Elisa Abenchuchan Vita',
        title: 'ASL Lexicographer & Linguistic Researcher',
        organization: 'TWA Innovations LLC',
        email: 'hello@truewayasl.com',
        photoUrl: '/summit-2026/photos/elisa-abenchuchan-vita.png',
        bio: 'Elisa Abenchuchan Vita brings expertise in ASL linguistics, education, and language learning. As ASL Dictionary Curator and Project Manager for the TWA Dictionary, she leads linguistic research, community-used sign documentation, filming, and entries for accuracy and accessibility as ASL resources intersect with AI.',
      },
      {
        name: 'Lisa Gelineau',
        title: 'ASL Curriculum Architect & Language Analyst',
        organization: 'TWA Innovations LLC',
        email: 'hello@truewayasl.com',
        photoUrl: '/summit-2026/photos/lisa-gelineau.png',
        bio: 'Lisa Gelineau brings decades of experience in ASL education, proficiency evaluation, and curriculum development. She is co-founder of TWA Innovations and a professor at Austin Community College, focused on how technology, including AI, can support rather than oversimplify signed languages.',
      },
      {
        name: 'Raychelle Harris, Ph.D.',
        title: 'Academic Director & Researcher',
        organization: 'TWA Innovations LLC',
        email: 'hello@truewayasl.com',
        photoUrl: '/summit-2026/photos/raychelle-harris.png',
        bio: 'Raychelle Harris is a Deaf ASL educator and co-owner of TWA Innovations, with academic leadership for the TWA Textbook, Dictionary, and Academy. Her work focuses on ASL teaching methods, assessment, ethical representation of signed languages in digital systems, and Deaf-led expert authority in emerging technologies.',
      },
      {
        name: 'Shelley Oishi',
        title: 'CEO & Accessibility Technology Lead',
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
    learningObjectives: {
      items: [
        'Understand the legal and ethical frameworks governing sign language AI, including the EU AI Act, the Council of Europe AI Convention, and Deaf Digital Law, and how they shape responsible AI development.',
        'Evaluate how sign language AI should be designed through Deaf-led co-creation, informed consent, fair compensation, and cultural and linguistic accountability.',
        'Identify risks and opportunities of sign language AI, including dataset quality, bias, interpreter displacement, and the need for transparency and human oversight in real-world deployment.',
      ],
    },
    presenters: [
      {
        name: 'Andy Van Hoorebeke',
        organization: 'European Union of the Deaf',
        photoUrl: '/summit-2026/photos/andy-van-hoorebeke.png',
        photoImgClassName: 'scale-[1.45] object-top translate-y-2',
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
    learningObjectives: {
      items: [
        'Understand how international policy spaces such as the UN, standards bodies, and global disability rights frameworks are shaping governance for sign language AI and influencing technology deployment worldwide.',
        'Identify global Deaf community priorities and risks related to AI, including data sovereignty, cultural flattening, interpreter displacement, and the need for consent-driven and community-governed development.',
        'Evaluate models for collaboration between researchers, developers, policymakers, and Deaf organizations, including community data governance, joint research design, and deployment accountability frameworks.',
      ],
    },
    presenters: [
      {
        name: 'Dr. Joseph J. Murray',
        title: 'President',
        organization: 'World Federation of the Deaf',
        photoUrl: '/summit-2026/photos/joseph-j-murray.png',
        bio: `Dr. Joseph J. Murray is President of the World Federation of the Deaf and Board Member of the International Disability Alliance. Dr. Murray has 30+ years of international disability rights experience and has worked as an advisor for NGOs and Deaf and disability communities in over 50 different countries, including, most recently, as a member of the official Norwegian government commission for sign language.

Dr. Murray is Professor of Deaf Studies at Gallaudet University and has published widely in human rights, linguistic rights, Deaf studies and applied linguistics.`,
      },
    ],
  },
  {
    slug: 'fireside-chat-fcc',
    sessionTitle: 'Fireside Chat with Federal Communications Commission',
    presentersLine: 'Featuring: Travis Dougherty, Signapse; Suzy Rosen Singleton, Federal Communications Commission',
    summary: `FCC's accessibility work will be discussed, including proceedings and activities that touch on sign language driven by artificial intelligence in the spaces of video programming, modern communications, and emergency communications.

Information will be shared about the FCC's advisory committees and existing ways for the public to engage with the FCC via the FCC's ASL Line, and filing comments and complaints.`,
    learningObjectives: {
      items: [
        "Understand the FCC's role, strategic priorities, and how accessibility including AI-driven communication technologies fits within federal communications policy.",
        'Identify key FCC rulemakings and policy areas impacting sign language AI, including modern communications, emergency communications, and televised video programming.',
        'Learn how startups and researchers can engage with the FCC and prepare for future performance benchmarks, quality standards, and regulatory expectations for AI-driven accessibility tools.',
      ],
    },
    presenters: [
      {
        name: 'Travis Dougherty',
        title: 'Chief Experience Officer',
        organization: 'Signapse',
        email: 'travis@signapse.ai',
        photoUrl: '/summit-2026/photos/travis-dougherty.png',
        bio: 'Travis Dougherty is a serial entrepreneur who, over the past two decades, has founded, co-founded, or helped scale 13+ startups. He previously spent five years with Maryland Relay for Telecommunications Access of Maryland, served the National Association of State Relay Administrators (NASRA) in several leadership roles, including Member at Large, Vice Chair, and Chair, and worked with state and federal agencies. He participated in the Deaf and Hard of Hearing Consumer Advocacy Network (DHHCAN), the Safe AI Taskforce, and the FCC Disability Advisory Committee (5th term). He coauthored [Virginia Relay Digital Modernization](https://rga.lis.virginia.gov/Published/2026/RD130/PDF) (January 2026).',
      },
      {
        name: 'Suzy Rosen Singleton',
        title:
          'Chief, Disability Rights Office, Consumer and Governmental Affairs Bureau, Federal Communications Commission',
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

/** Neighbors in `getSummit2026WorkshopsInScheduleOrder()` for prev/next navigation on `/2026/workshop/:slug`. */
export function getAdjacentWorkshopsInScheduleOrder(slug: string): {
  prev: Summit2026Workshop | undefined;
  next: Summit2026Workshop | undefined;
} {
  const ordered = getSummit2026WorkshopsInScheduleOrder();
  const idx = ordered.findIndex((w) => w.slug === slug);
  if (idx === -1) return { prev: undefined, next: undefined };
  return {
    prev: idx > 0 ? ordered[idx - 1] : undefined,
    next: idx < ordered.length - 1 ? ordered[idx + 1] : undefined,
  };
}

export function getSummit2026WorkshopBySlug(slug: string | undefined): Summit2026Workshop | undefined {
  if (!slug) return undefined;
  return SUMMIT_2026_WORKSHOPS.find((w) => w.slug === slug);
}
