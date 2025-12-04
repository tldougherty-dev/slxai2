import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { PageTitle } from '@/components/PageTitle';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Heart, ThumbsUp, PartyPopper, Lightbulb, HelpCircle, 
  MessageSquare, Share2, MoreVertical, Video, FileText, Link as LinkIcon,
  Trash2, Building2, Send, Loader2, Edit2, Save, X
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getFeedPosts, createPost, getPostComments, addComment, toggleReaction, deletePost, deleteComment, updatePost, FeedPost, PostComment, ReactionType } from '@/data/feed';
import { getCurrentUser } from '@/lib/auth';
import { UserAvatar } from '@/components/UserAvatar';
import { sanitizeText, isValidLength, isValidUrl, isValidYouTubeUrl, isValidVimeoUrl } from '@/lib/security';
import { PostContent } from '@/components/PostContent';
import { WebsitePreview } from '@/components/WebsitePreview';
import { formatDistanceToNow } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { trackPageView } from '@/lib/analytics';
import { useIsLandscape } from '@/hooks/use-mobile';
import { useLanguage } from '@/contexts/LanguageContext';
// Removed useRealtimeUpdates - no auto-refresh, only loads when user visits page
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

const REACTION_ICONS: Record<ReactionType, typeof Heart> = {
  like: ThumbsUp,
  love: Heart,
  celebrate: PartyPopper,
  insightful: Lightbulb,
  curious: HelpCircle,
};

