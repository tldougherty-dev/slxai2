import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { SUMMIT_SPONSORS } from '@/data/summitSponsors';
import { getSummit2026WorkshopsInScheduleOrder } from '@/data/summit2026Workshops';
import { WorkshopSessionCard } from '@/components/summit2026/WorkshopSessionCard';
import { Summit2026ScheduleSection } from '@/components/summit2026/Summit2026ScheduleSection';
import { Summit2026SponsorsSection } from '@/components/summit2026/Summit2026SponsorsSection';
import { Summit2026TableOfContents } from '@/components/summit2026/Summit2026TableOfContents';
import {
  Summit2026CommitteeSection,
  Summit2026StorySlxaiSection,
  Summit2026WelcomeLetterSection,
} from '@/components/summit2026/Summit2026ProgramNarrativeSections';
import { WorkshopPresenterBioCard } from '@/components/summit2026/workshopProgramBookShared';
import { SUMMIT_2026_MOC_ANDREW_BOTTOMS_BIO } from '@/data/summit2026ProgramBookNarrative';
import {
  getSummitSponsorMarqueeLogoClasses,
  isSummitSponsorCircularLogo,
  SUMMIT_SPONSOR_CIRCULAR_FRAME_CLASS,
  SUMMIT_SPONSOR_CIRCULAR_IMG_CLASS,
} from '@/components/summit2026/summit2026SponsorLogoClasses';
import type { Summit2026ProgramBookGetText } from '@/components/summit2026/summit2026ProgramBookTypes';

export type { Summit2026ProgramBookGetText };

/** Scrolling strip: same circular crop as tiered `SponsorRow` for With Direction LLC. */
function SummitMarqueeSponsorLogo({ name, logo }: { name: string; logo: string }) {
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
      className={`${getSummitSponsorMarqueeLogoClasses(name)} w-auto object-contain`}
    />
  );
}

type Summit2026ProgramBookContentProps = {
  getText: Summit2026ProgramBookGetText;
  /** When true, hides the red SOLD OUT banner (e.g. /2026 program book page). Default false. */
  hideSoldOut?: boolean;
  /** When true, shows "Program book" under the Summit 2026 title row. */
  showProgramBookSubtitle?: boolean;
  /** When true, shows the full two-day schedule block (intended for /2026 program book only). Default true. */
  showSchedule?: boolean;
  /** When false, workshop cards do not link to /2026/workshop/:slug (homepage before program book is public). Default true. */
  linkWorkshopCardsToProgramBook?: boolean;
  /** When false, hides the Workshops & Panels list (duplicate of schedule links). Use false on /2026 program book. Default true. */
  showWorkshopsAndPanels?: boolean;
};

