import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Scale, Users, Shield, AlertCircle, CheckCircle } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useEffect, useState } from 'react';

export default function Terms() {
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
        agreementTitle: 'Agreement to Terms',
        agreementText1: 'By accessing or using the SLxAI Cooperative Member Portal ("Service"), you agree to be bound by these Terms of Service ("Terms"). If you disagree with any part of these terms, you may not access the Service.',
        agreementText2: 'These Terms apply to all visitors, users, and others who access or use the Service.',
        membershipTitle: 'Membership and Eligibility',
        membershipText: 'To use the Service, you must:',
        membershipItem1: 'Be a member organization of SLxAI Cooperative',
        membershipItem2: 'Have been granted access credentials by an authorized administrator',
        membershipItem3: 'Be at least 18 years of age',
        membershipItem4: 'Provide accurate and complete information when registering',
        membershipItem5: 'Maintain the security of your account credentials',
        membershipRevoked: 'Membership may be revoked for violation of these Terms or cooperative policies.',
        conductTitle: 'User Conduct',
        conductText: 'You agree not to:',
        conductItem1: 'Use the Service for any illegal or unauthorized purpose',
        conductItem2: 'Violate any laws in your jurisdiction',
        conductItem3: 'Transmit any viruses, malware, or harmful code',
        conductItem4: 'Attempt to gain unauthorized access to the Service or related systems',
        conductItem5: 'Interfere with or disrupt the Service or servers',
        conductItem6: 'Harass, abuse, or harm other members',
        conductItem7: 'Post false, misleading, or defamatory content',
        conductItem8: 'Violate intellectual property rights of others',
        conductItem9: 'Spam or send unsolicited communications',
        conductItem10: 'Use automated systems to access the Service without permission',
        contentTitle: 'Content and Intellectual Property',
        yourContentTitle: 'Your Content',
        yourContentText: 'You retain ownership of any content you post, upload, or share through the Service. By posting content, you grant SLxAI Cooperative a non-exclusive, worldwide, royalty-free license to use, display, and distribute your content within the Service for the purposes of facilitating cooperative activities.',
        ourContentTitle: 'Our Content',
        ourContentText: 'The Service and its original content, features, and functionality are owned by SLxAI Cooperative and are protected by international copyright, trademark, patent, trade secret, and other intellectual property laws.',
        votingTitle: 'Voting and Governance',
        votingText: 'The Service facilitates voting and governance processes for the cooperative. By participating in votes:',
        votingItem1: 'You agree to vote in good faith and in accordance with cooperative bylaws',
        votingItem2: 'Each member organization has one vote, cast by their designated voting representative',
        votingItem3: 'Vote results are final and binding',
        votingItem4: 'You may not attempt to manipulate or interfere with voting processes',
        votingItem5: 'Voting records may be maintained for transparency and record-keeping',
        privacyTitle: 'Privacy and Data',
        privacyText1: 'Your use of the Service is also governed by our Privacy Policy. Please review our Privacy Policy to understand our practices regarding your personal information.',
        privacyText2: 'You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.',
        disclaimerTitle: 'Disclaimers',
        disclaimerText1: 'THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, OR NON-INFRINGEMENT.',
        disclaimerText2: 'We do not warrant that the Service will be uninterrupted, secure, or error-free, or that defects will be corrected.',
        liabilityTitle: 'Limitation of Liability',
        liabilityText: 'TO THE MAXIMUM EXTENT PERMITTED BY LAW, SLxAI COOPERATIVE SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS OR REVENUES, WHETHER INCURRED DIRECTLY OR INDIRECTLY, OR ANY LOSS OF DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES RESULTING FROM YOUR USE OF THE SERVICE.',
        terminationTitle: 'Termination',
        terminationText1: 'We may terminate or suspend your access to the Service immediately, without prior notice or liability, for any reason, including if you breach these Terms.',
        terminationText2: 'Upon termination, your right to use the Service will cease immediately. All provisions of these Terms that by their nature should survive termination shall survive termination.',
        governingTitle: 'Governing Law',
        governingText1: 'These Terms shall be governed and construed in accordance with the laws of the jurisdiction in which SLxAI Cooperative is incorporated, without regard to its conflict of law provisions.',
        governingText2: 'Any disputes arising from these Terms or the Service shall be resolved through binding arbitration or in the courts of the cooperative\'s jurisdiction.',
        changesTitle: 'Changes to Terms',
        changesText1: 'We reserve the right to modify or replace these Terms at any time. If a revision is material, we will provide at least 30 days notice prior to any new terms taking effect.',
        changesText2: 'What constitutes a material change will be determined at our sole discretion. Continued use of the Service after any changes constitutes acceptance of the new Terms.',
        contactTitle: 'Contact Information',
        contactText: 'If you have any questions about these Terms of Service, please contact us:',
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
          <Scale className="h-8 w-8 text-electric-blue dark:text-white" />
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">{t('common.termsOfService')}</h1>
        </div>
        <p className="text-gray-600 dark:text-gray-400">{getText('lastUpdated', 'Last updated: November 18, 2024')}</p>
      </div>

      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 dark:text-white">
            <FileText className="h-5 w-5 text-electric-blue dark:text-white" />
            {getText('agreementTitle', 'Agreement to Terms')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-gray-700 dark:text-gray-300">
          <p>
            {getText('agreementText1', 'By accessing or using the SLxAI Cooperative Member Portal ("Service"), you agree to be bound by these Terms of Service ("Terms"). If you disagree with any part of these terms, you may not access the Service.')}
          </p>
          <p>
            {getText('agreementText2', 'These Terms apply to all visitors, users, and others who access or use the Service.')}
          </p>
        </CardContent>
      </Card>

      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 dark:text-white">
            <Users className="h-5 w-5 text-electric-blue dark:text-white" />
            {getText('membershipTitle', 'Membership and Eligibility')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-gray-700 dark:text-gray-300">
          <p>{getText('membershipText', 'To use the Service, you must:')}</p>
          <ul className="list-disc list-inside space-y-2 ml-4">
            <li>{getText('membershipItem1', 'Be a member organization of SLxAI Cooperative')}</li>
            <li>{getText('membershipItem2', 'Have been granted access credentials by an authorized administrator')}</li>
            <li>{getText('membershipItem3', 'Be at least 18 years of age')}</li>
            <li>{getText('membershipItem4', 'Provide accurate and complete information when registering')}</li>
            <li>{getText('membershipItem5', 'Maintain the security of your account credentials')}</li>
          </ul>
          <p className="mt-4">
            {getText('membershipRevoked', 'Membership may be revoked for violation of these Terms or cooperative policies.')}
          </p>
        </CardContent>
      </Card>

      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 dark:text-white">
            <Shield className="h-5 w-5 text-electric-blue dark:text-white" />
            {getText('conductTitle', 'User Conduct')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-gray-700 dark:text-gray-300">
          <p>{getText('conductText', 'You agree not to:')}</p>
          <ul className="list-disc list-inside space-y-2 ml-4">
            <li>{getText('conductItem1', 'Use the Service for any illegal or unauthorized purpose')}</li>
            <li>{getText('conductItem2', 'Violate any laws in your jurisdiction')}</li>
            <li>{getText('conductItem3', 'Transmit any viruses, malware, or harmful code')}</li>
            <li>{getText('conductItem4', 'Attempt to gain unauthorized access to the Service or related systems')}</li>
            <li>{getText('conductItem5', 'Interfere with or disrupt the Service or servers')}</li>
            <li>{getText('conductItem6', 'Harass, abuse, or harm other members')}</li>
            <li>{getText('conductItem7', 'Post false, misleading, or defamatory content')}</li>
            <li>{getText('conductItem8', 'Violate intellectual property rights of others')}</li>
            <li>{getText('conductItem9', 'Spam or send unsolicited communications')}</li>
            <li>{getText('conductItem10', 'Use automated systems to access the Service without permission')}</li>
          </ul>
        </CardContent>
      </Card>

      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="dark:text-white">{getText('contentTitle', 'Content and Intellectual Property')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-gray-700 dark:text-gray-300">
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{getText('yourContentTitle', 'Your Content')}</h3>
            <p>
              {getText('yourContentText', 'You retain ownership of any content you post, upload, or share through the Service. By posting content, you grant SLxAI Cooperative a non-exclusive, worldwide, royalty-free license to use, display, and distribute your content within the Service for the purposes of facilitating cooperative activities.')}
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{getText('ourContentTitle', 'Our Content')}</h3>
            <p>
              {getText('ourContentText', 'The Service and its original content, features, and functionality are owned by SLxAI Cooperative and are protected by international copyright, trademark, patent, trade secret, and other intellectual property laws.')}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="dark:text-white">{getText('votingTitle', 'Voting and Governance')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-gray-700 dark:text-gray-300">
          <p>
            {getText('votingText', 'The Service facilitates voting and governance processes for the cooperative. By participating in votes:')}
          </p>
          <ul className="list-disc list-inside space-y-2 ml-4">
            <li>{getText('votingItem1', 'You agree to vote in good faith and in accordance with cooperative bylaws')}</li>
            <li>{getText('votingItem2', 'Each member organization has one vote, cast by their designated voting representative')}</li>
            <li>{getText('votingItem3', 'Vote results are final and binding')}</li>
            <li>{getText('votingItem4', 'You may not attempt to manipulate or interfere with voting processes')}</li>
            <li>{getText('votingItem5', 'Voting records may be maintained for transparency and record-keeping')}</li>
          </ul>
        </CardContent>
      </Card>

      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="dark:text-white">{getText('privacyTitle', 'Privacy and Data')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-gray-700 dark:text-gray-300">
          <p>
            {getText('privacyText1', 'Your use of the Service is also governed by our Privacy Policy. Please review our Privacy Policy to understand our practices regarding your personal information.')}
          </p>
          <p>
            {getText('privacyText2', 'You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.')}
          </p>
        </CardContent>
      </Card>

      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 dark:text-white">
            <AlertCircle className="h-5 w-5 text-electric-blue dark:text-white" />
            {getText('disclaimerTitle', 'Disclaimers')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-gray-700 dark:text-gray-300">
          <p>
            {getText('disclaimerText1', 'THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, OR NON-INFRINGEMENT.')}
          </p>
          <p>
            {getText('disclaimerText2', 'We do not warrant that the Service will be uninterrupted, secure, or error-free, or that defects will be corrected.')}
          </p>
        </CardContent>
      </Card>

      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="dark:text-white">{getText('liabilityTitle', 'Limitation of Liability')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-gray-700 dark:text-gray-300">
          <p>
            {getText('liabilityText', 'TO THE MAXIMUM EXTENT PERMITTED BY LAW, SLxAI COOPERATIVE SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS OR REVENUES, WHETHER INCURRED DIRECTLY OR INDIRECTLY, OR ANY LOSS OF DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES RESULTING FROM YOUR USE OF THE SERVICE.')}
          </p>
        </CardContent>
      </Card>

      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="dark:text-white">{getText('terminationTitle', 'Termination')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-gray-700 dark:text-gray-300">
          <p>
            {getText('terminationText1', 'We may terminate or suspend your access to the Service immediately, without prior notice or liability, for any reason, including if you breach these Terms.')}
          </p>
          <p>
            {getText('terminationText2', 'Upon termination, your right to use the Service will cease immediately. All provisions of these Terms that by their nature should survive termination shall survive termination.')}
          </p>
        </CardContent>
      </Card>

      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="dark:text-white">{getText('governingTitle', 'Governing Law')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-gray-700 dark:text-gray-300">
          <p>
            {getText('governingText1', 'These Terms shall be governed and construed in accordance with the laws of the jurisdiction in which SLxAI Cooperative is incorporated, without regard to its conflict of law provisions.')}
          </p>
          <p>
            {getText('governingText2', 'Any disputes arising from these Terms or the Service shall be resolved through binding arbitration or in the courts of the cooperative\'s jurisdiction.')}
          </p>
        </CardContent>
      </Card>

      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="dark:text-white">{getText('changesTitle', 'Changes to Terms')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-gray-700 dark:text-gray-300">
          <p>
            {getText('changesText1', 'We reserve the right to modify or replace these Terms at any time. If a revision is material, we will provide at least 30 days notice prior to any new terms taking effect.')}
          </p>
          <p>
            {getText('changesText2', 'What constitutes a material change will be determined at our sole discretion. Continued use of the Service after any changes constitutes acceptance of the new Terms.')}
          </p>
        </CardContent>
      </Card>

      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 dark:text-white">
            <CheckCircle className="h-5 w-5 text-electric-blue dark:text-white" />
            {getText('contactTitle', 'Contact Information')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-gray-700 dark:text-gray-300">
          <p>{getText('contactText', 'If you have any questions about these Terms of Service, please contact us:')}</p>
          <div className="space-y-2">
            <p><strong className="dark:text-white">{getText('email', 'Email:')}</strong> <span className="dark:text-gray-300">legal@slxai.org</span></p>
            <p><strong className="dark:text-white">{getText('address', 'Address:')}</strong> <span className="dark:text-gray-300">SLxAI Cooperative</span></p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

