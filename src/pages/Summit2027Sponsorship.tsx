import { useEffect, useLayoutEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import Navigation from '@/components/Navigation';
import { Sponsorship2027Page } from '@/components/summit2027/Sponsorship2027Page';
import { useTheme } from '@/contexts/ThemeContext';
import { ArrowLeft, ArrowUp } from 'lucide-react';

const PAGE_TITLE = 'SLxAI Summit Sponsorship Opportunities';
const PAGE_DESCRIPTION =
  'Sponsor SLxAI Summit and connect with leaders in sign language, AI, accessibility, research, and ethical technology innovation.';

export default function Summit2027Sponsorship() {
  const { theme, setTheme } = useTheme();
  const themeBeforePageRef = useRef(theme);

  // 1) data-sponsorship-page disables global `html.dark … { text-white }` rules in index.css
  // 2) Force light theme so ThemeProvider does not re-add `dark` from localStorage.
  useLayoutEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-sponsorship-page', 'true');
    root.classList.remove('dark');
    setTheme('light');
    return () => {
      root.removeAttribute('data-sponsorship-page');
      setTheme(themeBeforePageRef.current);
    };
  }, [setTheme]);

  useEffect(() => {
    const prevTitle = document.title;
    document.title = PAGE_TITLE;

    let metaDesc = document.querySelector('meta[name="description"]');
    const prevDesc = metaDesc?.getAttribute('content') ?? null;
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.setAttribute('name', 'description');
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute('content', PAGE_DESCRIPTION);

    return () => {
      document.title = prevTitle;
      if (prevDesc != null) metaDesc?.setAttribute('content', prevDesc);
      else if (metaDesc?.parentNode) metaDesc.remove();
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen !bg-white bg-white text-slate-900">
      <Navigation />
      <Button
        type="button"
        variant="default"
        size="icon"
        onClick={scrollToTop}
        className="fixed right-4 top-4 z-[100] h-11 w-11 rounded-full border-0 bg-electric-blue text-white shadow-lg hover:bg-electric-blue/90 focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2"
        aria-label="Back to top of page"
        title="Back to top"
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
          <Link to="/" className="flex items-center gap-2 text-slate-900" aria-label="SLxAI home">
            <img src="/slxai-footer-logo.png" alt="" className="h-8 w-auto" width={120} height={32} />
            <span className="text-sm font-semibold tracking-tight">SLxAI</span>
          </Link>
        </div>
      </header>

      <Sponsorship2027Page />
    </div>
  );
}
