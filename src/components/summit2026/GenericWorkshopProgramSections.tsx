import { WorkshopPresenterBioPlaceholder, WorkshopProgramSectionCard } from '@/components/summit2026/workshopProgramBookShared';
import type { Summit2026ProgramBookGetText } from '@/components/summit2026/summit2026ProgramBookTypes';
import { getProgramBookSectionsFromVerbatim } from '@/data/summit2026WorkshopVerbatimLayout';
import type { Summit2026Workshop } from '@/data/summit2026Workshops';
import { Mail } from 'lucide-react';

type GenericWorkshopProgramSectionsProps = {
  workshop: Summit2026Workshop;
  verbatimRaw: string;
  getText: Summit2026ProgramBookGetText;
};

function stripLearningListItemPrefix(line: string): string {
  return line
    .replace(/^\t*\d+\.\t+/, '')
    .replace(/^\s*\d+\.\s+/, '')
    .replace(/^[•\-\*]\s*/, '')
    .trim();
}

/** Renders learning text as a bullet list when an intro line (“Participants will:” or “By the end of the workshop…”) is followed by items (numbered or plain). */
function LearningObjectiveContent({ text }: { text: string }) {
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter((l) => l.length > 0);
  if (lines.length === 0) return null;

  const introTests = [
    /^participants will:?\s*$/i,
    /^by the end of the workshop, participants will be able to:\s*$/i,
  ];

  for (const test of introTests) {
    const idx = lines.findIndex((l) => test.test(l));
    if (idx >= 0 && lines.length > idx + 1) {
      const items = lines.slice(idx + 1).map(stripLearningListItemPrefix).filter((l) => l.length > 0);
      const introLine = lines[idx];
      return (
        <div>
          <p className="mb-3 text-base font-medium leading-relaxed text-gray-900">{introLine}</p>
          <ul className="list-disc space-y-2 pl-5 text-base leading-relaxed text-gray-800 marker:text-gray-800">
            {items.map((line, i) => (
              <li key={i} className="pl-1">
                {line}
              </li>
            ))}
          </ul>
        </div>
      );
    }
  }

  return <p className="whitespace-pre-wrap text-base leading-relaxed text-gray-800">{text}</p>;
}

/**
 * Same section order and styling as CoSET: Workshop Description → Learning objective → Presenters.
 * Verbatim text is split on Learning Objective(s) / Outcomes when present; otherwise summary fills description.
 */
export function GenericWorkshopProgramSections({
  workshop,
  verbatimRaw,
  getText,
}: GenericWorkshopProgramSectionsProps) {
  const { workshopDescription: parsedDesc, learningObjective: parsedLearning } =
    getProgramBookSectionsFromVerbatim(verbatimRaw);

  const workshopDescription =
    parsedDesc.trim() !== ''
      ? parsedDesc
      : workshop.summary.trim() !== ''
        ? workshop.summary
        : getText(
            'workshopDescriptionMissing',
            'No workshop description is in the program book data for this session. Add it in src/data/workshopVerbatimFromDocs.json (or WORKSHOP_VERBATIM_RAW_BY_SLUG in summit2026WorkshopVerbatim.ts). Slug: {slug}.',
          ).replace('{slug}', workshop.slug);

  const learningObjective =
    parsedLearning.trim() !== ''
      ? parsedLearning
      : null;

  const isSinglePresenter = workshop.presenters.length === 1;

  return (
    <div className="flex flex-col gap-5">
      <WorkshopProgramSectionCard headingId="workshop-desc-heading" title="Workshop Description">
        <p className="whitespace-pre-wrap text-base leading-relaxed text-gray-800">{workshopDescription}</p>
      </WorkshopProgramSectionCard>

      <WorkshopProgramSectionCard headingId="workshop-learning-heading" title="Learning objective">
        {learningObjective != null ? (
          <LearningObjectiveContent text={learningObjective} />
        ) : (
          <p className="text-base leading-relaxed text-gray-500">
            {getText('learningObjectiveMissing', 'Not specified in the submitted materials.')}
          </p>
        )}
      </WorkshopProgramSectionCard>

      <WorkshopProgramSectionCard
        headingId="workshop-presenters-heading"
        title={isSinglePresenter ? 'Presenter' : 'Presenters'}
      >
        <ul className={isSinglePresenter ? 'grid gap-5 sm:grid-cols-1' : 'grid gap-5 sm:grid-cols-1 lg:grid-cols-2'}>
          {workshop.presenters.map((p, idx) => (
            <li key={`${p.name}-${idx}`}>
              <article
                className={
                  isSinglePresenter
                    ? 'flex h-full gap-4 rounded-xl border border-gray-200/90 bg-gray-50/80 p-4 shadow-md transition-shadow hover:border-electric-blue/25 hover:shadow-lg sm:gap-5 sm:p-5'
                    : 'flex h-full gap-4 rounded-xl border border-gray-200/90 bg-gray-50/80 p-4 shadow-md transition-shadow hover:border-electric-blue/25 hover:shadow-lg sm:gap-5 sm:p-5'
                }
              >
                <div className="flex shrink-0">
                  <WorkshopPresenterBioPlaceholder name={p.name} />
                </div>
                <div className="min-w-0 flex-1 overflow-hidden">
                  <h3 className="text-lg font-bold text-gray-900">{p.name}</h3>
                  {p.title ? <p className="mt-1 text-sm text-gray-700">{p.title}</p> : null}
                  {p.organization ? (
                    <p className="mt-1 break-words text-sm font-semibold text-electric-blue">{p.organization}</p>
                  ) : null}
                  {p.email ? (
                    <a
                      href={`mailto:${p.email}`}
                      className="mt-2 inline-flex min-w-0 items-center gap-1.5 break-all text-sm text-gray-600 transition-colors hover:text-electric-blue"
                    >
                      <Mail className="h-3.5 w-3.5 shrink-0 opacity-70" aria-hidden />
                      {p.email}
                    </a>
                  ) : null}
                  {p.bio ? (
                    <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-relaxed text-gray-700">
                      {p.bio}
                    </p>
                  ) : null}
                </div>
              </article>
            </li>
          ))}
        </ul>
      </WorkshopProgramSectionCard>
    </div>
  );
}
