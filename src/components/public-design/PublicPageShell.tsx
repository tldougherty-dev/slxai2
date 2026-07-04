import { ReactNode, useLayoutEffect } from 'react';
import { cn } from '@/lib/utils';
import { useTheme } from '@/contexts/ThemeContext';
import { AuroraBackground } from './AuroraBackground';
import { PublicNavbar } from './PublicNavbar';
import { PublicFooter } from './PublicFooter';

type PublicPageShellProps = {
  children: ReactNode;
  className?: string;
};

export function PublicPageShell({ children, className }: PublicPageShellProps) {
  const { theme, toggleTheme } = useTheme();

  useLayoutEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('dark', theme === 'dark');
    if (theme === 'light') {
      root.setAttribute('data-public-theme', 'light');
    } else {
      root.removeAttribute('data-public-theme');
    }
    return () => root.removeAttribute('data-public-theme');
  }, [theme]);

  return (
    <div
      className={cn(
        'public-site relative min-h-screen overflow-x-hidden',
        theme === 'light' && 'light-public',
        className,
      )}
    >
      <AuroraBackground />
      <div className="pointer-events-none absolute inset-0 opacity-[0.03]" aria-hidden>
        <div className="absolute left-[10%] top-[20%] h-32 w-32 rotate-12 border border-white" />
        <div className="absolute right-[15%] top-[40%] h-24 w-24 rounded-full border border-electric-blue" />
        <div className="absolute bottom-[25%] left-[20%] h-20 w-20 rotate-45 border border-white" />
      </div>

      <PublicNavbar theme={theme} onToggleTheme={toggleTheme} />

      <main id="main-content" className="relative z-10 pt-20" role="main">
        {children}
      </main>

      <PublicFooter />
    </div>
  );
}
