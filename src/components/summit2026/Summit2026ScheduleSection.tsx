import { SUMMIT_2026_SCHEDULE, type SummitScheduleRow } from '@/data/summit2026Schedule';
import type { Summit2026ProgramBookGetText } from '@/components/summit2026/summit2026ProgramBookTypes';
import { Summit2026EveningEventSection } from '@/components/summit2026/Summit2026EveningEventSection';
import { presenterCreditWithItalicOrgs } from '@/components/summit2026/summit2026PresenterCredit';
import { getSummit2026WorkshopBySlug } from '@/data/summit2026Workshops';
import { Link } from 'react-router-dom';

type Props = {
  getText: Summit2026ProgramBookGetText;
  /**
   * Program book /2026 only: below `md`, show card layout instead of a wide table.
   * Homepage and other uses should omit this (default) so layout stays unchanged.
   */
  programBookMobile?: boolean;
};

function SchedulePresenterAffiliationCell({ row }: { row: SummitScheduleRow }) {
  if (!row.workshopSlug) {
    return <span className="whitespace-pre-line">{row.presenters}</span>;
  }
  const workshop = getSummit2026WorkshopBySlug(row.workshopSlug);
  if (!workshop) {
    return <span className="whitespace-pre-line">{row.presenters}</span>;
  }
  return (
    <span className="whitespace-pre-line">
      {presenterCreditWithItalicOrgs(workshop, { stripLeadingLabels: true })}
    </span>
  );
}

function ScheduleSessionTitle({
  row,
  variant = 'table',
  compactMobileCard = false,
  mobileCentered = false,
}: {
  row: SummitScheduleRow;
  variant?: 'table' | 'card';
  /** Program book mobile: tighter vertical padding on session links */
  compactMobileCard?: boolean;
  /** Mobile schedule cards only: center title + link */
  mobileCentered?: boolean;
}) {
  const linkClass =
    variant === 'card'
      ? compactMobileCard
        ? mobileCentered
          ? 'group inline-flex min-h-0 min-w-0 max-w-full flex-wrap items-center justify-center gap-1 rounded-md px-1 py-1 text-center transition-colors hover:bg-electric-blue/[0.08] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-electric-blue touch-manipulation'
          : 'group inline-flex min-h-0 min-w-0 items-start gap-1 rounded-md -mx-1 px-1 py-1 text-left transition-colors hover:bg-electric-blue/[0.08] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-electric-blue touch-manipulation'
        : 'group inline-flex min-h-[44px] min-w-0 items-start gap-1.5 rounded-md -mx-1 px-1.5 py-1.5 text-left transition-colors hover:bg-electric-blue/[0.08] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-electric-blue touch-manipulation'
      : 'group inline-flex min-w-0 items-start gap-1.5 rounded-md -mx-1 px-1.5 py-0.5 text-left transition-colors hover:bg-electric-blue/[0.08] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-electric-blue';

  const titleSpanClass =
    mobileCentered && variant === 'card'
      ? 'min-w-0 max-w-full whitespace-pre-line text-center font-semibold text-electric-blue group-hover:underline group-hover:decoration-electric-blue/80 group-hover:underline-offset-2'
      : 'min-w-0 whitespace-pre-line font-semibold text-electric-blue group-hover:underline group-hover:decoration-electric-blue/80 group-hover:underline-offset-2';

  if (row.workshopSlug) {
    return (
      <Link to={`/2026/workshop/${row.workshopSlug}`} className={linkClass} aria-label={`Workshop details: ${row.title}`}>
        <span className={titleSpanClass}>{row.title}</span>
      </Link>
    );
  }
  return (
    <span
      className={
        row.sessionType === 'Break' || row.sessionType === 'Lunch'
          ? `whitespace-pre-line text-gray-600${mobileCentered && variant === 'card' ? ' block text-center' : ''}`
          : `whitespace-pre-line${mobileCentered && variant === 'card' ? ' block text-center' : ''}`
      }
    >
      {row.title}
    </span>
  );
}

function rowCardClass(row: SummitScheduleRow): string {
  if (row.sessionType === 'Break') {
    return 'border border-gray-300 bg-gray-100';
  }
  if (row.sessionType === 'Lunch') {
    return 'border border-amber-200/70 bg-amber-50/50';
  }
  return 'border border-gray-200 bg-white shadow-sm';
}

