import { Link, useLocation, useNavigate } from 'react-router-dom';
import React from 'react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from '@/components/ui/sidebar';
import type { LucideIcon } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Vote,
  MessageSquare,
  FileText,
  Video,
  Users,
  User,
  PanelLeft,
  Shield,
  Lock,
  Scale,
  Cookie,
  LogOut,
  Building2,
  Calendar,
  GraduationCap,
  Trophy,
  Menu,
  Moon,
  Sun,
  MessageCircle,
  Globe,
  Bell,
  Newspaper,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { logout, getCurrentUser, isAuthenticated, getUserRole } from '@/lib/auth';
import { canAccessAdmin } from '@/lib/roles';
import { useToast } from '@/hooks/use-toast';
import { useEffect, useState } from 'react';
import { OnboardingWizard } from '@/components/Onboarding';
import { useIsMobile, useIsLandscape } from '@/hooks/use-mobile';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage, SUPPORTED_LANGUAGES } from '@/contexts/LanguageContext';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface MembershipPortalLayoutProps {
  children: React.ReactNode;
}

// Base menu items structure (titles will be translated dynamically)
const baseMenuItemsConfig = [
  {
    titleKey: 'common.globalFeed',
    icon: Video,
    href: '/membership-portal',
  },
  {
    titleKey: 'common.voting',
    icon: Vote,
    href: '/membership-portal/voting',
  },
  {
    titleKey: 'common.files',
    icon: FileText,
    href: '/membership-portal/files',
  },
  {
    titleKey: 'common.memberDirectory',
    icon: Users,
    href: '/membership-portal/directory',
  },
  {
    titleKey: 'common.myProfile',
    icon: User,
    href: '/membership-portal/profile',
  },
  {
    titleKey: 'common.myOrganization',
    icon: Building2,
    href: '/membership-portal/organization',
  },
  {
    titleKey: 'common.feedback',
    icon: MessageCircle,
    href: '/membership-portal/feedback',
  },
  {
    titleKey: 'common.notifications',
    icon: Bell,
    href: '/membership-portal/notifications',
  },
];

type MenuItemConfig = {
  titleKey: string;
  icon: LucideIcon;
  href: string;
};

// Admin-only sidebar items (order shown to admins)
const adminMenuItemsConfig: MenuItemConfig[] = [
  {
    titleKey: 'common.admin',
    icon: Shield,
    href: '/membership-portal/admin',
  },
  {
    titleKey: 'common.newsletterAdmin',
    icon: Newspaper,
    href: '/membership-portal/newsletter',
  },
  {
    titleKey: 'common.academyAdmin',
    icon: GraduationCap,
    href: '/membership-portal/academy-admin',
  },
  {
    titleKey: 'common.summitAdmin',
    icon: Calendar,
    href: '/membership-portal/summit-admin',
  },
  {
    titleKey: 'common.summit2026',
    icon: Trophy,
    href: '/membership-portal/summit-2026',
  },
  {
    titleKey: 'common.discussions',
    icon: MessageSquare,
    href: '/membership-portal/discussions',
  },
];

function CollapseButton() {
  const { toggleSidebar, state } = useSidebar();
  const tooltipText = state === "collapsed" ? "Uncollapse" : "Collapse";
  
  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        size="sm"
        onClick={toggleSidebar}
        tooltip={tooltipText}
        className={cn(
          "transition-all duration-200 hover:bg-blue-100/50 dark:hover:bg-gray-800 h-9 md:h-8 text-xs md:text-sm lg:text-base pl-1.5 md:pl-2 pr-1 md:pr-1 w-full min-h-[36px] md:min-h-[32px] dark:text-white"
        )}
      >
        <PanelLeft className="h-3.5 w-3.5 md:h-4 md:w-4 lg:h-3.5 lg:w-3.5 dark:text-white" />
        <span className="dark:text-white">Collapse</span>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}

