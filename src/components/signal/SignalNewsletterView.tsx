import { format } from 'date-fns';
import { SIGNAL_NEWSLETTER_BRAND, SIGNAL_NEWSLETTER_SECTIONS, type SignalNewsletter } from '@/lib/signalNewsletterTemplate';

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
      <header className="mb-10 border-b border-white/10 pb-8 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-electric-blue">
          {SIGNAL_NEWSLETTER_BRAND}
        </p>
        <h1 className="mt-3 text-3xl font-bold text-white sm:text-4xl public-section-title">
          {newsletter.title}
        </h1>
        {showMeta && (
          <p className="mt-3 text-sm text-white/55">
            {newsletter.issueNumber ? `Issue ${newsletter.issueNumber}` : null}
            {newsletter.issueNumber && publishedLabel ? ' · ' : null}
            {publishedLabel}
          </p>
        )}
      </header>

      <div className="space-y-10">
        {SIGNAL_NEWSLETTER_SECTIONS.map((section) => {
          const body = newsletter.content[section.key]?.trim();
          if (!body) return null;
          return (
            <section key={section.key} aria-labelledby={`signal-section-${section.key}`}>
              <h2
                id={`signal-section-${section.key}`}
                className="mb-3 text-xl font-semibold text-white public-card-title"
              >
                {section.label}
              </h2>
              <div className="whitespace-pre-wrap text-base leading-relaxed text-white/80">{body}</div>
            </section>
          );
        })}
      </div>
    </article>
  );
}
