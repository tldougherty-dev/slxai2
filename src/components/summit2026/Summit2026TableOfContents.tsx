import type { Summit2026ProgramBookGetText } from '@/components/summit2026/summit2026ProgramBookTypes';

type Props = {
  getText: Summit2026ProgramBookGetText;
};

const tocLinkClass =
  'flex min-h-[44px] w-full items-center justify-center rounded-md border border-electric-blue/80 bg-electric-blue px-2 py-2 text-center text-xs font-bold leading-snug text-white shadow-[0_4px_12px_rgba(0,0,0,0.22),0_2px_8px_rgba(0,128,255,0.28)] transition-[color,box-shadow] duration-200 ease-out hover:bg-electric-blue/90 hover:shadow-[0_8px_20px_rgba(0,0,0,0.26),0_4px_14px_rgba(0,128,255,0.38)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-electric-blue dark:bg-electric-blue dark:text-white dark:shadow-[0_4px_14px_rgba(0,0,0,0.45),0_2px_8px_rgba(0,128,255,0.25)] dark:hover:bg-electric-blue/90 dark:hover:shadow-[0_8px_22px_rgba(0,0,0,0.5),0_4px_14px_rgba(0,128,255,0.35)] md:min-h-[56px] md:px-3 md:py-2.5 md:text-base md:leading-tight lg:text-lg';

const tocItems = [
  { href: '#summit-schedule-day-1', labelKey: 'tocDay1', fallback: 'Day 1' },
  { href: '#summit-evening-event', labelKey: 'tocEveningEvent', fallback: 'Evening event' },
  { href: '#summit-schedule-day-2', labelKey: 'tocDay2', fallback: 'Day 2' },
  { href: '#summit-sponsors-by-tier', labelKey: 'tocSponsors', fallback: 'Sponsors' },
  { href: '#summit-about', labelKey: 'tocAbout', fallback: 'About the Summit' },
  { href: '#summit-master-of-ceremonies', labelKey: 'tocMasterOfCeremonies', fallback: 'Master of Ceremonies' },
  { href: '#summit-committee', labelKey: 'tocSummitCommittee', fallback: 'Summit Committee' },
] as const;

/** Row 1: four items in four columns; row 2: three items in three columns (see grid classes below). */
const TOC_ROW1 = tocItems.slice(0, 4);
const TOC_ROW2 = tocItems.slice(4);

export function Summit2026TableOfContents({ getText }: Props) {
  const renderRow = (row: readonly (typeof tocItems)[number][]) => (
    <>
      {row.map((item) => (
        <li key={item.href} className="min-w-0">
          <a href={item.href} className={tocLinkClass}>
            {getText(item.labelKey, item.fallback)}
          </a>
        </li>
      ))}
    </>
  );

  return (
    <nav
      aria-labelledby="summit-program-toc-title"
      className="mb-8 w-full md:col-span-2"
    >
      <div className="rounded-lg border border-gray-200 bg-white shadow-md dark:border-gray-700 dark:bg-gray-900">
        <h3
          id="summit-program-toc-title"
          className="rounded-t-lg bg-gray-100 px-4 py-3 text-center text-2xl font-bold leading-tight text-gray-900 dark:bg-gray-800 dark:text-white sm:py-3.5 sm:text-3xl"
        >
          {getText('tocTitle', 'Table of contents')}
        </h3>
        <div className="rounded-b-lg p-2.5 sm:p-4">
          <div className="flex flex-col gap-2 md:gap-3">
            <ul className="grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3">
              {renderRow(TOC_ROW1)}
            </ul>
            <ul className="grid grid-cols-3 gap-2 sm:gap-3">
              {renderRow(TOC_ROW2)}
            </ul>
          </div>
        </div>
      </div>
    </nav>
  );
}
