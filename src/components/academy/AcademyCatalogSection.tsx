import { BookOpen } from 'lucide-react';
import { GlassCard, ScrollReveal } from '@/components/public-design/GlassCard';
import { PublicSection } from '@/components/public-design/PublicSection';
import { ACADEMY_CATALOG } from '@/data/academyCatalog';
import { cn } from '@/lib/utils';

function CatalogTopic({ title }: { title: string }) {
  const isSignLanguageTopic = title.toLowerCase().includes('sign language');

  return (
    <li className="flex items-start gap-2.5 text-sm leading-snug text-white/75">
      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-electric-blue" aria-hidden />
      <span className={cn(isSignLanguageTopic && 'whitespace-nowrap')}>{title}</span>
    </li>
  );
}

export function AcademyCatalogSection() {
  return (
    <PublicSection className="pt-2 pb-10" aria-labelledby="academy-catalog-heading">
      <ScrollReveal>
        <div className="mb-8 text-center">
          <h2 id="academy-catalog-heading" className="text-3xl font-bold text-white sm:text-4xl">
            Example workshop topics
          </h2>
          <p className="mx-auto mt-4 max-w-3xl text-white/65">
            SLxAI Academy is seeking presenters to lead live Zoom workshops in sign language on practical AI
            skills. The topics below are examples of the kinds of sessions we want to build. You can propose
            one of these ideas or bring your own.
          </p>
        </div>
      </ScrollReveal>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {ACADEMY_CATALOG.map((category, i) => (
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
        ))}
      </div>
    </PublicSection>
  );
}
