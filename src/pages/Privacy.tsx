import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Lock, Eye, FileText, Mail } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useEffect, useState } from 'react';

export default function Privacy() {
  const { t, translate, language } = useLanguage();
  const [translatedContent, setTranslatedContent] = useState<Record<string, string>>({});

  // Translate all content sections
  useEffect(() => {
    const translateSections = async () => {
      if (language === 'en') {
        setTranslatedContent({});
        return;
      }

      const sections = {
        lastUpdated: 'Last updated: November 18, 2024',
        introductionTitle: 'Introduction',
        introductionText1: 'SLxAI Cooperative ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our member portal and services.',
        introductionText2: 'By accessing or using our services, you agree to the collection and use of information in accordance with this policy.',
        informationTitle: 'Information We Collect',
        personalInfoTitle: 'Personal Information',
        personalInfoItem1: 'Name and contact information (email address, phone number)',
        personalInfoItem2: 'Organization name and details',
        personalInfoItem3: 'Country and location information',
        personalInfoItem4: 'Professional title and role',
        personalInfoItem5: 'Profile photos and logos',
        usageInfoTitle: 'Usage Information',
        usageInfoItem1: 'Voting records and participation',
        usageInfoItem2: 'Discussion posts and messages',
        usageInfoItem3: 'File uploads and shared resources',
        usageInfoItem4: 'Access logs and activity timestamps',
        howWeUseTitle: 'How We Use Your Information',
        howWeUseText: 'We use the collected information for the following purposes:',
        howWeUseItem1: 'To provide and maintain our member portal services',
        howWeUseItem2: 'To facilitate voting and governance processes',
        howWeUseItem3: 'To enable member-to-member communication and collaboration',
        howWeUseItem4: 'To maintain the member directory and profiles',
        howWeUseItem5: 'To send important notifications and updates',
        howWeUseItem6: 'To improve our services and user experience',
        howWeUseItem7: 'To comply with legal obligations',
        sharingTitle: 'Information Sharing and Disclosure',
        sharingText: 'We do not sell, trade, or rent your personal information to third parties. We may share your information only in the following circumstances:',
        sharingLabel1: 'With Other Members:',
        sharingItem1Text: 'Your organization name, country, and contact information are visible to other members in the directory as part of the cooperative\'s transparency.',
        sharingLabel2: 'Service Providers:',
        sharingItem2Text: 'We may share information with trusted service providers who assist in operating our platform, subject to confidentiality agreements.',
        sharingLabel3: 'Legal Requirements:',
        sharingItem3Text: 'We may disclose information if required by law or in response to valid legal requests.',
        sharingLabel4: 'With Your Consent:',
        sharingItem4Text: 'We may share information with your explicit consent.',
        securityTitle: 'Data Security',
        securityText1: 'We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the Internet or electronic storage is 100% secure.',
        securityText2: 'We use industry-standard security practices including encryption, secure authentication, and regular security assessments.',
        rightsTitle: 'Your Rights',
        rightsText: 'You have the right to:',
        rightsItem1: 'Access and review your personal information',
        rightsItem2: 'Request correction of inaccurate information',
        rightsItem3: 'Request deletion of your information (subject to legal and operational requirements)',
        rightsItem4: 'Opt-out of certain communications',
        rightsItem5: 'Export your data',
        rightsContact: 'To exercise these rights, please contact us using the information provided below.',
        cookiesTitle: 'Cookies and Tracking',
        cookiesText: 'We use cookies and similar tracking technologies to maintain your session, remember your preferences, and improve our services. You can control cookie settings through your browser preferences.',
        childrenTitle: 'Children\'s Privacy',
        childrenText: 'Our services are not directed to individuals under the age of 18. We do not knowingly collect personal information from children.',
        changesTitle: 'Changes to This Privacy Policy',
        changesText1: 'We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date.',
        changesText2: 'You are advised to review this Privacy Policy periodically for any changes.',
        contactTitle: 'Contact Us',
        contactText: 'If you have any questions about this Privacy Policy, please contact us:',
        email: 'Email:',
        address: 'Address:',
      };

      const translated: Record<string, string> = {};
      for (const [key, value] of Object.entries(sections)) {
        translated[key] = await translate(value);
      }
      setTranslatedContent(translated);
    };

    translateSections();
  }, [language, translate]);

  const getText = (key: string, fallback: string) => {
    return translatedContent[key] || fallback;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2">
          <Shield className="h-8 w-8 text-electric-blue dark:text-white" />
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">{t('common.privacyPolicy')}</h1>
        </div>
        <p className="text-gray-600 dark:text-gray-400">{getText('lastUpdated', 'Last updated: November 18, 2024')}</p>
      </div>

      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 dark:text-white">
            <Lock className="h-5 w-5 text-electric-blue dark:text-white" />
            {getText('introductionTitle', 'Introduction')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-gray-700 dark:text-gray-300">
          <p>
            {getText('introductionText1', 'SLxAI Cooperative ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our member portal and services.')}
          </p>
          <p>
            {getText('introductionText2', 'By accessing or using our services, you agree to the collection and use of information in accordance with this policy.')}
          </p>
        </CardContent>
      </Card>

      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 dark:text-white">
            <Eye className="h-5 w-5 text-electric-blue dark:text-white" />
            {getText('informationTitle', 'Information We Collect')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-gray-700 dark:text-gray-300">
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{getText('personalInfoTitle', 'Personal Information')}</h3>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>{getText('personalInfoItem1', 'Name and contact information (email address, phone number)')}</li>
              <li>{getText('personalInfoItem2', 'Organization name and details')}</li>
              <li>{getText('personalInfoItem3', 'Country and location information')}</li>
              <li>{getText('personalInfoItem4', 'Professional title and role')}</li>
              <li>{getText('personalInfoItem5', 'Profile photos and logos')}</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{getText('usageInfoTitle', 'Usage Information')}</h3>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>{getText('usageInfoItem1', 'Voting records and participation')}</li>
              <li>{getText('usageInfoItem2', 'Discussion posts and messages')}</li>
              <li>{getText('usageInfoItem3', 'File uploads and shared resources')}</li>
              <li>{getText('usageInfoItem4', 'Access logs and activity timestamps')}</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 dark:text-white">
            <FileText className="h-5 w-5 text-electric-blue dark:text-white" />
            {getText('howWeUseTitle', 'How We Use Your Information')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-gray-700 dark:text-gray-300">
          <p>{getText('howWeUseText', 'We use the collected information for the following purposes:')}</p>
          <ul className="list-disc list-inside space-y-2 ml-4">
            <li>{getText('howWeUseItem1', 'To provide and maintain our member portal services')}</li>
            <li>{getText('howWeUseItem2', 'To facilitate voting and governance processes')}</li>
            <li>{getText('howWeUseItem3', 'To enable member-to-member communication and collaboration')}</li>
            <li>{getText('howWeUseItem4', 'To maintain the member directory and profiles')}</li>
            <li>{getText('howWeUseItem5', 'To send important notifications and updates')}</li>
            <li>{getText('howWeUseItem6', 'To improve our services and user experience')}</li>
            <li>{getText('howWeUseItem7', 'To comply with legal obligations')}</li>
          </ul>
        </CardContent>
      </Card>

      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="dark:text-white">{getText('sharingTitle', 'Information Sharing and Disclosure')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-gray-700 dark:text-gray-300">
          <p>{getText('sharingText', 'We do not sell, trade, or rent your personal information to third parties. We may share your information only in the following circumstances:')}</p>
          <ul className="list-disc list-inside space-y-2 ml-4">
            <li><strong className="dark:text-white">{getText('sharingLabel1', 'With Other Members:')}</strong> {getText('sharingItem1Text', 'Your organization name, country, and contact information are visible to other members in the directory as part of the cooperative\'s transparency.')}</li>
            <li><strong className="dark:text-white">{getText('sharingLabel2', 'Service Providers:')}</strong> {getText('sharingItem2Text', 'We may share information with trusted service providers who assist in operating our platform, subject to confidentiality agreements.')}</li>
            <li><strong className="dark:text-white">{getText('sharingLabel3', 'Legal Requirements:')}</strong> {getText('sharingItem3Text', 'We may disclose information if required by law or in response to valid legal requests.')}</li>
            <li><strong className="dark:text-white">{getText('sharingLabel4', 'With Your Consent:')}</strong> {getText('sharingItem4Text', 'We may share information with your explicit consent.')}</li>
          </ul>
        </CardContent>
      </Card>

      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="dark:text-white">{getText('securityTitle', 'Data Security')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-gray-700 dark:text-gray-300">
          <p>
            {getText('securityText1', 'We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the Internet or electronic storage is 100% secure.')}
          </p>
          <p>
            {getText('securityText2', 'We use industry-standard security practices including encryption, secure authentication, and regular security assessments.')}
          </p>
        </CardContent>
      </Card>

      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="dark:text-white">{getText('rightsTitle', 'Your Rights')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-gray-700 dark:text-gray-300">
          <p>{getText('rightsText', 'You have the right to:')}</p>
          <ul className="list-disc list-inside space-y-2 ml-4">
            <li>{getText('rightsItem1', 'Access and review your personal information')}</li>
            <li>{getText('rightsItem2', 'Request correction of inaccurate information')}</li>
            <li>{getText('rightsItem3', 'Request deletion of your information (subject to legal and operational requirements)')}</li>
            <li>{getText('rightsItem4', 'Opt-out of certain communications')}</li>
            <li>{getText('rightsItem5', 'Export your data')}</li>
          </ul>
          <p className="mt-4">
            {getText('rightsContact', 'To exercise these rights, please contact us using the information provided below.')}
          </p>
        </CardContent>
      </Card>

      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="dark:text-white">{getText('cookiesTitle', 'Cookies and Tracking')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-gray-700 dark:text-gray-300">
          <p>
            {getText('cookiesText', 'We use cookies and similar tracking technologies to maintain your session, remember your preferences, and improve our services. You can control cookie settings through your browser preferences.')}
          </p>
        </CardContent>
      </Card>

      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="dark:text-white">{getText('childrenTitle', 'Children\'s Privacy')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-gray-700 dark:text-gray-300">
          <p>
            {getText('childrenText', 'Our services are not directed to individuals under the age of 18. We do not knowingly collect personal information from children.')}
          </p>
        </CardContent>
      </Card>

      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="dark:text-white">{getText('changesTitle', 'Changes to This Privacy Policy')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-gray-700 dark:text-gray-300">
          <p>
            {getText('changesText1', 'We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date.')}
          </p>
          <p>
            {getText('changesText2', 'You are advised to review this Privacy Policy periodically for any changes.')}
          </p>
        </CardContent>
      </Card>

      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 dark:text-white">
            <Mail className="h-5 w-5 text-electric-blue dark:text-white" />
            {getText('contactTitle', 'Contact Us')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-gray-700 dark:text-gray-300">
          <p>{getText('contactText', 'If you have any questions about this Privacy Policy, please contact us:')}</p>
          <div className="space-y-2">
            <p><strong className="dark:text-white">{getText('email', 'Email:')}</strong> <span className="dark:text-gray-300">privacy@slxai.org</span></p>
            <p><strong className="dark:text-white">{getText('address', 'Address:')}</strong> <span className="dark:text-gray-300">SLxAI Cooperative</span></p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
