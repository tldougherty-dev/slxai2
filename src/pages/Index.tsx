import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import Navigation from '@/components/Navigation';
import { Calendar, Users, Globe, BookOpen, ArrowUp, Target, Eye, Award, Star, CheckCircle, Mail, Phone, MapPin, ExternalLink, FileText, User, Building2, Loader2, Clock, Hotel, Plane, Ticket } from 'lucide-react';
import InterestedCompanies from '@/components/InterestedCompanies';
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { sanitizeText, isValidLength } from '@/lib/security';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage, SUPPORTED_LANGUAGES } from '@/contexts/LanguageContext';
import { submitTicketReservation, getAvailableTicketCount, getReservedTicketCount } from '@/data/summit2026';

const Index = () => {
  const { toast } = useToast();
  const { theme } = useTheme();
  const { language, setLanguage, translate } = useLanguage();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [translatedContent, setTranslatedContent] = useState<Record<string, string>>({});
  const [isSubmittingTicket, setIsSubmittingTicket] = useState(false);
  const [isTicketSubmitted, setIsTicketSubmitted] = useState(false);
  const [availableTickets, setAvailableTickets] = useState<number>(175);
  const [reservedTickets, setReservedTickets] = useState<number>(0);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    organization: '',
    reason: '',
  });

  const [ticketForm, setTicketForm] = useState({
    name: '',
    email: '',
    phone: '',
    organization: '',
  });

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
        aboutDescription: 'We are bringing together industry leaders in the sign language x AI space to establish a cooperative nonprofit where each member will have a board seat, ensuring collaborative decision-making and ethical development of sign language x AI technologies.',
        missionTitle: 'Mission',
        missionText: 'To unite industry leaders through a cooperative nonprofit structure, establishing ethical standards and driving innovation in sign language x AI technologies through equal representation and collaborative decision-making.',
        visionTitle: 'Vision',
        visionText: 'A world where sign language x AI technologies are developed through industry-wide collaboration, with each company having an equal voice in shaping the future of accessible technology.',
        goalsTitle: 'Goals',
        goal1: 'Establish cooperative nonprofit structure',
        goal2: 'Create industry-wide ethical standards',
        goal3: 'Foster collaborative innovation',
        goal4: 'Ensure equal company representation',
        summitTitle: 'Summit 2026',
        summitDescription: 'The historic gathering where industry leaders will establish the cooperative nonprofit that will shape the future of sign language x AI technologies.',
        dateTimeTitle: 'Date & Time',
        date: 'Date:',
        dateValue: 'April 16-17, 2026',
        conferenceHours: 'Conference Hours:',
        conferenceHoursValue: '8:30 AM - 5:00 PM',
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
        addressValue: '808 Commonwealth Avenue',
        addressValue2: 'Boston, MA 02215',
        aboutSummitTitle: 'About Summit 2026',
        overviewTitle: 'SLxAI Summit 2026 Overview',
        overviewText: 'SLxAI Summit 2026 brings global researchers, companies, and Deaf led innovators together at Boston University. The summit focuses on the future of sign language AI, ethical design, multilingual access, and collaboration across the international ecosystem.',
        hostTitle: 'Host',
        hostText: 'The summit is held at Boston University. The Deaf Center at BU, directed by Naomi Caselli, supports research in sign language linguistics, Deaf studies, and technology. It serves as a core partner for this event and strengthens the summit with its academic and community expertise.',
        programFormatTitle: 'Program Format',
        programFormatText: 'The event is built around plenary sessions. All attendees share the same room for every talk, demo, and panel. This format ensures everyone hears the same discussions and engages in the same conversations without splitting the audience. Presenter teams come from universities, companies, and Deaf led organizations.',
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
        preConferenceSocialTitle: 'Pre Conference Social',
        preConferenceSocialText: 'A welcome social is held the evening before the summit. This informal gathering helps people meet one another early and builds momentum leading into the conference day.',
        conferenceDayTitle: 'Conference Day',
        conferenceDayText: 'The summit opens with keynote remarks followed by a full day of plenary sessions. Lunch is provided for all attendees. The main room includes sponsor booths, demo tables, and product displays. Attendees can explore booths during breaks and transitions between sessions.',
        eveningEventsTitle: 'Evening Events',
        eveningEventsText: 'Sponsors may host evening activities, receptions, or demonstrations. These optional events give companies additional ways to connect with attendees and showcase their work.',
        capacityTitle: 'Capacity',
        maxCapacity: 'Max Capacity:',
        maxCapacityValue: '200 attendees',
        workshopsPanels: 'Workshops/Panels:',
        workshopsPanelsValue: 'Up to 15',
        importantDatesTitle: 'Important Dates',
        submissionDeadline: 'Presentation Submission Deadline:',
        submissionDeadlineValue: 'January 31, 2026',
        registrationFee: 'Registration Fee:',
        registrationFeeValue: 'TBD',
        hotelsTitle: 'Hotels Near Boston University',
        hotelsDescription: 'Several hotels are located within walking distance or a short ride from Boston University. We recommend booking early as April is a busy time in Boston. Popular options include:',
        hotel1: 'Hotel Commonwealth - 500 Commonwealth Avenue (0.3 miles)',
        hotel2: 'Hyatt Regency Boston - 1 Avenue de Lafayette (3.5 miles)',
        hotel3: 'Boston Marriott Copley Place - 110 Huntington Avenue (2.5 miles)',
        hotel4: 'Holiday Inn Express - 1200 Beacon Street (0.5 miles)',
        hotel5: 'Residence Inn by Marriott - 1200 Beacon Street (0.5 miles)',
        hotelsNote: 'Additional hotel options are available throughout Boston. Consider using booking sites to compare rates and locations.',
        travelAdviceTitle: 'Travel Advice',
        byAir: 'By Air:',
        airport1: 'Boston Logan International Airport (BOS) - 6 miles from BU. Take the MBTA Silver Line or taxi/Uber (~20-30 minutes)',
        airport2: 'Providence T.F. Green Airport (PVD) - 50 miles from BU. Take commuter rail to Boston South Station, then MBTA Green Line (~1.5 hours)',
        byTrain: 'By Train:',
        train1: 'Amtrak - Arrives at Boston South Station or Back Bay Station. Take MBTA Green Line B train to BU stops',
        train2: 'MBTA Commuter Rail - Connects to Boston from surrounding areas. Transfer to Green Line B at various stations',
        publicTransportation: 'Public Transportation:',
        publicTransportationText: 'Boston University is accessible via the MBTA Green Line B train. Key stops include: BU Central, BU East, and Blandford Street. The MBTA also offers bus routes throughout the city.',
        parking: 'Parking:',
        parkingText: 'We are working with BU to secure parking spaces on campus for attendees. Limited parking is available on campus. We recommend using public transportation or ride-sharing services. Street parking is metered and limited.',
        membershipTitle: 'Become a Founding Member',
        membershipDescription: 'Join the inaugural group of industry leaders that will establish the SLxAI cooperative nonprofit. Each founding member receives one board seat, ensuring equal representation in shaping the future of sign language x AI technologies.',
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
        ctaTitle: 'Be Part of History: Join the Inaugural Summit',
        ctaDescription: 'This is your opportunity to help establish the cooperative nonprofit that will shape the future of sign language x AI technologies. Secure your organization\'s board seat.',
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

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      // No header offset needed since there's no navigation bar
      const elementPosition = element.offsetTop;
      
      // Scroll to the element
      window.scrollTo({
        top: elementPosition,
        behavior: 'smooth'
      });
      
      // Reset scroll behavior after animation
      setTimeout(() => {
        document.documentElement.style.scrollBehavior = 'auto';
      }, 2000);
    }
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

  const handleInterestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Validate all fields
    if (!formData.name || formData.name.trim() === '') {
      toast({
        title: "Name required",
        description: "Please enter your name.",
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }

    if (!formData.email || formData.email.trim() === '') {
      toast({
        title: "Email required",
        description: "Please enter your email address.",
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }

    if (!formData.organization || formData.organization.trim() === '') {
      toast({
        title: "Organization required",
        description: "Please enter your organization name.",
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }

    if (!formData.reason || formData.reason.trim() === '') {
      toast({
        title: "Reason required",
        description: "Please tell us why you want to be part of this.",
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }

    if (!isValidLength(formData.name, 1, 200) || !isValidLength(formData.email, 1, 200) || 
        !isValidLength(formData.organization, 1, 200) || !isValidLength(formData.reason, 10, 2000)) {
      toast({
        title: "Invalid input",
        description: "Please check that all fields meet the length requirements.",
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }

    try {
      const { error } = await supabase
        .from('interest_submissions')
        .insert({
          name: sanitizeText(formData.name.trim()),
          email: formData.email.toLowerCase().trim(),
          organization: sanitizeText(formData.organization.trim()),
          reason: sanitizeText(formData.reason.trim()),
          approved: false, // Explicitly set to false so it shows in admin panel
        });

      if (error) throw error;

      setIsSubmitted(true);
      setFormData({ name: '', email: '', organization: '', reason: '' });
      
      toast({
        title: "Thank you!",
        description: "Your interest submission has been received. We'll review it and get back to you soon.",
      });
    } catch (error: any) {
      console.error('Error submitting interest:', error);
      toast({
        title: "Submission failed",
        description: error.message || "Failed to submit your interest. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white" id="main-content" role="main">
      <Navigation />
      
      {/* Member Button and Language Selector - Top Right */}
      <div className="absolute top-4 right-4 z-50 flex items-center gap-3">
        {/* Language Selector */}
        <div className="flex items-center gap-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg px-2 py-1">
          <Globe className="h-4 w-4 text-gray-700 dark:text-gray-300" />
          <Select value={language} onValueChange={(value) => setLanguage(value as any)}>
            <SelectTrigger 
              className="h-8 w-[140px] text-sm border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
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
        
        {/* Member Button */}
        <Button
          asChild
          className="bg-electric-blue hover:bg-electric-blue/90 text-white shadow-lg"
        >
          <Link to="/login">Member</Link>
        </Button>
      </div>
      
      {/* Hero Section */}
      <section id="home" className="relative bg-gradient-to-br from-gray-50 to-white py-4 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="mb-4 animate-fade-in">
              <img 
                src="/lovable-uploads/0941509f-be4a-49e7-b472-735a4942f89a.png" 
                alt="SLxAI Logo" 
                className="h-24 w-auto mx-auto mb-3"
              />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 animate-fade-in">
              <span className="block mb-1">{getText('heroTitle1', 'Uniting industry leaders to')}</span>
              <span className="block text-electric-blue mb-1">{getText('heroTitle2', 'establish the future of')}</span>
              <span className="block text-gray-900 text-4xl md:text-5xl font-extrabold">{getText('heroTitle3', 'sign language x AI.')}</span>
            </h1>
            <p className="text-lg text-gray-600 mb-6 max-w-3xl mx-auto leading-relaxed animate-fade-in">
              {getText('heroDescription', 'Join us at the inaugural SLxAI Summit where we\'ll bring industry leaders together to form a cooperative nonprofit that will shape the future of sign language x AI technologies.')}
            </p>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-4 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4 flex items-center justify-center gap-2">
              {getText('aboutTitle', 'About')}
              <img 
                src="/slxai-footer-logo.png" 
                alt="SLxAI Logo" 
                className="h-6 w-auto inline-block align-middle"
                style={{ transform: 'scale(1.05)' }}
              />
            </h2>
            <p className="text-lg text-gray-600 leading-relaxed max-w-4xl mx-auto">
              {getText('aboutDescription', 'We are bringing together industry leaders in the sign language x AI space to establish a cooperative nonprofit where each member will have a board seat, ensuring collaborative decision-making and ethical development of sign language x AI technologies.')}
            </p>
          </div>

          {/* Mission, Vision, Goals */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <Card 
              className="border-l-4 border-l-electric-blue shadow-none"
              style={{
                filter: 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3))',
                transform: 'translateY(-2px)'
              }}
            >
              <CardHeader className="text-center pb-3">
                <Target className="h-8 w-8 text-electric-blue mx-auto mb-2" aria-hidden="true" />
                <CardTitle className="text-xl font-bold text-gray-900">{getText('missionTitle', 'Mission')}</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-sm text-gray-600 text-center">
                  {getText('missionText', 'To unite industry leaders through a cooperative nonprofit structure, establishing ethical standards and driving innovation in sign language x AI technologies through equal representation and collaborative decision-making.')}
                </p>
              </CardContent>
            </Card>

            <Card 
              className="border-l-4 border-l-electric-blue shadow-none"
              style={{
                filter: 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3))',
                transform: 'translateY(-2px)'
              }}
            >
              <CardHeader className="text-center pb-3">
                <Eye className="h-8 w-8 text-electric-blue mx-auto mb-2" aria-hidden="true" />
                <CardTitle className="text-xl font-bold text-gray-900">{getText('visionTitle', 'Vision')}</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-sm text-gray-600 text-center">
                  {getText('visionText', 'A world where sign language x AI technologies are developed through industry-wide collaboration, with each company having an equal voice in shaping the future of accessible technology.')}
                </p>
              </CardContent>
            </Card>

            <Card 
              className="border-l-4 border-l-electric-blue shadow-none"
              style={{
                filter: 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3))',
                transform: 'translateY(-2px)'
              }}
            >
              <CardHeader className="text-center pb-3">
                <ArrowUp className="h-8 w-8 text-electric-blue mx-auto mb-2" />
                <CardTitle className="text-xl font-bold text-gray-900">{getText('goalsTitle', 'Goals')}</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• {getText('goal1', 'Establish cooperative nonprofit structure')}</li>
                  <li>• {getText('goal2', 'Create industry-wide ethical standards')}</li>
                  <li>• {getText('goal3', 'Foster collaborative innovation')}</li>
                  <li>• {getText('goal4', 'Ensure equal company representation')}</li>
                </ul>
              </CardContent>
            </Card>
          </div>

        </div>
      </section>

      {/* Interested Companies Section */}
      <section className="py-4 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <InterestedCompanies />
        </div>
      </section>

      {/* Ticket Reservation Section */}
      <section className="py-12 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Reserve Your Conference Ticket
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Secure your spot at SLxAI Summit 2026. Ticket pricing will be finalized within the next 2 weeks.
            </p>
          </div>

          {/* Ticket Availability Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
              <CardContent className="p-6 text-center">
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Available Tickets</div>
                <div className="text-3xl font-bold text-electric-blue">{availableTickets}</div>
                <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">out of 175 total</div>
              </CardContent>
            </Card>
            <Card className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
              <CardContent className="p-6 text-center">
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Reserved</div>
                <div className="text-3xl font-bold text-green-600 dark:text-green-400">{reservedTickets}</div>
                <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">tickets reserved</div>
              </CardContent>
            </Card>
            <Card className="bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800">
              <CardContent className="p-6 text-center">
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Ticket Price</div>
                <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">TBD</div>
                <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">Finalized in 2 weeks</div>
              </CardContent>
            </Card>
          </div>

          {/* Reservation Form */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Ticket className="h-5 w-5 text-electric-blue" />
                Ticket Pre-Reservation
              </CardTitle>
              <CardDescription>
                This is a pre-reservation system. You're reserving the opportunity to purchase a ticket when pricing is finalized.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isTicketSubmitted ? (
                <div className="text-center py-8">
                  <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Reservation Confirmed!</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Your ticket reservation has been confirmed. We'll notify you when ticket pricing is finalized (within the next 2 weeks) and provide instructions for completing your purchase.
                  </p>
                  <Button
                    onClick={() => {
                      setIsTicketSubmitted(false);
                      setTicketForm({ name: '', email: '', phone: '', organization: '' });
                    }}
                    variant="outline"
                    className="bg-white dark:bg-gray-800"
                  >
                    Reserve Another Ticket
                  </Button>
                </div>
              ) : availableTickets <= 0 ? (
                <div className="text-center py-8">
                  <div className="text-4xl mb-4">🎫</div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    All Tickets Reserved
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    We're sorry, but all 175 tickets have been reserved. Please check back later as cancellations may become available.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleTicketSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="ticket-name" className="flex items-center gap-2">
                        <User className="h-4 w-4 text-electric-blue" />
                        Full Name *
                      </Label>
                      <Input
                        id="ticket-name"
                        name="name"
                        type="text"
                        placeholder="John Doe"
                        value={ticketForm.name}
                        onChange={(e) => setTicketForm({ ...ticketForm, name: e.target.value })}
                        required
                        disabled={isSubmittingTicket}
                        className="bg-white dark:bg-gray-800"
                        maxLength={200}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="ticket-email" className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-electric-blue" />
                        Email Address *
                      </Label>
                      <Input
                        id="ticket-email"
                        name="email"
                        type="email"
                        placeholder="your.email@example.com"
                        value={ticketForm.email}
                        onChange={(e) => setTicketForm({ ...ticketForm, email: e.target.value })}
                        required
                        disabled={isSubmittingTicket}
                        className="bg-white dark:bg-gray-800"
                        maxLength={200}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="ticket-phone" className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-electric-blue" />
                        Phone Number
                      </Label>
                      <Input
                        id="ticket-phone"
                        name="phone"
                        type="tel"
                        placeholder="+1 (555) 123-4567"
                        value={ticketForm.phone}
                        onChange={(e) => setTicketForm({ ...ticketForm, phone: e.target.value })}
                        disabled={isSubmittingTicket}
                        className="bg-white dark:bg-gray-800"
                        maxLength={50}
                      />
                      <p className="text-xs text-gray-500">Optional - for urgent communications</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="ticket-organization" className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-electric-blue" />
                        Organization
                      </Label>
                      <Input
                        id="ticket-organization"
                        name="organization"
                        type="text"
                        placeholder="Your organization or company"
                        value={ticketForm.organization}
                        onChange={(e) => setTicketForm({ ...ticketForm, organization: e.target.value })}
                        disabled={isSubmittingTicket}
                        className="bg-white dark:bg-gray-800"
                        maxLength={200}
                      />
                      <p className="text-xs text-gray-500">Optional</p>
                    </div>
                  </div>

                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      <strong>Important:</strong> Only 175 tickets are available. Reservations are processed on a first-come, first-served basis. You'll receive an email notification when ticket pricing is finalized with instructions on how to complete your purchase.
                    </p>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-electric-blue hover:bg-electric-blue/90 text-white"
                    disabled={isSubmittingTicket || availableTickets <= 0}
                  >
                    {isSubmittingTicket ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Reserving...
                      </>
                    ) : (
                      <>
                        <Ticket className="h-4 w-4 mr-2" />
                        Reserve My Ticket
                      </>
                    )}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Summit Section */}
      <section id="summit" className="py-4 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4 flex items-center justify-center gap-2">
              <img 
                src="/slxai-footer-logo.png" 
                alt="SLxAI Logo" 
                className="h-10 w-auto inline-block align-middle"
              />
              {getText('summitTitle', 'Summit 2026')}
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              {getText('summitDescription', 'The historic gathering where industry leaders will establish the cooperative nonprofit that will shape the future of sign language x AI technologies.')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border border-gray-200 dark:border-gray-700 shadow-md">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center justify-center gap-2 text-gray-900 dark:text-white">
                  <Calendar className="h-5 w-5 text-electric-blue" />
                  {getText('dateTimeTitle', 'Date & Time')}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center p-3 pt-0">
                <div className="text-gray-700 dark:text-white">
                  <p>
                    <strong>{getText('date', 'Date:')}</strong> {getText('dateValue', 'April 16-17, 2026')}<br />
                    <strong>{getText('conferenceHours', 'Conference Hours:')}</strong> {getText('conferenceHoursValue', '8:30 AM - 5:00 PM')}<br />
                    <strong>{getText('eveningEvents', 'Evening Events:')}</strong> {getText('eveningEventsValue', 'Evening events on both nights')}<br />
                    <strong>{getText('preConference', 'Pre-Conference:')}</strong> {getText('preConferenceValue', 'Possible social light event on April 15')}
                  </p>
                  <div className="flex items-center justify-center gap-2 mb-2 mt-4">
                    <MapPin className="h-5 w-5 text-electric-blue" />
                    <h3 className="text-2xl font-semibold leading-none tracking-tight text-gray-900 dark:text-white">{getText('locationTitle', 'Location')}</h3>
                  </div>
                  <div className="dark:text-white">
                    <strong>{getText('venue', 'Venue:')}</strong> {getText('venueValue', 'Boston University')}<br />
                    <strong>{getText('city', 'City:')}</strong> {getText('cityValue', 'Boston, Massachusetts')}<br />
                    <strong>{getText('address', 'Address:')}</strong> {getText('addressValue', '808 Commonwealth Avenue')}<br />
                    {getText('addressValue2', 'Boston, MA 02215')}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-gray-200 dark:border-gray-700 shadow-md">
              <CardContent className="p-3">
                <div className="w-full rounded-lg overflow-hidden" style={{ height: '400px' }}>
                  <iframe
                    src="https://www.google.com/maps?q=Boston+University+Deaf+Center+808+Commonwealth+Avenue+Boston+MA+02215&output=embed"
                    width="100%"
                    height="100%"
                    style={{ 
                      border: 0,
                      filter: theme === 'dark' ? 'invert(1) hue-rotate(180deg)' : 'none'
                    }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="Boston University Deaf Center Location"
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="border border-gray-200 dark:border-gray-700 shadow-md md:col-span-2">
              <CardHeader>
                <CardTitle className="text-gray-900 dark:text-white">{getText('aboutSummitTitle', 'About Summit 2026')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
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
                      {getText('programFormatText', 'The event is built around plenary sessions. All attendees share the same room for every talk, demo, and panel. This format ensures everyone hears the same discussions and engages in the same conversations without splitting the audience. Presenter teams come from universities, companies, and Deaf led organizations.')}
                    </p>
                  </div>

                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-3">{getText('focusAreasTitle', 'Focus Areas:')}</h3>
                    <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-gray-700 dark:text-white">
                      <div className="flex items-start">
                        <span className="text-electric-blue mr-2">•</span>
                        <span>{getText('focusArea1', 'Sign Language Recognition (SLR)')}</span>
                      </div>
                      <div className="flex items-start">
                        <span className="text-electric-blue mr-2">•</span>
                        <span>{getText('focusArea2', 'Ethics and Governance')}</span>
                      </div>
                      <div className="flex items-start">
                        <span className="text-electric-blue mr-2">•</span>
                        <span>{getText('focusArea3', 'Sign Language Avatar (SLA)')}</span>
                      </div>
                      <div className="flex items-start">
                        <span className="text-electric-blue mr-2">•</span>
                        <span>{getText('focusArea4', 'Research and Innovation')}</span>
                      </div>
                      <div className="flex items-start">
                        <span className="text-electric-blue mr-2">•</span>
                        <span>{getText('focusArea5', 'SLR and SLA Applications')}</span>
                      </div>
                      <div className="flex items-start">
                        <span className="text-electric-blue mr-2">•</span>
                        <span>{getText('focusArea6', 'Global Benchmarks')}</span>
                      </div>
                      <div className="flex items-start">
                        <span className="text-electric-blue mr-2">•</span>
                        <span>{getText('focusArea7', 'Networking')}</span>
                      </div>
                      <div className="flex items-start">
                        <span className="text-electric-blue mr-2">•</span>
                        <span>{getText('focusArea8', 'Emerging Technologies')}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{getText('boothsTitle', 'Booths and Exhibits')}</h3>
                    <p>
                      {getText('boothsText', 'Sponsor booths are located inside the same main room as the plenary sessions. Attendees can move between the sessions area and the exhibit area without leaving the space. This setup keeps the energy in one place and gives sponsors constant visibility.')}
                    </p>
                  </div>

                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{getText('preConferenceSocialTitle', 'Pre Conference Social')}</h3>
                    <p>
                      {getText('preConferenceSocialText', 'A welcome social is held the evening before the summit. This informal gathering helps people meet one another early and builds momentum leading into the conference day.')}
                    </p>
                  </div>

                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{getText('conferenceDayTitle', 'Conference Day')}</h3>
                    <p>
                      {getText('conferenceDayText', 'The summit opens with keynote remarks followed by a full day of plenary sessions. Lunch is provided for all attendees. The main room includes sponsor booths, demo tables, and product displays. Attendees can explore booths during breaks and transitions between sessions.')}
                    </p>
                  </div>

                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{getText('eveningEventsTitle', 'Evening Events')}</h3>
                    <p>
                      {getText('eveningEventsText', 'Sponsors may host evening activities, receptions, or demonstrations. These optional events give companies additional ways to connect with attendees and showcase their work.')}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-gray-200 dark:border-gray-700 shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                  <Users className="h-5 w-5 text-electric-blue" />
                  {getText('capacityTitle', 'Capacity')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 dark:text-white">
                  <strong>{getText('maxCapacity', 'Max Capacity:')}</strong> {getText('maxCapacityValue', '200 attendees')}<br />
                  <strong>{getText('workshopsPanels', 'Workshops/Panels:')}</strong> {getText('workshopsPanelsValue', 'Up to 15')}
                </p>
              </CardContent>
            </Card>

            <Card className="border border-gray-200 dark:border-gray-700 shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                  <Clock className="h-5 w-5 text-electric-blue" />
                  {getText('importantDatesTitle', 'Important Dates')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 dark:text-white">
                  <strong>{getText('submissionDeadline', 'Presentation Submission Deadline:')}</strong> {getText('submissionDeadlineValue', 'January 31, 2026')}<br />
                  <strong>{getText('registrationFee', 'Registration Fee:')}</strong> {getText('registrationFeeValue', 'TBD')}
                </p>
              </CardContent>
            </Card>

            <Card className="border border-gray-200 dark:border-gray-700 shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                  <Hotel className="h-5 w-5 text-electric-blue" />
                  {getText('hotelsTitle', 'Hotels Near Boston University')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 dark:text-white text-sm">
                  {getText('hotelsDescription', 'Several hotels are located within walking distance or a short ride from Boston University. We recommend booking early as April is a busy time in Boston. Popular options include:')}
                </p>
                <ul className="mt-3 space-y-2 text-gray-700 dark:text-white text-sm">
                  <li className="flex items-start">
                    <span className="text-electric-blue mr-2">•</span>
                    <span><strong>{getText('hotel1', 'Hotel Commonwealth - 500 Commonwealth Avenue (0.3 miles)')}</strong></span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-electric-blue mr-2">•</span>
                    <span><strong>{getText('hotel2', 'Hyatt Regency Boston - 1 Avenue de Lafayette (3.5 miles)')}</strong></span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-electric-blue mr-2">•</span>
                    <span><strong>{getText('hotel3', 'Boston Marriott Copley Place - 110 Huntington Avenue (2.5 miles)')}</strong></span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-electric-blue mr-2">•</span>
                    <span><strong>{getText('hotel4', 'Holiday Inn Express - 1200 Beacon Street (0.5 miles)')}</strong></span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-electric-blue mr-2">•</span>
                    <span><strong>{getText('hotel5', 'Residence Inn by Marriott - 1200 Beacon Street (0.5 miles)')}</strong></span>
                  </li>
                </ul>
                <p className="mt-3 text-gray-600 dark:text-gray-300 text-xs">
                  {getText('hotelsNote', 'Additional hotel options are available throughout Boston. Consider using booking sites to compare rates and locations.')}
                </p>
              </CardContent>
            </Card>

            <Card className="border border-gray-200 dark:border-gray-700 shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                  <Plane className="h-5 w-5 text-electric-blue" />
                  {getText('travelAdviceTitle', 'Travel Advice')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-gray-700 dark:text-white text-sm">
                  <div>
                    <strong className="text-gray-900 dark:text-white">{getText('byAir', 'By Air:')}</strong>
                    <ul className="mt-1 ml-4 space-y-1">
                      <li className="flex items-start">
                        <span className="text-electric-blue mr-2">•</span>
                        <span><strong>{getText('airport1', 'Boston Logan International Airport (BOS) - 6 miles from BU. Take the MBTA Silver Line or taxi/Uber (~20-30 minutes)')}</strong></span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-electric-blue mr-2">•</span>
                        <span><strong>{getText('airport2', 'Providence T.F. Green Airport (PVD) - 50 miles from BU. Take commuter rail to Boston South Station, then MBTA Green Line (~1.5 hours)')}</strong></span>
                      </li>
                    </ul>
                  </div>
                  <div>
                    <strong className="text-gray-900 dark:text-white">{getText('byTrain', 'By Train:')}</strong>
                    <ul className="mt-1 ml-4 space-y-1">
                      <li className="flex items-start">
                        <span className="text-electric-blue mr-2">•</span>
                        <span><strong>{getText('train1', 'Amtrak - Arrives at Boston South Station or Back Bay Station. Take MBTA Green Line B train to BU stops')}</strong></span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-electric-blue mr-2">•</span>
                        <span><strong>{getText('train2', 'MBTA Commuter Rail - Connects to Boston from surrounding areas. Transfer to Green Line B at various stations')}</strong></span>
                      </li>
                    </ul>
                  </div>
                  <div>
                    <strong className="text-gray-900 dark:text-white">{getText('publicTransportation', 'Public Transportation:')}</strong>
                    <p className="mt-1 ml-4">
                      {getText('publicTransportationText', 'Boston University is accessible via the MBTA Green Line B train. Key stops include: BU Central, BU East, and Blandford Street. The MBTA also offers bus routes throughout the city.')}
                    </p>
                  </div>
                  <div>
                    <strong className="text-gray-900 dark:text-white">{getText('parking', 'Parking:')}</strong>
                    <p className="mt-1 ml-4">
                      {getText('parkingText', 'We are working with BU to secure parking spaces on campus for attendees. Limited parking is available on campus. We recommend using public transportation or ride-sharing services. Street parking is metered and limited.')}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

          </div>
        </div>
      </section>

      {/* Membership Section */}
      <section id="membership" className="py-4 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">{getText('membershipTitle', 'Become a Founding Member')}</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              {getText('membershipDescription', 'Join the inaugural group of industry leaders that will establish the SLxAI cooperative nonprofit. Each founding member receives one board seat, ensuring equal representation in shaping the future of sign language x AI technologies.')}
            </p>
          </div>

          {/* Founding Member Benefits */}
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-3">{getText('foundingBenefitsTitle', 'Founding Member Benefits')}</h3>
            <p className="text-gray-600 max-w-2xl mx-auto mb-6">
              {getText('foundingBenefitsDescription', 'As a founding member, your organization will have a unique opportunity to shape the cooperative\'s structure and future direction.')}
            </p>

            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <Card 
                className="text-center p-4 border-l-4 border-l-electric-blue shadow-none"
                style={{
                  filter: 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3))',
                  transform: 'translateY(-2px)'
                }}
              >
                <Star className="h-8 w-8 text-electric-blue mx-auto mb-2" />
                <h4 className="text-base font-semibold text-gray-900 mb-1">{getText('foundingStatusTitle', 'Founding Status')}</h4>
                <p className="text-sm text-gray-600">
                   {getText('foundingStatusText', 'Be recognized as one of the original industry leaders that established the cooperative.')}
                 </p>
              </Card>

              <Card 
                className="text-center p-4 border-l-4 border-l-electric-blue shadow-none"
                style={{
                  filter: 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3))',
                  transform: 'translateY(-2px)'
                }}
              >
                <Award className="h-8 w-8 text-electric-blue mx-auto mb-2" />
                <h4 className="text-base font-semibold text-gray-900 mb-1">{getText('boardRepresentationTitle', 'Board Representation')}</h4>
                <p className="text-sm text-gray-600">
                  {getText('boardRepresentationText', 'Guaranteed board seat with equal voting rights on all cooperative decisions.')}
                </p>
              </Card>

              <Card 
                className="text-center p-4 border-l-4 border-l-electric-blue shadow-none"
                style={{
                  filter: 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3))',
                  transform: 'translateY(-2px)'
                }}
              >
                <Globe className="h-8 w-8 text-electric-blue mx-auto mb-2" />
                <h4 className="text-base font-semibold text-gray-900 mb-1">{getText('industryLeadershipTitle', 'Industry Leadership')}</h4>
                <p className="text-sm text-gray-600">
                  {getText('industryLeadershipText', 'Help establish industry standards and ethical guidelines for sign language x AI.')}
                </p>
              </Card>

              <Card 
                className="text-center p-4 border-l-4 border-l-electric-blue shadow-none"
                style={{
                  filter: 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3))',
                  transform: 'translateY(-2px)'
                }}
              >
                <BookOpen className="h-8 w-8 text-electric-blue mx-auto mb-2" />
                <h4 className="text-base font-semibold text-gray-900 mb-1">{getText('benchmarkingTitle', 'Benchmarking & Standardization')}</h4>
                <p className="text-sm text-gray-600">
                  {getText('benchmarkingText', 'Play a key role in establishing benchmarks and standards for avatar and sign language recognition (SLR) technologies, helping to guide the industry toward greater interoperability and quality.')}
                </p>
              </Card>

              <Card 
                className="text-center p-4 border-l-4 border-l-electric-blue shadow-none"
                style={{
                  filter: 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3))',
                  transform: 'translateY(-2px)'
                }}
              >
                <ArrowUp className="h-8 w-8 text-electric-blue mx-auto mb-2" />
                <h4 className="text-base font-semibold text-gray-900 mb-1">{getText('earlyAccessTitle', 'Early Access & Influence')}</h4>
                <p className="text-sm text-gray-600">
                  {getText('earlyAccessText', 'Gain early access to new research, datasets, and tools developed by the cooperative. Founding members can pilot and shape upcoming initiatives, ensuring your needs and feedback are prioritized in the development of industry resources.')}
                </p>
              </Card>

              <Card 
                className="text-center p-4 border-l-4 border-l-electric-blue shadow-none"
                style={{
                  filter: 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3))',
                  transform: 'translateY(-2px)'
                }}
              >
                <Users className="h-8 w-8 text-electric-blue mx-auto mb-2" />
                <h4 className="text-base font-semibold text-gray-900 mb-1">{getText('networkTitle', 'Network & Collaboration')}</h4>
                <p className="text-sm text-gray-600">
                  {getText('networkText', 'Connect with other industry leaders, researchers, and innovators in the sign language x AI space. Build lasting partnerships and collaborate on groundbreaking projects.')}
                </p>
              </Card>
            </div>
          </div>

          {/* Interest Form */}
          <div className="max-w-2xl mx-auto">
            <Card className="shadow-lg">
              <CardHeader className="text-center">
                <CardTitle className="text-xl">{getText('interestFormTitle', 'Express Your Interest')}</CardTitle>
                <p className="text-sm text-gray-600">
                  {getText('interestFormDescription', 'Fill out the form below to express your organization\'s interest in becoming a founding member of the SLxAI cooperative nonprofit.')}
                </p>
              </CardHeader>
              <CardContent>
                {isSubmitted ? (
                  <div className="text-center py-8">
                    <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{getText('thankYouTitle', 'Thank You!')}</h3>
                    <p className="text-gray-600 mb-4">
                      {getText('thankYouMessage', 'We\'ve received your interest form. Our team will review your submission and get back to you soon.')}
                    </p>
                    <Button
                      onClick={() => setIsSubmitted(false)}
                      variant="outline"
                      className="bg-white"
                    >
                      Submit Another
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleInterestSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="interest-name" className="flex items-center gap-2">
                        <User className="h-4 w-4 text-electric-blue" />
                        {getText('nameLabel', 'Name')}
                      </Label>
                      <Input
                        id="interest-name"
                        type="text"
                        placeholder={getText('namePlaceholder', 'Your full name')}
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                        disabled={isSubmitting}
                        className="bg-white"
                        maxLength={200}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="interest-email" className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-electric-blue" />
                        {getText('emailLabel', 'Email')}
                      </Label>
                      <Input
                        id="interest-email"
                        type="email"
                        placeholder={getText('emailPlaceholder', 'your.email@example.com')}
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                        disabled={isSubmitting}
                        className="bg-white"
                        maxLength={200}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="interest-organization" className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-electric-blue" />
                        {getText('organizationLabel', 'Organization')}
                      </Label>
                      <Input
                        id="interest-organization"
                        type="text"
                        placeholder={getText('organizationPlaceholder', 'Your organization name')}
                        value={formData.organization}
                        onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                        required
                        disabled={isSubmitting}
                        className="bg-white"
                        maxLength={200}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="interest-reason" className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-electric-blue" />
                        {getText('reasonLabel', 'Reason for Interest')}
                      </Label>
                      <Textarea
                        id="interest-reason"
                        placeholder={getText('reasonPlaceholder', 'Tell us why your organization is interested in joining...')}
                        value={formData.reason}
                        onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                        required
                        disabled={isSubmitting}
                        className="bg-white min-h-[120px]"
                        maxLength={2000}
                      />
                      <p className="text-xs text-gray-500">
                        {formData.reason.length} / 2000 characters
                      </p>
                    </div>

                    <Button
                      type="submit"
                      className="w-full bg-electric-blue hover:bg-electric-blue/90 text-white"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          {getText('submittingButton', 'Submitting...')}
                        </>
                      ) : (
                        getText('submitButton', 'Submit Interest')
                      )}
                    </Button>
                  </form>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Summit CTA Section */}
      <section className="py-6 bg-gradient-to-r from-electric-blue to-blue-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            {getText('ctaTitle', 'Be Part of History: Join the Inaugural Summit')}
          </h2>
          <p className="text-lg text-blue-100">
            {getText('ctaDescription', 'This is your opportunity to help establish the cooperative nonprofit that will shape the future of sign language x AI technologies. Secure your organization\'s board seat.')}
          </p>
        </div>
      </section>
    </div>
  );
};

export default Index;
