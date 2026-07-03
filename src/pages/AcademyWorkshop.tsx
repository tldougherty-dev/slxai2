import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import AcademyPublicLayout from '@/components/academy/AcademyPublicLayout';
import { getWorkshopBySlug, registerForWorkshop } from '@/data/academy';
import type { AcademyWorkshop } from '@/data/academyTypes';
import { SKILL_LEVEL_LABELS } from '@/data/academyTypes';
import { useToast } from '@/hooks/use-toast';
import { sanitizeText } from '@/lib/security';
import {
  Calendar,
  CheckCircle2,
  Clock,
  Download,
  ExternalLink,
  Languages,
  Loader2,
  Mic,
  Target,
  Users,
  Video,
} from 'lucide-react';
import { format } from 'date-fns';

export default function AcademyWorkshopPage() {
  const { slug } = useParams<{ slug: string }>();
  const { toast } = useToast();
  const [workshop, setWorkshop] = useState<AcademyWorkshop | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRegistering, setIsRegistering] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [regForm, setRegForm] = useState({ name: '', email: '', organization: '' });

  useEffect(() => {
    if (!slug) return;
    getWorkshopBySlug(slug)
      .then(setWorkshop)
      .finally(() => setLoading(false));
  }, [slug]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!workshop) return;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!regForm.name.trim() || !emailRegex.test(regForm.email)) {
      toast({ title: 'Invalid form', description: 'Please enter your name and a valid email.', variant: 'destructive' });
      return;
    }

    setIsRegistering(true);
    try {
      await registerForWorkshop({
        workshopId: workshop.id,
        name: sanitizeText(regForm.name),
        email: sanitizeText(regForm.email),
        organization: regForm.organization ? sanitizeText(regForm.organization) : undefined,
      });
      setIsRegistered(true);
      toast({ title: 'Registered!', description: 'Check your email for confirmation and Zoom details.' });
    } catch (err) {
      toast({
        title: 'Registration failed',
        description: err instanceof Error ? err.message : 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsRegistering(false);
    }
  };

  if (loading) {
    return (
      <AcademyPublicLayout>
        <p className="py-20 text-center text-slate-500">Loading workshop…</p>
      </AcademyPublicLayout>
    );
  }

  if (!workshop) {
    return (
      <AcademyPublicLayout>
        <div className="mx-auto max-w-lg px-4 py-20 text-center">
          <h1 className="mb-4 text-2xl font-bold">Workshop not found</h1>
          <Button asChild className="bg-electric-blue hover:bg-electric-blue/90">
            <Link to="/academy">Back to Academy</Link>
          </Button>
        </div>
      </AcademyPublicLayout>
    );
  }

  const spotsLeft =
    workshop.maxParticipants != null && workshop.registrationCount != null
      ? workshop.maxParticipants - workshop.registrationCount
      : null;

  return (
    <AcademyPublicLayout title={`${workshop.title} | SLxAI Academy`}>
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Button variant="ghost" asChild className="-ml-2 text-electric-blue">
            <Link to="/academy">← All workshops</Link>
          </Button>
        </div>

        <header className="mb-8">
          <div className="mb-3 flex flex-wrap gap-2">
            {workshop.categoryName && (
              <Badge className="bg-electric-blue">{workshop.categoryName}</Badge>
            )}
            <Badge variant="outline">{SKILL_LEVEL_LABELS[workshop.skillLevel]}</Badge>
            <Badge variant="outline">{workshop.signLanguage}</Badge>
          </div>
          <h1 className="mb-4 text-3xl font-bold text-slate-900 sm:text-4xl">{workshop.title}</h1>
          <p className="text-lg leading-relaxed text-slate-600">{workshop.description}</p>
        </header>

        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {workshop.scheduledAt && (
            <Card>
              <CardContent className="flex items-center gap-3 p-4">
                <Calendar className="h-5 w-5 text-electric-blue" />
                <div>
                  <p className="text-xs text-slate-500">Date & time</p>
                  <p className="text-sm font-medium">{format(workshop.scheduledAt, 'MMM d, yyyy · h:mm a')} UTC</p>
                </div>
              </CardContent>
            </Card>
          )}
          <Card>
            <CardContent className="flex items-center gap-3 p-4">
              <Clock className="h-5 w-5 text-electric-blue" />
              <div>
                <p className="text-xs text-slate-500">Duration</p>
                <p className="text-sm font-medium">{workshop.durationMinutes} min · Live</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-3 p-4">
              <Video className="h-5 w-5 text-electric-blue" />
              <div>
                <p className="text-xs text-slate-500">Format</p>
                <p className="text-sm font-medium">Interactive Zoom</p>
              </div>
            </CardContent>
          </Card>
          {spotsLeft != null && (
            <Card>
              <CardContent className="flex items-center gap-3 p-4">
                <Users className="h-5 w-5 text-electric-blue" />
                <div>
                  <p className="text-xs text-slate-500">Spots left</p>
                  <p className="text-sm font-medium">{Math.max(0, spotsLeft)}</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          <div className="space-y-8 lg:col-span-2">
            {/* Learning objectives */}
            <section aria-labelledby="objectives-heading">
              <h2 id="objectives-heading" className="mb-4 flex items-center gap-2 text-xl font-bold text-slate-900">
                <Target className="h-5 w-5 text-electric-blue" />
                Learning objectives
              </h2>
              <ul className="space-y-2">
                {workshop.learningObjectives.map((obj) => (
                  <li key={obj} className="flex gap-2 text-slate-700">
                    <span className="text-electric-blue">•</span>
                    {obj}
                  </li>
                ))}
              </ul>
            </section>

            {/* Presenter */}
            {workshop.presenter && (
              <section aria-labelledby="presenter-heading">
                <h2 id="presenter-heading" className="mb-4 flex items-center gap-2 text-xl font-bold text-slate-900">
                  <Mic className="h-5 w-5 text-electric-blue" />
                  Presenter
                </h2>
                <Card>
                  <CardContent className="p-5">
                    <h3 className="font-semibold text-slate-900">{workshop.presenter.name}</h3>
                    {workshop.presenter.organization && (
                      <p className="text-sm text-electric-blue">{workshop.presenter.organization}</p>
                    )}
                    <p className="mt-2 flex items-center gap-1 text-sm text-slate-500">
                      <Languages className="h-4 w-4" />
                      {workshop.presenter.signLanguage}
                    </p>
                    <p className="mt-3 text-sm leading-relaxed text-slate-600">{workshop.presenter.bio}</p>
                  </CardContent>
                </Card>
              </section>
            )}

            {/* AI tools */}
            <section aria-labelledby="tools-heading">
              <h2 id="tools-heading" className="mb-3 text-xl font-bold text-slate-900">
                AI tools covered
              </h2>
              <div className="flex flex-wrap gap-2">
                {workshop.aiTools.map((tool) => (
                  <Badge key={tool} variant="outline" className="border-electric-blue/30 text-electric-blue">
                    {tool}
                  </Badge>
                ))}
              </div>
            </section>

            {/* Resources */}
            {workshop.resources && workshop.resources.length > 0 && (
              <section aria-labelledby="resources-heading">
                <h2 id="resources-heading" className="mb-4 flex items-center gap-2 text-xl font-bold text-slate-900">
                  <Download className="h-5 w-5 text-electric-blue" />
                  Downloadable resources
                </h2>
                <ul className="space-y-2">
                  {workshop.resources.map((res) => (
                    <li key={res.id}>
                      <a
                        href={res.url}
                        className="inline-flex items-center gap-2 text-electric-blue hover:underline"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {res.title}
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            <p className="text-sm italic text-slate-500">
              Workshops are delivered live on Zoom. Join in real time to engage with presenters, participate
              in discussion, and get the most from each session.
            </p>
          </div>

          {/* Registration sidebar */}
          <aside>
            <Card className="sticky top-24 border-electric-blue/30">
              <CardHeader className="bg-electric-blue text-white">
                <CardTitle className="text-white">Register for this workshop</CardTitle>
              </CardHeader>
              <CardContent className="p-5">
                {isRegistered ? (
                  <div className="text-center">
                    <CheckCircle2 className="mx-auto mb-3 h-10 w-10 text-green-600" />
                    <p className="mb-2 font-semibold">You&apos;re registered!</p>
                    <p className="mb-4 text-sm text-slate-600">
                      Zoom details will be sent to {regForm.email}.
                    </p>
                    {workshop.zoomUrl && (
                      <Button asChild className="w-full bg-electric-blue hover:bg-electric-blue/90">
                        <a href={workshop.zoomUrl} target="_blank" rel="noopener noreferrer">
                          Join Zoom meeting
                          <ExternalLink className="ml-2 h-4 w-4" />
                        </a>
                      </Button>
                    )}
                  </div>
                ) : (
                  <form onSubmit={handleRegister} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="reg-name">Name *</Label>
                      <Input
                        id="reg-name"
                        value={regForm.name}
                        onChange={(e) => setRegForm({ ...regForm, name: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="reg-email">Email *</Label>
                      <Input
                        id="reg-email"
                        type="email"
                        value={regForm.email}
                        onChange={(e) => setRegForm({ ...regForm, email: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="reg-org">Organization</Label>
                      <Input
                        id="reg-org"
                        value={regForm.organization}
                        onChange={(e) => setRegForm({ ...regForm, organization: e.target.value })}
                      />
                    </div>
                    <Button
                      type="submit"
                      className="w-full bg-electric-blue hover:bg-electric-blue/90"
                      disabled={isRegistering || spotsLeft === 0}
                    >
                      {isRegistering ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Registering…
                        </>
                      ) : spotsLeft === 0 ? (
                        'Workshop full'
                      ) : (
                        'Register now'
                      )}
                    </Button>
                  </form>
                )}

                {workshop.zoomMeetingId && isRegistered && (
                  <div className="mt-4 rounded-md bg-slate-50 p-3 text-sm">
                    <p>
                      <strong>Meeting ID:</strong> {workshop.zoomMeetingId}
                    </p>
                    {workshop.zoomPasscode && (
                      <p>
                        <strong>Passcode:</strong> {workshop.zoomPasscode}
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </aside>
        </div>
      </div>
    </AcademyPublicLayout>
  );
}
