import { WorkshopPresenterBioCard, WorkshopProgramSectionCard } from '@/components/summit2026/workshopProgramBookShared';
import {
  COSET_AI_TOOLKIT_PART_A_TITLE,
  COSET_AI_TOOLKIT_PART_B_TITLE,
  COSET_SAFE_AI_LEARNING_OBJECTIVE,
  COSET_SAFE_AI_PRESENTER_DETAILS,
  COSET_SAFE_AI_WORKSHOP_DESCRIPTION_LEAD,
  COSET_SAFE_AI_WORKSHOP_DESCRIPTION_MIDDLE,
  COSET_SAFE_AI_WORKSHOP_DESCRIPTION_TAIL,
} from '@/data/summit2026WorkshopCosetRich';

/**
 * CoSET SAFE AI program book: workshop description → learning objective → presenter bios with image placeholders.
 */
export function CosetWorkshopProgramSections() {
  return (
    <div className="flex flex-col gap-5">
      <WorkshopProgramSectionCard headingId="coset-workshop-desc-heading" title="Workshop Description">
        <p className="text-base leading-relaxed text-gray-800">
          {COSET_SAFE_AI_WORKSHOP_DESCRIPTION_LEAD}
          <em>{COSET_AI_TOOLKIT_PART_A_TITLE}</em>
          {COSET_SAFE_AI_WORKSHOP_DESCRIPTION_MIDDLE}
          <em>{COSET_AI_TOOLKIT_PART_B_TITLE}</em>
          {COSET_SAFE_AI_WORKSHOP_DESCRIPTION_TAIL}
        </p>
      </WorkshopProgramSectionCard>

      <WorkshopProgramSectionCard headingId="coset-learning-heading" title="Learning objective">
        <p className="text-base leading-relaxed text-gray-800">{COSET_SAFE_AI_LEARNING_OBJECTIVE}</p>
      </WorkshopProgramSectionCard>

      <WorkshopProgramSectionCard headingId="coset-presenters-heading" title="Presenters">
        <ul className="grid gap-5 sm:grid-cols-1">
          {COSET_SAFE_AI_PRESENTER_DETAILS.map((p) => (
            <li key={p.name}>
              <WorkshopPresenterBioCard
                name={p.name}
                photoUrl={p.photoUrl}
                photoImgClassName={p.photoImgClassName}
                title={p.title}
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
