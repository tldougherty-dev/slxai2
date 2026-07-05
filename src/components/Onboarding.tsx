import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  User, Building2, MessageSquare, FileText, Vote, Users, 
  CheckCircle2, ArrowRight, ArrowLeft, Sparkles, Video, Calendar
} from 'lucide-react';
import { getCurrentUser, getUserRole } from '@/lib/auth';
import { canAccessAdmin } from '@/lib/roles';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';

interface OnboardingStep {
  id: number;
  title: string;
  description: string;
  icon: typeof User;
  action?: {
    label: string;
    path: string;
  };
}

const onboardingSteps: OnboardingStep[] = [
  {
    id: 1,
    title: 'Welcome to SLxAI Member Portal',
    description: 'This is your hub for connecting with the SLxAI community, accessing resources, participating in discussions, and staying updated on summit activities.',
    icon: Sparkles,
  },
  {
    id: 2,
    title: 'Global Feed',
    description: 'Share and discover posts from the community. Create posts with text, images, videos, or links. React with likes, celebrate achievements, and engage in conversations through comments.',
    icon: Video,
  },
  {
    id: 3,
    title: 'Discussions',
    description: 'Join topic-based channels to discuss ideas, ask questions, and collaborate with other members. Create new channels for specific topics or join existing conversations.',
    icon: MessageSquare,
  },
  {
    id: 4,
    title: 'Voting',
    description: 'Participate in member decisions and elections. Cast your vote on important matters affecting the SLxAI community. View past votes and their results.',
    icon: Vote,
  },
  {
    id: 5,
    title: 'Files',
    description: 'Access shared resources, documents, and files uploaded by members and administrators. Search for specific files and download what you need.',
    icon: FileText,
  },
  {
    id: 6,
    title: 'Member Directory',
    description: 'Browse and search the member directory to find and connect with other members. View member profiles, organizations, and contact information.',
    icon: Users,
  },
  {
    id: 7,
    title: 'Summit 2026',
    description: 'Learn about the upcoming SLxAI Summit 2026. Submit workshop and panel proposals, explore sponsorship opportunities, and stay informed about summit activities.',
    icon: Calendar,
  },
  {
    id: 8,
    title: 'Complete Your Profile',
    description: 'Please fill out your profile with the required information: Organization Name, Your Name, Title, and Email. This helps others learn about you and builds trust within the community.',
    icon: User,
    action: {
      label: 'Go to My Profile',
      path: '/membership-portal/profile',
    },
  },
];

export function OnboardingWizard() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user has completed onboarding
    const hasCompleted = localStorage.getItem('onboarding_complete');
    if (hasCompleted === 'true') {
      return;
    }

    // Check if user is new (no organization linked or incomplete profile)
    const user = getCurrentUser();
    if (user) {
      // Show onboarding for new users
      // Delay slightly to let the page load
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const checkProfileComplete = async (): Promise<boolean> => {
    const user = getCurrentUser();
    if (!user) return false;

    try {
      // Get user's auth metadata
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) return false;

      // Check required fields: Organization Name, Name, Title, Email
      const hasName = user.name && user.name.trim().length > 0;
      const hasEmail = user.email && user.email.trim().length > 0;
      const hasTitle = authUser.user_metadata?.title && authUser.user_metadata.title.trim().length > 0;
      const hasOrganization = user.organizationId && user.organizationName && user.organizationName !== 'Not linked';

      return hasName && hasEmail && hasTitle && hasOrganization;
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error checking profile completion:', error);
      }
      return false;
    }
  };

  const visibleSteps = onboardingSteps.filter(
    (step) => step.id !== 3 || canAccessAdmin(getUserRole())
  );

  const handleNext = () => {
    if (currentStep < visibleSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };


  const handleComplete = () => {
    localStorage.setItem('onboarding_complete', 'true');
    setIsOpen(false);
  };

  const handleAction = (path: string) => {
    handleComplete();
    navigate(path);
  };

  if (!isOpen) return null;

  const step = visibleSteps[currentStep];
  const Icon = step.icon;

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-2xl bg-white">
        <DialogHeader>
          <div className="flex items-center justify-center mb-4">
            <div className="h-16 w-16 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 border-2 border-gray-300 flex items-center justify-center">
              <Icon className="h-8 w-8 text-gray-700" />
            </div>
          </div>
          <DialogTitle className="text-center text-2xl text-gray-900">{step.title}</DialogTitle>
          <DialogDescription className="text-center text-base pt-2 text-gray-600">
            {step.description}
          </DialogDescription>
        </DialogHeader>

        {/* Step Indicator */}
        <div className="flex items-center justify-center gap-2 py-4">
          {visibleSteps.map((s, index) => (
            <div
              key={s.id}
              className={`h-2 w-2 rounded-full transition-all ${
                index === currentStep
                  ? 'bg-electric-blue w-8'
                  : index < currentStep
                  ? 'bg-green-500'
                  : 'bg-gray-300'
              }`}
            />
          ))}
        </div>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-center pt-4 border-t border-gray-200">
          <div className="flex gap-2">
            {currentStep > 0 && (
              <Button
                onClick={handlePrevious}
                className="bg-gray-100 hover:bg-gray-200 text-gray-900 border border-gray-300 w-32"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Previous
              </Button>
            )}
            {currentStep === visibleSteps.length - 1 ? (
              <Button
                onClick={() => handleAction('/membership-portal')}
                className="bg-electric-blue hover:bg-electric-blue/90 text-white w-32"
              >
                Get Started
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button
                onClick={handleNext}
                className="bg-electric-blue hover:bg-electric-blue/90 text-white w-32"
              >
                Next
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

