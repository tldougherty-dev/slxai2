import { CosetWorkshopProgramSections } from '@/components/summit2026/CosetWorkshopProgramSections';
import { GenericWorkshopProgramSections } from '@/components/summit2026/GenericWorkshopProgramSections';
import { presenterCreditWithItalicOrgs } from '@/components/summit2026/summit2026PresenterCredit';
import { ProgramBook2026Shell, useProgramBook2026GetText } from '@/components/summit2026/ProgramBook2026Shell';
import { COSET_SAFE_AI_WORKSHOP_SLUG } from '@/data/summit2026WorkshopCosetRich';
import { getVerbatimRawForSlug } from '@/data/summit2026WorkshopVerbatim';
import { getWorkshopScheduleSlotForSlug } from '@/data/summit2026Schedule';
import { getSummit2026WorkshopBySlug, type Summit2026Workshop } from '@/data/summit2026Workshops';
import { useLayoutEffect } from 'react';
import { Navigate, useParams } from 'react-router-dom';

function WorkshopDetailBody({ workshop }: { workshop: Summit2026Workshop }) {
  const getText = useProgramBook2026GetText();
  const isCosetRichPage = workshop.slug === COSET_SAFE_AI_WORKSHOP_SLUG;
  const scheduleSlot = getWorkshopScheduleSlotForSlug(workshop.slug);
  const verbatimRaw = getVerbatimRawForSlug(workshop.slug);

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-5 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <div className="overflow-hidden rounded-lg border-2 border-electric-blue shadow-xl">
        <div className="bg-electric-blue px-4 py-4 text-center sm:px-6 sm:py-5">
          <h1 className="text-2xl font-bold leading-tight text-white sm:text-3xl md:text-4xl">
            {workshop.sessionTitle}
          </h1>
        </div>
        <div className="border-t border-electric-blue/30 bg-white px-4 py-3 sm:px-6 sm:py-4">
          <div
            className={
              scheduleSlot
                ? 'flex flex-col items-center gap-2 text-center sm:flex-row sm:items-start sm:justify-center sm:gap-4 sm:text-left'
                : 'text-center'
            }
          >
            {scheduleSlot ? (
              <div className="flex shrink-0 flex-wrap items-center justify-center gap-0 sm:justify-start sm:pt-0.5">
                <span className="text-xl font-semibold text-electric-blue sm:text-2xl">
                  {scheduleSlot.dayDate
                    ? `${scheduleSlot.dayLabel} — ${scheduleSlot.dayDate}`
                    : scheduleSlot.dayLabel}
                </span>
                <span className="ml-4 border-l border-gray-200 pl-4 text-xl font-semibold leading-snug text-electric-blue sm:text-2xl">
                  {scheduleSlot.time}
                </span>
              </div>
            ) : null}
            <p
              className={`text-base leading-relaxed text-gray-800 ${
                scheduleSlot ? 'min-w-0 sm:flex-1 sm:border-l sm:border-gray-200 sm:pl-4' : ''
              }`}
            >
              {presenterCreditWithItalicOrgs(workshop)}
            </p>
          </div>
        </div>
      </div>

      {isCosetRichPage ? (
        <CosetWorkshopProgramSections />
      ) : (
        <GenericWorkshopProgramSections workshop={workshop} verbatimRaw={verbatimRaw} getText={getText} />
      )}
    </div>
  );
}

/**
 * Per-session page for Summit 2026 program book: /2026/workshop/:slug
 */
export default function ProgramBookWorkshop2026() {
  const { slug } = useParams();
  const workshop = getSummit2026WorkshopBySlug(slug);

  useLayoutEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  if (!workshop) {
    return <Navigate to="/2026" replace />;
  }

  return (
    <ProgramBook2026Shell
      documentTitle={`${workshop.sessionTitle} | SLxAI Summit 2026`}
      topLeftNav="programBook"
    >
      <WorkshopDetailBody workshop={workshop} />
    </ProgramBook2026Shell>
  );
}
