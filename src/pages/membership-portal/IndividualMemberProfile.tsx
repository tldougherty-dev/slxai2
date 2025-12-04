import { useParams, Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { PageTitle } from '@/components/PageTitle';
import { 
  ArrowLeft, Mail, Building2, MapPin, Globe, User, Shield,
  Facebook, Twitter, Linkedin, Instagram, Youtube,
  MessageSquare, Heart, ThumbsUp, PartyPopper, Lightbulb, Loader2, Send, Trash2, FileText, Video
} from 'lucide-react';

// TikTok Icon Component
const TikTokIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
  </svg>
);
import { supabase } from '@/lib/supabase';
import { useState, useEffect, useRef, useCallback } from 'react';
import { getAllMembers } from '@/data/membersData';
import { Member, MemberPerson } from '@/data/members';
import { CountryFlag } from '@/components/CountryFlag';
import { UserAvatar } from '@/components/UserAvatar';
import { getCurrentUser } from '@/lib/auth';
import { Navigate } from 'react-router-dom';
import { getUserPosts, getPostComments, addComment, toggleReaction, deletePost, deleteComment, FeedPost, PostComment, ReactionType } from '@/data/feed';
import { formatDistanceToNow } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { sanitizeText, isValidLength, isValidYouTubeUrl, isValidVimeoUrl } from '@/lib/security';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { PostContent } from '@/components/PostContent';
import { WebsitePreview } from '@/components/WebsitePreview';

