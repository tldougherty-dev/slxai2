import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Cookie, Link2, Mail, Settings, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useEffect, useState } from 'react';

export default function CookiePolicy() {
  const { t, translate, language } = useLanguage();
  const [translatedContent, setTranslatedContent] = useState<Record<string, string>>({});

  useEffect(() => {
    const translateSections = async () => {
      if (language === 'en') {
        setTranslatedContent({});
        return;
      }

      const sections = {
        lastUpdated: 'Last updated: April 8, 2026',
        introTitle: 'Introduction',
        introText1:
          'This Cookie Policy explains how SLxAI Cooperative (“we,” “our,” or “us”) uses cookies and similar technologies when you visit our public website (slxai.org) and use our online services, including the member portal.',
        introText2:
          'For more information about how we process personal data, see our Privacy Policy.',
        whatTitle: 'What are cookies?',
        whatText:
          'Cookies are small text files stored on your device when you visit a website. They help the site remember your preferences, keep you signed in where applicable, and understand how the site is used. Similar technologies include local storage and session storage.',
        typesTitle: 'Types of cookies we use',
        essentialTitle: 'Essential',
        essentialText:
          'Required for the site to function—for example, maintaining your session after you log in, security, and load balancing. These cannot be disabled through our site.',
        preferencesTitle: 'Preferences',
        preferencesText:
          'Remember choices you make, such as language selection or theme (light/dark mode), where we offer them.',
        analyticsTitle: 'Analytics and performance',
        analyticsText:
          'We may use limited analytics to understand traffic and improve the site. Where we use third-party analytics, those providers may set their own cookies in accordance with their policies.',
        thirdPartyTitle: 'Third-party services',
        thirdPartyText:
          'Some features of our site rely on service providers (for example, authentication, hosting, or embedded content). Those providers may use cookies or similar technologies as described in their own policies.',
        controlTitle: 'How to control cookies',
        controlText1:
          'You can control or delete cookies through your browser settings. Blocking all cookies may affect functionality such as staying logged in or remembering preferences.',
        controlText2:
          'For more information, see your browser’s help documentation for cookie settings.',
        changesTitle: 'Changes to this policy',
        changesText:
          'We may update this Cookie Policy from time to time. We will post the revised policy on this page and update the “Last updated” date.',
        contactTitle: 'Contact',
        contactText: 'Questions about this Cookie Policy:',
        emailLabel: 'Email:',
      };

      const translated: Record<string, string> = {};
      for (const [key, value] of Object.entries(sections)) {
        translated[key] = await translate(value);
      }
      setTranslatedContent(translated);
    };

    translateSections();
  }, [language, translate]);

  const getText = (key: string, fallback: string) => translatedContent[key] || fallback;

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <div className="flex items-center justify-center gap-2">
          <Cookie className="h-8 w-8 text-electric-blue dark:text-white" aria-hidden />
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">{t('common.cookiePolicy')}</h1>
        </div>
        <p className="text-gray-600 dark:text-gray-400">{getText('lastUpdated', 'Last updated: April 8, 2026')}</p>
      </div>

      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 dark:text-white">
            <Shield className="h-5 w-5 text-electric-blue dark:text-white" />
            {getText('introTitle', 'Introduction')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-gray-700 dark:text-gray-300">
          <p>{getText('introText1', 'This Cookie Policy explains how SLxAI Cooperative (“we,” “our,” or “us”) uses cookies and similar technologies when you visit our public website (slxai.org) and use our online services, including the member portal.')}</p>
          <p>
            {getText('introText2', 'For more information about how we process personal data, see our Privacy Policy.')}{' '}
            <Link to="/privacy" className="font-medium text-electric-blue underline hover:no-underline">
              {t('common.privacyPolicy')}
            </Link>
            .
          </p>
        </CardContent>
      </Card>

      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="dark:text-white">{getText('whatTitle', 'What are cookies?')}</CardTitle>
        </CardHeader>
        <CardContent className="text-gray-700 dark:text-gray-300">
          <p>{getText('whatText', 'Cookies are small text files stored on your device when you visit a website. They help the site remember your preferences, keep you signed in where applicable, and understand how the site is used. Similar technologies include local storage and session storage.')}</p>
        </CardContent>
      </Card>

      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 dark:text-white">
            <Settings className="h-5 w-5 text-electric-blue dark:text-white" />
            {getText('typesTitle', 'Types of cookies we use')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-gray-700 dark:text-gray-300">
          <div>
            <h3 className="mb-2 font-semibold text-gray-900 dark:text-white">{getText('essentialTitle', 'Essential')}</h3>
            <p>{getText('essentialText', 'Required for the site to function—for example, maintaining your session after you log in, security, and load balancing. These cannot be disabled through our site.')}</p>
          </div>
          <div>
            <h3 className="mb-2 font-semibold text-gray-900 dark:text-white">{getText('preferencesTitle', 'Preferences')}</h3>
            <p>{getText('preferencesText', 'Remember choices you make, such as language selection or theme (light/dark mode), where we offer them.')}</p>
          </div>
          <div>
            <h3 className="mb-2 font-semibold text-gray-900 dark:text-white">{getText('analyticsTitle', 'Analytics and performance')}</h3>
            <p>{getText('analyticsText', 'We may use limited analytics to understand traffic and improve the site. Where we use third-party analytics, those providers may set their own cookies in accordance with their policies.')}</p>
          </div>
        </CardContent>
      </Card>

      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 dark:text-white">
            <Link2 className="h-5 w-5 text-electric-blue dark:text-white" />
            {getText('thirdPartyTitle', 'Third-party services')}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-gray-700 dark:text-gray-300">
          <p>{getText('thirdPartyText', 'Some features of our site rely on service providers (for example, authentication, hosting, or embedded content). Those providers may use cookies or similar technologies as described in their own policies.')}</p>
        </CardContent>
      </Card>

      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="dark:text-white">{getText('controlTitle', 'How to control cookies')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-gray-700 dark:text-gray-300">
          <p>{getText('controlText1', 'You can control or delete cookies through your browser settings. Blocking all cookies may affect functionality such as staying logged in or remembering preferences.')}</p>
          <p>{getText('controlText2', 'For more information, see your browser’s help documentation for cookie settings.')}</p>
        </CardContent>
      </Card>

      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="dark:text-white">{getText('changesTitle', 'Changes to this policy')}</CardTitle>
        </CardHeader>
        <CardContent className="text-gray-700 dark:text-gray-300">
          <p>{getText('changesText', 'We may update this Cookie Policy from time to time. We will post the revised policy on this page and update the “Last updated” date.')}</p>
        </CardContent>
      </Card>

      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 dark:text-white">
            <Mail className="h-5 w-5 text-electric-blue dark:text-white" />
            {getText('contactTitle', 'Contact')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-gray-700 dark:text-gray-300">
          <p>{getText('contactText', 'Questions about this Cookie Policy:')}</p>
          <p>
            <strong className="dark:text-white">{getText('emailLabel', 'Email:')}</strong>{' '}
            <a href="mailto:privacy@slxai.org" className="text-electric-blue underline hover:no-underline">
              privacy@slxai.org
            </a>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
