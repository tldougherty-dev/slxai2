import {
  SUMMIT_2026_COMMITTEE_MEMBERS,
  SUMMIT_2026_STORY_SLXAI_PARAGRAPHS,
  SUMMIT_2026_WELCOME_LETTER_PARAGRAPHS,
  SUMMIT_2026_WELCOME_LETTER_SIGNATURE,
} from '@/data/summit2026ProgramBookNarrative';
import type { Summit2026ProgramBookGetText } from '@/components/summit2026/summit2026ProgramBookTypes';
import { WorkshopPresenterPhotoOrPlaceholder } from '@/components/summit2026/workshopProgramBookShared';

type Props = {
  getText: Summit2026ProgramBookGetText;
};

const sectionShell =
  'scroll-mt-28 w-full overflow-hidden rounded-lg border border-gray-200 bg-white shadow-md dark:border-gray-700 dark:bg-gray-900';

/** Shared blue bar + large title (Welcome Letter, Story, Committee). */
const narrativeHeroHeaderBar = 'bg-electric-blue px-4 py-3 text-center sm:py-3.5';
const narrativeHeroTitle =
  'text-balance text-lg font-bold leading-tight text-white sm:text-xl md:text-2xl';

function ProseBlock({ paragraphs }: { paragraphs: string[] }) {
  return (
    <div className="space-y-4 px-4 py-5 text-left text-base leading-relaxed text-gray-800 dark:text-gray-100 sm:px-6 sm:py-6">
      {paragraphs.map((p, i) => (
        <p key={i}>{p}</p>
      ))}
    </div>
  );
}