export default function IndividualMemberProfile() {
  const { email } = useParams<{ email: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [memberPerson, setMemberPerson] = useState<MemberPerson & { organization?: Member; bio?: string; profilePicture?: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userPosts, setUserPosts] = useState<FeedPost[]>([]);
  const [isLoadingPosts, setIsLoadingPosts] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [expandedComments, setExpandedComments] = useState<Set<string>>(new Set());
  const [commentInputs, setCommentInputs] = useState<{ [postId: string]: string }>({});
  const [postToDelete, setPostToDelete] = useState<string | null>(null);
  const [commentToDelete, setCommentToDelete] = useState<string | null>(null);
  const commentsEndRefs = useRef<{ [postId: string]: HTMLDivElement | null }>({});

  const REACTION_ICONS: Record<ReactionType, typeof Heart> = {
    like: ThumbsUp,
    love: Heart,
    celebrate: PartyPopper,
    insightful: Lightbulb,
  };

  useEffect(() => {
    const loadMemberProfile = async () => {
      if (!email) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        // Get all members to find the person
        const allMembers = await getAllMembers();
        
        // Find the person across all organizations
        let foundPerson: MemberPerson | null = null;
        let foundOrganization: Member | null = null;

        for (const org of allMembers) {
          const person = org.members.find(
            m => m.email.toLowerCase() === email.toLowerCase()
          );
          if (person) {
            foundPerson = person;
            foundOrganization = org;
            break;
          }
        }

        if (foundPerson && foundOrganization) {
          // Fetch user data from auth.users to get bio, profile picture, social media, and user ID
          let socialMedia = {};
          let bio = '';
          let profilePicture = '';
          let authUserId: string | null = null;
          
          try {
            // Try to get user ID from feed_posts by author_email
            const { data: postData, error: postError } = await supabase
              .from('feed_posts')
              .select('author_id')
              .eq('author_email', email.toLowerCase())
              .limit(1);
            
            if (!postError && postData && postData.length > 0 && postData[0]?.author_id) {
              authUserId = postData[0].author_id;
            }
            
            // Try to get from current user if it's their own profile
            const currentUser = getCurrentUser();
            if (currentUser && currentUser.email.toLowerCase() === email.toLowerCase()) {
              try {
                const { data: { user: authUser } } = await supabase.auth.getUser();
                if (authUser) {
                  authUserId = authUser.id;
                  socialMedia = authUser.user_metadata?.social_media || {};
                  bio = authUser.user_metadata?.bio || '';
                  profilePicture = authUser.user_metadata?.profile_picture || '';
                }
              } catch (error) {
                if (process.env.NODE_ENV === 'development') {
                  console.warn('Could not fetch user data:', error);
                }
              }
            } else if (authUserId) {
              // If we have user ID but not metadata, try to get metadata via RPC
              try {
                const { data: roleData } = await supabase.rpc('get_user_roles', {
                  user_emails: [email.toLowerCase()]
                });
                if (roleData && roleData.length > 0) {
                  // Note: get_user_roles might not return metadata, so we'll keep defaults
                }
              } catch (error) {
                if (process.env.NODE_ENV === 'development') {
                  console.warn('Could not fetch user metadata:', error);
                }
              }
            }
          } catch (error) {
            if (process.env.NODE_ENV === 'development') {
              console.warn('Could not fetch user data:', error);
            }
          }
          
          setUserId(authUserId);
          setMemberPerson({
            ...foundPerson,
            socialMedia: socialMedia,
            bio: bio,
            profilePicture: profilePicture,
            organization: foundOrganization,
          });
        }
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          console.error('Error loading member profile:', error);
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadMemberProfile();
  }, [email]);

  const loadUserPosts = useCallback(async () => {
    if (!userId) return;
    setIsLoadingPosts(true);
    try {
      const posts = await getUserPosts(userId);
      setUserPosts(posts);
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error loading user posts:', error);
      }
    } finally {
      setIsLoadingPosts(false);
    }
  }, [userId]);

  useEffect(() => {
    if (userId) {
      loadUserPosts();
    }
  }, [userId, loadUserPosts]);

  const handleReaction = async (postId: string, reactionType: ReactionType) => {
    try {
      await toggleReaction(postId, reactionType);
      await loadUserPosts();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add reaction. Please try again.",
        variant: "destructive",
      });
    }
  };

  const toggleComments = async (postId: string) => {
    const newExpanded = new Set(expandedComments);
    if (newExpanded.has(postId)) {
      newExpanded.delete(postId);
    } else {
      newExpanded.add(postId);
      const post = userPosts.find(p => p.id === postId);
      if (post && !(post as FeedPost & { comments?: PostComment[] }).comments) {
        try {
          const comments = await getPostComments(postId);
          const updatedPosts = userPosts.map(p => 
            p.id === postId ? { ...p, comments } : p
          );
          setUserPosts(updatedPosts);
        } catch (error) {
          if (process.env.NODE_ENV === 'development') {
            console.error('Error loading comments:', error);
          }
        }
      }
    }
    setExpandedComments(newExpanded);
  };

  const handleCommentSubmit = async (postId: string) => {
    const content = commentInputs[postId]?.trim();
    if (!content) return;

    if (!isValidLength(content, 1, 1000)) {
      toast({
        title: "Invalid comment",
        description: "Comment must be between 1 and 1000 characters.",
        variant: "destructive",
      });
      return;
    }

    try {
      await addComment(postId, sanitizeText(content));
      setCommentInputs({ ...commentInputs, [postId]: '' });
      await loadUserPosts();
      
      setTimeout(() => {
        const ref = commentsEndRefs.current[postId];
        if (ref) {
          ref.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add comment. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeletePost = async () => {
    if (!postToDelete) return;
    try {
      await deletePost(postToDelete);
      setPostToDelete(null);
      await loadUserPosts();
      toast({
        title: "Post deleted",
        description: "The post has been deleted successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete post. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteComment = async () => {
    if (!commentToDelete) return;
    try {
      await deleteComment(commentToDelete);
      setCommentToDelete(null);
      await loadUserPosts();
      toast({
        title: "Comment deleted",
        description: "The comment has been deleted successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete comment. Please try again.",
        variant: "destructive",
      });
    }
  };

  const renderMediaContent = (post: FeedPost) => {
    if (!post.mediaUrl) return null;

    switch (post.postType) {
      case 'video':
        const isYouTube = isValidYouTubeUrl(post.mediaUrl);
        const isVimeo = isValidVimeoUrl(post.mediaUrl);
        
        if (isYouTube) {
          const videoId = post.mediaUrl.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/)?.[1];
          if (videoId) {
            return (
              <div className="mt-3 rounded-lg overflow-hidden">
                <iframe
                  src={`https://www.youtube.com/embed/${videoId}`}
                  className="w-full aspect-video"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  title={post.mediaTitle || 'Video'}
                />
              </div>
            );
          }
        }
        
        if (isVimeo) {
          const videoId = post.mediaUrl.match(/vimeo\.com\/(\d+)/)?.[1];
          if (videoId) {
            return (
              <div className="mt-3 rounded-lg overflow-hidden">
                <iframe
                  src={`https://player.vimeo.com/video/${videoId}`}
                  className="w-full aspect-video"
                  allow="autoplay; fullscreen; picture-in-picture"
                  allowFullScreen
                  title={post.mediaTitle || 'Video'}
                />
              </div>
            );
          }
        }
        
        return (
          <div className="mt-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Video className="h-4 w-4" />
              <a href={post.mediaUrl} target="_blank" rel="noopener noreferrer" className="text-electric-blue hover:underline">
                {post.mediaTitle || 'Watch Video'}
              </a>
            </div>
          </div>
        );
      case 'document':
        return (
          <div className="mt-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <FileText className="h-4 w-4" />
              <a href={post.mediaUrl} target="_blank" rel="noopener noreferrer" className="text-electric-blue hover:underline">
                {post.mediaTitle || 'View Document'}
              </a>
            </div>
          </div>
        );
      case 'link':
        if (post.mediaUrl.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i) || post.mediaUrl.includes('/post-images/')) {
          return (
            <div className="mt-3">
              <img
                src={post.mediaUrl}
                alt="Post image"
                className="w-full max-h-96 object-contain rounded-lg"
              />
            </div>
          );
        }
        return <WebsitePreview url={post.mediaUrl} />;
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-electric-blue mx-auto mb-4"></div>
          <p className="text-gray-600">Loading member profile...</p>
        </div>
      </div>
    );
  }

  if (!memberPerson) {
    return (
      <div className="space-y-4">
        <Button variant="outline" asChild className="border-gray-300 text-gray-700 dark:!text-gray-900 hover:bg-gray-50 hover:text-gray-900 dark:hover:!text-gray-900 bg-white">
          <Link to="/membership-portal/directory">
            <ArrowLeft className="h-4 w-4 mr-2 dark:!text-gray-900" />
            <span className="dark:!text-gray-900">Back to Directory</span>
          </Link>
        </Button>
        <Card className="glass-card floating-hover">
          <CardContent className="pt-6">
            <p className="text-center text-gray-600">
              Member not found.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentUser = getCurrentUser();
  const isOwnProfile = currentUser?.email.toLowerCase() === memberPerson.email.toLowerCase();
  const organization = memberPerson.organization;

  // Generate website URL from email domain
  const getWebsiteUrl = (email: string): string | null => {
    const domain = email.split('@')[1];
    if (domain) {
      const cleanDomain = domain.replace(/^(mail\.|www\.|email\.)/i, '');
      return `https://${cleanDomain}`;
    }
    return null;
  };

  const websiteUrl = organization?.website || getWebsiteUrl(memberPerson.email);

  // All members started on November 18th, 2024
  const memberSince = new Date(2024, 10, 18);
  const memberSinceFormatted = memberSince.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  return (
    <div className="space-y-0 md:space-y-4">
      <PageTitle 
        title="Member Directory"
        rightContent={
          <Button variant="outline" asChild size="sm" className="border-gray-300 text-gray-700 dark:!text-gray-900 hover:bg-gray-50 hover:text-gray-900 dark:hover:!text-gray-900 bg-white text-xs md:text-sm px-2 md:px-3">
            <Link to={organization ? `/membership-portal/directory/${organization.id}` : '/membership-portal/directory'}>
              <ArrowLeft className="h-3 w-3 md:h-4 md:w-4 md:mr-1 dark:!text-gray-900" />
              <span className="hidden sm:inline dark:!text-gray-900">{organization ? 'Back to Organization' : 'Back to Directory'}</span>
              <span className="sm:hidden dark:!text-gray-900">Back</span>
            </Link>
          </Button>
        }
      />

      {/* Member Header */}
      <Card className="glass-card floating-hover">
        <CardHeader className="pb-3">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <UserAvatar
                email={memberPerson.email}
                name={memberPerson.name}
                profilePicture={memberPerson.profilePicture}
                size="2xl"
              />
            </div>
            <div className="flex-1">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-2xl mb-1">{memberPerson.name}</CardTitle>
                  <div className="flex items-center gap-2 flex-wrap">
                    {memberPerson.isVotingRep && (
                      <Badge variant="secondary" className="bg-electric-blue/20 text-electric-blue border-electric-blue/30 text-xs px-1.5 py-0.5">
                        Voting
                      </Badge>
                    )}
                    {memberPerson.role && memberPerson.role !== 'member' && (
                      <Badge 
                        variant="secondary" 
                        className={`text-xs px-1.5 py-0.5 ${
                          memberPerson.role === 'super_admin' || memberPerson.role === 'admin' ? 'bg-blue-100 text-blue-700 border-blue-300' :
                          memberPerson.role === 'voting_member' ? 'bg-green-100 text-green-700 border-green-300' : ''
                        }`}
                      >
                        {memberPerson.role === 'super_admin' || memberPerson.role === 'admin' ? (
                          'Admin'
                        ) : (
                          'Voting Member'
                        )}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-3">
          <div className="space-y-3">
            {/* Contact Information */}
            <div className="pt-3 border-t border-gray-200">
              <div className="flex items-start gap-6 flex-wrap">
                <div>
                  <p className="text-xs font-semibold text-gray-500 dark:text-white uppercase mb-2">Email</p>
                  <a 
                    href={`mailto:${memberPerson.email}`}
                    className="text-sm text-electric-blue hover:underline flex items-center gap-1"
                  >
                    <Mail className="h-3 w-3" />
                    {memberPerson.email}
                  </a>
                </div>
                {memberPerson.title && (
                  <div>
                    <p className="text-xs font-semibold text-gray-500 dark:text-white uppercase mb-2">Title</p>
                    <p className="text-sm text-gray-900 dark:text-white">{memberPerson.title}</p>
                  </div>
                )}
                {organization && (
                  <>
                    <div>
                      <p className="text-xs font-semibold text-gray-500 dark:text-white uppercase mb-2">Organization</p>
                      <Link 
                        to={`/membership-portal/directory/${organization.id}`}
                        className="text-sm text-electric-blue hover:underline flex items-center gap-1"
                      >
                        <Building2 className="h-3 w-3" />
                        {organization.organizationName}
                      </Link>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-500 dark:text-white uppercase mb-2">Location</p>
                      <div className="flex items-center gap-2">
                        <CountryFlag country={organization.country} size="md" />
                        <span className="text-sm text-gray-900 dark:text-white">{organization.country}</span>
                      </div>
                    </div>
                  </>
                )}
                {websiteUrl && (
                  <div>
                    <p className="text-xs font-semibold text-gray-500 dark:text-white uppercase mb-2">Website</p>
                    <a 
                      href={websiteUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sm text-electric-blue hover:underline flex items-center gap-1"
                    >
                      <Globe className="h-3 w-3" />
                      {websiteUrl.replace(/^https?:\/\//, '')}
                    </a>
                  </div>
                )}
                <div>
                  <p className="text-xs font-semibold text-gray-500 dark:text-white uppercase mb-2">Member since</p>
                  <p className="text-sm text-gray-900 dark:text-white">{memberSinceFormatted}</p>
                </div>
              </div>
            </div>

            {/* Bio Section */}
            {memberPerson.bio && (
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1.5 flex items-center gap-2 text-sm">
                  <User className="h-3.5 w-3.5 text-electric-blue" />
                  About
                </h3>
                <p className="text-gray-700 dark:text-white leading-relaxed text-sm whitespace-pre-wrap">{memberPerson.bio}</p>
              </div>
            )}

            {/* Social Media */}
            {memberPerson.socialMedia && Object.keys(memberPerson.socialMedia).length > 0 && (
              <div className="pt-4 border-t border-gray-200">
                <p className="text-xs font-semibold text-gray-500 dark:text-white uppercase mb-3">Social Media</p>
                <div className="flex flex-wrap gap-3">
                  {memberPerson.socialMedia.facebook && (
                    <a
                      href={memberPerson.socialMedia.facebook}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700 hover:underline"
                    >
                      <Facebook className="h-4 w-4" />
                      Facebook
                    </a>
                  )}
                  {memberPerson.socialMedia.x && (
                    <a
                      href={memberPerson.socialMedia.x}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-sm text-blue-400 hover:text-blue-500 hover:underline"
                    >
                      <Twitter className="h-4 w-4" />
                      X
                    </a>
                  )}
                  {memberPerson.socialMedia.linkedin && (
                    <a
                      href={memberPerson.socialMedia.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-sm text-blue-700 hover:text-blue-800 hover:underline"
                    >
                      <Linkedin className="h-4 w-4" />
                      LinkedIn
                    </a>
                  )}
                  {memberPerson.socialMedia.instagram && (
                    <a
                      href={memberPerson.socialMedia.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-sm text-pink-600 hover:text-pink-700 hover:underline"
                    >
                      <Instagram className="h-4 w-4" />
                      Instagram
                    </a>
                  )}
                  {memberPerson.socialMedia.youtube && (
                    <a
                      href={memberPerson.socialMedia.youtube}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-sm text-red-600 hover:text-red-700 hover:underline"
                    >
                      <Youtube className="h-4 w-4" />
                      YouTube
                    </a>
                  )}
                  {memberPerson.socialMedia.tiktok && (
                    <a
                      href={memberPerson.socialMedia.tiktok}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-sm text-gray-800 dark:text-white hover:text-gray-900 dark:hover:text-white hover:underline"
                    >
                      <TikTokIcon className="h-4 w-4" />
                      TikTok
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Member Posts Feed */}
      <Card className="glass-card floating-hover">
        <CardHeader className="p-4 md:p-6">
          <CardTitle className="flex items-center gap-2 text-lg">
            <MessageSquare className="h-5 w-5 text-electric-blue" />
            Posts
          </CardTitle>
          <CardDescription>
            Posts by {memberPerson.name}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0 md:p-6">
          {isLoadingPosts ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-electric-blue" />
            </div>
          ) : userPosts.length === 0 ? (
            <div className="py-12 text-center">
              <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-600">No posts yet.</p>
            </div>
          ) : (
            <div className="w-full md:max-w-2xl md:mx-auto space-y-1 md:space-y-4">
              {userPosts.map((post) => {
                  const postWithComments = post as FeedPost & { comments?: PostComment[] };
                  const comments = expandedComments.has(post.id) ? (postWithComments.comments || []) : [];
                  const currentUser = getCurrentUser();
                  const isAuthor = post.authorId === currentUser?.id;
                  const canDelete = isAuthor || currentUser?.role === 'admin' || currentUser?.role === 'super_admin';

                  return (
                    <Card key={post.id} className="glass-card floating-hover">
                      <CardContent className="p-2 md:p-4">
                        {/* Post Header */}
                        <div className="flex items-start justify-between mb-2 md:mb-3">
                          <div className="flex items-start gap-2 md:gap-3">
                            {post.postSource === 'organization' && post.organizationLogo ? (
                              <>
                                <img 
                                  src={post.organizationLogo} 
                                  alt={post.organizationName || 'Organization'} 
                                  className="h-[2.75rem] w-[2.75rem] md:h-[3rem] md:w-[3rem] rounded-lg object-cover border border-gray-200 flex-shrink-0"
                                />
                                <div>
                                  <div className="flex items-center gap-2">
                                    <p className="font-semibold text-gray-900 dark:text-white">{post.organizationName}</p>
                                  </div>
                                  <p className="text-xs text-gray-500">
                                    posted by {post.authorName} · {formatDistanceToNow(post.createdAt, { addSuffix: true }).replace(/^about /, '')}
                                  </p>
                                </div>
                              </>
                            ) : (
                              <>
                                <div className="flex-shrink-0">
                                  <UserAvatar 
                                    email={post.authorEmail} 
                                    name={post.authorName}
                                    size="md"
                                    className="!h-[2.75rem] !w-[2.75rem] md:!h-[3rem] md:!w-[3rem]"
                                  />
                                </div>
                                <div>
                                  <div className="flex items-center gap-2">
                                    <p className="font-semibold text-gray-900 dark:text-white">{post.authorName}</p>
                                    {post.organizationName && (
                                      <span className="text-xs text-gray-500">· {post.organizationName}</span>
                                    )}
                                  </div>
                                  <p className="text-xs text-gray-500">
                                    {formatDistanceToNow(post.createdAt, { addSuffix: true }).replace(/^about /, '')}
                                  </p>
                                </div>
                              </>
                            )}
                          </div>
                          {canDelete && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setPostToDelete(post.id)}
                            className="text-gray-400 hover:text-red-600"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>

                      {/* Post Content */}
                      <div>
                        <PostContent content={post.content} />
                        {renderMediaContent(post)}
                      </div>

                      {/* Reactions */}
                      <div className="flex items-center gap-3 py-2 border-t border-gray-200">
                        {Object.entries(REACTION_ICONS).map(([type, Icon]) => {
                          const reactionType = type as ReactionType;
                          const count = post.reactionCounts?.[reactionType] || 0;
                          const isActive = post.userReactions?.includes(reactionType);

                          let activeColor = '';
                          if (isActive) {
                            if (reactionType === 'love') {
                              activeColor = 'text-red-500 fill-red-500';
                            } else if (reactionType === 'celebrate') {
                              activeColor = 'text-yellow-500 fill-yellow-500';
                            } else if (reactionType === 'insightful') {
                              activeColor = 'text-yellow-500 fill-yellow-500';
                            } else {
                              activeColor = 'text-electric-blue fill-electric-blue';
                            }
                          }

                          return (
                            <button
                              key={type}
                              onClick={() => handleReaction(post.id, reactionType)}
                              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full transition-colors ${
                                isActive
                                  ? 'bg-gray-100'
                                  : 'text-gray-600 hover:bg-gray-100'
                              }`}
                            >
                              {reactionType === 'celebrate' && isActive ? (
                                <div className="h-4 w-4 bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-500 rounded-full flex items-center justify-center p-0.5">
                                  <Icon className="h-3 w-3 text-white" />
                                </div>
                              ) : (
                                <Icon className={`h-4 w-4 ${isActive ? activeColor : ''}`} />
                              )}
                              {count > 0 && <span className="text-xs font-medium">{count}</span>}
                            </button>
                          );
                        })}
                      </div>

                      {/* Comments Section */}
                      <div className="border-t border-gray-200 pt-2">
                        <button
                          onClick={() => toggleComments(post.id)}
                          className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-3"
                        >
                          <MessageSquare className="h-4 w-4" />
                          <span>{post.commentCount || 0} comments</span>
                        </button>

                        {expandedComments.has(post.id) && (
                          <div className="space-y-3">
                            {/* Comments List */}
                            {comments.map((comment: PostComment) => {
                              const isCommentAuthor = comment.authorId === currentUser?.id;
                              const canDeleteComment = isCommentAuthor || currentUser?.role === 'admin' || currentUser?.role === 'super_admin';

                              return (
                                <div key={comment.id} className="flex items-start gap-3 pl-2">
                                  <UserAvatar 
                                    email={comment.authorEmail} 
                                    name={comment.authorName}
                                    size="sm"
                                  />
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                      <p className="font-medium text-sm text-gray-900">{comment.authorName}</p>
                                      <span className="text-xs text-gray-500">
                                        {formatDistanceToNow(comment.createdAt, { addSuffix: true })}
                                      </span>
                                    </div>
                                    <p className="text-sm text-gray-700">{comment.content}</p>
                                  </div>
                                  {canDeleteComment && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => setCommentToDelete(comment.id)}
                                      className="text-gray-400 hover:text-red-600 h-6 w-6 p-0"
                                    >
                                      <Trash2 className="h-3 w-3" />
                                    </Button>
                                  )}
                                </div>
                              );
                            })}
                            <div ref={(el) => (commentsEndRefs.current[post.id] = el)} />

                            {/* Comment Input */}
                            <div className="flex items-start gap-2 pt-2">
                              <UserAvatar 
                                email={currentUser?.email || ''} 
                                name={currentUser?.name || 'You'}
                                size="sm"
                              />
                              <div className="flex-1 flex gap-2">
                                <Input
                                  placeholder="Write a comment..."
                                  value={commentInputs[post.id] || ''}
                                  onChange={(e) => setCommentInputs({ ...commentInputs, [post.id]: e.target.value })}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                      e.preventDefault();
                                      handleCommentSubmit(post.id);
                                    }
                                  }}
                                  className="text-sm"
                                />
                                <Button
                                  size="sm"
                                  onClick={() => handleCommentSubmit(post.id)}
                                  disabled={!commentInputs[post.id]?.trim()}
                                >
                                  <Send className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

      {/* Delete Post Confirmation */}
      <AlertDialog open={!!postToDelete} onOpenChange={() => setPostToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Post</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this post? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-gray-300 text-gray-700 hover:bg-gray-50">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeletePost} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Comment Confirmation */}
      <AlertDialog open={!!commentToDelete} onOpenChange={() => setCommentToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Comment</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this comment? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-gray-300 text-gray-700 hover:bg-gray-50">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteComment} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

