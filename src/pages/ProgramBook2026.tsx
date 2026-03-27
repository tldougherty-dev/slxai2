import Summit2026ProgramBookContent from '@/components/summit2026/Summit2026ProgramBookContent';
import { ProgramBook2026Shell, useProgramBook2026GetText } from '@/components/summit2026/ProgramBook2026Shell';

/**
 * Public program book for Summit 2026 at /2026 — same summit content as the homepage
 * without mission/vision/goals, bylaws, founding interest, or waitlist. Top bar: Home + language.
 */
function ProgramBook2026Inner() {
  const getText = useProgramBook2026GetText();
  return (
    <Summit2026ProgramBookContent
      getText={getText}
      hideSoldOut
      showProgramBookSubtitle
      showWorkshopsAndPanels={false}
    />
  );
}

const ProgramBook2026 = () => (
  <ProgramBook2026Shell>
    <ProgramBook2026Inner />
  </ProgramBook2026Shell>
);

export default ProgramBook2026;