/** Aged legal-paper body: left red margin, ink-colored type on light tan. */
function WelcomeLetterPaperBody({ paragraphs }: { paragraphs: string[] }) {
  return (
    <div className="relative min-h-[8rem]">
      {/* Classic legal-pad vertical rule (~1 in from sheet edge on sm+) */}
      <div
        className="pointer-events-none absolute bottom-0 left-7 top-0 w-[2px] bg-[#b42318] opacity-[0.92] max-md:portrait:left-3 sm:left-[1in] dark:bg-[#c43c32] dark:opacity-[0.88]"
        aria-hidden
      />
      <div className="space-y-3 px-4 py-5 pl-[calc(1.75rem+1.125rem)] text-left text-sm leading-tight text-[#2a231c] max-md:portrait:px-2 max-md:portrait:py-4 max-md:portrait:pl-[calc(0.5rem+1.125rem)] sm:px-6 sm:py-6 sm:pl-[calc(1in+1.5rem)] dark:text-[#ece8df]">
        {paragraphs.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </div>
    </div>
  );
}

/** Outer card: matches story/committee; white mat under the blue title bar. */
const welcomeLetterSectionShell =
  'scroll-mt-28 w-full overflow-hidden rounded-lg border border-gray-200 bg-white shadow-md dark:border-gray-700 dark:bg-gray-900';

/** Tan “sheet” only — lifted shadow so it reads as floating on the white mat. */
const welcomeLetterFloatingPaper =
  'overflow-hidden rounded-sm border-2 border-[#a69072]/50 bg-[#f3ebe0] shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_-4px_rgba(55,42,28,0.18),0_20px_40px_-12px_rgba(45,35,22,0.12)] dark:border-[#5c4d3d] dark:bg-[#2b2620] dark:shadow-[0_10px_30px_-6px_rgba(0,0,0,0.55),0_24px_48px_-16px_rgba(0,0,0,0.45)]';

export function Summit2026WelcomeLetterSection({ getText }: Props) {
  return (
    <section id="summit-welcome-letter" className={welcomeLetterSectionShell}>
      <div className={narrativeHeroHeaderBar}>
        <h2 className={narrativeHeroTitle}>{getText('welcomeLetterTitle', 'Welcome Letter')}</h2>
      </div>
      {/* White mat on the sides; letter is a narrower floating sheet (full width on small portrait to avoid huge side gaps) */}
      <div className="bg-white px-4 py-8 dark:bg-gray-900 max-md:portrait:px-2 sm:px-8 sm:py-10">
        <div
          className={`mx-auto min-w-0 max-w-full w-[67.76%] max-md:portrait:w-full ${welcomeLetterFloatingPaper}`}
        >
          <WelcomeLetterPaperBody paragraphs={SUMMIT_2026_WELCOME_LETTER_PARAGRAPHS} />
          <div className="relative flex justify-end border-t border-[#c9b896]/70 bg-[#ebe3d4]/90 px-4 pb-6 pt-6 dark:border-[#4a4034] dark:bg-[#242019]/90 max-md:portrait:px-2 sm:px-6 sm:pb-8">
            <div
              className="pointer-events-none absolute bottom-0 left-7 top-0 w-[2px] bg-[#b42318] opacity-[0.92] max-md:portrait:left-3 sm:left-[1in] dark:bg-[#c43c32] dark:opacity-[0.88]"
              aria-hidden
            />
            <div className="max-w-lg pl-[calc(1.75rem+1.125rem)] text-right max-md:portrait:pl-[calc(0.5rem+1.125rem)] sm:pl-[calc(1in+1.5rem)]">
              <p className="text-sm font-medium tracking-wide text-[#4a4034] dark:text-[#b5ab9c]">
                {SUMMIT_2026_WELCOME_LETTER_SIGNATURE.closing}
              </p>
              <p
                className="welcome-letter-signature-name mt-3 text-[2.5rem] leading-none tracking-wide text-[#1c1915] [text-shadow:0_1px_0_rgba(255,255,255,0.45)] dark:text-[#f0ebe3] dark:[text-shadow:0_1px_1px_rgba(0,0,0,0.35)] sm:text-[3rem]"
                lang="en"
              >
                {SUMMIT_2026_WELCOME_LETTER_SIGNATURE.name}
              </p>
              <p className="mt-4 text-sm text-[#4a4034] dark:text-[#a39888]">{SUMMIT_2026_WELCOME_LETTER_SIGNATURE.role}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function Summit2026StorySlxaiSection({ getText }: Props) {
  return (
    <section id="summit-story-slxai" className={sectionShell}>
      <div className={narrativeHeroHeaderBar}>
        <h2 className={narrativeHeroTitle}>{getText('storySlxaiTitle', 'The Story Behind SLxAI')}</h2>
      </div>
      <ProseBlock paragraphs={SUMMIT_2026_STORY_SLXAI_PARAGRAPHS} />
    </section>
  );
}

export function Summit2026CommitteeSection({ getText }: Props) {
  return (
    <section id="summit-committee" className={sectionShell}>
      <div className={narrativeHeroHeaderBar}>
        <h2 className={narrativeHeroTitle}>{getText('summitCommitteeTitle', 'Summit Committee')}</h2>
      </div>
      <div className="px-3 py-3 sm:px-4 sm:py-4">
        <p className="mb-2.5 text-sm leading-snug text-gray-800 dark:text-gray-100 sm:mb-3">
          {getText(
            'summitCommitteeIntro',
            'This summit would not be possible without the committee members below. Each contributed in their own way to help ensure a successful event.',
          )}
        </p>
        <ul className="grid grid-cols-1 gap-2.5 md:grid-cols-2 md:gap-3">
          {SUMMIT_2026_COMMITTEE_MEMBERS.map((m, i) => (
            <li
              key={`${m.name}-${i}`}
              className="flex min-h-0 items-center gap-3 rounded-md border border-gray-200 bg-gray-50/80 px-3 py-2.5 text-left dark:border-gray-600 dark:bg-gray-800/40 sm:gap-3.5 sm:px-3.5 sm:py-3"
            >
              <WorkshopPresenterPhotoOrPlaceholder
                name={m.name}
                photoUrl={m.photoUrl}
                imgClassName={m.photoImgClassName}
                size="compact"
              />
              <div className="min-w-0 flex-1 py-0.5">
                <p className="text-base font-semibold leading-tight text-gray-900 dark:text-white sm:text-lg">{m.name}</p>
                <p className="mt-1 text-sm leading-snug text-gray-600 dark:text-gray-300 sm:text-base">{m.organization}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/** Legacy: all three narrative blocks in default order (welcome → story → committee). Prefer composing sections individually in the program book. */
export function Summit2026ProgramNarrativeSections({ getText }: Props) {
  return (
    <div className="flex w-full flex-col gap-8">
      <Summit2026WelcomeLetterSection getText={getText} />
      <Summit2026StorySlxaiSection getText={getText} />
      <Summit2026CommitteeSection getText={getText} />
    </div>
  );
}
