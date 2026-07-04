import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { PublicPageShell } from '@/components/public-design/PublicPageShell';
import { PublicSection } from '@/components/public-design/PublicSection';
import { GlassCard } from '@/components/public-design/GlassCard';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { User, Building2, FileText, Loader2, CheckCircle2, Mail } from 'lucide-react';
import { sanitizeText, isValidLength } from '@/lib/security';

export default function Interest() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    organization: '',
    reason: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!formData.name || formData.name.trim() === '') {
      toast({ title: 'Name required', description: 'Please enter your name.', variant: 'destructive' });
      setIsSubmitting(false);
      return;
    }

    if (!formData.email || formData.email.trim() === '') {
      toast({ title: 'Email required', description: 'Please enter your email address.', variant: 'destructive' });
      setIsSubmitting(false);
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast({ title: 'Invalid email', description: 'Please enter a valid email address.', variant: 'destructive' });
      setIsSubmitting(false);
      return;
    }

    if (!formData.organization || formData.organization.trim() === '') {
      toast({ title: 'Organization required', description: 'Please enter your organization name.', variant: 'destructive' });
      setIsSubmitting(false);
      return;
    }

    if (!formData.reason || formData.reason.trim() === '') {
      toast({ title: 'Reason required', description: 'Please tell us why you want to be part of this.', variant: 'destructive' });
      setIsSubmitting(false);
      return;
    }

    if (!isValidLength(formData.name, 1, 200) || !isValidLength(formData.email, 1, 200) || !isValidLength(formData.organization, 1, 200)) {
      toast({ title: 'Invalid input', description: 'Please check your entries and try again.', variant: 'destructive' });
      setIsSubmitting(false);
      return;
    }

    if (!isValidLength(formData.reason, 10, 2000)) {
      toast({ title: 'Invalid reason', description: 'Please provide a reason between 10 and 2000 characters.', variant: 'destructive' });
      setIsSubmitting(false);
      return;
    }

    try {
      const { error } = await supabase.from('interest_submissions').insert({
        name: sanitizeText(formData.name.trim()),
        email: formData.email.toLowerCase().trim(),
        organization: sanitizeText(formData.organization.trim()),
        reason: sanitizeText(formData.reason.trim()),
      });

      if (error) throw error;

      setIsSubmitted(true);
      setFormData({ name: '', email: '', organization: '', reason: '' });
      toast({
        title: 'Thank you!',
        description: "Your interest submission has been received. We'll review it and get back to you soon.",
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to submit your interest. Please try again later.';
      if (process.env.NODE_ENV === 'development') {
        console.error('Error submitting interest:', error);
      }
      toast({ title: 'Submission failed', description: message, variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PublicPageShell>
      <PublicSection className="py-12">
        {isSubmitted ? (
          <GlassCard className="py-12 text-center">
            <CheckCircle2 className="mx-auto mb-4 h-14 w-14 text-green-400" aria-hidden />
            <h1 className="text-2xl font-bold text-white">Thank you!</h1>
            <p className="mx-auto mt-3 max-w-md text-white/65">
              Your interest submission has been received. We will review it and get back to you soon.
            </p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Button variant="outline" className="rounded-xl border-white/25 text-white hover:bg-white/10" onClick={() => setIsSubmitted(false)}>
                Submit another
              </Button>
              <Button asChild className="btn-glow bg-electric-blue hover:bg-electric-blue/90">
                <Link to="/">Back to home</Link>
              </Button>
            </div>
          </GlassCard>
        ) : (
          <>
            <div className="mb-8 text-center">
              <h1 className="text-3xl font-bold text-white sm:text-4xl">Express your interest</h1>
              <p className="mt-3 text-white/65">
                Tell us about yourself and why you would like to be part of SLxAI.
              </p>
            </div>

            <GlassCard strong className="!p-0 overflow-hidden">
              <div className="border-b border-white/10 px-6 py-5">
                <h2 className="text-lg font-semibold text-white">Membership interest</h2>
                <p className="mt-1 text-sm text-white/60">Join the global community advancing Sign Language × AI.</p>
              </div>
              <div className="p-6">
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="glass-form-label flex items-center gap-2">
                      <User className="h-4 w-4 text-electric-blue" aria-hidden />
                      Your name
                    </Label>
                    <Input
                      id="name"
                      type="text"
                      placeholder="Jane Doe"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                      disabled={isSubmitting}
                      className="glass-form-input"
                      maxLength={200}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="glass-form-label flex items-center gap-2">
                      <Mail className="h-4 w-4 text-electric-blue" aria-hidden />
                      Email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="your.email@organization.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                      disabled={isSubmitting}
                      className="glass-form-input"
                      maxLength={200}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="organization" className="glass-form-label flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-electric-blue" aria-hidden />
                      Organization
                    </Label>
                    <Input
                      id="organization"
                      type="text"
                      placeholder="Your organization name"
                      value={formData.organization}
                      onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                      required
                      disabled={isSubmitting}
                      className="glass-form-input"
                      maxLength={200}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="reason" className="glass-form-label flex items-center gap-2">
                      <FileText className="h-4 w-4 text-electric-blue" aria-hidden />
                      Why do you want to be part of this?
                    </Label>
                    <Textarea
                      id="reason"
                      placeholder="Tell us about your interest in SLxAI, your background, and what you hope to contribute…"
                      value={formData.reason}
                      onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                      required
                      disabled={isSubmitting}
                      className="glass-form-input min-h-[150px]"
                      maxLength={2000}
                    />
                    <p className="text-xs text-white/45">{formData.reason.length} / 2000 characters</p>
                  </div>

                  <Button type="submit" className="btn-glow w-full rounded-xl bg-electric-blue hover:bg-electric-blue/90" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />
                        Submitting…
                      </>
                    ) : (
                      'Submit interest'
                    )}
                  </Button>
                </form>

                <p className="mt-6 text-center text-sm text-white/50">
                  <Link to="/" className="text-electric-blue hover:underline">
                    ← Back to home
                  </Link>
                </p>
              </div>
            </GlassCard>
          </>
        )}
      </PublicSection>
    </PublicPageShell>
  );
}
