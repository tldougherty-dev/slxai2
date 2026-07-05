import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PublicPageShell } from '@/components/public-design/PublicPageShell';
import { PublicSection } from '@/components/public-design/PublicSection';
import { GlassCard, ScrollReveal } from '@/components/public-design/GlassCard';
import { useToast } from '@/hooks/use-toast';
import { subscribeNewsletter } from '@/data/newsletterSubscribers';
import { CheckCircle2, Loader2, Mail } from 'lucide-react';

export default function Newsletter() {
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim() || !emailRegex.test(email)) {
      toast({
        title: 'Invalid email',
        description: 'Please enter a valid email address.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await subscribeNewsletter(email.trim(), 'newsletter');
      setIsSubscribed(true);
      setEmail('');
      toast({
        title: result === 'already_subscribed' ? 'Already subscribed' : 'Thank you!',
        description:
          result === 'already_subscribed'
            ? 'This email is already on our newsletter list.'
            : 'You are subscribed to SLxAI news and event updates.',
      });
    } catch {
      toast({
        title: 'Subscription failed',
        description: 'Please try again in a moment.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PublicPageShell>
      <PublicSection className="py-12 sm:py-16">
        <ScrollReveal>
          {isSubscribed ? (
            <GlassCard strong className="mx-auto max-w-lg text-center !p-8 sm:!p-10">
              <CheckCircle2 className="mx-auto mb-4 h-14 w-14 text-green-400" aria-hidden />
              <h1 className="text-2xl font-bold text-white sm:text-3xl">You are subscribed</h1>
              <p className="mx-auto mt-3 max-w-md text-white/65">
                Thanks for joining the SLxAI newsletter. We will send you news, events, and community updates.
              </p>
              <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                <Button
                  variant="outline"
                  className="rounded-xl border-white/25 text-white hover:bg-white/10"
                  onClick={() => setIsSubscribed(false)}
                >
                  Subscribe another email
                </Button>
                <Button asChild className="btn-glow bg-electric-blue hover:bg-electric-blue/90">
                  <Link to="/">Back to home</Link>
                </Button>
              </div>
            </GlassCard>
          ) : (
            <GlassCard strong className="mx-auto max-w-lg text-center !p-8 sm:!p-10">
              <Mail className="mx-auto mb-4 h-12 w-12 text-electric-blue" aria-hidden />
              <h1 className="text-3xl font-bold text-white sm:text-4xl">Subscribe to our newsletter</h1>
              <p className="mx-auto mt-3 max-w-md text-white/65">
                Get SLxAI news, summit updates, Academy workshops, and community announcements in your inbox.
              </p>
              <form onSubmit={handleSubmit} className="mx-auto mt-8 max-w-md space-y-4 text-left">
                <div className="space-y-2">
                  <label htmlFor="newsletter-email" className="glass-form-label">
                    Email address
                  </label>
                  <Input
                    id="newsletter-email"
                    type="email"
                    required
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isSubmitting}
                    className="glass-form-input h-12"
                    autoComplete="email"
                  />
                </div>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-glow h-12 w-full rounded-xl bg-electric-blue hover:bg-electric-blue/90"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />
                      Subscribing…
                    </>
                  ) : (
                    'Subscribe'
                  )}
                </Button>
              </form>
              <p className="mt-6 text-sm text-white/50">
                <Link to="/" className="text-electric-blue hover:underline">
                  ← Back to home
                </Link>
              </p>
            </GlassCard>
          )}
        </ScrollReveal>
      </PublicSection>
    </PublicPageShell>
  );
}
