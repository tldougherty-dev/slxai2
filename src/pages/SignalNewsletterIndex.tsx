import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { PublicPageShell } from '@/components/public-design/PublicPageShell';
import { PublicSection } from '@/components/public-design/PublicSection';
import { GlassCard, ScrollReveal } from '@/components/public-design/GlassCard';
import { SIGNAL_NEWSLETTER_BRAND } from '@/lib/signalNewsletterTemplate';
import { listPublishedNewsletters } from '@/data/signalNewsletter';
import { useEffect, useState } from 'react';
import type { SignalNewsletter } from '@/lib/signalNewsletterTemplate';
import { ArrowRight } from 'lucide-react';

export default function SignalNewsletterIndex() {
  const [issues, setIssues] = useState<SignalNewsletter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    listPublishedNewsletters()
      .then(setIssues)
      .catch((e) => setError(e instanceof Error ? e.message : 'Failed to load newsletters'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <PublicPageShell>
      <PublicSection className="py-12">
        <div className="mb-10 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-electric-blue">
            {SIGNAL_NEWSLETTER_BRAND}
          </p>
          <h1 className="mt-3 text-3xl font-bold text-white sm:text-4xl public-section-title">
            Newsletter archive
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-white/65">
            Published issues of the SLxAI Signal newsletter. News, community updates, and insights on sign language and AI.
          </p>
        </div>

        {loading && <p className="text-center text-white/60">Loading…</p>}
        {error && (
          <p className="text-center text-red-400" role="alert">
            {error}
          </p>
        )}

        {!loading && !error && issues.length === 0 && (
          <GlassCard className="text-center !p-10">
            <p className="text-white/70">No published issues yet. Check back soon.</p>
          </GlassCard>
        )}

        <div className="space-y-4">
          {issues.map((issue, i) => (
            <ScrollReveal key={issue.id} delay={i * 0.05}>
              <Link to={`/signal/${issue.slug}`} className="block">
                <GlassCard className="card-lift flex items-center justify-between gap-4 !p-5 sm:!p-6">
                  <div className="text-left">
                    <h2 className="text-lg font-semibold text-white sm:text-xl">{issue.title}</h2>
                    <p className="mt-1 text-sm text-white/55">
                      {issue.issueNumber ? `Issue ${issue.issueNumber}` : 'Issue'}
                      {issue.publishedAt ? ` · ${format(issue.publishedAt, 'MMM d, yyyy')}` : ''}
                    </p>
                  </div>
                  <ArrowRight className="h-5 w-5 shrink-0 text-electric-blue" aria-hidden />
                </GlassCard>
              </Link>
            </ScrollReveal>
          ))}
        </div>
      </PublicSection>
    </PublicPageShell>
  );
}
