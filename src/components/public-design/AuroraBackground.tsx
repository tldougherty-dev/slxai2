import { cn } from '@/lib/utils';
import { usePrefersReducedMotion } from '@/hooks/use-prefers-reduced-motion';

type AuroraBackgroundProps = {
  className?: string;
};

export function AuroraBackground({ className }: AuroraBackgroundProps) {
  const reduced = usePrefersReducedMotion();

  return (
    <div className={cn('aurora-bg', className)} aria-hidden>
      <div
        className={cn('aurora-blob -left-1/4 top-0 h-[480px] w-[480px] bg-electric-blue/40', !reduced && '')}
        style={{ animationDelay: '0s' }}
      />
      <div
        className="aurora-blob right-0 top-1/4 h-[400px] w-[400px] bg-indigo-500/30"
        style={{ animationDelay: '-6s' }}
      />
      <div
        className="aurora-blob bottom-0 left-1/3 h-[360px] w-[500px] bg-cyan-400/20"
        style={{ animationDelay: '-12s' }}
      />
      <div className="public-aurora-vignette absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(222_47%_8%/0.3),transparent_60%)]" />
    </div>
  );
}
