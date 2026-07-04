import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { GlassCard, ScrollReveal } from '@/components/public-design/GlassCard';
import { PublicSection } from '@/components/public-design/PublicSection';
import { SummitSponsorMarquee } from '@/components/summit2026/SummitSponsorMarquee';
import { usePrefersReducedMotion } from '@/hooks/use-prefers-reduced-motion';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';

type GetText = (key: string, fallback: string) => string;

const STATS = [
  { label: 'Countries', value: '30+' },
  { label: 'Organizations', value: '250+' },
  { label: 'Researchers', value: '180+' },
  { label: 'Members', value: '1,200+' },
];

type HomePageContentProps = {
  getText: GetText;
};

export function HomePageContent({ getText }: HomePageContentProps) {
  const reduced = usePrefersReducedMotion();
  const { toast } = useToast();
  const [email, setEmail] = useState('');

  const handleNewsletter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    toast({ title: 'Thank you!', description: 'We will keep you updated on SLxAI news and events.' });
    setEmail('');
  };

  return (
    <>
      <PublicSection className="pb-10 pt-10 lg:pt-14" aria-labelledby="hero-heading">
        <div className="text-center">
          <motion.div
            initial={reduced ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            <h1
              id="hero-heading"
              className="overflow-visible text-4xl font-bold leading-[1.2] tracking-tight sm:text-5xl lg:flex lg:flex-col lg:items-center lg:gap-1 lg:text-7xl lg:leading-[1.15]"
            >
              <span className="text-gradient-brand">{getText('heroTitlePart1', 'Advancing the ')}</span>
              <span className="whitespace-nowrap text-white public-hero-secondary">
                {getText('heroTitlePart2', 'Sign Language ')}
              </span>
              <span>
                <span className="text-gradient-brand">{getText('heroTitlePart3', 'Community with')}</span>{' '}
                <span className="text-white public-hero-secondary">{getText('heroTitlePart4', 'AI')}</span>
              </span>
            </h1>

            <p className="mx-auto mt-5 max-w-3xl text-lg leading-relaxed text-white/70 sm:text-xl">
              {getText(
                'heroDescription',
                'SLxAI unites industry leaders, researchers, and deaf communities worldwide to build ethical, accessible sign language AI through collaboration, not competition.',
              )}
            </p>
            <div className="mt-6 flex justify-center">
              <Button asChild size="lg" className="btn-glow h-12 rounded-2xl bg-electric-blue px-8 text-base hover:bg-electric-blue/90">
                <Link to="/interest">
                  Join the community
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>

            <div id="academy" className="mx-auto mt-5 w-full">
              <GlassCard strong className="text-center !p-6 sm:!p-8">
                <h2
                  className="flex flex-wrap items-center justify-center gap-2 sm:gap-3"
                  aria-label={getText('academySectionTitle', 'SLxAI Academy')}
                >
                  <img
                    src="/slxai-footer-logo.png"
                    alt="SLxAI"
                    className="h-[28px] w-auto shrink-0 sm:h-[34px] lg:h-[43px] brightness-0 invert public-logo-dark"
                  />
                  <img
                    src="/slxai-footer-logo.png"
                    alt=""
                    aria-hidden
                    className="hidden h-[28px] w-auto shrink-0 sm:h-[34px] lg:h-[43px] public-logo-light"
                  />
                  <span className="text-3xl font-bold tracking-tight text-gradient-brand sm:text-4xl lg:text-5xl">
                    {getText('academySectionWord', 'Academy')}
                  </span>
                </h2>
                <div className="mx-auto mt-3 max-w-3xl space-y-1 text-sm text-white/70 sm:text-base lg:text-lg">
                  <p>
                    {getText('academySectionBody', 'Live, interactive Zoom workshops in sign language.')}
                  </p>
                  <p>
                    {getText(
                      'academySectionBodyLine2',
                      'Real-time sessions with hands-on practice and community connection.',
                    )}
                  </p>
                </div>
                <Button asChild className="btn-glow mt-5 bg-electric-blue hover:bg-electric-blue/90">
                  <Link to="/academy">{getText('academySectionCta', 'Explore SLxAI Academy')}</Link>
                </Button>
              </GlassCard>
            </div>
          </motion.div>
        </div>
      </PublicSection>

      <PublicSection id="about" className="py-10">
        <ScrollReveal>
          <div className="mb-6 text-center">
            <h2 className="text-3xl font-bold text-white sm:text-4xl public-section-title">
              {getText('aboutTitle', 'Building the future together')}
            </h2>
            <p className="mx-auto mt-2 max-w-3xl text-white/65">
              {getText(
                'aboutDescription',
                'A cooperative nonprofit where every member organization has a voice in ethical sign language AI development.',
              )}
            </p>
          </div>
        </ScrollReveal>
        <div className="grid gap-4 md:grid-cols-3">
          {[
            { title: getText('missionTitle', 'Mission'), text: getText('missionText', 'To unite industry leaders through a cooperative nonprofit structure, establishing ethical standards and driving innovation in sign language × AI technologies through equal representation and collaborative decision-making.') },
            { title: getText('visionTitle', 'Vision'), text: getText('visionText', 'A world where sign language × AI technologies are developed through industry-wide collaboration, with each company having an equal voice in shaping the future of accessible technology.') },
            { title: getText('goalsTitle', 'Goals'), text: `${getText('goal1', 'Establish cooperative nonprofit structure')}. ${getText('goal2', 'Create industry-wide ethical standards')}. ${getText('goal3', 'Foster collaborative innovation')}.` },
          ].map((card, i) => (
            <ScrollReveal key={card.title} delay={i * 0.1}>
              <GlassCard strong className="h-full !p-5 sm:!p-6">
                <h3 className="text-xl font-semibold text-white public-card-title">{card.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-white/70">{card.text}</p>
              </GlassCard>
            </ScrollReveal>
          ))}
        </div>
        <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4" aria-label="Community statistics">
          {STATS.map((stat, i) => (
            <ScrollReveal key={stat.label} delay={i * 0.08}>
              <GlassCard className="text-center !p-5 sm:!p-6">
                <p className="text-4xl font-bold text-white sm:text-5xl public-stat-value">{stat.value}</p>
                <p className="mt-2 text-base text-white/60 sm:text-lg public-stat-label">{stat.label}</p>
              </GlassCard>
            </ScrollReveal>
          ))}
        </div>
      </PublicSection>

      <PublicSection id="partners" className="py-6" aria-labelledby="partners-heading">
        <ScrollReveal>
          <h2 id="partners-heading" className="sr-only">
            Our Sponsors
          </h2>
        </ScrollReveal>
        <SummitSponsorMarquee className="mb-0" />
      </PublicSection>

      <PublicSection id="summit" className="py-6">
        <ScrollReveal>
          <GlassCard className="w-full text-center !p-5 sm:!p-6">
            <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white/70">
              {getText('summitPastEventLabel', 'Past Event')}
            </span>
            <h2 className="mt-3 text-2xl font-bold text-white sm:text-3xl">
              {getText('summitSectionTitle', 'SLxAI Summit 2026')}
            </h2>
            <p className="mx-auto mt-2 max-w-3xl text-white/65">
              {getText('summitSectionBody', 'Our inaugural summit has concluded. Explore the full program in the archive.')}
            </p>
            <Button asChild variant="outline" className="mt-4 rounded-xl border-white/25 text-white hover:bg-white/10">
              <Link to="/2026">{getText('summitSectionCta', 'View Summit 2026 Archive')}</Link>
            </Button>
          </GlassCard>
        </ScrollReveal>
      </PublicSection>

      <PublicSection id="newsletter" className="pb-10 pt-6 scroll-mt-24" aria-labelledby="newsletter-heading">
        <ScrollReveal>
          <GlassCard strong className="w-full text-center !p-5 sm:!p-6">
            <h2 id="newsletter-heading" className="text-2xl font-bold text-white">
              Stay in the loop
            </h2>
            <p className="mt-1.5 text-sm text-white/65">News, events, and community updates from SLxAI.</p>
            <form onSubmit={handleNewsletter} className="mx-auto mt-4 flex max-w-xl flex-col gap-3 sm:flex-row">
              <Input
                type="email"
                required
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-12 flex-1 rounded-xl border-white/20 bg-white/10 text-white placeholder:text-white/40 focus-visible:ring-electric-blue"
                aria-label="Email address"
              />
              <Button type="submit" className="btn-glow h-12 rounded-xl bg-electric-blue px-8 hover:bg-electric-blue/90">
                Subscribe
              </Button>
            </form>
          </GlassCard>
        </ScrollReveal>
      </PublicSection>
    </>
  );
}
