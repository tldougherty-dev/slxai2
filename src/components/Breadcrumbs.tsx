import { useLocation, Link } from 'react-router-dom';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { ChevronRight, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

const routeLabels: Record<string, string> = {
  '/membership-portal': 'Global Feed',
  '/membership-portal/voting': 'Voting',
  '/membership-portal/discussions': 'Discussions',
  '/membership-portal/files': 'Files',
  '/membership-portal/directory': 'Member Directory',
  '/membership-portal/my-profile': 'My Profile',
  '/membership-portal/my-organization': 'My Organization',
  '/membership-portal/admin': 'Admin',
  '/membership-portal/summit-planning': 'Summit Planning',
  '/membership-portal/summit-2026': 'Summit 2026',
  '/membership-portal/resources': 'Resources',
};

export function Breadcrumbs() {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x);

  // Don't show breadcrumbs on the main feed page
  if (location.pathname === '/membership-portal' || pathnames.length <= 1) {
    return null;
  }

  const breadcrumbs: BreadcrumbItem[] = [
    { label: 'Home', href: '/membership-portal' },
  ];

  let currentPath = '';
  pathnames.forEach((path, index) => {
    currentPath += `/${path}`;
    const isLast = index === pathnames.length - 1;
    
    // Skip if it's just "membership-portal"
    if (path === 'membership-portal') return;
    
    const label = routeLabels[currentPath] || path
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
    
    breadcrumbs.push({
      label,
      href: isLast ? undefined : currentPath,
    });
  });

  return (
    <Breadcrumb className="mb-4">
      <BreadcrumbList>
        {breadcrumbs.map((crumb, index) => (
          <div key={crumb.label} className="flex items-center">
            {index > 0 && <BreadcrumbSeparator><ChevronRight className="h-4 w-4" /></BreadcrumbSeparator>}
            <BreadcrumbItem>
              {crumb.href ? (
                <BreadcrumbLink asChild>
                  <Link to={crumb.href} className="hover:text-electric-blue transition-colors">
                    {index === 0 && <Home className="h-3 w-3 inline mr-1" />}
                    {crumb.label}
                  </Link>
                </BreadcrumbLink>
              ) : (
                <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
              )}
            </BreadcrumbItem>
          </div>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
}

export function BackButton({ to, label }: { to: string; label?: string }) {
  const location = useLocation();
  
  // Don't show if we're already at the target
  if (location.pathname === to) return null;

  return (
    <Button
      variant="outline"
      size="sm"
      asChild
      className="mb-4 border-gray-300 text-gray-700 hover:bg-gray-50 bg-white"
    >
      <Link to={to}>
        <ChevronRight className="h-4 w-4 mr-2 rotate-180" />
        {label || 'Back'}
      </Link>
    </Button>
  );
}

