import {
  SIGNAL_NEWSLETTER_SECTIONS,
  type SignalNewsletterSectionKey,
} from '@/lib/signalNewsletterTemplate';

export type NewsletterBlockType =
  | 'section'
  | 'text'
  | 'image'
  | 'video'
  | 'divider'
  | 'quote'
  | 'button'
  | 'spacer';

export type NewsletterImageAlign = 'left' | 'center' | 'full';
export type NewsletterSpacerSize = 'sm' | 'md' | 'lg';
export type NewsletterButtonStyle = 'primary' | 'outline';

export type NewsletterBlock = {
  id: string;
  type: NewsletterBlockType;
  sectionKey?: SignalNewsletterSectionKey;
  customSectionTitle?: string;
  html?: string;
  imageUrl?: string;
  alt?: string;
  caption?: string;
  imageAlign?: NewsletterImageAlign;
  videoUrl?: string;
  quoteAttribution?: string;
  buttonLabel?: string;
  buttonUrl?: string;
  buttonStyle?: NewsletterButtonStyle;
  spacerSize?: NewsletterSpacerSize;
};

export type SignalNewsletterDocument = {
  version: 2;
  blocks: NewsletterBlock[];
  subtitle?: string;
  coverImageUrl?: string;
};

export const EMPTY_NEWSLETTER_DOCUMENT: SignalNewsletterDocument = {
  version: 2,
  blocks: createDefaultTemplateBlocks(),
};

export function createBlockId(): string {
  return crypto.randomUUID();
}

export function getSectionLabel(key: SignalNewsletterSectionKey): string {
  return SIGNAL_NEWSLETTER_SECTIONS.find((s) => s.key === key)?.label ?? key;
}

export function createDefaultTemplateBlocks(): NewsletterBlock[] {
  return SIGNAL_NEWSLETTER_SECTIONS.flatMap((section) => [
    { id: createBlockId(), type: 'section', sectionKey: section.key },
    { id: createBlockId(), type: 'text', html: '' },
  ]);
}

export function createBlock(type: NewsletterBlockType): NewsletterBlock {
  const id = createBlockId();
  switch (type) {
    case 'section':
      return { id, type, sectionKey: 'editors_note' };
    case 'text':
      return { id, type, html: '' };
    case 'image':
      return { id, type, imageUrl: '', alt: '', caption: '', imageAlign: 'center' };
    case 'video':
      return { id, type, videoUrl: '' };
    case 'quote':
      return { id, type, html: '', quoteAttribution: '' };
    case 'button':
      return { id, type, buttonLabel: 'Learn more', buttonUrl: '', buttonStyle: 'primary' };
    case 'spacer':
      return { id, type, spacerSize: 'md' };
    case 'divider':
    default:
      return { id, type: 'divider' };
  }
}

function blocksFromLegacySections(sections: Record<string, string>): NewsletterBlock[] {
  const blocks: NewsletterBlock[] = [];
  for (const section of SIGNAL_NEWSLETTER_SECTIONS) {
    const body = sections[section.key]?.trim();
    if (!body) continue;
    blocks.push({ id: createBlockId(), type: 'section', sectionKey: section.key });
    blocks.push({ id: createBlockId(), type: 'text', html: plainTextToHtml(body) });
  }
  return blocks.length > 0 ? blocks : createDefaultTemplateBlocks();
}

