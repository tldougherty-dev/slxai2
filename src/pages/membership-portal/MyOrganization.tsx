import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PageTitle } from '@/components/PageTitle';
import { useIsMobile, useIsLandscape } from '@/hooks/use-mobile';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { 
  Building2, Mail, MapPin, Globe, FileText, Upload, 
  Save, X, Plus, Trash2, Hand, Shield,
  Facebook, Twitter, Linkedin, Instagram, Youtube,
  Video, Link as LinkIcon, Paperclip, LogOut
} from 'lucide-react';

// TikTok Icon Component
const TikTokIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
  </svg>
);
import { SocialMedia } from '@/data/members';
import { useToast } from '@/hooks/use-toast';
import { logout } from '@/lib/auth';
import { CountryFlag } from '@/components/CountryFlag';
import { Member, MemberPerson } from '@/data/members';
import { sanitizeText, isValidEmail, isValidLength, isValidUrl, isValidYouTubeUrl, isValidVimeoUrl } from '@/lib/security';
import { getCurrentUser, getUserRole, refreshUserSession } from '@/lib/auth';
import { hasPermission, UserRole } from '@/lib/roles';
import { getMemberById } from '@/data/membersData';
import { updateMember } from '@/data/membersData';
import { supabase } from '@/lib/supabase';
import { isAdmin } from '@/lib/auth';
import { UserAvatar } from '@/components/UserAvatar';
import { Badge } from '@/components/ui/badge';
import { Users } from 'lucide-react';
import { getOrganizationPosts, getPostComments, addComment, toggleReaction, deletePost, deleteComment, updatePost, FeedPost, PostComment, ReactionType, createPost, PostType } from '@/data/feed';
import { formatDistanceToNow } from 'date-fns';
import { MessageSquare, Heart, ThumbsUp, PartyPopper, Lightbulb, Loader2, Send, Edit2 } from 'lucide-react';
import { getURLPreviews, getURLPreviewsAsync, URLPreview } from '@/lib/urlPreview';
import { useRef } from 'react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { PostContent } from '@/components/PostContent';
import { WebsitePreview } from '@/components/WebsitePreview';

