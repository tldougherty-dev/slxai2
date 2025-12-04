// Utility functions for URL detection and preview generation

export interface URLPreview {
  url: string;
  type: 'youtube' | 'vimeo' | 'pdf' | 'document' | 'website';
  videoId?: string; // For YouTube/Vimeo
  title?: string;
  description?: string;
  thumbnail?: string;
  image?: string; // For website previews
  siteName?: string; // For website previews
  isLoading?: boolean; // Loading state for async fetching
}

// Detect URLs in text
export function detectURLs(text: string): string[] {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const matches = text.match(urlRegex);
  return matches || [];
}

// Extract YouTube video ID from URL
export function extractYouTubeVideoId(url: string): string | null {
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

// Extract Vimeo video ID from URL
export function extractVimeoVideoId(url: string): string | null {
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

// Check if URL is a PDF or document
export function isDocumentUrl(url: string): boolean {
  const documentExtensions = ['.pdf', '.doc', '.docx', '.ppt', '.pptx', '.xls', '.xlsx'];
  const lowerUrl = url.toLowerCase();
  return documentExtensions.some(ext => lowerUrl.includes(ext));
}

// Generate URL preview
export function generateURLPreview(url: string): URLPreview {
  // Check for YouTube
  const youtubeId = extractYouTubeVideoId(url);
  if (youtubeId) {
    return {
      url,
      type: 'youtube',
      videoId: youtubeId,
      thumbnail: `https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg`,
    };
  }

  // Check for Vimeo
  const vimeoId = extractVimeoVideoId(url);
  if (vimeoId) {
    return {
      url,
      type: 'vimeo',
      videoId: vimeoId,
    };
  }

  // Check for PDF/Document
  if (isDocumentUrl(url)) {
    return {
      url,
      type: url.toLowerCase().includes('.pdf') ? 'pdf' : 'document',
    };
  }

  // Default to website
  return {
    url,
    type: 'website',
  };
}

// Fetch website metadata using Microlink.io (free, no API key required)
export async function fetchWebsiteMetadata(url: string): Promise<Partial<URLPreview>> {
  try {
    // Use Microlink.io API (free tier, no auth required for basic usage)
    const apiUrl = `https://api.microlink.io/?url=${encodeURIComponent(url)}`;
    
    const response = await fetch(apiUrl);
    if (!response.ok) {
      throw new Error('Failed to fetch metadata');
    }
    
    const data = await response.json();
    
    return {
      title: data.data?.title || '',
      description: data.data?.description || '',
      image: data.data?.image?.url || '',
      siteName: data.data?.publisher || new URL(url).hostname,
    };
  } catch (error) {
    // Fallback: Try to get screenshot using screenshot API service
    try {
      // Use a free screenshot service (you may want to use your own backend for this)
      const screenshotUrl = `https://image.thum.io/get/width/1280/crop/720/${encodeURIComponent(url)}`;
      
      return {
        title: new URL(url).hostname,
        description: '',
        image: screenshotUrl,
        siteName: new URL(url).hostname,
      };
    } catch (screenshotError) {
      // Final fallback: return basic info
      const hostname = new URL(url).hostname.replace('www.', '');
      return {
        title: hostname,
        description: '',
        image: '',
        siteName: hostname,
      };
    }
  }
}

// Get all URL previews from text (async version for website metadata)
export async function getURLPreviewsAsync(text: string): Promise<URLPreview[]> {
  const urls = detectURLs(text);
  const previews = urls.map(url => generateURLPreview(url));
  
  // Fetch metadata for website URLs
  const websitePreviews = previews.filter(p => p.type === 'website');
  const metadataPromises = websitePreviews.map(async (preview) => {
    const metadata = await fetchWebsiteMetadata(preview.url);
    return { ...preview, ...metadata };
  });
  
  const updatedWebsitePreviews = await Promise.all(metadataPromises);
  
  // Replace website previews with updated ones
  return previews.map(preview => {
    if (preview.type === 'website') {
      const updated = updatedWebsitePreviews.find(p => p.url === preview.url);
      return updated || preview;
    }
    return preview;
  });
}

// Get all URL previews from text (synchronous version - for initial render)
export function getURLPreviews(text: string): URLPreview[] {
  const urls = detectURLs(text);
  return urls.map(url => generateURLPreview(url));
}

