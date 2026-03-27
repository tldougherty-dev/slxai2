import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { presenterCreditWithItalicOrgs } from '@/components/summit2026/summit2026PresenterCredit';
import type { Summit2026Workshop } from '@/data/summit2026Workshops';

type Props = {
  session: Summit2026Workshop;
  /** When false, card is static (no link to program book). Default true. */
  linkToProgramBook?: boolean;
};

const cardClassName =
  'block rounded-lg border-2 border-electric-blue bg-white p-4 shadow-lg';

export function WorkshopSessionCard({ session, linkToProgramBook = true }: Props) {
  const creditLine = presenterCreditWithItalicOrgs(session, { stripLeadingLabels: !linkToProgramBook });

  const inner = (
    <>
      <h4 className="mb-1 text-xl font-bold text-gray-900 dark:text-white">{session.sessionTitle}</h4>
      <p className="mb-2 text-base text-gray-700 dark:text-gray-300">{creditLine}</p>
      <p className="line-clamp-3 text-sm text-gray-600 dark:text-gray-400">{session.summary}</p>
      {linkToProgramBook ? (
        <span className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-electric-blue">
          Full details
          <ChevronRight className="h-4 w-4" aria-hidden />
        </span>
      ) : null}
    </>
  );

  if (!linkToProgramBook) {
    return <div className={cardClassName}>{inner}</div>;
  }

  return (
    <Link
      to={`/2026/workshop/${session.slug}`}
      className={`${cardClassName} transition-colors hover:bg-blue-50/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-electric-blue`}
    >
      {inner}
    </Link>
  );
}
