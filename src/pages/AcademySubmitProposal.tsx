import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AcademyPublicLayout from '@/components/academy/AcademyPublicLayout';
import { useToast } from '@/hooks/use-toast';
import { submitProposal } from '@/data/academy';
import { sanitizeText, isValidLength } from '@/lib/security';
import { CheckCircle2, Loader2 } from 'lucide-react';

const SIGN_LANGUAGES = ['ASL', 'BSL', 'LSF', 'DGS', 'LSE', 'International Sign', 'Other'];

const DURATION_OPTIONS = [
  { value: '30', label: '30 minutes' },
  { value: '45', label: '45 minutes' },
  { value: '60', label: '1 hour' },
  { value: '90', label: '1 hour and a half' },
  { value: '120', label: '2 hours' },
] as const;

const ALLOWED_DURATIONS = new Set(DURATION_OPTIONS.map((option) => Number(option.value)));

export default function AcademySubmitProposal() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [aiToolsInput, setAiToolsInput] = useState('');
  const [form, setForm] = useState({
    title: '',
    description: '',
    signLanguage: 'ASL',
    durationMinutes: '60',
    presenterName: '',
    presenterBio: '',
    presenterOrganization: '',
    contactName: '',
    contactEmail: '',
    contactPhone: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const aiTools = aiToolsInput
      .split(',')
      .map((t) => sanitizeText(t.trim()))
      .filter(Boolean);
    const duration = parseInt(form.durationMinutes, 10);

    if (!form.title.trim() || !form.description.trim() || !form.presenterName.trim() || !form.presenterBio.trim()) {
      toast({ title: 'Missing fields', description: 'Please fill in all required fields.', variant: 'destructive' });
      return;
    }
    if (!emailRegex.test(form.contactEmail)) {
      toast({ title: 'Invalid email', description: 'Please enter a valid contact email.', variant: 'destructive' });
      return;
    }
    if (!ALLOWED_DURATIONS.has(duration)) {
      toast({ title: 'Invalid duration', description: 'Please select a workshop duration.', variant: 'destructive' });
      return;
    }
    if (!isValidLength(form.description, 50, 5000)) {
      toast({ title: 'Description length', description: 'Description must be 50–5000 characters.', variant: 'destructive' });
      return;
    }

    setIsSubmitting(true);
    try {
      await submitProposal({
        title: sanitizeText(form.title),
        description: sanitizeText(form.description),
        aiTools,
        signLanguage: form.signLanguage,
        durationMinutes: duration,
        presenterName: sanitizeText(form.presenterName),
        presenterBio: sanitizeText(form.presenterBio),
        presenterOrganization: form.presenterOrganization ? sanitizeText(form.presenterOrganization) : undefined,
        contactName: sanitizeText(form.contactName),
        contactEmail: sanitizeText(form.contactEmail),
        contactPhone: form.contactPhone ? sanitizeText(form.contactPhone) : undefined,
      });
      setIsSubmitted(true);
      toast({ title: 'Proposal submitted', description: 'Thank you! Our team will review your workshop proposal.' });
    } catch (err) {
      toast({
        title: 'Submission failed',
        description: err instanceof Error ? err.message : 'Please try again later.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AcademyPublicLayout title="Become a Presenter | SLxAI Academy">
      <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-slate-900">Propose a Workshop</h1>
          <p className="mt-2 text-slate-600">
            Tell us about your live, sign-language workshop idea. All fields marked with * are required.
          </p>
        </div>

        {isSubmitted ? (
          <Card className="border-green-200">
            <CardContent className="py-10 text-center">
              <CheckCircle2 className="mx-auto mb-4 h-12 w-12 text-green-600" />
              <h2 className="mb-2 text-xl font-semibold">Proposal received!</h2>
              <p className="mb-6 text-slate-600">
                We will review your submission and contact you at {form.contactEmail}.
              </p>
              <Button asChild className="bg-electric-blue hover:bg-electric-blue/90">
                <Link to="/academy">Back to Academy</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Workshop details</CardTitle>
              <CardDescription>Designed for live, interactive Zoom sessions in sign language.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="title">Workshop title *</Label>
                  <Input
                    id="title"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    placeholder="e.g. Prompt Engineering for Deaf Professionals"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    placeholder="What will participants learn? How will the live session be structured?"
                    rows={5}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="duration">Duration *</Label>
                  <Select
                    value={form.durationMinutes}
                    onValueChange={(v) => setForm({ ...form, durationMinutes: v })}
                  >
                    <SelectTrigger id="duration">
                      <SelectValue placeholder="Select duration" />
                    </SelectTrigger>
                    <SelectContent>
                      {DURATION_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="aiTools">AI tools covered *</Label>
                  <Input
                    id="aiTools"
                    value={aiToolsInput}
                    onChange={(e) => setAiToolsInput(e.target.value)}
                    placeholder="ChatGPT, Claude, Zapier (comma-separated)"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signLanguage">Your preferred Sign Language *</Label>
                  <Select
                    value={form.signLanguage}
                    onValueChange={(v) => setForm({ ...form, signLanguage: v })}
                  >
                    <SelectTrigger id="signLanguage">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {SIGN_LANGUAGES.map((lang) => (
                        <SelectItem key={lang} value={lang}>
                          {lang}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <hr className="border-slate-200" />

                <div className="space-y-2">
                  <Label htmlFor="presenterName">Presenter name *</Label>
                  <Input
                    id="presenterName"
                    value={form.presenterName}
                    onChange={(e) => setForm({ ...form, presenterName: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="presenterBio">Presenter bio *</Label>
                  <Textarea
                    id="presenterBio"
                    value={form.presenterBio}
                    onChange={(e) => setForm({ ...form, presenterBio: e.target.value })}
                    rows={4}
                    placeholder="Your background and expertise relevant to this workshop"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="presenterOrganization">Organization</Label>
                  <Input
                    id="presenterOrganization"
                    value={form.presenterOrganization}
                    onChange={(e) => setForm({ ...form, presenterOrganization: e.target.value })}
                  />
                </div>

                <hr className="border-slate-200" />

                <div className="space-y-2">
                  <Label htmlFor="contactName">Contact name *</Label>
                  <Input
                    id="contactName"
                    value={form.contactName}
                    onChange={(e) => setForm({ ...form, contactName: e.target.value })}
                    required
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="contactEmail">Contact email *</Label>
                    <Input
                      id="contactEmail"
                      type="email"
                      value={form.contactEmail}
                      onChange={(e) => setForm({ ...form, contactEmail: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contactPhone">Contact phone</Label>
                    <Input
                      id="contactPhone"
                      type="tel"
                      value={form.contactPhone}
                      onChange={(e) => setForm({ ...form, contactPhone: e.target.value })}
                    />
                  </div>
                </div>

                <Button type="submit" className="w-full bg-electric-blue hover:bg-electric-blue/90" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting…
                    </>
                  ) : (
                    'Submit proposal'
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}
      </div>
    </AcademyPublicLayout>
  );
}
