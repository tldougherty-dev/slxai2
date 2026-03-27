import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { SUMMIT_SPONSORS } from '@/data/summitSponsors';
import { getSummit2026WorkshopsInScheduleOrder } from '@/data/summit2026Workshops';
import { WorkshopSessionCard } from '@/components/summit2026/WorkshopSessionCard';
import { Summit2026ScheduleSection } from '@/components/summit2026/Summit2026ScheduleSection';
import type { Summit2026ProgramBookGetText } from '@/components/summit2026/summit2026ProgramBookTypes';

export type { Summit2026ProgramBookGetText };

type Summit2026ProgramBookContentProps = {
  getText: Summit2026ProgramBookGetText;
  /** When true, hides the red SOLD OUT banner (e.g. /2026 program book page). Default false. */
  hideSoldOut?: boolean;
  /** When true, shows "Program book" under the Summit 2026 title row. */
  showProgramBookSubtitle?: boolean;
  /** When true, shows the full two-day schedule block (intended for /2026 program book only). Default true. */
  showSchedule?: boolean;
  /** When true (homepage), shows SLxAI × BU hero image between SOLD OUT and sponsors; bottom-of-section hero is omitted to avoid duplication. */
  showLandingBuHeroImage?: boolean;
  /** When false, workshop cards do not link to /2026/workshop/:slug (homepage before program book is public). Default true. */
  linkWorkshopCardsToProgramBook?: boolean;
};

