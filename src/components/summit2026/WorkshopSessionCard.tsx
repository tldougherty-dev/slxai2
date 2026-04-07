import { Link } from 'react-router-dom';
import { presenterCreditWithItalicOrgs } from '@/components/summit2026/summit2026PresenterCredit';
import { takeFirstSentences } from '@/components/summit2026/takeFirstSentences';
import type { Summit2026Workshop } from '@/data/summit2026Workshops';

type Props = {
  session: Summit2026Workshop;
  /** When false, card is static (no link to program book). Default true. */
  linkToProgramBook?: boolean;
  /** When set (e.g. 2 on homepage), show only the first N sentences of `summary`. */
  maxSummarySentences?: number;
};

const cardClassName =
  'block rounded-lg border-2 border-electric-blue bg-white p-3 shadow-lg sm:p-4';

export function WorkshopSessionCard({
  session,
  linkToProgramBook = true,
  maxSummarySentences,
}: Props) {
  const creditLine = presenterCreditWithItalicOrgs(session, { stripLeadingLabels: !linkToProgramBook });
  const summaryText =
    maxSummarySentences != null && maxSummarySentences > 0
      ? takeFirstSentences(session.summary, maxSummarySentences)
      : session.summary;

  const inner = (
    <>
      <h4 className="mb-1.5 text-lg font-bold leading-snug text-gray-900 dark:text-white sm:text-xl">
        {session.sessionTitle}
      </h4>
      <p className="mb-2 text-sm leading-snug text-gray-700 dark:text-gray-300 sm:text-base">{creditLine}</p>
      <p
        className={
          maxSummarySentences != null
            ? 'text-sm leading-snug text-gray-600 dark:text-gray-400'
            : 'text-sm leading-snug text-gray-600 dark:text-gray-400 max-md:line-clamp-none md:line-clamp-3'
        }
      >
        {summaryText}
      </p>
      {linkToProgramBook ? (
        <span className="mt-3 hidden text-sm font-medium text-electric-blue md:block">Full details</span>
      ) : null}
    </>
  );

  if (!linkToProgramBook) {
    return <div className={cardClassName}>{inner}</div>;
  }

  return (
    <Link
      to={`/2026/workshop/${session.slug}`}
      aria-label={`${session.sessionTitle}, full workshop details`}
      className={`${cardClassName} touch-manipulation transition-colors hover:bg-blue-50/90 active:bg-blue-100/80 max-md:shadow-md max-md:active:scale-[0.99] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-electric-blue`}
    >
      {inner}
    </Link>
  );
}
