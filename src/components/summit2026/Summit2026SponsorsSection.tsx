import {
  SUMMIT_2026_SPONSORS_BY_TIER,
  type Summit2026SponsorTierGroup,
} from '@/data/summit2026SponsorsByTier';
import type { Summit2026ProgramBookGetText } from '@/components/summit2026/summit2026ProgramBookTypes';
import { cn } from '@/lib/utils';
import {
  AMAZON_SPONSOR_LOGO_IMG_CLASS,
  getFriendsTierCardLogoClasses,
  getSummitSponsorMarqueeLogoClasses,
  isAmazonSponsor,
  isSummitSponsorCircularLogo,
  SUMMIT_SPONSOR_CIRCULAR_FRAME_CLASS,
  SUMMIT_SPONSOR_CIRCULAR_IMG_CLASS,
} from '@/components/summit2026/summit2026SponsorLogoClasses';

type Props = {
  getText: Summit2026ProgramBookGetText;
};

/** Ribbon bar inside each tier card. */
function tierHeadingClass(tierLabel: string): string {
  switch (tierLabel) {
    case 'Title Sponsor':
      return 'bg-red-600 text-white';
    case 'Platinum Sponsors':
      return 'bg-slate-300 text-slate-950';
    case 'Gold Sponsors':
      return 'bg-amber-300 text-amber-950';
    case 'Silver Sponsors':
      return 'bg-gray-300 text-gray-950';
    case 'Bronze Sponsors':
      return 'bg-orange-200 text-orange-950';
    case 'Friends of SLxAI':
      return 'bg-white text-emerald-900 ring-1 ring-inset ring-emerald-200';
    default:
      return 'bg-gray-200 text-gray-900';
  }
}

/** Outer frame for each tier section (header flush to top border; matches tier accent). */
function tierSectionBorderClass(tierLabel: string): string {
  switch (tierLabel) {
    case 'Title Sponsor':
      return 'border-red-600';
    case 'Platinum Sponsors':
      return 'border-slate-500';
    case 'Gold Sponsors':
      return 'border-amber-500';
    case 'Silver Sponsors':
      return 'border-gray-500';
    case 'Bronze Sponsors':
      return 'border-orange-500';
    case 'Friends of SLxAI':
      return 'border-emerald-600';
    default:
      return 'border-gray-400';
  }
}

function isPlatinumOrGoldTier(tierLabel: string): boolean {
  return tierLabel === 'Platinum Sponsors' || tierLabel === 'Gold Sponsors';
}

function isSilverTier(tierLabel: string): boolean {
  return tierLabel === 'Silver Sponsors';
}

/** Grid classes: Platinum & Gold use three columns on md+; Friends full row with two columns for logos; other tiers stay two columns. */
function tierSponsorGridClass(tierLabel: string): string {
  const base =
    'mx-auto grid w-full grid-cols-1 justify-items-center gap-x-6 gap-y-5 sm:gap-x-8 sm:gap-y-6';
  if (isPlatinumOrGoldTier(tierLabel)) {
    return `${base} max-w-5xl md:grid-cols-3`;
  }
  if (tierLabel === 'Friends of SLxAI') {
    return 'mx-auto grid w-full max-w-5xl grid-cols-1 justify-items-center gap-x-4 gap-y-4 sm:gap-x-5 sm:gap-y-4 md:grid-cols-2 md:gap-x-6 md:gap-y-5';
  }
  return `${base} max-w-3xl md:grid-cols-2`;
}