const Summit2026ProgramBookContent = ({
  getText,
  hideSoldOut = false,
  showProgramBookSubtitle = false,
  showSchedule = true,
  linkWorkshopCardsToProgramBook = true,
  showWorkshopsAndPanels = true,
}: Summit2026ProgramBookContentProps) => {
  const [isAboutSummitExpanded, setIsAboutSummitExpanded] = useState(false);
  const [isWorkshopPanelExpanded, setIsWorkshopPanelExpanded] = useState(false);
  const sponsors = SUMMIT_SPONSORS;
  const sponsorSlotCount = sponsors.length * 3;
  const workshopsInScheduleOrder = showWorkshopsAndPanels ? getSummit2026WorkshopsInScheduleOrder() : [];

  const sponsorSectionOuterClass = 'mb-4 sm:mb-6 md:mb-8';
  const sponsorCardClass =
    'bg-white dark:bg-gray-800 rounded-lg shadow-xl border-2 border-electric-blue/20 px-4 py-3 sm:px-6 sm:py-3 md:px-8 md:py-4';
  const sponsorHeadingClass =
    'text-2xl sm:text-3xl md:text-4xl font-bold text-center text-gray-900 dark:text-white mb-2 sm:mb-3 md:mb-4';
  const sponsorCarouselClass = 'relative overflow-hidden h-48 sm:h-56 md:h-72 w-full';

  return (
    <>
      {/* Summit Section */}
      <section
        id="summit"
        className="py-4 bg-gray-50 dark:bg-gray-900 max-md:py-3 max-md:pb-5"
      >
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="mb-8 flex justify-center px-1">
            <div className="flex w-fit max-w-full flex-col items-stretch gap-3 text-center">
              <h2 className="text-4xl sm:text-6xl font-bold text-gray-900 dark:text-white flex flex-wrap items-center justify-center gap-2">
                <img
                  src="/slxai-footer-logo.png"
                  alt="SLxAI Logo"
                  className="w-auto inline-block align-middle"
                  style={{ height: '54px' }}
                />
                <span className="whitespace-nowrap">{getText('summitTitle', 'Summit 2026')}</span>
              </h2>
              {showProgramBookSubtitle ? (
                <p className="w-full text-4xl font-bold leading-tight tracking-tight text-electric-blue sm:text-6xl">
                  {getText('programBookHeroLine', 'Program book')}
                </p>
              ) : null}
            </div>
          </div>

          {!hideSoldOut ? (
            <div className="mb-8">
              <div className="bg-red-600 text-white text-3xl sm:text-5xl font-bold py-6 sm:py-12 shadow-xl w-full rounded-lg text-center">
                SOLD OUT
              </div>
            </div>
          ) : null}

          {/* Sponsors */}
          <div className={sponsorSectionOuterClass}>
            <div className={sponsorCardClass}>
              <h3 className={sponsorHeadingClass}>Our Sponsors</h3>
              <style>{`
                @keyframes scrollSponsors {
                  0% {
                    transform: translateX(0);
                  }
                  100% {
                    transform: translateX(calc(-33.333%));
                  }
                }
                @keyframes scrollSponsorsMobile {
                  0% {
                    transform: translateX(0);
                  }
                  100% {
                    transform: translateX(calc(-33.333%));
                  }
                }
              `}</style>
              <div className={sponsorCarouselClass}>
                <div 
                  className="md:hidden flex h-full items-center"
                  style={{ 
                    width: `calc(100% * ${sponsorSlotCount})`,
                    animation: 'scrollSponsorsMobile 26.4s linear infinite'
                  }}
                >
                  {[...sponsors, ...sponsors, ...sponsors].map((sponsor, index) => (
                    <div
                      key={`${sponsor.name}-mobile-${index}`}
                      className="flex items-center justify-center shrink-0 px-3"
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
                        className="flex items-center justify-center hover:opacity-80 transition-opacity"
                      >
                        <SummitMarqueeSponsorLogo name={sponsor.name} logo={sponsor.logo} />
                      </a>
                    </div>
                  ))}
                </div>
                <div 
                  className="hidden md:flex h-full items-center"
                  style={{ 
                    width: `calc(100% * ${sponsors.length})`,
                    animation: 'scrollSponsors 26.4s linear infinite'
                  }}
                >
                  {[...sponsors, ...sponsors, ...sponsors].map((sponsor, index) => (
                    <div
                      key={`${sponsor.name}-desktop-${index}`}
                      className="flex items-center justify-center px-4 shrink-0"
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
                        className="flex items-center justify-center hover:opacity-80 transition-opacity"
                      >
                        <SummitMarqueeSponsorLogo name={sponsor.name} logo={sponsor.logo} />
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {showSchedule ? <Summit2026TableOfContents getText={getText} /> : null}

          {showSchedule ? (
            <div className="flex flex-col gap-8">
              <Summit2026ScheduleSection getText={getText} programBookMobile />
              <Summit2026SponsorsSection getText={getText} />
              <Summit2026WelcomeLetterSection getText={getText} />

            <Card
              id="summit-about"
              className="scroll-mt-28 w-full overflow-hidden rounded-lg border border-gray-200 shadow-xl dark:border-gray-700"
            >
              <CardHeader 
                className={`bg-electric-blue text-white text-center py-2 cursor-pointer md:cursor-default ${isAboutSummitExpanded ? 'rounded-t-lg' : 'rounded-lg'} md:rounded-t-lg`}
                onClick={() => setIsAboutSummitExpanded(!isAboutSummitExpanded)}
              >
                <div className="flex items-center justify-center gap-2 px-1">
                  <CardTitle className="text-balance text-white text-2xl font-bold leading-tight md:text-3xl lg:text-4xl">
                    {getText('aboutSummitTitle', 'About Summit 2026')}
                  </CardTitle>
                  <ChevronDown className={`h-5 w-5 shrink-0 text-white transition-transform md:hidden sm:h-6 sm:w-6 ${isAboutSummitExpanded ? 'rotate-180' : ''}`} />
                </div>
              </CardHeader>
              <CardContent className={`space-y-4 pt-4 pb-4 md:block ${isAboutSummitExpanded ? 'block' : 'hidden'}`}>
                <div className="mb-4 overflow-hidden rounded-lg shadow-lg">
                  <img
                    src="/slxai-bu-hero.png"
                    alt="SLxAI Summit at Boston University"
                    className="h-auto w-full"
                  />
                </div>
                <div className="space-y-4 text-gray-700 dark:text-white leading-relaxed">
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{getText('overviewTitle', 'At a glance')}</h3>
                    <p>
                      {getText(
                        'overviewText',
                        'The inaugural SLxAI Summit gathers researchers, industry, Deaf-led organizations, and community partners at Boston University for shared dialogue on sign language and AI: ethics, responsible deployment, data governance, benchmarks, accessibility, and real-world impact. A single plenary program keeps every attendee in the same room for the full agenda, so discussions stay transparent and aligned. The event advances SLxAI’s cooperative nonprofit work, including community engagement around bylaws and long-term governance.',
                      )}
                    </p>
                  </div>

                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{getText('hostTitle', 'Hosts')}</h3>
                    <p>
                      {getText(
                        'hostText',
                        'Your hosts are Dr. Naomi Caselli and Travis Dougherty. Dr. Caselli is at Boston University as Director of the Deaf Center, advancing sign language linguistics, Deaf studies, and technology; the university is proud to host the summit on campus. Travis Dougherty convenes SLxAI’s global stakeholder community and co-hosts the gathering alongside Dr. Caselli.',
                      )}
                    </p>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-1 items-start gap-3 pt-2 md:grid-cols-2 md:gap-6">
                  <div className="space-y-3 md:space-y-4">
                    <div className="overflow-hidden rounded-lg border-2 border-electric-blue bg-white shadow-xl dark:bg-gray-800">
                      <div className="bg-electric-blue py-1 text-center text-white max-md:py-0.5">
                        <h3 className="text-lg font-bold text-white md:text-xl">
                          {getText('dateTimeTitle', 'Date & Time')}
                        </h3>
                      </div>
                      <div className="p-2.5 md:p-4">
                        <div className="text-center text-sm leading-snug text-gray-700 dark:text-white md:text-base md:leading-normal">
                          <p>
                            <strong>{getText('date', 'Date:')}</strong> {getText('dateValue', 'April 16-17, 2026')}
                            <br />
                            <strong>{getText('conferenceHours', 'Conference Hours:')}</strong>{' '}
                            {getText('conferenceHoursValue', '8:45 AM to 5:10 PM (see schedule below)')}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="overflow-hidden rounded-lg border-2 border-electric-blue bg-white shadow-xl dark:bg-gray-800">
                      <div className="bg-electric-blue py-1 text-center text-white max-md:py-0.5">
                        <h3 className="text-lg font-bold text-white md:text-xl">{getText('locationTitle', 'Location')}</h3>
                      </div>
                      <div className="p-2.5 md:p-4">
                        <div className="text-center text-sm leading-snug text-gray-700 dark:text-white md:text-base md:leading-normal">
                          <strong>{getText('venue', 'Venue:')}</strong> {getText('venueValue', 'Boston University')}
                          <br />
                          <strong>Location:</strong> Metcalf Trustee Center Ballroom (9th Floor)
                          <br />
                          <strong>Building:</strong> Boston University Questrom School of Business
                          <br />
                          <strong>{getText('city', 'City:')}</strong> {getText('cityValue', 'Boston, Massachusetts')}
                          <br />
                          <strong>{getText('address', 'Address:')}</strong> 1 Silber Way
                          <br />
                          Boston, MA 02215
                          <br />
                          <p className="mt-2 text-[11px] italic leading-snug text-gray-600 dark:text-gray-400 max-md:mt-2 md:mt-3 md:text-xs">
                            <strong>Important:</strong>{' '}
                            Please enter through the side entrance at One Silber Way. Do not use the 595 Commonwealth Ave entrance.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex h-full flex-col rounded-lg border-2 border-electric-blue bg-white p-2 shadow-xl dark:bg-gray-800 md:p-4">
                    <div className="h-[220px] w-full overflow-hidden rounded-lg md:h-[300px]">
                      <iframe
                        className="block h-full w-full"
                        src="https://www.google.com/maps?q=1+Silber+Way+Boston+MA+02215&output=embed"
                        width="100%"
                        height="100%"
                        style={{
                          border: 0,
                          filter: 'none',
                        }}
                        allowFullScreen
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                        title="Boston University Questrom School of Business - Metcalf Trustee Center"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Summit2026StorySlxaiSection getText={getText} />

            <Card
              id="summit-master-of-ceremonies"
              className="scroll-mt-28 w-full overflow-hidden rounded-lg border border-gray-200 shadow-xl dark:border-gray-700"
            >
              <CardHeader className="bg-electric-blue py-2 text-center text-white">
                <CardTitle className="text-2xl font-bold leading-tight text-white sm:text-3xl">
                  {getText('masterOfCeremoniesTitle', 'Master of Ceremonies')}
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4 py-6 text-left sm:px-6">
                <div className="grid grid-cols-1 gap-8 md:grid-cols-2 md:items-start md:gap-8 lg:gap-10">
                  <div className="min-w-0">
                    <h3 className="mb-4 text-center text-base font-semibold uppercase tracking-wide text-electric-blue dark:text-sky-300 md:text-left">
                      {getText('tocDay1', 'Day 1')}
                    </h3>
                    <WorkshopPresenterBioCard
                      name="Andrew Bottoms"
                      title="Master of Ceremonies, Day 1"
                      organization="Boston University"
                      photoUrl="/summit2026/andrew-bottoms.png"
                      bio={SUMMIT_2026_MOC_ANDREW_BOTTOMS_BIO}
                    />
                  </div>
                  <div className="min-w-0">
                    <h3 className="mb-4 text-center text-base font-semibold uppercase tracking-wide text-electric-blue dark:text-sky-300 md:text-left">
                      {getText('tocDay2', 'Day 2')}
                    </h3>
                    <p className="text-center text-lg leading-relaxed text-gray-700 dark:text-gray-200 sm:text-xl md:text-left">
                      <strong className="text-gray-900 dark:text-white">Dr. Barbara Spiecker</strong>
                      {', '}
                      <span className="text-gray-800 dark:text-gray-100">Boston University</span>
                      {' — '}
                      <span className="text-gray-700 dark:text-gray-300">Master of Ceremonies, Day 2</span>
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {showWorkshopsAndPanels ? (
              <Card className="hidden overflow-hidden rounded-lg border border-gray-200 shadow-xl dark:border-gray-700 md:block">
                <div className="bg-electric-blue py-2 text-center text-white">
                  <h3 className="text-4xl font-bold text-white">{getText('workshopListTitle', 'Workshops & Panels')}</h3>
                </div>
                <div className="bg-blue-50 px-6 pb-6 pt-4 dark:bg-blue-900/20">
                  <div className="space-y-6">
                    {workshopsInScheduleOrder.map((session) => (
                      <WorkshopSessionCard
                        key={session.slug}
                        session={session}
                        linkToProgramBook={linkWorkshopCardsToProgramBook}
                      />
                    ))}
                  </div>
                </div>
              </Card>
            ) : null}

            {showWorkshopsAndPanels ? (
              <Card className="border border-gray-200 dark:border-gray-700 shadow-xl md:hidden overflow-hidden rounded-lg">
                {/* Workshop Panel Section - Mobile Only */}
                <CardHeader
                  className={`bg-electric-blue text-white text-center py-2 cursor-pointer ${isWorkshopPanelExpanded ? 'rounded-t-lg' : 'rounded-lg'}`}
                  onClick={() => setIsWorkshopPanelExpanded(!isWorkshopPanelExpanded)}
                >
                  <div className="flex items-center justify-center gap-2 px-1">
                    <CardTitle className="text-balance text-white text-xl font-bold leading-tight sm:text-2xl">
                      {getText('workshopListTitle', 'Workshops & Panels')}
                    </CardTitle>
                    <ChevronDown className={`h-5 w-5 shrink-0 text-white transition-transform sm:h-6 sm:w-6 ${isWorkshopPanelExpanded ? 'rotate-180' : ''}`} />
                  </div>
                </CardHeader>
                <CardContent className={`pt-4 pb-0 ${isWorkshopPanelExpanded ? 'block' : 'hidden'}`}>
                  <div className="bg-blue-50 dark:bg-blue-900/20 px-4 pt-4 pb-6 -mx-6 -mb-6">
                    <div className="space-y-6">
                      {workshopsInScheduleOrder.map((session) => (
                        <WorkshopSessionCard
                          key={session.slug}
                          session={session}
                          linkToProgramBook={linkWorkshopCardsToProgramBook}
                        />
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : null}

            <Summit2026CommitteeSection getText={getText} />
            </div>
          ) : null}
        </div>
      </section>
    </>
  );
};

export default Summit2026ProgramBookContent;
