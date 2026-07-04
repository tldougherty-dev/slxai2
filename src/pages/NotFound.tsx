import { Button } from '@/components/ui/button';
import { Home, ArrowLeft, Search } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { PublicPageShell } from '@/components/public-design/PublicPageShell';
import { GlassCard } from '@/components/public-design/GlassCard';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <PublicPageShell>
      <div className="flex min-h-[60vh] items-center justify-center px-4 py-16">
        <GlassCard strong className="w-full max-w-2xl text-center">
          <p className="text-7xl font-bold text-gradient-brand" aria-hidden>
            404
          </p>
          <h1 className="mt-4 text-3xl font-bold text-white public-section-title">Page not found</h1>
          <p className="mx-auto mt-4 max-w-md text-white/65">
            Sorry, we could not find the page you are looking for. It may have been moved, deleted, or the URL might be incorrect.
          </p>

          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Button
              onClick={() => navigate(-1)}
              variant="outline"
              className="rounded-xl border-white/25 text-white hover:bg-white/10"
            >
              <ArrowLeft className="mr-2 h-4 w-4" aria-hidden />
              Go back
            </Button>
            <Button asChild className="btn-glow bg-electric-blue hover:bg-electric-blue/90">
              <Link to="/">
                <Home className="mr-2 h-4 w-4" aria-hidden />
                Go home
              </Link>
            </Button>
            <Button asChild variant="outline" className="rounded-xl border-white/25 text-white hover:bg-white/10">
              <Link to="/login">
                <Search className="mr-2 h-4 w-4" aria-hidden />
                Member portal
              </Link>
            </Button>
          </div>

          <p className="mt-8 border-t border-white/10 pt-6 text-sm text-white/45">
            If you believe this is an error, please contact support or navigate from the main menu.
          </p>
        </GlassCard>
      </div>
    </PublicPageShell>
  );
}
