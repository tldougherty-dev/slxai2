import { Navigate } from 'react-router-dom';
import { Trophy } from 'lucide-react';
import { PageTitle } from '@/components/PageTitle';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AcademyWorkshopSubmissionsTab } from '@/components/admin/AcademyWorkshopSubmissionsTab';
import { InterestedOrganizationsDirectory } from '@/components/admin/InterestedOrganizationsDirectory';
import { InterestSubmissionsTab } from '@/components/admin/summit/InterestSubmissionsTab';
import { TicketReservationsTab } from '@/components/admin/summit/TicketReservationsTab';
import { WaitlistTab } from '@/components/admin/summit/WaitlistTab';
import { canAccessAdmin } from '@/lib/roles';
import { getUserRole } from '@/lib/auth';
import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';

export default function SummitAdmin() {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  useEffect(() => {
    setIsAdmin(canAccessAdmin(getUserRole()));
  }, []);

  if (isAdmin === null) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-electric-blue" />
      </div>
    );
  }

  if (!isAdmin) {
    return <Navigate to="/membership-portal/feed" replace />;
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      <PageTitle title="Summit Admin" />
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold text-gray-900 dark:text-white">
          <Trophy className="h-7 w-7 text-electric-blue" aria-hidden />
          Summit Admin
        </h1>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
          Manage summit submissions, ticket reservations, and the waitlist.
        </p>
      </div>

      <Tabs defaultValue="submissions" className="space-y-6">
        <TabsList className="flex h-auto w-full flex-wrap justify-start gap-1 bg-white dark:bg-[hsl(217,40%,18%)]">
          <TabsTrigger value="submissions" className="text-xs sm:text-sm">
            Submission
          </TabsTrigger>
          <TabsTrigger value="tickets" className="text-xs sm:text-sm">
            Tickets
          </TabsTrigger>
          <TabsTrigger value="waiting" className="text-xs sm:text-sm">
            Waiting
          </TabsTrigger>
        </TabsList>

        <TabsContent value="submissions" className="space-y-6">
          <AcademyWorkshopSubmissionsTab />
          <InterestedOrganizationsDirectory />
          <InterestSubmissionsTab />
        </TabsContent>

        <TabsContent value="tickets" className="space-y-6">
          <TicketReservationsTab />
        </TabsContent>

        <TabsContent value="waiting" className="space-y-6">
          <WaitlistTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
