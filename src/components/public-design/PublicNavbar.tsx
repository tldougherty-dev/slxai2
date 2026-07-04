import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@/components/ui/navigation-menu';
import { Globe, Menu, Moon, Sun, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useLanguage, SUPPORTED_LANGUAGES } from '@/contexts/LanguageContext';
import { PUBLIC_CONTENT_WIDTH, PUBLIC_SECTION_PADDING } from '@/components/public-design/publicLayout';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const MEGA_MENU = [
  {
    label: 'Programs',
    items: [
      { title: 'SLxAI Academy', href: '/academy', desc: 'Live Zoom workshops in sign language' },
      { title: 'Become a Presenter', href: '/academy/submit', desc: 'Propose a workshop' },
    ],
  },
  {
    label: 'Events',
    items: [
      { title: 'Summit 2026 Archive', href: '/2026', desc: 'Past inaugural summit program' },
      // Summit 2027 Miami sponsorship: page stays at /summit2027; nav link removed pending committee plans.
    ],
  },
  {
    label: 'Community',
    items: [
      { title: 'Subscribe to SLxAI Newsletter', href: '/newsletter', desc: 'News, events, and community updates from SLxAI' },
      { title: 'Member Portal', href: '/login', desc: 'Log in to the global feed' },
    ],
  },
  {
    label: 'Resources',
    items: [
      { title: 'Bylaws Draft', href: '/bylaws', desc: 'Review and provide feedback' },
      { title: 'Privacy Policy', href: '/privacy', desc: 'How we protect your data' },
    ],
  },
];

type PublicNavbarProps = {
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
};

