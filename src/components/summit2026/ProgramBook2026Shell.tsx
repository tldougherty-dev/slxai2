import '@/styles/programBook2026.css';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, ArrowUp, Globe, Home } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState, useEffect, createContext, useContext, type ReactNode } from 'react';
import { useLanguage, SUPPORTED_LANGUAGES, type Language } from '@/contexts/LanguageContext';
import type { Summit2026ProgramBookGetText } from '@/components/summit2026/summit2026ProgramBookTypes';

const ProgramBook2026GetTextContext = createContext<Summit2026ProgramBookGetText | null>(null);

export function useProgramBook2026GetText(): Summit2026ProgramBookGetText {
  const ctx = useContext(ProgramBook2026GetTextContext);
  if (!ctx) {
    throw new Error('useProgramBook2026GetText must be used within ProgramBook2026Shell');
  }
  return ctx;
}

type Props = {
  children: ReactNode;
  /** Document title (browser tab) */
  documentTitle?: string;
  /**
   * Top-left control: main site home, or back to /2026 program book (e.g. workshop detail pages).
   */
  topLeftNav?: 'home' | 'programBook';
};

/**
 * Shared layout for /2026 program book routes: light mode, translations, Home + language header.
 */
export function ProgramBook2026Shell({
  children,
  documentTitle = 'SLxAI Summit 2026 Program Book | SLxAI',
  topLeftNav = 'home',
}: Props) {
  const { language, setLanguage, translate } = useLanguage();
  const [translatedContent, setTranslatedContent] = useState<Record<string, string>>({});
  const [showBackToTop, setShowBackToTop] = useState(false);

  useEffect(() => {
    document.title = documentTitle;
  }, [documentTitle]);

  useEffect(() => {
    const onScroll = () => setShowBackToTop(window.scrollY > 240);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('dark');
    const observer = new MutationObserver(() => {
      if (root.classList.contains('dark')) {
        root.classList.remove('dark');
      }
    });
    observer.observe(root, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const translateSections = async () => {
      if (language === 'en') {
        setTranslatedContent({});
        return;
      }

      const sections: Record<string, string> = {
        navHome: 'Home',
        navBackProgram: 'Back to program book',
        navBackProgramShort: 'Back',
        backToTop: 'Back to top',
        programBookHeroLine: 'Program book',
        summitTitle: 'Summit 2026',
        dateTimeTitle: 'Date & Time',
        date: 'Date:',
        dateValue: 'April 16-17, 2026',
        conferenceHours: 'Conference Hours:',
        conferenceHoursValue: '8:45 AM to 5:10 PM (see schedule below)',
        scheduleTitle: 'SLxAI Summit Schedule',
        locationTitle: 'Location',
        venue: 'Venue:',
        venueValue: 'Boston University',
        city: 'City:',
        cityValue: 'Boston, Massachusetts',
        aboutSummitTitle: 'About Summit 2026',
        overviewTitle: 'At a glance',
        overviewText:
          'The inaugural SLxAI Summit gathers researchers, industry, Deaf-led organizations, and community partners at Boston University for shared dialogue on sign language and AI: ethics, responsible deployment, data governance, benchmarks, accessibility, and real-world impact. A single plenary program keeps every attendee in the same room for the full agenda, so discussions stay transparent and aligned. The event advances SLxAI’s cooperative nonprofit work, including community engagement around bylaws and long-term governance.',
        hostTitle: 'Hosts',
        hostText:
          'Your hosts are Dr. Naomi Caselli and Travis Dougherty. Dr. Caselli is at Boston University as Director of the Deaf Center, advancing sign language linguistics, Deaf studies, and technology; the university is proud to host the summit on campus. Travis Dougherty convenes SLxAI’s global stakeholder community and co-hosts the gathering alongside Dr. Caselli.',
        masterOfCeremoniesTitle: 'Master of Ceremonies',
        tocNavLabel: 'Table of contents',
        tocTitle: 'Table of contents',
        tocDay1: 'Day 1',
        tocEveningEvent: 'Evening event',
        tocDay2: 'Day 2',
        eveningEventSectionTitle: 'Evening event',
        eveningEventVenue: 'Bleacher Bar at Fenway Park',
        eveningEventWhen: '7:00–10:00 PM · April 16, 2026',
        eveningEventNote: 'Closed to the public for SLxAI summit attendees only.',
        eveningEventPhoto1Alt: 'Bleacher Bar view of Fenway Park field',
        eveningEventPhoto2Alt: 'Bleacher Bar interior',
        tocSponsors: 'Sponsors',
        tocAbout: 'About the Summit',
        tocMasterOfCeremonies: 'Master of Ceremonies',
        tocWelcomeLetter: 'Welcome Letter',
        tocStorySlxai: 'The Story Behind SLxAI',
        tocSummitCommittee: 'Summit Committee',
        welcomeLetterTitle: 'Welcome Letter',
        storySlxaiTitle: 'The Story Behind SLxAI',
        summitCommitteeTitle: 'Summit Committee',
        summitCommitteeIntro:
          'This summit would not be possible without the committee members below. Each contributed in their own way to help ensure a successful event.',
        sponsorsSectionTitle: 'Sponsors',
        sponsorsSectionThankYou:
          'We are grateful to our incredible sponsors for making this summit possible. Without your support, none of this would happen. Thank you to each of you.',
        workshopListTitle: 'Workshops & Panels',
        photoPlaceholder: 'Photo coming soon',
        sessionSummaryHeading: 'Session summary',
        programListingHeading: 'Program listing (short summary)',
        verbatimSubmissionHeading: 'Submitted workshop response (verbatim)',
        verbatimMissing:
          'No verbatim submission text is in the program book data for this session. Add it in src/data/workshopVerbatimFromDocs.json (or WORKSHOP_VERBATIM_RAW_BY_SLUG in summit2026WorkshopVerbatim.ts). Slug: {slug}.',
        workshopDescriptionMissing:
          'No workshop description is in the program book data for this session. Add it in src/data/workshopVerbatimFromDocs.json (or WORKSHOP_VERBATIM_RAW_BY_SLUG in summit2026WorkshopVerbatim.ts). Slug: {slug}.',
        learningObjectiveMissing: 'Not specified in the submitted materials.',
        learningObjectivesHeading: 'Learning objectives',
        additionalInformationHeading: 'Additional information',
      };

      const translated: Record<string, string> = {};
      for (const [key, value] of Object.entries(sections)) {
        translated[key] = await translate(value);
      }
      setTranslatedContent(translated);
    };

    translateSections();
  }, [language, translate]);

  const getText: Summit2026ProgramBookGetText = (key: string, fallback: string) =>
    translatedContent[key] || fallback;

  return (
    <ProgramBook2026GetTextContext.Provider value={getText}>
    <div className="program-book-2026 min-h-screen bg-white" id="main-content" role="main">
      <header
        id="program-book-hero"
        className="sticky top-0 z-[100] flex w-full items-center justify-between gap-3 border-b border-gray-200 bg-white/95 px-4 py-3 backdrop-blur-sm supports-[backdrop-filter]:bg-white/90"
      >
        <Button
          variant="outline"
          size="sm"
          className="h-9 max-w-[min(100%,14rem)] shrink-0 border-electric-blue/40 bg-white text-electric-blue shadow-sm hover:bg-electric-blue/10 hover:text-electric-blue"
          asChild
        >
          {topLeftNav === 'programBook' ? (
            <Link to="/2026" className="inline-flex min-w-0 items-center gap-2">
              <ArrowLeft className="h-4 w-4 shrink-0" aria-hidden />
              <span className="sm:hidden">{getText('navBackProgramShort', 'Back')}</span>
              <span className="hidden truncate sm:inline">{getText('navBackProgram', 'Back to program book')}</span>
            </Link>
          ) : (
            <Link to="/" className="inline-flex items-center gap-2">
              <Home className="h-4 w-4" aria-hidden />
              {getText('navHome', 'Home')}
            </Link>
          )}
        </Button>
        <div className="flex min-w-0 flex-1 justify-end">
          <div className="flex items-center gap-2 rounded-md border border-gray-300 bg-white px-2 py-1 shadow-md dark:border-gray-600 dark:bg-gray-800">
            <Globe className="h-4 w-4 shrink-0 text-gray-700 dark:text-gray-300" aria-hidden />
            <Select value={language} onValueChange={(value) => setLanguage(value as Language)}>
              <SelectTrigger className="h-8 max-w-[min(100%,11rem)] border-gray-300 bg-white text-sm text-gray-900 dark:border-gray-600 dark:bg-gray-800 dark:text-white sm:w-[140px]">
                <SelectValue>
                  <div className="flex min-w-0 items-center gap-1.5">
                    <span className="shrink-0">{SUPPORTED_LANGUAGES.find((l) => l.code === language)?.flag}</span>
                    <span className="truncate">{SUPPORTED_LANGUAGES.find((l) => l.code === language)?.nativeName}</span>
                  </div>
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="z-[200] max-h-[min(300px,70vh)] overflow-y-auto dark:border-gray-600 dark:bg-gray-800">
                {SUPPORTED_LANGUAGES.map((lang) => (
                  <SelectItem key={lang.code} value={lang.code} className="dark:text-white dark:hover:bg-gray-700">
                    <div className="flex items-center gap-2">
                      <span>{lang.flag}</span>
                      <span>{lang.nativeName}</span>
                      <span className="ml-auto text-xs text-gray-500 dark:text-gray-400">({lang.name})</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </header>

      {children}

      {showBackToTop ? (
        <Button
          type="button"
          variant="default"
          size="icon"
          className="fixed z-[110] h-12 w-12 rounded-full border-0 bg-electric-blue text-white shadow-lg transition-opacity hover:bg-electric-blue/90 focus-visible:ring-2 focus-visible:ring-electric-blue focus-visible:ring-offset-2"
          style={{
            bottom: 'max(1.25rem, env(safe-area-inset-bottom, 0px))',
            right: 'max(1.25rem, env(safe-area-inset-right, 0px))',
          }}
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          aria-label={getText('backToTop', 'Back to top')}
        >
          <ArrowUp className="h-6 w-6" aria-hidden />
        </Button>
      ) : null}
    </div>
    </ProgramBook2026GetTextContext.Provider>
  );
}
