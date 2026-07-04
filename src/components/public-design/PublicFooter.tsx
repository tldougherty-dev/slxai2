import { Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { PUBLIC_CONTENT_WIDTH, PUBLIC_SECTION_PADDING } from '@/components/public-design/publicLayout';
import { cn } from '@/lib/utils';

export function PublicFooter() {
  const { t } = useLanguage();

  return (
    <footer className={cn('relative border-t border-white/10 py-5 sm:py-6', PUBLIC_SECTION_PADDING)} role="contentinfo">
      <div className={PUBLIC_CONTENT_WIDTH}>
        <div className="flex flex-col items-center justify-between gap-3 sm:flex-row sm:gap-4">
          <div className="text-center sm:text-left">
            <img src="/slxai-footer-logo.png" alt="SLxAI" className="mx-auto h-7 w-auto sm:mx-0 brightness-0 invert public-logo-dark" />
            <p className="mt-1.5 max-w-sm text-sm text-white/55">
              The global community advancing Sign Language × AI through ethical collaboration.
            </p>
          </div>
          <nav className="flex flex-wrap justify-center gap-x-5 gap-y-1 text-sm" aria-label="Footer">
            <Link to="/privacy" className="text-white/70 transition-colors hover:text-electric-blue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric-blue rounded">
              {t('common.privacyPolicy')}
            </Link>
            <Link to="/cookies" className="text-white/70 transition-colors hover:text-electric-blue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric-blue rounded">
              {t('common.cookiePolicy')}
            </Link>
            <Link to="/interest" className="text-white/70 transition-colors hover:text-electric-blue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric-blue rounded">
              Join community
            </Link>
          </nav>
        </div>
        <p className="mt-3 text-center text-xs text-white/40">
          © {new Date().getFullYear()} SLxAI. Accessibility is a core design principle.
        </p>
        <div id="metricool-footer-hidden" className="hidden" aria-hidden="true" />
      </div>
    </footer>
  );
}
