import { useParams, Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { PageTitle } from '@/components/PageTitle';
import { 
  Building2, MapPin, Users, Hand, Mail, ArrowLeft, Vote, 
  Calendar, Globe, Video, FileText, MessageSquare, TrendingUp,
  Award, ExternalLink, Phone, Linkedin, Twitter,
  Facebook, Instagram, Youtube, Heart, ThumbsUp, PartyPopper, Lightbulb, Loader2, Send, Edit2, Trash2, X
} from 'lucide-react';

// TikTok Icon Component
const TikTokIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
  </svg>
);
import { getMemberById } from '@/data/membersData';
import { CountryFlag } from '@/components/CountryFlag';
import { useMemo, useState, useEffect, useRef, useCallback } from 'react';
import { Navigate } from 'react-router-dom';
import { Member } from '@/data/members';
import { UserAvatar } from '@/components/UserAvatar';
import { getOrganizationPosts, getPostComments, addComment, toggleReaction, deletePost, deleteComment, FeedPost, PostComment, ReactionType } from '@/data/feed';
import { formatDistanceToNow } from 'date-fns';
import { getCurrentUser } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';
import { useIsLandscape } from '@/hooks/use-mobile';
import { sanitizeText, isValidLength, isValidYouTubeUrl, isValidVimeoUrl } from '@/lib/security';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { PostContent } from '@/components/PostContent';
import { WebsitePreview } from '@/components/WebsitePreview';

