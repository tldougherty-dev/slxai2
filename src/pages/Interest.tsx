import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { User, Building2, FileText, Loader2, CheckCircle2, Mail } from 'lucide-react';
import { sanitizeText, isValidLength } from '@/lib/security';
import { Link } from 'react-router-dom';

export default function Interest() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    organization: '',
    reason: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
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

    // Validate email format
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

    // Validate length
    if (!isValidLength(formData.name, 1, 200)) {
      toast({
        title: "Invalid name",
        description: "Name must be between 1 and 200 characters.",
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }

    if (!isValidLength(formData.email, 1, 200)) {
      toast({
        title: "Invalid email",
        description: "Email must be between 1 and 200 characters.",
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }

    if (!isValidLength(formData.organization, 1, 200)) {
      toast({
        title: "Invalid organization",
        description: "Organization name must be between 1 and 200 characters.",
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }

    if (!isValidLength(formData.reason, 10, 2000)) {
      toast({
        title: "Invalid reason",
        description: "Please provide a reason between 10 and 2000 characters.",
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }

    try {
      // Submit to Supabase
      const { error } = await supabase
        .from('interest_submissions')
        .insert({
          name: sanitizeText(formData.name.trim()),
          email: formData.email.toLowerCase().trim(),
          organization: sanitizeText(formData.organization.trim()),
          reason: sanitizeText(formData.reason.trim()),
        });

      if (error) throw error;

      setIsSubmitted(true);
      setFormData({ name: '', email: '', organization: '', reason: '' });
      
      toast({
        title: "Thank you!",
        description: "Your interest submission has been received. We'll review it and get back to you soon.",
      });
    } catch (error: any) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error submitting interest:', error);
      }
      toast({
        title: "Submission failed",
        description: error.message || "Failed to submit your interest. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-blue-100 to-blue-200 p-4">
        <Card className="w-full max-w-2xl glass-card floating-hover border-electric-blue/20">
          <CardHeader className="text-center space-y-2">
            <div className="flex items-center justify-center mb-4">
              <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle2 className="h-8 w-8 text-green-600" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">Thank You!</CardTitle>
            <CardDescription className="text-base">
              Your interest submission has been received successfully.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-center text-gray-600">
              We've received your submission and will review it shortly. We'll get back to you soon!
            </p>
            <div className="flex gap-4 justify-center">
              <Button
                onClick={() => setIsSubmitted(false)}
                variant="outline"
                className="bg-white"
              >
                Submit Another
              </Button>
              <Button
                asChild
                className="bg-electric-blue hover:bg-electric-blue/90 text-white"
              >
                <Link to="/">Back to Home</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-blue-100 to-blue-200 p-4">
      <div className="w-full max-w-2xl">
        <Card className="glass-card floating-hover border-electric-blue/20">
          <CardHeader className="text-center space-y-2">
            <div className="flex items-center justify-center gap-2 mb-2">
              <img 
                src="/lovable-uploads/0941509f-be4a-49e7-b472-735a4942f89a.png" 
                alt="SLxAI Logo" 
                className="h-8 w-auto"
              />
              <CardTitle className="text-2xl font-bold text-gray-900">Express Your Interest</CardTitle>
            </div>
            <CardDescription className="text-base">
              Tell us about yourself and why you'd like to be part of SLxAI
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="flex items-center gap-2">
                  <User className="h-4 w-4 text-electric-blue" />
                  Your Name
                </Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  disabled={isSubmitting}
                  className="bg-white"
                  maxLength={200}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-electric-blue" />
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your.email@organization.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  disabled={isSubmitting}
                  className="bg-white"
                  maxLength={200}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="organization" className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-electric-blue" />
                  Organization
                </Label>
                <Input
                  id="organization"
                  type="text"
                  placeholder="Your Organization Name"
                  value={formData.organization}
                  onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                  required
                  disabled={isSubmitting}
                  className="bg-white"
                  maxLength={200}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="reason" className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-electric-blue" />
                  Why do you want to be part of this?
                </Label>
                <Textarea
                  id="reason"
                  placeholder="Tell us about your interest in SLxAI, your background, and what you hope to contribute..."
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  required
                  disabled={isSubmitting}
                  className="bg-white min-h-[150px]"
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
                    Submitting...
                  </>
                ) : (
                  'Submit Interest'
                )}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm text-gray-600">
              <Link to="/" className="text-electric-blue hover:underline">
                ← Back to home
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

