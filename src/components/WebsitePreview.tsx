import { useState, useEffect } from 'react';
import { Link as LinkIcon, Loader2 } from 'lucide-react';
import { fetchWebsiteMetadata, URLPreview } from '@/lib/urlPreview';

interface WebsitePreviewProps {
  url: string;
}

export function WebsitePreview({ url }: WebsitePreviewProps) {
  const [preview, setPreview] = useState<Partial<URLPreview>>({ isLoading: true });

  useEffect(() => {
    const loadPreview = async () => {
      try {
        const metadata = await fetchWebsiteMetadata(url);
        setPreview({ ...metadata, isLoading: false });
      } catch (error) {
        setPreview({
          title: new URL(url).hostname.replace('www.', ''),
          description: '',
          image: '',
          siteName: new URL(url).hostname.replace('www.', ''),
          isLoading: false,
        });
      }
    };

    loadPreview();
  }, [url]);

  if (preview.isLoading) {
    return (
      <div className="mt-3 border border-gray-200 rounded-lg p-4 flex items-center justify-center">
        <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
        <span className="ml-2 text-sm text-gray-500">Loading preview...</span>
      </div>
    );
  }

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="mt-3 block border border-gray-200 rounded-lg overflow-hidden hover:border-blue-300 transition-colors"
    >
      <div className="flex flex-col">
        {preview.image && (
          <img
            src={preview.image}
            alt={preview.title || url}
            className="w-full h-48 object-cover"
            onError={(e) => {
              // Hide image if it fails to load
              e.currentTarget.style.display = 'none';
            }}
          />
        )}
        <div className="p-3 space-y-1">
          {preview.siteName && (
            <p className="text-xs text-gray-500 dark:text-white uppercase">{preview.siteName}</p>
          )}
          {preview.title && (
            <p className="font-semibold text-gray-900 dark:text-white line-clamp-2">{preview.title}</p>
          )}
          {preview.description && (
            <p className="text-sm text-gray-600 dark:text-white line-clamp-2 leading-tight">{preview.description}</p>
          )}
          <p className="text-xs text-blue-600 dark:text-blue-400 flex items-center gap-1 mt-2">
            <LinkIcon className="h-3 w-3" />
            {url.replace(/^https?:\/\//, '').replace(/\/$/, '')}
          </p>
        </div>
      </div>
    </a>
  );
}