export default function MemberProfile() {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const isLandscape = useIsLandscape();
  const currentUser = getCurrentUser();
  const [memberData, setMemberData] = useState<Member | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [organizationPosts, setOrganizationPosts] = useState<FeedPost[]>([]);
  const [isLoadingPosts, setIsLoadingPosts] = useState(false);
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
    const loadMember = async () => {
      if (!id) return;
      setIsLoading(true);
      try {
        const data = await getMemberById(id);
        setMemberData(data || null);
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          console.error('Error loading member:', error);
        }
      } finally {
        setIsLoading(false);
      }
    };
    loadMember();
  }, [id]);

  const loadOrganizationPosts = useCallback(async () => {
    if (!memberData?.id) return;
    setIsLoadingPosts(true);
    try {
      const posts = await getOrganizationPosts(memberData.id);
      setOrganizationPosts(posts);
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error loading organization posts:', error);
      }
    } finally {
      setIsLoadingPosts(false);
    }
  }, [memberData?.id]);

  useEffect(() => {
    if (memberData?.id) {
      loadOrganizationPosts();
    }
  }, [memberData?.id, loadOrganizationPosts]);

  const handleReaction = async (postId: string, reactionType: ReactionType) => {
    try {
      await toggleReaction(postId, reactionType);
      await loadOrganizationPosts();
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
      // Load comments if not already loaded
      const post = organizationPosts.find(p => p.id === postId);
      if (post && !(post as FeedPost & { comments?: PostComment[] }).comments) {
        try {
          const comments = await getPostComments(postId);
          const updatedPosts = organizationPosts.map(p => 
            p.id === postId ? { ...p, comments } : p
          );
          setOrganizationPosts(updatedPosts);
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
      await loadOrganizationPosts();
      
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
      await loadOrganizationPosts();
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
      await loadOrganizationPosts();
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
        // Check if it's an uploaded image
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
        // Otherwise, use WebsitePreview component
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

  if (!memberData) {
    return <Navigate to="/membership-portal/directory" replace />;
  }

  // Generate website URL from email domain
  const getWebsiteUrl = (email: string): string | null => {
    const domain = email.split('@')[1];
    if (domain) {
      // Remove common email prefixes and get domain
      const cleanDomain = domain.replace(/^(mail\.|www\.|email\.)/i, '');
      return `https://${cleanDomain}`;
    }
    return null;
  };

  const websiteUrl = getWebsiteUrl(memberData.pocEmail);

  // All members started on November 18th, 2024
  const memberSince = new Date(2024, 10, 18); // November 18, 2024 (month is 0-indexed, so 10 = November)
  const memberSinceFormatted = memberSince.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  // Mock focus areas based on organization name
  const getFocusAreas = (orgName: string): string[] => {
    const name = orgName.toLowerCase();
    const areas: string[] = [];
    
    if (name.includes('sign language') || name.includes('sign language')) areas.push('Sign Language Recognition');
    if (name.includes('avatar') || name.includes('avatar')) areas.push('Sign Language Avatars');
    if (name.includes('ai') || name.includes('ai')) areas.push('AI Technology');
    if (name.includes('translation') || name.includes('translation')) areas.push('Translation Services');
    if (name.includes('accessibility') || name.includes('accessibility')) areas.push('Accessibility');
    if (name.includes('relay') || name.includes('relay')) areas.push('Video Relay Services');
    if (name.includes('education') || name.includes('education') || name.includes('learning')) areas.push('Education');
    if (name.includes('research') || name.includes('university') || name.includes('lab')) areas.push('Research');
    
    // Default areas if none matched
    if (areas.length === 0) {
      areas.push('Sign Language Technology', 'AI Solutions', 'Accessibility');
    }
    
    return areas.slice(0, 4); // Limit to 4 areas
  };

  const focusAreas = getFocusAreas(memberData.organizationName);

  const member = {
    id: memberData.id,
    organizationName: memberData.organizationName,
    country: memberData.country,
    bio: memberData.bio || `${memberData.organizationName} is a member organization of the SLxAI cooperative, working to advance sign language x AI technologies. Our mission is to create innovative solutions that bridge communication gaps and promote accessibility for the deaf and hard of hearing community worldwide.`,
    pocName: memberData.pocName,
    pocEmail: memberData.pocEmail,
    pocTitle: memberData.pocTitle || 'Voting Representative',
    logo: memberData.logo,
    memberCount: memberData.members.filter(m => m.isRegistered !== false).length,
    members: memberData.members
      .filter(m => m.isRegistered !== false) // Only show registered members
      .map((m, idx) => ({
        id: m.id,
        name: m.name,
        title: m.title || (m.isVotingRep ? 'Voting Representative' : 'Member'),
        email: m.email,
        isVotingRep: m.isVotingRep,
        role: m.role
      })),
    websiteUrl,
    memberSince: memberSinceFormatted,
    focusAreas,
  };

  return (
    <div className="space-y-0 md:space-y-3">
      <PageTitle 
        title="Member Directory"
        rightContent={
          <Button variant="outline" asChild size="sm" className="border-gray-300 text-gray-700 dark:!text-gray-900 hover:bg-gray-50 hover:text-gray-900 dark:hover:!text-gray-900 bg-white text-xs md:text-sm px-2 md:px-3">
            <Link to="/membership-portal/directory">
              <ArrowLeft className="h-3 w-3 md:h-4 md:w-4 md:mr-1 dark:!text-gray-900" />
              <span className="hidden sm:inline dark:!text-gray-900">Back to Directory</span>
              <span className="sm:hidden dark:!text-gray-900">Back</span>
            </Link>
          </Button>
        }
      />

      {/* Organization Header */}
      <Card className="glass-card floating-hover">
        <CardHeader className="pb-3">
          <div className="flex items-start gap-4">
            {member.logo ? (
              <img
                src={member.logo}
                alt={member.organizationName}
                className="h-9 w-auto rounded-lg object-cover border-2 border-electric-blue/20"
              />
            ) : (
              <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-electric-blue/20 to-blue-100 flex items-center justify-center border-2 border-electric-blue/20">
                <Building2 className="h-5 w-5 text-electric-blue" />
              </div>
            )}
            <div className="flex-1">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-2xl mb-1">{member.organizationName}</CardTitle>
                  <CardDescription className="text-base">
                  </CardDescription>
                </div>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-3">
          <div className="space-y-3">
            {/* Contact Information */}
            <div className="pt-3 border-t border-gray-200">
              <div className="flex items-start gap-6">
                <div>
                  <p className="text-xs font-semibold text-gray-500 dark:text-white uppercase mb-2">Location</p>
                  <div className="flex items-center gap-2">
                    <CountryFlag country={member.country} size="md" />
                    <span className="text-sm text-gray-900 dark:text-white">{member.country}</span>
                  </div>
                </div>
                {member.websiteUrl && (
                  <div>
                    <p className="text-xs font-semibold text-gray-500 dark:text-white uppercase mb-2">Website</p>
                    <a 
                      href={member.websiteUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sm text-electric-blue hover:underline flex items-center gap-1"
                    >
                      <Globe className="h-3 w-3" />
                      {member.websiteUrl.replace(/^https?:\/\//, '')}
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                )}
                <div>
                  <p className="text-xs font-semibold text-gray-500 dark:text-white uppercase mb-2">Member since</p>
                  <p className="text-sm text-gray-900 dark:text-white">{member.memberSince}</p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1.5 flex items-center gap-2 text-sm">
                <Building2 className="h-3.5 w-3.5 text-electric-blue" />
                About
              </h3>
              <p className="text-gray-700 dark:text-white leading-relaxed text-sm">{member.bio}</p>
            </div>

            {/* Social Media */}
            {memberData.socialMedia && Object.keys(memberData.socialMedia).length > 0 && (
              <div className="pt-3 border-t border-gray-200">
                <p className="text-xs font-semibold text-gray-500 dark:text-white uppercase mb-3">Social Media</p>
                <div className="flex flex-wrap gap-3">
                  {memberData.socialMedia.facebook && (
                    <a
                      href={memberData.socialMedia.facebook}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700 hover:underline"
                    >
                      <Facebook className="h-4 w-4" />
                      Facebook
                    </a>
                  )}
                  {memberData.socialMedia.x && (
                    <a
                      href={memberData.socialMedia.x}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-sm text-blue-400 hover:text-blue-500 hover:underline"
                    >
                      <Twitter className="h-4 w-4" />
                      X
                    </a>
                  )}
                  {memberData.socialMedia.linkedin && (
                    <a
                      href={memberData.socialMedia.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-sm text-blue-700 hover:text-blue-800 hover:underline"
                    >
                      <Linkedin className="h-4 w-4" />
                      LinkedIn
                    </a>
                  )}
                  {memberData.socialMedia.instagram && (
                    <a
                      href={memberData.socialMedia.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-sm text-pink-600 hover:text-pink-700 hover:underline"
                    >
                      <Instagram className="h-4 w-4" />
                      Instagram
                    </a>
                  )}
                  {memberData.socialMedia.youtube && (
                    <a
                      href={memberData.socialMedia.youtube}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-sm text-red-600 hover:text-red-700 hover:underline"
                    >
                      <Youtube className="h-4 w-4" />
                      YouTube
                    </a>
                  )}
                  {memberData.socialMedia.tiktok && (
                    <a
                      href={memberData.socialMedia.tiktok}
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



      {/* Organization Members */}
      <Card className="glass-card floating-hover">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-electric-blue" />
            Organization Members ({member.members.length})
          </CardTitle>
          <CardDescription>
            All members associated with this organization
          </CardDescription>
        </CardHeader>
          <CardContent>
          <div className={`grid ${isLandscape ? 'grid-cols-3' : 'grid-cols-1'} md:grid-cols-2 lg:grid-cols-3 gap-2 md:gap-4`}>
            {member.members.map((person) => (
              <div
                key={person.id}
                className="flex items-start gap-2 md:gap-4 p-2 md:p-4 border border-electric-blue/20 rounded-lg bg-electric-blue/5 backdrop-blur-sm hover:bg-electric-blue/10 transition-all"
              >
                <Link
                  to={`/membership-portal/member/${encodeURIComponent(person.email)}`}
                  className="flex items-start gap-2 md:gap-4 flex-1 min-w-0 cursor-pointer"
                >
                  <div className="flex flex-col items-center gap-1 md:gap-2 flex-shrink-0">
                    <UserAvatar
                      email={person.email}
                      name={person.name}
                      size="2xl"
                      className="md:!h-16 md:!w-16 !h-12 !w-12"
                    />
                    <div className="flex flex-col items-center gap-0.5 md:gap-1">
                      {person.isVotingRep && (
                        <Badge variant="secondary" className="bg-electric-blue/20 text-electric-blue border-electric-blue/30 text-xs px-1.5 py-0.5">
                          Voting
                        </Badge>
                      )}
                      {person.role && person.role !== 'member' && (
                        <Badge 
                          variant="secondary" 
                          className={`text-xs px-1.5 py-0.5 ${
                            person.role === 'super_admin' || person.role === 'admin' ? 'bg-blue-100 text-blue-700 border-blue-300' :
                            person.role === 'voting_member' ? 'bg-green-100 text-green-700 border-green-300' : ''
                          }`}
                        >
                          {person.role === 'super_admin' || person.role === 'admin' ? (
                            'Admin'
                          ) : (
                            'Voting Member'
                          )}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0 space-y-0.5 md:space-y-1">
                    <h4 className="font-medium text-xs md:text-sm text-gray-900 dark:text-white">{person.name}</h4>
                    {person.title && (
                      <p className="text-xs md:text-sm text-gray-600 dark:text-white">{person.title}</p>
                    )}
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        window.location.href = `mailto:${person.email}`;
                      }}
                      className="text-xs md:text-sm text-electric-blue hover:underline flex items-center gap-1 md:gap-1.5 mt-1"
                    >
                      <Mail className="h-3 w-3 md:h-4 md:w-4" />
                      <span className="truncate">{person.email}</span>
                    </button>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Organization Feed */}
      <Card className="glass-card floating-hover">
        <CardHeader className="p-4 md:p-6">
          <CardTitle className="flex items-center gap-2 text-lg">
            <MessageSquare className="h-5 w-5 text-electric-blue" />
            Organization Feed
          </CardTitle>
          <CardDescription>
            Posts and updates from this organization
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0 md:p-6">
          {isLoadingPosts ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-electric-blue" />
            </div>
          ) : organizationPosts.length === 0 ? (
            <div className="py-12 text-center">
              <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-600">No posts yet.</p>
            </div>
          ) : (
            <div className="w-full md:max-w-2xl md:mx-auto space-y-1 md:space-y-4">
              {organizationPosts.map((post) => {
                const postWithComments = post as FeedPost & { comments?: PostComment[] };
                const comments = expandedComments.has(post.id) ? (postWithComments.comments || []) : [];
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

