import { PageTitle } from '@/components/PageTitle';
import { AcademyPageContent } from '@/components/academy/AcademyPageContent';
import { AcademyLibrarySection } from '@/components/academy/AcademyLibrarySection';

export default function PortalAcademy() {
  return (
    <div className="space-y-10">
      <PageTitle title="Academy" />

      <AcademyPageContent variant="portal" submitProposalHref="/academy/submit" />

      <AcademyLibrarySection />
    </div>
  );
}
