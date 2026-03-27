import { SUMMIT_2026_SCHEDULE } from '@/data/summit2026Schedule';
import type { Summit2026ProgramBookGetText } from '@/components/summit2026/summit2026ProgramBookTypes';
import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

type Props = {
  getText: Summit2026ProgramBookGetText;
};

export function Summit2026ScheduleSection({ getText }: Props) {
  return (
    <div className="mb-8 w-full md:col-span-2">
      <div className="overflow-hidden rounded-lg border-2 border-electric-blue bg-white shadow-xl">
        <div className="bg-electric-blue py-2 text-center">
          <h3 className="text-xl font-bold text-white sm:text-2xl">
            {getText('scheduleTitle', 'Summit schedule')}
          </h3>
          <p className="mt-1 px-2 text-sm text-white/90 sm:text-base">
            Final SLxAI Summit Schedule — April 16–17, 2026
          </p>
        </div>
        <div className="space-y-8 p-4 sm:p-6">
          {SUMMIT_2026_SCHEDULE.map((day) => (
            <div key={day.dayLabel}>
              <h4 className="mb-3 border-b border-electric-blue/30 pb-2 text-xl font-bold text-electric-blue sm:text-2xl">
                {day.dayLabel}
              </h4>
              <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
                <table className="min-w-[560px] w-full border-collapse text-left text-lg text-gray-900 sm:text-xl">
                  <thead>
                    <tr className="border-b-2 border-electric-blue bg-blue-50/80">
                      <th className="py-3 pr-3 font-semibold sm:pr-4">Time</th>
                      <th className="py-3 pr-3 font-semibold sm:pr-4">Session</th>
                      <th className="py-3 font-semibold">Presenter(s) / Affiliation</th>
                    </tr>
                  </thead>
                  <tbody>
                    {day.rows.map((row, idx) => (
                      <tr
                        key={`${day.dayLabel}-${idx}-${row.time}`}
                        className={
                          row.sessionType === 'Break'
                            ? 'border-b border-gray-100 bg-gray-50/90'
                            : row.sessionType === 'Lunch'
                              ? 'border-b border-gray-100 bg-amber-50/40'
                              : 'border-b border-gray-100'
                        }
                      >
                        <td className="align-top py-3 pr-3 whitespace-nowrap text-gray-800 sm:pr-4">
                          {row.time}
                        </td>
                        <td className="align-top py-3 pr-3 text-gray-900 sm:pr-4">
                          {row.workshopSlug ? (
                            <Link
                              to={`/2026/workshop/${row.workshopSlug}`}
                              className="group inline-flex min-w-0 items-start gap-1.5 rounded-md -mx-1 px-1.5 py-0.5 text-left transition-colors hover:bg-electric-blue/[0.08] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-electric-blue"
                              aria-label={`Workshop details: ${row.title}`}
                            >
                              <span className="min-w-0 whitespace-pre-line font-semibold text-electric-blue group-hover:underline group-hover:decoration-electric-blue/80 group-hover:underline-offset-2">
                                {row.title}
                              </span>
                              <ChevronRight
                                className="mt-0.5 h-4 w-4 shrink-0 text-electric-blue/60 transition-transform group-hover:translate-x-0.5 group-hover:text-electric-blue"
                                aria-hidden
                              />
                            </Link>
                          ) : (
                            <span
                              className={
                                row.sessionType === 'Break' || row.sessionType === 'Lunch'
                                  ? 'whitespace-pre-line text-gray-600'
                                  : 'whitespace-pre-line'
                              }
                            >
                              {row.title}
                            </span>
                          )}
                        </td>
                        <td className="align-top py-3 text-gray-700">
                          <span className="whitespace-pre-line">{row.presenters}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
