import { format } from 'date-fns';
import { SIGNAL_NEWSLETTER_BRAND, type SignalNewsletter } from '@/lib/signalNewsletterTemplate';
import { NewsletterBlockRenderer } from '@/components/signal/NewsletterBlockRenderer';

type SignalNewsletterViewProps = {
  newsletter: SignalNewsletter;
  showMeta?: boolean;
};

export function SignalNewsletterView({ newsletter, showMeta = true }: SignalNewsletterViewProps) {
  const publishedLabel = newsletter.publishedAt
    ? format(newsletter.publishedAt, 'MMMM d, yyyy')
    : null;

  return (
    <article className="signal-newsletter-view">
      {newsletter.content.coverImageUrl && (
        <div className="mb-8 overflow-hidden rounded-2xl border border-[hsl(var(--public-muted)/0.15)]">
          <img
            src={newsletter.content.coverImageUrl}
            alt=""
            className="max-h-[420px] w-full object-cover"
          />
        </div>
      )}

      <header className="signal-newsletter-divider mb-10 border-b pb-8 text-center">
        <p className="signal-newsletter-brand text-xs font-semibold uppercase tracking-[0.2em]">
          {SIGNAL_NEWSLETTER_BRAND}
        </p>
        <h1 className="public-section-title mt-3 text-3xl font-bold sm:text-4xl">{newsletter.title}</h1>
        {newsletter.content.subtitle?.trim() && (
          <p className="signal-newsletter-meta mx-auto mt-3 max-w-2xl text-lg">{newsletter.content.subtitle}</p>
        )}
        {showMeta && (
          <p className="signal-newsletter-meta mt-3 text-sm">
            {newsletter.issueNumber ? `Issue ${newsletter.issueNumber}` : null}
            {newsletter.issueNumber && publishedLabel ? ' · ' : null}
            {publishedLabel}
          </p>
        )}
      </header>

      <NewsletterBlockRenderer blocks={newsletter.content.blocks} />
    </article>
  );
}
