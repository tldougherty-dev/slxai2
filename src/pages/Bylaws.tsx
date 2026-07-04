import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { sanitizeText, isValidLength } from '@/lib/security';
import { BylawsDocument } from '@/components/BylawsDocument';
import { PublicPageShell } from '@/components/public-design/PublicPageShell';
import { PublicSection } from '@/components/public-design/PublicSection';
import { GlassCard } from '@/components/public-design/GlassCard';
import { ArrowLeft, ArrowUp, Loader2, Mail, User, Building2, MessageSquare } from 'lucide-react';

export default function Bylaws() {
  const { toast } = useToast();
  const [body, setBody] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    organization: '',
    message: '',
  });

  useEffect(() => {
    let cancelled = false;
    fetch('/bylaws.txt')
      .then((r) => {
        if (!r.ok) throw new Error('Could not load bylaws');
        return r.text();
      })
      .then((text) => {
        if (!cancelled) setBody(text);
      })
      .catch((e) => {
        if (!cancelled) setLoadError(e instanceof Error ? e.message : 'Failed to load');
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast({ title: 'Name required', description: 'Please enter your name.', variant: 'destructive' });
      return;
    }
    if (!form.email.trim()) {
      toast({ title: 'Email required', description: 'Please enter your email.', variant: 'destructive' });
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      toast({ title: 'Invalid email', description: 'Please enter a valid email address.', variant: 'destructive' });
      return;
    }
    if (!form.organization.trim()) {
      toast({ title: 'Organization required', description: 'Please enter your organization name.', variant: 'destructive' });
      return;
    }
    if (!form.message.trim()) {
      toast({ title: 'Feedback required', description: 'Please enter your feedback.', variant: 'destructive' });
      return;
    }
    if (!isValidLength(form.name, 1, 200) || !isValidLength(form.email, 1, 200) || !isValidLength(form.organization, 1, 200)) {
      toast({ title: 'Invalid input', description: 'Check field lengths.', variant: 'destructive' });
      return;
    }
    if (!isValidLength(form.message, 1, 8000)) {
      toast({ title: 'Feedback too long', description: 'Maximum 8,000 characters.', variant: 'destructive' });
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase.from('bylaws_feedback').insert({
        name: sanitizeText(form.name.trim()),
        email: form.email.toLowerCase().trim(),
        organization: sanitizeText(form.organization.trim()),
        message: sanitizeText(form.message.trim()),
      });

      if (error) {
        console.error('Bylaws feedback insert:', error.code, error.message, error.details);
        throw error;
      }

      setIsSubmitted(true);
      setForm({ name: '', email: '', organization: '', message: '' });
      toast({
        title: 'Thank you',
        description: 'Your feedback has been submitted.',
      });
    } catch (err: unknown) {
      const pg = err as { message?: string; code?: string; details?: string };
      const raw = pg?.message || (err instanceof Error ? err.message : '') || 'Submission failed.';
      const missingTable =
        raw.includes('relation') ||
        raw.includes('does not exist') ||
        raw.includes('schema cache') ||
        pg?.code === '42P01' ||
        pg?.code === 'PGRST205';
      if (process.env.NODE_ENV === 'development') {
        console.error('Bylaws feedback error:', err);
      }
      toast({
        title: 'Could not submit',
        description: missingTable
          ? 'Feedback storage is not set up in the database yet. An admin should run activity-logs/sql/BYLAWS_FEEDBACK_COMPLETE.sql in the Supabase SQL Editor, then try again.'
          : raw,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <PublicPageShell>
      <Button
        type="button"
        variant="default"
        size="icon"
        onClick={scrollToTop}
        className="fixed right-4 top-24 z-[100] h-11 w-11 rounded-full border-0 bg-electric-blue text-white shadow-lg hover:bg-electric-blue/90"
        aria-label="Back to top of page"
        title="Back to top"
      >
        <ArrowUp className="h-5 w-5" aria-hidden />
      </Button>

      <PublicSection className="py-10">
        <Button variant="ghost" asChild className="mb-6 -ml-2 text-white/80 hover:bg-white/10 hover:text-white">
          <Link to="/" className="inline-flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" aria-hidden />
            Back to home
          </Link>
        </Button>

        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-white sm:text-4xl public-section-title">Bylaws draft</h1>
          <p className="mt-2 text-white/65">Review the SLxAI bylaws and share your feedback below.</p>
        </div>

        <GlassCard strong as="article" className="mb-12 !p-6 sm:!p-10" aria-label="SLxAI bylaws full text">
          {loadError && (
            <p className="text-sm text-red-400" role="alert">
              {loadError}
            </p>
          )}
          {!body && !loadError && <p className="text-sm text-white/60">Loading…</p>}
          {body && <BylawsDocument text={body} />}
        </GlassCard>

        <section aria-labelledby="bylaws-feedback-heading" className="mx-auto flex w-full max-w-2xl justify-center">
          <GlassCard strong className="w-full !p-0 overflow-hidden">
            <div className="border-b border-white/10 bg-electric-blue px-6 py-5 text-center">
              <h2 id="bylaws-feedback-heading" className="text-2xl font-bold text-white">
                Feedback on these bylaws
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-white/90">
                Share comments or questions. Name, email, organization, and your message are required before you can
                send.
              </p>
            </div>
            <div className="p-6">
              {isSubmitted ? (
                <div className="py-6 text-center">
                  <p className="mb-2 text-lg font-medium text-white">Thank you. We received your feedback.</p>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsSubmitted(false)}
                    className="mt-2 rounded-xl border-white/25 text-white hover:bg-white/10"
                  >
                    Send another message
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="bylaws-name" className="glass-form-label flex items-center gap-2">
                      <User className="h-4 w-4 text-electric-blue" aria-hidden />
                      Name <span className="text-red-400">*</span>
                    </Label>
                    <Input
                      id="bylaws-name"
                      value={form.name}
                      onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                      required
                      maxLength={200}
                      autoComplete="name"
                      className="glass-form-input"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bylaws-email" className="glass-form-label flex items-center gap-2">
                      <Mail className="h-4 w-4 text-electric-blue" aria-hidden />
                      Email <span className="text-red-400">*</span>
                    </Label>
                    <Input
                      id="bylaws-email"
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                      required
                      maxLength={200}
                      autoComplete="email"
                      className="glass-form-input"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bylaws-org" className="glass-form-label flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-electric-blue" aria-hidden />
                      Organization name <span className="text-red-400">*</span>
                    </Label>
                    <Input
                      id="bylaws-org"
                      value={form.organization}
                      onChange={(e) => setForm((f) => ({ ...f, organization: e.target.value }))}
                      required
                      maxLength={200}
                      className="glass-form-input"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bylaws-message" className="glass-form-label flex items-center gap-2">
                      <MessageSquare className="h-4 w-4 text-electric-blue" aria-hidden />
                      Your feedback <span className="text-red-400">*</span>
                    </Label>
                    <Textarea
                      id="bylaws-message"
                      value={form.message}
                      onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
                      required
                      minLength={1}
                      maxLength={8000}
                      rows={6}
                      placeholder="Your comments or questions..."
                      className="glass-form-input min-h-[120px] resize-y"
                    />
                    <p className="text-xs text-white/45">{form.message.length} / 8000</p>
                  </div>
                  <Button
                    type="submit"
                    className="btn-glow w-full rounded-xl bg-electric-blue text-white hover:bg-electric-blue/90"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />
                        Sending…
                      </>
                    ) : (
                      'Submit feedback'
                    )}
                  </Button>
                </form>
              )}
            </div>
          </GlassCard>
        </section>
      </PublicSection>
    </PublicPageShell>
  );
}
