export type AcademyCatalogCategory = {
  id: string;
  title: string;
  topics: string[];
};

export const ACADEMY_CATALOG: AcademyCatalogCategory[] = [
  {
    id: 'ai-basics',
    title: 'AI Basics',
    topics: [
      'Getting Started with AI',
      'Prompt Engineering for Beginners',
      'AI Tools Everyone Should Know',
      'AI Myths vs Reality',
    ],
  },
  {
    id: 'chat-ai',
    title: 'Chat AI',
    topics: [
      'Mastering ChatGPT',
      'Getting More from Claude',
      'Research Faster with Perplexity',
      'Using Gemini for Everyday Work',
    ],
  },
  {
    id: 'productivity',
    title: 'Productivity',
    topics: [
      'Save 10 Hours a Week with AI',
      'AI for Email and Documents',
      'Organize Your Work with AI',
      'AI for Meetings and Notes',
    ],
  },
  {
    id: 'content-creation',
    title: 'Content Creation',
    topics: [
      'Create Better Social Media with AI',
      'Write Blogs with AI',
      'Build a Newsletter with AI',
      'Create Presentations in Minutes',
    ],
  },
  {
    id: 'image-generation',
    title: 'Image Generation',
    topics: [
      'Create Amazing Images with Midjourney',
      'Design Marketing Graphics with Canva AI',
      'AI Logo Design',
      'Product Photography with AI',
    ],
  },
  {
    id: 'video-creation',
    title: 'Video Creation',
    topics: [
      'Create Videos with Veo',
      'Build Marketing Videos with Runway',
      'AI Video Editing for Beginners',
      'Create Short Form Videos with AI',
    ],
  },
  {
    id: 'audio',
    title: 'Audio',
    topics: [
      'Voice Cloning with ElevenLabs',
      'Create Music with Suno',
      'AI Podcast Production',
      'AI Audio Cleanup',
    ],
  },
  {
    id: 'website-building',
    title: 'Website Building',
    topics: [
      'Build Your First Website with Lovable',
      'Create Landing Pages with Bolt',
      'Build a Portfolio Website with AI',
      'Launch a Business Website in One Day',
    ],
  },
  {
    id: 'coding',
    title: 'Coding',
    topics: [
      'Build Apps with Cursor',
      'Learn Coding with AI',
      'Build Your First AI App',
      'GitHub Copilot for Beginners',
    ],
  },
  {
    id: 'ai-agents',
    title: 'AI Agents',
    topics: [
      'Build Your First AI Agent',
      'Automate Your Business with n8n',
      'Create AI Workflows',
      'Connect AI to Your Favorite Apps',
    ],
  },
  {
    id: 'business',
    title: 'Business',
    topics: [
      'Start a Business with AI',
      'AI for Small Business Owners',
      'Customer Support with AI',
      'AI for Sales and CRM',
    ],
  },
  {
    id: 'data',
    title: 'Data',
    topics: [
      'Analyze Data with AI',
      'AI for Google Sheets',
      'Build Dashboards with AI',
      'Automate Reports',
    ],
  },
  {
    id: 'accessibility',
    title: 'Accessibility',
    topics: [
      'AI for Accessibility',
      'Building Inclusive AI Experiences',
      'AI Captioning Tools',
      'AI for Sign Language',
    ],
  },
  {
    id: 'creative-fun',
    title: 'Creative & Fun',
    topics: [
      "Create a Children's Book with AI",
      'Build a Game with AI',
      'Design Your Dream Home with AI',
      'Plan Your Vacation with AI',
      'Make Family Videos with AI',
      'Turn Your Ideas into Reality with AI',
    ],
  },
];
