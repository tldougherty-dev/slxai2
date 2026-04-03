/** With Direction LLC: circular crop in tiered sponsors + scrolling marquee (same asset treatment). */
export function isSummitSponsorCircularLogo(name: string): boolean {
  return name.trim().toLowerCase().includes('with direction');
}

/** Wrapper: square frame, circular mask, ring (matches tiered `SponsorRow`). */
export const SUMMIT_SPONSOR_CIRCULAR_FRAME_CLASS =
  'box-border mx-auto flex aspect-square w-full max-w-[11.5rem] shrink-0 items-center justify-center overflow-hidden rounded-full border-0 bg-white p-0 shadow-sm ring-1 ring-gray-100 dark:bg-white dark:ring-gray-200 sm:max-w-[12.5rem] md:max-w-[13rem]';

/** Image fill inside circular frame. */
export const SUMMIT_SPONSOR_CIRCULAR_IMG_CLASS =
  'h-full w-full scale-[1.06] object-cover object-center';

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
