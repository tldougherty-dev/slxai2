import { WorkshopPresenterBioCard, WorkshopProgramSectionCard } from '@/components/summit2026/workshopProgramBookShared';
import type { Summit2026ProgramBookGetText } from '@/components/summit2026/summit2026ProgramBookTypes';
import {
  TRUST_ADDITIONAL_INFORMATION_BYLINE,
  TRUST_ADDITIONAL_INFORMATION_TITLE,
} from '@/data/summit2026TrustWorkshopAdditionalInformation';
import { getProgramBookSectionsFromVerbatim } from '@/data/summit2026WorkshopVerbatimLayout';
import type { Summit2026Workshop } from '@/data/summit2026Workshops';
import type { ReactNode } from 'react';

const TRUST_WORKSHOP_SLUG = 'trust-and-accountability-sign-language-ai';
const KEYNOTE_WORKSHOP_SLUG = 'keynote-breaking-communication-barriers';

type GenericWorkshopProgramSectionsProps = {
  workshop: Summit2026Workshop;
  verbatimRaw: string;
  getText: Summit2026ProgramBookGetText;
};

const WORKSHOP_DESCRIPTION_ITALIC_HEADINGS = new Set([
  'Trust, Leadership, and Human Infrastructure',
  'Equity and Access',
]);

/** Workshop description with optional italic subheads (exact line match + following paragraph). */
function WorkshopDescriptionContent({ text }: { text: string }) {
  const blocks = text
    .split(/\n\n+/)
    .map((b) => b.trim())
    .filter((b) => b.length > 0);

  return (
    <div className="space-y-4 text-base leading-relaxed text-gray-800">
      {blocks.map((block, i) => {
        const nl = block.indexOf('\n');
        if (nl !== -1) {
          const first = block.slice(0, nl).trim();
          const rest = block.slice(nl + 1).trim();
          if (WORKSHOP_DESCRIPTION_ITALIC_HEADINGS.has(first)) {
            return (
              <div key={i} className="space-y-1">
                <p>
                  <em className="italic text-gray-900">{first}</em>
                </p>
                <p className="whitespace-pre-wrap text-gray-800">{rest}</p>
              </div>
            );
          }
        }
        if (WORKSHOP_DESCRIPTION_ITALIC_HEADINGS.has(block)) {
          return (
            <p key={i}>
              <em className="italic text-gray-900">{block}</em>
            </p>
          );
        }
        return (
          <p key={i} className="whitespace-pre-wrap text-gray-800">
            {block}
          </p>
        );
      })}
    </div>
  );
}

/** Long-form “Additional information”: intro paragraphs; sections start with a line `## Title` (split before each `##` at line start). */
function AdditionalInformationContent({
  text,
  variant,
}: {
  text: string;
  variant?: 'trust';
}) {
  let remainder = text.trim();
  let trustHeader: ReactNode = null;

  if (variant === 'trust') {
    const prefix = `${TRUST_ADDITIONAL_INFORMATION_TITLE}\n\n${TRUST_ADDITIONAL_INFORMATION_BYLINE}`;
    if (remainder.startsWith(prefix)) {
      remainder = remainder.slice(prefix.length).replace(/^\n+/, '').trim();
      trustHeader = (
        <div className="mb-8 text-center">
          <p className="text-[1.575rem] font-bold leading-tight tracking-tight text-gray-900 sm:text-[2.1rem] md:text-[2.625rem] lg:text-[3.15rem]">
            {TRUST_ADDITIONAL_INFORMATION_TITLE}
          </p>
          <p className="mt-4 text-lg italic text-gray-900 sm:text-xl md:text-2xl">
            {TRUST_ADDITIONAL_INFORMATION_BYLINE}
          </p>
        </div>
      );
    }
  }

  const chunks = remainder
    .split(/\n(?=##\s)/)
    .map((c) => c.trim())
    .filter((c) => c.length > 0);

  return (
    <div>
      {trustHeader}
      <div className="space-y-4 text-base leading-relaxed text-gray-800">
      {chunks.map((chunk, i) => {
        if (chunk.startsWith('##')) {
          const lines = chunk.split('\n');
          const title = lines[0].replace(/^##\s*/, '').trim();
          const body = lines.slice(1).join('\n').trim();
          return (
            <div key={i} className="space-y-3">
              <h4 className="text-lg font-bold text-gray-900">{title}</h4>
              {body
                ? body.split(/\n\n+/).map((para, j) => (
                    <p key={j} className="whitespace-pre-wrap text-gray-800">
                      {para.trim()}
                    </p>
                  ))
                : null}
            </div>
          );
        }
        return (
          <div key={i} className="space-y-3">
            {chunk.split(/\n\n+/).map((para, j) => (
              <p key={j} className="whitespace-pre-wrap text-gray-800">
                {para.trim()}
              </p>
            ))}
          </div>
        );
      })}
      </div>
    </div>
  );
}

/**
 * Program book: description → Presenters → optional Additional information.
 * Keynote: section title "Keynote description"; others: "Workshop Description". No learning objective block.
 */
export function GenericWorkshopProgramSections({
  workshop,
  verbatimRaw,
  getText,
}: GenericWorkshopProgramSectionsProps) {
  const isKeynote = workshop.slug === KEYNOTE_WORKSHOP_SLUG;

  const { workshopDescription: parsedDesc } = getProgramBookSectionsFromVerbatim(verbatimRaw);

  const workshopDescription =
    parsedDesc.trim() !== ''
      ? parsedDesc
      : workshop.summary.trim() !== ''
        ? workshop.summary
        : getText(
            'workshopDescriptionMissing',
            'No workshop description is in the program book data for this session. Add it in src/data/workshopVerbatimFromDocs.json (or WORKSHOP_VERBATIM_RAW_BY_SLUG in summit2026WorkshopVerbatim.ts). Slug: {slug}.',
          ).replace('{slug}', workshop.slug);

  const isSinglePresenter = workshop.presenters.length === 1;

  const descriptionHeadingId = isKeynote ? 'keynote-desc-heading' : 'workshop-desc-heading';
  const descriptionTitle = isKeynote ? 'Keynote description' : 'Workshop Description';

  return (
    <div className="flex flex-col gap-5">
      <WorkshopProgramSectionCard headingId={descriptionHeadingId} title={descriptionTitle}>
        <WorkshopDescriptionContent text={workshopDescription} />
      </WorkshopProgramSectionCard>

      <WorkshopProgramSectionCard
        headingId="workshop-presenters-heading"
        title={isSinglePresenter ? 'Presenter' : 'Presenters'}
      >
        <ul className={isSinglePresenter ? 'grid gap-5 sm:grid-cols-1' : 'grid gap-5 sm:grid-cols-1 lg:grid-cols-2'}>
          {workshop.presenters.map((p, idx) => (
            <li key={`${p.name}-${idx}`}>
              <WorkshopPresenterBioCard
                name={p.name}
                photoUrl={p.photoUrl}
                title={p.title}
                organization={p.organization}
                email={p.email}
                bio={p.bio}
              />
            </li>
          ))}
        </ul>
      </WorkshopProgramSectionCard>

      {workshop.additionalInformation?.trim() ? (
        <WorkshopProgramSectionCard
          headingId="workshop-additional-info-heading"
          title={getText('additionalInformationHeading', 'Additional information')}
        >
          <AdditionalInformationContent
            text={workshop.additionalInformation.trim()}
            variant={workshop.slug === TRUST_WORKSHOP_SLUG ? 'trust' : undefined}
          />
        </WorkshopProgramSectionCard>
      ) : null}
    </div>
  );
}
