import { Card, CardContent } from '@/components/ui/card';
import { ReactNode } from 'react';
import { useSidebar } from '@/components/ui/sidebar';
import { Menu } from 'lucide-react';
import { useIsMobile, useIsLandscape } from '@/hooks/use-mobile';

interface PageTitleProps {
  title: string;
  leftContent?: ReactNode; // Content on the left side (e.g., buttons)
  rightContent?: ReactNode; // Content on the right side (e.g., buttons)
  className?: string;
  titleClassName?: string;
  fullWidthLandscape?: boolean; // Make title full width in landscape mobile mode
}

export function PageTitle({ title, leftContent, rightContent, className = '', titleClassName = '', fullWidthLandscape = false }: PageTitleProps) {
  const { toggleSidebar } = useSidebar();
  const isMobile = useIsMobile();
  const isLandscape = useIsLandscape();
  
  // In landscape mobile, use relative positioning to save vertical space
  const isPortraitMobile = isMobile && !isLandscape;
  
  const menuButton = isMobile ? (
    <button
      onClick={toggleSidebar}
      className="bg-transparent hover:bg-transparent border-0 shadow-none p-2 cursor-pointer flex items-center justify-center"
      aria-label="Toggle Sidebar"
    >
      <Menu className="h-6 w-6 text-gray-900 dark:text-white" />
    </button>
  ) : null;

  return (
    <>
      {/* Fixed title box on portrait mobile only, relative on landscape mobile and desktop */}
      <div className={`w-full ${isPortraitMobile ? 'fixed top-0 left-0 right-0 z-40' : 'relative'} md:relative md:z-auto md:w-full bg-slate-300 md:bg-transparent pt-0 md:pt-0 px-0 md:px-0 ${isLandscape ? 'mb-0 pb-0' : ''} ${className}`} style={isLandscape ? { marginBottom: 0, paddingBottom: 0, marginTop: 0, paddingTop: 0, zIndex: 50, position: 'relative' } : {}}>
        <Card className="glass-card rounded-none md:rounded-lg">
          <CardContent className={`${isLandscape ? 'pt-2 pb-2' : 'pt-1 pb-1'} md:pt-4 md:pb-4`}>
            {leftContent || rightContent || menuButton ? (
              <div className="flex items-center gap-1 md:gap-2 lg:gap-4 relative">
                <div className="flex gap-1 md:gap-2 items-center flex-shrink-0 -ml-[5px]">
                  {menuButton}
                  {leftContent}
                </div>
                <h1 className={`${isLandscape ? 'text-xl' : 'text-2xl'} md:text-4xl font-bold text-gray-900 dark:text-white absolute left-1/2 transform -translate-x-1/2 leading-tight px-1 md:px-2 ${isLandscape ? '' : 'whitespace-nowrap'} ${titleClassName}`}>{title}</h1>
                <div className="flex gap-1 md:gap-2 items-center flex-shrink-0 justify-end -mt-[0.4px] md:-mr-[11px] flex-1">
                  {rightContent}
                </div>
              </div>
            ) : (
              <h1 className={`${isLandscape ? 'text-xl' : 'text-2xl'} md:text-4xl font-bold text-gray-900 dark:text-white text-center ${titleClassName}`}>{title}</h1>
            )}
          </CardContent>
        </Card>
      </div>
      {/* Spacer for fixed title on portrait mobile only */}
      {isPortraitMobile && <div className="h-[44px] -mb-0"></div>}
    </>
  );
}

