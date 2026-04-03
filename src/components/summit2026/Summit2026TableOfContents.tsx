import type { Summit2026ProgramBookGetText } from '@/components/summit2026/summit2026ProgramBookTypes';

type Props = {
  getText: Summit2026ProgramBookGetText;
};

const tocLinkClass =
  'flex min-h-[44px] w-full items-center justify-center rounded-md border border-electric-blue/80 bg-electric-blue px-1 py-2 text-center text-[10px] font-bold leading-tight text-white shadow-sm transition-colors hover:bg-electric-blue/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-electric-blue dark:bg-electric-blue dark:text-white dark:hover:bg-electric-blue/90 min-[380px]:text-xs sm:min-h-[52px] sm:px-2.5 sm:text-sm';

export function Summit2026TableOfContents({ getText }: Props) {
  const items = [
    { href: '#summit-schedule-day-1', labelKey: 'tocDay1', fallback: 'Day 1' },
    { href: '#summit-schedule-day-2', labelKey: 'tocDay2', fallback: 'Day 2' },
    { href: '#summit-sponsors-by-tier', labelKey: 'tocSponsors', fallback: 'Sponsors' },
    { href: '#summit-welcome-letter', labelKey: 'tocWelcomeLetter', fallback: 'Welcome Letter from the Host' },
    { href: '#summit-about', labelKey: 'tocAbout', fallback: 'About the Summit' },
    { href: '#summit-master-of-ceremonies', labelKey: 'tocMasterOfCeremonies', fallback: 'Master of Ceremonies' },
    { href: '#summit-story-slxai', labelKey: 'tocStorySlxai', fallback: 'The Story Behind SLxAI' },
    { href: '#summit-committee', labelKey: 'tocSummitCommittee', fallback: 'Summit Committee' },
  ] as const;

  return (
    <nav
      aria-label={getText('tocNavLabel', 'Table of contents')}
      className="mb-8 w-full md:col-span-2"
    >
      <div className="rounded-lg border border-gray-200 bg-white shadow-md dark:border-gray-700 dark:bg-gray-900">
        <h3 className="rounded-t-lg bg-gray-100 px-4 py-2.5 text-center text-base font-bold text-gray-900 dark:bg-gray-800 dark:text-white sm:py-3 sm:text-lg">
          {getText('tocTitle', 'Table of contents')}
        </h3>
        <div className="rounded-b-lg p-2.5 sm:p-4">
          <ul className="grid grid-cols-4 gap-1.5 sm:gap-2.5">
            {items.map((item) => (
              <li key={item.href} className="min-w-0">
                <a href={item.href} className={tocLinkClass}>
                  {getText(item.labelKey, item.fallback)}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </nav>
  );
}
