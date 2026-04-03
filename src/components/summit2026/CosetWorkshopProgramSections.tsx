import { WorkshopPresenterBioCard, WorkshopProgramSectionCard } from '@/components/summit2026/workshopProgramBookShared';
import {
  COSET_SAFE_AI_LEARNING_OBJECTIVE,
  COSET_SAFE_AI_PRESENTER_DETAILS,
  COSET_SAFE_AI_WORKSHOP_DESCRIPTION,
} from '@/data/summit2026WorkshopCosetRich';

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
              <WorkshopPresenterBioCard
                name={p.name}
                organization={p.organization}
                email={p.email}
                bio={p.bio}
              />
            </li>
          ))}
        </ul>
      </WorkshopProgramSectionCard>
    </div>
  );
}