function MobileMenuTrigger() {
  const { toggleSidebar } = useSidebar();
  
  return (
    <button
      onClick={toggleSidebar}
      className="bg-transparent hover:bg-transparent border-0 shadow-none p-2 cursor-pointer flex items-center justify-center"
      aria-label="Toggle Sidebar"
    >
      <Menu className="h-6 w-6 text-gray-900" />
    </button>
  );
}

function DarkModeToggle() {
  const { theme, toggleTheme } = useTheme();
  const { state } = useSidebar();
  const { t } = useLanguage();
  const isCollapsed = state === "collapsed";
  
  if (isCollapsed) {
    // When collapsed, show only icon as a button
    return (
      <SidebarMenuItem>
        <SidebarMenuButton
          size="sm"
          onClick={toggleTheme}
                tooltip={t('common.darkMode')}
          className={cn(
            "transition-all duration-200 hover:bg-electric-blue/10 dark:hover:bg-gray-800 h-9 md:h-8 text-xs md:text-sm lg:text-base pl-1.5 md:pl-2 pr-1 md:pr-1 min-h-[36px] md:min-h-[32px] dark:text-white justify-center"
          )}
        >
          {theme === 'dark' ? (
            <Sun className="h-3.5 w-3.5 md:h-4 md:w-4 lg:h-3.5 lg:w-3.5 flex-shrink-0" />
          ) : (
            <Moon className="h-3.5 w-3.5 md:h-4 md:w-4 lg:h-3.5 lg:w-3.5 flex-shrink-0" />
          )}
        </SidebarMenuButton>
      </SidebarMenuItem>
    );
  }
  
  // When expanded, show icon, text, and switch (switch is outside the button)
  return (
    <SidebarMenuItem>
      <div className="flex items-center gap-1.5 md:gap-2 px-1.5 md:px-2 py-1.5 md:py-1 min-h-[36px] md:min-h-[32px] dark:text-white w-full group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:py-0">
        {theme === 'dark' ? (
          <Sun className="h-3.5 w-3.5 md:h-4 md:w-4 lg:h-3.5 lg:w-3.5 flex-shrink-0" />
        ) : (
          <Moon className="h-3.5 w-3.5 md:h-4 md:w-4 lg:h-3.5 lg:w-3.5 flex-shrink-0" />
        )}
        <span className="text-xs md:text-sm lg:text-base truncate flex-1">{t('common.darkMode')}</span>
        <Switch 
          checked={theme === 'dark'}
          onCheckedChange={toggleTheme}
          className="flex-shrink-0"
        />
      </div>
    </SidebarMenuItem>
  );
}