export function Summit2026ScheduleSection({ getText, programBookMobile = false }: Props) {
  const headerBar = (
    <div
      className={
        programBookMobile
          ? 'bg-electric-blue py-2 text-center sm:py-3 md:py-4 pb-mobile-landscape-compact'
          : 'bg-electric-blue py-3 text-center sm:py-4 pb-mobile-landscape-compact'
      }
    >
      <h3 className="px-2 text-lg font-bold leading-tight text-white sm:text-xl md:text-2xl">
        {getText('scheduleTitle', 'SLxAI Summit Schedule')}
      </h3>
    </div>
  );

  const dayHeading = (day: (typeof SUMMIT_2026_SCHEDULE)[number]) =>
    day.dayDate ? `${day.dayLabel}, ${day.dayDate}` : day.dayLabel;

  const dayHeaderBar = (day: (typeof SUMMIT_2026_SCHEDULE)[number]) => (
    <div
      className={
        programBookMobile
          ? 'bg-electric-blue py-2 text-center sm:py-2.5 md:py-3 pb-mobile-landscape-compact'
          : 'bg-electric-blue py-2.5 text-center sm:py-3 pb-mobile-landscape-compact'
      }
    >
      <h4 className="px-2 text-base font-bold leading-tight text-white sm:text-lg md:text-xl">
        {dayHeading(day)}
      </h4>
    </div>
  );

  const renderDayTable = (day: (typeof SUMMIT_2026_SCHEDULE)[number]) => (
    <div
      className={`overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0 ${programBookMobile ? 'pb-schedule-scroll md:pb-0' : ''}`}
    >
      <table className="min-w-[560px] w-full border-collapse text-left text-gray-900">
        <thead>
          <tr className="border-b-2 border-electric-blue bg-blue-50/80">
            <th className="py-3 pr-3 text-xl font-semibold sm:pr-4 sm:text-2xl">Time</th>
            <th className="py-3 pr-3 text-lg font-semibold sm:pr-4 sm:text-xl">Session</th>
            <th className="py-3 text-lg font-semibold sm:text-xl">Presenter(s) / Affiliation</th>
          </tr>
        </thead>
        <tbody>
          {day.rows.map((row, idx) => (
            <tr
              key={`${day.dayLabel}-${idx}-${row.time}`}
              className={
                row.sessionType === 'Break'
                  ? 'border-b border-gray-200 bg-gray-100'
                  : row.sessionType === 'Lunch'
                    ? 'border-b border-gray-100 bg-amber-50/40'
                    : 'border-b border-gray-100'
              }
            >
              <td className="align-top py-3 pr-3 whitespace-nowrap text-base text-gray-800 sm:pr-4">{row.time}</td>
              <td className="align-top py-3 pr-3 text-base text-gray-900 sm:pr-4">
                <ScheduleSessionTitle row={row} variant="table" />
              </td>
              <td className="align-top py-3 text-base text-gray-700">
                <SchedulePresenterAffiliationCell row={row} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderDayMobileCards = (day: (typeof SUMMIT_2026_SCHEDULE)[number]) => (
    <ul className="flex flex-col items-stretch gap-1.5 max-md:landscape:gap-1.5 sm:gap-2">
      {day.rows.map((row, idx) => (
        <li
          key={`${day.dayLabel}-${idx}-${row.time}`}
          className={`flex flex-col items-center rounded-lg px-2.5 py-2 pb-mobile-card-compact text-center sm:px-3 sm:py-2.5 max-md:landscape:py-1.5 ${rowCardClass(row)}`}
        >
          <p
            className={`w-full text-sm font-semibold leading-tight sm:text-base sm:leading-snug md:text-lg ${
              row.sessionType === 'Break' ? 'text-gray-600' : 'text-electric-blue'
            }`}
          >
            {row.time}
          </p>
          <div className="mt-1 w-full max-w-full text-sm leading-snug text-gray-900 sm:mt-1.5 sm:text-base max-md:landscape:mt-0.5 max-md:landscape:text-sm">
            <ScheduleSessionTitle row={row} variant="card" compactMobileCard mobileCentered />
          </div>
          <div className="mt-1 w-full text-sm leading-snug text-gray-700 sm:mt-1.5 sm:text-base sm:leading-relaxed max-md:landscape:text-sm max-md:landscape:leading-tight">
            <SchedulePresenterAffiliationCell row={row} />
          </div>
        </li>
      ))}
    </ul>
  );

  const scheduleDaySections = SUMMIT_2026_SCHEDULE.flatMap((day, dayIndex) => {
    const daySection = (
      <div
        key={day.dayLabel}
        id={`summit-schedule-${day.dayLabel.toLowerCase().replace(/\s+/g, '-')}`}
        className="scroll-mt-28 overflow-hidden rounded-lg border-2 border-electric-blue bg-white shadow-xl"
      >
        {dayHeaderBar(day)}
        {programBookMobile ? (
          <>
            <div className="hidden p-4 sm:p-6 md:block">{renderDayTable(day)}</div>
            <div className="p-2 pb-3 sm:p-3 sm:pb-4 md:hidden">{renderDayMobileCards(day)}</div>
          </>
        ) : (
          <div className="p-4 sm:p-6">{renderDayTable(day)}</div>
        )}
      </div>
    );

    if (dayIndex === 0) {
      return [
        daySection,
        <Summit2026EveningEventSection
          key="summit-evening-event"
          getText={getText}
          programBookMobile={programBookMobile}
        />,
      ];
    }
    return [daySection];
  });

  return (
    <div className="mb-8 flex w-full flex-col gap-6 sm:gap-8 md:col-span-2">
      <div className="overflow-hidden rounded-lg border-2 border-electric-blue bg-white shadow-xl">{headerBar}</div>
      {scheduleDaySections}
    </div>
  );
}
