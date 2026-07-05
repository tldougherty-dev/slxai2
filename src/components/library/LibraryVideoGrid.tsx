import { Badge } from '@/components/ui/badge';
import { LibraryVideoEmbed } from '@/components/library/LibraryVideoEmbed';
import type { LibraryEmbeddedVideo } from '@/data/libraryEducationalVideos';

type LibraryVideoGridProps = {
  videos: LibraryEmbeddedVideo[];
  title?: string;
};

export function LibraryVideoGrid({ videos, title = 'Educational videos' }: LibraryVideoGridProps) {
  if (videos.length === 0) return null;

  return (
    <div className="space-y-4">
      <p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">{title}</p>
      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
        {videos.map((video) => (
          <div
            key={video.id}
            className="space-y-3 rounded-lg border border-gray-100 bg-white p-4 dark:border-[hsl(217,35%,25%)] dark:bg-[hsl(217,40%,16%)]"
          >
            <LibraryVideoEmbed url={video.embedUrl} title={video.title} />
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{video.title}</h3>
              {video.description && (
                <p className="text-xs leading-relaxed text-gray-600 dark:text-gray-300">{video.description}</p>
              )}
              <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                {video.source && <span>{video.source}</span>}
                {video.lastModified && <span>· {video.lastModified}</span>}
              </div>
              {video.tags && video.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {video.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
