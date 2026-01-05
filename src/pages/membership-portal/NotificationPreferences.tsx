import { useState, useEffect } from 'react';
import { PageTitle } from '@/components/PageTitle';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import {
  getNotificationPreferences,
  saveNotificationPreferences,
  getOrCreateNotificationPreferences,
  type NotificationPreferences,
} from '@/lib/notificationPreferences';
import { getCurrentUser, isAdmin, isSuperAdmin } from '@/lib/auth';
import { isSummitMember } from '@/data/summit';
import { Loader2, Bell, Mail, FileText, MessageSquare, Vote, Users, Trophy, Settings, Save, RotateCcw } from 'lucide-react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

export default function NotificationPreferences() {
  const { toast } = useToast();
  const user = getCurrentUser();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [originalPreferences, setOriginalPreferences] = useState<NotificationPreferences | null>(null);
  const [userIsAdmin, setUserIsAdmin] = useState(false);
  const [userIsSummitMember, setUserIsSummitMember] = useState(false);

  // Check if user came from unsubscribe link
  const isUnsubscribe = searchParams.get('unsubscribe') === 'true';
  const unsubscribeEmail = searchParams.get('email');

  useEffect(() => {
    const loadPreferences = async () => {
      setIsLoading(true);
      try {
        const prefs = await getOrCreateNotificationPreferences(user?.id, user?.email);
        setPreferences(prefs);
        setOriginalPreferences(prefs);
        
        // Check admin status
        const adminStatus = isAdmin() || isSuperAdmin();
        setUserIsAdmin(adminStatus);
        
        // Check summit member status
        if (user?.email) {
          try {
            const summitStatus = await isSummitMember(user.email);
            setUserIsSummitMember(summitStatus);
          } catch (error) {
            if (import.meta.env.DEV) {
              console.error('Error checking summit member status:', error);
            }
            setUserIsSummitMember(false);
          }
        }
      } catch (error) {
        if (import.meta.env.DEV) {
          console.error('Error loading notification preferences:', error);
        }
        toast({
          title: 'Error',
          description: 'Failed to load notification preferences. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadPreferences();
  }, [user?.id, user?.email, toast]);

  const handleToggle = (key: keyof NotificationPreferences) => {
    if (!preferences) return;

    setPreferences({
      ...preferences,
      [key]: !preferences[key],
    });
    setHasChanges(true);
  };

  const handleSave = async () => {
    if (!preferences) return;

    setIsSaving(true);
    try {
      const saved = await saveNotificationPreferences(preferences);
      setPreferences(saved);
      setOriginalPreferences(saved);
      setHasChanges(false);
      toast({
        title: 'Success',
        description: 'Notification preferences saved successfully.',
      });
      
      // If came from unsubscribe link, show success message
      if (isUnsubscribe) {
        setTimeout(() => {
          navigate('/membership-portal/notifications');
        }, 2000);
      }
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Error saving notification preferences:', error);
      }
      toast({
        title: 'Error',
        description: 'Failed to save notification preferences. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    if (originalPreferences) {
      setPreferences(originalPreferences);
      setHasChanges(false);
    }
  };

  const handleResetToDefaults = async () => {
    if (!user) return;

    setIsSaving(true);
    try {
      const defaultPrefs = await getOrCreateNotificationPreferences(user.id, user.email);
      // Reset to defaults
      const resetPrefs: NotificationPreferences = {
        ...defaultPrefs,
        feedNewPost: true,
        feedNewComment: false, // OFF by default
        fileNewUpload: false, // OFF by default
        fileCategoryUpdate: false,
        discussionNewMessage: false, // OFF by default
        discussionNewChannel: false,
        discussionMention: true,
        postReply: true,
        commentReply: true,
        postMention: true,
        voteNew: true,
        voteEndingSoon: true,
        voteResult: true,
        memberNewOrganization: false,
        memberProfileUpdate: false,
        summitNewWorkshop: true,
        summitNewSponsor: false,
        summitDeadlineReminder: true,
        systemAnnouncement: true,
        systemMaintenance: true,
        emailFrequency: 'immediate',
      };
      
      const saved = await saveNotificationPreferences(resetPrefs);
      setPreferences(saved);
      setOriginalPreferences(saved);
      setHasChanges(false);
      toast({
        title: 'Reset Complete',
        description: 'Notification preferences reset to defaults.',
      });
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Error resetting preferences:', error);
      }
      toast({
        title: 'Error',
        description: 'Failed to reset preferences. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <PageTitle title="Notification Preferences" />
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-electric-blue" />
        </div>
      </div>
    );
  }

  if (!preferences) {
    return (
      <div className="container mx-auto px-4 py-8">
        <PageTitle title="Notification Preferences" />
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to load notification preferences. Please refresh the page.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <PageTitle title="Notification Preferences" />
      
      {isUnsubscribe && (
        <Alert className="mb-6">
          <CheckCircle2 className="h-4 w-4" />
          <AlertDescription>
            {unsubscribeEmail 
              ? `You can manage your email notification preferences for ${unsubscribeEmail} below.`
              : 'You can manage your email notification preferences below.'}
          </AlertDescription>
        </Alert>
      )}

      <div className="mb-6 flex items-center justify-between">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Choose which email notifications you want to receive. You'll always receive in-app notifications.
        </p>
        <div className="flex gap-2">
          <Button
            variant="default"
            size="sm"
            onClick={handleResetToDefaults}
            disabled={isSaving}
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset to Defaults
          </Button>
          {hasChanges && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleReset}
              disabled={isSaving}
            >
              Cancel
            </Button>
          )}
          <Button
            variant="default"
            onClick={handleSave}
            disabled={!hasChanges || isSaving}
            size="sm"
          >
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Feed Notifications */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-electric-blue" />
            <CardTitle>Feed Notifications</CardTitle>
          </div>
          <CardDescription>Notifications about activity on the global feed</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="feed-new-post">New Posts</Label>
              <p className="text-sm text-gray-500 dark:text-gray-400">Get notified when new posts are added to the global feed</p>
            </div>
            <Switch
              id="feed-new-post"
              checked={preferences.feedNewPost}
              onCheckedChange={() => handleToggle('feedNewPost')}
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="feed-new-comment">New Comments</Label>
              <p className="text-sm text-gray-500 dark:text-gray-400">Get notified when new comments are added to feed posts</p>
            </div>
            <Switch
              id="feed-new-comment"
              checked={preferences.feedNewComment}
              onCheckedChange={() => handleToggle('feedNewComment')}
            />
          </div>
        </CardContent>
      </Card>

      {/* File Notifications */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-electric-blue" />
            <CardTitle>File Notifications</CardTitle>
          </div>
          <CardDescription>Notifications about new files and updates</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="file-new-upload">New File Uploads</Label>
              <p className="text-sm text-gray-500 dark:text-gray-400">Get notified when new files are uploaded</p>
            </div>
            <Switch
              id="file-new-upload"
              checked={preferences.fileNewUpload}
              onCheckedChange={() => handleToggle('fileNewUpload')}
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="file-category-update">Category Updates</Label>
              <p className="text-sm text-gray-500 dark:text-gray-400">Get notified when files are added to specific categories</p>
            </div>
            <Switch
              id="file-category-update"
              checked={preferences.fileCategoryUpdate}
              onCheckedChange={() => handleToggle('fileCategoryUpdate')}
            />
          </div>
        </CardContent>
      </Card>

      {/* Discussion Notifications */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-electric-blue" />
            <CardTitle>Discussion Notifications</CardTitle>
          </div>
          <CardDescription>Notifications about discussion board activity</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="discussion-new-message">New Messages</Label>
              <p className="text-sm text-gray-500 dark:text-gray-400">Get notified when new messages are posted in discussions</p>
            </div>
            <Switch
              id="discussion-new-message"
              checked={preferences.discussionNewMessage}
              onCheckedChange={() => handleToggle('discussionNewMessage')}
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="discussion-new-channel">New Channels</Label>
              <p className="text-sm text-gray-500 dark:text-gray-400">Get notified when new discussion channels are created</p>
            </div>
            <Switch
              id="discussion-new-channel"
              checked={preferences.discussionNewChannel}
              onCheckedChange={() => handleToggle('discussionNewChannel')}
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="discussion-mention">Mentions</Label>
              <p className="text-sm text-gray-500 dark:text-gray-400">Get notified when you're mentioned in a discussion</p>
            </div>
            <Switch
              id="discussion-mention"
              checked={preferences.discussionMention}
              onCheckedChange={() => handleToggle('discussionMention')}
            />
          </div>
        </CardContent>
      </Card>

      {/* Post & Comment Notifications */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-electric-blue" />
            <CardTitle>Post & Comment Notifications</CardTitle>
          </div>
          <CardDescription>Notifications about responses to your content</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="post-reply">Post Replies</Label>
              <p className="text-sm text-gray-500 dark:text-gray-400">Get notified when someone replies to your posts</p>
            </div>
            <Switch
              id="post-reply"
              checked={preferences.postReply}
              onCheckedChange={() => handleToggle('postReply')}
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="comment-reply">Comment Replies</Label>
              <p className="text-sm text-gray-500 dark:text-gray-400">Get notified when someone replies to your comments</p>
            </div>
            <Switch
              id="comment-reply"
              checked={preferences.commentReply}
              onCheckedChange={() => handleToggle('commentReply')}
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="post-mention">Post Mentions</Label>
              <p className="text-sm text-gray-500 dark:text-gray-400">Get notified when you're mentioned in a post</p>
            </div>
            <Switch
              id="post-mention"
              checked={preferences.postMention}
              onCheckedChange={() => handleToggle('postMention')}
            />
          </div>
        </CardContent>
      </Card>

      {/* Voting Notifications */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Vote className="h-5 w-5 text-electric-blue" />
            <CardTitle>Voting Notifications</CardTitle>
          </div>
          <CardDescription>Notifications about votes and voting activity</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="vote-new">New Votes</Label>
              <p className="text-sm text-gray-500 dark:text-gray-400">Get notified when new votes are created</p>
            </div>
            <Switch
              id="vote-new"
              checked={preferences.voteNew}
              onCheckedChange={() => handleToggle('voteNew')}
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="vote-ending-soon">Votes Ending Soon</Label>
              <p className="text-sm text-gray-500 dark:text-gray-400">Get notified 24 hours before votes close</p>
            </div>
            <Switch
              id="vote-ending-soon"
              checked={preferences.voteEndingSoon}
              onCheckedChange={() => handleToggle('voteEndingSoon')}
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="vote-result">Vote Results</Label>
              <p className="text-sm text-gray-500 dark:text-gray-400">Get notified when vote results are available</p>
            </div>
            <Switch
              id="vote-result"
              checked={preferences.voteResult}
              onCheckedChange={() => handleToggle('voteResult')}
            />
          </div>
        </CardContent>
      </Card>

      {/* Summit Notifications - Only visible to summit members */}
      {userIsSummitMember && (
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-electric-blue" />
              <CardTitle>Summit Notifications</CardTitle>
            </div>
            <CardDescription>Notifications about Summit 2026 planning and activities</CardDescription>
          </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="summit-new-workshop">New Workshop Submissions</Label>
              <p className="text-sm text-gray-500 dark:text-gray-400">Get notified when new workshop submissions are made</p>
            </div>
            <Switch
              id="summit-new-workshop"
              checked={preferences.summitNewWorkshop}
              onCheckedChange={() => handleToggle('summitNewWorkshop')}
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="summit-new-sponsor">New Sponsor Submissions</Label>
              <p className="text-sm text-gray-500 dark:text-gray-400">Get notified when new sponsor submissions are made</p>
            </div>
            <Switch
              id="summit-new-sponsor"
              checked={preferences.summitNewSponsor}
              onCheckedChange={() => handleToggle('summitNewSponsor')}
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="summit-deadline-reminder">Deadline Reminders</Label>
              <p className="text-sm text-gray-500 dark:text-gray-400">Get notified about upcoming summit deadlines</p>
            </div>
            <Switch
              id="summit-deadline-reminder"
              checked={preferences.summitDeadlineReminder}
              onCheckedChange={() => handleToggle('summitDeadlineReminder')}
            />
          </div>
        </CardContent>
      </Card>
      )}

      {/* Member Notifications - Only visible to admins */}
      {userIsAdmin && (
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-electric-blue" />
              <CardTitle>Member Notifications</CardTitle>
            </div>
            <CardDescription>Notifications about member and organization activity</CardDescription>
          </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="member-new-organization">New Organizations</Label>
              <p className="text-sm text-gray-500 dark:text-gray-400">Get notified when new organizations join</p>
            </div>
            <Switch
              id="member-new-organization"
              checked={preferences.memberNewOrganization}
              onCheckedChange={() => handleToggle('memberNewOrganization')}
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="member-profile-update">Profile Updates</Label>
              <p className="text-sm text-gray-500 dark:text-gray-400">Get notified when organization profiles are updated</p>
            </div>
            <Switch
              id="member-profile-update"
              checked={preferences.memberProfileUpdate}
              onCheckedChange={() => handleToggle('memberProfileUpdate')}
            />
          </div>
        </CardContent>
      </Card>
      )}

      {/* System Notifications */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-electric-blue" />
            <CardTitle>System Notifications</CardTitle>
          </div>
          <CardDescription>Important system announcements and updates</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="system-announcement">System Announcements</Label>
              <p className="text-sm text-gray-500 dark:text-gray-400">Get notified about important system announcements</p>
            </div>
            <Switch
              id="system-announcement"
              checked={preferences.systemAnnouncement}
              onCheckedChange={() => handleToggle('systemAnnouncement')}
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="system-maintenance">Maintenance Notifications</Label>
              <p className="text-sm text-gray-500 dark:text-gray-400">Get notified about scheduled maintenance</p>
            </div>
            <Switch
              id="system-maintenance"
              checked={preferences.systemMaintenance}
              onCheckedChange={() => handleToggle('systemMaintenance')}
            />
          </div>
        </CardContent>
      </Card>

      {/* Email Frequency */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-electric-blue" />
            <CardTitle>Email Frequency</CardTitle>
          </div>
          <CardDescription>How often you want to receive email notifications</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {(['immediate', 'daily', 'weekly', 'never'] as const).map((frequency) => (
              <div key={frequency} className="flex items-center space-x-2">
                <input
                  type="radio"
                  id={`frequency-${frequency}`}
                  name="email-frequency"
                  value={frequency}
                  checked={preferences.emailFrequency === frequency}
                  onChange={() => {
                    setPreferences({ ...preferences, emailFrequency: frequency });
                    setHasChanges(true);
                  }}
                  className="h-4 w-4 text-electric-blue focus:ring-electric-blue"
                />
                <Label htmlFor={`frequency-${frequency}`} className="cursor-pointer">
                  {frequency === 'immediate' && 'Immediate - Receive emails as they happen'}
                  {frequency === 'daily' && 'Daily Digest - Receive one email per day with all notifications'}
                  {frequency === 'weekly' && 'Weekly Digest - Receive one email per week with all notifications'}
                  {frequency === 'never' && 'Never - Only receive in-app notifications'}
                </Label>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

