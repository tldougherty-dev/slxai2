import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  getSectionLabel,
  parseVideoEmbed,
  type NewsletterBlock,
} from '@/lib/signalNewsletterBlocks';
import { SIGNAL_NEWSLETTER_SECTIONS } from '@/lib/signalNewsletterTemplate';

type NewsletterBlockRendererProps = {
  blocks: NewsletterBlock[];
  className?: string;
};

export function NewsletterBlockRenderer({ blocks, className }: NewsletterBlockRendererProps) {
  return (
    <div className={cn('signal-newsletter-blocks space-y-8', className)}>
      {blocks.map((block) => (
        <NewsletterBlockItem key={block.id} block={block} />
      ))}
    </div>
  );
}

function NewsletterBlockItem({ block }: { block: NewsletterBlock }) {
  switch (block.type) {
    case 'section': {
      const title = block.customSectionTitle?.trim()
        || (block.sectionKey ? getSectionLabel(block.sectionKey) : 'Section');
      return (
        <h2 className="public-card-title border-b border-[hsl(var(--public-muted)/0.2)] pb-2 text-2xl font-semibold">
          {title}
        </h2>
      );
    }
    case 'text':
      if (!block.html?.trim()) return null;
      return (
        <div
          className="signal-newsletter-prose max-w-none text-[hsl(var(--public-text)/0.9)] [&_a]:text-electric-blue [&_a]:underline"
          dangerouslySetInnerHTML={{ __html: block.html }}
        />
      );
    case 'image':
      if (!block.imageUrl?.trim()) return null;
      return (
        <figure
          className={cn(
            'space-y-2',
            block.imageAlign === 'center' && 'mx-auto max-w-2xl text-center',
            block.imageAlign === 'full' && 'w-full',
            block.imageAlign === 'left' && 'max-w-xl',
          )}
        >
          <img
            src={block.imageUrl}
            alt={block.alt || ''}
            className={cn(
              'rounded-xl border border-[hsl(var(--public-muted)/0.15)]',
              block.imageAlign === 'full' ? 'w-full' : 'mx-auto max-h-[480px] w-auto max-w-full object-contain',
            )}
            loading="lazy"
          />
          {block.caption?.trim() && (
            <figcaption className="signal-newsletter-meta text-center text-sm">{block.caption}</figcaption>
          )}
        </figure>
      );
    case 'video': {
      const embed = block.videoUrl ? parseVideoEmbed(block.videoUrl) : null;
      if (!embed) return null;
      return (
        <div className="aspect-video overflow-hidden rounded-xl border border-[hsl(var(--public-muted)/0.15)] bg-black/20">
          <iframe
            src={embed.embedUrl}
            title="Newsletter video"
            className="h-full w-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      );
    }
    case 'quote':
      if (!block.html?.trim()) return null;
      return (
        <blockquote className="border-l-4 border-electric-blue/70 bg-electric-blue/5 px-5 py-4 rounded-r-xl">
          <div
            className="signal-newsletter-prose max-w-none text-lg italic text-[hsl(var(--public-text)/0.9)]"
            dangerouslySetInnerHTML={{ __html: block.html }}
          />
          {block.quoteAttribution?.trim() && (
            <cite className="signal-newsletter-meta mt-3 block text-sm not-italic">— {block.quoteAttribution}</cite>
          )}
        </blockquote>
      );
    case 'button':
      if (!block.buttonUrl?.trim() || !block.buttonLabel?.trim()) return null;
      if (block.buttonUrl.startsWith('/')) {
        return (
          <div className="flex justify-center py-2">
            <Button
              asChild
              className={cn(
                block.buttonStyle === 'outline'
                  ? 'border-electric-blue text-electric-blue hover:bg-electric-blue/10'
                  : 'bg-electric-blue hover:bg-electric-blue/90',
              )}
              variant={block.buttonStyle === 'outline' ? 'outline' : 'default'}
            >
              <Link to={block.buttonUrl}>{block.buttonLabel}</Link>
            </Button>
          </div>
        );
      }
      return (
        <div className="flex justify-center py-2">
          <Button
            asChild
            className={cn(
              block.buttonStyle === 'outline'
                ? 'border-electric-blue text-electric-blue hover:bg-electric-blue/10'
                : 'bg-electric-blue hover:bg-electric-blue/90',
            )}
            variant={block.buttonStyle === 'outline' ? 'outline' : 'default'}
          >
            <a href={block.buttonUrl} target="_blank" rel="noopener noreferrer">
              {block.buttonLabel}
            </a>
          </Button>
        </div>
      );
    case 'divider':
      return <hr className="border-[hsl(var(--public-muted)/0.25)]" />;
    case 'spacer': {
      const size = block.spacerSize ?? 'md';
      const h = size === 'sm' ? 'h-4' : size === 'lg' ? 'h-16' : 'h-8';
      return <div className={h} aria-hidden />;
    }
    default:
      return null;
  }
}

export function hasNewsletterBody(blocks: NewsletterBlock[]): boolean {
  return blocks.some((block) => {
    if (block.type === 'text' || block.type === 'quote') return Boolean(block.html?.trim());
    if (block.type === 'image') return Boolean(block.imageUrl?.trim());
    if (block.type === 'video') return Boolean(parseVideoEmbed(block.videoUrl ?? ''));
    if (block.type === 'button') return Boolean(block.buttonLabel?.trim() && block.buttonUrl?.trim());
    if (block.type === 'section') return true;
    return false;
  });
}

export { SIGNAL_NEWSLETTER_SECTIONS };
