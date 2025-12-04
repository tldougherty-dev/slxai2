import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  Video, Upload, Search, Link as LinkIcon
} from 'lucide-react';
import { useState, useMemo, useEffect } from 'react';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { getOrderedVideos, VideoResource, addVideo } from '@/data/videosOrder';
import { useToast } from '@/hooks/use-toast';
import { 
  isValidYouTubeUrl, 
  isValidVimeoUrl, 
  isValidVideoFile, 
  isValidFileSize, 
  isValidLength,
  sanitizeFilename,
  sanitizeText 
} from '@/lib/security';
import { trackEvent, trackPageView } from '@/lib/analytics';
import { addNotification } from '@/lib/notifications';
import { realtimeManager } from '@/lib/realtime';
import { getCurrentUser } from '@/lib/auth';
import { Breadcrumbs } from '@/components/Breadcrumbs';

// Helper function to extract YouTube video ID from URL
function extractYouTubeVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /youtube\.com\/watch\?.*v=([^&\n?#]+)/,
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }
  return null;
}

// Helper function to extract Vimeo video ID from URL
function extractVimeoVideoId(url: string): string | null {
  const patterns = [
    /vimeo\.com\/(\d+)/,
    /vimeo\.com\/video\/(\d+)/,
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }
  return null;
}

