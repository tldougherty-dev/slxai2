import {
  SUMMIT_2026_COMMITTEE_MEMBERS,
  SUMMIT_2026_STORY_SLXAI_PARAGRAPHS,
  SUMMIT_2026_WELCOME_LETTER_PARAGRAPHS,
  SUMMIT_2026_WELCOME_LETTER_SIGNATURE,
} from '@/data/summit2026ProgramBookNarrative';
import type { Summit2026ProgramBookGetText } from '@/components/summit2026/summit2026ProgramBookTypes';

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

export function Summit2026WelcomeLetterSection({ getText }: Props) {
  return (
    <section id="summit-welcome-letter" className={sectionShell}>
      <div className={narrativeHeroHeaderBar}>
        <h2 className={narrativeHeroTitle}>{getText('welcomeLetterTitle', 'Welcome Letter from the Host')}</h2>
      </div>
      <ProseBlock paragraphs={SUMMIT_2026_WELCOME_LETTER_PARAGRAPHS} />
      <div className="flex justify-end border-t border-gray-100 bg-gradient-to-b from-gray-50/80 to-transparent px-4 pb-6 pt-6 dark:border-gray-700 dark:from-gray-900/50 sm:px-6 sm:pb-8">
        <div className="max-w-lg text-right">
          <p className="text-sm font-medium tracking-wide text-gray-600 dark:text-gray-400">
            {SUMMIT_2026_WELCOME_LETTER_SIGNATURE.closing}
          </p>
          <p
            className="welcome-letter-signature-name mt-3 text-[2.5rem] leading-none tracking-wide text-slate-900 [text-shadow:0_1px_0_rgba(255,255,255,0.6)] dark:text-slate-100 dark:[text-shadow:0_1px_1px_rgba(0,0,0,0.35)] sm:text-[3rem]"
            lang="en"
          >
            {SUMMIT_2026_WELCOME_LETTER_SIGNATURE.name}
          </p>
          <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">{SUMMIT_2026_WELCOME_LETTER_SIGNATURE.role}</p>
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
        <ul className="grid grid-cols-1 gap-2 md:grid-cols-2 md:gap-2.5">
          {SUMMIT_2026_COMMITTEE_MEMBERS.map((m, i) => (
            <li
              key={`${m.name}-${i}`}
              className="flex min-h-[5rem] flex-col items-center justify-center rounded-md border border-gray-200 bg-gray-50/80 px-3 py-3 text-center dark:border-gray-600 dark:bg-gray-800/40 sm:min-h-[5.25rem]"
            >
              <p className="text-base font-semibold leading-tight text-gray-900 dark:text-white sm:text-lg">{m.name}</p>
              <p className="mt-1.5 text-sm leading-snug text-gray-600 dark:text-gray-300 sm:text-base">{m.organization}</p>
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