const Summit2026ProgramBookContent = ({
  getText,
  hideSoldOut = false,
  showProgramBookSubtitle = false,
  showSchedule = true,
  showLandingBuHeroImage = false,
  linkWorkshopCardsToProgramBook = true,
}: Summit2026ProgramBookContentProps) => {
  const [isAboutSummitExpanded, setIsAboutSummitExpanded] = useState(false);
  const [isWorkshopPanelExpanded, setIsWorkshopPanelExpanded] = useState(false);
  const sponsors = SUMMIT_SPONSORS;
  const workshopsInScheduleOrder = getSummit2026WorkshopsInScheduleOrder();

  return (
    <>
      {/* Summit Section */}
      <section id="summit" className="py-4 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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

          {showLandingBuHeroImage ? (
            <div className="mb-8">
              <img
                src="/slxai-bu-hero.png"
                alt="SLxAI Summit at Boston University"
                className="w-full h-auto rounded-lg shadow-lg"
              />
            </div>
          ) : null}

          {/* Sponsors */}
          <div className="mb-8">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl px-8 py-4 border-2 border-electric-blue/20">
              <h3 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-4">
                Our Sponsors
              </h3>
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
              <div className="relative overflow-hidden h-80 sm:h-72 w-full">
                <div 
                  className="md:hidden flex h-full items-center"
                  style={{ 
                    width: 'calc(100% * 36)',
                    animation: 'scrollSponsorsMobile 26.4s linear infinite'
                  }}
                >
                  {[...sponsors, ...sponsors, ...sponsors].map((sponsor, index) => {
                    let logoSize = "max-h-48";
                    if (sponsor.name === 'Kara Technologies') {
                      logoSize = "max-h-80";
                    } else if (sponsor.name === 'ASL Flurry') {
                      logoSize = "max-h-64";
                    } else if (
                      sponsor.name === 'alangu' ||
                      sponsor.name === 'GLWMax' ||
                      sponsor.name === 'Microsoft' ||
                      sponsor.name === 'Nagish' ||
                      sponsor.name === 'TCS Interpreting & Captions' ||
                      sponsor.name === 'MCDHH'
                    ) {
                      logoSize = "max-h-80";
                    }
                    return (
                      <div
                        key={`${sponsor.name}-mobile-${index}`}
                        className="flex items-center justify-center px-4 shrink-0"
                        style={{ width: 'calc(100% / 36)', minWidth: 'calc(100% / 36)', maxWidth: 'calc(100% / 36)' }}
                      >
                        <a
                          href={sponsor.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center hover:opacity-80 transition-opacity"
                        >
                          <img
                            src={sponsor.logo}
                            alt={sponsor.name}
                            className={`${logoSize} w-auto object-contain`}
                          />
                        </a>
                      </div>
                    );
                  })}
                </div>
                <div 
                  className="hidden md:flex h-full items-center"
                  style={{ 
                    width: 'calc(100% * 36 / 3)',
                    animation: 'scrollSponsors 26.4s linear infinite'
                  }}
                >
                  {[...sponsors, ...sponsors, ...sponsors].map((sponsor, index) => {
                    let logoSize = "max-h-32";
                    if (sponsor.name === 'Kara Technologies') {
                      logoSize = "max-h-64";
                    } else if (sponsor.name === 'ASL Flurry') {
                      logoSize = "max-h-48";
                    } else if (
                      sponsor.name === 'alangu' ||
                      sponsor.name === 'GLWMax' ||
                      sponsor.name === 'Microsoft' ||
                      sponsor.name === 'Nagish' ||
                      sponsor.name === 'TCS Interpreting & Captions' ||
                      sponsor.name === 'MCDHH'
                    ) {
                      logoSize = "max-h-64";
                    }
                    return (
                      <div
                        key={`${sponsor.name}-desktop-${index}`}
                        className="flex items-center justify-center px-4 shrink-0"
                        style={{ width: 'calc(100% / 36)', minWidth: 'calc(100% / 36)', maxWidth: 'calc(100% / 36)' }}
                      >
                        <a
                          href={sponsor.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center hover:opacity-80 transition-opacity"
                        >
                          <img
                            src={sponsor.logo}
                            alt={sponsor.name}
                            className={`${logoSize} w-auto object-contain`}
                          />
                        </a>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            {showSchedule ? <Summit2026ScheduleSection getText={getText} /> : null}

            <Card className="border border-gray-200 dark:border-gray-700 shadow-xl md:col-span-2 overflow-hidden rounded-lg">
              <CardHeader 
                className={`bg-electric-blue text-white text-center py-2 cursor-pointer md:cursor-default ${isAboutSummitExpanded ? 'rounded-t-lg' : 'rounded-lg'} md:rounded-t-lg`}
                onClick={() => setIsAboutSummitExpanded(!isAboutSummitExpanded)}
              >
                <div className="flex items-center justify-center gap-2">
                  <CardTitle className="text-white text-4xl font-bold">{getText('aboutSummitTitle', 'About Summit 2026')}</CardTitle>
                  <ChevronDown className={`h-6 w-6 text-white transition-transform md:hidden ${isAboutSummitExpanded ? 'rotate-180' : ''}`} />
                </div>
              </CardHeader>
              <CardContent className={`space-y-4 pt-4 pb-0 md:block ${isAboutSummitExpanded ? 'block' : 'hidden'}`}>
                <div className="space-y-4 text-gray-700 dark:text-white leading-relaxed">
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{getText('overviewTitle', 'SLxAI Summit 2026 Overview')}</h3>
                    <p>
                      {getText('overviewText', 'SLxAI Summit 2026 brings global researchers, companies, and Deaf led innovators together at Boston University. The summit focuses on the future of sign language AI, ethical design, multilingual access, and collaboration across the international ecosystem.')}
                    </p>
                  </div>

                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{getText('hostTitle', 'Host')}</h3>
                    <p>
                      {getText('hostText', 'The summit is held at Boston University. The Deaf Center at BU, directed by Naomi Caselli, supports research in sign language linguistics, Deaf studies, and technology. It serves as a core partner for this event and strengthens the summit with its academic and community expertise.')}
                    </p>
                  </div>

                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{getText('programFormatTitle', 'Program Format')}</h3>
                    <p>
                      {getText('programFormatText', 'The event is built around plenary sessions. All attendees share the same room for every talk, demo, and panel. This format ensures everyone hears the same discussions and engages in the same conversations without splitting the audience. Presenter teams come from universities, companies, and Deaf led organizations. The summit features 20 workshops and panels.')}
                    </p>
                  </div>
                </div>

                {/* Master of Ceremonies â€” above Workshops & Panels */}
                <div className="border-2 border-electric-blue rounded-lg shadow-lg bg-white dark:bg-white overflow-hidden mb-4">
                  <div className="bg-electric-blue text-white text-center py-2">
                    <h3 className="text-2xl sm:text-3xl font-bold text-white">Master of Ceremonies</h3>
                  </div>
                  <div className="px-4 py-6 text-center">
                    <p className="text-lg sm:text-xl text-gray-700 dark:text-white leading-relaxed">
                      <strong className="text-gray-900 dark:text-white">Andrew Bottoms</strong>
                      {' '}and{' '}
                      <strong className="text-gray-900 dark:text-white">Dr. Barbara Spiecker</strong>
                      , Boston University
                    </p>
                  </div>
                </div>

                {/* Workshop Panel - Desktop only (inside About Summit) */}
                <div className="-mx-6 -mt-4 -mb-6 hidden md:block">
                  <div className="bg-electric-blue text-white text-center py-2">
                    <h3 className="text-4xl font-bold text-white">
                      {getText('workshopListTitle', 'Workshops & Panels')}
                    </h3>
                  </div>
                  <div className="bg-blue-50 dark:bg-blue-900/20 px-6 pt-4 pb-6">
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
                </div>
              </CardContent>
            </Card>

            {/* Workshop Panel Section - Mobile Only */}
            <Card className="border border-gray-200 dark:border-gray-700 shadow-xl md:hidden overflow-hidden rounded-lg">
              <CardHeader 
                className={`bg-electric-blue text-white text-center py-2 cursor-pointer ${isWorkshopPanelExpanded ? 'rounded-t-lg' : 'rounded-lg'}`}
                onClick={() => setIsWorkshopPanelExpanded(!isWorkshopPanelExpanded)}
              >
                <div className="flex items-center justify-center gap-2">
                  <CardTitle className="text-white text-4xl font-bold">
                    {getText('workshopListTitle', 'Workshops & Panels')}
                  </CardTitle>
                  <ChevronDown className={`h-6 w-6 text-white transition-transform ${isWorkshopPanelExpanded ? 'rotate-180' : ''}`} />
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
          </div>

          <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            <div className="space-y-4">
              <div className="border-2 border-electric-blue rounded-lg shadow-xl bg-white overflow-hidden">
                <div className="bg-electric-blue text-white text-center py-1 rounded-t-lg">
                  <h3 className="text-xl font-bold text-white">
                    {getText('dateTimeTitle', 'Date & Time')}
                  </h3>
                </div>
                <div className="p-4">
                  <div className="text-center text-gray-700 dark:text-white">
                    <p>
                      <strong>{getText('date', 'Date:')}</strong> {getText('dateValue', 'April 16-17, 2026')}<br />
                      <strong>{getText('conferenceHours', 'Conference Hours:')}</strong>{' '}
                      {getText('conferenceHoursValue', '8:45 AM – 5:10 PM (see schedule below)')}
                    </p>
                  </div>
                </div>
              </div>

              <div className="border-2 border-electric-blue rounded-lg shadow-xl bg-white overflow-hidden">
                <div className="bg-electric-blue text-white text-center py-1 rounded-t-lg">
                  <h3 className="text-xl font-bold text-white">{getText('locationTitle', 'Location')}</h3>
                </div>
                <div className="p-4">
                  <div className="text-center dark:text-white text-gray-700">
                    <strong>{getText('venue', 'Venue:')}</strong> {getText('venueValue', 'Boston University')}<br />
                    <strong>Location:</strong> Metcalf Trustee Center Ballroom (9th Floor)<br />
                    <strong>Building:</strong> Boston University Questrom School of Business<br />
                    <strong>{getText('city', 'City:')}</strong> {getText('cityValue', 'Boston, Massachusetts')}<br />
                    <strong>{getText('address', 'Address:')}</strong> 1 Silber Way<br />
                    Boston, MA 02215<br />
                    <p className="text-xs mt-3 text-gray-600 dark:text-gray-400 italic">
                      <strong>Important:</strong> Please enter through the side entrance at One Silber Way. Do not use the 595 Commonwealth Ave entrance.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-2 border-electric-blue rounded-lg p-4 h-full flex flex-col shadow-xl bg-white">
              <div className="w-full rounded-lg overflow-hidden flex-1" style={{ minHeight: '300px' }}>
                <iframe
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

          {!showLandingBuHeroImage ? (
            <div className="mt-10">
              <img
                src="/slxai-bu-hero.png"
                alt="SLxAI Summit at Boston University"
                className="w-full h-auto rounded-lg shadow-lg"
              />
            </div>
          ) : null}
        </div>
      </section>
    </>
  );
};

export default Summit2026ProgramBookContent;