export default function MyOrganization() {
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const isLandscape = useIsLandscape();
  const [userRole, setUserRole] = useState<UserRole>(getUserRole());
  const canEditOrgProfile = hasPermission(userRole, 'canEditOrganizationProfile');
  
  // Refresh role when component loads
  useEffect(() => {
    const refreshRole = async () => {
      await refreshUserSession();
      const updatedRole = getUserRole();
      setUserRole(updatedRole);
    };
    refreshRole();
  }, []);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Member | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [organizationPosts, setOrganizationPosts] = useState<FeedPost[]>([]);
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
  
  // Post creation state
  const [postContent, setPostContent] = useState('');
  const [postImage, setPostImage] = useState<File | null>(null);
  const [postImagePreview, setPostImagePreview] = useState<string | null>(null);
  const [urlPreviews, setUrlPreviews] = useState<URLPreview[]>([]);
  const [isPosting, setIsPosting] = useState(false);

  const REACTION_ICONS: Record<ReactionType, typeof Heart> = {
    like: ThumbsUp,
    love: Heart,
    celebrate: PartyPopper,
    insightful: Lightbulb,
  };

  const REACTION_LABELS: Record<ReactionType, string> = {
    like: 'Like',
    love: 'Love',
    celebrate: 'Celebrate',
    insightful: 'Insightful',
  };

  // Load user's organization profile
  useEffect(() => {
    const loadProfile = async () => {
      setIsLoading(true);
      try {
        // Refresh user session to get latest role
        await refreshUserSession();
        
        const currentUser = getCurrentUser();
        if (!currentUser || !currentUser.organizationId) {
          toast({
            title: "No organization linked",
            description: "Your account is not linked to an organization. Please contact support.",
            variant: "destructive",
          });
          setIsLoading(false);
          return;
        }

        const memberData = await getMemberById(currentUser.organizationId);
        if (memberData) {
          // Sync roles from auth.users to member_persons for display
          const currentUserRole = getUserRole();
          const updatedMembers = memberData.members.map(m => {
            // If this member's email matches current user, sync their role
            if (m.email.toLowerCase() === currentUser.email.toLowerCase()) {
              return { ...m, role: currentUserRole };
            }
            return m;
          });
          setFormData({ ...memberData, members: updatedMembers });
        } else {
          toast({
            title: "Organization not found",
            description: "Could not load your organization profile.",
            variant: "destructive",
          });
        }
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          console.error('Error loading profile:', error);
        }
        toast({
          title: "Error",
          description: "Failed to load your organization profile. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, [toast]);

  // Load organization posts
  const loadOrganizationPosts = useCallback(async () => {
    if (!formData?.id) return;
    setIsLoadingPosts(true);
    try {
      const posts = await getOrganizationPosts(formData.id);
      setOrganizationPosts(posts);
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error loading organization posts:', error);
      }
    } finally {
      setIsLoadingPosts(false);
    }
  }, [formData?.id]);

  useEffect(() => {
    if (formData?.id) {
      loadOrganizationPosts();
    }
  }, [formData?.id, loadOrganizationPosts]);

  const handleInputChange = (field: keyof Member, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleMemberChange = (memberId: string, field: keyof MemberPerson, value: any) => {
    setFormData(prev => ({
      ...prev,
      members: prev.members.map(m => 
        m.id === memberId ? { ...m, [field]: value } : m
      )
    }));
  };

  const handleAddMember = () => {
    const newMember: MemberPerson = {
      id: `new-${Date.now()}`,
      name: '',
      email: '',
      title: '',
      isVotingRep: false,
    };
    setFormData(prev => ({
      ...prev,
      members: [...prev.members, newMember],
      memberCount: prev.members.length + 1,
    }));
  };

  const handleRemoveMember = (memberId: string) => {
    setFormData(prev => ({
      ...prev,
      members: prev.members.filter(m => m.id !== memberId),
      memberCount: prev.members.length - 1,
    }));
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    if (!formData) return;

    const currentUser = getCurrentUser();
    if (!currentUser) {
      toast({
        title: "Not authenticated",
        description: "Please log in to edit your organization.",
        variant: "destructive",
      });
      return;
    }

    // Authorization check: Verify user is a member of this organization
    const isMemberOfOrg = formData.members.some(
      m => m.email.toLowerCase() === currentUser.email.toLowerCase()
    );

    if (!isMemberOfOrg && !hasPermission(userRole, 'canEditOtherProfiles')) {
      toast({
        title: "Unauthorized",
        description: "You can only edit your own organization's profile.",
        variant: "destructive",
      });
      return;
    }

    // Additional check: Verify the organization ID matches
    if (currentUser.organizationId !== formData.id && !hasPermission(userRole, 'canEditOtherProfiles')) {
      toast({
        title: "Unauthorized",
        description: "You can only edit your own organization's profile.",
        variant: "destructive",
      });
      return;
    }

    // Validate required fields
    if (!formData.organizationName || !isValidLength(formData.organizationName, 1, 200)) {
      toast({
        title: "Validation error",
        description: "Organization name is required and must be 200 characters or less.",
        variant: "destructive",
      });
      return;
    }

    if (!formData.country || !isValidLength(formData.country, 1, 100)) {
      toast({
        title: "Validation error",
        description: "Country is required and must be 100 characters or less.",
        variant: "destructive",
      });
      return;
    }

    // Validate emails
    for (const member of formData.members) {
      if (!isValidEmail(member.email)) {
        toast({
          title: "Validation error",
          description: `Invalid email address: ${member.email}`,
          variant: "destructive",
        });
        return;
      }
    }

    // Validate website URL if provided
    if (formData.website && !isValidUrl(formData.website)) {
      toast({
        title: "Validation error",
        description: "Invalid website URL format.",
        variant: "destructive",
      });
      return;
    }

    // Update POC info from first member if they're the voting rep
    const votingRep = formData.members.find(m => m.isVotingRep);
    if (votingRep) {
      formData.pocName = sanitizeText(votingRep.name);
      formData.pocEmail = votingRep.email.toLowerCase().trim();
      formData.pocTitle = sanitizeText(votingRep.title || 'Voting Representative');
    }

    // Upload logo to Supabase Storage if a new file was selected
    let logoUrl = formData.logo; // Keep existing logo if no new file
    if (logoFile) {
      try {
        // Validate file type
        if (!logoFile.type.startsWith('image/')) {
          toast({
            title: "Invalid file type",
            description: "Logo must be an image file.",
            variant: "destructive",
          });
          setIsSaving(false);
          return;
        }

        // Validate file size (max 5MB)
        if (logoFile.size > 5 * 1024 * 1024) {
          toast({
            title: "File too large",
            description: "Logo must be less than 5MB.",
            variant: "destructive",
          });
          setIsSaving(false);
          return;
        }

        // Upload to Supabase Storage
        const fileExt = logoFile.name.split('.').pop();
        const fileName = `${currentUser.organizationId}-${Date.now()}.${fileExt}`;
        const filePath = `organization-logos/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('avatars') // Using avatars bucket for organization logos too
          .upload(filePath, logoFile, {
            cacheControl: '3600',
            upsert: false,
          });

        if (uploadError) {
          // Try public bucket as fallback
          const { error: publicError } = await supabase.storage
            .from('public')
            .upload(`logos/${filePath}`, logoFile, {
              cacheControl: '3600',
              upsert: false,
            });

          if (publicError) {
            throw new Error(`Failed to upload logo: ${publicError.message}`);
          }

          const { data: { publicUrl: publicLogoUrl } } = supabase.storage
            .from('public')
            .getPublicUrl(`logos/${filePath}`);
          logoUrl = publicLogoUrl;
        } else {
          // Get public URL from avatars bucket
          const { data: { publicUrl } } = supabase.storage
            .from('avatars')
            .getPublicUrl(filePath);
          logoUrl = publicUrl;
        }
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          console.error('Error uploading logo:', error);
        }
        toast({
          title: "Logo upload failed",
          description: error instanceof Error ? error.message : "Failed to upload logo. Please try again.",
          variant: "destructive",
        });
        setIsSaving(false);
        return;
      }
    }

    // Sanitize inputs and filter out empty social media values
    const socialMediaFiltered = formData.socialMedia ? Object.fromEntries(
      Object.entries(formData.socialMedia).filter(([_, value]) => value && typeof value === 'string' && value.trim() !== '')
    ) : undefined;
    
    const sanitizedSocialMedia = socialMediaFiltered && Object.keys(socialMediaFiltered).length > 0 ? socialMediaFiltered : undefined;
    
    // Debug: Log social media before saving
    if (process.env.NODE_ENV === 'development') {
      console.log('Saving social media:', sanitizedSocialMedia);
      console.log('Original formData.socialMedia:', formData.socialMedia);
    }
    
    const sanitizedData = {
      ...formData,
      logo: logoUrl, // Include the logo URL (new or existing)
      organizationName: sanitizeText(formData.organizationName),
      country: sanitizeText(formData.country),
      bio: formData.bio ? sanitizeText(formData.bio) : undefined,
      socialMedia: sanitizedSocialMedia,
      members: formData.members.map(m => ({
        ...m,
        name: sanitizeText(m.name),
        email: m.email.toLowerCase().trim(),
        title: m.title ? sanitizeText(m.title) : undefined,
      })),
    };

    // Save to Supabase
    setIsSaving(true);
    try {
      if (!currentUser.organizationId) {
        throw new Error('No organization linked');
      }

      await updateMember(currentUser.organizationId, sanitizedData, currentUser);
      
      toast({
        title: "Organization updated",
        description: "Your organization profile has been saved successfully.",
      });
      setIsEditing(false);
      
      // Reload data to reflect changes
      const updatedData = await getMemberById(currentUser.organizationId);
      if (updatedData) {
        setFormData(updatedData);
        setLogoPreview(null); // Clear preview
        setLogoFile(null); // Clear file
        
        // Debug: Log social media data
        if (process.env.NODE_ENV === 'development') {
          console.log('Reloaded social media:', updatedData.socialMedia);
        }
      }
      
      // Only reload if logo was changed
      if (logoFile) {
        toast({
          title: "Logo updated",
          description: "Your organization logo has been saved. Refreshing to show it everywhere...",
        });
        
        // Refresh the page to show updated logo everywhere
        // This ensures the logo appears in directory and other places
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error saving organization:', error);
      }
      toast({
        title: "Error",
        description: "Failed to save organization profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    const reloadData = async () => {
      const currentUser = getCurrentUser();
      if (currentUser?.organizationId) {
        const memberData = await getMemberById(currentUser.organizationId);
        if (memberData) {
          setFormData(memberData);
        }
      }
      setLogoFile(null);
      setLogoPreview(null);
      setIsEditing(false);
    };
    reloadData();
  };

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
      await loadOrganizationPosts();
      
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

  // Handle image upload for posts
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file.",
        variant: "destructive",
      });
      return;
    }

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

  const handleRemoveImage = () => {
    setPostImage(null);
    setPostImagePreview(null);
    const input = document.getElementById('org-post-image-upload') as HTMLInputElement | null;
    if (input) input.value = '';
  };

  // Detect URLs in content and update previews
  useEffect(() => {
    if (postContent) {
      const previews = getURLPreviews(postContent);
      // Set initial previews (with loading state for websites)
      setUrlPreviews(previews.map(p => p.type === 'website' ? { ...p, isLoading: true } : p));
      
      // Fetch metadata for website URLs
      let cancelled = false;
      const fetchMetadata = async () => {
        const updatedPreviews = await getURLPreviewsAsync(postContent);
        if (!cancelled) {
          setUrlPreviews(updatedPreviews);
        }
      };
      
      fetchMetadata();
      
      return () => {
        cancelled = true;
      };
    } else {
      setUrlPreviews([]);
    }
  }, [postContent]);

  const handleRemoveURLPreview = (url: string) => {
    setUrlPreviews(prev => prev.filter(p => p.url !== url));
    setPostContent(prev => prev.replace(url, '').trim());
  };

  const handleCreateOrganizationPost = async () => {
    await refreshUserSession();
    
    const currentUser = getCurrentUser();
    if (!currentUser || !currentUser.organizationId || !formData) {
      toast({
        title: "Error",
        description: "Your account is not linked to an organization. Please contact support.",
        variant: "destructive",
      });
      return;
    }

    // Verify user is a member of this organization
    const isMemberOfOrg = formData.members.some(
      m => m.email.toLowerCase() === currentUser.email.toLowerCase()
    );

    if (!isMemberOfOrg) {
      toast({
        title: "Unauthorized",
        description: "Only members of this organization can create posts.",
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

      let postType: PostType = 'text';
      let mediaUrl: string | undefined;
      
      if (imageUrl) {
        postType = 'link';
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
        postSource: 'organization',
      });

      toast({
        title: "Post created",
        description: "Your organization post has been shared to the feed.",
      });

      setPostContent('');
      setPostImage(null);
      setPostImagePreview(null);
      setUrlPreviews([]);
      const input = document.getElementById('org-post-image-upload') as HTMLInputElement | null;
      if (input) input.value = '';
      
      await loadOrganizationPosts();
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

  const toggleComments = async (postId: string) => {
    const newExpanded = new Set(expandedComments);
    if (newExpanded.has(postId)) {
      newExpanded.delete(postId);
    } else {
      newExpanded.add(postId);
      const post = organizationPosts.find(p => p.id === postId);
      if (post && !(post as any).comments) {
        try {
          const comments = await getPostComments(postId);
          const updatedPosts = organizationPosts.map(p => {
            if (p.id === postId) {
              return { ...p, comments } as FeedPost & { comments: PostComment[] };
            }
            return p;
          });
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-electric-blue mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your organization...</p>
        </div>
      </div>
    );
  }

  if (!formData) {
    return (
      <div className="space-y-4">
        <Card className="glass-card floating-hover">
          <CardContent className="pt-6">
            <p className="text-center text-gray-600">
              No organization profile found. Please contact support to link your account.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }


  return (
    <div className="space-y-0 md:space-y-4">
      <PageTitle 
        title="My Organization"
        fullWidthLandscape={true}
        titleClassName="whitespace-nowrap"
        leftContent={
          !isEditing ? (
            !isMobile ? (
              <Button 
                onClick={() => {
                  setIsEditing(true);
                }} 
                className="bg-electric-blue hover:bg-electric-blue/90 text-xs md:text-sm px-2 md:px-3"
              >
                <span className="hidden sm:inline">Edit Organization</span>
                <span className="sm:hidden">Edit</span>
              </Button>
            ) : null
          ) : (
            <Button 
              variant="outline" 
              onClick={handleCancel}
              className="border-gray-300 text-gray-700 dark:!text-gray-900 hover:bg-gray-50 hover:text-gray-900 dark:hover:!text-gray-900 text-xs md:text-sm h-7 md:h-9 px-2 md:px-3"
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
                onClick={() => {
                  setIsEditing(true);
                }} 
                className="bg-electric-blue hover:bg-electric-blue/90 text-xs md:text-sm px-2 md:px-3"
              >
                <span className="hidden sm:inline">Edit Organization</span>
                <span className="sm:hidden">Edit</span>
              </Button>
            ) : (
              <Button 
                onClick={async () => {
                  await logout();
                  toast({
                    title: "Logged out",
                    description: "You have been successfully logged out.",
                  });
                }}
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

      <div className="w-full max-w-2xl space-y-2 md:space-y-4 md:mx-auto">
      {/* Organization Information - Merged Card */}
      <Card className="glass-card floating-hover">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Building2 className="h-5 w-5 text-electric-blue" />
            Organization Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 pt-0">
          {/* Logo & Name Section */}
          <div className="flex items-start gap-4 pb-4 border-b border-gray-200">
            <div className="flex-shrink-0">
              {logoPreview || formData.logo ? (
                <img 
                  src={logoPreview || formData.logo || '/placeholder.svg'} 
                  alt="Organization logo" 
                  className="h-20 w-20 md:h-16 md:w-16 rounded-lg object-cover border border-gray-200"
                />
              ) : (
                <div className="h-20 w-20 md:h-16 md:w-16 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center">
                  <Building2 className="h-7 w-7 md:h-6 md:w-6 text-gray-400" />
                </div>
              )}
            </div>
            <div className="flex-1 space-y-2">
              {isEditing && (
                <div>
                  <Label htmlFor="logo-upload" className="cursor-pointer">
                    <div className="flex items-center gap-1 text-xs text-gray-600 hover:text-electric-blue">
                      <Upload className="h-3 w-3" />
                      Upload Logo
                    </div>
                  </Label>
                  <input
                    id="logo-upload"
                    name="logo-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="hidden"
                  />
                </div>
              )}
              <div className="space-y-1">
                {isEditing ? (
                  <>
                    <Label htmlFor="org-name" className="text-xs text-gray-600 font-medium">Organization Name *</Label>
                    <Input
                      id="org-name"
                      name="org-name"
                      autoComplete="organization"
                      value={formData.organizationName}
                      onChange={(e) => handleInputChange('organizationName', e.target.value)}
                      placeholder="Enter organization name"
                      className="text-sm h-9"
                    />
                  </>
                ) : (
                  <>
                    <p className="text-xs text-gray-600 dark:text-white font-medium">Organization Name *</p>
                    <p className="text-sm text-gray-900 dark:text-white font-medium">{formData.organizationName}</p>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Location & Website Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-4 border-b border-gray-200">
            <div className="space-y-1">
              {isEditing ? (
                <>
                  <Label htmlFor="country" className="text-xs text-gray-600 font-medium flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    Country *
                  </Label>
                  <Input
                    id="country"
                    name="country"
                    autoComplete="country-name"
                    value={formData.country}
                    onChange={(e) => handleInputChange('country', e.target.value)}
                    placeholder="Enter country"
                    className="text-sm h-9"
                  />
                </>
              ) : (
                <>
                  <p className="text-xs text-gray-600 dark:text-white font-medium flex items-center gap-1">
                    <MapPin className="h-3 w-3 dark:text-white" />
                    Country *
                  </p>
                  <div className="flex items-center gap-2">
                    <CountryFlag country={formData.country} size="md" />
                    <p className="text-sm text-gray-900 dark:text-white">{formData.country}</p>
                  </div>
                </>
              )}
            </div>
            <div className="space-y-1">
              {isEditing ? (
                <>
                  <Label htmlFor="website" className="text-xs text-gray-600 font-medium flex items-center gap-1">
                    <Globe className="h-3 w-3" />
                    Website
                  </Label>
                  <Input
                    id="website"
                    name="website"
                    type="url"
                    autoComplete="url"
                    value={formData.website || ''}
                    onChange={(e) => handleInputChange('website', e.target.value)}
                    placeholder="https://example.com"
                    className="text-sm h-9"
                  />
                </>
              ) : (
                <>
                  <p className="text-xs text-gray-600 dark:text-white font-medium flex items-center gap-1">
                    <Globe className="h-3 w-3 dark:text-white" />
                    Website
                  </p>
                  <div className="flex items-center gap-2">
                    {formData.website ? (
                      <a 
                        href={formData.website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-sm text-electric-blue hover:underline flex items-center gap-1 dark:text-electric-blue"
                      >
                        <Globe className="h-3 w-3" />
                        <span className="truncate">{formData.website}</span>
                      </a>
                    ) : (
                      <p className="text-xs text-gray-500 dark:text-white">No website</p>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Bio Section */}
          <div className="space-y-1 pb-4 border-b border-gray-200">
            {isEditing ? (
              <>
                <Label htmlFor="bio" className="text-xs text-gray-600 font-medium flex items-center gap-1">
                  <FileText className="h-3 w-3" />
                  Bio
                </Label>
                <Textarea
                  id="bio"
                  name="bio"
                  value={formData.bio || ''}
                  onChange={(e) => handleInputChange('bio', e.target.value)}
                  placeholder="Tell us about your organization..."
                  rows={4}
                  className="text-sm"
                />
              </>
            ) : (
              <>
                <p className="text-xs text-gray-600 dark:text-white font-medium flex items-center gap-1">
                  <FileText className="h-3 w-3 dark:text-white" />
                  Bio
                </p>
                <p className="text-sm text-gray-700 dark:text-white whitespace-pre-wrap">{formData.bio || 'No bio provided.'}</p>
              </>
            )}
          </div>

          {/* Social Media Section */}
          <div className="space-y-2">
            <p className="text-xs text-gray-600 dark:text-white font-medium">Social Media</p>
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
                    onChange={(e) => handleInputChange('socialMedia', { ...(formData.socialMedia || {}), facebook: e.target.value })}
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
                    onChange={(e) => handleInputChange('socialMedia', { ...(formData.socialMedia || {}), x: e.target.value })}
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
                    onChange={(e) => handleInputChange('socialMedia', { ...(formData.socialMedia || {}), linkedin: e.target.value })}
                    placeholder="https://linkedin.com/company/username"
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
                    onChange={(e) => handleInputChange('socialMedia', { ...(formData.socialMedia || {}), instagram: e.target.value })}
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
                    onChange={(e) => handleInputChange('socialMedia', { ...(formData.socialMedia || {}), youtube: e.target.value })}
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
                    onChange={(e) => handleInputChange('socialMedia', { ...(formData.socialMedia || {}), tiktok: e.target.value })}
                    placeholder="https://tiktok.com/@username"
                    className="text-sm h-9"
                  />
                </div>
              </div>
            ) : (
              <div className="flex flex-wrap gap-3">
                {formData.socialMedia?.facebook && (
                  <a
                    href={formData.socialMedia.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700 hover:underline"
                  >
                    <Facebook className="h-4 w-4" />
                    Facebook
                  </a>
                )}
                {formData.socialMedia?.x && (
                  <a
                    href={formData.socialMedia.x}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-sm text-blue-400 hover:text-blue-500 hover:underline"
                  >
                    <Twitter className="h-4 w-4" />
                    X
                  </a>
                )}
                {formData.socialMedia?.linkedin && (
                  <a
                    href={formData.socialMedia.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-sm text-blue-700 hover:text-blue-800 hover:underline"
                  >
                    <Linkedin className="h-4 w-4" />
                    LinkedIn
                  </a>
                )}
                {formData.socialMedia?.instagram && (
                  <a
                    href={formData.socialMedia.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-sm text-pink-600 hover:text-pink-700 hover:underline"
                  >
                    <Instagram className="h-4 w-4" />
                    Instagram
                  </a>
                )}
                {formData.socialMedia?.youtube && (
                  <a
                    href={formData.socialMedia.youtube}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-sm text-red-600 hover:text-red-700 hover:underline"
                  >
                    <Youtube className="h-4 w-4" />
                    YouTube
                  </a>
                )}
                {formData.socialMedia?.tiktok && (
                  <a
                    href={formData.socialMedia.tiktok}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-sm text-gray-800 dark:text-white hover:text-gray-900 dark:hover:text-white hover:underline"
                  >
                    <TikTokIcon className="h-4 w-4" />
                    TikTok
                  </a>
                )}
                {(!formData.socialMedia || Object.keys(formData.socialMedia).length === 0 || 
                  Object.values(formData.socialMedia).every(v => !v || (typeof v === 'string' && v.trim() === ''))) && (
                  <p className="text-xs text-gray-500 dark:text-white">No social media links added</p>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Organization Members */}
      <Card className="glass-card floating-hover">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-electric-blue" />
                Organization Members ({formData.members.filter(m => m.isRegistered !== false).length})
              </CardTitle>
              <CardDescription>
                {isEditing ? 'Manage team members associated with your organization' : 'All members associated with this organization'}
              </CardDescription>
            </div>
            {isEditing && (
              <Button onClick={handleAddMember} variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Member
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className={isEditing 
            ? 'flex flex-col gap-3' 
            : `grid ${isLandscape ? 'grid-cols-3' : 'grid-cols-1'} md:grid-cols-2 lg:grid-cols-3 gap-2 md:gap-4`
          }>
            {formData.members.filter(member => member.isRegistered !== false).map((member) => {
              const MemberCard = isEditing ? 'div' : Link;
              const cardProps = isEditing ? {} : { to: `/membership-portal/member/${encodeURIComponent(member.email)}` };
              
              return (
              <MemberCard
                key={member.id}
                {...cardProps}
                className={`flex items-start gap-2 md:gap-4 p-2 md:p-4 border rounded-lg backdrop-blur-sm transition-all ${
                  isEditing 
                    ? 'border-gray-200 bg-white/50 hover:bg-white/70 w-full' 
                    : 'border-electric-blue/20 bg-electric-blue/5 hover:bg-electric-blue/10 cursor-pointer'
                }`}
              >
                <div className="flex flex-col items-center gap-1 md:gap-2 flex-shrink-0">
                  <UserAvatar
                    email={member.email}
                    name={member.name}
                    size="2xl"
                    className="md:!h-16 md:!w-16 !h-12 !w-12"
                  />
                  {!isEditing && (
                    <div className="flex flex-col items-center gap-0.5 md:gap-1">
                      {member.isVotingRep && (
                        <Badge variant="secondary" className="bg-electric-blue/20 text-electric-blue border-electric-blue/30 text-xs px-1.5 py-0.5">
                          Voting
                        </Badge>
                      )}
                      {member.role && member.role !== 'member' && (
                        <Badge 
                          variant="secondary" 
                          className={`text-xs px-1.5 py-0.5 ${
                            member.role === 'super_admin' || member.role === 'admin' ? 'bg-blue-100 text-blue-700 border-blue-300' :
                            member.role === 'voting_member' ? 'bg-green-100 text-green-700 border-green-300' : ''
                          }`}
                        >
                          {member.role === 'super_admin' || member.role === 'admin' ? (
                            'Admin'
                          ) : (
                            'Voting Member'
                          )}
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
                <div className={`flex-1 ${isEditing ? 'w-full' : 'min-w-0'} space-y-0.5 md:space-y-1`}>
                  {isEditing ? (
                    <>
                      <div className="space-y-2 w-full">
                        <div>
                          <Label htmlFor={`member-name-${member.id}`} className="text-xs text-gray-600">Name *</Label>
                          <Input
                            id={`member-name-${member.id}`}
                            name={`member-name-${member.id}`}
                            autoComplete="name"
                            value={member.name}
                            onChange={(e) => handleMemberChange(member.id, 'name', e.target.value)}
                            placeholder="Full name"
                            className="text-sm h-8 mt-1"
                          />
                        </div>
                        <div>
                          <Label htmlFor={`member-email-${member.id}`} className="text-xs text-gray-600">Email *</Label>
                          <Input
                            id={`member-email-${member.id}`}
                            name={`member-email-${member.id}`}
                            type="email"
                            autoComplete="email"
                            value={member.email}
                            onChange={(e) => handleMemberChange(member.id, 'email', e.target.value)}
                            placeholder="email@example.com"
                            className="text-sm h-8 mt-1"
                          />
                        </div>
                        <div>
                          <Label htmlFor={`member-title-${member.id}`} className="text-xs text-gray-600">Title</Label>
                          <Input
                            id={`member-title-${member.id}`}
                            name={`member-title-${member.id}`}
                            autoComplete="organization-title"
                            value={member.title || ''}
                            onChange={(e) => handleMemberChange(member.id, 'title', e.target.value)}
                            placeholder="Job title"
                            className="text-sm h-8 mt-1"
                          />
                        </div>
                        <div className="flex items-center justify-between pt-1">
                          <div className="flex items-center gap-2">
                            <input
                              id={`member-voting-rep-${member.id}`}
                              name={`member-voting-rep-${member.id}`}
                              type="checkbox"
                              checked={member.isVotingRep || false}
                              onChange={(e) => {
                                const newMembers = formData.members.map(m => ({
                                  ...m,
                                  isVotingRep: m.id === member.id ? e.target.checked : false
                                }));
                                setFormData(prev => ({ ...prev, members: newMembers }));
                              }}
                              className="h-3.5 w-3.5 text-electric-blue focus:ring-electric-blue border-gray-300 rounded"
                            />
                            <Label htmlFor={`member-voting-rep-${member.id}`} className="text-xs text-gray-600 cursor-pointer">
                              Voting Rep
                            </Label>
                          </div>
                          {formData.members.length > 1 && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveMember(member.id)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50 h-6 w-6 p-0"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <h4 className="font-medium text-xs md:text-sm text-gray-900">{member.name}</h4>
                      {member.title && (
                        <p className="text-xs md:text-sm text-gray-600">{member.title}</p>
                      )}
                      <div 
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          window.location.href = `mailto:${member.email}`;
                        }}
                        className="text-xs md:text-sm text-electric-blue hover:underline flex items-center gap-1 md:gap-1.5 cursor-pointer"
                      >
                        <Mail className="h-3 w-3 md:h-4 md:w-4" />
                        <span className="truncate">{member.email}</span>
                      </div>
                    </>
                  )}
                </div>
              </MemberCard>
            );
            })}
          </div>
          {isEditing && (
            <div className="flex justify-between gap-2 pt-4 border-t border-gray-200 mt-4">
              <Button 
                variant="outline" 
                onClick={handleCancel}
                className="border-gray-300 text-gray-700 dark:!text-gray-900 hover:bg-gray-50 hover:text-gray-900 dark:hover:!text-gray-900"
              >
                <X className="h-4 w-4 mr-2 dark:!text-gray-900" />
                <span className="dark:!text-gray-900">Cancel</span>
              </Button>
              <Button 
                onClick={handleSave} 
                className="bg-electric-blue hover:bg-electric-blue/90"
                disabled={isSaving}
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
          )}
        </CardContent>
      </Card>

      {/* Create Organization Post */}
      {formData && (
        <Card className="glass-card floating-hover">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Send className="h-5 w-5 text-electric-blue" />
              Create an Organization Post
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
                  htmlFor="org-post-image-upload"
                  className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-md cursor-pointer hover:bg-gray-50 transition-colors"
                >
                  <Paperclip className="h-4 w-4 text-gray-600 dark:text-white" />
                  <span className="text-sm text-gray-700 dark:text-white">Attach Image</span>
                </label>
                <input
                  id="org-post-image-upload"
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
                onClick={handleCreateOrganizationPost}
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

      {/* Organization Feed */}
      <Card className="glass-card floating-hover">
        <CardHeader className="p-4 md:p-6">
          <CardTitle className="flex items-center gap-2 text-lg">
            <MessageSquare className="h-5 w-5 text-electric-blue" />
            Organization Feed
          </CardTitle>
          <CardDescription>
            Posts and updates from your organization
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
              <p className="text-gray-600">No posts yet. Create your first organization post above!</p>
            </div>
          ) : (
            <div className="w-full md:max-w-2xl space-y-1 md:space-y-4">
              {organizationPosts.map((post) => {
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

