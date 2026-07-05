import { PageTitle } from '@/components/PageTitle';
import { LibrarySection } from '@/components/library/LibrarySection';

export default function PortalLibrary() {
  return (
    <div className="space-y-6">
      <PageTitle title="Library" />
      <p className="text-sm text-gray-600 dark:text-gray-300 sm:text-base">
        Research, datasets, educational videos, workshop recordings, and member-shared files for the SLxAI community.
      </p>
      <LibrarySection />
    </div>
  );
}
