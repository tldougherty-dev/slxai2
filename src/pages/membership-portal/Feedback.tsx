import { useState } from 'react';
import { PageTitle } from '@/components/PageTitle';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { getCurrentUser } from '@/lib/auth';
import { MessageSquare, Send, Loader2 } from 'lucide-react';

export default function Feedback() {
  const { toast } = useToast();
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const user = getCurrentUser();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!feedback.trim()) {
      toast({
        title: "Feedback Required",
        description: "Please enter your feedback before submitting.",
        variant: "destructive",
      });
      return;
    }

    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to submit feedback.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('feedback_submissions')
        .insert({
          user_email: user.email,
          user_name: user.name,
          feedback_text: feedback.trim(),
        });

      if (error) {
        throw error;
      }

      toast({
        title: "Feedback Submitted",
        description: "Thank you for your feedback! We appreciate your input.",
      });

      // Clear the form
      setFeedback('');
    } catch (error: any) {
      console.error('Error submitting feedback:', error);
      toast({
        title: "Error",
        description: error?.message || "Failed to submit feedback. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageTitle
        title="Feedback"
        description="Share your thoughts, suggestions, and ideas to help us improve the platform."
      />

      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-electric-blue" />
            Submit Feedback
          </CardTitle>
          <CardDescription>
            We value your input! Please share any feedback, recommendations, or ideas you have about the website.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="feedback" className="text-sm font-medium text-gray-700 dark:text-white">
                Your Feedback
              </label>
              <Textarea
                id="feedback"
                name="feedback"
                placeholder="Share your thoughts, suggestions, recommendations, or ideas here..."
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                rows={8}
                className="resize-none bg-white dark:bg-[hsl(217,40%,18%)] text-gray-900 dark:text-white border-gray-300 dark:border-[hsl(217,35%,25%)] placeholder:text-gray-500 dark:placeholder:text-gray-400"
                disabled={isSubmitting}
              />
            </div>
            <Button
              type="submit"
              disabled={isSubmitting || !feedback.trim()}
              className="w-full sm:w-auto"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Submit Feedback
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

