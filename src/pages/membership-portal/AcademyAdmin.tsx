import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { PageTitle } from '@/components/PageTitle';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { canAccessAdmin } from '@/lib/roles';
import { getCurrentUser, getUserRole } from '@/lib/auth';
import {
  approveSubmissionAsWorkshop,
  getAcademyAnalytics,
  getAllPresenters,
  getCategories,
  getEmailLogs,
  getRegistrations,
  getSubmissions,
  getWorkshops,
  sendReminderEmail,
  updateSubmissionStatus,
  updateWorkshopSchedule,
} from '@/data/academy';
import type {
  AcademyAnalytics,
  AcademyEmailLog,
  AcademyPresenter,
  AcademyRegistration,
  AcademySubmission,
  AcademyWorkshop,
  SubmissionStatus,
  WorkshopStatus,
} from '@/data/academyTypes';
import { SKILL_LEVEL_LABELS } from '@/data/academyTypes';
import { format } from 'date-fns';
import {
  BarChart3,
  Calendar,
  Check,
  GraduationCap,
  Loader2,
  Mail,
  Users,
  X,
} from 'lucide-react';

function statusBadge(status: string) {
  const variants: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    approved: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
    under_review: 'bg-blue-100 text-blue-800',
    scheduled: 'bg-electric-blue/10 text-electric-blue',
    draft: 'bg-slate-100 text-slate-700',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
  };
  return (
    <Badge className={variants[status] ?? 'bg-slate-100'} variant="secondary">
      {status.replace('_', ' ')}
    </Badge>
  );
}

