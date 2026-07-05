import { Link } from 'react-router-dom';
import { Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { PublicSection } from '@/components/public-design/PublicSection';
import { GlassCard, ScrollReveal } from '@/components/public-design/GlassCard';
import { AcademyCatalogSection } from '@/components/academy/AcademyCatalogSection';

type AcademyPageContentProps = {
  variant?: 'public' | 'portal';
  submitProposalHref?: string;
};

const INTRO =
  'A global platform for live, interactive Zoom workshops in sign language that teach practical AI skills. We are seeking presenters to lead sessions like the example topics below. Join real-time workshops with peers, ask questions, practice together, and build skills in a connected learning community.';

const PRESENTER_BODY =
  'Do you have AI expertise to share with a global deaf community? We are actively seeking presenters to deliver live workshops like the example topics above. Submit your proposal and our team will review it, then help you schedule, promote, and lead your session on Zoom in sign language.';

export function AcademyPageContent({
  variant = 'public',
  submitProposalHref = '/academy/submit',
}: AcademyPageContentProps) {
  const isPortal = variant === 'portal';

  if (isPortal) {
    return (
      <div className="space-y-8">
        <Card className="glass-card floating-hover border border-gray-200 dark:border-[hsl(217,35%,25%)]">
          <CardContent className="space-y-4 p-6 text-center sm:p-8">
            <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
              <img
                src="/slxai-footer-logo.png"
                alt="SLxAI"
                className="h-10 w-auto shrink-0 dark:brightness-0 dark:invert"
              />
              <span className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
                Academy
              </span>
            </div>
            <p className="mx-auto max-w-3xl text-base leading-relaxed text-gray-600 dark:text-gray-300 sm:text-lg">
              {INTRO}
            </p>
          </CardContent>
        </Card>

        <AcademyCatalogSection variant="portal" />

        <Card className="glass-card floating-hover border border-electric-blue/20 dark:border-electric-blue/30">
          <CardContent className="space-y-4 p-6 text-center sm:p-8">
            <Users className="mx-auto h-12 w-12 text-electric-blue" aria-hidden />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white sm:text-3xl">Become a presenter</h2>
            <p className="mx-auto max-w-3xl text-gray-600 dark:text-gray-300">{PRESENTER_BODY}</p>
            <Button asChild size="lg" className="bg-electric-blue hover:bg-electric-blue/90">
              <Link to={submitProposalHref}>Submit a workshop proposal</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
      <PublicSection className="pt-4 pb-10">
        <div className="text-center">
          <ScrollReveal>
            <h1
              className="flex flex-wrap items-center justify-center gap-2 sm:gap-3"
              aria-label="SLxAI Academy"
            >
              <img
                src="/slxai-footer-logo.png"
                alt="SLxAI"
                className="h-[2.21375rem] w-auto shrink-0 -translate-y-[3px] brightness-0 invert public-logo-dark sm:h-[2.6565rem]"
              />
              <img
                src="/slxai-footer-logo.png"
                alt=""
                aria-hidden
                className="hidden h-[2.21375rem] w-auto shrink-0 -translate-y-[3px] public-logo-light sm:h-[2.6565rem]"
              />
              <span className="text-4xl font-bold tracking-tight text-gradient-brand sm:text-5xl">Academy</span>
            </h1>
            <p className="mx-auto mt-6 max-w-3xl text-lg leading-relaxed text-white/70">{INTRO}</p>
          </ScrollReveal>
        </div>
      </PublicSection>

      <AcademyCatalogSection variant="public" />

      <PublicSection className="pb-16" aria-labelledby="presenter-cta-heading">
        <ScrollReveal>
          <GlassCard strong className="w-full text-center">
            <Users className="mx-auto mb-4 h-12 w-12 text-electric-blue" aria-hidden />
            <h2 id="presenter-cta-heading" className="mb-4 text-3xl font-bold text-white">
              Become a presenter
            </h2>
            <p className="mx-auto mb-8 max-w-3xl text-lg leading-relaxed text-white/75">{PRESENTER_BODY}</p>
            <Button asChild size="lg" className="btn-glow rounded-2xl bg-electric-blue hover:bg-electric-blue/90">
              <Link to={submitProposalHref}>Submit a workshop proposal</Link>
            </Button>
          </GlassCard>
        </ScrollReveal>
      </PublicSection>
    </>
  );
}
