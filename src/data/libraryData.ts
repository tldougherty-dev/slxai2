export type LibraryContentType =
  | 'research'
  | 'dataset'
  | 'educational_video'
  | 'recorded_workshop'
  | 'files';

export type LibraryTabType = LibraryContentType | 'upload';

export interface LibraryResource {
  id: string;
  type: LibraryContentType;
  title: string;
  description: string;
  url: string;
  source?: string;
  signLanguage?: string;
  tags?: string[];
}

export const LIBRARY_CONTENT_SECTIONS: {
  type: LibraryContentType;
  title: string;
  description: string;
}[] = [
  {
    type: 'research',
    title: 'Research',
    description: 'Papers, reports, and articles on AI, accessibility, and sign language technology.',
  },
  {
    type: 'dataset',
    title: 'Open source datasets',
    description: 'Public datasets for sign language recognition, translation, and AI training.',
  },
  {
    type: 'educational_video',
    title: 'Educational videos',
    description: 'Curated sign language AI talks, demos, and explainers from SLxAI member companies. Members can also embed YouTube or Vimeo links.',
  },
  {
    type: 'recorded_workshop',
    title: 'Recorded Zoom workshops',
    description: 'Past SLxAI Academy sessions and community workshop recordings.',
  },
  {
    type: 'files',
    title: 'Files',
    description: 'Member-shared documents — meeting minutes, standards, governance, and general resources.',
  },
];

export const LIBRARY_UPLOAD_SECTION = {
  type: 'upload' as const,
  title: 'Upload',
  description: 'Share research, datasets, videos, workshop recordings, or documents with the community.',
};

/** Curated starter resources — expand via admin or data updates as the library grows. */
export const LIBRARY_CURATED_RESOURCES: LibraryResource[] = [
  {
    id: 'lib-asl-avatar-stages',
    type: 'research',
    title: 'Development Stages and Classification of ASL Avatars and Recognition Models',
    description: 'SLxAI reference document on ASL avatar development stages and recognition model classification.',
    url: '/Development%20Stages%20and%20Classification%20of%20ASL%20Avatars%20and%20Recognition%20Models%20v%201.0.pdf',
    source: 'SLxAI',
    tags: ['ASL', 'avatars', 'recognition'],
  },
  {
    id: 'lib-hf-sign-language',
    type: 'dataset',
    title: 'Hugging Face — Sign Language datasets',
    description: 'Browse open sign-language datasets and models on Hugging Face.',
    url: 'https://huggingface.co/datasets?search=sign+language',
    source: 'Hugging Face',
    tags: ['open source', 'datasets'],
  },
  {
    id: 'lib-openasl',
    type: 'dataset',
    title: 'OpenASL (research corpus)',
    description: 'Large-scale American Sign Language corpus for recognition and translation research.',
    url: 'https://github.com/checcian/OpenASL',
    source: 'OpenASL',
    signLanguage: 'ASL',
    tags: ['corpus', 'open source'],
  },
];

export function getCuratedResourcesByType(type: LibraryContentType): LibraryResource[] {
  return LIBRARY_CURATED_RESOURCES.filter((r) => r.type === type);
}

// Backward-compatible aliases
export type AcademyLibraryResourceType = LibraryContentType;
export type AcademyLibraryResource = LibraryResource;
export const ACADEMY_LIBRARY_SECTIONS = LIBRARY_CONTENT_SECTIONS;
export const ACADEMY_LIBRARY_RESOURCES = LIBRARY_CURATED_RESOURCES;
export function getLibraryResourcesByType(type: LibraryContentType): LibraryResource[] {
  return getCuratedResourcesByType(type);
}
