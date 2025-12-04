import { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { Mail, Lock, User, Building2, Loader2, CheckCircle2, X, MapPin, ChevronDown, Check } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { setCurrentUser } from '@/lib/auth';
import { autoLinkUserToMember } from '@/lib/memberMatching';
import { isRateLimited, resetRateLimit, getRateLimitResetTime } from '@/lib/rateLimit';
import { COUNTRIES } from '@/lib/countries';
import { cn } from '@/lib/utils';
import { TermsAgreementDialog } from '@/components/TermsAgreementDialog';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('login');
  const [showEmailVerification, setShowEmailVerification] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState('');
  const [isResendingEmail, setIsResendingEmail] = useState(false);
  const [showTermsAgreement, setShowTermsAgreement] = useState(false);
  const [pendingSignupData, setPendingSignupData] = useState<{
    email: string;
    password: string;
    name: string;
    organization: string;
    country: string;
  } | null>(null);
  
  // Get return URL from location state, or default to membership portal
  const from = (location.state as any)?.from?.pathname || '/membership-portal';

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(() => {
    // Check if user previously chose to remember email
    const rememberedEmail = localStorage.getItem('remembered_email');
    return !!rememberedEmail;
  });

  // Load remembered email on mount
  useEffect(() => {
    const rememberedEmail = localStorage.getItem('remembered_email');
    if (rememberedEmail) {
      setLoginEmail(rememberedEmail);
      setRememberMe(true);
    }
  }, []);

  // Signup form state
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirmPassword, setSignupConfirmPassword] = useState('');
  const [signupOrganization, setSignupOrganization] = useState('');
  const [signupCountry, setSignupCountry] = useState('');
  const [signupPasscode, setSignupPasscode] = useState('');
  const [countryOpen, setCountryOpen] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Check rate limiting
    const emailKey = loginEmail.toLowerCase().trim();
    if (isRateLimited(emailKey)) {
      const resetTime = getRateLimitResetTime(emailKey);
      const minutes = Math.floor(resetTime / 60);
      const seconds = resetTime % 60;
      toast({
        title: "Too many login attempts",
        description: `Please wait ${minutes}:${seconds.toString().padStart(2, '0')} before trying again.`,
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: loginEmail,
        password: loginPassword,
      });

      if (error) {
        // Increment rate limit on failed attempt
        isRateLimited(emailKey);
        throw error;
      }

      // Reset rate limit on successful login
      resetRateLimit(emailKey);

      // Handle remember me functionality
      if (rememberMe) {
        localStorage.setItem('remembered_email', loginEmail.toLowerCase().trim());
      } else {
        localStorage.removeItem('remembered_email');
      }

      if (data.user) {
        // Auto-link user to member profile if email matches
        const existingRole = data.user.user_metadata?.role;
        const match = await autoLinkUserToMember(
          data.user.email || loginEmail,
          data.user.id,
          existingRole
        );

        // Refresh user data after potential linking
        const { data: { user: refreshedUser } } = await supabase.auth.getUser();

        // Set current user in auth context
        setCurrentUser({
          id: refreshedUser?.id || data.user.id,
          email: refreshedUser?.email || data.user.email || '',
          name: refreshedUser?.user_metadata?.name || data.user.user_metadata?.name || data.user.email?.split('@')[0] || 'User',
          organizationId: refreshedUser?.user_metadata?.organization_id || data.user.user_metadata?.organization_id || '',
          role: refreshedUser?.user_metadata?.role || data.user.user_metadata?.role || 'member',
          isVotingRep: refreshedUser?.user_metadata?.is_voting_rep || data.user.user_metadata?.is_voting_rep || false,
        });

        if (match) {
          toast({
            title: "Welcome back!",
            description: `Linked to ${match.organizationName}`,
          });
        } else {
          toast({
            title: "Welcome back!",
            description: "You have been successfully logged in.",
          });
        }

        navigate(from, { replace: true });
      }
    } catch (error: any) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Login error:', error);
      }
      
      // Provide more specific error messages
      let errorMessage = "Invalid email or password. Please try again.";
      if (error.message?.includes('Invalid login credentials')) {
        errorMessage = "The email or password you entered is incorrect. Please check and try again.";
      } else if (error.message?.includes('Email not confirmed')) {
        errorMessage = "Please verify your email address before logging in. Check your inbox for the verification link.";
      } else if (error.message?.includes('Too many requests')) {
        errorMessage = "Too many login attempts. Please wait a moment before trying again.";
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Login failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTermsAgreement = async () => {
    if (!pendingSignupData) return;

    setIsLoading(true);
    setShowTermsAgreement(false);

    try {
      const { data, error } = await supabase.auth.signUp({
        email: pendingSignupData.email,
        password: pendingSignupData.password,
        options: {
          data: {
            name: pendingSignupData.name,
            organization: pendingSignupData.organization,
            role: 'member',
            is_voting_rep: false,
            terms_agreed_at: new Date().toISOString(),
          },
        },
      });

      if (error) throw error;

      if (data.user) {
        // Auto-link user to member profile if email matches, or create new organization
        const match = await autoLinkUserToMember(
          pendingSignupData.email,
          data.user.id,
          undefined,
          pendingSignupData.organization,
          pendingSignupData.name,
          pendingSignupData.country
        );

        // Send email confirmation
        const { error: emailError } = await supabase.auth.resend({
          type: 'signup',
          email: pendingSignupData.email,
        });

        if (emailError) {
          console.error('Error sending confirmation email:', emailError);
        }

        // Show email verification guidance
        setVerificationEmail(pendingSignupData.email);
        setShowEmailVerification(true);

        // Clear signup form and pending data
        setSignupName('');
        setSignupEmail('');
        setSignupPassword('');
        setSignupConfirmPassword('');
        setSignupOrganization('');
        setSignupCountry('');
        setSignupPasscode('');
        setPendingSignupData(null);
      }
    } catch (error: any) {
      console.error('Signup error:', error);
      toast({
        title: "Signup failed",
        description: error.message || "Failed to create account. Please try again.",
        variant: "destructive",
      });
      setPendingSignupData(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendVerificationEmail = async () => {
    if (!verificationEmail) return;
    
    setIsResendingEmail(true);
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: verificationEmail,
      });

      if (error) throw error;

      toast({
        title: "Email sent",
        description: "Verification email has been resent. Please check your inbox.",
      });
    } catch (error: any) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error resending email:', error);
      }
      toast({
        title: "Error",
        description: error.message || "Failed to resend email. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsResendingEmail(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Validate Full Name
    if (!signupName || signupName.trim() === '') {
      toast({
        title: "Full Name required",
        description: "Please enter your full name.",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    // Validate Email
    if (!signupEmail || signupEmail.trim() === '') {
      toast({
        title: "Email required",
        description: "Please enter your email address.",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(signupEmail)) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    // Validate Organization Name
    if (!signupOrganization || signupOrganization.trim() === '') {
      toast({
        title: "Organization Name required",
        description: "Please enter your organization name.",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    // Validate country
    if (!signupCountry || signupCountry.trim() === '') {
      toast({
        title: "Country required",
        description: "Please select your primary country.",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    // Validate Password
    if (!signupPassword || signupPassword.trim() === '') {
      toast({
        title: "Password required",
        description: "Please enter a password.",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    // Validate passwords match
    if (signupPassword !== signupConfirmPassword) {
      toast({
        title: "Password mismatch",
        description: "Passwords do not match. Please try again.",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    // Validate password length and complexity
    if (signupPassword.length < 10) {
      toast({
        title: "Password too short",
        description: "Password must be at least 10 characters long.",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    // Validate password complexity
    const hasUpperCase = /[A-Z]/.test(signupPassword);
    const hasLowerCase = /[a-z]/.test(signupPassword);
    const hasNumber = /[0-9]/.test(signupPassword);
    const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(signupPassword);

    if (!hasUpperCase || !hasLowerCase || !hasNumber || !hasSpecialChar) {
      toast({
        title: "Password complexity required",
        description: "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character.",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    // Validate Confirm Password
    if (!signupConfirmPassword || signupConfirmPassword.trim() === '') {
      toast({
        title: "Confirm Password required",
        description: "Please confirm your password.",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    // Validate Passcode
    if (!signupPasscode || signupPasscode.trim() === '') {
      toast({
        title: "Passcode required",
        description: "Please enter the signup passcode.",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    // Validate passcode matches
    if (signupPasscode.trim().toLowerCase() !== 'thebridge') {
      toast({
        title: "Invalid passcode",
        description: "The passcode you entered is incorrect. Please contact an administrator for the correct passcode.",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    // Store signup data and show Terms agreement dialog
    setPendingSignupData({
      email: signupEmail,
      password: signupPassword,
      name: signupName,
      organization: signupOrganization,
      country: signupCountry,
    });
    setShowTermsAgreement(true);
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-blue-100 to-blue-200 p-4">
      <div className="w-full max-w-md">
        <Card className="glass-card floating-hover border-electric-blue/20">
          <CardHeader className="text-center space-y-2">
            <div className="flex items-center justify-center gap-2 mb-2">
              <img 
                src="/lovable-uploads/0941509f-be4a-49e7-b472-735a4942f89a.png" 
                alt="SLxAI Logo" 
                className="h-8 w-auto"
              />
              <CardTitle className="text-2xl font-bold text-gray-900">Member Portal</CardTitle>
            </div>
            <CardDescription className="text-base">
              Sign in to access your organization's portal
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>

              {/* Login Tab */}
              <TabsContent value="login" className="space-y-4">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email" className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-electric-blue" />
                      Email
                    </Label>
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="your.email@organization.com"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      required
                      disabled={isLoading}
                      className="bg-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="login-password" className="flex items-center gap-2">
                      <Lock className="h-4 w-4 text-electric-blue" />
                      Password
                    </Label>
                    <Input
                      id="login-password"
                      type="password"
                      placeholder="Enter your password"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      required
                      disabled={isLoading}
                      className="bg-white"
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="remember-me"
                      checked={rememberMe}
                      onCheckedChange={(checked) => setRememberMe(checked === true)}
                      disabled={isLoading}
                    />
                    <Label
                      htmlFor="remember-me"
                      className="text-sm font-normal cursor-pointer"
                    >
                      Remember me
                    </Label>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-electric-blue hover:bg-electric-blue/90 text-white"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Signing in...
                      </>
                    ) : (
                      'Sign In'
                    )}
                  </Button>
                </form>
              </TabsContent>

              {/* Signup Tab */}
              <TabsContent value="signup" className="space-y-4">
                <form onSubmit={handleSignup} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-name" className="flex items-center gap-2">
                      <User className="h-4 w-4 text-electric-blue" />
                      Full Name
                    </Label>
                    <Input
                      id="signup-name"
                      type="text"
                      placeholder="John Doe"
                      value={signupName}
                      onChange={(e) => setSignupName(e.target.value)}
                      required
                      disabled={isLoading}
                      className="bg-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-email" className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-electric-blue" />
                      Email
                    </Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="your.email@organization.com"
                      value={signupEmail}
                      onChange={(e) => setSignupEmail(e.target.value)}
                      required
                      disabled={isLoading}
                      className="bg-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-organization" className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-electric-blue" />
                      Organization Name
                    </Label>
                    <Input
                      id="signup-organization"
                      type="text"
                      placeholder="Your Organization"
                      value={signupOrganization}
                      onChange={(e) => setSignupOrganization(e.target.value)}
                      required
                      disabled={isLoading}
                      className="bg-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-country" className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-electric-blue" />
                      Primary Country
                    </Label>
                    <Popover open={countryOpen} onOpenChange={setCountryOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={countryOpen}
                          className="w-full justify-between bg-white hover:bg-gray-50"
                          disabled={isLoading}
                        >
                          {signupCountry || "Select country..."}
                          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0 bg-white" align="start">
                        <Command className="bg-white">
                          <CommandInput placeholder="Search country..." className="h-9 text-gray-900" />
                          <CommandList>
                            <CommandEmpty className="text-gray-600">No country found.</CommandEmpty>
                            <CommandGroup className="text-gray-900">
                              {COUNTRIES.map((country) => (
                                <CommandItem
                                  key={country}
                                  value={country}
                                  onSelect={() => {
                                    setSignupCountry(country);
                                    setCountryOpen(false);
                                  }}
                                  className="text-gray-900 hover:bg-gray-100 data-[selected=true]:bg-gray-100 data-[selected=true]:text-gray-900"
                                >
                                  {country}
                                  <Check
                                    className={cn(
                                      "ml-auto h-4 w-4 text-gray-900",
                                      signupCountry === country ? "opacity-100" : "opacity-0"
                                    )}
                                  />
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-passcode" className="flex items-center gap-2">
                      <Lock className="h-4 w-4 text-electric-blue" />
                      Signup Passcode
                    </Label>
                    <Input
                      id="signup-passcode"
                      type="password"
                      placeholder="Enter signup passcode"
                      value={signupPasscode}
                      onChange={(e) => setSignupPasscode(e.target.value)}
                      required
                      disabled={isLoading}
                      className="bg-white"
                    />
                    <p className="text-xs text-gray-600">
                      Don't have a code?{' '}
                      <Link 
                        to="/interest" 
                        className="text-electric-blue hover:underline font-medium"
                        onClick={(e) => {
                          // Open in same tab
                          e.preventDefault();
                          window.location.href = '/interest';
                        }}
                      >
                        Fill out this interest form
                      </Link>
                      .
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-password" className="flex items-center gap-2">
                      <Lock className="h-4 w-4 text-electric-blue" />
                      Password
                    </Label>
                    <Input
                      id="signup-password"
                      type="password"
                      placeholder="At least 10 characters with complexity"
                      value={signupPassword}
                      onChange={(e) => setSignupPassword(e.target.value)}
                      required
                      disabled={isLoading}
                      minLength={10}
                      className="bg-white"
                    />
                    {/* Password Requirements Checklist */}
                    {signupPassword.length > 0 && (
                      <div className="text-xs space-y-1 mt-2 p-2 bg-gray-50 rounded-md border border-gray-200">
                        <div className={`flex items-center gap-1.5 ${signupPassword.length >= 10 ? 'text-green-600' : 'text-gray-500'}`}>
                          {signupPassword.length >= 10 ? '✓' : '○'} At least 10 characters
                        </div>
                        <div className={`flex items-center gap-1.5 ${/[A-Z]/.test(signupPassword) ? 'text-green-600' : 'text-gray-500'}`}>
                          {/[A-Z]/.test(signupPassword) ? '✓' : '○'} One uppercase letter
                        </div>
                        <div className={`flex items-center gap-1.5 ${/[a-z]/.test(signupPassword) ? 'text-green-600' : 'text-gray-500'}`}>
                          {/[a-z]/.test(signupPassword) ? '✓' : '○'} One lowercase letter
                        </div>
                        <div className={`flex items-center gap-1.5 ${/[0-9]/.test(signupPassword) ? 'text-green-600' : 'text-gray-500'}`}>
                          {/[0-9]/.test(signupPassword) ? '✓' : '○'} One number
                        </div>
                        <div className={`flex items-center gap-1.5 ${/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(signupPassword) ? 'text-green-600' : 'text-gray-500'}`}>
                          {/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(signupPassword) ? '✓' : '○'} One special character
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-confirm-password" className="flex items-center gap-2">
                      <Lock className="h-4 w-4 text-electric-blue" />
                      Confirm Password
                    </Label>
                    <Input
                      id="signup-confirm-password"
                      type="password"
                      placeholder="Confirm your password"
                      value={signupConfirmPassword}
                      onChange={(e) => setSignupConfirmPassword(e.target.value)}
                      required
                      disabled={isLoading}
                      minLength={10}
                      className="bg-white"
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-electric-blue hover:bg-electric-blue/90 text-white"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Creating account...
                      </>
                    ) : (
                      'Create Account'
                    )}
                  </Button>
                </form>

                <div className="text-center text-sm text-gray-600">
                  <p>
                    Already have an account?{' '}
                    <button
                      type="button"
                      onClick={() => setActiveTab('login')}
                      className="text-electric-blue hover:underline"
                    >
                      Sign in
                    </button>
                  </p>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <div className="mt-4 text-center text-sm text-gray-600">
          <Link to="/" className="text-electric-blue hover:underline">
            ← Back to home
          </Link>
        </div>
      </div>

      {/* Email Verification Dialog */}
      <Dialog open={showEmailVerification} onOpenChange={setShowEmailVerification}>
        <DialogContent className="sm:max-w-md bg-white">
          <DialogHeader>
            <div className="flex items-center justify-center mb-4">
              <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center">
                <Mail className="h-8 w-8 text-blue-600" />
              </div>
            </div>
            <DialogTitle className="text-center text-xl text-gray-900">Verify Your Email</DialogTitle>
            <DialogDescription className="text-center text-gray-600">
              We've sent a verification email to <strong className="text-gray-900">{verificationEmail}</strong>
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <p className="text-sm text-blue-800 dark:text-blue-200 font-medium mb-2">
                📧 Check Your Email
              </p>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                Please check your inbox for the verification email. If you don't see it, please check your <strong>spam folder</strong> as it may have been filtered there.
              </p>
            </div>
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <p>Check your inbox and spam folder</p>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <p>Click the verification link in the email</p>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <p>Return here to log in once verified</p>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <p>After logging in, you'll see an onboarding guide to help you get started</p>
              </div>
            </div>
            <div className="pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-600 mb-3 text-center">
                Didn't receive the email?
              </p>
              <Button
                onClick={handleResendVerificationEmail}
                disabled={isResendingEmail}
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-900 border border-gray-300"
              >
                {isResendingEmail ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Mail className="h-4 w-4 mr-2" />
                    Resend Email
                  </>
                )}
              </Button>
            </div>
            <Button
              onClick={() => {
                setShowEmailVerification(false);
                setActiveTab('login');
                setLoginEmail(verificationEmail);
              }}
              className="w-full bg-electric-blue hover:bg-electric-blue/90 text-white"
            >
              Continue to Login
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Terms of Service Agreement Dialog */}
      <TermsAgreementDialog
        open={showTermsAgreement}
        onOpenChange={(open) => {
          setShowTermsAgreement(open);
          if (!open && pendingSignupData) {
            // User cancelled, clear pending data
            setPendingSignupData(null);
          }
        }}
        onAgree={handleTermsAgreement}
      />
    </div>
  );
}

