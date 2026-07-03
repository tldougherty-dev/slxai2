import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import Navigation from '@/components/Navigation';
import {
  Calendar,
  Users,
  Globe,
  BookOpen,
  ArrowUp,
  Target,
  Eye,
  Award,
  Star,
  CheckCircle,
  Mail,
  Phone,
  MapPin,
  ExternalLink,
  FileText,
  User,
  Building2,
  Loader2,
  Linkedin,
  Facebook,
  Instagram,
  GraduationCap,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { sanitizeText, isValidLength } from '@/lib/security';
import { useLanguage, SUPPORTED_LANGUAGES } from '@/contexts/LanguageContext';
import { submitTicketReservation, getAvailableTicketCount, getReservedTicketCount } from '@/data/summit2026';

const METRICOOL_HASH = 'ac83e2d5ea5afb1178d6b5f3f3b451d5';
const METRICOOL_SCRIPT_SRC = 'https://tracker.metricool.com/resources/be.js';
const METRICOOL_SCRIPT_ATTR = 'data-metricool-be';

function initMetricoolTracker() {
  window.beTracker?.t({ hash: METRICOOL_HASH });
}

const Index = () => {
  const { toast } = useToast();
  const { language, setLanguage, translate, t } = useLanguage();
  const [translatedContent, setTranslatedContent] = useState<Record<string, string>>({});
  const [isSubmittingTicket, setIsSubmittingTicket] = useState(false);
  const [isTicketSubmitted, setIsTicketSubmitted] = useState(false);
  const [availableTickets, setAvailableTickets] = useState<number>(175);
  const [reservedTickets, setReservedTickets] = useState<number>(0);
  
  const [ticketForm, setTicketForm] = useState({
    name: '',
    email: '',
    phone: '',
    organization: '',
  });

  // Force light mode on homepage
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('dark');
    
    // Monitor and prevent dark mode from being added
    const observer = new MutationObserver(() => {
      if (root.classList.contains('dark')) {
        root.classList.remove('dark');
      }
    });
    
    observer.observe(root, {
      attributes: true,
      attributeFilter: ['class']
    });
    
    return () => {
      observer.disconnect();
    };
  }, []);

  // Load ticket availability on mount
  useEffect(() => {
    const loadTicketAvailability = async () => {
      try {
        const [available, reserved] = await Promise.all([
          getAvailableTicketCount(),
          getReservedTicketCount(),
        ]);
        setAvailableTickets(available);
        setReservedTickets(reserved);
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          console.error('Error loading ticket availability:', error);
        }
      }
    };
    loadTicketAvailability();
  }, []);

  // Load Metricool tracker on landing page (hidden from UI).
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

  // Translate all homepage content
  useEffect(() => {
    const translateSections = async () => {
      if (language === 'en') {
        setTranslatedContent({});
        return;
      }

      const sections = {
        heroTitle1: 'Uniting industry leaders to',
        heroTitle2: 'establish the future of',
        heroTitle3: 'sign language x AI.',
        heroDescription: 'Join us at the inaugural SLxAI Summit where we\'ll bring industry leaders together to form a cooperative nonprofit that will shape the future of sign language x AI technologies.',
        aboutTitle: 'About',
        aboutDescription: 'We are uniting together industry leaders in the sign language x AI space to establish a cooperative nonprofit where each member will have a board seat, ensuring collaborative decision-making and ethical development of sign language x AI technologies.',
        missionTitle: 'Mission',
        missionText: 'To unite industry leaders through a cooperative nonprofit structure, establishing ethical standards and driving innovation in sign language x AI technologies through equal representation and collaborative decision-making.',
        visionTitle: 'Vision',
        visionText: 'A world where sign language x AI technologies are developed through industry-wide collaboration, with each company having an equal voice in shaping the future of accessible technology.',
        goalsTitle: 'Goals',
        goal1: 'Establish cooperative nonprofit structure',
        goal2: 'Create industry-wide ethical standards',
        goal3: 'Foster collaborative innovation',
        goal4: 'Ensure equal company representation',
        bylawsSectionTitle: 'Bylaws',
        bylawsSectionBody: 'The SLxAI Bylaws Committee has spent the past two months collaboratively developing the organization\'s founding bylaws. The draft is now ready for community review. We invite members and stakeholders to provide feedback before the bylaws are formally adopted at the end of the SLxAI Summit on April 17, 2026.',
        bylawsSectionLinkLead: 'Review the draft and share your input here:',
        bylawsSectionLinkText: 'View draft bylaws & feedback',
        summitTitle: 'Summit 2026',
        summitDescription: 'The historic gathering where industry leaders will establish the cooperative nonprofit that will shape the future of sign language x AI technologies.',
        dateTimeTitle: 'Date & Time',
        date: 'Date:',
        dateValue: 'April 16-17, 2026',
        conferenceHours: 'Conference Hours:',
        conferenceHoursValue: '8:45 AM to 5:10 PM (see schedule below)',
        conferenceHoursValueNoSchedule: '8:45 AM to 5:10 PM',
        scheduleTitle: 'SLxAI Summit Schedule',
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
        tocSummitCommittee: 'Summit Committee',
        welcomeLetterTitle: 'Welcome Letter',
        summitCommitteeTitle: 'Summit Committee',
        summitCommitteeIntro:
          'This summit would not be possible without the committee members below. Each contributed in their own way to help ensure a successful event.',
        sponsorsSectionTitle: 'Sponsors',
        sponsorsSectionThankYou:
          'We are grateful to our incredible sponsors for making this summit possible. Without your support, none of this would happen. Thank you to each of you.',
        eveningEvents: 'Evening Events:',
        eveningEventsValue: 'Evening events on both nights',
        preConference: 'Pre-Conference:',
        preConferenceValue: 'Possible social light event on April 15',
        locationTitle: 'Location',
        venue: 'Venue:',
        venueValue: 'Boston University',
        city: 'City:',
        cityValue: 'Boston, Massachusetts',
        address: 'Address:',
        addressValue: '1 Silber Way',
        addressValue2: 'Boston, MA 02215',
        aboutSummitTitle: 'About Summit 2026',
        overviewTitle: 'At a glance',
        overviewText:
          'The inaugural SLxAI Summit gathers researchers, industry, Deaf-led organizations, and community partners at Boston University for shared dialogue on sign language and AI: ethics, responsible deployment, data governance, benchmarks, accessibility, and real-world impact. A single plenary program keeps every attendee in the same room for the full agenda, so discussions stay transparent and aligned. The event advances SLxAI’s cooperative nonprofit work, including community engagement around bylaws and long-term governance.',
        hostTitle: 'Hosts',
        hostText:
          'Your hosts are Dr. Naomi Caselli and Travis Dougherty. Dr. Caselli is at Boston University as Director of the Deaf Center, advancing sign language linguistics, Deaf studies, and technology; the university is proud to host the summit on campus. Travis Dougherty convenes SLxAI’s global stakeholder community and co-hosts the gathering alongside Dr. Caselli.',
        masterOfCeremoniesTitle: 'Master of Ceremonies',
        focusAreasTitle: 'Focus Areas:',
        focusArea1: 'Sign Language Recognition (SLR)',
        focusArea2: 'Ethics and Governance',
        focusArea3: 'Sign Language Avatar (SLA)',
        focusArea4: 'Research and Innovation',
        focusArea5: 'SLR and SLA Applications',
        focusArea6: 'Global Benchmarks',
        focusArea7: 'Networking',
        focusArea8: 'Emerging Technologies',
        boothsTitle: 'Booths and Exhibits',
        boothsText: 'Sponsor booths are located inside the same main room as the plenary sessions. Attendees can move between the sessions area and the exhibit area without leaving the space. This setup keeps the energy in one place and gives sponsors constant visibility.',
        conferenceDayTitle: 'Conference Day',
        conferenceDayText: 'The summit opens with keynote remarks followed by a full day of plenary sessions. Lunch is provided for all attendees. The main room includes sponsor booths, demo tables, and product displays. Attendees can explore booths during breaks and transitions between sessions.',
        eveningEventsTitle: 'Evening Events',
        eveningEventsText: 'Sponsors may host evening activities, receptions, or demonstrations. These optional events give companies additional ways to connect with attendees and showcase their work.',
        capacityTitle: 'Capacity',
        maxCapacity: 'Max Capacity:',
        maxCapacityValue: '175 attendees',
        workshopsPanels: 'Workshops/Panels:',
        workshopsPanelsValue: '20',
        importantDatesTitle: 'Important Dates',
        registrationFee: 'Registration Fee:',
        registrationFeeValue: '$350 plus processing fee',
        membershipTitle: 'Become a Founding Member',
        membershipDescription: 'Join the inaugural group of industry leaders that will establish the SLxAI cooperative nonprofit, ensuring equal representation in shaping the future of sign language x AI technologies.',
        foundingBenefitsTitle: 'Founding Member Benefits',
        foundingBenefitsDescription: 'As a founding member, your organization will have a unique opportunity to shape the cooperative\'s structure and future direction.',
        foundingStatusTitle: 'Founding Status',
        foundingStatusText: 'Be recognized as one of the original industry leaders that established the cooperative.',
        boardRepresentationTitle: 'Board Representation',
        boardRepresentationText: 'Guaranteed board seat with equal voting rights on all cooperative decisions.',
        industryLeadershipTitle: 'Industry Leadership',
        industryLeadershipText: 'Help establish industry standards and ethical guidelines for sign language x AI.',
        benchmarkingTitle: 'Benchmarking & Standardization',
        benchmarkingText: 'Play a key role in establishing benchmarks and standards for avatar and sign language recognition (SLR) technologies, helping to guide the industry toward greater interoperability and quality.',
        earlyAccessTitle: 'Early Access & Influence',
        earlyAccessText: 'Gain early access to new research, datasets, and tools developed by the cooperative. Founding members can pilot and shape upcoming initiatives, ensuring your needs and feedback are prioritized in the development of industry resources.',
        networkTitle: 'Network & Collaboration',
        networkText: 'Connect with other industry leaders, researchers, and innovators in the sign language x AI space. Build lasting partnerships and collaborate on groundbreaking projects.',
        interestFormTitle: 'Express Your Interest',
        landingProgramBookCtaLabel: 'View full program, schedule & details',
        interestFormDescription: 'Fill out the form below to express your organization\'s interest in becoming a founding member of the SLxAI cooperative nonprofit.',
        nameLabel: 'Name',
        namePlaceholder: 'Your full name',
        emailLabel: 'Email',
        emailPlaceholder: 'your.email@example.com',
        organizationLabel: 'Organization',
        organizationPlaceholder: 'Your organization name',
        reasonLabel: 'Reason for Interest',
        reasonPlaceholder: 'Tell us why your organization is interested in joining...',
        submitButton: 'Submit Interest',
        submittingButton: 'Submitting...',
        thankYouTitle: 'Thank You!',
        thankYouMessage: 'We\'ve received your interest form. Our team will review your submission and get back to you soon.',
        navLogin: 'Log in',
        socialFollowLinkedIn: 'Follow on LinkedIn',
        socialFollowFacebook: 'Follow on Facebook',
        socialFollowInstagram: 'Follow on Instagram',
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

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone: string): boolean => {
    if (!phone) return true; // Optional field
    const phoneRegex = /^[\d\s\-\+\(\)]+$/;
    return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 10;
  };

  const handleTicketSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!ticketForm.name.trim()) {
      toast({
        title: 'Name required',
        description: 'Please enter your name.',
        variant: 'destructive',
      });
      return;
    }
    if (!ticketForm.email.trim()) {
      toast({
        title: 'Email required',
        description: 'Please enter your email address.',
        variant: 'destructive',
      });
      return;
    }
    if (!validateEmail(ticketForm.email)) {
      toast({
        title: 'Invalid email',
        description: 'Please enter a valid email address.',
        variant: 'destructive',
      });
      return;
    }
    if (ticketForm.phone && !validatePhone(ticketForm.phone)) {
      toast({
        title: 'Invalid phone',
        description: 'Please enter a valid phone number.',
        variant: 'destructive',
      });
      return;
    }

    // Check availability
    if (availableTickets <= 0) {
      toast({
        title: 'Tickets Sold Out',
        description: 'Sorry, all tickets have been reserved. Please check back later.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmittingTicket(true);
    try {
      await submitTicketReservation({
        name: sanitizeText(ticketForm.name.trim()),
        email: ticketForm.email.toLowerCase().trim(),
        phone: ticketForm.phone ? sanitizeText(ticketForm.phone.trim()) : undefined,
        organization: ticketForm.organization ? sanitizeText(ticketForm.organization.trim()) : undefined,
      });

      // Refresh ticket counts
      const [available, reserved] = await Promise.all([
        getAvailableTicketCount(),
        getReservedTicketCount(),
      ]);
      setAvailableTickets(available);
      setReservedTickets(reserved);

      setIsTicketSubmitted(true);
      setTicketForm({
        name: '',
        email: '',
        phone: '',
        organization: '',
      });

      toast({
        title: 'Reservation Successful!',
        description: `Your ticket reservation has been confirmed. You've secured your spot! We'll notify you when ticket pricing is finalized (within the next 2 weeks) and provide instructions for completing your purchase.`,
      });
    } catch (error: any) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error submitting ticket reservation:', error);
      }
      let errorMessage = 'Failed to submit your reservation. Please try again.';
      if (error?.message?.includes('network') || error?.message?.includes('fetch')) {
        errorMessage = 'Network error. Please check your connection and try again.';
      } else if (error?.message) {
        errorMessage = error.message;
      }
      toast({
        title: 'Reservation Failed',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsSubmittingTicket(false);
    }
  };

  return (
    <div className="min-h-screen bg-white" id="main-content" role="main">
      <Navigation />
      
      {/* Hero Section */}
      <section id="home" className="relative bg-white overflow-hidden">
        {/* Language + member access */}
        <div className="relative z-50 flex w-full flex-wrap items-center justify-end gap-3 px-4 pt-4">
          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="outline"
              size="sm"
              className="h-9 border-electric-blue/40 bg-white shadow-sm text-electric-blue hover:bg-electric-blue/10 hover:text-electric-blue"
              asChild
            >
              <Link to="/login">{getText('navLogin', 'Log in')}</Link>
            </Button>
          </div>
          <div className="flex items-center gap-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg px-2 py-1 sm:w-auto">
            <Globe className="h-4 w-4 text-gray-700 dark:text-gray-300" />
            <Select value={language} onValueChange={(value) => setLanguage(value as any)}>
              <SelectTrigger 
                className="h-8 sm:w-[140px] text-sm border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                <SelectValue>
                  <div className="flex items-center gap-1.5">
                    <span>{SUPPORTED_LANGUAGES.find(l => l.code === language)?.flag}</span>
                    <span className="truncate">{SUPPORTED_LANGUAGES.find(l => l.code === language)?.nativeName}</span>
                  </div>
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="max-h-[300px] overflow-y-auto dark:bg-gray-800 dark:border-gray-600 z-[60]">
                {SUPPORTED_LANGUAGES.map((lang) => (
                  <SelectItem 
                    key={lang.code} 
                    value={lang.code}
                    className="dark:text-white dark:hover:bg-gray-700"
                  >
                    <div className="flex items-center gap-2">
                      <span>{lang.flag}</span>
                      <span>{lang.nativeName}</span>
                      <span className="text-xs text-gray-500 dark:text-gray-400 ml-auto">({lang.name})</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center">
            <div 
              className="animate-fade-in bg-white rounded-lg inline-block relative"
              style={{
                boxShadow: '0 0 40px 20px rgba(255, 255, 255, 0.8), 0 0 80px 40px rgba(255, 255, 255, 0.4)'
              }}
            >
              <img 
                src="/lovable-uploads/0941509f-be4a-49e7-b472-735a4942f89a.png" 
                alt="SLxAI Logo" 
                className="h-24 w-auto mx-auto"
              />
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="bg-white py-3 sm:py-4">
        <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8">
          {/* Social CTAs — same column layout as Mission / Vision / Goals on xl */}
          <div className="mb-6 sm:mb-5">
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-3 xl:gap-6">
              <Button
                asChild
                size="sm"
                className="h-auto min-h-10 w-full gap-2 border-0 bg-electric-blue px-3 py-2 text-sm font-semibold text-white shadow-[0_4px_14px_-2px_rgba(0,128,255,0.55)] hover:bg-electric-blue/90 hover:shadow-[0_6px_18px_-2px_rgba(0,128,255,0.5)]"
              >
                <a
                  href="https://www.linkedin.com/company/slxai/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2"
                >
                  <Linkedin className="h-4 w-4 shrink-0" aria-hidden />
                  <span>{getText('socialFollowLinkedIn', 'Follow on LinkedIn')}</span>
                  <ExternalLink className="h-3.5 w-3.5 shrink-0 opacity-90" aria-hidden />
                </a>
              </Button>
              <Button
                asChild
                size="sm"
                className="h-auto min-h-10 w-full gap-2 border-0 bg-electric-blue px-3 py-2 text-sm font-semibold text-white shadow-[0_4px_14px_-2px_rgba(0,128,255,0.55)] hover:bg-electric-blue/90 hover:shadow-[0_6px_18px_-2px_rgba(0,128,255,0.5)]"
              >
                <a
                  href="https://www.facebook.com/profile.php?id=61577817126798"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2"
                >
                  <Facebook className="h-4 w-4 shrink-0" aria-hidden />
                  <span>{getText('socialFollowFacebook', 'Follow on Facebook')}</span>
                  <ExternalLink className="h-3.5 w-3.5 shrink-0 opacity-90" aria-hidden />
                </a>
              </Button>
              <Button
                asChild
                size="sm"
                className="h-auto min-h-10 w-full gap-2 border-0 bg-electric-blue px-3 py-2 text-sm font-semibold text-white shadow-[0_4px_14px_-2px_rgba(0,128,255,0.55)] hover:bg-electric-blue/90 hover:shadow-[0_6px_18px_-2px_rgba(0,128,255,0.5)]"
              >
                <a
                  href="https://www.instagram.com/slxaisummit/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2"
                >
                  <Instagram className="h-4 w-4 shrink-0" aria-hidden />
                  <span>{getText('socialFollowInstagram', 'Follow on Instagram')}</span>
                  <ExternalLink className="h-3.5 w-3.5 shrink-0 opacity-90" aria-hidden />
                </a>
              </Button>
            </div>
          </div>

          {/* Mission, Vision, Goals, Bylaws */}
          <div className="mb-2 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3 xl:gap-6">
            <Card
              className="translate-y-0 overflow-hidden rounded-lg shadow-none md:-translate-y-0.5"
              style={{
                filter: 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3))',
              }}
            >
              <CardHeader className="rounded-t-lg bg-electric-blue px-3 py-2 text-center text-white sm:px-4 sm:py-1.5">
                <CardTitle className="text-xl font-bold leading-tight text-white md:text-2xl lg:text-3xl">
                  {getText('missionTitle', 'Mission')}
                </CardTitle>
              </CardHeader>
              <CardContent className="rounded-b-lg px-3 pb-4 pt-3 sm:px-5 sm:pb-5 sm:pt-4">
                <p className="text-left text-[13px] leading-snug text-black sm:text-center sm:text-sm sm:leading-relaxed">
                  {getText('missionText', 'To unite industry leaders through a cooperative nonprofit structure, establishing ethical standards and driving innovation in sign language x AI technologies through equal representation and collaborative decision-making.')}
                </p>
              </CardContent>
            </Card>

            <Card
              className="translate-y-0 overflow-hidden rounded-lg shadow-none md:-translate-y-0.5"
              style={{
                filter: 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3))',
              }}
            >
              <CardHeader className="rounded-t-lg bg-electric-blue px-3 py-2 text-center text-white sm:px-4 sm:py-1.5">
                <CardTitle className="text-xl font-bold leading-tight text-white md:text-2xl lg:text-3xl">
                  {getText('visionTitle', 'Vision')}
                </CardTitle>
              </CardHeader>
              <CardContent className="rounded-b-lg px-3 pb-4 pt-3 sm:px-5 sm:pb-5 sm:pt-4">
                <p className="text-left text-[13px] leading-snug text-black sm:text-center sm:text-sm sm:leading-relaxed">
                  {getText('visionText', 'A world where sign language x AI technologies are developed through industry-wide collaboration, with each company having an equal voice in shaping the future of accessible technology.')}
                </p>
              </CardContent>
            </Card>

            <Card
              className="translate-y-0 overflow-hidden rounded-lg shadow-none md:-translate-y-0.5"
              style={{
                filter: 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3))',
              }}
            >
              <CardHeader className="rounded-t-lg bg-electric-blue px-3 py-2 text-center text-white sm:px-4 sm:py-1.5">
                <CardTitle className="text-xl font-bold leading-tight text-white md:text-2xl lg:text-3xl">
                  {getText('goalsTitle', 'Goals')}
                </CardTitle>
              </CardHeader>
              <CardContent className="rounded-b-lg px-3 pb-4 pt-3 sm:px-5 sm:pb-5 sm:pt-4">
                <ul className="space-y-1.5 text-left text-[13px] leading-snug text-black sm:text-sm sm:leading-normal">
                  <li>• {getText('goal1', 'Establish cooperative nonprofit structure')}</li>
                  <li>• {getText('goal2', 'Create industry-wide ethical standards')}</li>
                  <li>• {getText('goal3', 'Foster collaborative innovation')}</li>
                  <li>• {getText('goal4', 'Ensure equal company representation')}</li>
                </ul>
              </CardContent>
            </Card>

            <Card
              id="bylaws"
              className="translate-y-0 overflow-hidden rounded-lg shadow-none md:-translate-y-0.5 xl:col-span-3"
              style={{
                filter: 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3))',
              }}
            >
              <CardHeader className="rounded-t-lg bg-electric-blue px-3 py-2 text-center text-white sm:px-4 sm:py-1.5">
                <CardTitle className="text-xl font-bold leading-tight text-white md:text-2xl lg:text-3xl">
                  {getText('bylawsSectionTitle', 'Bylaws')}
                </CardTitle>
              </CardHeader>
              <CardContent className="rounded-b-lg px-3 pb-4 pt-3 sm:px-5 sm:pb-5 sm:pt-4">
                <p className="mb-3 text-left text-[13px] leading-snug text-black sm:text-sm sm:leading-relaxed">
                  {getText(
                    'bylawsSectionBody',
                    "The SLxAI Bylaws Committee has spent the past two months collaboratively developing the organization's founding bylaws. The draft is now ready for community review. We invite members and stakeholders to provide feedback before the bylaws are formally adopted at the end of the SLxAI Summit on April 17, 2026."
                  )}
                </p>
                <p className="mb-3 text-left text-[12px] leading-snug text-black sm:text-sm">
                  {getText('bylawsSectionLinkLead', 'Review the draft and share your input here:')}
                </p>
                <Button
                  asChild
                  size="sm"
                  className="h-auto min-h-10 w-full bg-electric-blue px-3 py-2.5 text-sm hover:bg-electric-blue/90 sm:min-h-11 sm:px-4 sm:text-base"
                >
                  <Link to="/bylaws" className="inline-flex w-full min-w-0 items-center justify-center gap-2">
                    <span className="text-balance text-center">{getText('bylawsSectionLinkText', 'View draft bylaws & feedback')}</span>
                    <FileText className="h-4 w-4 shrink-0" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* SLxAI Academy */}
      <section id="academy" className="bg-gray-50 px-4 py-12 dark:bg-gray-900 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <Card className="overflow-hidden border-2 border-electric-blue shadow-xl">
            <CardHeader className="bg-electric-blue py-4 text-center text-white">
              <div className="mb-2 flex justify-center">
                <GraduationCap className="h-10 w-10" aria-hidden />
              </div>
              <CardTitle className="text-2xl font-bold text-white sm:text-3xl">
                {getText('academySectionTitle', 'SLxAI Academy')}
              </CardTitle>
              <CardDescription className="text-base text-white/90">
                {getText('academySectionTagline', 'Live AI workshops in sign language')}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 text-center">
              <p className="mb-6 text-left text-sm leading-relaxed text-slate-700 sm:text-center sm:text-base">
                {getText(
                  'academySectionBody',
                  'A global platform for live, interactive Zoom workshops in sign language that teach practical AI skills. Sessions are real time with hands-on practice and community connection on Zoom.',
                )}
              </p>
              <Button asChild size="lg" className="bg-electric-blue hover:bg-electric-blue/90">
                <Link to="/academy">{getText('academySectionCta', 'Explore SLxAI Academy')}</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Waitlist section temporarily removed — restore when needed */}

      {/* Blog section temporarily removed — restore when needed */}

      {/* Summit 2026 — past event archive */}
      <section id="summit" className="border-t border-slate-200 bg-slate-50 px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <span className="mb-3 inline-block rounded-full bg-slate-200 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-600">
            {getText('summitPastEventLabel', 'Past Event')}
          </span>
          <h2 className="mb-3 text-2xl font-bold text-slate-900 sm:text-3xl">
            {getText('summitSectionTitle', 'SLxAI Summit 2026')}
          </h2>
          <p className="mb-6 text-slate-600">
            {getText(
              'summitSectionBody',
              'Our inaugural summit has concluded. Explore the full program, workshops, sponsors, and schedule in the event archive.',
            )}
          </p>
          <Button asChild size="lg" variant="outline" className="border-electric-blue text-electric-blue hover:bg-electric-blue/10">
            <Link to="/2026">{getText('summitSectionCta', 'View SLxAI Summit 2026 Archive')}</Link>
          </Button>
        </div>
      </section>

      <footer
        className="border-t border-gray-200 bg-gray-50 py-6 text-center text-sm text-gray-600 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400"
        role="contentinfo"
        aria-label="Site information"
      >
        <div id="metricool-footer-hidden" className="hidden" aria-hidden="true" />
        <nav className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
          <Link to="/privacy" className="text-electric-blue hover:underline">
            {t('common.privacyPolicy')}
          </Link>
          <span className="text-gray-300 dark:text-gray-600" aria-hidden>
            |
          </span>
          <Link to="/cookies" className="text-electric-blue hover:underline">
            {t('common.cookiePolicy')}
          </Link>
        </nav>
      </footer>

    </div>
  );
};

export default Index;