export default function AcademyAdmin() {
  const { toast } = useToast();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<AcademyAnalytics | null>(null);
  const [submissions, setSubmissions] = useState<AcademySubmission[]>([]);
  const [workshops, setWorkshops] = useState<AcademyWorkshop[]>([]);
  const [presenters, setPresenters] = useState<AcademyPresenter[]>([]);
  const [registrations, setRegistrations] = useState<AcademyRegistration[]>([]);
  const [emailLogs, setEmailLogs] = useState<AcademyEmailLog[]>([]);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [scheduleEdits, setScheduleEdits] = useState<Record<string, { scheduledAt: string; zoomUrl: string; status: WorkshopStatus }>>({});

  useEffect(() => {
    const role = getUserRole();
    setIsAdmin(canAccessAdmin(role));
  }, []);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [a, s, w, p, r, e, c] = await Promise.all([
        getAcademyAnalytics(),
        getSubmissions(),
        getWorkshops(),
        getAllPresenters(),
        getRegistrations(),
        getEmailLogs(),
        getCategories(),
      ]);
      setAnalytics(a);
      setSubmissions(s);
      setWorkshops(w);
      setPresenters(p);
      setRegistrations(r);
      setEmailLogs(e);
      setCategories(c.map((cat) => ({ id: cat.id, name: cat.name })));
      const edits: typeof scheduleEdits = {};
      w.forEach((ws) => {
        edits[ws.id] = {
          scheduledAt: ws.scheduledAt ? format(ws.scheduledAt, "yyyy-MM-dd'T'HH:mm") : '',
          zoomUrl: ws.zoomUrl ?? '',
          status: ws.status,
        };
      });
      setScheduleEdits(edits);
    } catch (err) {
      toast({
        title: 'Failed to load Academy data',
        description: err instanceof Error ? err.message : 'Unknown error',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) loadAll();
  }, [isAdmin]);

  const handleReview = async (id: string, status: SubmissionStatus, notes?: string) => {
    try {
      const user = await getCurrentUser();
      await updateSubmissionStatus(id, status, notes, user?.email ?? undefined);
      toast({ title: `Submission ${status}` });
      loadAll();
    } catch (err) {
      toast({ title: 'Update failed', description: err instanceof Error ? err.message : '', variant: 'destructive' });
    }
  };

  const handleApproveAsWorkshop = async (submission: AcademySubmission) => {
    const slug = submission.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
      .slice(0, 60);
    const categoryId = categories[0]?.id ?? 'cat-prompting';
    try {
      await approveSubmissionAsWorkshop(submission, slug, categoryId);
      toast({ title: 'Workshop created from submission' });
      loadAll();
    } catch (err) {
      toast({ title: 'Approval failed', description: err instanceof Error ? err.message : '', variant: 'destructive' });
    }
  };

  const handleSaveSchedule = async (workshopId: string) => {
    const edit = scheduleEdits[workshopId];
    if (!edit) return;
    try {
      await updateWorkshopSchedule(workshopId, {
        scheduledAt: edit.scheduledAt || undefined,
        zoomUrl: edit.zoomUrl || undefined,
        status: edit.status,
      });
      toast({ title: 'Workshop updated' });
      loadAll();
    } catch (err) {
      toast({ title: 'Update failed', description: err instanceof Error ? err.message : '', variant: 'destructive' });
    }
  };

  const handleSendReminder = async (workshopId: string, email: string) => {
    try {
      await sendReminderEmail(workshopId, email, 'Reminder: Your SLxAI Academy workshop is coming up');
      toast({ title: 'Reminder logged' });
      loadAll();
    } catch (err) {
      toast({ title: 'Failed', description: err instanceof Error ? err.message : '', variant: 'destructive' });
    }
  };

  if (isAdmin === null) {
    return <div className="p-8 text-center text-slate-500">Loading…</div>;
  }
  if (!isAdmin) return <Navigate to="/membership-portal" replace />;

  return (
    <div className="space-y-4">
      <PageTitle title="Academy Admin" fullWidthLandscape />

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-electric-blue" />
        </div>
      ) : (
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="flex h-auto flex-wrap gap-1">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="submissions">
              Submissions {analytics?.pendingSubmissions ? `(${analytics.pendingSubmissions})` : ''}
            </TabsTrigger>
            <TabsTrigger value="workshops">Workshops</TabsTrigger>
            <TabsTrigger value="presenters">Presenters</TabsTrigger>
            <TabsTrigger value="registrations">Registrations</TabsTrigger>
            <TabsTrigger value="emails">Emails</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-4">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { label: 'Total workshops', value: analytics?.totalWorkshops ?? 0, icon: GraduationCap },
                { label: 'Scheduled', value: analytics?.scheduledWorkshops ?? 0, icon: Calendar },
                { label: 'Registrations', value: analytics?.totalRegistrations ?? 0, icon: Users },
                { label: 'Pending submissions', value: analytics?.pendingSubmissions ?? 0, icon: Mail },
              ].map(({ label, value, icon: Icon }) => (
                <Card key={label}>
                  <CardContent className="flex items-center gap-4 p-5">
                    <Icon className="h-8 w-8 text-electric-blue" />
                    <div>
                      <p className="text-2xl font-bold">{value}</p>
                      <p className="text-sm text-slate-500">{label}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="submissions" className="mt-4">
            {submissions.length === 0 ? (
              <p className="text-slate-500">No submissions yet.</p>
            ) : (
              <div className="space-y-4">
                {submissions.map((sub) => (
                  <Card key={sub.id}>
                    <CardHeader className="flex flex-row items-start justify-between gap-4 pb-2">
                      <div>
                        <CardTitle className="text-lg">{sub.title}</CardTitle>
                        <p className="text-sm text-slate-500">
                          {sub.presenterName} · {sub.contactEmail} · {format(sub.submittedAt, 'MMM d, yyyy')}
                        </p>
                      </div>
                      {statusBadge(sub.status)}
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <p className="text-sm text-slate-700">{sub.description}</p>
                      <div className="flex flex-wrap gap-2 text-xs text-slate-500">
                        <span>{SKILL_LEVEL_LABELS[sub.skillLevel]}</span>
                        <span>·</span>
                        <span>{sub.durationMinutes} min</span>
                        <span>·</span>
                        <span>{sub.signLanguage}</span>
                        <span>·</span>
                        <span>{sub.aiTools.join(', ')}</span>
                      </div>
                      {sub.status === 'pending' && (
                        <div className="flex flex-wrap gap-2">
                          <Button size="sm" onClick={() => handleApproveAsWorkshop(sub)} className="bg-electric-blue hover:bg-electric-blue/90">
                            <Check className="mr-1 h-4 w-4" /> Approve & create workshop
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => handleReview(sub.id, 'under_review')}>
                            Mark under review
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => handleReview(sub.id, 'rejected')}>
                            <X className="mr-1 h-4 w-4" /> Reject
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="workshops" className="mt-4 space-y-4">
            {workshops.map((ws) => (
              <Card key={ws.id}>
                <CardHeader>
                  <div className="flex items-center justify-between gap-2">
                    <CardTitle className="text-lg">{ws.title}</CardTitle>
                    {statusBadge(ws.status)}
                  </div>
                </CardHeader>
                <CardContent className="grid gap-4 sm:grid-cols-3">
                  <div className="space-y-2">
                    <Label>Scheduled at</Label>
                    <Input
                      type="datetime-local"
                      value={scheduleEdits[ws.id]?.scheduledAt ?? ''}
                      onChange={(e) =>
                        setScheduleEdits({
                          ...scheduleEdits,
                          [ws.id]: { ...scheduleEdits[ws.id], scheduledAt: e.target.value },
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Zoom URL</Label>
                    <Input
                      value={scheduleEdits[ws.id]?.zoomUrl ?? ''}
                      onChange={(e) =>
                        setScheduleEdits({
                          ...scheduleEdits,
                          [ws.id]: { ...scheduleEdits[ws.id], zoomUrl: e.target.value },
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Status</Label>
                    <Select
                      value={scheduleEdits[ws.id]?.status ?? ws.status}
                      onValueChange={(v) =>
                        setScheduleEdits({
                          ...scheduleEdits,
                          [ws.id]: { ...scheduleEdits[ws.id], status: v as WorkshopStatus },
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {(['draft', 'scheduled', 'completed', 'cancelled'] as WorkshopStatus[]).map((s) => (
                          <SelectItem key={s} value={s}>
                            {s}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="sm:col-span-3">
                    <Button size="sm" onClick={() => handleSaveSchedule(ws.id)} className="bg-electric-blue hover:bg-electric-blue/90">
                      Save schedule
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="presenters" className="mt-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Organization</TableHead>
                  <TableHead>Language</TableHead>
                  <TableHead>Featured</TableHead>
                  <TableHead>Email</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {presenters.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium">{p.name}</TableCell>
                    <TableCell>{p.organization ?? '—'}</TableCell>
                    <TableCell>{p.signLanguage}</TableCell>
                    <TableCell>{p.featured ? 'Yes' : 'No'}</TableCell>
                    <TableCell>{p.email}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TabsContent>

          <TabsContent value="registrations" className="mt-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Workshop</TableHead>
                  <TableHead>Registered</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {registrations.map((reg) => (
                  <TableRow key={reg.id}>
                    <TableCell>{reg.name}</TableCell>
                    <TableCell>{reg.email}</TableCell>
                    <TableCell>{reg.workshopTitle ?? reg.workshopId}</TableCell>
                    <TableCell>{format(reg.registeredAt, 'MMM d, yyyy')}</TableCell>
                    <TableCell>
                      <Button size="sm" variant="outline" onClick={() => handleSendReminder(reg.workshopId, reg.email)}>
                        Send reminder
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TabsContent>

          <TabsContent value="emails" className="mt-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>To</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Sent</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {emailLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell>{log.recipientEmail}</TableCell>
                    <TableCell>{log.subject}</TableCell>
                    <TableCell>{log.emailType}</TableCell>
                    <TableCell>{format(log.sentAt, 'MMM d, yyyy HH:mm')}</TableCell>
                    <TableCell>{statusBadge(log.status)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TabsContent>

          <TabsContent value="analytics" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-electric-blue" />
                  Registrations by workshop
                </CardTitle>
              </CardHeader>
              <CardContent>
                {analytics?.registrationsByWorkshop.map((row) => (
                  <div key={row.workshopId} className="mb-3 flex items-center gap-3">
                    <div className="flex-1 text-sm">{row.title}</div>
                    <div className="h-4 flex-1 max-w-xs rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-electric-blue"
                        style={{
                          width: `${Math.min(100, (row.count / Math.max(1, analytics.totalRegistrations)) * 100)}%`,
                        }}
                      />
                    </div>
                    <span className="w-8 text-right text-sm font-medium">{row.count}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
