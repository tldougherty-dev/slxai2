import { SUMMIT_SPONSORS } from '@/data/summitSponsors';
import {
  AMAZON_SPONSOR_LOGO_IMG_CLASS,
  getSummitMarqueeScrollLogoClasses,
  isAmazonSponsor,
  isSummitSponsorCircularLogo,
  SUMMIT_SPONSOR_CIRCULAR_FRAME_CLASS,
  SUMMIT_SPONSOR_CIRCULAR_IMG_CLASS,
} from '@/components/summit2026/summit2026SponsorLogoClasses';
import { usePrefersReducedMotion } from '@/hooks/use-prefers-reduced-motion';
import { cn } from '@/lib/utils';

export function SummitMarqueeSponsorLogo({ name, logo }: { name: string; logo: string }) {
  if (isSummitSponsorCircularLogo(name)) {
    return (
      <span className={SUMMIT_SPONSOR_CIRCULAR_FRAME_CLASS}>
        <img
          src={logo}
          alt={name}
          className={SUMMIT_SPONSOR_CIRCULAR_IMG_CLASS}
          loading="lazy"
          decoding="async"
        />
      </span>
    );
  }
  return (
    <img
      src={logo}
      alt={name}
      className={`${getSummitMarqueeScrollLogoClasses(name)} w-auto object-contain${
        isAmazonSponsor(name) ? ` ${AMAZON_SPONSOR_LOGO_IMG_CLASS}` : ''
      }`}
      loading="lazy"
      decoding="async"
    />
  );
}

type SummitSponsorMarqueeProps = {
  title?: string;
  className?: string;
};

const SPONSOR_KEYFRAMES = `
  @keyframes scrollSponsors {
    0% { transform: translateX(0); }
    100% { transform: translateX(calc(-33.333%)); }
  }
  @keyframes scrollSponsorsMobile {
    0% { transform: translateX(0); }
    100% { transform: translateX(calc(-33.333%)); }
  }
`;

export function SummitSponsorMarquee({ title = 'Our Sponsors', className }: SummitSponsorMarqueeProps) {
  const reducedMotion = usePrefersReducedMotion();
  const sponsors = SUMMIT_SPONSORS;
  const sponsorSlotCount = sponsors.length * 3;
  const tripled = [...sponsors, ...sponsors, ...sponsors];

  return (
    <div className={cn('summit-sponsor-marquee mb-4 sm:mb-6 md:mb-8', className)}>
      <div className="rounded-lg border-2 border-electric-blue/20 bg-white px-4 py-3 shadow-xl !bg-white dark:!bg-white sm:px-6 sm:py-3 md:px-8 md:py-4">
        <h3 className="mb-2 text-center text-2xl font-bold text-gray-900 sm:mb-3 sm:text-3xl md:mb-4 md:text-4xl">
          {title}
        </h3>
        <style>{SPONSOR_KEYFRAMES}</style>
        <div className="summit-sponsor-marquee-track relative h-52 w-full overflow-hidden !bg-white dark:!bg-white sm:h-60 md:h-80">
          {reducedMotion ? (
            <div className="flex h-full flex-wrap items-center justify-center gap-6 px-4 py-4">
              {sponsors.map((sponsor) => (
                <a
                  key={sponsor.name}
                  href={sponsor.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center transition-opacity hover:opacity-80"
                >
                  <SummitMarqueeSponsorLogo name={sponsor.name} logo={sponsor.logo} />
                </a>
              ))}
            </div>
          ) : (
            <>
              <div
                className="flex h-full items-center md:hidden"
                style={{
                  width: `calc(100% * ${sponsorSlotCount})`,
                  animation: 'scrollSponsorsMobile 26.4s linear infinite',
                }}
              >
                {tripled.map((sponsor, index) => (
                  <div
                    key={`${sponsor.name}-mobile-${index}`}
                    className="flex shrink-0 items-center justify-center px-3"
                    style={{
                      width: `calc(100% / ${sponsorSlotCount})`,
                      minWidth: `calc(100% / ${sponsorSlotCount})`,
                      maxWidth: `calc(100% / ${sponsorSlotCount})`,
                    }}
                  >
                    <a
                      href={sponsor.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center transition-opacity hover:opacity-80"
                    >
                      <SummitMarqueeSponsorLogo name={sponsor.name} logo={sponsor.logo} />
                    </a>
                  </div>
                ))}
              </div>
              <div
                className="hidden h-full items-center md:flex"
                style={{
                  width: `calc(100% * ${sponsors.length})`,
                  animation: 'scrollSponsors 26.4s linear infinite',
                }}
              >
                {tripled.map((sponsor, index) => (
                  <div
                    key={`${sponsor.name}-desktop-${index}`}
                    className="flex shrink-0 items-center justify-center px-4"
                    style={{
                      width: `calc(100% / ${sponsorSlotCount})`,
                      minWidth: `calc(100% / ${sponsorSlotCount})`,
                      maxWidth: `calc(100% / ${sponsorSlotCount})`,
                    }}
                  >
                    <a
                      href={sponsor.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center transition-opacity hover:opacity-80"
                    >
                      <SummitMarqueeSponsorLogo name={sponsor.name} logo={sponsor.logo} />
                    </a>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
