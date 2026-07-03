import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { getCurrentUser } from '@/lib/auth';
import {
  approveSubmissionAsWorkshop,
  getCategories,
  getSubmissions,
  updateSubmissionStatus,
} from '@/data/academy';
import type { AcademySubmission, SubmissionStatus } from '@/data/academyTypes';
import { Check, CheckCircle2, History, Loader2, X } from 'lucide-react';

function formatDuration(minutes: number): string {
  const labels: Record<number, string> = {
    30: '30 minutes',
    45: '45 minutes',
    60: '1 hour',
    90: '1 hour and a half',
    120: '2 hours',
  };
  return labels[minutes] ?? `${minutes} minutes`;
}

function statusBadge(status: SubmissionStatus) {
  const variants: Record<SubmissionStatus, string> = {
    pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    approved: 'bg-green-100 text-green-800 border-green-200',
    rejected: 'bg-red-100 text-red-800 border-red-200',
    under_review: 'bg-blue-100 text-blue-800 border-blue-200',
  };
  return (
    <Badge variant="outline" className={variants[status]}>
      {status.replace('_', ' ')}
    </Badge>
  );
}

export function AcademyWorkshopSubmissionsTab() {
  const { toast } = useToast();
  const [submissions, setSubmissions] = useState<AcademySubmission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [categoryId, setCategoryId] = useState('');

  const loadSubmissions = async () => {
    setIsLoading(true);
    try {
      const [subs, categories] = await Promise.all([getSubmissions(), getCategories()]);
      setSubmissions(subs);
      setCategoryId(categories[0]?.id ?? '');
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to load workshop submissions.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSubmissions();
  }, []);

  const handleReview = async (id: string, status: SubmissionStatus) => {
    try {
      const user = await getCurrentUser();
      await updateSubmissionStatus(id, status, undefined, user?.email ?? undefined);
      toast({ title: `Submission ${status.replace('_', ' ')}` });
      loadSubmissions();
    } catch (error) {
      toast({
        title: 'Update failed',
        description: error instanceof Error ? error.message : 'Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleApproveAsWorkshop = async (submission: AcademySubmission) => {
    const slug = submission.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
      .slice(0, 60);

    try {
      await approveSubmissionAsWorkshop(submission, slug, categoryId || 'cat-prompting');
      toast({ title: 'Workshop created from submission' });
      loadSubmissions();
    } catch (error) {
      toast({
        title: 'Approval failed',
        description: error instanceof Error ? error.message : 'Please try again.',
        variant: 'destructive',
      });
    }
  };

  const pendingCount = submissions.filter((s) => s.status === 'pending').length;

  return (
    <Card className="glass-card floating-hover">
      <CardHeader>
        <div className="flex items-center justify-between gap-4">
          <div>
            <CardTitle>Workshop proposals</CardTitle>
            <CardDescription>
              Academy presenter submissions from the public proposal form
              {pendingCount > 0 ? ` · ${pendingCount} pending` : ''}
            </CardDescription>
          </div>
          <Button onClick={loadSubmissions} variant="outline" size="sm" className="bg-white">
            <History className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-electric-blue" />
          </div>
        ) : submissions.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-gray-600 dark:text-white">No workshop proposals yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {submissions.map((sub) => (
              <Card
                key={sub.id}
                className="border-gray-200 bg-white dark:border-[hsl(217,35%,25%)] dark:bg-[hsl(217,40%,18%)]"
              >
                <CardContent className="space-y-3 pt-6">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-lg font-semibold text-gray-900 dark:text-white">{sub.title}</p>
                      <p className="text-sm text-gray-600 dark:text-white">
                        {sub.presenterName} · {sub.contactEmail} ·{' '}
                        {format(sub.submittedAt, 'MMM d, yyyy')}
                      </p>
                    </div>
                    {statusBadge(sub.status)}
                  </div>

                  <p className="text-sm text-gray-700 dark:text-white whitespace-pre-wrap">{sub.description}</p>

                  <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-gray-500 dark:text-gray-300">
                    <span>{formatDuration(sub.durationMinutes)}</span>
                    <span>·</span>
                    <span>{sub.signLanguage}</span>
                    {sub.aiTools.length > 0 && (
                      <>
                        <span>·</span>
                        <span>{sub.aiTools.join(', ')}</span>
                      </>
                    )}
                  </div>

                  {sub.presenterBio && (
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      <span className="font-medium text-gray-900 dark:text-white">Presenter bio: </span>
                      {sub.presenterBio}
                    </p>
                  )}

                  {(sub.presenterOrganization || sub.contactName || sub.contactPhone) && (
                    <div className="text-xs text-gray-500 dark:text-gray-300">
                      {sub.presenterOrganization && <p>Organization: {sub.presenterOrganization}</p>}
                      {sub.contactName && <p>Contact: {sub.contactName}</p>}
                      {sub.contactPhone && <p>Phone: {sub.contactPhone}</p>}
                    </div>
                  )}

                  {sub.status === 'pending' && (
                    <div className="flex flex-wrap gap-2 pt-1">
                      <Button
                        size="sm"
                        onClick={() => handleApproveAsWorkshop(sub)}
                        className="bg-electric-blue hover:bg-electric-blue/90"
                      >
                        <Check className="mr-1 h-4 w-4" />
                        Approve & create workshop
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleReview(sub.id, 'under_review')}>
                        Mark under review
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => handleReview(sub.id, 'rejected')}>
                        <X className="mr-1 h-4 w-4" />
                        Reject
                      </Button>
                    </div>
                  )}

                  {sub.status === 'approved' && (
                    <div className="flex items-center gap-1 text-sm text-green-600">
                      <CheckCircle2 className="h-4 w-4" />
                      Approved
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
