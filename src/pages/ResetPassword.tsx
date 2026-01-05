import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { Lock, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordErrors, setPasswordErrors] = useState<string[]>([]);
  const [isSuccess, setIsSuccess] = useState(false);

  // Check if we have a token from the email link
  const token = searchParams.get('token');
  const type = searchParams.get('type');

  useEffect(() => {
    // Check if user has a valid session from password reset email
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session && !token && !type) {
        // No session and no token/type params - redirect to login
        navigate('/login');
      }
    };
    checkSession();
  }, [token, type, navigate]);

  // Validate password requirements
  const validatePassword = (password: string): string[] => {
    const errors: string[] = [];
    
    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }
    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }
    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }
    if (!/[0-9]/.test(password)) {
      errors.push('Password must contain at least one number');
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('Password must contain at least one special character');
    }
    
    return errors;
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate passwords match
    if (newPassword !== confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "Please make sure both passwords are the same.",
        variant: "destructive",
      });
      return;
    }

    // Validate password requirements
    const errors = validatePassword(newPassword);
    if (errors.length > 0) {
      setPasswordErrors(errors);
      toast({
        title: "Password requirements not met",
        description: "Please check the password requirements below.",
        variant: "destructive",
      });
      return;
    }

    setPasswordErrors([]);
    setIsResetting(true);

    try {
      // Check if user has a valid session from password reset email
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        throw new Error('Error checking session. Please try again.');
      }

      if (!session) {
        // If no session, try to get it from URL hash (Supabase redirects with hash)
        // Or redirect to request new reset
        throw new Error('Invalid or expired reset link. Please request a new password reset from the login page.');
      }

      // Update password using the session
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) {
        if (updateError.message?.includes('same')) {
          throw new Error('New password must be different from your current password.');
        }
        throw updateError;
      }

      setIsSuccess(true);
      toast({
        title: "Password reset successful",
        description: "Your password has been updated. You can now log in with your new password.",
      });

      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (error: any) {
      if (import.meta.env.DEV) {
        console.error('Password reset error:', error);
      }
      
      let errorMessage = "Failed to reset password. Please try again.";
      if (error.message?.includes('expired')) {
        errorMessage = "This password reset link has expired. Please request a new one.";
      } else if (error.message?.includes('Invalid')) {
        errorMessage = "Invalid reset link. Please request a new password reset.";
      } else if (error.message) {
        errorMessage = error.message;
      }

      toast({
        title: "Password reset failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsResetting(false);
    }
  };

  // If user came from email link, Supabase will handle the session automatically
  // We just need to show the password reset form
  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-blue-100 to-blue-200 p-4">
        <div className="w-full max-w-md">
          <Card className="glass-card floating-hover border-electric-blue/20">
            <CardHeader className="text-center space-y-2">
              <div className="flex items-center justify-center mb-4">
                <CheckCircle2 className="h-16 w-16 text-green-500" />
              </div>
              <CardTitle className="text-2xl font-bold text-gray-900">Password Reset Successful</CardTitle>
              <CardDescription className="text-base">
                Your password has been updated successfully.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-600 text-center">
                You will be redirected to the login page shortly...
              </p>
              <Button
                onClick={() => navigate('/login')}
                className="w-full bg-electric-blue hover:bg-electric-blue/90 text-white"
              >
                Go to Login
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

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
              <CardTitle className="text-2xl font-bold text-gray-900">Reset Password</CardTitle>
            </div>
            <CardDescription className="text-base">
              Enter your new password below
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="new-password" className="flex items-center gap-2">
                  <Lock className="h-4 w-4 text-electric-blue" />
                  New Password
                </Label>
                <Input
                  id="new-password"
                  type="password"
                  placeholder="Enter your new password"
                  value={newPassword}
                  onChange={(e) => {
                    setNewPassword(e.target.value);
                    setPasswordErrors([]);
                  }}
                  required
                  disabled={isResetting}
                  className="bg-white"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm-password" className="flex items-center gap-2">
                  <Lock className="h-4 w-4 text-electric-blue" />
                  Confirm Password
                </Label>
                <Input
                  id="confirm-password"
                  type="password"
                  placeholder="Confirm your new password"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    setPasswordErrors([]);
                  }}
                  required
                  disabled={isResetting}
                  className="bg-white"
                />
              </div>

              {passwordErrors.length > 0 && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <ul className="list-disc list-inside space-y-1 text-sm">
                      {passwordErrors.map((error, index) => (
                        <li key={index}>{error}</li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2">
                <p className="text-sm font-semibold text-gray-900">Password Requirements:</p>
                <ul className="text-xs text-gray-700 space-y-1 list-disc list-inside">
                  <li>At least 8 characters long</li>
                  <li>At least one uppercase letter</li>
                  <li>At least one lowercase letter</li>
                  <li>At least one number</li>
                  <li>At least one special character (!@#$%^&*...)</li>
                </ul>
              </div>

              <Button
                type="submit"
                className="w-full bg-electric-blue hover:bg-electric-blue/90 text-white"
                disabled={isResetting || !newPassword || !confirmPassword}
              >
                {isResetting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Resetting password...
                  </>
                ) : (
                  'Reset Password'
                )}
              </Button>

              <div className="text-center">
                <Link
                  to="/login"
                  className="text-sm text-electric-blue hover:underline"
                >
                  Back to Login
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

