import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { submitWorkshop, submitSponsor } from '@/data/summit2026';
import { Calendar, MapPin, Clock, Users, Send, Loader2, Briefcase, Building2, Plus, X, Hotel, Plane, Mail } from 'lucide-react';
import { getCurrentUser } from '@/lib/auth';
import { sanitizeText } from '@/lib/security';
import { PageTitle } from '@/components/PageTitle';
import { useIsLandscape } from '@/hooks/use-mobile';
import { useTheme } from '@/contexts/ThemeContext';
import { Link } from 'react-router-dom';
import { UserAvatar } from '@/components/UserAvatar';
import { getSummitMembers, SummitMember } from '@/data/summit';
import { format } from 'date-fns';

// Validation helpers
const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validateURL = (url: string): boolean => {
  if (!url) return true; // Optional field
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

const validatePhone = (phone: string): boolean => {
  if (!phone) return true; // Optional field
  const phoneRegex = /^[\d\s\-\+\(\)]+$/;
  return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 10;
};

export default function Summit2026() {
  const { toast } = useToast();
  const isLandscape = useIsLandscape();
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState<'info' | 'workshop' | 'sponsor'>('info');
  const [isSubmittingWorkshop, setIsSubmittingWorkshop] = useState(false);
  const [isSubmittingSponsor, setIsSubmittingSponsor] = useState(false);
  const [summitMembers, setSummitMembers] = useState<SummitMember[]>([]);

  // Workshop form state
  const [workshopForm, setWorkshopForm] = useState({
    title: '',
    description: '',
    submissionType: 'workshop' as 'workshop' | 'panel',
    presenters: [
      {
        id: `presenter-${Date.now()}`,
        name: '',
        email: '',
        bio: '',
        organization: '',
      }
    ] as Array<{ id: string; name: string; email: string; bio: string; organization: string }>,
    learningObjectives: '',
    technicalRequirements: '',
    additionalInfo: '',
  });

  // Sponsor form state
  const [sponsorForm, setSponsorForm] = useState({
    companyName: '',
    contactName: '',
    contactEmail: '',
    contactPhone: '',
    companyWebsite: '',
    sponsorshipPackages: [] as string[],
    sponsorshipAmount: '',
    sponsorshipPackageDetails: '',
    companyDescription: '',
    previousSponsorshipExperience: '',
    marketingGoals: '',
    additionalRequests: '',
    companyType: '' as '' | 'company' | 'nonprofit' | 'startup',
  });

  // Validation errors state
  const [workshopErrors, setWorkshopErrors] = useState<{ [key: string]: string }>({});
  const [sponsorErrors, setSponsorErrors] = useState<{ [key: string]: string }>({});

  // Auto-save drafts to localStorage
  useEffect(() => {
    const workshopDraft = localStorage.getItem('summit2026_workshop_draft');
    const sponsorDraft = localStorage.getItem('summit2026_sponsor_draft');
    
    if (workshopDraft && activeTab === 'workshop') {
      try {
        const parsed = JSON.parse(workshopDraft);
        setWorkshopForm(parsed);
      } catch (e) {
        // Invalid draft, ignore
      }
    }
    
    if (sponsorDraft && activeTab === 'sponsor') {
      try {
        const parsed = JSON.parse(sponsorDraft);
        setSponsorForm(parsed);
      } catch (e) {
        // Invalid draft, ignore
      }
    }
  }, [activeTab]);

  // Save workshop form draft
  useEffect(() => {
    if (activeTab === 'workshop' && (workshopForm.title || workshopForm.description || workshopForm.presenters.some(p => p.name || p.email))) {
      localStorage.setItem('summit2026_workshop_draft', JSON.stringify(workshopForm));
    }
  }, [workshopForm, activeTab]);

  // Save sponsor form draft
  useEffect(() => {
    if (activeTab === 'sponsor' && (sponsorForm.companyName || sponsorForm.contactName || sponsorForm.contactEmail)) {
      localStorage.setItem('summit2026_sponsor_draft', JSON.stringify(sponsorForm));
    }
  }, [sponsorForm, activeTab]);

  // Load summit members
  useEffect(() => {
    const loadSummitMembers = async () => {
      try {
        const members = await getSummitMembers();
        setSummitMembers(members);
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          console.error('Error loading summit members:', error);
        }
      }
    };
    
    if (activeTab === 'info') {
      loadSummitMembers();
    }
  }, [activeTab]);

  // Add presenter
  const handleAddPresenter = () => {
    setWorkshopForm(prev => ({
      ...prev,
      presenters: [
        ...prev.presenters,
        {
          id: `presenter-${Date.now()}`,
          name: '',
          email: '',
          bio: '',
          organization: '',
        }
      ]
    }));
  };

  // Remove presenter
  const handleRemovePresenter = (presenterId: string) => {
    if (workshopForm.presenters.length <= 1) {
      toast({
        title: 'Cannot Remove',
        description: 'At least one presenter is required.',
        variant: 'destructive',
      });
      return;
    }
    setWorkshopForm(prev => ({
      ...prev,
      presenters: prev.presenters.filter(p => p.id !== presenterId)
    }));
  };

  // Update presenter field
  const handlePresenterChange = (presenterId: string, field: string, value: string) => {
    setWorkshopForm(prev => ({
      ...prev,
      presenters: prev.presenters.map(p =>
        p.id === presenterId ? { ...p, [field]: value } : p
      )
    }));
    
    // Real-time validation for presenter email
    if (field === 'email' && value) {
      if (!validateEmail(value)) {
        setWorkshopErrors(prev => ({ ...prev, [`presenter-${presenterId}-email`]: 'Invalid email format' }));
      } else {
        setWorkshopErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors[`presenter-${presenterId}-email`];
          return newErrors;
        });
      }
    }
  };

  const handleWorkshopSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!workshopForm.title.trim() || !workshopForm.description.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in title and description.',
        variant: 'destructive',
      });
      return;
    }

    // Validate presenters
    const invalidPresenters = workshopForm.presenters.filter(p => !p.name.trim() || !p.email.trim() || !p.organization.trim() || !p.bio.trim());
    if (invalidPresenters.length > 0) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in name, email, organization, and bio for all presenters.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmittingWorkshop(true);
    try {
      const user = getCurrentUser();
      await submitWorkshop({
        title: sanitizeText(workshopForm.title),
        description: sanitizeText(workshopForm.description),
        submissionType: workshopForm.submissionType,
        presenters: workshopForm.presenters.map(p => ({
          name: sanitizeText(p.name),
          email: p.email,
          bio: p.bio ? sanitizeText(p.bio) : undefined,
          organization: p.organization ? sanitizeText(p.organization) : undefined,
        })),
        learningObjectives: workshopForm.learningObjectives ? sanitizeText(workshopForm.learningObjectives) : undefined,
        technicalRequirements: workshopForm.technicalRequirements ? sanitizeText(workshopForm.technicalRequirements) : undefined,
        additionalInfo: workshopForm.additionalInfo ? sanitizeText(workshopForm.additionalInfo) : undefined,
      });

      toast({
        title: 'Submission Successful',
        description: 'Your workshop/panel submission has been received. You will receive an email confirmation shortly. The committee will review your submission and contact you within 2-3 weeks.',
      });

      // Reset form and clear draft
      setWorkshopForm({
        title: '',
        description: '',
        submissionType: 'workshop',
        presenters: [
          {
            id: `presenter-${Date.now()}`,
            name: '',
            email: '',
            bio: '',
            organization: '',
          }
        ],
        learningObjectives: '',
        technicalRequirements: '',
        additionalInfo: '',
      });
      setWorkshopErrors({});
      localStorage.removeItem('summit2026_workshop_draft');
    } catch (error: any) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error submitting workshop:', error);
      }
      let errorMessage = 'Failed to submit your workshop/panel. Please try again.';
      if (error?.message?.includes('network') || error?.message?.includes('fetch')) {
        errorMessage = 'Network error. Please check your connection and try again.';
      } else if (error?.message) {
        errorMessage = error.message;
      }
      toast({
        title: 'Submission Failed',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsSubmittingWorkshop(false);
    }
  };

  const handleSponsorSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clear previous errors
    setSponsorErrors({});
    
    // Validate required fields
    const errors: { [key: string]: string } = {};
    if (!sponsorForm.companyName.trim()) {
      errors.companyName = 'Company name is required';
    }
    if (!sponsorForm.contactName.trim()) {
      errors.contactName = 'Contact name is required';
    }
    if (!sponsorForm.contactEmail.trim()) {
      errors.contactEmail = 'Contact email is required';
    } else if (!validateEmail(sponsorForm.contactEmail)) {
      errors.contactEmail = 'Invalid email format';
    }
    if (sponsorForm.contactPhone && !validatePhone(sponsorForm.contactPhone)) {
      errors.contactPhone = 'Invalid phone number format';
    }
    if (sponsorForm.companyWebsite && !validateURL(sponsorForm.companyWebsite)) {
      errors.companyWebsite = 'Invalid URL format';
    }
    if (sponsorForm.sponsorshipPackages.length === 0) {
      errors.sponsorshipPackages = 'Please select at least one sponsorship package';
    }
    
    if (Object.keys(errors).length > 0) {
      setSponsorErrors(errors);
      toast({
        title: 'Validation Error',
        description: 'Please fix the errors in the form before submitting.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmittingSponsor(true);
    try {
      await submitSponsor({
        companyName: sanitizeText(sponsorForm.companyName),
        contactName: sanitizeText(sponsorForm.contactName),
        contactEmail: sponsorForm.contactEmail,
        contactPhone: sponsorForm.contactPhone ? sanitizeText(sponsorForm.contactPhone) : undefined,
        companyWebsite: sponsorForm.companyWebsite || undefined,
        sponsorshipLevel: sponsorForm.sponsorshipPackages.length > 0 ? sponsorForm.sponsorshipPackages.join(', ') : undefined,
        sponsorshipAmount: sponsorForm.sponsorshipAmount ? parseFloat(sponsorForm.sponsorshipAmount) : undefined,
        sponsorshipPackageDetails: sponsorForm.sponsorshipPackageDetails ? sanitizeText(sponsorForm.sponsorshipPackageDetails) : undefined,
        companyDescription: sponsorForm.companyDescription ? sanitizeText(sponsorForm.companyDescription) : undefined,
        previousSponsorshipExperience: sponsorForm.previousSponsorshipExperience ? sanitizeText(sponsorForm.previousSponsorshipExperience) : undefined,
        marketingGoals: sponsorForm.marketingGoals ? sanitizeText(sponsorForm.marketingGoals) : undefined,
        additionalRequests: sponsorForm.additionalRequests ? sanitizeText(sponsorForm.additionalRequests) : undefined,
      });

      toast({
        title: 'Submission Successful',
        description: 'Your sponsorship submission has been received. You will receive an email confirmation shortly. Our team will review your inquiry and contact you within 1-2 weeks.',
      });

      // Reset form and clear draft
      setSponsorForm({
        companyName: '',
        contactName: '',
        contactEmail: '',
        contactPhone: '',
        companyWebsite: '',
        sponsorshipPackages: [],
        sponsorshipAmount: '',
        sponsorshipPackageDetails: '',
        companyDescription: '',
        previousSponsorshipExperience: '',
        marketingGoals: '',
        additionalRequests: '',
        companyType: '',
      });
      setSponsorErrors({});
      localStorage.removeItem('summit2026_sponsor_draft');
    } catch (error: any) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error submitting sponsor:', error);
      }
      let errorMessage = 'Failed to submit your sponsorship. Please try again.';
      if (error?.message?.includes('network') || error?.message?.includes('fetch')) {
        errorMessage = 'Network error. Please check your connection and try again.';
      } else if (error?.message) {
        errorMessage = error.message;
      }
      toast({
        title: 'Submission Failed',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsSubmittingSponsor(false);
    }
  };

  return (
    <div className="space-y-0 md:space-y-6">
      {/* Header */}
      <PageTitle title="Summit 2026" fullWidthLandscape={true} />

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('info')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'info'
              ? 'border-electric-blue text-electric-blue'
              : 'border-transparent text-gray-600 dark:text-white hover:text-gray-900 dark:hover:text-white'
          }`}
          aria-label="Conference Information tab"
          aria-selected={activeTab === 'info'}
          role="tab"
        >
          Conference Information
        </button>
        <button
          onClick={() => setActiveTab('workshop')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'workshop'
              ? 'border-electric-blue text-electric-blue'
              : 'border-transparent text-gray-600 dark:text-white hover:text-gray-900 dark:hover:text-white'
          }`}
          aria-label="Submit Workshop/Panel tab"
          aria-selected={activeTab === 'workshop'}
          role="tab"
        >
          Submit Workshop/Panel
        </button>
        <button
          onClick={() => setActiveTab('sponsor')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'sponsor'
              ? 'border-electric-blue text-electric-blue'
              : 'border-transparent text-gray-600 dark:text-white hover:text-gray-900 dark:hover:text-white'
          }`}
          aria-label="Become a Sponsor tab"
          aria-selected={activeTab === 'sponsor'}
          role="tab"
        >
          Become a Sponsor
        </button>
      </div>

      {/* Conference Information Tab */}
      {activeTab === 'info' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="glass-card floating-hover">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center justify-center gap-2">
                <Calendar className="h-5 w-5 text-electric-blue" />
                Date & Time
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center p-3 pt-0">
              <div className="text-gray-700 dark:text-white">
                <p>
                  <strong>Date:</strong> April 16-17, 2026<br />
                  <strong>Conference Hours:</strong> 8:30 AM - 5:00 PM<br />
                  <strong>Evening Events:</strong> Evening events on both nights<br />
                  <strong>Pre-Conference:</strong> Possible social light event on April 15
                </p>
                <div className="flex items-center justify-center gap-2 mb-2 mt-4">
                  <MapPin className="h-5 w-5 text-electric-blue" />
                  <h3 className="text-2xl font-semibold leading-none tracking-tight text-gray-900 dark:text-white">Location</h3>
                </div>
                <div className="dark:text-white">
                  <strong>Venue:</strong> Boston University<br />
                  <strong>City:</strong> Boston, Massachusetts<br />
                  <strong>Address:</strong> 808 Commonwealth Avenue<br />
                  Boston, MA 02215
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card floating-hover">
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

          <Card className="glass-card floating-hover md:col-span-2">
            <CardHeader>
              <CardTitle>About Summit 2026</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4 text-gray-700 dark:text-white leading-relaxed">
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">SLxAI Summit 2026 Overview</h3>
                  <p>
                    SLxAI Summit 2026 brings global researchers, companies, and Deaf led innovators together at Boston University. 
                    The summit focuses on the future of sign language AI, ethical design, multilingual access, and collaboration 
                    across the international ecosystem.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Host</h3>
                  <p>
                    The summit is held at Boston University. The Deaf Center at BU, directed by Naomi Caselli, supports research 
                    in sign language linguistics, Deaf studies, and technology. It serves as a core partner for this event and 
                    strengthens the summit with its academic and community expertise.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Program Format</h3>
                  <p>
                    The event is built around plenary sessions. All attendees share the same room for every talk, demo, and panel. 
                    This format ensures everyone hears the same discussions and engages in the same conversations without splitting 
                    the audience. Presenter teams come from universities, companies, and Deaf led organizations.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Focus Areas:</h3>
                  <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-gray-700 dark:text-white">
                    <div className="flex items-start">
                      <span className="text-electric-blue mr-2">•</span>
                      <span>Sign Language Recognition (SLR)</span>
                    </div>
                    <div className="flex items-start">
                      <span className="text-electric-blue mr-2">•</span>
                      <span>Ethics and Governance</span>
                    </div>
                    <div className="flex items-start">
                      <span className="text-electric-blue mr-2">•</span>
                      <span>Sign Language Avatar (SLA)</span>
                    </div>
                    <div className="flex items-start">
                      <span className="text-electric-blue mr-2">•</span>
                      <span>Research and Innovation</span>
                    </div>
                    <div className="flex items-start">
                      <span className="text-electric-blue mr-2">•</span>
                      <span>SLR and SLA Applications</span>
                    </div>
                    <div className="flex items-start">
                      <span className="text-electric-blue mr-2">•</span>
                      <span>Global Benchmarks</span>
                    </div>
                    <div className="flex items-start">
                      <span className="text-electric-blue mr-2">•</span>
                      <span>Networking</span>
                    </div>
                    <div className="flex items-start">
                      <span className="text-electric-blue mr-2">•</span>
                      <span>Emerging Technologies</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Booths and Exhibits</h3>
                  <p>
                    Sponsor booths are located inside the same main room as the plenary sessions. Attendees can move between the 
                    sessions area and the exhibit area without leaving the space. This setup keeps the energy in one place and gives 
                    sponsors constant visibility.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Pre Conference Social</h3>
                  <p>
                    A welcome social is held the evening before the summit. This informal gathering helps people meet one another 
                    early and builds momentum leading into the conference day.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Conference Day</h3>
                  <p>
                    The summit opens with keynote remarks followed by a full day of plenary sessions. Lunch is provided for all 
                    attendees. The main room includes sponsor booths, demo tables, and product displays. Attendees can explore 
                    booths during breaks and transitions between sessions.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Evening Events</h3>
                  <p>
                    Sponsors may host evening activities, receptions, or demonstrations. These optional events give companies 
                    additional ways to connect with attendees and showcase their work.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card floating-hover">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-electric-blue" />
                Capacity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 dark:text-white">
                <strong>Max Capacity:</strong> 200 attendees<br />
                <strong>Workshops/Panels:</strong> Up to 15
              </p>
            </CardContent>
          </Card>

          <Card className="glass-card floating-hover">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-electric-blue" />
                Important Dates
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 dark:text-white">
                <strong>Presentation Submission Deadline:</strong> January 31, 2026<br />
                <strong>Registration Fee:</strong> TBD
              </p>
            </CardContent>
          </Card>

          <Card className="glass-card floating-hover">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Hotel className="h-5 w-5 text-electric-blue" />
                Hotels Near Boston University
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 dark:text-white text-sm">
                Several hotels are located within walking distance or a short ride from Boston University. 
                We recommend booking early as April is a busy time in Boston. Popular options include:
              </p>
              <ul className="mt-3 space-y-2 text-gray-700 dark:text-white text-sm">
                <li className="flex items-start">
                  <span className="text-electric-blue mr-2">•</span>
                  <span><strong>Hotel Commonwealth</strong> - 500 Commonwealth Avenue (0.3 miles)</span>
                </li>
                <li className="flex items-start">
                  <span className="text-electric-blue mr-2">•</span>
                  <span><strong>Hyatt Regency Boston</strong> - 1 Avenue de Lafayette (3.5 miles)</span>
                </li>
                <li className="flex items-start">
                  <span className="text-electric-blue mr-2">•</span>
                  <span><strong>Boston Marriott Copley Place</strong> - 110 Huntington Avenue (2.5 miles)</span>
                </li>
                <li className="flex items-start">
                  <span className="text-electric-blue mr-2">•</span>
                  <span><strong>Holiday Inn Express</strong> - 1200 Beacon Street (0.5 miles)</span>
                </li>
                <li className="flex items-start">
                  <span className="text-electric-blue mr-2">•</span>
                  <span><strong>Residence Inn by Marriott</strong> - 1200 Beacon Street (0.5 miles)</span>
                </li>
              </ul>
              <p className="mt-3 text-gray-600 dark:text-white text-xs">
                Additional hotel options are available throughout Boston. Consider using booking sites to compare rates and locations.
              </p>
            </CardContent>
          </Card>

          <Card className="glass-card floating-hover">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plane className="h-5 w-5 text-electric-blue" />
                Travel Advice
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-gray-700 dark:text-white text-sm">
                <div>
                  <strong className="text-gray-900 dark:text-white">By Air:</strong>
                  <ul className="mt-1 ml-4 space-y-1">
                    <li className="flex items-start">
                      <span className="text-electric-blue mr-2">•</span>
                      <span><strong>Boston Logan International Airport (BOS)</strong> - 6 miles from BU. Take the MBTA Silver Line or taxi/Uber (~20-30 minutes)</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-electric-blue mr-2">•</span>
                      <span><strong>Providence T.F. Green Airport (PVD)</strong> - 50 miles from BU. Take commuter rail to Boston South Station, then MBTA Green Line (~1.5 hours)</span>
                    </li>
                  </ul>
                </div>
                <div>
                  <strong className="text-gray-900 dark:text-white">By Train:</strong>
                  <ul className="mt-1 ml-4 space-y-1">
                    <li className="flex items-start">
                      <span className="text-electric-blue mr-2">•</span>
                      <span><strong>Amtrak</strong> - Arrives at Boston South Station or Back Bay Station. Take MBTA Green Line B train to BU stops</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-electric-blue mr-2">•</span>
                      <span><strong>MBTA Commuter Rail</strong> - Connects to Boston from surrounding areas. Transfer to Green Line B at various stations</span>
                    </li>
                  </ul>
                </div>
                <div>
                  <strong className="text-gray-900 dark:text-white">Public Transportation:</strong>
                  <p className="mt-1 ml-4">
                    Boston University is accessible via the MBTA Green Line B train. Key stops include: BU Central, BU East, and Blandford Street. 
                    The MBTA also offers bus routes throughout the city.
                  </p>
                </div>
                <div>
                  <strong className="text-gray-900 dark:text-white">Parking:</strong>
                  <p className="mt-1 ml-4">
                    We are working with BU to secure parking spaces on campus for attendees. 
                    Limited parking is available on campus. We recommend using public transportation or ride-sharing services. 
                    Street parking is metered and limited.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Summit Committee Members */}
          <Card className="glass-card floating-hover md:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-electric-blue" />
                Summit Committee Members ({summitMembers.length})
              </CardTitle>
              <CardDescription>
                All members of the Summit Planning Committee
              </CardDescription>
            </CardHeader>
            <CardContent>
              {summitMembers.length === 0 ? (
                <div className="text-center py-8 text-sm text-gray-500 dark:text-white">
                  No summit committee members yet. Add members from the Admin panel.
                </div>
              ) : (
                <div className={`grid ${isLandscape ? 'grid-cols-3' : 'grid-cols-1'} md:grid-cols-2 lg:grid-cols-3 gap-4`}>
                  {summitMembers.map((member) => (
                    <Link
                      key={member.email}
                      to={`/membership-portal/member/${encodeURIComponent(member.email)}`}
                      className="flex items-start gap-4 p-4 border border-electric-blue/20 dark:border-electric-blue/30 rounded-lg bg-electric-blue/5 dark:bg-electric-blue/10 backdrop-blur-sm hover:bg-electric-blue/10 dark:hover:bg-electric-blue/20 transition-all cursor-pointer"
                    >
                      <div className="flex flex-col items-center gap-2 flex-shrink-0">
                        <UserAvatar
                          email={member.email}
                          name={member.name}
                          size="2xl"
                        />
                      </div>
                      <div className="flex-1 min-w-0 space-y-1">
                        <h4 className="font-medium text-sm text-gray-900 dark:text-white">{member.name}</h4>
                        <span 
                          className="text-sm text-electric-blue hover:underline flex items-center gap-1.5 cursor-pointer dark:text-electric-blue"
                          onClick={(e) => {
                            e.stopPropagation();
                            window.location.href = `mailto:${member.email}`;
                          }}
                        >
                          <Mail className="h-4 w-4" />
                          <span className="truncate">{member.email}</span>
                        </span>
                        {member.addedAt && (
                          <p className="text-xs text-gray-500 dark:text-white mt-1">
                            Added {format(new Date(member.addedAt), 'MMM d, yyyy')}
                          </p>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Workshop/Panel Submission Tab */}
      {activeTab === 'workshop' && (
        <Card className="glass-card floating-hover">
          <CardHeader>
            <CardTitle>Submit Workshop or Panel Proposal</CardTitle>
            <CardDescription>
              We are accepting up to 15 workshops/panels for Summit 2026. Submit your proposal below.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Important Information Notice */}
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-blue-900">
                    Important Submission Information
                  </p>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>
                      <strong>Deadline:</strong> Submissions must be received by the end of January 2026
                    </li>
                    <li>
                      <strong>Duration:</strong> All workshops and panels are limited to no more than 50 minutes
                    </li>
                    <li>
                      <strong>Registration Fee Waiver:</strong> All presenters will be waived from conference registration fees
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <form onSubmit={handleWorkshopSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <Label htmlFor="submissionType-select" className="dark:text-white">Submission Type *</Label>
                  <Select
                    name="submissionType"
                    value={workshopForm.submissionType}
                    onValueChange={(value) => setWorkshopForm({ ...workshopForm, submissionType: value as 'workshop' | 'panel' })}
                  >
                    <SelectTrigger id="submissionType" aria-label="Submission type" aria-required="true">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="workshop">Workshop</SelectItem>
                      <SelectItem value="panel">Panel</SelectItem>
                    </SelectContent>
                  </Select>
                  <select
                    id="submissionType-select"
                    name="submissionType"
                    value={workshopForm.submissionType}
                    onChange={() => {}}
                    style={{ position: 'absolute', border: '0px', width: '1px', height: '1px', padding: '0px', margin: '-1px', overflow: 'hidden', clip: 'rect(0px, 0px, 0px, 0px)', whiteSpace: 'nowrap', overflowWrap: 'normal' }}
                    aria-hidden="true"
                    tabIndex={-1}
                  >
                    <option value="workshop">Workshop</option>
                    <option value="panel">Panel</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="title" className="dark:text-white">Title *</Label>
                  <Input
                    id="title"
                    name="title"
                    value={workshopForm.title}
                    onChange={(e) => setWorkshopForm({ ...workshopForm, title: e.target.value })}
                    placeholder="Enter workshop/panel title"
                    required
                    aria-label="Workshop or panel title"
                    aria-required="true"
                    maxLength={200}
                  />
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="description" className="dark:text-white">Description *</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={workshopForm.description}
                    onChange={(e) => setWorkshopForm({ ...workshopForm, description: e.target.value })}
                    placeholder="Provide a detailed description of your workshop/panel"
                    rows={5}
                    required
                    aria-label="Workshop or panel description"
                    aria-required="true"
                    maxLength={2000}
                  />
                </div>

                {/* Presenters Section */}
                <div className="md:col-span-2">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium dark:text-white">
                      {workshopForm.submissionType === 'panel' ? 'Panel Members' : 'Presenters'} *
                    </p>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleAddPresenter}
                      className="h-8"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add {workshopForm.submissionType === 'panel' ? 'Panel Member' : 'Presenter'}
                    </Button>
                  </div>
                  <div className="space-y-4 border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-800">
                    {workshopForm.presenters.map((presenter, index) => (
                      <div key={presenter.id} className="bg-white dark:bg-[hsl(217,40%,18%)] rounded-lg p-4 border border-gray-200 dark:border-[hsl(217,35%,25%)]">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-medium text-sm text-gray-900 dark:text-white">
                            {workshopForm.submissionType === 'panel' ? 'Panel Member' : 'Presenter'} {index + 1}
                          </h4>
                          {workshopForm.presenters.length > 1 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemovePresenter(presenter.id)}
                              className="h-7 w-7 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor={`presenter-name-${presenter.id}`} className="dark:text-white">
                              {workshopForm.submissionType === 'panel' ? 'Panel Member' : 'Presenter'} Name *
                            </Label>
                            <Input
                              id={`presenter-name-${presenter.id}`}
                              name={`presenter-name-${presenter.id}`}
                              value={presenter.name}
                              onChange={(e) => handlePresenterChange(presenter.id, 'name', e.target.value)}
                              placeholder="Full name"
                              required
                            />
                          </div>
                          <div>
                            <Label htmlFor={`presenter-email-${presenter.id}`} className="dark:text-white">Email *</Label>
                            <Input
                              id={`presenter-email-${presenter.id}`}
                              name={`presenter-email-${presenter.id}`}
                              type="email"
                              value={presenter.email}
                              onChange={(e) => handlePresenterChange(presenter.id, 'email', e.target.value)}
                              placeholder="email@example.com"
                              required
                              aria-label={`${workshopForm.submissionType === 'panel' ? 'Panel member' : 'Presenter'} email address`}
                              aria-required="true"
                              aria-invalid={presenter.email && !validateEmail(presenter.email)}
                              className={workshopErrors[`presenter-${presenter.id}-email`] ? 'border-red-500' : ''}
                            />
                            {workshopErrors[`presenter-${presenter.id}-email`] && (
                              <p className="text-xs text-red-600 dark:text-red-400 mt-1">{workshopErrors[`presenter-${presenter.id}-email`]}</p>
                            )}
                          </div>
                          <div className="md:col-span-2">
                            <Label htmlFor={`presenter-organization-${presenter.id}`} className="dark:text-white">Organization *</Label>
                            <Input
                              id={`presenter-organization-${presenter.id}`}
                              name={`presenter-organization-${presenter.id}`}
                              value={presenter.organization}
                              onChange={(e) => handlePresenterChange(presenter.id, 'organization', e.target.value)}
                              placeholder="Organization name"
                              required
                            />
                          </div>
                          <div className="md:col-span-2">
                            <Label htmlFor={`presenter-bio-${presenter.id}`} className="dark:text-white">
                              {workshopForm.submissionType === 'panel' ? 'Panel Member' : 'Presenter'} Bio *
                            </Label>
                            <Textarea
                              id={`presenter-bio-${presenter.id}`}
                              name={`presenter-bio-${presenter.id}`}
                              value={presenter.bio}
                              onChange={(e) => handlePresenterChange(presenter.id, 'bio', e.target.value)}
                              placeholder={`Brief biography of the ${workshopForm.submissionType === 'panel' ? 'panel member' : 'presenter'}`}
                              rows={2}
                              required
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="learningObjectives" className="dark:text-white">Learning Objectives</Label>
                  <Textarea
                    id="learningObjectives"
                    name="learningObjectives"
                    value={workshopForm.learningObjectives}
                    onChange={(e) => setWorkshopForm({ ...workshopForm, learningObjectives: e.target.value })}
                    placeholder="What will participants learn?"
                    rows={3}
                  />
                </div>


                <div className="md:col-span-2">
                  <Label htmlFor="technicalRequirements" className="dark:text-white">Technical Requirements</Label>
                  <Textarea
                    id="technicalRequirements"
                    name="technicalRequirements"
                    value={workshopForm.technicalRequirements}
                    onChange={(e) => setWorkshopForm({ ...workshopForm, technicalRequirements: e.target.value })}
                    placeholder="Any special equipment or technical needs"
                    rows={2}
                  />
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="additionalInfo" className="dark:text-white">Additional Information</Label>
                  <Textarea
                    id="additionalInfo"
                    name="additionalInfo"
                    value={workshopForm.additionalInfo}
                    onChange={(e) => setWorkshopForm({ ...workshopForm, additionalInfo: e.target.value })}
                    placeholder="Any other relevant information"
                    rows={3}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button
                  type="submit"
                  disabled={isSubmittingWorkshop}
                  className="bg-electric-blue hover:bg-blue-600"
                  aria-label="Submit workshop or panel proposal"
                  aria-busy={isSubmittingWorkshop}
                >
                  {isSubmittingWorkshop ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Submit Proposal
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Sponsor Submission Tab */}
      {activeTab === 'sponsor' && (
        <div className="space-y-6">
          {/* Introduction */}
          <Card className="glass-card floating-hover border-2 border-purple-500">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Become a Sponsor
                <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full font-semibold">
                  Founding Sponsor Opportunity
                </span>
              </CardTitle>
              <CardDescription>
                SLxAI Summit 2026 at Boston University is a global gathering of researchers, companies, and Deaf led organizations 
                shaping the future of sign language AI. All sessions take place in one large plenary room with sponsor booths set 
                along the perimeter for continuous engagement. Sponsors receive exposure to industry leaders, academic teams, and 
                government partners who are driving advances in accessible technology.
              </CardDescription>
              <div className="mt-4 p-4 bg-purple-50 border border-purple-200 rounded-lg">
                <p className="text-sm text-gray-800">
                  <strong className="text-purple-900">Special Recognition:</strong> All sponsors of Summit 2026 will be permanently 
                  recognized as <strong>"Founding Sponsors"</strong> and will carry this prestigious label on all future SLxAI Summit 
                  materials and digital platforms. This is a one-time opportunity to be part of the inaugural summit and receive 
                  lifetime recognition.
                </p>
              </div>
            </CardHeader>
          </Card>

          {/* Sponsor Opportunities */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 text-center md:text-left">Sponsor Opportunities</h2>
            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-gray-700">
                <strong className="text-yellow-900">Limited Availability:</strong> Each tier is limited to one sponsor spot. 
                Platinum, Gold, Silver, and Bronze sponsorships are exclusive opportunities.
              </p>
            </div>
            
            {/* All Sponsor Packages */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <Card className="glass-card floating-hover border-2 border-blue-400">
                <CardHeader>
                  <CardTitle className="text-xl flex items-center gap-2">
                    Platinum Sponsor
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full font-semibold">
                      Limited to 1
                    </span>
                  </CardTitle>
                  <CardDescription className="text-lg font-semibold text-blue-700 dark:text-white">$20,000</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li className="flex items-start">
                      <span className="text-electric-blue mr-2">•</span>
                      <span>Premium booth placement in the plenary room</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-electric-blue mr-2">•</span>
                      <span>Featured moment during opening remarks</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-electric-blue mr-2">•</span>
                      <span>Acknowledgement throughout the summit</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-electric-blue mr-2">•</span>
                      <span>Dedicated demo time during lunch or breaks</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-electric-blue mr-2">•</span>
                      <span>Access to the attendee list</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-electric-blue mr-2">•</span>
                      <span><strong>12 complimentary summit tickets</strong> included</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-electric-blue mr-2">•</span>
                      <span><strong>Luncheon Sponsor</strong> (first day) included</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-electric-blue mr-2">•</span>
                      <span><strong>Evening Event Sponsor</strong> (first day) included</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-electric-blue mr-2">•</span>
                      <span>Logo Blast, Digital Program, and Print Program included</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="glass-card floating-hover border-2 border-yellow-300">
                <CardHeader>
                  <CardTitle className="text-xl flex items-center gap-2">
                    Gold Sponsor
                    <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full font-semibold">
                      Limited to 1
                    </span>
                  </CardTitle>
                  <CardDescription className="text-lg font-semibold text-yellow-600 dark:text-white">$10,000</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li className="flex items-start">
                      <span className="text-electric-blue mr-2">•</span>
                      <span>Large booth placement in the plenary room</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-electric-blue mr-2">•</span>
                      <span>Thank you announcement</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-electric-blue mr-2">•</span>
                      <span>Acknowledgement throughout the summit</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-electric-blue mr-2">•</span>
                      <span><strong>8 complimentary summit tickets</strong> included</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-electric-blue mr-2">•</span>
                      <span><strong>Evening Event Sponsor</strong> (2nd day evening) included</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-electric-blue mr-2">•</span>
                      <span>Logo Blast, Digital Program, and Print Program included</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="glass-card floating-hover border-2 border-gray-300">
                <CardHeader>
                  <CardTitle className="text-xl flex items-center gap-2">
                    Silver Sponsor
                    <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded-full font-semibold">
                      Limited to 1
                    </span>
                  </CardTitle>
                  <CardDescription className="text-lg font-semibold text-gray-600 dark:text-white">$5,000</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li className="flex items-start">
                      <span className="text-electric-blue mr-2">•</span>
                      <span>Standard booth placement in the plenary room</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-electric-blue mr-2">•</span>
                      <span>Verbal recognition during the plenary sessions</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-electric-blue mr-2">•</span>
                      <span><strong>4 complimentary summit tickets</strong> included</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-electric-blue mr-2">•</span>
                      <span><strong>Luncheon Sponsor</strong> (2nd day) included</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-electric-blue mr-2">•</span>
                      <span>Logo Blast, Digital Program, and Print Program included</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="glass-card floating-hover border-2 border-orange-300">
                <CardHeader>
                  <CardTitle className="text-xl flex items-center gap-2">
                    Bronze Sponsor
                    <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded-full font-semibold">
                      Limited to 1
                    </span>
                  </CardTitle>
                  <CardDescription className="text-lg font-semibold text-orange-700 dark:text-white">$3,500</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li className="flex items-start">
                      <span className="text-electric-blue mr-2">•</span>
                      <span>Standard booth placement in the plenary room</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-electric-blue mr-2">•</span>
                      <span>Access to the attendee list</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-electric-blue mr-2">•</span>
                      <span><strong>3 complimentary summit tickets</strong> included</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-electric-blue mr-2">•</span>
                      <span><strong>Pre Conference Social Sponsor</strong> included</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-electric-blue mr-2">•</span>
                      <span>Logo Blast, Digital Program, and Print Program included</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="glass-card floating-hover">
                <CardHeader>
                  <CardTitle className="text-xl flex items-center gap-2">
                    Accessibility Sponsor
                    <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded-full font-semibold">
                      Limited to 1
                    </span>
                  </CardTitle>
                  <CardDescription className="text-lg font-semibold text-gray-700 dark:text-white">$15,000 or Exchange of Service</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-700 mb-2">Supports interpreters, captions, and access services.</p>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li className="flex items-start">
                      <span className="text-electric-blue mr-2">•</span>
                      <span>Strong recognition during plenary announcements</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-electric-blue mr-2">•</span>
                      <span>Program placement</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-electric-blue mr-2">•</span>
                      <span>Logo Blast, Digital Program, and Print Program included</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="glass-card floating-hover">
                <CardHeader>
                  <CardTitle className="text-xl flex items-center gap-2">
                    Video Production Sponsor
                    <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded-full font-semibold">
                      Limited to 1
                    </span>
                  </CardTitle>
                  <CardDescription className="text-lg font-semibold text-gray-700 dark:text-white">$3,000 or Exchange of Service</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-700 mb-2">Supports professional filming and editing of the summit.</p>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li className="flex items-start">
                      <span className="text-electric-blue mr-2">•</span>
                      <span>Logo appears at start and end of session recordings</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-electric-blue mr-2">•</span>
                      <span>Logo Blast, Digital Program, and Print Program included</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="glass-card floating-hover">
                <CardHeader>
                  <CardTitle className="text-xl flex items-center gap-2">
                    Booth Sponsor
                    <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded-full font-semibold">
                      Limited to 10
                    </span>
                  </CardTitle>
                  <CardDescription className="text-lg font-semibold text-gray-700 dark:text-white">
                    $500 (Companies) / $200 (Non-profit & Small Startups)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li className="flex items-start">
                      <span className="text-electric-blue mr-2">•</span>
                      <span>Booth placement in the plenary room</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-electric-blue mr-2">•</span>
                      <span><strong>2 complimentary summit tickets</strong> included</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-electric-blue mr-2">•</span>
                      <span>Accommodations for attendees will not be charged</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-electric-blue mr-2">•</span>
                      <span>Logo Blast, Digital Program, and Print Program included</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="glass-card floating-hover">
                <CardHeader>
                  <CardTitle className="text-xl flex items-center gap-2">
                    Innovation Sponsor
                    <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded-full font-semibold">
                      Limited to 2
                    </span>
                  </CardTitle>
                  <CardDescription className="text-lg font-semibold text-gray-700 dark:text-white">$2,500</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-700 mb-2">Supports the Innovation Showcase area and related activities.</p>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li className="flex items-start">
                      <span className="text-electric-blue mr-2">•</span>
                      <span>Booth placement</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-electric-blue mr-2">•</span>
                      <span>Recognition during showcase presentations</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-electric-blue mr-2">•</span>
                      <span>Logo Blast, Digital Program, and Print Program included</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="glass-card floating-hover">
                <CardHeader>
                  <CardTitle className="text-xl flex items-center gap-2">
                    Breakfast Sponsor
                    <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded-full font-semibold">
                      Up to 3
                    </span>
                  </CardTitle>
                  <CardDescription className="text-lg font-semibold text-gray-700 dark:text-white">$3,000</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li className="flex items-start">
                      <span className="text-electric-blue mr-2">•</span>
                      <span>Recognition during morning welcome</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-electric-blue mr-2">•</span>
                      <span>Signage at the breakfast station</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-electric-blue mr-2">•</span>
                      <span>Logo Blast, Digital Program, and Print Program included</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="glass-card floating-hover">
                <CardHeader>
                  <CardTitle className="text-xl flex items-center gap-2">
                    Snack Break Sponsor
                    <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded-full font-semibold">
                      Up to 4
                    </span>
                  </CardTitle>
                  <CardDescription className="text-lg font-semibold text-gray-700 dark:text-white">$2,000</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li className="flex items-start">
                      <span className="text-electric-blue mr-2">•</span>
                      <span>Placement at snack tables</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-electric-blue mr-2">•</span>
                      <span>Announcement before the break</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-electric-blue mr-2">•</span>
                      <span>Logo Blast, Digital Program, and Print Program included</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>

            {/* Note about Digital Visibility */}
            <Card className="glass-card floating-hover bg-blue-50 dark:bg-blue-900 border-blue-200 dark:border-blue-700">
              <CardContent className="pt-6">
                <p className="text-sm text-gray-700 dark:text-white">
                  <strong className="text-gray-900 dark:text-white">Note:</strong> All sponsor packages include Logo Blast (logo featured across summit website, registration page, social media, and both program books), Digital Program placement, and Print Program placement.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Sponsor Submission Form */}
          <Card className="glass-card floating-hover">
            <CardHeader>
              <CardTitle>Submit Sponsorship Inquiry</CardTitle>
              <CardDescription>
                Interested in sponsoring? Submit your inquiry below and our team will contact you.
              </CardDescription>
            </CardHeader>
          <CardContent>
            <form onSubmit={handleSponsorSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <Label htmlFor="companyName" className="dark:text-white">Company Name *</Label>
                  <Input
                    id="companyName"
                    name="companyName"
                    value={sponsorForm.companyName}
                    onChange={(e) => {
                      setSponsorForm({ ...sponsorForm, companyName: e.target.value });
                      if (sponsorErrors.companyName) {
                        setSponsorErrors(prev => {
                          const newErrors = { ...prev };
                          delete newErrors.companyName;
                          return newErrors;
                        });
                      }
                    }}
                    placeholder="Your company name"
                    required
                    className={sponsorErrors.companyName ? 'border-red-500' : ''}
                  />
                  {sponsorErrors.companyName && (
                    <p className="text-xs text-red-600 mt-1">{sponsorErrors.companyName}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="contactName" className="dark:text-white">Contact Name *</Label>
                  <Input
                    id="contactName"
                    name="contactName"
                    value={sponsorForm.contactName}
                    onChange={(e) => {
                      setSponsorForm({ ...sponsorForm, contactName: e.target.value });
                      if (sponsorErrors.contactName) {
                        setSponsorErrors(prev => {
                          const newErrors = { ...prev };
                          delete newErrors.contactName;
                          return newErrors;
                        });
                      }
                    }}
                    placeholder="Full name"
                    required
                    className={sponsorErrors.contactName ? 'border-red-500' : ''}
                  />
                  {sponsorErrors.contactName && (
                    <p className="text-xs text-red-600 mt-1">{sponsorErrors.contactName}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="contactEmail" className="dark:text-white">Contact Email *</Label>
                  <Input
                    id="contactEmail"
                    name="contactEmail"
                    type="email"
                    value={sponsorForm.contactEmail}
                    onChange={(e) => {
                      setSponsorForm({ ...sponsorForm, contactEmail: e.target.value });
                      // Real-time validation
                      if (e.target.value && !validateEmail(e.target.value)) {
                        setSponsorErrors(prev => ({ ...prev, contactEmail: 'Invalid email format' }));
                      } else {
                        setSponsorErrors(prev => {
                          const newErrors = { ...prev };
                          delete newErrors.contactEmail;
                          return newErrors;
                        });
                      }
                    }}
                    placeholder="email@example.com"
                    required
                    aria-label="Contact email address"
                    aria-required="true"
                    aria-invalid={sponsorForm.contactEmail && !validateEmail(sponsorForm.contactEmail)}
                    className={sponsorErrors.contactEmail ? 'border-red-500' : ''}
                  />
                  {sponsorErrors.contactEmail && (
                    <p className="text-xs text-red-600 mt-1">{sponsorErrors.contactEmail}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="contactPhone" className="dark:text-white">Contact Phone</Label>
                  <Input
                    id="contactPhone"
                    name="contactPhone"
                    type="tel"
                    value={sponsorForm.contactPhone}
                    onChange={(e) => {
                      setSponsorForm({ ...sponsorForm, contactPhone: e.target.value });
                      // Real-time validation
                      if (e.target.value && !validatePhone(e.target.value)) {
                        setSponsorErrors(prev => ({ ...prev, contactPhone: 'Invalid phone number format' }));
                      } else {
                        setSponsorErrors(prev => {
                          const newErrors = { ...prev };
                          delete newErrors.contactPhone;
                          return newErrors;
                        });
                      }
                    }}
                    placeholder="+1 (555) 123-4567"
                    aria-label="Contact phone number"
                    aria-invalid={sponsorForm.contactPhone && !validatePhone(sponsorForm.contactPhone)}
                    className={sponsorErrors.contactPhone ? 'border-red-500' : ''}
                  />
                  {sponsorErrors.contactPhone && (
                    <p className="text-xs text-red-600 mt-1">{sponsorErrors.contactPhone}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="companyWebsite" className="dark:text-white">Company Website</Label>
                  <Input
                    id="companyWebsite"
                    name="companyWebsite"
                    type="url"
                    value={sponsorForm.companyWebsite}
                    onChange={(e) => {
                      setSponsorForm({ ...sponsorForm, companyWebsite: e.target.value });
                      // Real-time validation
                      if (e.target.value && !validateURL(e.target.value)) {
                        setSponsorErrors(prev => ({ ...prev, companyWebsite: 'Invalid URL format' }));
                      } else {
                        setSponsorErrors(prev => {
                          const newErrors = { ...prev };
                          delete newErrors.companyWebsite;
                          return newErrors;
                        });
                      }
                    }}
                    placeholder="https://example.com"
                    aria-label="Company website URL"
                    aria-invalid={sponsorForm.companyWebsite && !validateURL(sponsorForm.companyWebsite)}
                    className={sponsorErrors.companyWebsite ? 'border-red-500' : ''}
                  />
                  {sponsorErrors.companyWebsite && (
                    <p className="text-xs text-red-600 mt-1">{sponsorErrors.companyWebsite}</p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="companyType-select" className="dark:text-white">Company Type</Label>
                  <Select
                    value={sponsorForm.companyType}
                    onValueChange={(value) => setSponsorForm({ ...sponsorForm, companyType: value as any })}
                  >
                    <SelectTrigger id="companyType">
                      <SelectValue placeholder="Select company type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="company">Company</SelectItem>
                      <SelectItem value="nonprofit">Non-profit</SelectItem>
                      <SelectItem value="startup">Small Startup</SelectItem>
                    </SelectContent>
                  </Select>
                  <select
                    id="companyType-select"
                    name="companyType"
                    value={sponsorForm.companyType}
                    onChange={() => {}}
                    style={{ position: 'absolute', border: '0px', width: '1px', height: '1px', padding: '0px', margin: '-1px', overflow: 'hidden', clip: 'rect(0px, 0px, 0px, 0px)', whiteSpace: 'nowrap', overflowWrap: 'normal' }}
                    aria-hidden="true"
                    tabIndex={-1}
                  >
                    <option value="">Select company type</option>
                    <option value="company">Company</option>
                    <option value="nonprofit">Non-profit</option>
                    <option value="startup">Small Startup</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <p className="text-sm font-medium leading-none text-gray-900 dark:text-white mb-2">Sponsorship Packages *</p>
                  {sponsorErrors.sponsorshipPackages && (
                    <p className="text-xs text-red-600 mt-1 mb-2">{sponsorErrors.sponsorshipPackages}</p>
                  )}
                  <div className={`mt-2 space-y-3 border rounded-lg p-4 bg-gray-50 dark:bg-[hsl(217,40%,18%)] ${sponsorErrors.sponsorshipPackages ? 'border-red-500 dark:border-red-500' : 'border-gray-200 dark:border-[hsl(217,35%,25%)]'}`}>
                    <div className="mb-3 p-3 bg-purple-50 dark:bg-purple-900/30 border border-purple-200 dark:border-purple-700 rounded-lg">
                      <p className="text-xs text-gray-700 dark:text-white">
                        <strong className="text-purple-900 dark:text-white">Founding Sponsor Recognition:</strong> All sponsors of Summit 2026 
                        will automatically receive the permanent "Founding Sponsor" label, which will be displayed on all future 
                        SLxAI Summit materials and digital platforms. This is a one-time opportunity exclusive to sponsors of 
                        the inaugural conference.
                      </p>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="platinum"
                          name="sponsorshipPackages"
                          value="Platinum Sponsor"
                          checked={sponsorForm.sponsorshipPackages.includes('Platinum Sponsor')}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSponsorForm({
                                ...sponsorForm,
                                sponsorshipPackages: [...sponsorForm.sponsorshipPackages, 'Platinum Sponsor'],
                              });
                            } else {
                              setSponsorForm({
                                ...sponsorForm,
                                sponsorshipPackages: sponsorForm.sponsorshipPackages.filter(p => p !== 'Platinum Sponsor'),
                              });
                            }
                          }}
                        />
                        <Label htmlFor="platinum" className="font-normal cursor-pointer dark:text-white">
                          Platinum Sponsor ($20,000)
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="gold"
                          name="sponsorshipPackages"
                          value="Gold Sponsor"
                          checked={sponsorForm.sponsorshipPackages.includes('Gold Sponsor')}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSponsorForm({
                                ...sponsorForm,
                                sponsorshipPackages: [...sponsorForm.sponsorshipPackages, 'Gold Sponsor'],
                              });
                            } else {
                              setSponsorForm({
                                ...sponsorForm,
                                sponsorshipPackages: sponsorForm.sponsorshipPackages.filter(p => p !== 'Gold Sponsor'),
                              });
                            }
                          }}
                        />
                        <Label htmlFor="gold" className="font-normal cursor-pointer dark:text-white">
                          Gold Sponsor ($10,000)
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="silver"
                          name="sponsorshipPackages"
                          value="Silver Sponsor"
                          checked={sponsorForm.sponsorshipPackages.includes('Silver Sponsor')}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSponsorForm({
                                ...sponsorForm,
                                sponsorshipPackages: [...sponsorForm.sponsorshipPackages, 'Silver Sponsor'],
                              });
                            } else {
                              setSponsorForm({
                                ...sponsorForm,
                                sponsorshipPackages: sponsorForm.sponsorshipPackages.filter(p => p !== 'Silver Sponsor'),
                              });
                            }
                          }}
                        />
                        <Label htmlFor="silver" className="font-normal cursor-pointer dark:text-white">
                          Silver Sponsor ($5,000)
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="bronze"
                          name="sponsorshipPackages"
                          value="Bronze Sponsor"
                          checked={sponsorForm.sponsorshipPackages.includes('Bronze Sponsor')}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSponsorForm({
                                ...sponsorForm,
                                sponsorshipPackages: [...sponsorForm.sponsorshipPackages, 'Bronze Sponsor'],
                              });
                            } else {
                              setSponsorForm({
                                ...sponsorForm,
                                sponsorshipPackages: sponsorForm.sponsorshipPackages.filter(p => p !== 'Bronze Sponsor'),
                              });
                            }
                          }}
                        />
                        <Label htmlFor="bronze" className="font-normal cursor-pointer dark:text-white">
                          Bronze Sponsor ($3,500)
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="booth"
                          name="sponsorshipPackages"
                          value="Booth Sponsor"
                          checked={sponsorForm.sponsorshipPackages.includes('Booth Sponsor')}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSponsorForm({
                                ...sponsorForm,
                                sponsorshipPackages: [...sponsorForm.sponsorshipPackages, 'Booth Sponsor'],
                              });
                            } else {
                              setSponsorForm({
                                ...sponsorForm,
                                sponsorshipPackages: sponsorForm.sponsorshipPackages.filter(p => p !== 'Booth Sponsor'),
                              });
                            }
                          }}
                        />
                        <Label htmlFor="booth" className="font-normal cursor-pointer dark:text-white">
                          Booth Sponsor ($500 Companies / $200 Non-profit & Small Startups)
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="accessibility"
                          name="sponsorshipPackages"
                          value="Accessibility Sponsor"
                          checked={sponsorForm.sponsorshipPackages.includes('Accessibility Sponsor')}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSponsorForm({
                                ...sponsorForm,
                                sponsorshipPackages: [...sponsorForm.sponsorshipPackages, 'Accessibility Sponsor'],
                              });
                            } else {
                              setSponsorForm({
                                ...sponsorForm,
                                sponsorshipPackages: sponsorForm.sponsorshipPackages.filter(p => p !== 'Accessibility Sponsor'),
                              });
                            }
                          }}
                        />
                        <Label htmlFor="accessibility" className="font-normal cursor-pointer dark:text-white">
                          Accessibility Sponsor ($15,000 or Exchange of Service)
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="innovation"
                          name="sponsorshipPackages"
                          value="Innovation Sponsor"
                          checked={sponsorForm.sponsorshipPackages.includes('Innovation Sponsor')}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSponsorForm({
                                ...sponsorForm,
                                sponsorshipPackages: [...sponsorForm.sponsorshipPackages, 'Innovation Sponsor'],
                              });
                            } else {
                              setSponsorForm({
                                ...sponsorForm,
                                sponsorshipPackages: sponsorForm.sponsorshipPackages.filter(p => p !== 'Innovation Sponsor'),
                              });
                            }
                          }}
                        />
                        <Label htmlFor="innovation" className="font-normal cursor-pointer dark:text-white">
                          Innovation Sponsor ($2,500)
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="video"
                          name="sponsorshipPackages"
                          value="Video Production Sponsor"
                          checked={sponsorForm.sponsorshipPackages.includes('Video Production Sponsor')}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSponsorForm({
                                ...sponsorForm,
                                sponsorshipPackages: [...sponsorForm.sponsorshipPackages, 'Video Production Sponsor'],
                              });
                            } else {
                              setSponsorForm({
                                ...sponsorForm,
                                sponsorshipPackages: sponsorForm.sponsorshipPackages.filter(p => p !== 'Video Production Sponsor'),
                              });
                            }
                          }}
                        />
                        <Label htmlFor="video" className="font-normal cursor-pointer dark:text-white">
                          Video Production Sponsor ($3,000 or Exchange of Service)
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="breakfast"
                          name="sponsorshipPackages"
                          value="Breakfast Sponsor"
                          checked={sponsorForm.sponsorshipPackages.includes('Breakfast Sponsor')}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSponsorForm({
                                ...sponsorForm,
                                sponsorshipPackages: [...sponsorForm.sponsorshipPackages, 'Breakfast Sponsor'],
                              });
                            } else {
                              setSponsorForm({
                                ...sponsorForm,
                                sponsorshipPackages: sponsorForm.sponsorshipPackages.filter(p => p !== 'Breakfast Sponsor'),
                              });
                            }
                          }}
                        />
                        <Label htmlFor="breakfast" className="font-normal cursor-pointer dark:text-white">
                          Breakfast Sponsor ($3,000)
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="snack"
                          name="sponsorshipPackages"
                          value="Snack Break Sponsor"
                          checked={sponsorForm.sponsorshipPackages.includes('Snack Break Sponsor')}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSponsorForm({
                                ...sponsorForm,
                                sponsorshipPackages: [...sponsorForm.sponsorshipPackages, 'Snack Break Sponsor'],
                              });
                            } else {
                              setSponsorForm({
                                ...sponsorForm,
                                sponsorshipPackages: sponsorForm.sponsorshipPackages.filter(p => p !== 'Snack Break Sponsor'),
                              });
                            }
                          }}
                        />
                        <Label htmlFor="snack" className="font-normal cursor-pointer dark:text-white">
                          Snack Break Sponsor ($2,000)
                        </Label>
                      </div>
                    </div>
                    {/* Hidden checkboxes for form submission */}
                    {sponsorForm.sponsorshipPackages.map((pkg) => (
                      <input
                        key={pkg}
                        type="checkbox"
                        name="sponsorshipPackages"
                        value={pkg}
                        checked={true}
                        onChange={() => {}}
                        style={{ display: 'none' }}
                        aria-hidden="true"
                        tabIndex={-1}
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <Label htmlFor="sponsorshipAmount" className="dark:text-white">Sponsorship Amount ($)</Label>
                  <Input
                    id="sponsorshipAmount"
                    name="sponsorshipAmount"
                    type="number"
                    value={sponsorForm.sponsorshipAmount}
                    onChange={(e) => setSponsorForm({ ...sponsorForm, sponsorshipAmount: e.target.value })}
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                  />
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="sponsorshipPackageDetails" className="dark:text-white">Sponsorship Package Details</Label>
                  <Textarea
                    id="sponsorshipPackageDetails"
                    name="sponsorshipPackageDetails"
                    value={sponsorForm.sponsorshipPackageDetails}
                    onChange={(e) => setSponsorForm({ ...sponsorForm, sponsorshipPackageDetails: e.target.value })}
                    placeholder="Describe what you're looking for in a sponsorship package"
                    rows={3}
                  />
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="companyDescription" className="dark:text-white">Company Description</Label>
                  <Textarea
                    id="companyDescription"
                    name="companyDescription"
                    value={sponsorForm.companyDescription}
                    onChange={(e) => setSponsorForm({ ...sponsorForm, companyDescription: e.target.value })}
                    placeholder="Tell us about your company"
                    rows={3}
                  />
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="previousSponsorshipExperience" className="dark:text-white">Previous Sponsorship Experience</Label>
                  <Textarea
                    id="previousSponsorshipExperience"
                    name="previousSponsorshipExperience"
                    value={sponsorForm.previousSponsorshipExperience}
                    onChange={(e) => setSponsorForm({ ...sponsorForm, previousSponsorshipExperience: e.target.value })}
                    placeholder="Have you sponsored similar events before?"
                    rows={3}
                  />
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="marketingGoals" className="dark:text-white">Marketing Goals</Label>
                  <Textarea
                    id="marketingGoals"
                    name="marketingGoals"
                    value={sponsorForm.marketingGoals}
                    onChange={(e) => setSponsorForm({ ...sponsorForm, marketingGoals: e.target.value })}
                    placeholder="What are your marketing objectives?"
                    rows={3}
                  />
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="additionalRequests" className="dark:text-white">Additional Requests</Label>
                  <Textarea
                    id="additionalRequests"
                    name="additionalRequests"
                    value={sponsorForm.additionalRequests}
                    onChange={(e) => setSponsorForm({ ...sponsorForm, additionalRequests: e.target.value })}
                    placeholder="Any special requests or requirements"
                    rows={3}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button
                  type="submit"
                  disabled={isSubmittingSponsor}
                  className="bg-electric-blue hover:bg-blue-600"
                  aria-label="Submit sponsorship inquiry"
                  aria-busy={isSubmittingSponsor}
                >
                  {isSubmittingSponsor ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Briefcase className="h-4 w-4 mr-2" />
                      Submit Sponsorship Inquiry
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
        </div>
      )}
    </div>
  );
}

