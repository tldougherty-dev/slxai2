/** With Direction LLC: circular crop in tiered sponsors + scrolling marquee (same asset treatment). */
export function isSummitSponsorCircularLogo(name: string): boolean {
  return name.trim().toLowerCase().includes('with direction');
}

/** Friends / marquee: Amazon asset ships with a light gray plate; lighten so it reads white on our panels. */
export function isAmazonSponsor(name: string): boolean {
  return name.trim().toLowerCase() === 'amazon';
}

/** Tailwind: applied to `<img>` for Amazon only (homepage + program book). */
export const AMAZON_SPONSOR_LOGO_IMG_CLASS =
  'brightness-[1.1] contrast-[1.22] saturate-[1.04]';

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
  /** GLWMax: ~30% smaller than prior max-h-72 / md:96 / lg:[26rem]. */
  if (n.includes('glwmax')) {
    return 'max-h-[12.6rem] md:max-h-[16.8rem] lg:max-h-[18.2rem]';
  }
  /** Amazon: ~10% smaller than shared Bronze row (max-h-56 / md:64). */
  if (n.includes('amazon')) {
    return 'max-h-[12.6rem] md:max-h-[14.4rem]';
  }
  if (
    n.includes('alangu') ||
    n === 'microsoft' ||
    n.includes('nagish') ||
    n.includes('sorenson') ||
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

/** Friends of SLxAI tier cards: larger logos than the scrolling marquee. */
export function getFriendsTierCardLogoClasses(name: string): string {
  const n = name.trim().toLowerCase();
  /** Friends tier GLWMax: ~30% smaller than prior xl max-h-[30rem] ladder. */
  if (n.includes('glwmax')) {
    return 'max-h-[12.6rem] w-auto max-w-full object-contain sm:max-h-[14rem] md:max-h-[16.8rem] lg:max-h-[19.6rem] xl:max-h-[21rem]';
  }
  /** Other Friends sponsors (e.g. Amazon): same max-height scale as tiered marquee — matches Bronze Nagish/Sorenson width. */
  return `${getSummitSponsorMarqueeLogoClasses(name)} w-auto max-w-full object-contain`;
}
