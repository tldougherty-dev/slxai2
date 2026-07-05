import { Navigate, useSearchParams } from 'react-router-dom';
import { PageTitle } from '@/components/PageTitle';
import { AcademyPageContent } from '@/components/academy/AcademyPageContent';
import { libraryTabUrl } from '@/lib/libraryPaths';

export default function PortalAcademy() {
  const [searchParams] = useSearchParams();
  const legacyTab = searchParams.get('tab');
  if (legacyTab) {
    return <Navigate to={libraryTabUrl(legacyTab)} replace />;
  }

  return (
    <div className="space-y-10">
      <PageTitle title="Academy" />
      <AcademyPageContent variant="portal" submitProposalHref="/academy/submit" />
    </div>
  );
}
