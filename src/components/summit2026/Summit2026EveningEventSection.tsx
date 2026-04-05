import type { Summit2026ProgramBookGetText } from '@/components/summit2026/summit2026ProgramBookTypes';

type Props = {
  getText: Summit2026ProgramBookGetText;
  programBookMobile?: boolean;
  /** When true, render without outer card frame (nested under SLxAI Summit Schedule). */
  nested?: boolean;
};

const EVENING_PHOTO_VIEW = '/bleacher-bar-view.png';
const EVENING_PHOTO_INTERIOR = '/bleacher-bar-entry.png';

export function Summit2026EveningEventSection({
  getText,
  programBookMobile = false,
  nested = false,
}: Props) {
  const headerBar = (
    <div
      className={
        programBookMobile
          ? 'bg-electric-blue py-2 text-center sm:py-2.5 md:py-3 pb-mobile-landscape-compact'
          : 'bg-electric-blue py-2.5 text-center sm:py-3 pb-mobile-landscape-compact'
      }
    >
      <h4 className="px-2 text-base font-bold leading-tight text-white sm:text-lg md:text-xl">
        {getText('eveningEventSectionTitle', 'Evening event')}
      </h4>
    </div>
  );

  return (
    <div
      id={nested ? undefined : 'summit-evening-event'}
      className={
        nested
          ? undefined
          : 'scroll-mt-28 overflow-hidden rounded-lg border-2 border-electric-blue bg-white shadow-xl dark:bg-gray-900/40'
      }
    >
      {headerBar}
      <div className={programBookMobile ? 'p-3 sm:p-4 md:p-6' : 'p-4 sm:p-6'}>
        <div className="mx-auto max-w-4xl text-center">
          <h5 className="text-balance text-2xl font-bold text-gray-900 dark:text-white sm:text-3xl">
            {getText('eveningEventVenue', 'Bleacher Bar at Fenway Park')}
          </h5>
          <p className="mt-2 text-base text-gray-600 dark:text-gray-300 sm:text-lg">
            {getText('eveningEventWhen', '7:00–10:00 PM · April 16, 2026')}
          </p>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 sm:text-base">
            {getText(
              'eveningEventNote',
              'Closed to the public for SLxAI summit attendees only.',
            )}
          </p>
          <div className="mt-6 grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2">
            <img
              src={EVENING_PHOTO_VIEW}
              alt={getText('eveningEventPhoto1Alt', 'Bleacher Bar view of Fenway Park field')}
              className="h-64 w-full rounded-lg object-cover shadow-lg sm:h-80"
              loading="lazy"
              decoding="async"
            />
            <img
              src={EVENING_PHOTO_INTERIOR}
              alt={getText('eveningEventPhoto2Alt', 'Bleacher Bar interior')}
              className="h-64 w-full rounded-lg object-cover shadow-lg sm:h-80"
              loading="lazy"
              decoding="async"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
