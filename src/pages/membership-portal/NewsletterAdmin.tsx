import { useEffect, useMemo, useState } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { format } from 'date-fns';
import { PageTitle } from '@/components/PageTitle';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { canAccessAdmin } from '@/lib/roles';
import { getCurrentUser, getUserRole } from '@/lib/auth';
import {
  deleteNewsletter,
  listAllNewsletters,
  publishNewsletter,
  saveNewsletter,
  scheduleNewsletter,
} from '@/data/signalNewsletter';
import {
  createDefaultTemplateBlocks,
  duplicateBlocks,
  normalizeNewsletterDocument,
  type SignalNewsletterDocument,
} from '@/lib/signalNewsletterBlocks';
import { uploadNewsletterImage } from '@/lib/newsletterMedia';
import {
  SIGNAL_NEWSLETTER_BRAND,
  defaultNewsletterTitle,
  type SignalNewsletter,
} from '@/lib/signalNewsletterTemplate';
import { SignalNewsletterView } from '@/components/signal/SignalNewsletterView';
import { NewsletterBlockEditor } from '@/components/signal/NewsletterBlockEditor';
import { GlassCard } from '@/components/public-design/GlassCard';
import {
  Calendar,
  Copy,
  ExternalLink,
  Loader2,
  Newspaper,
  Plus,
  Save,
  Send,
  Trash2,
  Upload,
} from 'lucide-react';

function statusBadge(status: string) {
  const styles: Record<string, string> = {
    draft: 'bg-slate-100 text-slate-700',
    scheduled: 'bg-amber-100 text-amber-900',
    published: 'bg-green-100 text-green-800',
  };
  return (
    <Badge className={styles[status] ?? 'bg-slate-100'} variant="secondary">
      {status}
    </Badge>
  );
}

