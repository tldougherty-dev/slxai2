import { SUMMIT_2026_SPONSORS_BY_TIER } from '@/data/summit2026SponsorsByTier';

/** One row in the Summit 2026 scrolling sponsor marquee (program book + landing). */
export type SummitSponsorMarquee = {
  name: string;
  logo: string;
  url: string;
};

function buildSummitSponsorsMarquee(): SummitSponsorMarquee[] {
  const seenLogo = new Set<string>();
  const out: SummitSponsorMarquee[] = [];
  for (const group of SUMMIT_2026_SPONSORS_BY_TIER) {
    for (const s of group.sponsors) {
      if (!s.logo) continue;
      if (seenLogo.has(s.logo)) continue;
      seenLogo.add(s.logo);
      out.push({ name: s.name, logo: s.logo, url: s.url });
    }
  }
  return out;
}

/** Sponsors shown in the scrolling “Our Sponsors” strip — aligned with tiered program book sponsors (logos + URLs). */
export const SUMMIT_SPONSORS: SummitSponsorMarquee[] = buildSummitSponsorsMarquee();
