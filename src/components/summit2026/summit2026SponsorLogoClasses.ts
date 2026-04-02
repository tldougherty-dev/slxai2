/**
 * Logo max-heights aligned with the Summit 2026 scrolling sponsor marquee
 * (`Summit2026ProgramBookContent`): mobile-first, then `md:` for desktop strip.
 */
export function getSummitSponsorMarqueeLogoClasses(name: string): string {
  const n = name.trim().toLowerCase();

  if (n.includes('kara technologies')) {
    return 'max-h-56 md:max-h-64';
  }
  if (n.includes('asl flurry')) {
    return 'max-h-48 md:max-h-48';
  }
  if (
    n.includes('alangu') ||
    n.includes('glwmax') ||
    n === 'microsoft' ||
    n.includes('nagish') ||
    n.includes('tcs') ||
    n.includes('mcdhh') ||
    n.includes('avocado')
  ) {
    return 'max-h-56 md:max-h-64';
  }
  if (n.includes('with direction')) {
    return 'max-h-44 md:max-h-48';
  }
  if (n.includes('twa')) {
    return 'max-h-40 md:max-h-44';
  }

  return 'max-h-36 md:max-h-32';
}
