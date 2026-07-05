import { useNavigate } from 'react-router-dom';
import {
  FileText,
  Download,
  FileSpreadsheet,
  BookOpen,
  Eye,
  Loader2,
  Video,
  Database,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import {
  FileResource,
  ResourceType,
  resolveFileLibraryType,
  type FileCategory,
} from '@/data/filesOrder';
import type { LibraryContentType } from '@/data/libraryData';
import { libraryFileViewPath } from '@/lib/libraryPaths';
import { isVideoEmbedUrl, supportsVideoUrlEmbed } from '@/lib/videoEmbed';
import { LibraryVideoEmbed } from '@/components/library/LibraryVideoEmbed';

function getResourceIcon(type: ResourceType) {
  switch (type) {
    case 'spreadsheet':
      return <FileSpreadsheet className="h-4 w-4 text-green-600" />;
    case 'ebook':
      return <BookOpen className="h-4 w-4 text-purple-500" />;
    case 'video':
      return <Video className="h-4 w-4 text-red-500" />;
    case 'dataset':
      return <Database className="h-4 w-4 text-amber-500" />;
    default:
      return <FileText className="h-4 w-4 text-electric-blue" />;
  }
}

type LibraryMemberUploadsProps = {
  files: FileResource[];
  categories: FileCategory[];
  libraryType: LibraryContentType;
  isLoading?: boolean;
};

export function LibraryMemberUploads({
  files,
  categories,
  libraryType,
  isLoading = false,
}: LibraryMemberUploadsProps) {
  const navigate = useNavigate();
  const { toast } = useToast();

  const categoryNameById = new Map(categories.map((c) => [c.id, c.name]));

  const filtered = files.filter(
    (file) =>
      resolveFileLibraryType(file, file.categoryId ? categoryNameById.get(file.categoryId) : undefined) ===
      libraryType,
  );

  const embedVideos = filtered.filter((file) => isVideoEmbedUrl(file.fileUrl));
  const fileUploads = filtered.filter((file) => !isVideoEmbedUrl(file.fileUrl));
  const showEmbeds = supportsVideoUrlEmbed(libraryType);

  const handleDownload = (file: FileResource) => {
    if (!file.fileUrl) {
      toast({
        title: 'Download unavailable',
        description: 'File URL not found.',
        variant: 'destructive',
      });
      return;
    }
    const downloadWindow = window.open(file.fileUrl, '_blank', 'noopener,noreferrer');
    if (!downloadWindow) {
      window.location.href = file.fileUrl;
    }
    toast({
      title: 'Download started',
      description: `Downloading ${file.name}...`,
    });
  };

  if (isLoading) {
    return (
      <div className="py-8 text-center">
        <Loader2 className="mx-auto mb-3 h-6 w-6 animate-spin text-electric-blue" />
        <p className="text-sm text-gray-500 dark:text-gray-400">Loading uploads...</p>
      </div>
    );
  }

  if (filtered.length === 0) {
    return (
      <p className="py-6 text-center text-sm text-gray-500 dark:text-gray-400">
        No member uploads in this category yet.
      </p>
    );
  }

  return (
    <div className="space-y-6">
      {showEmbeds && embedVideos.length > 0 && (
        <div className="space-y-4">
          <p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
            Embedded videos
          </p>
          <div className="grid gap-6 sm:grid-cols-2">
            {embedVideos.map((file) => (
              <div
                key={file.id}
                className="space-y-3 rounded-lg border border-gray-100 bg-white p-4 dark:border-[hsl(217,35%,25%)] dark:bg-[hsl(217,40%,16%)]"
              >
                <LibraryVideoEmbed url={file.fileUrl!} title={file.name} />
                <div>
                  <button
                    type="button"
                    className="text-left text-sm font-semibold text-gray-900 hover:text-electric-blue dark:text-white"
                    onClick={() => navigate(libraryFileViewPath(file.id))}
                  >
                    {file.name}
                  </button>
                  {file.description && (
                    <p className="mt-1 text-xs text-gray-600 dark:text-gray-300">{file.description}</p>
                  )}
                  <div className="mt-1 flex flex-wrap gap-x-2 text-xs text-gray-500 dark:text-gray-400">
                    {file.fileYear && <span>{file.fileYear}</span>}
                    {file.authors && file.authors.length > 0 && <span>by {file.authors.join(', ')}</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {fileUploads.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
            {showEmbeds && embedVideos.length > 0 ? 'Other uploads' : 'Member uploads'}
          </p>
          <div className="divide-y divide-gray-100 rounded-lg border border-gray-100 dark:divide-[hsl(217,35%,25%)] dark:border-[hsl(217,35%,25%)]">
            {fileUploads.map((file) => (
              <div
                key={file.id}
                className="flex items-center gap-3 bg-white px-4 py-3 transition-colors hover:bg-electric-blue/5 dark:bg-[hsl(217,40%,16%)]"
              >
                <div className="shrink-0">{getResourceIcon(file.type)}</div>
                <div className="min-w-0 flex-1">
                  <button
                    type="button"
                    className="text-left text-sm font-medium text-gray-900 hover:text-electric-blue dark:text-white"
                    onClick={() => navigate(libraryFileViewPath(file.id))}
                  >
                    {file.name}
                  </button>
                  <div className="mt-0.5 flex flex-wrap gap-x-2 text-xs text-gray-500 dark:text-gray-400">
                    {file.fileYear && (
                      <span>
                        {file.fileMonth
                          ? `${new Date(2000, file.fileMonth - 1).toLocaleString('default', { month: 'short' })} ${file.fileYear}`
                          : file.fileYear}
                      </span>
                    )}
                    {file.authors && file.authors.length > 0 && <span>by {file.authors.join(', ')}</span>}
                    {file.uploadedBy && <span>uploaded by {file.uploadedBy}</span>}
                  </div>
                  {file.description && (
                    <p className="mt-0.5 line-clamp-1 text-xs text-gray-500 dark:text-gray-400">{file.description}</p>
                  )}
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 px-2"
                    onClick={() => navigate(libraryFileViewPath(file.id))}
                    title="View file"
                  >
                    <Eye className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 px-2"
                    onClick={() => handleDownload(file)}
                    title="Download"
                  >
                    <Download className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