export default function Resources() {
  const { toast } = useToast();
  const user = getCurrentUser();
  const [searchQuery, setSearchQuery] = useState('');
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [uploadType, setUploadType] = useState<'file' | 'link'>('file');
  const [linkUrl, setLinkUrl] = useState('');
  const [videoTitle, setVideoTitle] = useState('');
  const [videoDescription, setVideoDescription] = useState('');
  const [memberVideos, setMemberVideos] = useState<VideoResource[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load videos on mount
  useEffect(() => {
    const loadVideos = async () => {
      setIsLoading(true);
      try {
        const videos = await getOrderedVideos();
        setMemberVideos(videos);
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          console.error('Error loading videos:', error);
        }
        toast({
          title: "Error",
          description: "Failed to load videos. Please refresh the page.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    loadVideos();
  }, []);

  // Track page view
  useEffect(() => {
    trackPageView('/membership-portal/resources', user?.id);
  }, [user?.id]);

  // Track search
  useEffect(() => {
    if (searchQuery) {
      trackEvent({
        type: 'search',
        category: 'videos',
        action: 'search',
        label: searchQuery,
        userId: user?.id,
      });
    }
  }, [searchQuery, user?.id]);

  // Refresh videos
  const refreshVideos = async () => {
    try {
      const videos = await getOrderedVideos();
      setMemberVideos(videos);
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error refreshing videos:', error);
      }
    }
  };

  const filteredVideos = useMemo(() => 
    memberVideos.filter((video) =>
      video.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      video.description?.toLowerCase().includes(searchQuery.toLowerCase())
    ), [memberVideos, searchQuery]
  );

  const handleOpenFileUpload = () => {
    setUploadType('file');
    setShowUploadDialog(true);
  };

  const handleLinkShare = () => {
    setUploadType('link');
    setLinkUrl('');
    setShowUploadDialog(true);
  };

  const handleAddLink = async () => {
    const trimmedUrl = linkUrl.trim();
    if (!trimmedUrl) {
      toast({
        title: "Validation error",
        description: "Please enter a video URL.",
        variant: "destructive",
      });
      return;
    }

    // Validate URL format
    if (!isValidYouTubeUrl(trimmedUrl) && !isValidVimeoUrl(trimmedUrl)) {
      toast({
        title: "Invalid URL",
        description: "Please enter a valid YouTube or Vimeo URL.",
        variant: "destructive",
      });
      return;
    }

    // Validate title and description length
    if (videoTitle && !isValidLength(videoTitle, 0, 200)) {
      toast({
        title: "Validation error",
        description: "Title must be 200 characters or less.",
        variant: "destructive",
      });
      return;
    }

    if (videoDescription && !isValidLength(videoDescription, 0, 1000)) {
      toast({
        title: "Validation error",
        description: "Description must be 1000 characters or less.",
        variant: "destructive",
      });
      return;
    }

    try {
      let videoId: string | null = null;
      let embedUrl = '';
      let platform = '';

      // Try YouTube
      videoId = extractYouTubeVideoId(trimmedUrl);
      if (videoId) {
        embedUrl = `https://www.youtube.com/embed/${videoId}`;
        platform = 'YouTube';
      } else {
        // Try Vimeo
        videoId = extractVimeoVideoId(trimmedUrl);
        if (videoId) {
          embedUrl = `https://player.vimeo.com/video/${videoId}`;
          platform = 'Vimeo';
        }
      }

      if (!videoId) {
        toast({
          title: "Invalid URL",
          description: "Could not extract video ID from URL.",
          variant: "destructive",
        });
        return;
      }

      const newVideo: VideoResource = {
        id: `video-${Date.now()}`,
        name: sanitizeText(videoTitle.trim() || `${platform} Video`),
        type: 'video',
        lastModified: 'Just now',
        uploadedBy: 'You', // In production, use actual user name
        description: videoDescription.trim() ? sanitizeText(videoDescription.trim()) : undefined,
        embedUrl: embedUrl,
      };

      await addVideo(newVideo);
      await refreshVideos();
      
      toast({
        title: "Video added",
        description: "The video has been added successfully.",
      });

      setShowUploadDialog(false);
      setLinkUrl('');
      setVideoTitle('');
      setVideoDescription('');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add video. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type by extension (more secure than MIME type)
    if (!isValidVideoFile(file)) {
      toast({
        title: "Invalid file type",
        description: "Please upload a valid video file (MP4, MOV, AVI, WebM, or MKV).",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 100MB)
    if (!isValidFileSize(file, 100)) {
      toast({
        title: "File too large",
        description: "File size must be 100MB or less.",
        variant: "destructive",
      });
      return;
    }

    // Validate description length
    if (videoDescription && !isValidLength(videoDescription, 0, 1000)) {
      toast({
        title: "Validation error",
        description: "Description must be 1000 characters or less.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Sanitize filename
      const sanitizedName = sanitizeFilename(file.name);
      
      // In production, upload to server and get URL
      // For now, create a placeholder
      const newVideo: VideoResource = {
        id: `video-${Date.now()}`,
        name: sanitizedName,
        type: 'video',
        lastModified: 'Just now',
        uploadedBy: 'You',
        description: videoDescription.trim() ? sanitizeText(videoDescription.trim()) : undefined,
        embedUrl: URL.createObjectURL(file), // Temporary local URL - in production, use server URL
      };

      await addVideo(newVideo);
      await refreshVideos();
      
      // Track analytics
      trackEvent({
        type: 'file_upload',
        category: 'videos',
        action: 'video_uploaded',
        label: videoTitle || file.name,
        userId: user?.id,
      });

      // Trigger real-time update
      realtimeManager.triggerUpdate({
        type: 'video',
        id: newVideo.id,
        action: 'created',
        data: newVideo,
        timestamp: new Date(),
      });

      // Send notification
      await addNotification({
        type: 'file',
        title: 'New video uploaded',
        message: `${videoTitle || file.name} has been uploaded`,
        userId: user?.id,
        link: '/membership-portal/resources',
      });
      
      toast({
        title: "Video uploaded",
        description: "The video has been uploaded successfully.",
      });

      setShowUploadDialog(false);
      setVideoTitle('');
      setVideoDescription('');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to upload video. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <Breadcrumbs
        segments={[
          { title: 'Membership Portal', href: '/membership-portal' },
          { title: 'Resources', href: '/membership-portal/resources' },
        ]}
      />
      <Card className="glass-card">
        <CardContent className="pt-1 pb-4">
          <h1 className="text-4xl font-bold text-gray-900 text-center">Videos</h1>
        </CardContent>
      </Card>
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleLinkShare}>
            <LinkIcon className="h-4 w-4 mr-2" />
            Share Link
          </Button>
          <Button size="sm" className="bg-electric-blue hover:bg-blue-600" onClick={handleOpenFileUpload}>
            <Upload className="h-4 w-4 mr-2" />
            Upload Video
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search videos..."
          className="pl-10"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Videos Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredVideos.map((video) => (
          <Card key={video.id} className="glass-card floating-hover">
            <CardContent className="p-4">
              <div className="space-y-3">
                <AspectRatio ratio={16 / 9} className="bg-gray-100 rounded-lg overflow-hidden">
                  <iframe
                    src={video.embedUrl}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    title={video.name}
                    sandbox="allow-scripts allow-same-origin allow-presentation"
                    loading="lazy"
                  />
                </AspectRatio>
                <div>
                  <h3 className="font-semibold text-sm text-gray-900 mb-1">{video.name}</h3>
                  {video.description && (
                    <p className="text-xs text-gray-600 mb-2">{video.description}</p>
                  )}
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span>{video.lastModified}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      {filteredVideos.length === 0 && (
        <Card className="glass-card mt-4">
          <CardContent className="py-12 text-center">
            <Video className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">
              {searchQuery ? 'No videos found matching your search' : 'No videos yet. Start sharing!'}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Upload Dialog */}
      <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
        <DialogContent className="bg-white border-gray-200">
          <DialogHeader>
            <DialogTitle className="text-gray-900">{uploadType === 'link' ? 'Share a Video Link' : 'Upload Video'}</DialogTitle>
            <DialogDescription className="text-gray-600">
              {uploadType === 'link' 
                ? 'Share a YouTube, Vimeo, or other video link. We\'ll automatically embed it.'
                : 'Upload a video file or share a video link.'}
            </DialogDescription>
          </DialogHeader>
          {uploadType === 'link' ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-900">Video URL *</label>
                <Input
                  placeholder="https://youtube.com/watch?v=... or https://vimeo.com/..."
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  className="bg-white text-gray-900 border-gray-300"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-900">Title (optional)</label>
                <Input
                  placeholder="Video title"
                  value={videoTitle}
                  onChange={(e) => setVideoTitle(e.target.value)}
                  className="bg-white text-gray-900 border-gray-300"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-900">Description (optional)</label>
                <textarea
                  placeholder="Video description"
                  value={videoDescription}
                  onChange={(e) => setVideoDescription(e.target.value)}
                  className="w-full min-h-[80px] px-3 py-2 bg-white text-gray-900 border border-gray-300 rounded-md"
                  rows={3}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setShowUploadDialog(false);
                    setLinkUrl('');
                    setVideoTitle('');
                    setVideoDescription('');
                  }}
                  className="border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </Button>
                <Button 
                  className="bg-electric-blue hover:bg-blue-600 text-white"
                  onClick={handleAddLink}
                  disabled={!linkUrl.trim()}
                >
                  Share Link
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-900">Video File *</label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center bg-gray-50">
                  <Upload className="h-8 w-8 text-gray-600 mx-auto mb-2" />
                  <p className="text-sm text-gray-700 mb-4">Drag and drop video files here, or click to browse</p>
                  <input
                    type="file"
                    accept="video/*"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="video-upload"
                  />
                  <label htmlFor="video-upload">
                    <Button variant="outline" size="sm" className="border-gray-300 text-gray-700 hover:bg-gray-100 cursor-pointer" asChild>
                      <span>Select Video</span>
                    </Button>
                  </label>
                  <p className="text-xs text-gray-600 mt-2">
                    Supports: MP4, MOV, AVI, and video links from YouTube, Vimeo, etc.
                  </p>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-900">Description (optional)</label>
                <textarea
                  placeholder="Video description"
                  value={videoDescription}
                  onChange={(e) => setVideoDescription(e.target.value)}
                  className="w-full min-h-[80px] px-3 py-2 bg-white text-gray-900 border border-gray-300 rounded-md"
                  rows={3}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setShowUploadDialog(false);
                    setVideoTitle('');
                    setVideoDescription('');
                  }}
                  className="border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