function SponsorRow({
  name,
  url,
  logo,
  tierLabel,
}: {
  name: string;
  url: string;
  logo?: string;
  tierLabel: string;
}) {
  /** 2× logo size vs marquee — this section only (Title / Boston University). */
  const isDoubleTitleBu =
    tierLabel === 'Title Sponsor' && name.trim().toLowerCase().includes('boston university');

  const isCircularBrandLogo = isSummitSponsorCircularLogo(name);
  const isFriendsTier = tierLabel === 'Friends of SLxAI';

  const amazonLogo = isAmazonSponsor(name);
  const glwmaxLogo = name.trim().toLowerCase().includes('glwmax');

  const imgClass = cn(
    isDoubleTitleBu
      ? 'max-h-72 w-auto max-w-full object-contain md:max-h-64'
      : isFriendsTier
        ? getFriendsTierCardLogoClasses(name)
        : `${getSummitSponsorMarqueeLogoClasses(name)} w-auto max-w-full object-contain`,
    amazonLogo && AMAZON_SPONSOR_LOGO_IMG_CLASS,
  );

  /** Narrow centered cards (`max-w-sm`): equal width to each other, gutter space at sides of each column. */
  const cardMax = isDoubleTitleBu
    ? 'max-w-6xl'
    : tierLabel === 'Title Sponsor'
      ? 'max-w-3xl'
      : tierLabel === 'Friends of SLxAI'
        ? glwmaxLogo
          ? 'max-w-xl'
          : amazonLogo
            ? 'max-w-sm'
            : 'max-w-xl'
        : 'max-w-sm';

  /** Logo area: solid white (Friends tier: extra padding to clear any gray in source PNGs). */
  const logoBoxBase =
    'box-border flex w-full max-w-full items-center justify-center rounded-md border-0 bg-white dark:bg-white';

  const logoBoxClass = isDoubleTitleBu
    ? `${logoBoxBase} min-h-[21rem] px-4 py-6 sm:min-h-[23rem] md:min-h-[26rem] md:px-6 md:py-8`
    : isFriendsTier
      ? glwmaxLogo
        ? `${logoBoxBase} min-h-0 px-2 py-2 sm:px-3 sm:py-2.5 md:px-3 md:py-3`
        : amazonLogo
          ? `${logoBoxBase} min-h-[13rem] px-3 py-4 sm:min-h-[14rem] md:min-h-[15rem] md:px-4 md:py-5`
          : `${logoBoxBase} min-h-[16rem] px-4 py-5 sm:min-h-[18rem] md:min-h-[20rem] md:px-6 md:py-6 lg:min-h-[22rem]`
      : `${logoBoxBase} min-h-[13rem] px-3 py-4 sm:min-h-[14rem] md:min-h-[15rem] md:px-4 md:py-5`;

  const logoMarkup =
    logo && isCircularBrandLogo ? (
      <span className={SUMMIT_SPONSOR_CIRCULAR_FRAME_CLASS}>
        <img
          src={logo}
          alt=""
          className={SUMMIT_SPONSOR_CIRCULAR_IMG_CLASS}
          loading="lazy"
          decoding="async"
        />
      </span>
    ) : logo ? (
      <span className={logoBoxClass}>
        <img src={logo} alt="" className={imgClass} loading="lazy" decoding="async" />
      </span>
    ) : null;

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        'group mx-auto flex h-full w-full flex-col items-center justify-start rounded-md text-center transition-colors',
        cardMax,
        glwmaxLogo ? 'gap-2 px-0 py-1' : 'gap-3 px-1 py-2',
      )}
    >
      {logoMarkup}
      <span className="line-clamp-2 w-full text-sm font-medium leading-snug text-gray-900 underline decoration-gray-400 underline-offset-2 transition-colors group-hover:text-gray-950 group-hover:decoration-gray-600 dark:text-gray-900 dark:group-hover:text-gray-950 sm:text-base">
        {name}
      </span>
    </a>
  );
}

