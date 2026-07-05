import { parseVideoEmbed } from '@/lib/signalNewsletterBlocks';

export { parseVideoEmbed };

export function getVideoEmbedUrl(url?: string | null): string | null {
  if (!url) return null;
  const parsed = parseVideoEmbed(url);
  if (parsed) return parsed.embedUrl;
  if (url.includes('youtube.com/embed') || url.includes('player.vimeo.com/video/')) {
    return url;
  }
  return null;
}

export function isVideoEmbedUrl(url?: string | null): boolean {
  return getVideoEmbedUrl(url) !== null;
}

export const VIDEO_EMBED_LIBRARY_TYPES = ['educational_video', 'recorded_workshop'] as const;

export function supportsVideoUrlEmbed(libraryType: string): boolean {
  return (VIDEO_EMBED_LIBRARY_TYPES as readonly string[]).includes(libraryType);
}
