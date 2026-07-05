import { Link, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PublicPageShell } from '@/components/public-design/PublicPageShell';
import { PublicSection } from '@/components/public-design/PublicSection';
import { GlassCard } from '@/components/public-design/GlassCard';
import { SignalNewsletterView } from '@/components/signal/SignalNewsletterView';
import { getNewsletterBySlug } from '@/data/signalNewsletter';
import type { SignalNewsletter } from '@/lib/signalNewsletterTemplate';

export default function SignalNewsletterIssue() {
  const { slug } = useParams<{ slug: string }>();
  const [newsletter, setNewsletter] = useState<SignalNewsletter | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!slug) return;
    getNewsletterBySlug(slug)
      .then((data) => {
        if (!data) setNotFound(true);
        else setNewsletter(data);
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [slug]);

  return (
    <PublicPageShell>
      <PublicSection className="py-10">
        <Button
          variant="ghost"
          asChild
          className="mb-6 -ml-2 text-[hsl(var(--public-text)/0.8)] hover:bg-[hsl(var(--public-muted)/0.12)] hover:text-[hsl(var(--public-text))]"
        >
          <Link to="/signal" className="inline-flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" aria-hidden />
            All issues
          </Link>
        </Button>

        {loading && <p className="signal-newsletter-meta">Loading…</p>}
        {notFound && (
          <GlassCard className="text-center !p-10">
            <h1 className="public-section-title text-2xl font-bold">Issue not found</h1>
            <p className="signal-newsletter-meta mt-2">This newsletter may be unpublished or the link is incorrect.</p>
            <Button asChild className="mt-6 bg-electric-blue hover:bg-electric-blue/90">
              <Link to="/signal">View archive</Link>
            </Button>
          </GlassCard>
        )}
        {newsletter && (
          <GlassCard strong className="!p-6 sm:!p-10">
            <SignalNewsletterView newsletter={newsletter} />
          </GlassCard>
        )}
      </PublicSection>
    </PublicPageShell>
  );
}