export default function NewsletterAdmin() {
  const { toast } = useToast();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [issues, setIssues] = useState<SignalNewsletter[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [coverUploading, setCoverUploading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState(defaultNewsletterTitle());
  const [issueNumber, setIssueNumber] = useState<string>('');
  const [document, setDocument] = useState<SignalNewsletterDocument>({
    version: 2,
    blocks: createDefaultTemplateBlocks(),
  });
  const [scheduledAt, setScheduledAt] = useState('');
  const [showPreview, setShowPreview] = useState(false);

  const previewNewsletter = useMemo(
    (): SignalNewsletter => ({
      id: editingId ?? 'preview',
      slug: 'preview',
      title,
      issueNumber: issueNumber ? Number(issueNumber) : null,
      status: 'draft',
      scheduledAt: null,
      publishedAt: null,
      content: document,
      createdBy: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    }),
    [document, editingId, issueNumber, title],
  );

  useEffect(() => {
    setIsAdmin(canAccessAdmin(getUserRole()));
  }, []);

  const loadIssues = async () => {
    setLoading(true);
    try {
      const data = await listAllNewsletters();
      setIssues(data);
    } catch (e) {
      toast({
        title: 'Could not load newsletters',
        description: e instanceof Error ? e.message : 'Unknown error',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) loadIssues();
  }, [isAdmin]);

  const resetEditor = () => {
    const nextIssue = issues.length > 0 ? Math.max(...issues.map((i) => i.issueNumber ?? 0)) + 1 : 1;
    setEditingId(null);
    setTitle(defaultNewsletterTitle(nextIssue));
    setIssueNumber(String(nextIssue));
    setDocument({ version: 2, blocks: createDefaultTemplateBlocks() });
    setScheduledAt('');
    setShowPreview(false);
  };

  const startNew = () => {
    resetEditor();
  };

  const openIssue = (issue: SignalNewsletter) => {
    setEditingId(issue.id);
    setTitle(issue.title);
    setIssueNumber(issue.issueNumber != null ? String(issue.issueNumber) : '');
    setDocument(normalizeNewsletterDocument(issue.content));
    setScheduledAt(
      issue.scheduledAt ? format(issue.scheduledAt, "yyyy-MM-dd'T'HH:mm") : '',
    );
    setShowPreview(false);
  };

  const duplicateIssue = (issue: SignalNewsletter) => {
    const nextIssue = issues.length > 0 ? Math.max(...issues.map((i) => i.issueNumber ?? 0)) + 1 : 1;
    setEditingId(null);
    setTitle(defaultNewsletterTitle(nextIssue));
    setIssueNumber(String(nextIssue));
    const normalized = normalizeNewsletterDocument(issue.content);
    setDocument({
      ...normalized,
      blocks: duplicateBlocks(normalized.blocks),
    });
    setScheduledAt('');
    setShowPreview(false);
    toast({ title: 'Duplicated', description: 'Edit and save as a new draft.' });
  };

  const handleCoverUpload = async (file: File | null) => {
    if (!file) return;
    const user = getCurrentUser();
    if (!user?.id) {
      toast({ title: 'Sign in required', variant: 'destructive' });
      return;
    }
    setCoverUploading(true);
    try {
      const url = await uploadNewsletterImage(file, user.id);
      setDocument((prev) => ({ ...prev, coverImageUrl: url }));
      toast({ title: 'Cover image uploaded' });
    } catch (e) {
      toast({
        title: 'Upload failed',
        description: e instanceof Error ? e.message : 'Unknown error',
        variant: 'destructive',
      });
    } finally {
      setCoverUploading(false);
    }
  };

  const handleSaveDraft = async () => {
    setSaving(true);
    try {
      const saved = await saveNewsletter({
        id: editingId ?? undefined,
        title,
        issueNumber: issueNumber ? Number(issueNumber) : null,
        content: document,
        status: 'draft',
      });
      setEditingId(saved.id);
      toast({ title: 'Draft saved' });
      await loadIssues();
    } catch (e) {
      toast({
        title: 'Save failed',
        description: e instanceof Error ? e.message : 'Unknown error',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const ensureSaved = async (): Promise<string | null> => {
    if (editingId) return editingId;
    setSaving(true);
    try {
      const saved = await saveNewsletter({
        title,
        issueNumber: issueNumber ? Number(issueNumber) : null,
        content: document,
        status: 'draft',
      });
      setEditingId(saved.id);
      await loadIssues();
      return saved.id;
    } catch (e) {
      toast({
        title: 'Save failed',
        description: e instanceof Error ? e.message : 'Unknown error',
        variant: 'destructive',
      });
      return null;
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async () => {
    const id = await ensureSaved();
    if (!id) return;
    setSaving(true);
    try {
      const published = await publishNewsletter(id);
      toast({
        title: 'Published',
        description: 'This issue is now live on its public page.',
      });
      openIssue(published);
      await loadIssues();
    } catch (e) {
      toast({
        title: 'Publish failed',
        description: e instanceof Error ? e.message : 'Unknown error',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSchedule = async () => {
    if (!scheduledAt) {
      toast({ title: 'Pick a date and time', variant: 'destructive' });
      return;
    }
    const when = new Date(scheduledAt);
    if (Number.isNaN(when.getTime()) || when <= new Date()) {
      toast({ title: 'Schedule must be in the future', variant: 'destructive' });
      return;
    }
    const id = await ensureSaved();
    if (!id) return;
    setSaving(true);
    try {
      const scheduled = await scheduleNewsletter(id, when);
      toast({
        title: 'Scheduled',
        description: `Will publish on ${format(when, 'MMM d, yyyy h:mm a')}`,
      });
      openIssue(scheduled);
      await loadIssues();
    } catch (e) {
      toast({
        title: 'Schedule failed',
        description: e instanceof Error ? e.message : 'Unknown error',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this newsletter issue? This cannot be undone.')) return;
    try {
      await deleteNewsletter(id);
      if (editingId === id) resetEditor();
      toast({ title: 'Deleted' });
      await loadIssues();
    } catch (e) {
      toast({
        title: 'Delete failed',
        description: e instanceof Error ? e.message : 'Unknown error',
        variant: 'destructive',
      });
    }
  };

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

  const publishedIssue = issues.find((i) => i.id === editingId && i.status === 'published');

  return (
    <div className="space-y-6 p-4 md:p-6">
      <PageTitle title="Newsletter" />
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold text-gray-900 dark:text-white">
            <Newspaper className="h-7 w-7 text-electric-blue" aria-hidden />
            {SIGNAL_NEWSLETTER_BRAND}
          </h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
            Build issues with drag-and-drop blocks, images, and video embeds. Published at{' '}
            <code className="text-xs">/signal/your-slug</code>.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" onClick={startNew}>
            <Plus className="mr-2 h-4 w-4" />
            New issue
          </Button>
          <Button type="button" variant="outline" asChild>
            <Link to="/signal" target="_blank" rel="noopener noreferrer">
              <ExternalLink className="mr-2 h-4 w-4" />
              Public archive
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[320px_1fr]">
        <Card className="glass-card h-fit">
          <CardHeader>
            <CardTitle className="text-lg">Issues</CardTitle>
            <CardDescription>Drafts, scheduled, and published newsletters.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {loading && <p className="text-sm text-gray-500">Loading…</p>}
            {!loading && issues.length === 0 && (
              <p className="text-sm text-gray-500">No issues yet. Create your first newsletter.</p>
            )}
            {issues.map((issue) => (
              <div
                key={issue.id}
                className={`rounded-lg border p-3 transition-colors ${
                  editingId === issue.id
                    ? 'border-electric-blue bg-electric-blue/5'
                    : 'border-gray-200 dark:border-gray-700'
                }`}
              >
                <button type="button" onClick={() => openIssue(issue)} className="w-full text-left">
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{issue.title}</span>
                    {statusBadge(issue.status)}
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    {issue.issueNumber ? `Issue ${issue.issueNumber}` : 'No issue #'}
                    {issue.publishedAt ? ` · ${format(issue.publishedAt, 'MMM d, yyyy')}` : ''}
                    {issue.scheduledAt && issue.status === 'scheduled'
                      ? ` · Scheduled ${format(issue.scheduledAt, 'MMM d, h:mm a')}`
                      : ''}
                  </p>
                </button>
                <div className="mt-2 flex gap-1">
                  <Button type="button" variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={() => duplicateIssue(issue)}>
                    <Copy className="mr-1 h-3 w-3" />
                    Duplicate
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Issue details</CardTitle>
              <CardDescription>Title, subtitle, cover image, and schedule.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="newsletter-title">Title</Label>
                <Input
                  id="newsletter-title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={defaultNewsletterTitle()}
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="newsletter-subtitle">Subtitle (optional)</Label>
                <Input
                  id="newsletter-subtitle"
                  value={document.subtitle ?? ''}
                  onChange={(e) => setDocument((prev) => ({ ...prev, subtitle: e.target.value }))}
                  placeholder="A short line under the title on the public page"
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label>Cover image (optional)</Label>
                {document.coverImageUrl && (
                  <img
                    src={document.coverImageUrl}
                    alt=""
                    className="mb-2 max-h-40 rounded-lg border object-cover"
                  />
                )}
                <div className="flex flex-wrap gap-2">
                  <Label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-gray-300 px-3 py-2 text-sm hover:bg-gray-50 dark:border-gray-600">
                    {coverUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                    Upload cover
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/gif,image/webp"
                      className="sr-only"
                      disabled={coverUploading}
                      onChange={(e) => handleCoverUpload(e.target.files?.[0] ?? null)}
                    />
                  </Label>
                  <Input
                    className="max-w-md flex-1"
                    value={document.coverImageUrl ?? ''}
                    onChange={(e) => setDocument((prev) => ({ ...prev, coverImageUrl: e.target.value }))}
                    placeholder="Or paste image URL"
                  />
                  {document.coverImageUrl && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setDocument((prev) => ({ ...prev, coverImageUrl: undefined }))}
                    >
                      Remove
                    </Button>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="newsletter-issue">Issue number</Label>
                <Input
                  id="newsletter-issue"
                  type="number"
                  min={1}
                  value={issueNumber}
                  onChange={(e) => setIssueNumber(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newsletter-schedule">Schedule publish</Label>
                <Input
                  id="newsletter-schedule"
                  type="datetime-local"
                  value={scheduledAt}
                  onChange={(e) => setScheduledAt(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardContent className="pt-6">
              <NewsletterBlockEditor document={document} onChange={setDocument} />
            </CardContent>
          </Card>

          <div className="flex flex-wrap gap-2">
            <Button type="button" onClick={handleSaveDraft} disabled={saving}>
              {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              Save draft
            </Button>
            <Button type="button" variant="outline" onClick={handleSchedule} disabled={saving}>
              <Calendar className="mr-2 h-4 w-4" />
              Schedule
            </Button>
            <Button type="button" className="bg-green-600 hover:bg-green-700" onClick={handlePublish} disabled={saving}>
              <Send className="mr-2 h-4 w-4" />
              Publish now
            </Button>
            <Button type="button" variant="outline" onClick={() => setShowPreview((p) => !p)}>
              {showPreview ? 'Hide preview' : 'Preview'}
            </Button>
            {editingId && (
              <Button
                type="button"
                variant="destructive"
                onClick={() => handleDelete(editingId)}
                disabled={saving}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </Button>
            )}
            {publishedIssue && (
              <Button type="button" variant="outline" asChild>
                <Link to={`/signal/${publishedIssue.slug}`} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  View live page
                </Link>
              </Button>
            )}
          </div>

          {showPreview && (
            <div className="public-site light-public signal-newsletter-preview-shell">
              <div className="relative px-4 py-8 sm:px-8">
                <GlassCard strong className="!p-6 sm:!p-10">
                  <SignalNewsletterView newsletter={previewNewsletter} showMeta />
                </GlassCard>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
