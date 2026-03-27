import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import type { Summit2026Workshop } from '@/data/summit2026Workshops';

type Props = {
  session: Summit2026Workshop;
};

export function WorkshopSessionCard({ session }: Props) {
  return (
    <Link
      to={`/2026/workshop/${session.slug}`}
      className="block rounded-lg border-2 border-electric-blue bg-white p-4 shadow-lg transition-colors hover:bg-blue-50/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-electric-blue"
    >
      <h4 className="mb-1 text-xl font-bold text-gray-900 dark:text-white">{session.sessionTitle}</h4>
      <p className="mb-2 text-base text-gray-700 dark:text-gray-300">{session.presentersLine}</p>
      <p className="line-clamp-3 text-sm text-gray-600 dark:text-gray-400">{session.summary}</p>
      <span className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-electric-blue">
        Full details
        <ChevronRight className="h-4 w-4" aria-hidden />
      </span>
    </Link>
  );
}
