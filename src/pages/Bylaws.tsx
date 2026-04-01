import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { sanitizeText, isValidLength } from '@/lib/security';
import Navigation from '@/components/Navigation';
import { BylawsDocument } from '@/components/BylawsDocument';
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
    <div className="min-h-screen bg-white text-gray-900" id="main-content">
      <Navigation />
      <Button
        type="button"
        variant="default"
        size="icon"
        onClick={scrollToTop}
        className="fixed top-4 right-4 z-[100] h-11 w-11 rounded-full shadow-lg bg-electric-blue hover:bg-electric-blue/90 text-white border-0"
        aria-label="Back to top of page"
        title="Back to top"
      >
        <ArrowUp className="h-5 w-5" aria-hidden />
      </Button>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <Button variant="ghost" asChild className="mb-4 -ml-2">
            <Link to="/" className="text-electric-blue">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to home
            </Link>
          </Button>
          <h1 className="sr-only">Bylaws: SLxAI</h1>
        </div>

        <article
          className="rounded-lg border border-gray-200 bg-white dark:bg-gray-950/50 p-6 sm:p-10 mb-12 shadow-sm"
          aria-label="SLxAI bylaws full text"
        >
          {loadError && (
            <p className="text-red-600 text-sm" role="alert">
              {loadError}
            </p>
          )}
          {!body && !loadError && (
            <p className="text-gray-500 text-sm">Loading…</p>
          )}
          {body && <BylawsDocument text={body} />}
        </article>

        <section
          aria-labelledby="bylaws-feedback-heading"
          className="flex justify-center w-full"
        >
          <Card className="border-2 border-electric-blue/30 shadow-lg max-w-2xl w-full mx-auto">
            <CardHeader className="bg-electric-blue text-white rounded-t-lg text-center space-y-2 pb-4">
              <CardTitle
                id="bylaws-feedback-heading"
                className="text-white text-2xl font-bold text-center"
              >
                Feedback on these bylaws
              </CardTitle>
              <CardDescription className="text-white/90 text-center text-sm leading-relaxed">
                Share comments or questions. Name, email, organization, and your message are required before you
                can send.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              {isSubmitted ? (
                <div className="text-center py-6 text-gray-700">
                  <p className="text-lg font-medium text-gray-900 mb-2">Thank you. We received your feedback.</p>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsSubmitted(false)}
                    className="mt-2"
                  >
                    Send another message
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="bylaws-name" className="flex items-center gap-2">
                      <User className="h-4 w-4 text-electric-blue" />
                      Name <span className="text-red-600">*</span>
                    </Label>
                    <Input
                      id="bylaws-name"
                      value={form.name}
                      onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                      required
                      maxLength={200}
                      autoComplete="name"
                      className="bg-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bylaws-email" className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-electric-blue" />
                      Email <span className="text-red-600">*</span>
                    </Label>
                    <Input
                      id="bylaws-email"
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                      required
                      maxLength={200}
                      autoComplete="email"
                      className="bg-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bylaws-org" className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-electric-blue" />
                      Organization name <span className="text-red-600">*</span>
                    </Label>
                    <Input
                      id="bylaws-org"
                      value={form.organization}
                      onChange={(e) => setForm((f) => ({ ...f, organization: e.target.value }))}
                      required
                      maxLength={200}
                      className="bg-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bylaws-message" className="flex items-center gap-2">
                      <MessageSquare className="h-4 w-4 text-electric-blue" />
                      Your feedback <span className="text-red-600">*</span>
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
                      className="bg-white resize-y min-h-[120px]"
                    />
                    <p className="text-xs text-gray-500">{form.message.length} / 8000</p>
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-electric-blue hover:bg-electric-blue/90 text-white"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Sending…
                      </>
                    ) : (
                      'Submit feedback'
                    )}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}
