import { useState } from 'react';
import { GlassCard } from './GlassCard';

type MemberRegion = {
  id: string;
  name: string;
  members: number;
  x: number;
  y: number;
};

const REGIONS: MemberRegion[] = [
  { id: 'us', name: 'United States', members: 420, x: 22, y: 42 },
  { id: 'ca', name: 'Canada', members: 85, x: 20, y: 32 },
  { id: 'uk', name: 'United Kingdom', members: 120, x: 48, y: 30 },
  { id: 'de', name: 'Germany', members: 95, x: 52, y: 32 },
  { id: 'fr', name: 'France', members: 72, x: 49, y: 36 },
  { id: 'br', name: 'Brazil', members: 58, x: 32, y: 68 },
  { id: 'jp', name: 'Japan', members: 64, x: 82, y: 40 },
  { id: 'au', name: 'Australia', members: 48, x: 84, y: 72 },
  { id: 'in', name: 'India', members: 52, x: 68, y: 48 },
  { id: 'za', name: 'South Africa', members: 38, x: 54, y: 78 },
  { id: 'mx', name: 'Mexico', members: 44, x: 18, y: 50 },
  { id: 'kr', name: 'South Korea', members: 36, x: 80, y: 42 },
];

const MAP_FILL = 'rgba(255, 255, 255, 0.12)';
const MAP_STROKE = 'rgba(255, 255, 255, 0.28)';

export function CommunityWorldMap() {
  const [active, setActive] = useState<MemberRegion | null>(null);

  return (
    <GlassCard strong className="relative overflow-hidden !p-0">
      <div className="border-b border-white/10 px-6 py-5 sm:px-8">
        <h3 className="text-lg font-semibold text-white public-section-title">Global community map</h3>
        <p className="mt-1 text-sm text-white/60">
          Members and partners across {REGIONS.length}+ countries advancing Sign Language and AI.
        </p>
      </div>

      <div className="relative px-4 py-8 sm:px-8">
        <div className="relative mx-auto min-h-[220px] w-full max-w-4xl sm:min-h-[280px]">
          <svg
            viewBox="0 0 100 55"
            className="h-full w-full"
            role="img"
            aria-label="World map showing SLxAI community member locations"
            preserveAspectRatio="xMidYMid meet"
          >
            <defs>
              <radialGradient id="map-glow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#0080FF" stopOpacity="0.55" />
                <stop offset="100%" stopColor="#0080FF" stopOpacity="0" />
              </radialGradient>
              <filter id="map-marker-glow">
                <feGaussianBlur stdDeviation="0.6" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            <rect x="0" y="0" width="100" height="55" fill="rgba(0, 128, 255, 0.04)" rx="2" />

            {/* Simplified continent silhouettes */}
            <path
              d="M8 18 Q14 12 22 14 L28 20 Q30 28 24 38 Q18 48 12 44 Q6 36 8 18 Z"
              fill={MAP_FILL}
              stroke={MAP_STROKE}
              strokeWidth="0.35"
            />
            <path
              d="M14 28 Q18 24 24 26 L30 34 Q32 44 26 52 Q20 56 14 50 Q10 40 14 28 Z"
              fill={MAP_FILL}
              stroke={MAP_STROKE}
              strokeWidth="0.35"
            />
            <path
              d="M42 18 Q50 14 58 18 L62 26 Q60 36 52 38 Q44 36 42 28 Z"
              fill={MAP_FILL}
              stroke={MAP_STROKE}
              strokeWidth="0.35"
            />
            <path
              d="M44 30 Q52 28 58 32 L60 40 Q56 48 48 46 Q42 40 44 30 Z"
              fill={MAP_FILL}
              stroke={MAP_STROKE}
              strokeWidth="0.35"
            />
            <path
              d="M58 22 Q68 18 78 22 L84 30 Q86 40 78 46 Q68 48 60 42 Q56 32 58 22 Z"
              fill={MAP_FILL}
              stroke={MAP_STROKE}
              strokeWidth="0.35"
            />
            <path
              d="M62 48 Q72 44 82 50 L84 58 Q78 66 68 64 Q58 60 62 48 Z"
              fill={MAP_FILL}
              stroke={MAP_STROKE}
              strokeWidth="0.35"
            />
            <path
              d="M48 58 Q54 54 60 58 L62 66 Q58 72 52 70 Q46 66 48 58 Z"
              fill={MAP_FILL}
              stroke={MAP_STROKE}
              strokeWidth="0.35"
            />

            {REGIONS.map((region) => (
              <g key={region.id}>
                <circle
                  cx={region.x}
                  cy={region.y}
                  r={active?.id === region.id ? 4.5 : 3}
                  fill="url(#map-glow)"
                  className="pointer-events-none"
                />
                <circle
                  cx={region.x}
                  cy={region.y}
                  r={2}
                  fill={active?.id === region.id ? '#ffffff' : '#0080FF'}
                  stroke={active?.id === region.id ? '#0080FF' : 'rgba(255,255,255,0.65)'}
                  strokeWidth="0.4"
                  filter="url(#map-marker-glow)"
                  className="cursor-pointer"
                  tabIndex={0}
                  role="button"
                  aria-label={`${region.name}, ${region.members} community members`}
                  onMouseEnter={() => setActive(region)}
                  onMouseLeave={() => setActive(null)}
                  onFocus={() => setActive(region)}
                  onBlur={() => setActive(null)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setActive(active?.id === region.id ? null : region);
                    }
                  }}
                />
              </g>
            ))}
          </svg>
        </div>

        <div
          className="mt-6 min-h-[4rem] rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-center"
          aria-live="polite"
        >
          {active ? (
            <>
              <p className="font-semibold text-white">{active.name}</p>
              <p className="text-sm text-white/60">{active.members}+ community members</p>
            </>
          ) : (
            <p className="text-sm text-white/50">Hover or focus a marker to explore regional participation</p>
          )}
        </div>
      </div>
    </GlassCard>
  );
}
