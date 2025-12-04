import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PageTitle } from '@/components/PageTitle';
import { useIsMobile, useIsLandscape } from '@/hooks/use-mobile';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { 
  User, Mail, LogOut, Shield, Building2, Save, X, FileText, Upload, Camera,
  Facebook, Twitter, Linkedin, Instagram, Youtube, Send, Video, Link as LinkIcon, Loader2, Paperclip
} from 'lucide-react';

// TikTok Icon Component
const TikTokIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
  </svg>
);

import { SocialMedia } from '@/data/members';
import { useToast } from '@/hooks/use-toast';
import { logout, getCurrentUser, getUserRole, refreshUserSession } from '@/lib/auth';
import { UserRole } from '@/lib/roles';
import { getMemberById, updateMember } from '@/data/membersData';
import { Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { sanitizeText, isValidLength, isValidUrl, isValidYouTubeUrl, isValidVimeoUrl } from '@/lib/security';
import { createPost, PostType, getUserPosts, getPostComments, addComment, toggleReaction, deletePost, deleteComment, updatePost, FeedPost, PostComment, ReactionType } from '@/data/feed';
import { getURLPreviews, getURLPreviewsAsync, URLPreview } from '@/lib/urlPreview';
import { MessageSquare, Heart, ThumbsUp, PartyPopper, Lightbulb, Trash2, Edit2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { UserAvatar } from '@/components/UserAvatar';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { PostContent } from '@/components/PostContent';
import { WebsitePreview } from '@/components/WebsitePreview';

export default function MyProfile() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const isLandscape = useIsLandscape();
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [userInfo, setUserInfo] = useState<{
    name: string;
    email: string;
    role: UserRole;
    organizationName: string;
    isVotingRep: boolean;
    title?: string;
    bio?: string;
    profilePicture?: string;
    personId?: string;
    organizationId?: string;
    socialMedia?: SocialMedia;
  } | null>(null);
  const [profilePicturePreview, setProfilePicturePreview] = useState<string | null>(null);
  const [isUploadingPicture, setIsUploadingPicture] = useState(false);
  const profilePictureInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState<{
    name: string;
    title: string;
    bio: string;
    socialMedia: SocialMedia;
  }>({
    name: '',
    title: '',
    bio: '',
    socialMedia: {},
  });
  const [postContent, setPostContent] = useState('');
  const [postImage, setPostImage] = useState<File | null>(null);
  const [postImagePreview, setPostImagePreview] = useState<string | null>(null);
  const [urlPreviews, setUrlPreviews] = useState<URLPreview[]>([]);
  const [isPosting, setIsPosting] = useState(false);
  const [userPosts, setUserPosts] = useState<FeedPost[]>([]);
  const [isLoadingPosts, setIsLoadingPosts] = useState(false);
  const [expandedComments, setExpandedComments] = useState<Set<string>>(new Set());
  const [commentInputs, setCommentInputs] = useState<{ [postId: string]: string }>({});
  const [postToDelete, setPostToDelete] = useState<string | null>(null);
  const [commentToDelete, setCommentToDelete] = useState<string | null>(null);
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState<string>('');
  const [editMediaUrl, setEditMediaUrl] = useState<string | null>(null);
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const commentsEndRefs = useRef<{ [postId: string]: HTMLDivElement | null }>({});

  const REACTION_ICONS: Record<ReactionType, typeof Heart> = {
    like: ThumbsUp,
    love: Heart,
    celebrate: PartyPopper,
    insightful: Lightbulb,
  };

  // Load current user's personal information
  useEffect(() => {
    const loadUserInfo = async () => {
      setIsLoading(true);
      try {
        // Refresh user session to get latest role
        await refreshUserSession();
        
        const currentUser = getCurrentUser();
        if (!currentUser) {
          toast({
            title: "Not authenticated",
            description: "Please log in to view your profile.",
            variant: "destructive",
          });
          setIsLoading(false);
          return;
        }

        // Get organization name if linked
        let organizationName = 'Not linked';
        if (currentUser.organizationId) {
          try {
            const memberData = await getMemberById(currentUser.organizationId);
            if (memberData) {
              organizationName = memberData.organizationName;
              
              // Find current user in members list to get voting rep status and title
              const userMember = memberData.members.find(
                m => m.email.toLowerCase() === currentUser.email.toLowerCase()
              );
              
              // Get bio, profile picture, and social media from auth.users metadata
              const { data: { user: authUser } } = await supabase.auth.getUser();
              const bio = authUser?.user_metadata?.bio || '';
              const profilePicture = authUser?.user_metadata?.profile_picture || '';
              const authSocialMedia = authUser?.user_metadata?.social_media || {};
              
              // Prioritize social media from members table (if exists), otherwise use auth metadata
              const socialMedia = userMember?.socialMedia && Object.keys(userMember.socialMedia).length > 0 
                ? userMember.socialMedia 
                : authSocialMedia;
              
              setUserInfo({
                name: currentUser.name,
                email: currentUser.email,
                role: getUserRole(),
                organizationName: organizationName,
                isVotingRep: userMember?.isVotingRep || false,
                title: userMember?.title || '',
                bio: bio,
                profilePicture: profilePicture,
                socialMedia: socialMedia,
                personId: userMember?.id,
                organizationId: currentUser.organizationId,
              });
              
              if (profilePicture) {
                setProfilePicturePreview(profilePicture);
              }
              
              // Set form data for editing
              setFormData({
                name: currentUser.name,
                title: userMember?.title || '',
                bio: bio,
                socialMedia: socialMedia,
              });
            } else {
              const { data: { user: authUser } } = await supabase.auth.getUser();
              const bio = authUser?.user_metadata?.bio || '';
              const profilePicture = authUser?.user_metadata?.profile_picture || '';
              setUserInfo({
                name: currentUser.name,
                email: currentUser.email,
                role: getUserRole(),
                organizationName: organizationName,
                isVotingRep: false,
                title: '',
                bio: bio,
                profilePicture: profilePicture,
                organizationId: currentUser.organizationId,
              });
              if (profilePicture) {
                setProfilePicturePreview(profilePicture);
              }
              const socialMedia = authUser?.user_metadata?.social_media || {};
              setFormData({
                name: currentUser.name,
                title: '',
                bio: bio,
                socialMedia: socialMedia,
              });
            }
          } catch (error) {
            if (process.env.NODE_ENV === 'development') {
              console.error('Error loading organization:', error);
            }
            const { data: { user: authUser } } = await supabase.auth.getUser();
            const bio = authUser?.user_metadata?.bio || '';
            const profilePicture = authUser?.user_metadata?.profile_picture || '';
            setUserInfo({
              name: currentUser.name,
              email: currentUser.email,
              role: getUserRole(),
              organizationName: organizationName,
              isVotingRep: false,
              title: '',
              bio: bio,
              profilePicture: profilePicture,
              organizationId: currentUser.organizationId,
            });
            if (profilePicture) {
              setProfilePicturePreview(profilePicture);
            }
            const socialMedia = authUser?.user_metadata?.social_media || {};
            setFormData({
              name: currentUser.name,
              title: '',
              bio: bio,
              socialMedia: socialMedia,
            });
          }
        } else {
          const { data: { user: authUser } } = await supabase.auth.getUser();
          const bio = authUser?.user_metadata?.bio || '';
          const profilePicture = authUser?.user_metadata?.profile_picture || '';
          setUserInfo({
            name: currentUser.name,
            email: currentUser.email,
            role: getUserRole(),
            organizationName: organizationName,
            isVotingRep: false,
            title: '',
            bio: bio,
            profilePicture: profilePicture,
            organizationId: undefined,
          });
          if (profilePicture) {
            setProfilePicturePreview(profilePicture);
          }
          const socialMedia = authUser?.user_metadata?.social_media || {};
          setFormData({
            name: currentUser.name,
            title: '',
            bio: bio,
            socialMedia: socialMedia,
          });
        }
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          console.error('Error loading user info:', error);
        }
        toast({
          title: "Error",
          description: "Failed to load your profile. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadUserInfo();
  }, [toast]);

  const handleLogout = async () => {
    await logout();
    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
    });
    navigate('/login');
  };

  // Handle image upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file.",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Image must be less than 10MB.",
        variant: "destructive",
      });
      return;
    }

    setPostImage(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setPostImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Remove image
  const handleRemoveImage = () => {
    setPostImage(null);
    setPostImagePreview(null);
    const input = document.getElementById('post-image-upload') as HTMLInputElement;
    if (input) input.value = '';
  };

  // Detect URLs in content and update previews
  useEffect(() => {
    if (postContent) {
      const previews = getURLPreviews(postContent);
      // Set initial previews (with loading state for websites)
      setUrlPreviews(previews.map(p => p.type === 'website' ? { ...p, isLoading: true } : p));
      
      // Fetch metadata for website URLs
      const fetchMetadata = async () => {
        const updatedPreviews = await getURLPreviewsAsync(postContent);
        setUrlPreviews(updatedPreviews);
      };
      
      fetchMetadata();
    } else {
      setUrlPreviews([]);
    }
  }, [postContent]);

  // Remove URL preview
  const handleRemoveURLPreview = (url: string) => {
    setUrlPreviews(prev => prev.filter(p => p.url !== url));
    // Remove URL from content
    setPostContent(prev => prev.replace(url, '').trim());
  };

  const handleCreatePost = async () => {
    // Force refresh user session to get latest metadata from Supabase
    await refreshUserSession();
    
    // Verify user's organization matches
    const currentUser = getCurrentUser();
    if (!currentUser || !currentUser.organizationId) {
      toast({
        title: "Error",
        description: "Your account is not linked to an organization. Please contact support.",
        variant: "destructive",
      });
      return;
    }

    if (!isValidLength(postContent, 1, 2000)) {
      toast({
        title: "Invalid content",
        description: "Post content must be between 1 and 2000 characters.",
        variant: "destructive",
      });
      return;
    }

    setIsPosting(true);
    try {
      let imageUrl: string | undefined;
      
      // Upload image if present
      if (postImage) {
        const fileExt = postImage.name.split('.').pop();
        const fileName = `${currentUser.id}-${Date.now()}.${fileExt}`;
        const filePath = fileName;

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('post-images')
          .upload(filePath, postImage, {
            cacheControl: '3600',
            upsert: false,
          });

        if (uploadError) {
          throw new Error(`Failed to upload image: ${uploadError.message}`);
        }

        const { data: { publicUrl } } = supabase.storage
          .from('post-images')
          .getPublicUrl(filePath);
        
        imageUrl = publicUrl;
      }

      // Determine post type based on content
      let postType: PostType = 'text';
      let mediaUrl: string | undefined;
      
      if (imageUrl) {
        postType = 'link'; // Use link type for image posts
        mediaUrl = imageUrl;
      } else if (urlPreviews.length > 0) {
        const firstPreview = urlPreviews[0];
        if (firstPreview.type === 'youtube' || firstPreview.type === 'vimeo') {
          postType = 'video';
          mediaUrl = firstPreview.url;
        } else if (firstPreview.type === 'pdf' || firstPreview.type === 'document') {
          postType = 'document';
          mediaUrl = firstPreview.url;
        } else {
          postType = 'link';
          mediaUrl = firstPreview.url;
        }
      }

      await createPost({
        organizationId: currentUser.organizationId,
        content: sanitizeText(postContent),
        postType: postType,
        mediaUrl: mediaUrl,
        mediaTitle: undefined,
        mediaDescription: undefined,
        postSource: 'profile',
      });

      toast({
        title: "Post created",
        description: "Your post has been shared to the feed.",
      });

      // Reset form
      setPostContent('');
      setPostImage(null);
      setPostImagePreview(null);
      setUrlPreviews([]);
      const input = document.getElementById('post-image-upload') as HTMLInputElement;
      if (input) input.value = '';
      
      await loadUserPosts(); // Reload posts after creating
    } catch (error: any) {
      const errorMessage = error?.message || error?.error?.message || 'Failed to create post. Please try again.';
      if (process.env.NODE_ENV === 'development') {
        console.error('Error creating post:', error);
      }
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsPosting(false);
    }
  };

  // Load user's posts
  const loadUserPosts = useCallback(async () => {
    const currentUser = getCurrentUser();
    if (!currentUser?.id) return;
    
    setIsLoadingPosts(true);
    try {
      const posts = await getUserPosts(currentUser.id);
      setUserPosts(posts);
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error loading user posts:', error);
      }
    } finally {
      setIsLoadingPosts(false);
    }
  }, []);

  // Load posts when user info is loaded
  useEffect(() => {
    if (userInfo) {
      loadUserPosts();
    }
  }, [userInfo, loadUserPosts]);

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

  // Decode HTML entities for editing
  const decodeHtmlEntities = (text: string): string => {
    if (typeof document === 'undefined') {
      return text
        .replace(/&#x2F;/g, '/')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&#x27;/g, "'");
    }
    // SECURITY: Use textContent instead of innerHTML to prevent XSS
    const textarea = document.createElement('textarea');
    textarea.textContent = text;
    return textarea.value;
  };

  const handleEditPost = (post: FeedPost) => {
    setEditingPostId(post.id);
    // Decode HTML entities so URLs are clean when editing
    setEditContent(decodeHtmlEntities(post.content));
    setEditMediaUrl(post.mediaUrl || null);
  };

  const handleCancelEdit = () => {
    setEditingPostId(null);
    setEditContent('');
    setEditMediaUrl(null);
  };

  const handleRemoveMedia = () => {
    setEditMediaUrl(null);
  };

  const handleSaveEdit = async () => {
    if (!editingPostId) return;
    
    if (!isValidLength(editContent, 1, 2000)) {
      toast({
        title: "Invalid content",
        description: "Post content must be between 1 and 2000 characters.",
        variant: "destructive",
      });
      return;
    }

    setIsSavingEdit(true);
    try {
      await updatePost(editingPostId, {
        content: sanitizeText(editContent),
        mediaUrl: editMediaUrl,
      });
      
      setEditingPostId(null);
      setEditContent('');
      setEditMediaUrl(null);
      await loadUserPosts();
      
      toast({
        title: "Post updated",
        description: "Your post has been updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update post. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSavingEdit(false);
    }
  };

  const toggleComments = async (postId: string) => {
    const newExpanded = new Set(expandedComments);
    if (newExpanded.has(postId)) {
      newExpanded.delete(postId);
    } else {
      newExpanded.add(postId);
      const post = userPosts.find(p => p.id === postId);
      if (post && !(post as any).comments) {
        try {
          const comments = await getPostComments(postId);
          const updatedPosts = userPosts.map(p => {
            if (p.id === postId) {
              return { ...p, comments } as FeedPost & { comments: PostComment[] };
            }
            return p;
          });
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
            {post.mediaDescription && (
              <p className="text-xs text-gray-500 mt-2">{post.mediaDescription}</p>
            )}
          </div>
        );

      case 'link':
        // Check if it's an image URL (has image extension or is from post-images bucket)
        const isImageUrl = post.mediaUrl?.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i) || 
                          post.mediaUrl?.includes('/post-images/') ||
                          post.mediaUrl?.includes('storage.googleapis.com') && post.mediaUrl?.match(/\.(jpg|jpeg|png|gif|webp|svg)/i);
        if (isImageUrl) {
          // Display uploaded image
          return (
            <div className="mt-3 rounded-lg overflow-hidden">
              <img
                src={post.mediaUrl}
                alt={post.mediaTitle || 'Post image'}
                className="w-full max-h-96 object-contain rounded-lg"
              />
            </div>
          );
        } else {
          // Display website preview
          return <WebsitePreview url={post.mediaUrl!} />;
        }

      default:
        return null;
    }
  };

  const handleSave = async () => {
    if (!userInfo) return;

    // Validate required fields
    if (!formData.name || !formData.name.trim()) {
      toast({
        title: "Validation error",
        description: "Name is required.",
        variant: "destructive",
      });
      return;
    }

    if (!formData.title || !formData.title.trim()) {
      toast({
        title: "Validation error",
        description: "Title is required.",
        variant: "destructive",
      });
      return;
    }

    if (!userInfo.email || !userInfo.email.trim()) {
      toast({
        title: "Validation error",
        description: "Email is required.",
        variant: "destructive",
      });
      return;
    }

    if (!userInfo.organizationId || userInfo.organizationName === 'Not linked') {
      toast({
        title: "Validation error",
        description: "Organization Name is required. Please link your account to an organization.",
        variant: "destructive",
      });
      return;
    }

    // Validate bio length
    if (formData.bio && !isValidLength(formData.bio, 0, 1000)) {
      toast({
        title: "Validation error",
        description: "Bio must be 1000 characters or less.",
        variant: "destructive",
      });
      return;
    }

    // Validate title length
    if (formData.title && !isValidLength(formData.title, 0, 200)) {
      toast({
        title: "Validation error",
        description: "Title must be 200 characters or less.",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      // Update bio and social media in auth.users metadata
      const { error: authError } = await supabase.auth.updateUser({
        data: {
          bio: sanitizeText(formData.bio || ''),
          name: sanitizeText(formData.name),
          social_media: formData.socialMedia,
        },
      });

      if (authError) throw authError;

      // Update title and social media in member_persons table if user is linked to an organization
      if (userInfo.organizationId && userInfo.personId) {
        const memberData = await getMemberById(userInfo.organizationId);
        if (memberData) {
          const updatedMembers = memberData.members.map(m => 
            m.id === userInfo.personId 
              ? { 
                  ...m, 
                  name: sanitizeText(formData.name), 
                  title: sanitizeText(formData.title || ''),
                  socialMedia: formData.socialMedia || {}
                }
              : m
          );
          
          const currentUser = getCurrentUser();
          if (currentUser) {
            await updateMember(userInfo.organizationId, {
              members: updatedMembers,
            }, currentUser);
          }
        }
      }

      // Refresh user session to get updated data (including profile picture)
      await refreshUserSession();
      
      // Reload user info
      const currentUser = getCurrentUser();
      if (currentUser?.organizationId) {
        const memberData = await getMemberById(currentUser.organizationId);
        if (memberData) {
          const userMember = memberData.members.find(
            m => m.email.toLowerCase() === currentUser.email.toLowerCase()
          );
          const { data: { user: authUser } } = await supabase.auth.getUser();
          const bio = authUser?.user_metadata?.bio || '';
          const profilePicture = authUser?.user_metadata?.profile_picture || '';
          const authSocialMedia = authUser?.user_metadata?.social_media || {};
          
          // Prioritize social media from members table (if exists), otherwise use auth metadata
          const socialMedia = userMember?.socialMedia && Object.keys(userMember.socialMedia).length > 0 
            ? userMember.socialMedia 
            : authSocialMedia;
          
          setUserInfo({
            name: formData.name,
            email: currentUser.email,
            role: getUserRole(),
            organizationName: memberData.organizationName,
            isVotingRep: userMember?.isVotingRep || false,
            title: formData.title,
            bio: bio,
            profilePicture: profilePicture,
            socialMedia: socialMedia,
            personId: userMember?.id,
            organizationId: currentUser.organizationId,
          });
          
          setFormData(prev => ({ ...prev, socialMedia: socialMedia }));
          
          if (profilePicture) {
            setProfilePicturePreview(profilePicture);
          }
        }
      }

      toast({
        title: "Profile updated",
        description: "Your profile has been saved successfully.",
      });
      setIsEditing(false);
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error saving profile:', error);
      }
      toast({
        title: "Error",
        description: "Failed to save profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    // Reset form data to original values
    if (userInfo) {
      setFormData({
        name: userInfo.name,
        title: userInfo.title || '',
        bio: userInfo.bio || '',
        socialMedia: userInfo.socialMedia || {},
      });
      setProfilePicturePreview(userInfo.profilePicture || null);
    }
    setIsEditing(false);
  };

  const handleProfilePictureChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file.",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Profile picture must be less than 5MB.",
        variant: "destructive",
      });
      return;
    }

    setIsUploadingPicture(true);
    try {
      const currentUser = getCurrentUser();
      if (!currentUser) throw new Error('Not authenticated');

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePicturePreview(reader.result as string);
      };
      reader.readAsDataURL(file);

      // Upload to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${currentUser.id}-${Date.now()}.${fileExt}`;
      const filePath = `profile-pictures/${fileName}`;

      // First, check if we can list the bucket (to verify it exists and is accessible)
      const { data: listData, error: listError } = await supabase.storage
        .from('avatars')
        .list('profile-pictures', {
          limit: 1,
        });


      // Upload to avatars bucket
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        });


      if (uploadError) {
        // Provide detailed error message
        if (process.env.NODE_ENV === 'development') {
          console.error('Upload error details:', {
            message: uploadError.message,
            error: uploadError,
          });
        }

        if (uploadError.message?.includes('row-level security') || 
            uploadError.message?.includes('policy') ||
            uploadError.message?.includes('RLS') ||
            uploadError.message?.includes('403')) {
          throw new Error(
            `Storage bucket RLS policy issue. The "avatars" bucket exists but you don't have permission to upload. ` +
            `Please ensure the bucket is set to "Public" in Supabase Storage settings, or ask an administrator to set up RLS policies. ` +
            `Error: ${uploadError.message}`
          );
        }
        
        if (uploadError.message?.includes('Bucket not found') || uploadError.message?.includes('404')) {
          throw new Error(
            'The "avatars" bucket was not found. Please create it in Supabase Storage (Storage > New Bucket > Name: avatars > Public: ON).'
          );
        }

        throw new Error(`Upload failed: ${uploadError.message || 'Unknown error'}`);
      }

      if (!uploadData) {
        throw new Error('Upload succeeded but no data returned');
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);


      if (!publicUrl) {
        throw new Error('Could not get public URL for uploaded file');
      }

      // Update user metadata with profile picture URL
      const { error: updateError } = await supabase.auth.updateUser({
        data: {
          profile_picture: publicUrl,
        },
      });

      if (updateError) {
        if (process.env.NODE_ENV === 'development') {
          console.error('Error updating user metadata:', updateError);
        }
        throw new Error(`Failed to save profile picture URL: ${updateError.message}`);
      }

      // Refresh user session to update currentUser state
      await refreshUserSession();
      
      // Update local state
      const updatedCurrentUser = getCurrentUser();
      if (userInfo) {
        setUserInfo({
          ...userInfo,
          profilePicture: publicUrl,
        });
      }
      
      // Update preview
      setProfilePicturePreview(publicUrl);

      toast({
        title: "Profile picture updated",
        description: "Your profile picture has been saved successfully. It will appear everywhere after refresh.",
      });
      
      // Refresh the page after a short delay to show updated picture everywhere
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error uploading profile picture:', error);
      }
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Failed to upload profile picture. Please try again.",
        variant: "destructive",
      });
      setProfilePicturePreview(userInfo?.profilePicture || null);
    } finally {
      setIsUploadingPicture(false);
      if (profilePictureInputRef.current) {
        profilePictureInputRef.current.value = '';
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-electric-blue mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (!userInfo) {
    return (
      <div className="space-y-4">
        <Card className="glass-card floating-hover">
          <CardContent className="pt-6">
            <p className="text-center text-gray-600">
              Unable to load your profile. Please try again.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getRoleDisplay = (role: UserRole) => {
    switch (role) {
      case 'super_admin':
        return { label: 'Admin', icon: Shield, color: 'text-blue-600' };
      case 'admin':
        return { label: 'Admin', icon: Shield, color: 'text-blue-600' };
      case 'voting_member':
        return { label: 'Voting Member', icon: User, color: 'text-green-600' };
      default:
        return { label: 'Member', icon: User, color: 'text-gray-600' };
    }
  };

  const roleDisplay = getRoleDisplay(userInfo.role);

  return (
    <div className="space-y-0 md:space-y-4">
      <PageTitle 
        title="My Profile"
        fullWidthLandscape={true}
        leftContent={
          !isEditing ? (
            !isMobile ? (
              <Button 
                onClick={() => setIsEditing(true)}
                className="bg-electric-blue hover:bg-electric-blue/90 text-xs md:text-sm"
              >
                <User className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
                <span className="hidden sm:inline">Edit Profile</span>
                <span className="sm:hidden">Edit</span>
              </Button>
            ) : null
          ) : (
            <Button 
              variant="outline" 
              onClick={handleCancel}
              className="border-gray-300 text-gray-700 dark:!text-gray-900 hover:bg-gray-50 dark:hover:!text-gray-900 text-xs md:text-sm h-7 md:h-9 px-2 md:px-3"
            >
              <X className="h-3 w-3 md:h-4 md:w-4 dark:!text-gray-900" />
              <span className="hidden md:inline ml-1 md:ml-2 dark:!text-gray-900">Cancel</span>
            </Button>
          )
        }
        rightContent={
          !isEditing ? (
            isMobile ? (
              <Button 
                onClick={() => setIsEditing(true)}
                className="bg-electric-blue hover:bg-electric-blue/90 text-xs md:text-sm"
              >
                <User className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
                <span className="hidden sm:inline">Edit Profile</span>
                <span className="sm:hidden">Edit</span>
              </Button>
            ) : (
              <Button 
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white text-xs md:text-sm"
              >
                <LogOut className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
                <span className="hidden sm:inline">Log Out</span>
                <span className="sm:hidden">Logout</span>
              </Button>
            )
          ) : (
            <Button 
              onClick={handleSave}
              className="bg-electric-blue hover:bg-electric-blue/90 text-xs md:text-sm"
              disabled={isSaving}
            >
              <Save className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
              {isSaving ? 'Saving...' : <span className="hidden sm:inline">Save Changes</span>}
              {!isSaving && <span className="sm:hidden">Save</span>}
            </Button>
          )
        }
      />

      <div className="w-full max-w-2xl space-y-4 md:mx-auto">
      {/* Personal Information - Single Merged Card */}
      <Card className="glass-card floating-hover">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <User className="h-4 w-4 text-electric-blue" />
            Personal Information
          </CardTitle>
          <CardDescription className="text-sm">
            Your account and personal details
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          {/* Profile Picture Section */}
          <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-200">
            <div className="relative">
              {profilePicturePreview ? (
                <img
                  src={profilePicturePreview}
                  alt="Profile"
                  className="h-[100px] w-[100px] md:h-20 md:w-20 rounded-full object-cover border-2 border-electric-blue/20"
                />
              ) : (
                <div className="h-[100px] w-[100px] md:h-20 md:w-20 rounded-full bg-electric-blue/20 flex items-center justify-center border-2 border-electric-blue/20">
                  <User className="h-12 w-12 md:h-10 md:w-10 text-electric-blue" />
                </div>
              )}
              {isEditing && (
                <button
                  onClick={() => profilePictureInputRef.current?.click()}
                  disabled={isUploadingPicture}
                  className="absolute bottom-0 right-0 h-7 w-7 rounded-full bg-electric-blue text-white flex items-center justify-center shadow-lg hover:bg-electric-blue/90 transition-colors"
                  title="Change profile picture"
                >
                  {isUploadingPicture ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <Camera className="h-4 w-4" />
                  )}
                </button>
              )}
            </div>
            <div className="flex-1">
              <Label htmlFor="profile-picture-upload" className="text-sm font-medium text-gray-700">Profile Picture</Label>
              {isEditing ? (
                <p className="text-xs text-gray-500 mt-1">
                  Click the camera icon to upload a new picture
                </p>
              ) : (
                <p className="text-xs text-gray-500 mt-1">
                  {userInfo.profilePicture ? 'Profile picture set' : 'No profile picture'}
                </p>
              )}
            </div>
            <input
              id="profile-picture-upload"
              name="profile-picture-upload"
              ref={profilePictureInputRef}
              type="file"
              accept="image/*"
              onChange={handleProfilePictureChange}
              className="hidden"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Name & Email */}
            <div className="space-y-3">
              <div className="space-y-1.5">
                {isEditing ? (
                  <>
                    <Label htmlFor="profile-name" className="text-sm text-gray-600">
                      Name <span className="text-red-600">*</span>
                    </Label>
                    <Input
                      id="profile-name"
                      name="profile-name"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Your name"
                      className="text-sm"
                      required
                    />
                  </>
                ) : (
                  <>
                    <p className="text-sm text-gray-600 dark:text-white font-medium">
                      Name <span className="text-red-600">*</span>
                    </p>
                    <p className="text-gray-900 dark:text-white font-medium text-sm">{userInfo.name}</p>
                  </>
                )}
              </div>

              <div className="space-y-1.5">
                <p className="text-sm text-gray-600 dark:text-white font-medium">
                  Email <span className="text-red-600">*</span>
                </p>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-gray-400 dark:text-white" />
                  <p className="text-gray-900 dark:text-white text-sm">{userInfo.email}</p>
                </div>
                <p className="text-xs text-gray-500 dark:text-white">Email cannot be changed</p>
              </div>
            </div>

            {/* Title & Role */}
            <div className="space-y-3">
              <div className="space-y-1.5">
                {isEditing ? (
                  <>
                    <Label htmlFor="profile-title" className="text-sm text-gray-600">
                      Title <span className="text-red-600">*</span>
                    </Label>
                    <div>
                      <Input
                        id="profile-title"
                        name="profile-title"
                        value={formData.title}
                        onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="Your job title"
                        className="text-sm"
                        required
                      />
                      <div className="text-xs text-gray-500 mt-1 text-right">
                        {formData.title.length}/200 characters
                        {formData.title.length > 200 && (
                          <span className="text-red-600 ml-1">(exceeds limit)</span>
                        )}
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <p className="text-sm text-gray-600 dark:text-white font-medium">
                      Title <span className="text-red-600">*</span>
                    </p>
                    <p className="text-gray-900 dark:text-white text-sm">{userInfo.title || 'No title set'}</p>
                  </>
                )}
              </div>

              <div className="space-y-1.5">
                <p className="text-sm text-gray-600 dark:text-white font-medium">Role</p>
                <div className={`${roleDisplay.color}`}>
                  <p className="font-medium text-sm dark:text-white">{roleDisplay.label}</p>
                </div>
                <p className="text-xs text-gray-500 dark:text-white">Role is managed by administrators</p>
              </div>
            </div>

            {/* Organization & Status */}
            <div className="space-y-3">
              <div className="space-y-1.5">
                <p className="text-sm text-gray-600 dark:text-white font-medium">
                  Organization Name <span className="text-red-600">*</span>
                </p>
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-gray-400 dark:text-white" />
                  <p className="text-gray-900 dark:text-white font-medium text-sm">{userInfo.organizationName}</p>
                </div>
                {userInfo.organizationName === 'Not linked' && (
                  <p className="text-xs text-red-600 dark:text-red-400">Organization is required. Please contact support to link your account.</p>
                )}
              </div>

              {userInfo.isVotingRep && (
                <div className="space-y-1.5">
                  <p className="text-sm text-gray-600 dark:text-white font-medium">Status</p>
                  <div className="flex items-center gap-2 text-electric-blue dark:text-electric-blue">
                    <User className="h-4 w-4" />
                    <p className="text-sm font-medium dark:text-white">Voting Representative</p>
                  </div>
                </div>
              )}

              <div className="pt-1">
                <Link to="/membership-portal/organization">
                  <Button variant="outline" size="sm" className="w-full">
                    <Building2 className="h-3 w-3 mr-2" />
                    View Organization
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          {/* Bio Section - Full Width */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="space-y-1.5">
              {isEditing ? (
                <>
                  <Label htmlFor="profile-bio" className="text-sm text-gray-600 flex items-center gap-2">
                    <FileText className="h-4 w-4 text-electric-blue" />
                    Bio
                  </Label>
                  <div>
                    <Textarea
                      id="profile-bio"
                      name="profile-bio"
                      value={formData.bio}
                      onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                      placeholder="Write a brief bio about yourself..."
                      rows={3}
                      className="text-sm"
                    />
                    <div className="text-xs text-gray-500 mt-1 text-right">
                      {formData.bio.length}/1000 characters
                      {formData.bio.length > 1000 && (
                        <span className="text-red-600 ml-1">(exceeds limit)</span>
                      )}
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <p className="text-sm text-gray-600 dark:text-white font-medium flex items-center gap-2">
                    <FileText className="h-4 w-4 text-electric-blue" />
                    Bio
                  </p>
                  <p className="text-gray-700 dark:text-white whitespace-pre-wrap text-sm">{userInfo.bio || 'No bio provided.'}</p>
                </>
              )}
            </div>
          </div>

          {/* Social Media Section */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-600 dark:text-white font-medium mb-3 block">Social Media</p>
            {isEditing ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="social-facebook" className="text-xs text-gray-600 flex items-center gap-1.5">
                    <Facebook className="h-3.5 w-3.5 text-blue-600" />
                    Facebook
                  </Label>
                  <Input
                    id="social-facebook"
                    name="social-facebook"
                    value={formData.socialMedia?.facebook || ''}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      socialMedia: { ...prev.socialMedia, facebook: e.target.value }
                    }))}
                    placeholder="https://facebook.com/username"
                    className="text-sm h-9"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="social-x" className="text-xs text-gray-600 flex items-center gap-1.5">
                    <Twitter className="h-3.5 w-3.5 text-blue-400" />
                    X
                  </Label>
                  <Input
                    id="social-x"
                    name="social-x"
                    value={formData.socialMedia?.x || ''}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      socialMedia: { ...prev.socialMedia, x: e.target.value }
                    }))}
                    placeholder="https://x.com/username"
                    className="text-sm h-9"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="social-linkedin" className="text-xs text-gray-600 flex items-center gap-1.5">
                    <Linkedin className="h-3.5 w-3.5 text-blue-700" />
                    LinkedIn
                  </Label>
                  <Input
                    id="social-linkedin"
                    name="social-linkedin"
                    value={formData.socialMedia?.linkedin || ''}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      socialMedia: { ...prev.socialMedia, linkedin: e.target.value }
                    }))}
                    placeholder="https://linkedin.com/in/username"
                    className="text-sm h-9"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="social-instagram" className="text-xs text-gray-600 flex items-center gap-1.5">
                    <Instagram className="h-3.5 w-3.5 text-pink-600" />
                    Instagram
                  </Label>
                  <Input
                    id="social-instagram"
                    name="social-instagram"
                    value={formData.socialMedia?.instagram || ''}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      socialMedia: { ...prev.socialMedia, instagram: e.target.value }
                    }))}
                    placeholder="https://instagram.com/username"
                    className="text-sm h-9"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="social-youtube" className="text-xs text-gray-600 flex items-center gap-1.5">
                    <Youtube className="h-3.5 w-3.5 text-red-600" />
                    YouTube
                  </Label>
                  <Input
                    id="social-youtube"
                    name="social-youtube"
                    value={formData.socialMedia?.youtube || ''}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      socialMedia: { ...prev.socialMedia, youtube: e.target.value }
                    }))}
                    placeholder="https://youtube.com/@username"
                    className="text-sm h-9"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="social-tiktok" className="text-xs text-gray-600 flex items-center gap-1.5">
                    <TikTokIcon className="h-3.5 w-3.5 text-gray-800" />
                    TikTok
                  </Label>
                  <Input
                    id="social-tiktok"
                    name="social-tiktok"
                    value={formData.socialMedia?.tiktok || ''}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      socialMedia: { ...prev.socialMedia, tiktok: e.target.value }
                    }))}
                    placeholder="https://tiktok.com/@username"
                    className="text-sm h-9"
                  />
                </div>
              </div>
            ) : (
              <div className="flex flex-wrap gap-3">
                {userInfo.socialMedia?.facebook && (
                  <a
                    href={userInfo.socialMedia.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700 hover:underline"
                  >
                    <Facebook className="h-4 w-4" />
                    Facebook
                  </a>
                )}
                {userInfo.socialMedia?.x && (
                  <a
                    href={userInfo.socialMedia.x}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-sm text-blue-400 hover:text-blue-500 hover:underline"
                  >
                    <Twitter className="h-4 w-4" />
                    X
                  </a>
                )}
                {userInfo.socialMedia?.linkedin && (
                  <a
                    href={userInfo.socialMedia.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-sm text-blue-700 hover:text-blue-800 hover:underline"
                  >
                    <Linkedin className="h-4 w-4" />
                    LinkedIn
                  </a>
                )}
                {userInfo.socialMedia?.instagram && (
                  <a
                    href={userInfo.socialMedia.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-sm text-pink-600 hover:text-pink-700 hover:underline"
                  >
                    <Instagram className="h-4 w-4" />
                    Instagram
                  </a>
                )}
                {userInfo.socialMedia?.youtube && (
                  <a
                    href={userInfo.socialMedia.youtube}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-sm text-red-600 hover:text-red-700 hover:underline"
                  >
                    <Youtube className="h-4 w-4" />
                    YouTube
                  </a>
                )}
                {userInfo.socialMedia?.tiktok && (
                  <a
                    href={userInfo.socialMedia.tiktok}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-sm text-gray-800 dark:text-white hover:text-gray-900 dark:hover:text-white hover:underline"
                  >
                    <TikTokIcon className="h-4 w-4" />
                    TikTok
                  </a>
                )}
                {(!userInfo.socialMedia || Object.keys(userInfo.socialMedia).length === 0) && (
                  <p className="text-xs text-gray-500 dark:text-white">No social media links added</p>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Post Creation Form */}
      {userInfo?.organizationId && (
        <Card className="glass-card floating-hover">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Send className="h-5 w-5 text-electric-blue" />
              Create a Post
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Textarea
                id="post-content"
                name="post-content"
                value={postContent}
                onChange={(e) => setPostContent(e.target.value)}
                rows={4}
              />
              <div className="text-xs text-gray-500 mt-1 text-right">
                {postContent.length}/2000 characters
                {postContent.length > 2000 && (
                  <span className="text-red-600 ml-1">(exceeds limit)</span>
                )}
              </div>
            </div>

            {/* Image Upload and Post Button */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <label
                  htmlFor="post-image-upload"
                  className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-md cursor-pointer hover:bg-gray-50 transition-colors"
                >
                  <Paperclip className="h-4 w-4 text-gray-600 dark:text-white" />
                  <span className="text-sm text-gray-700 dark:text-white">Attach Image</span>
                </label>
                <input
                  id="post-image-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                {postImagePreview && (
                  <div className="relative inline-block">
                    <img
                      src={postImagePreview}
                      alt="Post preview"
                      className="h-20 w-20 object-cover rounded-md border border-gray-300"
                    />
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                )}
              </div>
              <Button
                onClick={handleCreatePost}
                disabled={isPosting || !postContent.trim()}
                className="bg-electric-blue hover:bg-electric-blue/90"
              >
                {isPosting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Posting...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Post
                  </>
                )}
              </Button>
            </div>

            {/* URL Previews */}
            {urlPreviews.length > 0 && (
              <div className="space-y-2">
                <Label>URL Previews</Label>
                {urlPreviews.map((preview) => (
                  <div key={preview.url} className="relative border border-gray-200 rounded-md p-3 bg-gray-50">
                    <button
                      type="button"
                      onClick={() => handleRemoveURLPreview(preview.url)}
                      className="absolute top-2 right-2 text-gray-400 hover:text-red-500"
                    >
                      <X className="h-4 w-4" />
                    </button>
                    
                    {preview.type === 'youtube' && preview.videoId && (
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-gray-700">YouTube Video</p>
                        <div className="aspect-video w-full">
                          <iframe
                            src={`https://www.youtube.com/embed/${preview.videoId}`}
                            className="w-full h-full rounded-md"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                          />
                        </div>
                      </div>
                    )}
                    
                    {preview.type === 'vimeo' && preview.videoId && (
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-gray-700">Vimeo Video</p>
                        <div className="aspect-video w-full">
                          <iframe
                            src={`https://player.vimeo.com/video/${preview.videoId}`}
                            className="w-full h-full rounded-md"
                            allow="autoplay; fullscreen; picture-in-picture"
                            allowFullScreen
                          />
                        </div>
                      </div>
                    )}
                    
                    {(preview.type === 'pdf' || preview.type === 'document') && (
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-gray-700">
                          {preview.type === 'pdf' ? 'PDF Document' : 'Document'}
                        </p>
                        <a
                          href={preview.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 hover:underline"
                        >
                          <FileText className="h-4 w-4" />
                          {preview.url}
                        </a>
                      </div>
                    )}
                    
                    {preview.type === 'website' && (
                      <a
                        href={preview.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block border border-gray-200 rounded-lg overflow-hidden hover:border-blue-300 transition-colors"
                      >
                        {preview.isLoading ? (
                          <div className="p-4 flex items-center justify-center">
                            <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
                            <span className="ml-2 text-sm text-gray-500">Loading preview...</span>
                          </div>
                        ) : (
                          <div className="flex flex-col">
                            {preview.image && (
                              <img
                                src={preview.image}
                                alt={preview.title || preview.url}
                                className="w-full h-48 object-cover"
                                onError={(e) => {
                                  // Hide image if it fails to load
                                  e.currentTarget.style.display = 'none';
                                }}
                              />
                            )}
                            <div className="p-3 space-y-1">
                              {preview.siteName && (
                                <p className="text-xs text-gray-500 dark:text-white uppercase">{preview.siteName}</p>
                              )}
                              {preview.title && (
                                <p className="font-semibold text-gray-900 dark:text-white line-clamp-2">{preview.title}</p>
                              )}
                              {preview.description && (
                                <p className="text-sm text-gray-600 dark:text-white line-clamp-2 leading-tight">{preview.description}</p>
                              )}
                              <p className="text-xs text-blue-600 dark:text-blue-400 flex items-center gap-1 mt-2">
                                <LinkIcon className="h-3 w-3" />
                                {preview.url.replace(/^https?:\/\//, '').replace(/\/$/, '')}
                              </p>
                            </div>
                          </div>
                        )}
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* My Posts Feed */}
      <Card className="glass-card floating-hover">
        <CardHeader className="p-4 md:p-6">
          <CardTitle className="flex items-center gap-2 text-lg">
            <MessageSquare className="h-5 w-5 text-electric-blue" />
            My Posts
          </CardTitle>
          <CardDescription>
            Posts you've created
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
              <p className="text-gray-600">No posts yet. Create your first post above!</p>
            </div>
          ) : (
            <div className="w-full md:max-w-2xl space-y-1 md:space-y-4">
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
                        <div className="flex items-center gap-1">
                        {canDelete && editingPostId !== post.id && (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditPost(post)}
                              className="text-gray-400 hover:text-blue-600"
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setPostToDelete(post.id)}
                              className="text-gray-400 hover:text-red-600"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                        {editingPostId === post.id && (
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={handleSaveEdit}
                              disabled={isSavingEdit}
                              className="text-gray-400 hover:text-green-600"
                            >
                              {isSavingEdit ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Save className="h-4 w-4" />
                              )}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={handleCancelEdit}
                              className="text-gray-400 hover:text-gray-600"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Post Content */}
                    <div>
                      {editingPostId === post.id ? (
                        <div className="space-y-3">
                          <Textarea
                            id={`edit-post-content-${post.id}`}
                            name={`edit-post-content-${post.id}`}
                            value={editContent}
                            onChange={(e) => setEditContent(e.target.value)}
                            rows={4}
                            className="w-full"
                          />
                          {editMediaUrl && (
                            <div className="relative inline-block">
                              {editMediaUrl.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i) || editMediaUrl.includes('/post-images/') ? (
                                <div className="relative">
                                  <img
                                    src={editMediaUrl}
                                    alt="Post media"
                                    className="w-full max-h-96 object-contain rounded-lg"
                                  />
                                  <button
                                    type="button"
                                    onClick={handleRemoveMedia}
                                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 z-10"
                                  >
                                    <X className="h-4 w-4" />
                                  </button>
                                </div>
                              ) : (
                                <div className="relative">
                                  <WebsitePreview url={editMediaUrl} />
                                  <button
                                    type="button"
                                    onClick={handleRemoveMedia}
                                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 z-10"
                                  >
                                    <X className="h-4 w-4" />
                                  </button>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      ) : (
                        <>
                          <PostContent content={post.content} />
                          {renderMediaContent(post)}
                        </>
                      )}
                    </div>

                    {/* Reactions */}
                    <div className="flex items-center gap-3 py-2 border-t border-gray-200">
                      {Object.entries(REACTION_ICONS).map(([type, Icon]) => {
                        const reactionType = type as ReactionType;
                        const count = post.reactionCounts?.[reactionType] || 0;
                        const isActive = post.userReactions?.includes(reactionType);

                        // Determine color based on reaction type
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
                                id={`comment-input-${post.id}`}
                                name={`comment-input-${post.id}`}
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
    </div>
  );
}
