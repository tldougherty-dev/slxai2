import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { PUBLIC_CONTENT_WIDTH, PUBLIC_SECTION_PADDING } from './publicLayout';

type PublicSectionProps = {
  children: ReactNode;
  className?: string;
  contentClassName?: string;
  id?: string;
  'aria-labelledby'?: string;
  'aria-label'?: string;
};

export function PublicSection({
  children,
  className,
  contentClassName,
  id,
  'aria-labelledby': ariaLabelledby,
  'aria-label': ariaLabel,
}: PublicSectionProps) {
  return (
    <section
      id={id}
      className={cn(PUBLIC_SECTION_PADDING, className)}
      aria-labelledby={ariaLabelledby}
      aria-label={ariaLabel}
    >
      <div className={cn(PUBLIC_CONTENT_WIDTH, contentClassName)}>{children}</div>
    </section>
  );
}
