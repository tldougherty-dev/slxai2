import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { usePrefersReducedMotion } from '@/hooks/use-prefers-reduced-motion';
import { ReactNode } from 'react';

type ScrollRevealProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
};

export function ScrollReveal({ children, className, delay = 0 }: ScrollRevealProps) {
  const reduced = usePrefersReducedMotion();

  if (reduced) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

type GlassCardProps = {
  children: ReactNode;
  className?: string;
  strong?: boolean;
  hover?: boolean;
  as?: 'div' | 'article' | 'section';
};

export function GlassCard({ children, className, strong, hover = true, as: Tag = 'div' }: GlassCardProps) {
  return (
    <Tag
      className={cn(
        strong ? 'glass-panel-strong' : 'glass-panel',
        hover && 'card-lift',
        'p-6 sm:p-8',
        className,
      )}
    >
      {children}
    </Tag>
  );
}
