import type { VideoResource } from '@/data/videosOrder';

/** Embedded video entry for library tabs (YouTube/Vimeo). */
export interface LibraryEmbeddedVideo {
  id: string;
  title: string;
  description?: string;
  embedUrl: string;
  source?: string;
  uploadedBy?: string;
  lastModified?: string;
  tags?: string[];
}

export function videoResourceToEmbedded(video: VideoResource): LibraryEmbeddedVideo {
  return {
    id: video.id,
    title: video.name,
    description: video.description,
    embedUrl: video.embedUrl,
    source: video.uploadedBy,
    uploadedBy: video.uploadedBy,
    lastModified: video.lastModified,
    tags: ['member company'],
  };
}

export function dedupeEmbeddedVideosByUrl(videos: LibraryEmbeddedVideo[]): LibraryEmbeddedVideo[] {
  const seen = new Set<string>();
  return videos.filter((video) => {
    const key = video.embedUrl.trim().toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
