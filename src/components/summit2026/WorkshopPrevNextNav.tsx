import type { Summit2026Workshop } from '@/data/summit2026Workshops';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

type Props = {
  prev: Summit2026Workshop | undefined;
  next: Summit2026Workshop | undefined;
};

const linkClass =
  'group flex max-w-full flex-col gap-0.5 rounded-md border border-gray-200 bg-white px-2.5 py-2 text-left text-xs shadow-sm transition-colors hover:border-electric-blue hover:bg-sky-50/50 sm:max-w-sm';

/**
 * Schedule-ordered Before / Next links for `/2026/workshop/:slug`. First workshop: Next only; last: Before only.
 */
export function WorkshopPrevNextNav({ prev, next }: Props) {
  if (!prev && !next) return null;

  const layoutClass =
    prev && next
      ? 'flex flex-col gap-2 sm:flex-row sm:items-stretch sm:justify-between sm:gap-3'
      : prev
        ? 'flex justify-start'
        : 'flex justify-end';

  return (
    <nav aria-label="Adjacent workshops" className={layoutClass}>
      {prev ? (
        <Link
          to={`/2026/workshop/${prev.slug}`}
          className={`${linkClass} sm:mr-auto`}
          aria-label={`Before: ${prev.sessionTitle}`}
        >
          <span className="flex items-center gap-0.5 text-xs font-semibold text-electric-blue">
            <ChevronLeft className="h-3.5 w-3.5 shrink-0" aria-hidden />
            Before
          </span>
          <span className="line-clamp-2 text-xs leading-snug text-gray-800">{prev.sessionTitle}</span>
        </Link>
      ) : null}
      {next ? (
        <Link
          to={`/2026/workshop/${next.slug}`}
          className={`${linkClass} items-end text-right sm:ml-auto ${prev ? '' : 'ml-0 w-full sm:ml-auto sm:w-auto'}`}
          aria-label={`Next: ${next.sessionTitle}`}
        >
          <span className="flex items-center gap-0.5 text-xs font-semibold text-electric-blue">
            Next
            <ChevronRight className="h-3.5 w-3.5 shrink-0" aria-hidden />
          </span>
          <span className="line-clamp-2 text-xs leading-snug text-gray-800">{next.sessionTitle}</span>
        </Link>
      ) : null}
    </nav>
  );
}