function plainTextToHtml(text: string): string {
  return text
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p) => `<p>${escapeHtml(p).replace(/\n/g, '<br>')}</p>`)
    .join('');
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function normalizeNewsletterDocument(raw: unknown): SignalNewsletterDocument {
  if (!raw || typeof raw !== 'object') {
    return { ...EMPTY_NEWSLETTER_DOCUMENT, blocks: createDefaultTemplateBlocks() };
  }

  const data = raw as Record<string, unknown>;

  if (data.version === 2 && Array.isArray(data.blocks)) {
    return {
      version: 2,
      subtitle: typeof data.subtitle === 'string' ? data.subtitle : undefined,
      coverImageUrl: typeof data.coverImageUrl === 'string' ? data.coverImageUrl : undefined,
      blocks: (data.blocks as NewsletterBlock[]).map((block) => ({
        ...block,
        id: block.id || createBlockId(),
      })),
    };
  }

  const legacySections: Partial<Record<SignalNewsletterSectionKey, string>> = {};
  for (const section of SIGNAL_NEWSLETTER_SECTIONS) {
    const val = data[section.key];
    if (typeof val === 'string') legacySections[section.key] = val;
  }
  const hasLegacy = Object.values(legacySections).some((v) => v?.trim());
  if (hasLegacy) {
    return {
      version: 2,
      blocks: blocksFromLegacySections(legacySections as Record<string, string>),
    };
  }

  return { version: 2, blocks: createDefaultTemplateBlocks() };
}

export function duplicateBlocks(blocks: NewsletterBlock[]): NewsletterBlock[] {
  return blocks.map((block) => ({ ...block, id: createBlockId() }));
}

const ALLOWED_TAGS = new Set([
  'P',
  'BR',
  'STRONG',
  'B',
  'EM',
  'I',
  'U',
  'A',
  'UL',
  'OL',
  'LI',
  'H3',
  'H4',
  'BLOCKQUOTE',
]);

export function sanitizeNewsletterHtml(html: string): string {
  if (!html.trim()) return '';
  const doc = new DOMParser().parseFromString(html, 'text/html');
  const walk = (node: Node): string => {
    if (node.nodeType === Node.TEXT_NODE) {
      return escapeHtml(node.textContent ?? '');
    }
    if (node.nodeType !== Node.ELEMENT_NODE) return '';
    const el = node as HTMLElement;
    const tag = el.tagName;
    if (!ALLOWED_TAGS.has(tag)) {
      return Array.from(el.childNodes).map(walk).join('');
    }
    if (tag === 'BR') return '<br>';
    if (tag === 'A') {
      const href = el.getAttribute('href') ?? '';
      if (!/^https?:\/\//i.test(href)) return Array.from(el.childNodes).map(walk).join('');
      return `<a href="${escapeHtml(href)}" target="_blank" rel="noopener noreferrer">${Array.from(el.childNodes).map(walk).join('')}</a>`;
    }
    const inner = Array.from(el.childNodes).map(walk).join('');
    return `<${tag.toLowerCase()}>${inner}</${tag.toLowerCase()}>`;
  };
  return Array.from(doc.body.childNodes).map(walk).join('');
}

export function parseVideoEmbed(url: string): { type: 'youtube' | 'vimeo'; embedUrl: string } | null {
  const trimmed = url.trim();
  if (!trimmed) return null;
  const youtube =
    trimmed.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/)?.[1];
  if (youtube) {
    return { type: 'youtube', embedUrl: `https://www.youtube.com/embed/${youtube}` };
  }
  const vimeo = trimmed.match(/vimeo\.com\/(\d+)/)?.[1];
  if (vimeo) {
    return { type: 'vimeo', embedUrl: `https://player.vimeo.com/video/${vimeo}` };
  }
  return null;
}

export const NEWSLETTER_BLOCK_OPTIONS: { type: NewsletterBlockType; label: string; description: string }[] = [
  { type: 'section', label: 'Section heading', description: 'Template section title (e.g. Editor\'s Note)' },
  { type: 'text', label: 'Text', description: 'Rich text paragraph with formatting and links' },
  { type: 'image', label: 'Image', description: 'Upload or link an image with caption' },
  { type: 'video', label: 'Video', description: 'Embed YouTube or Vimeo' },
  { type: 'quote', label: 'Quote', description: 'Highlighted pull quote' },
  { type: 'button', label: 'Button / CTA', description: 'Call-to-action link button' },
  { type: 'divider', label: 'Divider', description: 'Horizontal line between sections' },
  { type: 'spacer', label: 'Spacer', description: 'Extra vertical space' },
];
