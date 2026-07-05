import { useState, useEffect, useCallback } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { PublicPageShell } from '@/components/public-design/PublicPageShell';
import { HomePageContent } from '@/components/public-design/HomePageContent';

const METRICOOL_HASH = 'ac83e2d5ea5afb1178d6b5f3f3b451d5';
const METRICOOL_SCRIPT_SRC = 'https://tracker.metricool.com/resources/be.js';
const METRICOOL_SCRIPT_ATTR = 'data-metricool-be';

function initMetricoolTracker() {
  window.beTracker?.t({ hash: METRICOOL_HASH });
}

const TRANSLATION_KEYS: Record<string, string> = {
  heroTitlePart1: 'Advancing the ',
  heroTitlePart2: 'Sign Language ',
  heroTitlePart3: 'Community with',
  heroTitlePart4: 'AI',
  heroDescription:
    'SLxAI unites industry leaders, researchers, and deaf communities worldwide to build ethical, accessible sign language AI through collaboration, not competition.',
  aboutTitle: 'Building the future together',
  aboutDescription:
    'A cooperative nonprofit where every member organization has a voice in ethical sign language AI development.',
  missionTitle: 'Mission',
  missionText:
    'To unite industry leaders through a cooperative nonprofit structure, establishing ethical standards and driving innovation in sign language × AI technologies through equal representation and collaborative decision-making.',
  visionTitle: 'Vision',
  visionText:
    'A world where sign language × AI technologies are developed through industry-wide collaboration, with each company having an equal voice in shaping the future of accessible technology.',
  goalsTitle: 'Goals',
  goal1: 'Establish cooperative nonprofit structure',
  goal2: 'Create industry-wide ethical standards',
  goal3: 'Foster collaborative innovation',
  goal4: 'Ensure equal company representation',
  academySectionTitle: 'SLxAI Academy',
  academySectionWord: 'Academy',
  academyFeatureTitleBefore: 'Learn AI in ',
  academyFeatureTitleHighlight: 'Sign Language',
  academyFeatureSubtitle:
    'Learn practical AI skills from industry experts through live, interactive workshops in sign language.',
  academyTrackBeginners: 'AI for Beginners',
  academyTrackWebsites: 'Build Websites with AI',
  academyTrackVideos: 'Create Videos with AI',
  academyTrackApps: 'Build AI Apps',
  academyTrackBusiness: 'AI for Business',
  academyTrackPrompt: 'Prompt Engineering',
  academyTrackAccessibility: 'AI for Accessibility',
  academyTrackAgents: 'AI Agents 101',
  academySectionCta: 'Explore SLxAI Academy',
  academyPresenterCta: 'Become a Presenter',
  summitPastEventLabel: 'Past Event',
  summitSectionTitle: 'SLxAI Summit 2026',
  summitSectionBody:
    'Our inaugural summit has concluded. Explore the full program in the archive.',
  summitSectionCta: 'View Summit 2026 Archive',
};

const Index = () => {
  const { language, translate } = useLanguage();
  const [translatedContent, setTranslatedContent] = useState<Record<string, string>>({});

  useEffect(() => {
    const translateSections = async () => {
      if (language === 'en') {
        setTranslatedContent({});
        return;
      }
      const entries = await Promise.all(
        Object.entries(TRANSLATION_KEYS).map(async ([key, text]) => {
          const translated = await translate(text);
          return [key, translated] as const;
        }),
      );
      setTranslatedContent(Object.fromEntries(entries));
    };
    translateSections();
  }, [language, translate]);

  const getText = useCallback(
    (key: string, fallback: string) => translatedContent[key] ?? fallback,
    [translatedContent],
  );

  useEffect(() => {
    const existing = document.querySelector<HTMLScriptElement>(`script[${METRICOOL_SCRIPT_ATTR}]`);
    if (existing) {
      initMetricoolTracker();
      return;
    }
    const head = document.getElementsByTagName('head')[0];
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = METRICOOL_SCRIPT_SRC;
    script.setAttribute(METRICOOL_SCRIPT_ATTR, '1');
    const run = () => initMetricoolTracker();
    script.onreadystatechange = run;
    script.onload = run;
    head.appendChild(script);
  }, []);

  return (
    <PublicPageShell>
      <HomePageContent getText={getText} />
    </PublicPageShell>
  );
};

export default Index;