function SponsorTierGroupCard({ group }: { group: Summit2026SponsorTierGroup }) {
  const isFriends = group.tierLabel === 'Friends of SLxAI';
  return (
    <div
      className={cn(
        'flex min-h-0 min-w-0 flex-col overflow-hidden rounded-lg border-2 border-solid bg-white',
        tierSectionBorderClass(group.tierLabel),
        isFriends && 'summit-friends-tier bg-white',
      )}
    >
      <h4
        className={`mb-0 w-full px-4 py-2.5 text-center text-base font-bold sm:py-3 sm:text-lg ${tierHeadingClass(group.tierLabel)}`}
      >
        {group.tierLabel}
      </h4>
      <div
        className={
          isFriends
            ? 'flex flex-1 flex-col bg-white px-2 pb-3 pt-3 sm:px-3 sm:pb-4 md:px-4 md:pb-4'
            : 'flex flex-1 flex-col px-3 pb-4 pt-4 sm:px-4 sm:pb-5 md:px-5 md:pb-5'
        }
      >
        {isSilverTier(group.tierLabel) ? (
          <div className="mx-auto flex w-full max-w-5xl flex-col gap-8">
            <ul className="mx-auto grid w-full grid-cols-1 justify-items-center gap-x-6 gap-y-6 sm:gap-y-7 md:grid-cols-3 md:gap-x-8">
              {group.sponsors.slice(0, 3).map((s) => (
                <li key={`${group.tierLabel}-${s.name}`} className="flex w-full justify-center">
                  <SponsorRow name={s.name} url={s.url} logo={s.logo} tierLabel={group.tierLabel} />
                </li>
              ))}
            </ul>
            {group.sponsors.length > 3 ? (
              <ul className="mx-auto grid w-full max-w-3xl grid-cols-1 justify-items-center gap-x-6 gap-y-6 sm:gap-y-7 md:grid-cols-2 md:gap-x-8">
                {group.sponsors.slice(3).map((s) => (
                  <li key={`${group.tierLabel}-${s.name}`} className="flex w-full justify-center">
                    <SponsorRow name={s.name} url={s.url} logo={s.logo} tierLabel={group.tierLabel} />
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        ) : (
          <ul className={tierSponsorGridClass(group.tierLabel)}>
            {group.sponsors.map((s, idx) => {
              const n = group.sponsors.length;
              const threeCol = isPlatinumOrGoldTier(group.tierLabel);
              const spanFullRowCenter = threeCol
                ? n === 1 || (idx === n - 1 && n > 1 && n % 3 === 1)
                : n === 1 || (idx === n - 1 && n % 2 === 1);
              const colSpanClass = threeCol
                ? spanFullRowCenter
                  ? 'md:col-span-3'
                  : ''
                : spanFullRowCenter
                  ? 'md:col-span-2'
                  : '';
              return (
                <li
                  key={`${group.tierLabel}-${s.name}`}
                  className={`flex w-full justify-center ${colSpanClass}`}
                >
                  <SponsorRow name={s.name} url={s.url} logo={s.logo} tierLabel={group.tierLabel} />
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}

export function Summit2026SponsorsSection({ getText }: Props) {
  return (
    <div
      id="summit-sponsors-by-tier"
      className="scroll-mt-28 mb-8 w-full md:col-span-2"
    >
      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-xl dark:border-gray-700 dark:bg-white">
        <div className="bg-electric-blue px-4 py-3 text-center sm:py-3.5">
          <h3 className="text-balance px-2 text-xl font-bold leading-tight text-white sm:text-2xl md:text-3xl">
            {getText('sponsorsSectionTitle', 'Sponsors')}
          </h3>
        </div>
        <div className="space-y-8 bg-white p-4 sm:p-6 dark:bg-white">
          <p className="mx-auto max-w-3xl text-center text-base leading-relaxed text-gray-800 dark:text-gray-800 sm:text-lg">
            {getText(
              'sponsorsSectionThankYou',
              'We are grateful to our incredible sponsors for making this summit possible. Without your support, none of this would happen. Thank you to each of you.',
            )}
          </p>
          {SUMMIT_2026_SPONSORS_BY_TIER.map((group) => (
            <SponsorTierGroupCard key={group.tierLabel} group={group} />
          ))}
        </div>
      </div>
    </div>
  );
}