export function PublicNavbar({ theme, onToggleTheme }: PublicNavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { language, setLanguage } = useLanguage();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={cn(
        'glass-nav fixed top-0 z-50 w-full overflow-visible transition-all duration-300',
        scrolled && 'glass-nav-scrolled',
      )}
    >
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60] focus:rounded-lg focus:bg-electric-blue focus:px-4 focus:py-2 focus:text-white"
      >
        Skip to main content
      </a>

      <div className={cn(PUBLIC_CONTENT_WIDTH, PUBLIC_SECTION_PADDING, 'flex items-center justify-between gap-4 py-3')}>
        <Link to="/" className="flex shrink-0 items-center gap-2" aria-label="SLxAI home">
          <img src="/slxai-footer-logo.png" alt="" className="h-8 w-auto brightness-0 invert public-logo-dark" />
          <img src="/slxai-footer-logo.png" alt="" className="hidden h-8 w-auto public-logo-light" />
          <span className="sr-only">SLxAI</span>
        </Link>

        <NavigationMenu className="hidden lg:flex">
          <NavigationMenuList>
            {MEGA_MENU.map((section, sectionIndex) => (
              <NavigationMenuItem key={section.label} className="relative">
                <NavigationMenuTrigger
                  className={cn(
                    'public-nav-trigger bg-transparent text-sm font-medium hover:bg-white/10 data-[state=open]:bg-white/10',
                    theme === 'light'
                      ? 'text-slate-800 hover:text-slate-900'
                      : 'text-white/90 hover:text-white',
                  )}
                >
                  {section.label}
                </NavigationMenuTrigger>
                <NavigationMenuContent
                  className={sectionIndex === MEGA_MENU.length - 1 ? 'left-auto right-0' : undefined}
                >
                  <div
                    className={cn(
                      'overflow-hidden rounded-xl border shadow-xl backdrop-blur-xl',
                      theme === 'light'
                        ? 'border-slate-200/80 bg-white/95'
                        : 'border-white/10 bg-[rgba(8,15,30,0.92)]',
                    )}
                  >
                    <ul className="grid w-[320px] gap-2 p-4 md:w-[360px]">
                      {section.items.map((item) => (
                        <li key={item.href}>
                          <NavigationMenuLink asChild>
                            <Link
                              to={item.href}
                              className={cn(
                                'block select-none rounded-xl border p-4 leading-none no-underline outline-none transition-colors focus-visible:ring-2 focus-visible:ring-electric-blue',
                                theme === 'light'
                                  ? 'border-slate-200/80 bg-white/90 hover:bg-slate-50'
                                  : 'border-white/10 bg-white/5 hover:bg-white/10',
                              )}
                            >
                              <div
                                className={cn(
                                  'text-sm font-semibold',
                                  theme === 'light' ? 'text-slate-900' : 'text-white',
                                )}
                              >
                                {item.title}
                              </div>
                              <p
                                className={cn(
                                  'mt-1.5 text-xs leading-relaxed',
                                  theme === 'light' ? 'text-slate-600' : 'text-white/65',
                                )}
                              >
                                {item.desc}
                              </p>
                            </Link>
                          </NavigationMenuLink>
                        </li>
                      ))}
                    </ul>
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>
            ))}
          </NavigationMenuList>
        </NavigationMenu>

        <div className="flex items-center gap-2">
          <div
            className={cn(
              'hidden items-center gap-1.5 rounded-xl border px-2 py-1 sm:flex',
              theme === 'light' ? 'border-slate-200/80 bg-white/60' : 'border-white/15 bg-white/5',
            )}
          >
            <Globe
              className={cn('h-3.5 w-3.5', theme === 'light' ? 'text-slate-600' : 'text-white/70')}
              aria-hidden
            />
            <Select value={language} onValueChange={(v) => setLanguage(v as typeof language)}>
              <SelectTrigger
                className={cn(
                  'h-7 w-[100px] border-0 bg-transparent text-xs shadow-none focus:ring-0',
                  theme === 'light' ? 'text-slate-800' : 'text-white',
                )}
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SUPPORTED_LANGUAGES.map((lang) => (
                  <SelectItem key={lang.code} value={lang.code}>
                    {lang.flag} {lang.nativeName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onToggleTheme}
            className={cn(
              'hidden sm:inline-flex',
              theme === 'light'
                ? 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                : 'text-white/80 hover:bg-white/10 hover:text-white',
            )}
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>

          <Button
            asChild
            variant="outline"
            className={cn(
              'hidden sm:inline-flex',
              theme === 'light'
                ? 'border-slate-300 bg-white/60 text-slate-800 hover:bg-slate-100 hover:text-slate-900'
                : 'border-white/25 bg-white/5 text-white hover:bg-white/10 hover:text-white',
            )}
          >
            <Link to="/login">Log in</Link>
          </Button>

          <Button asChild className="btn-glow hidden bg-electric-blue text-white hover:bg-electric-blue/90 sm:inline-flex">
            <Link to="/interest">Join community</Link>
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            className={cn('lg:hidden', theme === 'light' ? 'text-slate-800' : 'text-white')}
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-expanded={mobileOpen}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {mobileOpen && (
        <nav
          className={cn(
            'border-t py-4 lg:hidden',
            PUBLIC_SECTION_PADDING,
            theme === 'light' ? 'border-slate-200/80' : 'border-white/10',
          )}
          aria-label="Mobile"
        >
          <div className="space-y-4">
            {MEGA_MENU.map((section) => (
              <div key={section.label}>
                <p
                  className={cn(
                    'mb-2 text-xs font-semibold uppercase tracking-wider',
                    theme === 'light' ? 'text-slate-500' : 'text-white/50',
                  )}
                >
                  {section.label}
                </p>
                <ul className="space-y-1">
                  {section.items.map((item) => (
                    <li key={item.href}>
                      <Link
                        to={item.href}
                        className={cn(
                          'block rounded-lg px-3 py-2 text-sm',
                          theme === 'light'
                            ? 'text-slate-800 hover:bg-slate-100'
                            : 'text-white/90 hover:bg-white/10',
                        )}
                        onClick={() => setMobileOpen(false)}
                      >
                        {item.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
            <Button asChild className="btn-glow w-full bg-electric-blue">
              <Link to="/login" onClick={() => setMobileOpen(false)}>
                Log in
              </Link>
            </Button>
          </div>
        </nav>
      )}
    </header>
  );
}
