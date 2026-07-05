import { useEffect, useMemo, useState } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { format } from 'date-fns';
import { PageTitle } from '@/components/PageTitle';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { canAccessAdmin } from '@/lib/roles';
import { getUserRole } from '@/lib/auth';
import {
  deleteNewsletter,
  listAllNewsletters,
  publishNewsletter,
  saveNewsletter,
  scheduleNewsletter,
} from '@/data/signalNewsletter';
import { requestNewsletterDraft } from '@/lib/newsletterDraftApi';
import {
  EMPTY_SIGNAL_CONTENT,
  SIGNAL_NEWSLETTER_BRAND,
  SIGNAL_NEWSLETTER_SECTIONS,
  defaultNewsletterTitle,
  type SignalNewsletter,
  type SignalNewsletterContent,
  type SignalNewsletterSectionKey,
} from '@/lib/signalNewsletterTemplate';
import { SignalNewsletterView } from '@/components/signal/SignalNewsletterView';
import {
  Bot,
  Calendar,
  ExternalLink,
  Loader2,
  Newspaper,
  Plus,
  Save,
  Send,
  Sparkles,
  Trash2,
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
  const [aiLoading, setAiLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState(defaultNewsletterTitle());
  const [issueNumber, setIssueNumber] = useState<string>('');
  const [content, setContent] = useState<SignalNewsletterContent>({ ...EMPTY_SIGNAL_CONTENT });
  const [scheduledAt, setScheduledAt] = useState('');
  const [aiSection, setAiSection] = useState<SignalNewsletterSectionKey>('editors_note');
  const [aiPrompt, setAiPrompt] = useState('');
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
      content,
      createdBy: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    }),
    [content, editingId, issueNumber, title],
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
    setContent({ ...EMPTY_SIGNAL_CONTENT });
    setScheduledAt('');
    setAiPrompt('');
    setShowPreview(false);
  };

  const startNew = () => {
    resetEditor();
    const nextIssue = issues.length > 0 ? Math.max(...issues.map((i) => i.issueNumber ?? 0)) + 1 : 1;
    setIssueNumber(String(nextIssue));
    setTitle(defaultNewsletterTitle(nextIssue));
  };

  const openIssue = (issue: SignalNewsletter) => {
    setEditingId(issue.id);
    setTitle(issue.title);
    setIssueNumber(issue.issueNumber != null ? String(issue.issueNumber) : '');
    setContent({ ...EMPTY_SIGNAL_CONTENT, ...issue.content });
    setScheduledAt(
      issue.scheduledAt ? format(issue.scheduledAt, "yyyy-MM-dd'T'HH:mm") : '',
    );
    setShowPreview(false);
  };

  const handleSaveDraft = async () => {
    setSaving(true);
    try {
      const saved = await saveNewsletter({
        id: editingId ?? undefined,
        title,
        issueNumber: issueNumber ? Number(issueNumber) : null,
        content,
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
        content,
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

  const handleAiDraft = async () => {
    setAiLoading(true);
    try {
      const draft = await requestNewsletterDraft({
        section: aiSection,
        title,
        issueNumber: issueNumber ? Number(issueNumber) : null,
        prompt: aiPrompt || undefined,
        currentContent: content[aiSection],
      });
      setContent((prev) => ({ ...prev, [aiSection]: draft }));
      toast({ title: 'Draft generated', description: `Updated ${SIGNAL_NEWSLETTER_SECTIONS.find((s) => s.key === aiSection)?.label}` });
    } catch (e) {
      toast({
        title: 'AI draft failed',
        description: e instanceof Error ? e.message : 'Unknown error',
        variant: 'destructive',
      });
    } finally {
      setAiLoading(false);
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
            Draft issues, use the AI assistant, schedule publishing, and publish to public pages at{' '}
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
              <button
                key={issue.id}
                type="button"
                onClick={() => openIssue(issue)}
                className={`w-full rounded-lg border p-3 text-left transition-colors ${
                  editingId === issue.id
                    ? 'border-electric-blue bg-electric-blue/5'
                    : 'border-gray-200 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800/50'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="font-medium text-sm text-gray-900 dark:text-white">{issue.title}</span>
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
            ))}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Issue details</CardTitle>
              <CardDescription>Title and issue number appear on the public newsletter page.</CardDescription>
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

          <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle>Newsletter template</CardTitle>
                <CardDescription>Fill each section for the SLxAI Signal template.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                {SIGNAL_NEWSLETTER_SECTIONS.map((section) => (
                  <div key={section.key} className="space-y-2">
                    <Label htmlFor={`section-${section.key}`}>{section.label}</Label>
                    <Textarea
                      id={`section-${section.key}`}
                      value={content[section.key]}
                      onChange={(e) =>
                        setContent((prev) => ({ ...prev, [section.key]: e.target.value }))
                      }
                      placeholder={section.placeholder}
                      rows={4}
                      className="min-h-[100px] resize-y"
                    />
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="glass-card h-fit border-electric-blue/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bot className="h-5 w-5 text-electric-blue" aria-hidden />
                  AI drafting assistant
                </CardTitle>
                <CardDescription>
                  Generate or refine a section. Requires <code className="text-xs">OPENAI_API_KEY</code> on the server.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Section</Label>
                  <Select value={aiSection} onValueChange={(v) => setAiSection(v as SignalNewsletterSectionKey)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {SIGNAL_NEWSLETTER_SECTIONS.map((s) => (
                        <SelectItem key={s.key} value={s.key}>
                          {s.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ai-prompt">Instructions (optional)</Label>
                  <Textarea
                    id="ai-prompt"
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    placeholder="e.g. Mention the Academy workshop on prompt engineering…"
                    rows={4}
                  />
                </div>
                <Button
                  type="button"
                  className="w-full bg-electric-blue hover:bg-electric-blue/90"
                  onClick={handleAiDraft}
                  disabled={aiLoading}
                >
                  {aiLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Drafting…
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" />
                      Draft with AI
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>

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
            <Card className="glass-card border-gray-700 bg-slate-950">
              <CardHeader>
                <CardTitle className="text-white">Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <SignalNewsletterView newsletter={previewNewsletter} />
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
