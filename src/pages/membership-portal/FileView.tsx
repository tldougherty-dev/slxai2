import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Download, FileText, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getOrderedFiles, FileResource } from '@/data/filesOrder';
import { supabase } from '@/lib/supabase';
import { useIsMobile, useIsLandscape } from '@/hooks/use-mobile';
import { PageTitle } from '@/components/PageTitle';
import { useTheme } from '@/contexts/ThemeContext';
import { ACADEMY_FILES_TAB_URL } from '@/lib/academyLibraryPaths';

export default function FileView() {
  const { fileId } = useParams<{ fileId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const isLandscape = useIsLandscape();
  const { theme } = useTheme();
  const [file, setFile] = useState<FileResource | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [previewError, setPreviewError] = useState(false);
  const [actualFileSize, setActualFileSize] = useState<string | null>(null);
  const [isLoadingPreview, setIsLoadingPreview] = useState(true);
  const [useGoogleDocsViewer, setUseGoogleDocsViewer] = useState(false);

  useEffect(() => {
    let previewTimeout: NodeJS.Timeout;
    
    const loadFile = async () => {
      if (!fileId) {
        navigate(ACADEMY_FILES_TAB_URL);
        return;
      }

      setIsLoading(true);
      try {
        const files = await getOrderedFiles();
        const foundFile = files.find(f => f.id === fileId);
        
        if (!foundFile) {
          toast({
            title: "File not found",
            description: "The requested file could not be found.",
            variant: "destructive",
          });
          navigate(ACADEMY_FILES_TAB_URL);
          return;
        }
        
        setFile(foundFile);
        setIsLoadingPreview(true);
        setPreviewError(false);
        setUseGoogleDocsViewer(false); // Reset viewer preference when file changes
        
        // Set timeout to hide loading spinner after 10 seconds
        previewTimeout = setTimeout(() => {
          setIsLoadingPreview(false);
        }, 10000);
        
        // Fetch actual file size from Supabase Storage
        if (foundFile.fileUrl) {
          try {
            // Extract file path from URL
            const url = new URL(foundFile.fileUrl);
            const pathParts = url.pathname.split('/');
            const bucket = 'files';
            const filePath = pathParts.slice(pathParts.indexOf(bucket) + 1).join('/');
            
            // Get file metadata from storage
            const { data: fileData, error: fileError } = await supabase.storage
              .from(bucket)
              .list(filePath.split('/').slice(0, -1).join('/'), {
                limit: 1,
                search: filePath.split('/').pop(),
              });
            
            if (!fileError && fileData && fileData.length > 0) {
              const sizeBytes = fileData[0].metadata?.size || 0;
              if (sizeBytes > 0) {
                // Format file size
                const sizeMB = (sizeBytes / 1024 / 1024).toFixed(2);
                const sizeKB = (sizeBytes / 1024).toFixed(2);
                const formattedSize = sizeBytes >= 1024 * 1024 
                  ? `${sizeMB} MB` 
                  : `${sizeKB} KB`;
                setActualFileSize(formattedSize);
              }
            }
          } catch (sizeError) {
            if (process.env.NODE_ENV === 'development') {
              console.error('Error fetching file size:', sizeError);
            }
            // Fallback: try to get size from HEAD request
            if (foundFile.fileUrl) {
              try {
                const response = await fetch(foundFile.fileUrl, { method: 'HEAD' });
                const contentLength = response.headers.get('content-length');
                if (contentLength) {
                  const sizeBytes = parseInt(contentLength, 10);
                  const sizeMB = (sizeBytes / 1024 / 1024).toFixed(2);
                  const sizeKB = (sizeBytes / 1024).toFixed(2);
                  const formattedSize = sizeBytes >= 1024 * 1024 
                    ? `${sizeMB} MB` 
                    : `${sizeKB} KB`;
                  setActualFileSize(formattedSize);
                }
              } catch (headError) {
                if (process.env.NODE_ENV === 'development') {
                  console.error('Error fetching file size from HEAD:', headError);
                }
              }
            }
          }
        }
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          console.error('Error loading file:', error);
        }
        toast({
          title: "Error",
          description: "Failed to load file. Please try again.",
          variant: "destructive",
        });
        navigate(ACADEMY_FILES_TAB_URL);
      } finally {
        setIsLoading(false);
      }
    };

    loadFile();
    
    // Cleanup function
    return () => {
      if (previewTimeout) {
        clearTimeout(previewTimeout);
      }
    };
  }, [fileId, navigate, toast]);

  const handleDownload = () => {
    if (file?.fileUrl) {
      // SECURITY: Open file URL in new tab with noopener for download
      const downloadWindow = window.open(file.fileUrl, '_blank', 'noopener,noreferrer');
      if (!downloadWindow) {
        // Fallback if popup blocked
        window.location.href = file.fileUrl;
      }
      toast({
        title: "Download started",
        description: `Downloading ${file.name}...`,
      });
    } else {
      toast({
        title: "Download unavailable",
        description: "File URL not found.",
        variant: "destructive",
      });
    }
  };

  const getPreviewUrl = (useGoogleDocs = false) => {
    if (!file?.fileUrl) {
      return null;
    }

    // Extract file extension from the actual file URL, not the display name
    const urlPath = new URL(file.fileUrl).pathname;
    const urlFileName = urlPath.split('/').pop() || '';
    const fileExtension = urlFileName.split('.').pop()?.toLowerCase() || '';
    const encodedUrl = encodeURIComponent(file.fileUrl);
    
    // PDF files - use Google Docs Viewer for better compatibility
    if (fileExtension === 'pdf' || file.type === 'document' && urlFileName.toLowerCase().includes('.pdf')) {
      return `https://docs.google.com/viewer?url=${encodedUrl}&embedded=true`;
    }
    
    // DOCX/DOC files - use Google Docs Viewer or Office Online Viewer
    if (fileExtension === 'docx' || fileExtension === 'doc' || (file.type === 'document' && (urlFileName.toLowerCase().includes('.docx') || urlFileName.toLowerCase().includes('.doc')))) {
      if (useGoogleDocs) {
        return `https://docs.google.com/viewer?url=${encodedUrl}&embedded=true`;
      }
      // Office Online Viewer
      return `https://view.officeapps.live.com/op/embed.aspx?src=${encodedUrl}`;
    }
    
    // PPT/PPTX files - use Google Docs Viewer or Office Online Viewer
    if (fileExtension === 'ppt' || fileExtension === 'pptx' || (file.type === 'document' && (urlFileName.toLowerCase().includes('.ppt') || urlFileName.toLowerCase().includes('.pptx')))) {
      if (useGoogleDocs) {
        return `https://docs.google.com/viewer?url=${encodedUrl}&embedded=true`;
      }
      return `https://view.officeapps.live.com/op/embed.aspx?src=${encodedUrl}`;
    }
    
    // XLS/XLSX files - use Google Docs Viewer or Office Online Viewer
    if (fileExtension === 'xls' || fileExtension === 'xlsx' || file.type === 'spreadsheet') {
      if (useGoogleDocs) {
        return `https://docs.google.com/viewer?url=${encodedUrl}&embedded=true`;
      }
      return `https://view.officeapps.live.com/op/embed.aspx?src=${encodedUrl}`;
    }
    
    // Images
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(fileExtension)) {
      return file.fileUrl;
    }
    
    return null;
  };

  const renderPreview = () => {
    if (!file?.fileUrl) {
      return (
        <div className="flex flex-col items-center justify-center py-12 text-gray-500">
          <FileText className="h-12 w-12 mb-4 text-gray-400" />
          <p>No preview available</p>
          <p className="text-sm mt-2">File URL not found. Please download the file to view it.</p>
        </div>
      );
    }

    // Extract file extension from the actual file URL, not the display name
    const urlPath = new URL(file.fileUrl).pathname;
    const urlFileName = urlPath.split('/').pop() || '';
    const fileExtension = urlFileName.split('.').pop()?.toLowerCase() || '';
    const urlFileNameLower = urlFileName.toLowerCase();
    
    // Get preview URL for all file types
    const previewUrl = getPreviewUrl(useGoogleDocsViewer);
    
    // DOCX/DOC files - use Office Online Viewer or Google Docs Viewer
    if (fileExtension === 'docx' || fileExtension === 'doc' || urlFileNameLower.includes('.docx') || urlFileNameLower.includes('.doc')) {
      return (
        <div className="w-full flex-1 flex flex-col min-h-0" style={{ position: 'relative', overflow: 'auto' }}>
          {isLoadingPreview && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-50 z-10 px-4">
              <Loader2 className="h-6 w-6 md:h-8 md:w-8 animate-spin text-electric-blue" />
              <span className="ml-2 text-xs md:text-sm text-gray-600 mt-2 text-center">Loading document preview...</span>
            </div>
          )}
          {previewError || !previewUrl ? (
            <div className="flex flex-col items-center justify-center py-8 md:py-12 text-gray-500 h-full px-4">
              <FileText className="h-10 w-10 md:h-12 md:w-12 mb-4 text-gray-400" />
              <p className="font-medium mb-2 text-sm md:text-base">Preview could not be loaded</p>
              <p className="text-xs md:text-sm text-center mb-4 max-w-md">
                {useGoogleDocsViewer 
                  ? 'Unable to load document preview with Google Docs Viewer. The file may need to be publicly accessible.'
                  : 'Unable to load document preview. Trying alternative viewer...'}
              </p>
              {!useGoogleDocsViewer && (
                <Button 
                  onClick={() => {
                    setUseGoogleDocsViewer(true);
                    setPreviewError(false);
                    setIsLoadingPreview(true);
                  }}
                  variant="outline"
                  className="mt-2 text-xs md:text-sm"
                  size={isMobile ? 'sm' : 'default'}
                >
                  Try Google Docs Viewer
                </Button>
              )}
              <div className={`flex ${isMobile ? 'flex-col' : 'flex-row'} gap-2 mt-4 w-full ${isMobile ? 'max-w-xs' : ''}`}>
                <Button 
                  onClick={() => {
                    const newWindow = window.open(file.fileUrl, '_blank', 'noopener,noreferrer');
                    if (!newWindow) {
                      window.location.href = file.fileUrl || '';
                    }
                  }} 
                  variant="outline"
                  className={isMobile ? 'w-full' : ''}
                  size={isMobile ? 'sm' : 'default'}
                >
                  Open in New Tab
                </Button>
                <Button onClick={handleDownload} className={isMobile ? 'w-full' : ''} size={isMobile ? 'sm' : 'default'}>
                  <Download className="h-4 w-4 mr-2" />
                  Download File
                </Button>
              </div>
            </div>
          ) : (
            <iframe
              src={previewUrl}
              className="w-full border-0 flex-1"
              style={{ 
                minHeight: '100%',
                display: isLoadingPreview ? 'none' : 'block',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                ...(theme === 'dark' ? {
                  filter: 'invert(1) hue-rotate(180deg)',
                  backgroundColor: '#ffffff'
                } : {})
              }}
              title="Document Preview"
              onLoad={() => setIsLoadingPreview(false)}
              onError={() => {
                setIsLoadingPreview(false);
                if (!useGoogleDocsViewer) {
                  // Try Google Docs Viewer as fallback
                  setUseGoogleDocsViewer(true);
                  setIsLoadingPreview(true);
                } else {
                  setPreviewError(true);
                }
              }}
              sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-modals"
              allow="fullscreen"
            />
          )}
        </div>
      );
    }
    
    // PPT/PPTX files - use Office Online Viewer or Google Docs Viewer
    if (fileExtension === 'ppt' || fileExtension === 'pptx' || urlFileNameLower.includes('.ppt') || urlFileNameLower.includes('.pptx')) {
      return (
        <div className="w-full flex-1 flex flex-col min-h-0" style={{ position: 'relative', overflow: 'auto' }}>
          {isLoadingPreview && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-50 z-10 px-4">
              <Loader2 className="h-6 w-6 md:h-8 md:w-8 animate-spin text-electric-blue" />
              <span className="ml-2 text-xs md:text-sm text-gray-600 mt-2 text-center">Loading PowerPoint preview...</span>
            </div>
          )}
          {previewError || !previewUrl ? (
            <div className="flex flex-col items-center justify-center py-8 md:py-12 text-gray-500 h-full px-4">
              <FileText className="h-10 w-10 md:h-12 md:w-12 mb-4 text-gray-400" />
              <p className="font-medium mb-2 text-sm md:text-base">Preview could not be loaded</p>
              <p className="text-xs md:text-sm text-center mb-4 max-w-md">
                {useGoogleDocsViewer 
                  ? 'Unable to load PowerPoint preview with Google Docs Viewer. The file may need to be publicly accessible.'
                  : 'Unable to load PowerPoint preview. Trying alternative viewer...'}
              </p>
              {!useGoogleDocsViewer && (
                <Button 
                  onClick={() => {
                    setUseGoogleDocsViewer(true);
                    setPreviewError(false);
                    setIsLoadingPreview(true);
                  }}
                  variant="outline"
                  className="mt-2 text-xs md:text-sm"
                  size={isMobile ? 'sm' : 'default'}
                >
                  Try Google Docs Viewer
                </Button>
              )}
              <div className={`flex ${isMobile ? 'flex-col' : 'flex-row'} gap-2 mt-4 w-full ${isMobile ? 'max-w-xs' : ''}`}>
                <Button 
                  onClick={() => {
                    const newWindow = window.open(file.fileUrl, '_blank', 'noopener,noreferrer');
                    if (!newWindow) {
                      window.location.href = file.fileUrl || '';
                    }
                  }} 
                  variant="outline"
                  className={isMobile ? 'w-full' : ''}
                  size={isMobile ? 'sm' : 'default'}
                >
                  Open in New Tab
                </Button>
                <Button onClick={handleDownload} className={isMobile ? 'w-full' : ''} size={isMobile ? 'sm' : 'default'}>
                  <Download className="h-4 w-4 mr-2" />
                  Download File
                </Button>
              </div>
            </div>
          ) : (
            <iframe
              src={previewUrl}
              className="w-full border-0 flex-1"
              style={{ 
                minHeight: '100%',
                display: isLoadingPreview ? 'none' : 'block',
                border: '1px solid #e5e7eb',
                borderRadius: '8px'
              }}
              title={`Preview of ${file.name}`}
              onError={() => {
                setIsLoadingPreview(false);
                if (!useGoogleDocsViewer) {
                  // Try Google Docs Viewer as fallback
                  setUseGoogleDocsViewer(true);
                  setIsLoadingPreview(true);
                } else {
                  setPreviewError(true);
                }
              }}
              onLoad={() => {
                setPreviewError(false);
                setIsLoadingPreview(false);
              }}
              sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-modals"
              allow="fullscreen"
            />
          )}
        </div>
      );
    }
    
    // XLS/XLSX files - use Office Online Viewer or Google Docs Viewer
    if (fileExtension === 'xls' || fileExtension === 'xlsx' || file.type === 'spreadsheet') {
      return (
        <div className="w-full flex-1 flex flex-col min-h-0" style={{ position: 'relative', overflow: 'auto' }}>
          {isLoadingPreview && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-50 z-10 px-4">
              <Loader2 className="h-6 w-6 md:h-8 md:w-8 animate-spin text-electric-blue" />
              <span className="ml-2 text-xs md:text-sm text-gray-600 mt-2 text-center">Loading spreadsheet preview...</span>
            </div>
          )}
          {previewError || !previewUrl ? (
            <div className="flex flex-col items-center justify-center py-8 md:py-12 text-gray-500 h-full px-4">
              <FileText className="h-10 w-10 md:h-12 md:w-12 mb-4 text-gray-400" />
              <p className="font-medium mb-2 text-sm md:text-base">Preview could not be loaded</p>
              <p className="text-xs md:text-sm text-center mb-4 max-w-md">
                {useGoogleDocsViewer 
                  ? 'Unable to load spreadsheet preview with Google Docs Viewer. The file may need to be publicly accessible.'
                  : 'Unable to load spreadsheet preview. Trying alternative viewer...'}
              </p>
              {!useGoogleDocsViewer && (
                <Button 
                  onClick={() => {
                    setUseGoogleDocsViewer(true);
                    setPreviewError(false);
                    setIsLoadingPreview(true);
                  }}
                  variant="outline"
                  className="mt-2 text-xs md:text-sm"
                  size={isMobile ? 'sm' : 'default'}
                >
                  Try Google Docs Viewer
                </Button>
              )}
              <div className={`flex ${isMobile ? 'flex-col' : 'flex-row'} gap-2 mt-4 w-full ${isMobile ? 'max-w-xs' : ''}`}>
                <Button 
                  onClick={() => {
                    const newWindow = window.open(file.fileUrl, '_blank', 'noopener,noreferrer');
                    if (!newWindow) {
                      window.location.href = file.fileUrl || '';
                    }
                  }} 
                  variant="outline"
                  className={isMobile ? 'w-full' : ''}
                  size={isMobile ? 'sm' : 'default'}
                >
                  Open in New Tab
                </Button>
                <Button onClick={handleDownload} className={isMobile ? 'w-full' : ''} size={isMobile ? 'sm' : 'default'}>
                  <Download className="h-4 w-4 mr-2" />
                  Download File
                </Button>
              </div>
            </div>
          ) : (
            <iframe
              src={previewUrl}
              className="w-full border-0 flex-1"
              style={{ 
                minHeight: '100%',
                display: isLoadingPreview ? 'none' : 'block',
                border: '1px solid #e5e7eb',
                borderRadius: '8px'
              }}
              title={`Preview of ${file.name}`}
              onError={() => {
                setIsLoadingPreview(false);
                if (!useGoogleDocsViewer) {
                  // Try Google Docs Viewer as fallback
                  setUseGoogleDocsViewer(true);
                  setIsLoadingPreview(true);
                } else {
                  setPreviewError(true);
                }
              }}
              onLoad={() => {
                setPreviewError(false);
                setIsLoadingPreview(false);
              }}
              sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-modals"
              allow="fullscreen"
            />
          )}
        </div>
      );
    }
    
    // PDF files - use iframe
    if (fileExtension === 'pdf' || urlFileNameLower.includes('.pdf')) {
      return (
        <div className="w-full flex-1 flex flex-col min-h-0" style={{ position: 'relative', overflow: 'auto' }}>
          {isLoadingPreview && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-50 z-10 px-4">
              <Loader2 className="h-6 w-6 md:h-8 md:w-8 animate-spin text-electric-blue" />
              <span className="ml-2 text-xs md:text-sm text-gray-600 mt-2 text-center">Loading preview...</span>
            </div>
          )}
          {previewError ? (
            <div className="flex flex-col items-center justify-center py-8 md:py-12 text-gray-500 h-full px-4">
              <FileText className="h-10 w-10 md:h-12 md:w-12 mb-4 text-gray-400" />
              <p className="font-medium mb-2 text-sm md:text-base">Preview could not be loaded</p>
              <p className="text-xs md:text-sm text-center mb-4 max-w-md">
                This may be due to CORS restrictions or file access permissions.
              </p>
              <div className={`flex ${isMobile ? 'flex-col' : 'flex-row'} gap-2 w-full ${isMobile ? 'max-w-xs' : ''}`}>
                <Button 
                  onClick={() => {
                    const newWindow = window.open(file.fileUrl, '_blank', 'noopener,noreferrer');
                    if (!newWindow) {
                      window.location.href = file.fileUrl || '';
                    }
                  }} 
                  variant="outline"
                  className={isMobile ? 'w-full mt-2' : 'mt-2'}
                  size={isMobile ? 'sm' : 'default'}
                >
                  Open in New Tab
                </Button>
                <Button onClick={handleDownload} className={isMobile ? 'w-full mt-2' : 'mt-2'} size={isMobile ? 'sm' : 'default'}>
                  <Download className="h-4 w-4 mr-2" />
                  Download File
                </Button>
              </div>
            </div>
          ) : (
            <iframe
              src={previewUrl}
              className="w-full border-0 flex-1"
              style={{ 
                minHeight: '100%',
                display: isLoadingPreview ? 'none' : 'block',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                width: '100%',
                height: '100%'
              }}
              title={`Preview of ${file.name}`}
              onError={() => {
                setPreviewError(true);
                setIsLoadingPreview(false);
              }}
              onLoad={() => {
                setPreviewError(false);
                setIsLoadingPreview(false);
              }}
              sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-modals"
              allow="fullscreen"
            />
          )}
        </div>
      );
    }

    // Images
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(fileExtension)) {
      return (
        <div className="flex items-center justify-center p-8">
          <img
            src={file.fileUrl}
            alt={file.name}
            className="max-w-full max-h-[80vh] object-contain"
            onError={() => setPreviewError(true)}
          />
        </div>
      );
    }

    // Fallback for unsupported file types
    return (
      <div className="flex flex-col items-center justify-center py-12 text-gray-500">
        <FileText className="h-12 w-12 mb-4 text-gray-400" />
        <p className="font-medium mb-2">Preview not available for this file type</p>
        <p className="text-sm mt-2 mb-4">Please download the file to view it.</p>
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-4 p-3 bg-gray-100 rounded text-xs text-left max-w-md">
            <p><strong>Debug Info:</strong></p>
            <p>File Name: {file.name}</p>
            <p>File Extension: {fileExtension || 'none'}</p>
            <p>File Type: {file.type || 'unknown'}</p>
            <p>File URL: {file.fileUrl ? 'Present' : 'Missing'}</p>
          </div>
        )}
        <Button onClick={handleDownload} className="mt-4">
          <Download className="h-4 w-4 mr-2" />
          Download File
        </Button>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-electric-blue" />
      </div>
    );
  }

  if (!file) {
    return null;
  }

  return (
    <div className="space-y-0 md:space-y-3">
      {/* Page Title Box */}
      <PageTitle 
        title="Files"
        leftContent={
          <Button
            onClick={() => navigate(ACADEMY_FILES_TAB_URL)}
            variant="outline"
            size="sm"
            className="gap-2 border-gray-300 text-gray-700 dark:!text-gray-900 hover:bg-gray-50 hover:text-gray-900 dark:hover:!text-gray-900 bg-white text-xs md:text-sm ml-6"
          >
            <ArrowLeft className="h-3 w-3 md:h-4 md:w-4 dark:!text-gray-900" />
            <span className="hidden sm:inline dark:!text-gray-900">Back</span>
          </Button>
        }
      />

      {/* File Title - Under PageTitle */}
      <div className="pt-3 md:pt-6 flex flex-col" style={{ height: isMobile ? (isLandscape ? 'calc(100dvh - 6rem)' : 'calc(100dvh - 44px)') : 'calc(100dvh - 80px)' }}>
        <div className="mb-3 flex-shrink-0 text-center">
          <h1 className="text-lg md:text-xl font-semibold text-gray-900 dark:text-white break-words">{file.name}</h1>
          {file.description && (
            <p className="text-xs md:text-sm text-gray-600 dark:text-white mt-1 break-words">{file.description}</p>
          )}
        </div>

        {/* File Info */}
        <Card className="glass-card mb-3 flex-shrink-0">
          <CardContent className="py-3 px-4">
            <div className="flex justify-between items-center text-sm">
              {file.fileYear && (
                <div>
                  <p className="text-gray-500 dark:text-white text-xs">Published</p>
                  <p className="font-medium text-gray-900 dark:text-white text-sm">
                    {file.fileMonth 
                      ? `${new Date(2000, file.fileMonth - 1).toLocaleString('default', { month: 'long' })} ${file.fileYear}`
                      : file.fileYear}
                  </p>
                </div>
              )}
              {!file.fileYear && (
                <div>
                  <p className="text-gray-500 dark:text-white text-xs">Published</p>
                  <p className="font-medium text-gray-900 dark:text-white text-sm">Not specified</p>
                </div>
              )}
              <div className="text-center">
                <p className="text-gray-500 dark:text-white text-xs">Uploaded by</p>
                <p className="font-medium text-gray-900 dark:text-white text-sm">{file.uploadedBy}</p>
              </div>
              <div>
                <Button onClick={handleDownload} size="sm" className="gap-2 text-xs md:text-sm">
                  <Download className="h-3 w-3 md:h-4 md:w-4" />
                  <span className="hidden sm:inline">Download</span>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Preview */}
        <Card className="glass-card flex-1 flex flex-col min-h-0">
          <CardContent className="p-0 md:p-0 overflow-hidden flex-1 flex flex-col min-h-0">
            {renderPreview()}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

