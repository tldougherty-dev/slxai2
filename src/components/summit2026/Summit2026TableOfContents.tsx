import type { Summit2026ProgramBookGetText } from '@/components/summit2026/summit2026ProgramBookTypes';

type Props = {
  getText: Summit2026ProgramBookGetText;
};

const tocLinkClass =
  'inline-flex min-h-[44px] items-center justify-center rounded-md border border-electric-blue/80 bg-electric-blue px-3 py-2 text-center text-sm font-bold text-white shadow-sm transition-colors hover:bg-electric-blue/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-electric-blue dark:bg-electric-blue dark:text-white dark:hover:bg-electric-blue/90 md:min-h-0 md:shrink-0 md:whitespace-nowrap md:px-3 md:py-2';

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
        <div className="rounded-b-lg md:overflow-x-auto md:overscroll-x-contain [scrollbar-gutter:stable] touch-pan-x">
          <ul className="flex flex-col gap-2 p-3 md:flex-row md:flex-nowrap md:items-stretch md:justify-center md:gap-2 md:p-4 md:pb-3">
            {items.map((item) => (
              <li key={item.href} className="flex w-full shrink-0 justify-center md:w-auto">
                <a href={item.href} className={`${tocLinkClass} w-full max-w-sm md:w-auto md:max-w-none`}>
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
