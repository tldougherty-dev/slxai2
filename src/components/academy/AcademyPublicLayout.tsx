import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import Navigation from '@/components/Navigation';
import { ArrowLeft, ArrowUp } from 'lucide-react';
import { useEffect, useLayoutEffect, useRef } from 'react';
import { useTheme } from '@/contexts/ThemeContext';

type AcademyPublicLayoutProps = {
  children: React.ReactNode;
  title?: string;
};

export default function AcademyPublicLayout({ children, title }: AcademyPublicLayoutProps) {
  const { theme, setTheme } = useTheme();
  const themeBeforePageRef = useRef(theme);

  useLayoutEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-academy-page', 'true');
    root.classList.remove('dark');
    setTheme('light');
    return () => {
      root.removeAttribute('data-academy-page');
      setTheme(themeBeforePageRef.current);
    };
  }, [setTheme]);

  useEffect(() => {
    if (!title) return;
    const prevTitle = document.title;
    document.title = title;
    return () => {
      document.title = prevTitle;
    };
  }, [title]);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <Navigation />
      <Button
        type="button"
        variant="default"
        size="icon"
        onClick={scrollToTop}
        className="fixed bottom-4 right-4 z-[100] h-11 w-11 rounded-full border-0 bg-electric-blue text-white shadow-lg hover:bg-electric-blue/90"
        aria-label="Back to top"
      >
        <ArrowUp className="h-5 w-5" aria-hidden />
      </Button>

      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
          <Button variant="ghost" asChild className="-ml-2 shrink-0 text-slate-700 hover:text-slate-900">
            <Link to="/" className="inline-flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" aria-hidden />
              <span className="hidden sm:inline">Back to home</span>
              <span className="sm:hidden">Home</span>
            </Link>
          </Button>
          <Link to="/academy" className="flex shrink-0 items-center text-slate-900" aria-label="SLxAI Academy home">
            <img src="/slxai-footer-logo.png" alt="SLxAI" className="h-8 w-auto" width={120} height={32} />
          </Link>
          <div className="w-[88px] shrink-0 sm:w-[120px]" aria-hidden />
        </div>
      </header>

      <main id="main-content">{children}</main>
    </div>
  );
}
