import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ExternalLink, BookOpen, Database, PlayCircle, Video, FileText } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  ACADEMY_LIBRARY_SECTIONS,
  getLibraryResourcesByType,
  type AcademyLibraryResourceType,
} from '@/data/academyLibrary';
import { MemberFilesLibrary } from '@/pages/membership-portal/Files';

const SECTION_ICONS: Record<AcademyLibraryResourceType, typeof BookOpen> = {
  research: BookOpen,
  dataset: Database,
  educational_video: PlayCircle,
  recorded_workshop: Video,
  files: FileText,
};

const VALID_TABS = new Set<AcademyLibraryResourceType>([
  ...ACADEMY_LIBRARY_SECTIONS.map((s) => s.type),
]);

function parseTabParam(value: string | null): AcademyLibraryResourceType {
  if (value && VALID_TABS.has(value as AcademyLibraryResourceType)) {
    return value as AcademyLibraryResourceType;
  }
  return 'research';
}

export function AcademyLibrarySection() {
  const [searchParams, setSearchParams] = useSearchParams();
  const tabFromUrl = parseTabParam(searchParams.get('tab'));
  const [activeType, setActiveType] = useState<AcademyLibraryResourceType>(tabFromUrl);

  useEffect(() => {
    setActiveType(tabFromUrl);
  }, [tabFromUrl]);

  const activeSection = ACADEMY_LIBRARY_SECTIONS.find((s) => s.type === activeType)!;
  const resources = getLibraryResourcesByType(activeType);
  const ActiveIcon = SECTION_ICONS[activeType];

  const handleTabChange = (type: AcademyLibraryResourceType) => {
    setActiveType(type);
    const next = new URLSearchParams(searchParams);
    if (type === 'research') {
      next.delete('tab');
    } else {
      next.set('tab', type);
    }
    setSearchParams(next, { replace: true });
  };

  return (
    <section className="space-y-6" aria-labelledby="academy-library-heading">
      <div className="space-y-2">
        <h2 id="academy-library-heading" className="text-2xl font-bold text-gray-900 dark:text-white sm:text-3xl">
          Library
        </h2>
        <p className="max-w-3xl text-sm text-gray-600 dark:text-gray-300 sm:text-base">
          Research, open datasets, educational videos, recorded workshops, and member-shared files — curated for
          SLxAI members exploring AI in sign language communities.
        </p>
      </div>

      <div className="flex flex-wrap gap-2 border-b border-gray-200 pb-2 dark:border-[hsl(217,35%,25%)]">
        {ACADEMY_LIBRARY_SECTIONS.map((section) => {
          const Icon = SECTION_ICONS[section.type];
          const isActive = section.type === activeType;
          return (
            <Button
              key={section.type}
              type="button"
              variant={isActive ? 'default' : 'ghost'}
              size="sm"
              onClick={() => handleTabChange(section.type)}
              className={
                isActive
                  ? 'bg-electric-blue hover:bg-electric-blue/90'
                  : 'text-gray-700 dark:text-gray-200'
              }
            >
              <Icon className="mr-2 h-4 w-4" />
              {section.title}
            </Button>
          );
        })}
      </div>

      {activeType === 'files' ? (
        <MemberFilesLibrary embedded />
      ) : (
        <Card className="glass-card floating-hover border border-gray-200 dark:border-[hsl(217,35%,25%)]">
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
          <CardContent className="space-y-4">
            {resources.length === 0 ? (
              <p className="py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                Resources in this category will be added soon.
              </p>
            ) : (
              resources.map((resource) => {
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
                        {resource.signLanguage && (
                          <Badge variant="outline" className="text-xs">
                            {resource.signLanguage}
                          </Badge>
                        )}
                        {resource.tags?.map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <Button asChild variant="outline" size="sm" className="shrink-0 bg-white dark:bg-transparent">
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
              })
            )}
          </CardContent>
        </Card>
      )}
    </section>
  );
}