export default function Feed() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { t, translate, language } = useLanguage();
  const user = getCurrentUser();
  const isLandscape = useIsLandscape();
  
  // Reaction labels with translations
  const REACTION_LABELS: Record<ReactionType, string> = {
    like: t('feed.like'),
    love: t('feed.love'),
    celebrate: t('feed.celebrate'),
    insightful: t('feed.insightful'),
    curious: t('feed.curious') || 'Curious',
  };
  
  const [translatedPosts, setTranslatedPosts] = useState<FeedPost[]>([]);
  const [translatedComments, setTranslatedComments] = useState<Record<string, PostComment[]>>({});
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedComments, setExpandedComments] = useState<Set<string>>(new Set());
  const [commentInputs, setCommentInputs] = useState<{ [postId: string]: string }>({});
  const [postToDelete, setPostToDelete] = useState<string | null>(null);
  const [commentToDelete, setCommentToDelete] = useState<string | null>(null);
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState<string>('');
  const [editMediaUrl, setEditMediaUrl] = useState<string | null>(null);
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const commentsEndRefs = useRef<{ [postId: string]: HTMLDivElement | null }>({});
  
  // Helper function to translate text while preserving organization and member names
  const translateTextPreservingNames = async (text: string, orgName?: string, memberName?: string): Promise<string> => {
    if (language === 'en' || !text) {
      return text;
    }
    
    try {
      // Replace names with placeholders before translation
      let textWithPlaceholders = text;
      const placeholders: { [key: string]: string } = {};
      
      if (orgName) {
        const orgPlaceholder = `__ORG_NAME_${Object.keys(placeholders).length}__`;
        placeholders[orgPlaceholder] = orgName;
        textWithPlaceholders = textWithPlaceholders.replace(new RegExp(orgName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi'), orgPlaceholder);
      }
      
      if (memberName) {
        const memberPlaceholder = `__MEMBER_NAME_${Object.keys(placeholders).length}__`;
        placeholders[memberPlaceholder] = memberName;
        textWithPlaceholders = textWithPlaceholders.replace(new RegExp(memberName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi'), memberPlaceholder);
      }
      
      // Translate the text with placeholders
      const translated = await translate(textWithPlaceholders);
      
      if (!translated || translated === textWithPlaceholders) {
        // Translation didn't work, return original
        return text;
      }
      
      // Replace placeholders back with original names
      let result = translated;
      Object.entries(placeholders).forEach(([placeholder, name]) => {
        result = result.replace(new RegExp(placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), name);
      });
      
      return result;
    } catch (error) {
      console.error('Error in translateTextPreservingNames:', error);
      return text; // Return original text on error
    }
  };

  // Load posts
  const loadPosts = async () => {
    setIsLoading(true);
    try {
      const feedPosts = await getFeedPosts();
      // Filter out organization posts unless user belongs to that organization
      const filteredPosts = feedPosts.filter(post => {
        // Show organization posts only if user belongs to that organization
        if (post.postSource === 'organization') {
          return post.organizationId === user?.organizationId;
        }
        // Show all other posts (profile posts)
        return true;
      });
      setPosts(filteredPosts);
      
      // Translate post content
      if (language !== 'en' && filteredPosts.length > 0) {
        console.log('Translating posts for language:', language);
        try {
          const translated = await Promise.all(filteredPosts.map(async (post) => {
            try {
              const translatedContent = await translateTextPreservingNames(
                post.content,
                post.organizationName,
                post.authorName
              );
              console.log('Original:', post.content.substring(0, 50), 'Translated:', translatedContent.substring(0, 50));
              return { ...post, content: translatedContent };
            } catch (error) {
              console.error('Error translating post:', error);
              return post; // Return original if translation fails
            }
          }));
          setTranslatedPosts(translated);
          console.log('Translated posts set:', translated.length);
        } catch (error) {
          console.error('Error in translation batch:', error);
          setTranslatedPosts(filteredPosts);
        }
      } else {
        setTranslatedPosts(filteredPosts);
      }
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Error loading feed:', error);
      }
      toast({
        title: t('feed.error'),
        description: t('feed.failedToLoad'),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Re-translate posts when language changes
  useEffect(() => {
    if (posts.length > 0) {
      const translatePosts = async () => {
        if (language !== 'en') {
          console.log('Language changed, re-translating posts:', language, 'Posts:', posts.length);
          try {
            const translated = await Promise.all(posts.map(async (post) => {
              try {
                const translatedContent = await translateTextPreservingNames(
                  post.content,
                  post.organizationName,
                  post.authorName
                );
                console.log('Post translation:', { 
                  id: post.id, 
                  original: post.content.substring(0, 30), 
                  translated: translatedContent.substring(0, 30) 
                });
                return { ...post, content: translatedContent };
              } catch (error) {
                console.error('Error translating post:', error);
                return post;
              }
            }));
            console.log('Setting translated posts:', translated.length);
            setTranslatedPosts(translated);
          } catch (error) {
            console.error('Error in re-translation:', error);
            setTranslatedPosts(posts);
          }
        } else {
          console.log('Language is English, using original posts');
          setTranslatedPosts(posts);
        }
      };
      translatePosts();
    } else {
      // If no posts, clear translated posts
      setTranslatedPosts([]);
    }
  }, [language, posts.length]);

  useEffect(() => {
    loadPosts();
    trackPageView('/membership-portal/feed', user?.id);
  }, []);

  // Removed auto-refresh - feed only loads when user visits the page
  // Users can manually refresh by reloading the page if needed

  const handleReaction = async (postId: string, reactionType: ReactionType) => {
    try {
      await toggleReaction(postId, reactionType);
      await loadPosts(); // Reload to get updated counts
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
      await loadPosts();
      
      // Scroll to bottom of comments
      setTimeout(() => {
        const ref = commentsEndRefs.current[postId];
        if (ref) {
          ref.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    } catch (error) {
      toast({
        title: "Error",
        description: t('feed.failedToAddComment') || "Failed to add comment. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeletePost = async () => {
    if (!postToDelete) return;
    try {
      await deletePost(postToDelete);
      setPostToDelete(null);
      await loadPosts();
      toast({
        title: t('feed.postDeleted'),
        description: t('feed.postDeletedSuccess') || "The post has been deleted successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: t('feed.failedToDeletePost') || "Failed to delete post. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteComment = async () => {
    if (!commentToDelete) return;
    try {
      await deleteComment(commentToDelete);
      setCommentToDelete(null);
      await loadPosts();
      toast({
        title: t('feed.commentDeleted'),
        description: t('feed.commentDeletedSuccess') || "The comment has been deleted successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: t('feed.failedToDeleteComment') || "Failed to delete comment. Please try again.",
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
        title: t('feed.error'),
        description: t('feed.invalidContent') || "Post content must be between 1 and 2000 characters.",
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
      await loadPosts();
      
      toast({
        title: t('feed.postUpdated'),
        description: t('feed.postUpdatedSuccess') || "Your post has been updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: t('feed.failedToUpdatePost') || "Failed to update post. Please try again.",
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
      // Load comments when expanding if not already loaded
      const post = posts.find(p => p.id === postId);
      if (post && !(post as any).comments) {
        try {
          const comments = await getPostComments(postId);
          const updatedPosts = posts.map(p => {
            if (p.id === postId) {
              return { ...p, comments } as FeedPost & { comments: PostComment[] };
            }
            return p;
          });
          setPosts(updatedPosts);
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
        <Loader2 className="h-8 w-8 animate-spin text-electric-blue" />
      </div>
    );
  }

  return (
    <div className="space-y-0 md:space-y-6">
      <PageTitle title={t('common.globalFeed')} fullWidthLandscape={true} />

      {isLoading ? (
        <Card className="glass-card floating-hover md:mx-auto md:max-w-2xl">
          <CardContent className="py-12 text-center">
            <Loader2 className="h-8 w-8 animate-spin text-electric-blue mx-auto mb-4" />
            <p className="text-gray-600">{t('feed.loading')}</p>
          </CardContent>
        </Card>
      ) : posts.length === 0 ? (
        <Card className="glass-card floating-hover md:mx-auto md:max-w-2xl">
          <CardContent className="py-12 text-center">
            <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('feed.noPosts')}</h3>
            <p className="text-gray-600 mb-4">{t('feed.beFirstToShare') || "Be the first to share something with the community!"}</p>
            <div className="flex flex-col sm:flex-row gap-2 justify-center">
              <Button 
                onClick={() => navigate('/membership-portal/profile')}
                variant="outline"
                className="text-sm"
              >
                {t('feed.createPost')}
              </Button>
              <Button 
                onClick={() => navigate('/membership-portal/discussions')}
                variant="outline"
                className="text-sm"
              >
                {t('feed.joinDiscussions') || "Join Discussions"}
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="w-full max-w-2xl space-y-1 md:space-y-4 md:mx-auto">
          {(translatedPosts.length > 0 ? translatedPosts : posts).map((post) => {
            const postWithComments = posts.find(p => p.id === post.id) as FeedPost & { comments?: PostComment[] };
            const originalComments = expandedComments.has(post.id) ? (postWithComments?.comments || []) : [];
            const comments = translatedComments[post.id] || originalComments;
            const isAuthor = post.authorId === user?.id;
            const canDelete = isAuthor || user?.role === 'admin' || user?.role === 'super_admin';

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
                              {formatDistanceToNow(post.createdAt, { addSuffix: true }).replace(/^about /, '')}
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
                                <span className="text-xs text-gray-500 dark:text-white">· {post.organizationName}</span>
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
                  <div className="mb-2 md:mb-3">
                    {editingPostId === post.id ? (
                      <div className="space-y-3">
                        <Textarea
                          id={`edit-feed-post-${post.id}`}
                          name={`edit-feed-post-${post.id}`}
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
                  <div className="flex items-center gap-2 md:gap-3 py-1 md:py-2 border-t border-gray-200">
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
                            activeColor = 'text-transparent fill-none bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-500 bg-clip-text';
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
                            className={`flex items-center gap-1 md:gap-1.5 px-2 md:px-2.5 py-0.5 md:py-1 rounded-full transition-colors ${
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
                  <div className="border-t border-gray-200 pt-2 md:pt-3">
                    <button
                      onClick={() => toggleComments(post.id)}
                      className="flex items-center gap-2 text-xs md:text-sm text-gray-600 hover:text-gray-900 mb-2 md:mb-3"
                    >
                      <MessageSquare className="h-4 w-4" />
                      <span>{post.commentCount || 0} {t('feed.comments')}</span>
                    </button>

                    {expandedComments.has(post.id) && (
                      <div className="space-y-2 md:space-y-3">
                        {/* Comments List */}
                        {comments.map((comment: PostComment) => {
                          const isCommentAuthor = comment.authorId === user?.id;
                          const canDeleteComment = isCommentAuthor || user?.role === 'admin' || user?.role === 'super_admin';

                          return (
                            <div key={comment.id} className="flex items-start gap-2 md:gap-3 pl-1 md:pl-2">
                              <UserAvatar 
                                email={comment.authorEmail} 
                                name={comment.authorName}
                                size="sm"
                              />
                              <div className="flex-1">
                                <div className="flex items-center gap-1.5 md:gap-2 mb-0.5 md:mb-1">
                                  <p className="font-medium text-xs md:text-sm text-gray-900">{comment.authorName}</p>
                                  <span className="text-xs text-gray-500">
                                    {formatDistanceToNow(comment.createdAt, { addSuffix: true }).replace(/^about /, '')}
                                  </span>
                                </div>
                                <p className="text-xs md:text-sm text-gray-700">{comment.content}</p>
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
                        <div className="flex items-start gap-1.5 md:gap-2 pt-1.5 md:pt-2">
                          <UserAvatar 
                            email={user?.email || ''} 
                            name={user?.name || 'You'}
                            size="sm"
                          />
                          <div className="flex-1 flex gap-1.5 md:gap-2">
                            <Input
                              placeholder={t('feed.addComment')}
                              value={commentInputs[post.id] || ''}
                              onChange={(e) => setCommentInputs({ ...commentInputs, [post.id]: e.target.value })}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                  e.preventDefault();
                                  handleCommentSubmit(post.id);
                                }
                              }}
                              className="text-xs md:text-sm"
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

      {/* Delete Post Confirmation */}
      <AlertDialog open={!!postToDelete} onOpenChange={() => setPostToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
          <AlertDialogTitle>{t('feed.deletePost')}</AlertDialogTitle>
          <AlertDialogDescription>
            {t('feed.deletePostConfirm')}
          </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-gray-300 text-gray-700 hover:bg-gray-50">{t('feed.cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeletePost} className="bg-red-600 hover:bg-red-700">
              {t('feed.delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Comment Confirmation */}
      <AlertDialog open={!!commentToDelete} onOpenChange={() => setCommentToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
          <AlertDialogTitle>{t('feed.deleteComment')}</AlertDialogTitle>
          <AlertDialogDescription>
            {t('feed.deleteCommentConfirm')}
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

