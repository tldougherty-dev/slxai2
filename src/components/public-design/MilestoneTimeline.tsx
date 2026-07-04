import { GlassCard } from './GlassCard';
import { ScrollReveal } from './GlassCard';

const MILESTONES = [
  {
    year: '2024',
    title: 'Cooperative founded',
    desc: 'Industry leaders and deaf advocates unite to shape ethical sign language AI standards.',
  },
  {
    year: '2025',
    title: 'Global interest grows',
    desc: 'Organizations across 20+ countries express founding membership interest.',
  },
  {
    year: '2026',
    title: 'Inaugural Summit',
    desc: 'Boston hosts the first SLxAI Summit with workshops, panels, and community collaboration.',
  },
  {
    year: '2026',
    title: 'SLxAI Academy launches',
    desc: 'Live Zoom workshops in sign language bring practical AI skills to the global community.',
  },
  {
    year: '2027',
    title: 'Summit Miami',
    desc: 'Partners and members gather in Miami to advance the next chapter of Sign Language × AI.',
  },
];

export function MilestoneTimeline() {
  return (
    <div className="relative">
      <div className="absolute left-4 top-0 hidden h-full w-px bg-gradient-to-b from-electric-blue/60 via-white/20 to-transparent sm:left-1/2 sm:block" aria-hidden />

      <div className="space-y-8">
        {MILESTONES.map((item, i) => (
          <ScrollReveal key={`${item.year}-${item.title}`} delay={i * 0.06}>
            <div
              className={`relative flex flex-col gap-4 sm:flex-row sm:items-center ${
                i % 2 === 0 ? 'sm:flex-row-reverse' : ''
              }`}
            >
              <div className="hidden w-1/2 sm:block" aria-hidden />
              <div
                className={`w-full sm:w-1/2 ${i % 2 === 0 ? 'sm:pr-12 sm:text-right' : 'sm:pl-12'}`}
              >
                <GlassCard className="!p-5">
                  <span className="text-xs font-bold uppercase tracking-wider text-electric-blue">{item.year}</span>
                  <h3 className="mt-1 text-lg font-semibold text-white public-card-title">{item.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-white/65">{item.desc}</p>
                </GlassCard>
              </div>
              <div
                className="absolute left-4 top-6 hidden h-3 w-3 -translate-x-1/2 rounded-full border-2 border-electric-blue bg-[hsl(var(--public-surface))] sm:left-1/2 sm:block"
                aria-hidden
              />
            </div>
          </ScrollReveal>
        ))}
      </div>
    </div>
  );
}
