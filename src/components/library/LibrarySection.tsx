import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { BookOpen, Database, PlayCircle, Video, FileText, Upload, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  LIBRARY_CONTENT_SECTIONS,
  LIBRARY_UPLOAD_SECTION,
  getCuratedResourcesByType,
  type LibraryContentType,
  type LibraryTabType,
} from '@/data/libraryData';
import { getCategories, getOrderedFiles, type FileCategory, type FileResource } from '@/data/filesOrder';
import { getOrderedVideos } from '@/data/videosOrder';
import {
  dedupeEmbeddedVideosByUrl,
  videoResourceToEmbedded,
  type LibraryEmbeddedVideo,
} from '@/data/libraryEducationalVideos';
import { LibraryMemberUploads } from '@/components/library/LibraryMemberUploads';
import { LibraryUploadPanel } from '@/components/library/LibraryUploadPanel';
import { LibraryVideoGrid } from '@/components/library/LibraryVideoGrid';
import { useToast } from '@/hooks/use-toast';
import { useRealtimeUpdates } from '@/lib/realtime';
import { getVideoEmbedUrl } from '@/lib/videoEmbed';

const CONTENT_ICONS: Record<LibraryContentType, typeof BookOpen> = {
  research: BookOpen,
  dataset: Database,
  educational_video: PlayCircle,
  recorded_workshop: Video,
  files: FileText,
};

const VALID_TABS = new Set<LibraryTabType>([
  ...LIBRARY_CONTENT_SECTIONS.map((s) => s.type),
  'upload',
]);

function parseTabParam(value: string | null): LibraryTabType {
  if (value && VALID_TABS.has(value as LibraryTabType)) {
    return value as LibraryTabType;
  }
  return 'research';
}

