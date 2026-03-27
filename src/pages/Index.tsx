import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import Navigation from '@/components/Navigation';
import { Calendar, Users, Globe, BookOpen, ArrowUp, Target, Eye, Award, Star, CheckCircle, Mail, Phone, MapPin, ExternalLink, FileText, User, Building2, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { sanitizeText, isValidLength } from '@/lib/security';
import { useLanguage, SUPPORTED_LANGUAGES } from '@/contexts/LanguageContext';
import { submitTicketReservation, getAvailableTicketCount, getReservedTicketCount } from '@/data/summit2026';
import Summit2026ProgramBookContent from '@/components/summit2026/Summit2026ProgramBookContent';

const Index = () => {
  const { toast } = useToast();
  const { language, setLanguage, translate } = useLanguage();
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

  const [waitlistForm, setWaitlistForm] = useState({
    name: '',
    email: '',
    organization: '',
  });
  const [isSubmittingWaitlist, setIsSubmittingWaitlist] = useState(false);
  const [isWaitlistSubmitted, setIsWaitlistSubmitted] = useState(false);
  
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
        conferenceHoursValue: '8:45 AM – 5:10 PM',
        scheduleTitle: 'SLxAI Summit Schedule',
        scheduleDateLine: 'April 16 to 17, 2026',
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
        overviewTitle: 'SLxAI Summit 2026 Overview',
        overviewText: 'SLxAI Summit 2026 brings global researchers, companies, and Deaf led innovators together at Boston University. The summit focuses on the future of sign language AI, ethical design, multilingual access, and collaboration across the international ecosystem.',
        hostTitle: 'Host',
        hostText: 'The summit is held at Boston University. The Deaf Center at BU, directed by Dr. Naomi Caselli, supports research in sign language linguistics, Deaf studies, and technology. It serves as a core partner for this event and strengthens the summit with its academic and community expertise.',
        programFormatTitle: 'Program Format',
        programFormatText: 'The event is built around plenary sessions. All attendees share the same room for every talk, demo, and panel. This format ensures everyone hears the same discussions and engages in the same conversations without splitting the audience. Presenter teams come from universities, companies, and Deaf led organizations. The summit features 20 workshops and panels.',
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

  const handleWaitlistSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingWaitlist(true);

    // Validate fields
    if (!waitlistForm.name || waitlistForm.name.trim() === '') {
      toast({
        title: "Name required",
        description: "Please enter your name.",
        variant: "destructive",
      });
      setIsSubmittingWaitlist(false);
      return;
    }

    if (!waitlistForm.email || waitlistForm.email.trim() === '') {
      toast({
        title: "Email required",
        description: "Please enter your email address.",
        variant: "destructive",
      });
      setIsSubmittingWaitlist(false);
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(waitlistForm.email)) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      setIsSubmittingWaitlist(false);
      return;
    }

    if (!isValidLength(waitlistForm.name, 1, 200) || !isValidLength(waitlistForm.email, 1, 200)) {
      toast({
        title: "Invalid input",
        description: "Please check that all fields meet the length requirements.",
        variant: "destructive",
      });
      setIsSubmittingWaitlist(false);
      return;
    }

    // Validate organization length if provided (optional field)
    if (waitlistForm.organization && !isValidLength(waitlistForm.organization, 1, 200)) {
      toast({
        title: "Invalid input",
        description: "Organization name must be between 1 and 200 characters.",
        variant: "destructive",
      });
      setIsSubmittingWaitlist(false);
      return;
    }

    try {
      const { error } = await supabase
        .from('waitlist')
        .insert({
          name: sanitizeText(waitlistForm.name.trim()),
          email: waitlistForm.email.toLowerCase().trim(),
          organization: waitlistForm.organization ? sanitizeText(waitlistForm.organization.trim()) : null,
        });

      if (error) throw error;

      setIsWaitlistSubmitted(true);
      setWaitlistForm({ name: '', email: '', organization: '' });
      
      toast({
        title: "Thank you!",
        description: "You've been added to the waitlist. We'll notify you when spots become available.",
      });
    } catch (error: any) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error submitting waitlist:', error);
      }
      toast({
        title: "Submission failed",
        description: error.message || "Failed to submit your information. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsSubmittingWaitlist(false);
    }
  };

  return (
    <div className="min-h-screen bg-white" id="main-content" role="main">
      <Navigation />
      
      {/* Hero Section */}
      <section id="home" className="relative bg-white overflow-hidden">
        {/* Language selector + member access */}
        <div className="flex flex-row sm:absolute sm:top-4 sm:right-4 justify-end items-center gap-3 px-4 pt-4 sm:pt-0 z-50 relative w-full sm:w-auto flex-wrap">
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
          {/* Mission, Vision, Goals */}
          <div className="mb-2 grid gap-3 md:grid-cols-3 md:gap-6">
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
          </div>

          {/* Bylaws — same card style as Mission / Vision / Goals */}
          <Card
            id="bylaws"
            className="mt-4 translate-y-0 overflow-hidden rounded-lg shadow-none sm:mt-6 md:-translate-y-0.5"
            style={{
              filter: 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3))',
            }}
          >
            <CardHeader className="rounded-t-lg bg-electric-blue px-3 py-2 text-center text-white sm:px-4 sm:py-1.5">
              <CardTitle className="text-xl font-bold leading-tight text-white md:text-2xl lg:text-3xl">
                {getText('bylawsSectionTitle', 'Bylaws')}
              </CardTitle>
            </CardHeader>
            <CardContent className="rounded-b-lg px-3 pb-4 pt-3 sm:px-6 sm:pb-6 sm:pt-5">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:items-start md:gap-8">
                <p className="text-left text-[13px] leading-snug text-black sm:text-sm sm:leading-relaxed">
                  {getText(
                    'bylawsSectionBody',
                    "The SLxAI Bylaws Committee has spent the past two months collaboratively developing the organization's founding bylaws. The draft is now ready for community review. We invite members and stakeholders to provide feedback before the bylaws are formally adopted at the end of the SLxAI Summit on April 17, 2026."
                  )}
                </p>
                <div className="flex min-h-0 w-full justify-center">
                  <div className="grid w-full max-w-full grid-cols-1 justify-items-stretch gap-3 sm:gap-4 md:w-max">
                    <p className="text-center text-[13px] leading-snug text-black sm:text-sm sm:leading-relaxed">
                      {getText('bylawsSectionLinkLead', 'Review the draft and share your input here:')}
                    </p>
                    <Button
                      asChild
                      size="sm"
                      className="h-auto min-h-10 bg-electric-blue px-3 py-2.5 text-sm hover:bg-electric-blue/90 sm:min-h-11 sm:px-4 sm:text-base"
                    >
                      <Link to="/bylaws" className="inline-flex w-full min-w-0 items-center justify-center gap-2">
                        <span className="text-balance text-center">{getText('bylawsSectionLinkText', 'View draft bylaws & feedback')}</span>
                        <FileText className="h-4 w-4 shrink-0" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <Summit2026ProgramBookContent
        getText={getText}
        showSchedule={false}
        showLandingBuHeroImage
        linkWorkshopCardsToProgramBook={false}
      />

      {/* Waitlist — bottom of page */}
      <section id="waitlist" className="py-10 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-center">
            <Card className="border-2 border-electric-blue shadow-xl w-full max-w-2xl">
              <CardHeader className="bg-electric-blue text-white text-center py-3 rounded-t-lg">
                <CardTitle className="text-2xl sm:text-3xl font-bold text-white">
                  Join the Waitlist
                </CardTitle>
                <CardDescription className="text-white/90 text-sm sm:text-base mt-2">
                  Get notified when tickets become available
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                {isWaitlistSubmitted ? (
                  <div className="text-center py-8">
                    <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Thank You!</h3>
                    <p className="text-gray-600 mb-4">
                      You've been added to the waitlist. We'll notify you when spots become available.
                    </p>
                    <Button
                      onClick={() => setIsWaitlistSubmitted(false)}
                      variant="outline"
                      className="bg-white"
                    >
                      Join Again
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleWaitlistSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="waitlist-name" className="flex items-center gap-2">
                        <User className="h-4 w-4 text-electric-blue" />
                        Name
                      </Label>
                      <Input
                        id="waitlist-name"
                        type="text"
                        placeholder="Your full name"
                        value={waitlistForm.name}
                        onChange={(e) => setWaitlistForm({ ...waitlistForm, name: e.target.value })}
                        required
                        disabled={isSubmittingWaitlist}
                        className="bg-white"
                        maxLength={200}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="waitlist-email" className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-electric-blue" />
                        Email
                      </Label>
                      <Input
                        id="waitlist-email"
                        type="email"
                        placeholder="your.email@example.com"
                        value={waitlistForm.email}
                        onChange={(e) => setWaitlistForm({ ...waitlistForm, email: e.target.value })}
                        required
                        disabled={isSubmittingWaitlist}
                        className="bg-white"
                        maxLength={200}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="waitlist-organization" className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-electric-blue" />
                        Organization (Optional)
                      </Label>
                      <Input
                        id="waitlist-organization"
                        type="text"
                        placeholder="Your organization name"
                        value={waitlistForm.organization}
                        onChange={(e) => setWaitlistForm({ ...waitlistForm, organization: e.target.value })}
                        disabled={isSubmittingWaitlist}
                        className="bg-white"
                        maxLength={200}
                      />
                    </div>

                    <Button
                      type="submit"
                      className="w-full bg-electric-blue hover:bg-electric-blue/90 text-white"
                      disabled={isSubmittingWaitlist}
                    >
                      {isSubmittingWaitlist ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        'Join Waitlist'
                      )}
                    </Button>
                  </form>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

    </div>
  );
};

export default Index;
