import { getVideoEmbedUrl } from '@/lib/videoEmbed';

type LibraryVideoEmbedProps = {
  url: string;
  title: string;
  className?: string;
};

export function LibraryVideoEmbed({ url, title, className = '' }: LibraryVideoEmbedProps) {
  const embedUrl = getVideoEmbedUrl(url);
  if (!embedUrl) return null;

  return (
    <div className={`overflow-hidden rounded-lg border border-gray-200 bg-black dark:border-[hsl(217,35%,25%)] ${className}`}>
      <div className="relative aspect-video w-full">
        <iframe
          src={embedUrl}
          title={title}
          className="absolute inset-0 h-full w-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
      </div>
    </div>
  );
}
