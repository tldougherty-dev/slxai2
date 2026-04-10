import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import Navigation from '@/components/Navigation';
import { ArrowLeft } from 'lucide-react';

type LegalPublicLayoutProps = {
  children: React.ReactNode;
};

/**
 * Public legal pages (privacy, cookies): skip link, back to home, max-width content.
 */
export default function LegalPublicLayout({ children }: LegalPublicLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950" id="main-content" role="main">
      <Navigation />
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <Button variant="ghost" asChild className="mb-6 -ml-2">
          <Link to="/" className="text-electric-blue">
            <ArrowLeft className="mr-2 h-4 w-4" aria-hidden />
            Back to home
          </Link>
        </Button>
        {children}
      </div>
    </div>
  );
}