function LanguageSelector() {
  const { language, setLanguage, t } = useLanguage();
  const { state } = useSidebar();
  const isMobile = useIsMobile();

  if (state === 'collapsed' && !isMobile) {
    return (
      <SidebarMenuItem>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <SidebarMenuButton
                size="sm"
                tooltip={t('common.language')}
                className={cn(
                  "transition-all duration-200 hover:bg-electric-blue/10 dark:hover:bg-gray-800 h-9 md:h-8 text-xs md:text-sm lg:text-base pl-1.5 md:pl-2 pr-1 md:pr-1 min-h-[36px] md:min-h-[32px] dark:text-white justify-center"
                )}
              >
                <Globe className="h-3.5 w-3.5 md:h-4 md:w-4 lg:h-3.5 lg:w-3.5 flex-shrink-0" />
              </SidebarMenuButton>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>{t('common.language')}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </SidebarMenuItem>
    );
  }

  return (
    <SidebarMenuItem>
      <div className="flex items-center gap-1.5 md:gap-2 px-1.5 md:px-2 py-1.5 md:py-1 min-h-[36px] md:min-h-[32px] dark:text-white w-full group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:py-0">
        <Globe className="h-3.5 w-3.5 md:h-4 md:w-4 lg:h-3.5 lg:w-3.5 flex-shrink-0" />
        <span className="text-xs md:text-sm lg:text-base truncate flex-1">{t('common.language')}</span>
        <Select value={language} onValueChange={(value) => setLanguage(value as any)}>
          <SelectTrigger 
            className="h-7 md:h-6 w-[140px] md:w-[120px] text-xs md:text-xs border-gray-300 dark:border-[hsl(217,35%,25%)] bg-white dark:bg-[hsl(217,40%,18%)] text-gray-900 dark:text-white"
            onClick={(e) => e.stopPropagation()}
          >
            <SelectValue>
              <div className="flex items-center gap-1.5">
                <span>{SUPPORTED_LANGUAGES.find(l => l.code === language)?.flag}</span>
                <span className="truncate">{SUPPORTED_LANGUAGES.find(l => l.code === language)?.nativeName}</span>
              </div>
            </SelectValue>
          </SelectTrigger>
          <SelectContent className="max-h-[300px] overflow-y-auto dark:bg-[hsl(217,40%,18%)] dark:border-[hsl(217,35%,25%)] z-[110]">
            {SUPPORTED_LANGUAGES.map((lang) => (
              <SelectItem 
                key={lang.code} 
                value={lang.code}
                className="dark:text-white dark:hover:bg-gray-800"
              >
                <div className="flex items-center gap-2">
                  <span>{lang.flag}</span>
                  <span>{lang.nativeName}</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400 ml-auto">({lang.name})</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </SidebarMenuItem>
  );
}

function SidebarHeaderWithTooltip() {
  const { state: sidebarState, isMobile } = useSidebar();
  const { theme } = useTheme();
  
  return (
    <SidebarHeader className="!p-0 !bg-transparent" style={{ backgroundColor: 'transparent' }}>
      <div className="overflow-hidden border-t border-r border-b border-electric-blue/20 dark:border-white/20 py-0.5 md:py-1 sidebar-header-bg group-data-[collapsible=icon]:py-0 group-data-[collapsible=icon]:px-0">
        <TooltipProvider delayDuration={0}>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center justify-center gap-1 md:gap-2 px-0 md:px-0.5 group-data-[collapsible=icon]:px-0">
                {theme === 'dark' ? (
                  <span className="font-semibold text-sm md:text-lg lg:text-xl text-white group-data-[collapsible=icon]:hidden whitespace-nowrap">
                    SLxAI
                  </span>
                ) : (
                  <img 
                    src="/lovable-uploads/0941509f-be4a-49e7-b472-735a4942f89a.png" 
                    alt="SLxAI Logo" 
                    className="h-[0.7875rem] md:h-[1.0125rem] lg:h-[1.125rem] w-auto group-data-[collapsible=icon]:hidden -mt-[0.8px]"
                  />
                )}
                <span className="font-semibold text-sm md:text-lg lg:text-xl text-gray-900 dark:text-white group-data-[collapsible=icon]:hidden whitespace-nowrap">
                  Member Portal
                </span>
                <span className="font-semibold text-sm md:text-lg lg:text-xl text-gray-900 dark:text-white hidden group-data-[collapsible=icon]:block whitespace-nowrap">
                  MP
                </span>
              </div>
            </TooltipTrigger>
            <TooltipContent 
              side="right" 
              align="center"
              hidden={sidebarState !== "collapsed" || isMobile}
            >
              Member Portal
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </SidebarHeader>
  );
}

// Component to handle menu item clicks - must be inside SidebarProvider
const MenuItemLink = React.forwardRef<
  HTMLAnchorElement,
  { href: string; children: React.ReactNode; isActive: boolean; className?: string }
>(({ href, children, isActive, className }, ref) => {
  const { setOpen, setOpenMobile } = useSidebar();
  const isMobile = useIsMobile();
  const isLandscape = useIsLandscape();
  const [isTablet, setIsTablet] = useState(false);

  useEffect(() => {
    const checkTablet = () => {
      setIsTablet(window.innerWidth >= 768 && window.innerWidth < 1024);
    };
    checkTablet();
    window.addEventListener('resize', checkTablet);
    return () => window.removeEventListener('resize', checkTablet);
  }, []);

  return (
    <Link 
      ref={ref}
      to={href} 
      className={className}
      onClick={() => {
        // Close sidebar after navigation ONLY in mobile landscape mode
        if (isMobile && isLandscape) {
          setOpenMobile(false);
        }
        // Don't collapse in portrait mobile or desktop
      }}
    >
      {children}
    </Link>
  );
});
MenuItemLink.displayName = 'MenuItemLink';

type ResolvedMenuItem = MenuItemConfig & { title: string };

function isMenuItemActive(href: string, pathname: string): boolean {
  if (href === '/membership-portal') {
    return pathname === '/membership-portal' || pathname === '/membership-portal/feed';
  }
  return pathname === href;
}

function PortalNavMenu({
  items,
  pathname,
}: {
  items: ResolvedMenuItem[];
  pathname: string;
}) {
  return (
    <>
      {items.map((item) => {
        const Icon = item.icon;
        const isActive = isMenuItemActive(item.href, pathname);
        return (
          <SidebarMenuItem key={item.href}>
            <SidebarMenuButton
              asChild
              isActive={isActive}
              tooltip={item.title}
              size="sm"
              className={cn(
                'transition-all duration-200 hover:bg-electric-blue/10 h-9 md:h-8 text-xs md:text-sm lg:text-base pl-1.5 md:pl-2 pr-1 md:pr-1 min-h-[36px] md:min-h-[32px]',
                isActive ? 'font-semibold' : '',
              )}
            >
              <MenuItemLink
                href={item.href}
                isActive={isActive}
                className="flex items-center gap-1.5 md:gap-2 w-full"
              >
                <Icon className="h-3.5 w-3.5 md:h-4 md:w-4 lg:h-3.5 lg:w-3.5 flex-shrink-0" />
                <span className="text-xs md:text-sm lg:text-base truncate">{item.title}</span>
              </MenuItemLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
        );
      })}
    </>
  );
}

export default function MembershipPortalLayout({ children }: MembershipPortalLayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useLanguage();
  const [userIsAdmin, setUserIsAdmin] = useState(false);
  const isMobile = useIsMobile();
  const [isTablet, setIsTablet] = useState(false);

  // Check if screen is tablet size (768px - 1024px)
  useEffect(() => {
    const checkTablet = () => {
      setIsTablet(window.innerWidth >= 768 && window.innerWidth < 1024);
    };
    checkTablet();
    window.addEventListener('resize', checkTablet);
    return () => window.removeEventListener('resize', checkTablet);
  }, []);

  const memberMenuItems: ResolvedMenuItem[] = baseMenuItemsConfig.map((item) => ({
    ...item,
    title: t(item.titleKey),
  }));

  const adminMenuItems: ResolvedMenuItem[] = adminMenuItemsConfig.map((item) => ({
    ...item,
    title: t(item.titleKey),
  }));

  // Check admin status
  useEffect(() => {
    const checkAccess = async () => {
      await isAuthenticated();

      const user = getCurrentUser();
      if (!user?.email) return;

      const role = getUserRole();
      setUserIsAdmin(canAccessAdmin(role));
    };

    checkAccess();
    const interval = setInterval(checkAccess, 2000);
    return () => clearInterval(interval);
  }, [location.pathname]);

  const handleLogout = async () => {
    await logout();
    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
    });
    navigate('/login');
  };

  return (
    <SidebarProvider defaultOpen={!isMobile && !isTablet}>
      <OnboardingWizard />
      <style>{`
        [data-sidebar="menu-button"],
        [data-sidebar="menu-button"] *,
        [data-sidebar="menu-button"] span,
        [data-sidebar="menu-button"] svg {
          color: #000000 !important;
        }
        [data-sidebar="menu-button"]:hover,
        [data-sidebar="menu-button"]:hover *,
        [data-sidebar="menu-button"]:hover span,
        [data-sidebar="menu-button"]:hover svg {
          color: #000000 !important;
        }
        [data-sidebar="menu-button"][data-active="true"],
        [data-sidebar="menu-button"][data-active="true"] *,
        [data-sidebar="menu-button"][data-active="true"] span,
        [data-sidebar="menu-button"][data-active="true"] svg {
          color: #000000 !important;
        }
        [data-sidebar="menu-button"][data-active="true"] {
          background: rgba(255, 255, 255, 0.7) !important;
          backdrop-filter: blur(24px) saturate(180%) !important;
          -webkit-backdrop-filter: blur(24px) saturate(180%) !important;
          border: 1px solid rgba(0, 128, 255, 0.2) !important;
          box-shadow: 0 8px 32px 0 rgba(0, 128, 255, 0.15) !important;
        }
        .dark [data-sidebar="menu-button"],
        .dark [data-sidebar="menu-button"] *,
        .dark [data-sidebar="menu-button"] span,
        .dark [data-sidebar="menu-button"] svg {
          color: #ffffff !important;
        }
        .dark [data-sidebar="menu-button"]:hover,
        .dark [data-sidebar="menu-button"]:hover *,
        .dark [data-sidebar="menu-button"]:hover span,
        .dark [data-sidebar="menu-button"]:hover svg {
          color: #ffffff !important;
        }
        .dark [data-sidebar="menu-button"][data-active="true"],
        .dark [data-sidebar="menu-button"][data-active="true"] *,
        .dark [data-sidebar="menu-button"][data-active="true"] span,
        .dark [data-sidebar="menu-button"][data-active="true"] svg {
          color: #ffffff !important;
        }
        [data-sidebar="header"] {
          background-color: transparent !important;
          padding: 0 !important;
          margin: 0 !important;
        }
        [data-sidebar="sidebar"] > [data-sidebar="header"] {
          background-color: transparent !important;
          padding: 0 !important;
          margin: 0 !important;
        }
        [data-sidebar="sidebar"] > [data-sidebar="header"] > div {
          width: 100% !important;
          margin-left: 0 !important;
          margin-right: 0 !important;
          margin-top: 0 !important;
        }
        [data-sidebar="sidebar"] {
          background-color: #cbd5e1 !important;
        }
      `}</style>
      <div className="flex min-h-screen w-full bg-slate-300 dark:bg-black relative overflow-hidden">
        <Sidebar side="left" variant="inset" collapsible="icon">
          <SidebarHeaderWithTooltip />
          <SidebarContent className="bg-slate-300 dark:bg-black py-0.5 md:py-2">
            <SidebarGroup className="pl-0 pr-0">
              <SidebarGroupLabel className="px-2 text-[10px] font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-400">
                {t('common.menuSectionMembers')}
              </SidebarGroupLabel>
              <SidebarGroupContent className="pl-0 pr-0">
                <SidebarMenu className="gap-0">
                  <PortalNavMenu items={memberMenuItems} pathname={location.pathname} />
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
            {userIsAdmin && (
              <SidebarGroup className="mt-2 border-t border-electric-blue/25 pt-2 pl-0 pr-0">
                <SidebarGroupLabel className="flex items-center gap-1.5 px-2 text-[10px] font-semibold uppercase tracking-wider text-electric-blue dark:text-electric-blue">
                  <Shield className="h-3 w-3 flex-shrink-0" />
                  {t('common.menuSectionAdmin')}
                </SidebarGroupLabel>
                <SidebarGroupContent className="pl-0 pr-0">
                  <SidebarMenu className="gap-0">
                    <PortalNavMenu items={adminMenuItems} pathname={location.pathname} />
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            )}
          </SidebarContent>
          <SidebarFooter className="bg-slate-300 dark:bg-black border-t border-electric-blue/20 dark:border-white/20 py-0.5 md:py-2">
            <SidebarGroup className="pl-0 pr-0">
              <SidebarGroupContent className="pl-0 pr-0">
                <SidebarMenu className="gap-0">
                  <DarkModeToggle />
                  <LanguageSelector />
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      size="sm"
                      onClick={handleLogout}
                      tooltip={t('common.logOut')}
                      className={cn(
                        "transition-all duration-200 hover:bg-red-50 dark:hover:bg-gray-800 h-9 md:h-8 text-xs md:text-sm lg:text-base pl-1.5 md:pl-2 pr-1 md:pr-1 text-red-600 hover:text-red-700 dark:text-white dark:hover:text-white min-h-[36px] md:min-h-[32px]"
                      )}
                    >
                      <LogOut className="h-3.5 w-3.5 md:h-4 md:w-4 lg:h-3.5 lg:w-3.5 flex-shrink-0" />
                      <span className="text-xs md:text-sm lg:text-base truncate">{t('common.logOut')}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      asChild
                      size="sm"
                      tooltip={t('common.privacyPolicy')}
                      className={cn(
                        "transition-all duration-200 hover:bg-electric-blue/10 h-9 md:h-8 text-xs md:text-sm lg:text-base pl-1.5 md:pl-2 pr-1 md:pr-1 min-h-[36px] md:min-h-[32px]",
                        location.pathname === '/privacy'
                          ? "font-semibold" 
                          : ""
                      )}
                    >
                      <MenuItemLink 
                        href="/privacy"
                        isActive={location.pathname === '/privacy'}
                        className="flex items-center gap-1.5 md:gap-2 w-full"
                      >
                        <Lock className="h-3.5 w-3.5 md:h-4 md:w-4 lg:h-3.5 lg:w-3.5 flex-shrink-0" />
                        <span className="text-xs md:text-sm lg:text-base truncate">{t('common.privacyPolicy')}</span>
                      </MenuItemLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      asChild
                      size="sm"
                      tooltip={t('common.cookiePolicy')}
                      className={cn(
                        "transition-all duration-200 hover:bg-electric-blue/10 h-9 md:h-8 text-xs md:text-sm lg:text-base pl-1.5 md:pl-2 pr-1 md:pr-1 min-h-[36px] md:min-h-[32px]",
                        location.pathname === '/cookies'
                          ? "font-semibold" 
                          : ""
                      )}
                    >
                      <MenuItemLink 
                        href="/cookies"
                        isActive={location.pathname === '/cookies'}
                        className="flex items-center gap-1.5 md:gap-2 w-full"
                      >
                        <Cookie className="h-3.5 w-3.5 md:h-4 md:w-4 lg:h-3.5 lg:w-3.5 flex-shrink-0" />
                        <span className="text-xs md:text-sm lg:text-base truncate">{t('common.cookiePolicy')}</span>
                      </MenuItemLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      asChild
                      size="sm"
                      tooltip={t('common.termsOfService')}
                      className={cn(
                        "transition-all duration-200 hover:bg-electric-blue/10 h-9 md:h-8 text-xs md:text-sm lg:text-base pl-1.5 md:pl-2 pr-1 md:pr-1 min-h-[36px] md:min-h-[32px]",
                        location.pathname === '/membership-portal/terms' 
                          ? "font-semibold" 
                          : ""
                      )}
                    >
                      <MenuItemLink 
                        href="/membership-portal/terms"
                        isActive={location.pathname === '/membership-portal/terms'}
                        className="flex items-center gap-1.5 md:gap-2 w-full"
                      >
                        <Scale className="h-3.5 w-3.5 md:h-4 md:w-4 lg:h-3.5 lg:w-3.5 flex-shrink-0" />
                        <span className="text-xs md:text-sm lg:text-base">Terms of Service</span>
                      </MenuItemLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <CollapseButton />
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarFooter>
        </Sidebar>
        <main className="flex-1 relative z-10 dark:bg-black">
          <div className="px-0 md:px-6 pb-6 pt-0 md:pt-2 max-w-[1008px] relative dark:bg-black">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}

