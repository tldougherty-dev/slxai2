import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import Navigation from '@/components/Navigation';
import { Calendar, Users, Globe, BookOpen, ArrowUp, Target, Eye, Award, Star, CheckCircle, Mail, Phone, MapPin, ExternalLink, FileText, User, Building2, Loader2, Clock, Hotel, Plane, Ticket, ChevronDown, ChevronUp } from 'lucide-react';
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
        addressValue: '8 St Mary\'s St',
        addressValue2: 'Boston, MA 02215',
        aboutSummitTitle: 'About Summit 2026',
        overviewTitle: 'SLxAI Summit 2026 Overview',
        overviewText: 'SLxAI Summit 2026 brings global researchers, companies, and Deaf led innovators together at Boston University. The summit focuses on the future of sign language AI, ethical design, multilingual access, and collaboration across the international ecosystem.',
        hostTitle: 'Host',
        hostText: 'The summit is held at Boston University. The Deaf Center at BU, directed by Naomi Caselli, supports research in sign language linguistics, Deaf studies, and technology. It serves as a core partner for this event and strengthens the summit with its academic and community expertise.',
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
        hotelsTitle: 'Hotel Block',
        hotelsDescription: 'We have secured an official hotel block for the SLxAI Summit. We recommend booking early as April is a busy time in Boston.',
        hotelBlockTitle: 'Hotel Block Available',
        hotelBlockInfo: 'We have reserved a block of 20 rooms at Hotel Commonwealth for three nights (April 15-17, 2026). We will be sharing the booking code with ticket holders.',
        hotelBlockNote: 'Block of 20 rooms reserved for three nights',
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

      {/* Waitlist Section */}
      <section className="py-8 bg-blue-50 dark:bg-blue-900/20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              All tickets for the Summit 2026 are reserved! Join our waitlist!
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              We'll notify you when spots become available.
            </p>
          </div>
          <Card className="shadow-lg border-2 border-electric-blue/20 bg-white">
            <CardContent className="pt-6">
              {isWaitlistSubmitted ? (
                <div className="text-center py-8">
                  <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">You're on the list!</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Thank you for joining our waitlist. We'll notify you via email when spots become available.
                  </p>
                  <Button
                    onClick={() => {
                      setIsWaitlistSubmitted(false);
                      setWaitlistForm({ name: '', email: '', organization: '' });
                    }}
                    variant="outline"
                    className="bg-white dark:bg-gray-800"
                  >
                    Add Another Person
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleWaitlistSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="waitlist-name" className="flex items-center gap-2">
                        <User className="h-4 w-4 text-electric-blue" />
                        Name <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="waitlist-name"
                        type="text"
                        placeholder="Your full name"
                        value={waitlistForm.name}
                        onChange={(e) => setWaitlistForm({ ...waitlistForm, name: e.target.value })}
                        required
                        disabled={isSubmittingWaitlist}
                        className="bg-white dark:bg-gray-800"
                        maxLength={200}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="waitlist-email" className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-electric-blue" />
                        Email Address <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="waitlist-email"
                        type="email"
                        placeholder="your.email@example.com"
                        value={waitlistForm.email}
                        onChange={(e) => setWaitlistForm({ ...waitlistForm, email: e.target.value })}
                        required
                        disabled={isSubmittingWaitlist}
                        className="bg-white dark:bg-gray-800"
                        maxLength={200}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="waitlist-organization" className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-electric-blue" />
                      Your Organization <span className="text-gray-500 text-sm">(Optional)</span>
                    </Label>
                    <Input
                      id="waitlist-organization"
                      type="text"
                      placeholder="Your organization name"
                      value={waitlistForm.organization}
                      onChange={(e) => setWaitlistForm({ ...waitlistForm, organization: e.target.value })}
                      disabled={isSubmittingWaitlist}
                      className="bg-white dark:bg-gray-800"
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

          <div className="mb-8">
            <img 
              src="/slxai-bu-hero.png" 
              alt="SLxAI Summit at Boston University" 
              className="w-full h-auto rounded-lg shadow-lg"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            <div className="space-y-4">
              <div className="border-2 border-electric-blue rounded-lg p-4 shadow-xl bg-white">
                <div className="flex items-center justify-center gap-2 mb-3">
                  <Calendar className="h-5 w-5 text-electric-blue" />
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                    {getText('dateTimeTitle', 'Date & Time')}
                  </h3>
                </div>
                <div className="text-center text-gray-700 dark:text-white">
                  <p>
                    <strong>{getText('date', 'Date:')}</strong> {getText('dateValue', 'April 16-17, 2026')}<br />
                    <strong>{getText('conferenceHours', 'Conference Hours:')}</strong> {getText('conferenceHoursValue', '8:30 AM - 5:00 PM')}
                  </p>
                </div>
              </div>

              <div className="border-2 border-electric-blue rounded-lg p-4 shadow-xl bg-white">
                <div className="flex items-center justify-center gap-2 mb-3">
                  <MapPin className="h-5 w-5 text-electric-blue" />
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{getText('locationTitle', 'Location')}</h3>
                </div>
                <div className="text-center dark:text-white text-gray-700">
                  <strong>{getText('venue', 'Venue:')}</strong> {getText('venueValue', 'Boston University')}<br />
                  <strong>Building:</strong> Photonics Center<br />
                  <strong>{getText('city', 'City:')}</strong> {getText('cityValue', 'Boston, Massachusetts')}<br />
                  <strong>{getText('address', 'Address:')}</strong> {getText('addressValue', '8 St Mary\'s St')}<br />
                  {getText('addressValue2', 'Boston, MA 02215')}
                </div>
              </div>
            </div>

            <div className="border-2 border-electric-blue rounded-lg p-4 h-full flex flex-col shadow-xl bg-white">
              <div className="w-full rounded-lg overflow-hidden flex-1" style={{ minHeight: '300px' }}>
                  <iframe
                    src="https://www.google.com/maps?q=8+St+Mary's+St+Boston+MA+02215&output=embed"
                    width="100%"
                    height="100%"
                    style={{ 
                      border: 0,
                      filter: 'none' // Always light mode on homepage
                    }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="Boston University Deaf Center Location"
                  />
              </div>
            </div>

            <Card className="border border-gray-200 dark:border-gray-700 shadow-xl md:col-span-2 overflow-hidden">
              <CardHeader className="bg-electric-blue text-white text-center py-2 rounded-t-lg">
                <CardTitle className="text-white text-4xl font-bold">{getText('aboutSummitTitle', 'About Summit 2026')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 pt-4">
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

                <div className="-mx-6 -mt-4 mb-0">
                  <div className="bg-electric-blue text-white text-center py-2">
                    <h3 className="text-4xl font-bold text-white">
                      {getText('workshopListTitle', 'Workshops & Panels')}
                    </h3>
                  </div>
                  <div className="bg-blue-50 dark:bg-blue-900/20 px-6 pt-4 pb-6">
                    <div className="space-y-6">
                          {/* Keynote Speaker */}
                          <div className="border-2 border-electric-blue rounded-lg p-4 shadow-lg bg-white dark:bg-white">
                            <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                              Keynote Speaker Title: Breaking Communication Barriers
                            </h4>
                            <p className="text-base text-gray-700 dark:text-gray-300 mb-2">
                              <strong>Presenter:</strong> Ryan Hait-Campbell, <em>Convo Communications</em>
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              Ryan will open the summit with a look back at the early commercial foundations of sign language and AI and how the ecosystem has evolved since then. He will also outline what the next phase demands from the field, including quality, trust, and real world usability.
                            </p>
                          </div>

                          {/* Ethics Panel */}
                          <div className="border-2 border-electric-blue rounded-lg p-4 shadow-lg bg-white dark:bg-white">
                            <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                              Ethics: Where Does It Stop?
                            </h4>
                            <p className="text-base text-gray-700 dark:text-gray-300 mb-2">
                              <strong>Presenters:</strong> Dr. Abraham Glasser, PhD, Adam Munder, Thomas Horejes, Ph.D., CDI, Dr. Maartje De Meulder, Dr. Naomi Caselli
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              A panel on ethical boundaries and who carries responsibility when sign language AI systems are deployed at scale. Discussion will focus on power, consent, accountability, and what guardrails should be expected across research, product development, and procurement.
                            </p>
                          </div>

                          {/* Trust and Accountability */}
                          <div className="border-2 border-electric-blue rounded-lg p-4 shadow-lg bg-white dark:bg-white">
                            <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                              Trust and Accountability in Sign Language AI Innovation
                            </h4>
                            <p className="text-base text-gray-700 dark:text-gray-300 mb-2">
                              <strong>Presenter:</strong> Dr. Melissa Smith, Ed.D., <em>ASL Flurry</em>
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              This session focuses on how trust is earned and lost in sign language AI, and what accountability looks like beyond claims of accuracy. It will cover transparency, community informed validation, and practical ways to measure impact on real users.
                            </p>
                          </div>

                          {/* Research and Data Collection */}
                          <div className="border-2 border-electric-blue rounded-lg p-4 shadow-lg bg-white dark:bg-white">
                            <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                              Research and Data Collection: Strengthening Validity Through Partnerships
                            </h4>
                            <p className="text-base text-gray-700 dark:text-gray-300 mb-2">
                              <strong>Presenter:</strong> Pamela Macias, <em>University of Colorado Boulder</em>
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              A practical workshop on building research and data partnerships that improve validity and reduce bias. Participants will learn how to align goals across communities, institutions, and companies, and how to structure data work so results hold up under scrutiny.
                            </p>
                          </div>

                          {/* Intentional Design */}
                          <div className="border-2 border-electric-blue rounded-lg p-4 shadow-lg bg-white dark:bg-white">
                            <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                              Intentional Design for SL Translation: AI and Hybrid Approaches
                            </h4>
                            <p className="text-base text-gray-700 dark:text-gray-300 mb-2">
                              <strong>Presenters:</strong> Noreen Wilson, Molly Glass, Yeh Jun Kim, <em>Kara Technologies</em>
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              This workshop explores design choices for sign language translation systems, including hybrid approaches that blend AI with human workflows. It will emphasize user needs, context specific constraints, and what quality should mean in different settings.
                            </p>
                          </div>

                          {/* Lessons from Dataset Creation */}
                          <div className="border-2 border-electric-blue rounded-lg p-4 shadow-lg bg-white dark:bg-white">
                            <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                              Lessons from Dataset Creation for Sustainable Sign Language AI
                            </h4>
                            <p className="text-base text-gray-700 dark:text-gray-300 mb-2">
                              <strong>Presenters:</strong> Brian Birnbaum, Daniel Sommer, <em>Birnbaum Interpreting Services</em>
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              A deep dive into the realities of building sign language datasets that support long term innovation. The session will cover tradeoffs in scope, labeling, quality control, and sustainability, plus common pitfalls that create downstream model failures.
                            </p>
                          </div>

                          {/* Practical Applications */}
                          <div className="border-2 border-electric-blue rounded-lg p-4 shadow-lg bg-white dark:bg-white">
                            <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                              Practical Applications of AI Sign Language Translation
                            </h4>
                            <p className="text-base text-gray-700 dark:text-gray-300 mb-2">
                              <strong>Presenters:</strong> Ben Saunders, Marcus Oaten, <em>Signapse</em>
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              A session showing applied sign language AI in real workflows and communication settings. The presenters will share lessons learned from deployment, performance constraints, and what users consistently need in practice.
                            </p>
                          </div>

                          {/* Beyond Gloss */}
                          <div className="border-2 border-electric-blue rounded-lg p-4 shadow-lg bg-white dark:bg-white">
                            <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                              Beyond Gloss: A New Framework for Sign Language Data
                            </h4>
                            <p className="text-base text-gray-700 dark:text-gray-300 mb-2">
                              <strong>Presenters:</strong> Emanuele Chiusaroli, Marta Sanzari, <em>Handy Signs</em>
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              This session introduces a framework that goes beyond gloss as a primary representation, aiming for structured and machine readable sign language data. It will highlight why gloss can be limiting and what richer representations enable for training, evaluation, and downstream reasoning.
                            </p>
                          </div>

                          {/* Bridging the Gap */}
                          <div className="border-2 border-electric-blue rounded-lg p-4 shadow-lg bg-white dark:bg-white">
                            <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                              Bridging the Gap: Real Time AI Avatars and Sign Language Animation
                            </h4>
                            <p className="text-base text-gray-700 dark:text-gray-300 mb-2">
                              <strong>Presenter:</strong> Dr. Burak Uyanık, <em>Vosia.ai</em>
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              A session focused on real time avatars and sign language animation pipelines. It will cover how linguistic intent is mapped into motion and rendering, plus where current avatar systems still struggle in real communication contexts.
                            </p>
                          </div>

                          {/* A Better World */}
                          <div className="border-2 border-electric-blue rounded-lg p-4 shadow-lg bg-white dark:bg-white">
                            <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                              A Better World, Driven by Technology, Shaped by the Deaf
                            </h4>
                            <p className="text-base text-gray-700 dark:text-gray-300 mb-2">
                              <strong>Presenters:</strong> Sławek Łuczywek and Ashod Derandonyan, <em>Migam.ai</em>
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              A session centered on building technology with Deaf expertise integrated throughout the lifecycle, from requirements through validation. It will describe how Deaf led feedback loops shape product direction and strengthen user outcomes.
                            </p>
                          </div>

                          {/* The Future of Sign Language Translation */}
                          <div className="border-2 border-electric-blue rounded-lg p-4 shadow-lg bg-white dark:bg-white">
                            <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                              The Future of Sign Language Translation is Transcription
                            </h4>
                            <p className="text-base text-gray-700 dark:text-gray-300 mb-2">
                              <strong>Presenter:</strong> Dr. Amit Moryossef, <em>Nagish</em>
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              A focused talk proposing that transcription may be the right framing for many sign language AI use cases. It will explain why that framing matters for evaluation, product design, and setting accurate expectations for users.
                            </p>
                          </div>

                          {/* Human AI Collaboration */}
                          <div className="border-2 border-electric-blue rounded-lg p-4 shadow-lg bg-white dark:bg-white">
                            <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                              Human AI Collaboration in Sign Language Technology
                            </h4>
                            <p className="text-base text-gray-700 dark:text-gray-300 mb-2">
                              <strong>Presenters:</strong> Craig Radford, Brandon Dopf, <em>360 Direct Access</em>
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              This workshop examines how people and AI can collaborate in real deployments without degrading service quality. It will cover practical patterns for hybrid delivery, reliability expectations, and what breaks when organizations treat AI as a full replacement.
                            </p>
                          </div>

                          {/* Learning with Signers */}
                          <div className="border-2 border-electric-blue rounded-lg p-4 shadow-lg bg-white dark:bg-white">
                            <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                              Learning with Signers: Educational Applications of SLxAI
                            </h4>
                            <p className="text-base text-gray-700 dark:text-gray-300 mb-2">
                              <strong>Presenters:</strong> Dr. Lee Kezar, Dr. Lorna Quandt, Ph.D., Dr. Athena Willis, Laurel Aichler, <em>Gallaudet University</em>
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              A panel on educational and learning applications that use sign language AI, from classroom tools to learning supports and assessment. The session will emphasize what works, what fails, and how to design with signers as core partners.
                            </p>
                          </div>

                          {/* Good Enough for Whom */}
                          <div className="border-2 border-electric-blue rounded-lg p-4 shadow-lg bg-white dark:bg-white">
                            <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                              Good Enough for Whom? Ethics, Power, and Accountability in Sign Language AI Deployment
                            </h4>
                            <p className="text-base text-gray-700 dark:text-gray-300 mb-2">
                              <strong>Presenter:</strong> Dr. Maartje De Meulder, <em>HU University of Applied Sciences Utrecht (Hogeschool Utrecht)</em>
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              A workshop on how power and procurement shape what becomes "good enough," even when quality is uneven. Participants will explore accountability gaps, the risks of weak benchmarks, and what responsible deployment should require.
                            </p>
                          </div>

                          {/* A Linguistic Approach */}
                          <div className="border-2 border-electric-blue rounded-lg p-4 shadow-lg bg-white dark:bg-white">
                            <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                              A Linguistic Approach to Sign Language Data in AI Model Development
                            </h4>
                            <p className="text-base text-gray-700 dark:text-gray-300 mb-2">
                              <strong>Presenter:</strong> Dr. Naomi Caselli, <em>Boston University</em>
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              This session brings a linguistic lens to data design for sign language AI, including what must be captured to represent the language faithfully. It will connect linguistic structure to practical annotation and modeling choices that affect performance and usability.
                            </p>
                          </div>

                          {/* ASL, AI, and Authority */}
                          <div className="border-2 border-electric-blue rounded-lg p-4 shadow-lg bg-white dark:bg-white">
                            <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                              ASL, AI, and Authority: Centering Deaf ASL Experts in Language Technologies
                            </h4>
                            <p className="text-base text-gray-700 dark:text-gray-300 mb-2">
                              <strong>Presenters:</strong> Elisa Abenchuchan Vita, Lisa Gelineau, Raychelle Harris, PhD, Shelley Oishi, <em>TWA Innovations LLC</em>
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              A workshop on why ASL fluency is not the same as ASL authority, and how teams can center Deaf expertise in decision making. It will cover staffing, review processes, and governance practices that reduce harm and improve product quality.
                            </p>
                          </div>

                          {/* EUD */}
                          <div className="border-2 border-electric-blue rounded-lg p-4 shadow-lg bg-white dark:bg-white">
                            <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                              EUD: Sign Language in the Era of Artificial Intelligence
                            </h4>
                            <p className="text-base text-gray-700 dark:text-gray-300 mb-2">
                              <strong>Presenter:</strong> Andy Van Hoorebeke, <em>European Union of the Deaf</em>
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              As a key stakeholder in the EU policy landscape, EUD is building on its AI report to develop crucial tailored policy recommendations for EU institutions, ensuring that the rights of deaf sign language users are fully reflected in the implementation of the AI Act and related digital legislation.
                            </p>
                          </div>

                          {/* Sign Language AI and International Policy */}
                          <div className="border-2 border-electric-blue rounded-lg p-4 shadow-lg bg-white dark:bg-white">
                            <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                              Sign Language AI and International Policy Spaces
                            </h4>
                            <p className="text-base text-gray-700 dark:text-gray-300 mb-2">
                              <strong>Presenter:</strong> Dr. Joseph J. Murray, <em>World Federation of the Deaf</em>
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              A global policy session on how sign language AI is showing up in international forums, standards discussions, and advocacy work. Attendees will learn what issues are emerging and how to participate responsibly across countries and sign languages.
                            </p>
                          </div>

                          {/* Fireside Chat */}
                          <div className="border-2 border-electric-blue rounded-lg p-4 shadow-lg bg-white dark:bg-white">
                            <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                              Fireside Chat with Federal Communications Commission
                            </h4>
                            <p className="text-base text-gray-700 dark:text-gray-300 mb-2">
                              <strong>Featuring:</strong> Suzy Rosen Singleton and Travis Dougherty
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              A conversation on accessibility policy in the United States and how emerging sign language technologies may intersect with regulatory priorities. The discussion will focus on practical implications for industry, community, and public sector stakeholders.
                            </p>
                          </div>

                          {/* CoSET SAFE AI */}
                          <div className="border-2 border-electric-blue rounded-lg p-4 shadow-lg bg-white dark:bg-white">
                            <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                              CoSET SAFE AI: Designing for Communication Success
                            </h4>
                            <p className="text-base text-gray-700 dark:text-gray-300 mb-2">
                              <strong>Presenters:</strong> Dr. Abraham Glasser, PhD, Tim Riker, Stephanie Jo Kent, Celena Ponce, Jeffrey Shaul
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              A structured session introducing the CoSET SAFE AI approach and how it can be used to evaluate communication outcomes, safety, and reliability. Participants will leave with a clearer framework for assessing systems, setting requirements, and communicating limitations responsibly.
                            </p>
                          </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Evening Event Section */}
            <Card className="border border-gray-200 dark:border-gray-700 shadow-xl md:col-span-2 overflow-hidden">
              <CardHeader className="bg-electric-blue text-white text-center py-2 rounded-t-lg">
                <CardTitle className="text-white text-4xl font-bold">Evening Event</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="text-center mb-6">
                  <h3 className="text-4xl font-bold text-gray-900 dark:text-white mb-2" style={{ fontFamily: 'RedSoxFont, serif' }}>Bleacher Bar at Fenway Stadium</h3>
                  <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">7-10 PM April 16th, closed for only the summit attendees</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                    <img 
                      src="/bleacher-bar-view.png" 
                      alt="Bleacher Bar view of Fenway Park field" 
                      className="w-full h-80 object-cover rounded-lg shadow-lg"
                    />
                    <img 
                      src="/bleacher-bar-entry.png" 
                      alt="Bleacher Bar interior view" 
                      className="w-full h-80 object-cover rounded-lg shadow-lg"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Hotel Block and Travel Advice - Full Width */}
        <div className="w-full px-4 sm:px-6 lg:px-8 mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch max-w-7xl mx-auto">
            <Card className="border-2 border-white shadow-xl flex flex-col overflow-hidden bg-white rounded-lg">
              <CardHeader className="bg-electric-blue text-white text-center py-2 rounded-t-lg">
                <CardTitle className="text-white text-4xl font-bold">{getText('hotelsTitle', 'Hotel Block')}</CardTitle>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col p-4">
                <div className="flex-1">
                  <div className="space-y-2 text-sm text-gray-900 dark:text-white">
                    <p><strong>Hotel:</strong> Sheraton Boston Hotel</p>
                    <p><strong>Rate:</strong> $339 per night</p>
                    <p><strong>Available dates:</strong> Evening of April 15, April 16, and April 17 only</p>
                    <p><strong>Guests may reserve:</strong> 1 to 3 nights within these dates</p>
                    <p className="mt-3">
                      <strong>Reservation link:</strong>{' '}
                      <a 
                        href="https://book.passkey.com/go/SLxAI2026Summit" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-electric-blue underline hover:text-electric-blue/80"
                      >
                        https://book.passkey.com/go/SLxAI2026Summit
                      </a>
                    </p>
                    <p className="text-sm mt-2">
                      Guests may reserve online using the link above or by calling Marriott Reservations and referencing the SLxAI Summit room block. Reservations may be made or canceled at any time before the cutoff date of Monday, March 16, 2026.
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-white/30 dark:border-white/20">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Important notes:</p>
                    <ul className="text-sm text-gray-900 dark:text-white space-y-1">
                      <li className="flex items-start">
                        <span className="mr-2">•</span>
                        <span>Guests are responsible for room rate, taxes, and any incidental charges.</span>
                      </li>
                      <li className="flex items-start">
                        <span className="mr-2">•</span>
                        <span>A credit card will be required at the time of reservation and upon check in.</span>
                      </li>
                      <li className="flex items-start">
                        <span className="mr-2">•</span>
                        <span>Guests are encouraged to use their Marriott Bonvoy account when booking.</span>
                      </li>
                      <li className="flex items-start">
                        <span className="mr-2">•</span>
                        <span>We recommend booking early, as the block is limited and April is a busy month in Boston.</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 border-white shadow-xl flex flex-col w-full overflow-hidden bg-white rounded-lg">
              <CardHeader className="bg-electric-blue text-white text-center py-2 rounded-t-lg">
                <CardTitle className="text-white text-4xl font-bold">{getText('travelAdviceTitle', 'Travel Advice')}</CardTitle>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col p-4">
                <div className="flex-1">
                  <div className="space-y-3 text-gray-700 dark:text-white text-sm">
                  <div>
                    <strong className="text-gray-900 dark:text-white">{getText('byAir', 'By Air:')}</strong>
                    <ul className="mt-1 ml-4 space-y-1">
                      <li className="flex items-start">
                        <span className="text-electric-blue mr-2">•</span>
                        <span>{getText('airport1', 'Boston Logan International Airport (BOS) - 6 miles from BU. Take the MBTA Silver Line or taxi/Uber (~20-30 minutes)')}</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-electric-blue mr-2">•</span>
                        <span>{getText('airport2', 'Providence T.F. Green Airport (PVD) - 50 miles from BU. Take commuter rail to Boston South Station, then MBTA Green Line (~1.5 hours)')}</span>
                      </li>
                    </ul>
                  </div>
                  <div>
                    <strong className="text-gray-900 dark:text-white">{getText('byTrain', 'By Train:')}</strong>
                    <ul className="mt-1 ml-4 space-y-1">
                      <li className="flex items-start">
                        <span className="text-electric-blue mr-2">•</span>
                        <span>{getText('train1', 'Amtrak - Arrives at Boston South Station or Back Bay Station. Take MBTA Green Line B train to BU stops')}</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-electric-blue mr-2">•</span>
                        <span>{getText('train2', 'MBTA Commuter Rail - Connects to Boston from surrounding areas. Transfer to Green Line B at various stations')}</span>
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
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Interested Companies Section */}
      <section className="py-4 bg-blue-50 dark:bg-blue-900/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <InterestedCompanies />
        </div>
      </section>

      {/* Membership Section */}
      <section id="membership" className="py-4 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">{getText('membershipTitle', 'Become a Founding Member')}</h2>
            <p className="text-lg text-gray-600 whitespace-nowrap">
              {getText('membershipDescription', 'Join the inaugural group of industry leaders that will establish the SLxAI cooperative nonprofit.')}
            </p>
          </div>

          {/* Founding Member Benefits */}
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-3">{getText('foundingBenefitsTitle', 'Founding Member Benefits')}</h3>

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