export function LibrarySection() {
  const { toast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const tabFromUrl = parseTabParam(searchParams.get('tab'));
  const [activeTab, setActiveTab] = useState<LibraryTabType>(tabFromUrl);
  const [files, setFiles] = useState<FileResource[]>([]);
  const [categories, setCategories] = useState<FileCategory[]>([]);
  const [legacyVideos, setLegacyVideos] = useState<LibraryEmbeddedVideo[]>([]);
  const [isLoadingFiles, setIsLoadingFiles] = useState(true);
  const [isLoadingVideos, setIsLoadingVideos] = useState(false);

  const loadFiles = useCallback(async () => {
    setIsLoadingFiles(true);
    try {
      const [filesData, categoriesData] = await Promise.all([getOrderedFiles(), getCategories()]);
      setFiles(filesData);
      setCategories(categoriesData);
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to load library uploads. Please refresh the page.',
        variant: 'destructive',
      });
    } finally {
      setIsLoadingFiles(false);
    }
  }, [toast]);

  const loadLegacyVideos = useCallback(async () => {
    setIsLoadingVideos(true);
    try {
      const videos = await getOrderedVideos();
      setLegacyVideos(dedupeEmbeddedVideosByUrl(videos.map(videoResourceToEmbedded)));
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to load educational videos. Please refresh the page.',
        variant: 'destructive',
      });
    } finally {
      setIsLoadingVideos(false);
    }
  }, [toast]);

  useEffect(() => {
    loadFiles();
  }, [loadFiles]);

  useEffect(() => {
    if (activeTab === 'educational_video') {
      loadLegacyVideos();
    }
  }, [activeTab, loadLegacyVideos]);

  useEffect(() => {
    setActiveTab(tabFromUrl);
  }, [tabFromUrl]);

  useRealtimeUpdates((update) => {
    if (update.type === 'file') loadFiles();
  }, []);

  const handleTabChange = (tab: LibraryTabType) => {
    setActiveTab(tab);
    const next = new URLSearchParams(searchParams);
    if (tab === 'research') {
      next.delete('tab');
    } else {
      next.set('tab', tab);
    }
    setSearchParams(next, { replace: true });
  };

  const allTabs = [...LIBRARY_CONTENT_SECTIONS, LIBRARY_UPLOAD_SECTION];

  if (activeTab === 'upload') {
    return (
      <div className="space-y-6">
        <TabBar tabs={allTabs} activeTab={activeTab} onChange={handleTabChange} />
        <LibraryUploadPanel categories={categories} onUploaded={loadFiles} />
      </div>
    );
  }

  const activeSection = LIBRARY_CONTENT_SECTIONS.find((s) => s.type === activeTab)!;
  const curated = getCuratedResourcesByType(activeTab);
  const ActiveIcon = CONTENT_ICONS[activeTab];

  const legacyEmbedUrls = new Set(legacyVideos.map((video) => video.embedUrl.trim().toLowerCase()));
  const filesForTab =
    activeTab === 'educational_video'
      ? files.filter((file) => {
          const embed = getVideoEmbedUrl(file.fileUrl);
          if (!embed) return true;
          return !legacyEmbedUrls.has(embed.toLowerCase());
        })
      : files;

  return (
    <div className="space-y-6">
      <TabBar tabs={allTabs} activeTab={activeTab} onChange={handleTabChange} />

      <Card className="glass-card border border-gray-200 dark:border-[hsl(217,35%,25%)]">
        <CardHeader>
          <div className="flex items-start gap-3">
            <ActiveIcon className="mt-0.5 h-6 w-6 shrink-0 text-electric-blue" aria-hidden />
            <div>
              <CardTitle className="text-xl text-gray-900 dark:text-white">{activeSection.title}</CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-300">
                {activeSection.description}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {activeTab === 'educational_video' && (
            <>
              {isLoadingVideos ? (
                <p className="py-6 text-center text-sm text-gray-500 dark:text-gray-400">Loading videos...</p>
              ) : (
                <LibraryVideoGrid
                  videos={legacyVideos}
                  title="Member company videos"
                />
              )}
            </>
          )}

          {curated.length > 0 && (
            <div className="space-y-3">
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                Curated resources
              </p>
              {curated.map((resource) => {
                const isExternal = resource.url.startsWith('http');
                return (
                  <div
                    key={resource.id}
                    className="flex flex-col gap-3 rounded-lg border border-gray-100 bg-white p-4 dark:border-[hsl(217,35%,25%)] dark:bg-[hsl(217,40%,16%)] sm:flex-row sm:items-start sm:justify-between"
                  >
                    <div className="min-w-0 flex-1 space-y-2">
                      <p className="font-semibold text-gray-900 dark:text-white">{resource.title}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-300">{resource.description}</p>
                      <div className="flex flex-wrap gap-2">
                        {resource.source && (
                          <Badge variant="outline" className="text-xs">
                            {resource.source}
                          </Badge>
                        )}
                        {resource.tags?.map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <Button asChild variant="outline" size="sm" className="shrink-0">
                      <a
                        href={resource.url}
                        target={isExternal ? '_blank' : undefined}
                        rel={isExternal ? 'noopener noreferrer' : undefined}
                      >
                        {isExternal ? 'Open' : 'View'}
                        <ExternalLink className="ml-2 h-3.5 w-3.5" />
                      </a>
                    </Button>
                  </div>
                );
              })}
            </div>
          )}

          <LibraryMemberUploads
            files={filesForTab}
            categories={categories}
            libraryType={activeTab}
            isLoading={isLoadingFiles}
          />
        </CardContent>
      </Card>
    </div>
  );
}

function TabBar({
  tabs,
  activeTab,
  onChange,
}: {
  tabs: Array<{ type: LibraryTabType; title: string }>;
  activeTab: LibraryTabType;
  onChange: (tab: LibraryTabType) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2 border-b border-gray-200 pb-2 dark:border-[hsl(217,35%,25%)]">
      {tabs.map((section) => {
        const Icon =
          section.type === 'upload'
            ? Upload
            : CONTENT_ICONS[section.type as LibraryContentType];
        const isActive = section.type === activeTab;
        return (
          <Button
            key={section.type}
            type="button"
            variant={isActive ? 'default' : 'ghost'}
            size="sm"
            onClick={() => onChange(section.type)}
            className={isActive ? 'bg-electric-blue hover:bg-electric-blue/90' : 'text-gray-700 dark:text-gray-200'}
          >
            <Icon className="mr-2 h-4 w-4" />
            {section.title}
          </Button>
        );
      })}
    </div>
  );
}
