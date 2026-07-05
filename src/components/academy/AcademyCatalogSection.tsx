import { BookOpen } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { GlassCard, ScrollReveal } from '@/components/public-design/GlassCard';
import { PublicSection } from '@/components/public-design/PublicSection';
import { ACADEMY_CATALOG } from '@/data/academyCatalog';
import { cn } from '@/lib/utils';

function CatalogTopic({ title, portal }: { title: string; portal?: boolean }) {
  const isSignLanguageTopic = title.toLowerCase().includes('sign language');

  return (
    <li
      className={cn(
        'flex items-start gap-2.5 text-sm leading-snug',
        portal ? 'text-gray-600 dark:text-gray-300' : 'text-white/75',
      )}
    >
      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-electric-blue" aria-hidden />
      <span className={cn(isSignLanguageTopic && 'whitespace-nowrap')}>{title}</span>
    </li>
  );
}

type AcademyCatalogSectionProps = {
  variant?: 'public' | 'portal';
};

export function AcademyCatalogSection({ variant = 'public' }: AcademyCatalogSectionProps) {
  const isPortal = variant === 'portal';

  const heading = (
    <div className={cn('mb-8', isPortal ? 'text-left sm:text-center' : 'text-center')}>
      <h2
        id="academy-catalog-heading"
        className={cn(
          'text-2xl font-bold sm:text-3xl',
          isPortal ? 'text-gray-900 dark:text-white' : 'text-white sm:text-4xl',
        )}
      >
        Workshop Categories
      </h2>
      <p
        className={cn(
          'mt-4 max-w-3xl text-sm sm:text-base',
          isPortal ? 'mx-auto text-gray-600 dark:text-gray-300' : 'mx-auto text-white/65',
        )}
      >
        SLxAI Academy is seeking presenters to lead live Zoom workshops in sign language on practical AI
        skills. The topics below are examples of the kinds of sessions we want to build. You can propose one
        of these ideas or bring your own.
      </p>
    </div>
  );

  const grid = (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {ACADEMY_CATALOG.map((category, i) => {
        const card = isPortal ? (
          <Card
            key={category.id}
            className="flex h-full flex-col border-gray-200 bg-white dark:border-[hsl(217,35%,25%)] dark:bg-[hsl(217,40%,18%)]"
          >
            <CardHeader className="border-b border-gray-100 pb-3 dark:border-[hsl(217,35%,25%)]">
              <div className="flex items-center gap-2.5">
                <BookOpen className="h-5 w-5 shrink-0 text-electric-blue" aria-hidden />
                <CardTitle className="text-lg text-gray-900 dark:text-white">{category.title}</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              <ul className="space-y-2.5">
                {category.topics.map((topic) => (
                  <CatalogTopic key={topic} title={topic} portal />
                ))}
              </ul>
            </CardContent>
          </Card>
        ) : (
          <ScrollReveal key={category.id} delay={(i % 3) * 0.06}>
            <GlassCard className="flex h-full flex-col !p-5 sm:!p-6">
              <div className="mb-4 flex items-center gap-2.5 border-b border-white/10 pb-3">
                <BookOpen className="h-5 w-5 shrink-0 text-electric-blue" aria-hidden />
                <h3 className="text-lg font-semibold text-white">{category.title}</h3>
              </div>
              <ul className="space-y-2.5">
                {category.topics.map((topic) => (
                  <CatalogTopic key={topic} title={topic} />
                ))}
              </ul>
            </GlassCard>
          </ScrollReveal>
        );

        return card;
      })}
    </div>
  );

  if (isPortal) {
    return (
      <section aria-labelledby="academy-catalog-heading" className="space-y-6">
        {heading}
        {grid}
      </section>
    );
  }

  return (
    <PublicSection className="pt-2 pb-10" aria-labelledby="academy-catalog-heading">
      <ScrollReveal>{heading}</ScrollReveal>
      {grid}
    </PublicSection>
  );
}
