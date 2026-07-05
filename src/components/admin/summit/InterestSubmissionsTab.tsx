import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Building2, CheckCircle2, Clock, Copy, FileText, History, Loader2, Mail, Trash2, User,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';

interface InterestSubmission {
  id: string;
  name: string;
  email: string;
  organization: string;
  reason: string;
  approved: boolean;
  approved_at?: string;
  approved_by?: string;
  created_at: string;
}

function buildSignupLink(email: string): string {
  const params = new URLSearchParams({
    tab: 'signup',
    email: email.trim().toLowerCase(),
  });
  return `${window.location.origin}/login?${params.toString()}`;
}

export function InterestSubmissionsTab() {
  const { toast } = useToast();
  const [allSubmissions, setAllSubmissions] = useState<InterestSubmission[]>([]);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved'>('pending');
  const [isLoading, setIsLoading] = useState(true);
  const [submissionToDelete, setSubmissionToDelete] = useState<string | null>(null);
  const [approvingSubmission, setApprovingSubmission] = useState<string | null>(null);

  useEffect(() => {
    loadSubmissions();
  }, []);

  const submissions = allSubmissions.filter((submission) => {
    if (filter === 'pending') return !submission.approved;
    if (filter === 'approved') return submission.approved;
    return true;
  });

  const loadSubmissions = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('interest_submissions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAllSubmissions(data || []);
    } catch (error: unknown) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error loading interest submissions:', error);
      }
      toast({
        title: 'Error',
        description:
          error instanceof Error ? error.message : 'Failed to load interest submissions.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const copySignupLink = async (submission: InterestSubmission) => {
    try {
      await navigator.clipboard.writeText(buildSignupLink(submission.email));
      toast({
        title: 'Sign-up link copied',
        description: `Send this to ${submission.name}. They will verify their email via Supabase after signing up.`,
      });
    } catch {
      toast({
        title: 'Could not copy',
        description: buildSignupLink(submission.email),
      });
    }
  };

  const handleApproveSubmission = async (submission: InterestSubmission) => {
    if (submission.approved) {
      toast({
        title: 'Already approved',
        description: 'This submission has already been approved.',
      });
      return;
    }

    setApprovingSubmission(submission.id);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      const approvedBy = user?.email || 'admin';

      const { data: existingPerson } = await supabase
        .from('member_persons')
        .select('member_id, status, members!inner(id, organization_name, status)')
        .ilike('email', submission.email.toLowerCase().trim())
        .limit(1)
        .maybeSingle();

      if (existingPerson) {
        const memberStatus = (existingPerson.members as { status?: string } | null)?.status;
        const personStatus = existingPerson.status;

        if (memberStatus !== 'pending' && personStatus !== 'pending') {
          toast({
            title: 'Member already exists',
            description: `${submission.email} already has an active portal account.`,
            variant: 'destructive',
          });
          setApprovingSubmission(null);
          return;
        }
      }

      if (!existingPerson) {
        const { data: newMember, error: memberError } = await supabase
          .from('members')
          .insert({
            organization_name: submission.organization,
            country: 'Unknown',
            poc_name: submission.name,
            poc_email: submission.email.toLowerCase().trim(),
            poc_title: 'Pending',
            member_count: 1,
            status: 'pending',
          })
          .select()
          .single();

        if (memberError) throw memberError;

        const { error: personError } = await supabase.from('member_persons').insert({
          member_id: newMember.id,
          name: submission.name,
          email: submission.email.toLowerCase().trim(),
          title: 'Pending',
          is_voting_rep: true,
          status: 'pending',
        });

        if (personError) {
          await supabase.from('members').delete().eq('id', newMember.id);
          throw personError;
        }
      }

      const { error: updateError } = await supabase
        .from('interest_submissions')
        .update({
          approved: true,
          approved_at: new Date().toISOString(),
          approved_by: approvedBy,
        })
        .eq('id', submission.id);

      if (updateError) throw updateError;

      const signupLink = buildSignupLink(submission.email);
      try {
        await navigator.clipboard.writeText(signupLink);
      } catch {
        // clipboard optional
      }

      toast({
        title: 'Approved!',
        description: `${submission.name} can sign up at /login (link copied). Supabase will email them to verify their address.`,
      });

      setApprovingSubmission(null);
      loadSubmissions();
    } catch (error: unknown) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error approving submission:', error);
      }
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to approve submission.',
        variant: 'destructive',
      });
      setApprovingSubmission(null);
    }
  };

  const handleDeleteSubmission = async () => {
    if (!submissionToDelete) return;

    try {
      const { error } = await supabase
        .from('interest_submissions')
        .delete()
        .eq('id', submissionToDelete);

      if (error) throw error;

      toast({
        title: 'Deleted',
        description: 'Interest submission has been deleted.',
      });
      setSubmissionToDelete(null);
      loadSubmissions();
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error deleting submission:', error);
      }
      toast({
        title: 'Error',
        description: 'Failed to delete submission.',
        variant: 'destructive',
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Card className="glass-card floating-hover">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Interest Submissions</CardTitle>
            <CardDescription>
              Approve applicants, then share the sign-up link. Email verification is handled by Supabase.
            </CardDescription>
          </div>
          <Button onClick={loadSubmissions} variant="outline" size="sm" className="bg-white">
            <History className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex gap-2 mb-6 border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setFilter('pending')}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              filter === 'pending'
                ? 'border-electric-blue text-electric-blue'
                : 'border-transparent text-gray-600 dark:text-white hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            Pending ({allSubmissions.filter((s) => !s.approved).length})
          </button>
          <button
            onClick={() => setFilter('approved')}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              filter === 'approved'
                ? 'border-electric-blue text-electric-blue'
                : 'border-transparent text-gray-600 dark:text-white hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            Approved ({allSubmissions.filter((s) => s.approved).length})
          </button>
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              filter === 'all'
                ? 'border-electric-blue text-electric-blue'
                : 'border-transparent text-gray-600 dark:text-white hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            All ({allSubmissions.length})
          </button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-electric-blue" />
          </div>
        ) : submissions.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="h-12 w-12 text-gray-400 dark:text-white mx-auto mb-4" />
            <p className="text-gray-600 dark:text-white">
              {filter === 'pending'
                ? 'No pending submissions.'
                : filter === 'approved'
                  ? 'No approved submissions yet.'
                  : 'No interest submissions yet.'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {submissions.map((submission) => (
              <Card
                key={submission.id}
                className="bg-white dark:bg-[hsl(217,40%,18%)] border-gray-200 dark:border-[hsl(217,35%,25%)]"
              >
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center gap-3">
                        <User className="h-5 w-5 text-electric-blue" />
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-white">{submission.name}</p>
                          <p className="text-sm text-gray-600 dark:text-white flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {submission.email}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-white flex items-center gap-1">
                            <Building2 className="h-3 w-3" />
                            {submission.organization}
                          </p>
                        </div>
                      </div>
                      <div className="pl-8">
                        <p className="text-sm text-gray-700 dark:text-white whitespace-pre-wrap">
                          {submission.reason}
                        </p>
                      </div>
                      <div className="pl-8 flex items-center gap-2 text-xs text-gray-500 dark:text-white">
                        <Clock className="h-3 w-3" />
                        Submitted on {formatDate(submission.created_at)}
                        {submission.approved && submission.approved_at && (
                          <>
                            <span className="mx-2">•</span>
                            <span className="text-green-600 font-medium">Approved</span>
                            {submission.approved_by && (
                              <span className="text-gray-400 dark:text-white">by {submission.approved_by}</span>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap justify-end">
                      {!submission.approved && (
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => handleApproveSubmission(submission)}
                          disabled={approvingSubmission === submission.id}
                          className="bg-green-600 hover:bg-green-700 text-white"
                        >
                          {approvingSubmission === submission.id ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Approving...
                            </>
                          ) : (
                            <>
                              <CheckCircle2 className="h-4 w-4 mr-2" />
                              Approve
                            </>
                          )}
                        </Button>
                      )}
                      {submission.approved && (
                        <>
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Approved
                          </Badge>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => copySignupLink(submission)}
                            className="bg-white"
                          >
                            <Copy className="h-4 w-4 mr-2" />
                            Copy sign-up link
                          </Button>
                        </>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSubmissionToDelete(submission.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>

      <AlertDialog open={!!submissionToDelete} onOpenChange={(open) => !open && setSubmissionToDelete(null)}>
        <AlertDialogContent className="bg-white dark:bg-[hsl(217,40%,18%)] border-gray-200 dark:border-[hsl(217,35%,25%)]">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-gray-900 dark:text-white">Delete Submission?</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-600 dark:text-white">
              Are you sure you want to delete this interest submission? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => setSubmissionToDelete(null)}
              className="border-gray-300 dark:border-[hsl(217,35%,25%)] text-gray-700 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:text-white bg-white"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteSubmission} className="bg-red-600 hover:bg-red-700 text-white">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}