import { Navigate, useSearchParams } from 'react-router-dom';
import { Menu } from 'lucide-react';
import { useSidebar } from '@/components/ui/sidebar';
import { useIsMobile } from '@/hooks/use-mobile';
import { AcademyPageContent } from '@/components/academy/AcademyPageContent';
import { libraryTabUrl } from '@/lib/libraryPaths';

function PortalAcademyMobileMenu() {
  const isMobile = useIsMobile();
  const { toggleSidebar } = useSidebar();

  if (!isMobile) return null;

  return (
    <button
      type="button"
      onClick={toggleSidebar}
      className="mb-2 flex items-center justify-center bg-transparent p-2"
      aria-label="Toggle Sidebar"
    >
      <Menu className="h-6 w-6 text-gray-900 dark:text-white" />
    </button>
  );
}

export default function PortalAcademy() {
  const [searchParams] = useSearchParams();
  const legacyTab = searchParams.get('tab');
  if (legacyTab) {
    return <Navigate to={libraryTabUrl(legacyTab)} replace />;
  }

  return (
    <div className="space-y-10">
      <PortalAcademyMobileMenu />
      <AcademyPageContent variant="portal" submitProposalHref="/academy/submit" />
    </div>
  );
}
