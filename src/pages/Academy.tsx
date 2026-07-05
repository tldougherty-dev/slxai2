import { PublicPageShell } from '@/components/public-design/PublicPageShell';
import { AcademyPageContent } from '@/components/academy/AcademyPageContent';

export default function Academy() {
  return (
    <PublicPageShell>
      <AcademyPageContent variant="public" />
    </PublicPageShell>
  );
}
