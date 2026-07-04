import { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PublicPageShell } from '@/components/public-design/PublicPageShell';
import { PublicSection } from '@/components/public-design/PublicSection';

type LegalPublicLayoutProps = {
  children: ReactNode;
};

export default function LegalPublicLayout({ children }: LegalPublicLayoutProps) {
  return (
    <PublicPageShell>
      <PublicSection className="py-10">
        <Button variant="ghost" asChild className="mb-6 -ml-2 text-white/80 hover:bg-white/10 hover:text-white">
          <Link to="/" className="inline-flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" aria-hidden />
            Back to home
          </Link>
        </Button>
        <div className="glass-panel-strong w-full rounded-3xl p-6 text-white/85 prose prose-invert max-w-none sm:p-10">
          {children}
        </div>
      </PublicSection>
    </PublicPageShell>
  );
}
