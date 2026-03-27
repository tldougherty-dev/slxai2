import {
  WorkshopPresenterBioPlaceholder,
  WorkshopProgramSectionCard,
} from '@/components/summit2026/workshopProgramBookShared';
import {
  COSET_SAFE_AI_LEARNING_OBJECTIVE,
  COSET_SAFE_AI_PRESENTER_DETAILS,
  COSET_SAFE_AI_WORKSHOP_DESCRIPTION,
} from '@/data/summit2026WorkshopCosetRich';
import { Mail } from 'lucide-react';

/**
 * CoSET SAFE AI program book: workshop description → learning objective → presenter bios with image placeholders.
 */
export function CosetWorkshopProgramSections() {
  return (
    <div className="flex flex-col gap-5">
      <WorkshopProgramSectionCard headingId="coset-workshop-desc-heading" title="Workshop Description">
        <p className="text-base leading-relaxed text-gray-800">{COSET_SAFE_AI_WORKSHOP_DESCRIPTION}</p>
      </WorkshopProgramSectionCard>

      <WorkshopProgramSectionCard headingId="coset-learning-heading" title="Learning objective">
        <p className="text-base leading-relaxed text-gray-800">{COSET_SAFE_AI_LEARNING_OBJECTIVE}</p>
      </WorkshopProgramSectionCard>

      <WorkshopProgramSectionCard headingId="coset-presenters-heading" title="Presenters">
        <ul className="grid gap-5 sm:grid-cols-1 lg:grid-cols-2">
          {COSET_SAFE_AI_PRESENTER_DETAILS.map((p) => (
            <li key={p.email}>
              <article className="flex h-full gap-4 rounded-xl border border-gray-200/90 bg-gray-50/80 p-4 shadow-md transition-shadow hover:border-electric-blue/25 hover:shadow-lg sm:gap-5 sm:p-5">
                <WorkshopPresenterBioPlaceholder name={p.name} />
                <div className="min-w-0 flex-1 overflow-hidden">
                  <h3 className="text-lg font-bold text-gray-900">{p.name}</h3>
                  <p className="mt-1 break-words text-sm text-electric-blue">
                    <em className="font-semibold italic">{p.organization}</em>
                  </p>
                  <a
                    href={`mailto:${p.email}`}
                    className="mt-2 inline-flex min-w-0 items-center gap-1.5 break-all text-sm text-gray-600 transition-colors hover:text-electric-blue"
                  >
                    <Mail className="h-3.5 w-3.5 shrink-0 opacity-70" aria-hidden />
                    {p.email}
                  </a>
                  <p className="mt-3 break-words text-sm leading-relaxed text-gray-700">{p.bio}</p>
                </div>
              </article>
            </li>
          ))}
        </ul>
      </WorkshopProgramSectionCard>
    </div>
  );
}
