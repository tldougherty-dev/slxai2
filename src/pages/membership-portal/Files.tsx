import { Card, CardContent } from '@/components/ui/card';
import { PageTitle } from '@/components/PageTitle';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { 
  FileText, Upload, Download, Trash2, Save, 
  FileSpreadsheet, BookOpen, File, X, Loader2, Eye, Plus
} from 'lucide-react';
import { Label } from '@/components/ui/label';
import { useState, useMemo, useRef, useEffect } from 'react';
import { 
  getOrderedFiles, 
  FileResource, 
  ResourceType,
  getCategories,
  getCategoryById,
  updateFile,
  addFile,
} from '@/data/filesOrder';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Folder } from 'lucide-react';
import { sanitizeText, isValidLength, sanitizeFilename } from '@/lib/security';
import { addActivity } from '@/lib/activityLog';
import { getCurrentUser, getUserRole, isAdmin } from '@/lib/auth';
import { UserRole } from '@/lib/roles';
import { trackEvent, trackPageView } from '@/lib/analytics';
import { supabase } from '@/lib/supabase';
import { addNotification } from '@/lib/notifications';
import { realtimeManager, useRealtimeUpdates } from '@/lib/realtime';
import { useNavigate, Navigate } from 'react-router-dom';
import { ACADEMY_FILES_TAB_URL, academyFileViewPath } from '@/lib/academyLibraryPaths';

type MemberFilesLibraryProps = {
  embedded?: boolean;
};

export function MemberFilesLibrary({ embedded = false }: MemberFilesLibraryProps) {
  const { toast } = useToast();
  const navigate = useNavigate();
  const user = getCurrentUser();
  const userRole = getUserRole();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<FileResource[]>([]);
  const [isLoadingFiles, setIsLoadingFiles] = useState(true);
  const [categories, setCategories] = useState<Array<{ id: string; name: string; color?: string }>>([]);
  const [selectedFilesForUpload, setSelectedFilesForUpload] = useState<File[]>([]);
  const [uploadFileName, setUploadFileName] = useState('');
  const [uploadCategoryId, setUploadCategoryId] = useState<string>('');
  const [uploadMonth, setUploadMonth] = useState<string>('');
  const [uploadYear, setUploadYear] = useState<string>(new Date().getFullYear().toString());
  const [uploadAuthors, setUploadAuthors] = useState<string[]>(['']);

  // Load files and categories on mount
  useEffect(() => {
    const loadData = async () => {
      setIsLoadingFiles(true);
      try {
        const [filesData, categoriesData] = await Promise.all([
          getOrderedFiles(),
          getCategories(),
        ]);
        setFiles(filesData);
        setCategories(categoriesData);
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          console.error('Error loading files:', error);
        }
        toast({
          title: "Error",
          description: "Failed to load files. Please refresh the page.",
          variant: "destructive",
        });
      } finally {
        setIsLoadingFiles(false);
      }
    };
    loadData();
  }, []);

  // Track page view
  useEffect(() => {
    trackPageView(embedded ? '/membership-portal/academy' : '/membership-portal/files', user?.id);
  }, [user?.id]);

  // Subscribe to real-time file updates to sync with Admin panel
  useRealtimeUpdates((update) => {
    if (update.type === 'file') {
      // Reload files when they're updated/deleted/created in Admin panel
      const loadData = async () => {
        try {
          const [filesData, categoriesData] = await Promise.all([
            getOrderedFiles(),
            getCategories(),
          ]);
          setFiles(filesData);
          setCategories(categoriesData);
        } catch (error) {
          if (process.env.NODE_ENV === 'development') {
            console.error('Error reloading files:', error);
          }
        }
      };
      loadData();
    }
  }, []);

  const filteredFiles = useMemo(() => {
    let result = files;

    if (selectedCategory !== 'all') {
      result = result.filter(file => file.categoryId === selectedCategory);
    }

    return result;
  }, [files, selectedCategory]);

  // Group files by category (match Admin panel behavior exactly)
  const filesByCategory = useMemo(() => {
    const grouped: Record<string, FileResource[]> = {};
    
    // Initialize with all categories
    categories.forEach(cat => {
      grouped[cat.id] = [];
    });
    
    // Group files - assign uncategorized files to "Other" category (find by name since DB uses UUIDs)
    const otherCategory = categories.find(c => c.name.toLowerCase() === 'other');
    const otherCategoryId = otherCategory?.id;
    
    filteredFiles.forEach(file => {
      // If file has no categoryId, assign to "Other" category if it exists
      let catId = file.categoryId;
      if (!catId && otherCategoryId) {
        catId = otherCategoryId;
      }
      // If still no categoryId, use 'other' as fallback for grouping
      if (!catId) {
        catId = 'other';
      }
      
      // Check if this categoryId matches any category UUID
      let matchingCategory = categories.find(c => c.id === catId);
      
      // If not found by ID, try to find by name (for old string IDs like 'meeting-minutes')
      if (!matchingCategory && catId !== 'other') {
        // Try to match by converting the categoryId to a category name
        // e.g., 'meeting-minutes' -> 'Meeting Minutes'
        const categoryNameMap: Record<string, string> = {
          'meeting-minutes': 'Meeting Minutes',
          'research': 'Research',
          'standards': 'Standards',
          'governance': 'Governance',
          'other': 'Other'
        };
        
        const possibleName = categoryNameMap[catId] || catId.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
        matchingCategory = categories.find(c => c.name.toLowerCase() === possibleName.toLowerCase());
        
        if (matchingCategory) {
          catId = matchingCategory.id; // Use the UUID
        } else {
          // If still no match, assign to Other
          if (otherCategoryId) {
            catId = otherCategoryId;
          } else {
            catId = 'other';
          }
        }
      }
      
      if (!grouped[catId]) {
        grouped[catId] = [];
      }
      grouped[catId].push(file);
    });
    
    return grouped;
  }, [filteredFiles, categories]);

  const getResourceIcon = (type: ResourceType) => {
    switch (type) {
      case 'spreadsheet':
        return <FileSpreadsheet className="h-4 w-4 text-green-600" />;
      case 'ebook':
        return <BookOpen className="h-4 w-4 text-purple-500" />;
      default:
        return <FileText className="h-4 w-4 text-electric-blue" />;
    }
  };


  const handleFileUpload = () => {
    setShowUploadDialog(true);
    setSelectedFilesForUpload([]);
    setUploadFileName('');
    setUploadMonth('');
    setUploadYear(new Date().getFullYear().toString());
    setUploadAuthors(['']);
    // Set default category to "Other" if it exists
    const otherCategory = categories.find(c => c.name.toLowerCase() === 'other');
    setUploadCategoryId(otherCategory?.id || categories[0]?.id || '');
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = event.target.files;
    if (!selectedFiles || selectedFiles.length === 0) return;

    const filesArray = Array.from(selectedFiles);
    setSelectedFilesForUpload(filesArray);
    
    // Set default file name to first file's name (without extension)
    if (filesArray.length === 1) {
      const fileName = filesArray[0].name;
      const nameWithoutExt = fileName.substring(0, fileName.lastIndexOf('.')) || fileName;
      setUploadFileName(nameWithoutExt);
    }
  };

  const handleUploadFiles = async () => {
    if (selectedFilesForUpload.length === 0) {
      toast({
        title: "No files selected",
        description: "Please select at least one file to upload.",
        variant: "destructive",
      });
      return;
    }

    if (!uploadFileName.trim()) {
      toast({
        title: "File name required",
        description: "Please enter a name for the file.",
        variant: "destructive",
      });
      return;
    }

    if (!uploadYear.trim() || isNaN(parseInt(uploadYear))) {
      toast({
        title: "Year required",
        description: "Please enter a valid year.",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    const filesToUpload = selectedFilesForUpload;
    let uploadedCount = 0;
    let failedCount = 0;
    const errors: string[] = [];

    try {
      // Upload all selected files
      for (let i = 0; i < filesToUpload.length; i++) {
        const selectedFile = filesToUpload[i];
        
        try {
          // SECURITY: Validate file before upload
          // Sanitize filename to prevent path traversal attacks
          const sanitizedFileName = sanitizeFilename(selectedFile.name);
          if (!sanitizedFileName || sanitizedFileName.length === 0) {
            throw new Error('Invalid filename');
          }
          
          // Upload file to Supabase Storage
          // Generate UUID for file ID
          const fileId = crypto.randomUUID();
          const fileName = `${fileId}_${sanitizedFileName}`;
          const filePath = `${getCurrentUser()?.id || 'anonymous'}/${fileName}`;

          // Upload to Supabase Storage
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('files')
            .upload(filePath, selectedFile, {
              cacheControl: '3600',
              upsert: false,
            });

          if (uploadError) {
            throw uploadError;
          }

          // Get public URL
          const { data: urlData } = supabase.storage
            .from('files')
            .getPublicUrl(filePath);

          const fileUrl = urlData.publicUrl;

          // Update progress
          setUploadProgress(Math.round(((i + 1) / filesToUpload.length) * 100));

          // Use custom name if provided, otherwise use original filename
          const displayName = uploadFileName.trim() || selectedFile.name;
          
          // Parse month and year
          const fileMonth = uploadMonth && uploadMonth !== 'none' ? parseInt(uploadMonth) : undefined;
          const fileYear = parseInt(uploadYear);
          
          // Filter out empty author names
          const authors = uploadAuthors.filter(author => author.trim().length > 0);

          // Create file record
          const newFile: FileResource = {
            id: fileId,
            name: displayName,
            type: selectedFile.type.includes('sheet') ? 'spreadsheet' : 
                  selectedFile.type.includes('pdf') || selectedFile.name.toLowerCase().endsWith('.docx') ? 'document' : 'other',
            size: `${(selectedFile.size / 1024 / 1024).toFixed(2)} MB`,
            lastModified: 'Just now',
            uploadedBy: getCurrentUser()?.name || 'You',
            description: '',
            fileUrl: fileUrl,
            categoryId: uploadCategoryId || undefined,
            fileMonth: fileMonth,
            fileYear: fileYear,
            authors: authors.length > 0 ? authors : undefined,
          };

          // Add file record to database
          await addFile(newFile);

          // Update file URL in database
          const { error: updateError } = await supabase
            .from('files')
            .update({ file_url: fileUrl })
            .eq('id', fileId);

          if (updateError) {
            if (process.env.NODE_ENV === 'development') {
              console.error('Error updating file URL:', updateError);
            }
          }

          uploadedCount++;

          // Track analytics
          trackEvent({
            type: 'file_upload',
            category: 'files',
            action: 'file_uploaded',
            label: selectedFile.name,
            userId: user?.id,
          });

          // Trigger real-time update
          realtimeManager.triggerUpdate({
            type: 'file',
            id: newFile.id,
            action: 'created',
            data: newFile,
            timestamp: new Date(),
          });

          // Send notification
          await addNotification({
            type: 'file',
            title: 'New file uploaded',
            message: `${selectedFile.name} has been uploaded`,
            userId: user?.id,
            link: ACADEMY_FILES_TAB_URL,
          });

          await addActivity({
            type: 'file',
            action: 'File uploaded',
            name: selectedFile.name,
            userId: user?.id,
            status: 'active',
          });
        } catch (fileError: any) {
          if (process.env.NODE_ENV === 'development') {
            console.error(`Error uploading file ${selectedFile.name}:`, fileError);
          }
          failedCount++;
          errors.push(`${selectedFile.name}: ${fileError.message || 'Upload failed'}`);
        }
      }

      // Refresh files list
      const updatedFiles = await getOrderedFiles();
      setFiles(updatedFiles);

      // Show success/error messages
      if (uploadedCount > 0 && failedCount === 0) {
        toast({
          title: "Files uploaded",
          description: `${uploadedCount} file${uploadedCount > 1 ? 's' : ''} uploaded successfully.`,
        });
      } else if (uploadedCount > 0 && failedCount > 0) {
        toast({
          title: "Partial upload",
          description: `${uploadedCount} file${uploadedCount > 1 ? 's' : ''} uploaded, ${failedCount} failed.`,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Upload failed",
          description: `Failed to upload ${failedCount} file${failedCount > 1 ? 's' : ''}. ${errors.join('; ')}`,
          variant: "destructive",
        });
      }

      setIsUploading(false);
      setUploadProgress(0);
      setShowUploadDialog(false);
      setSelectedFilesForUpload([]);
      setUploadFileName('');
      setUploadCategoryId('');
      setUploadMonth('');
      setUploadYear(new Date().getFullYear().toString());
      setUploadAuthors(['']);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error: any) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error uploading files:', error);
      }
      setIsUploading(false);
      setUploadProgress(0);
      toast({
        title: "Error",
        description: error.message || "Failed to upload files. Please try again.",
        variant: "destructive",
      });
    }
  };


  const handleDownload = (file: FileResource) => {
    if (file.fileUrl) {
      // Open file URL in new tab for download
      const downloadWindow = window.open(file.fileUrl, '_blank', 'noopener,noreferrer');
      if (!downloadWindow) {
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

  return (
    <div className={embedded ? 'space-y-4' : 'space-y-0 md:space-y-6'}>
      {embedded ? (
        <div className="flex justify-end">
          <Button size="sm" className="bg-electric-blue hover:bg-blue-600" onClick={handleFileUpload}>
            <Upload className="mr-2 h-4 w-4" />
            Upload File
          </Button>
        </div>
      ) : (
        <PageTitle
          title="Files"
          fullWidthLandscape={true}
          rightContent={
            <Button size="sm" className="bg-electric-blue hover:bg-blue-600 text-xs md:text-sm" onClick={handleFileUpload}>
              <Upload className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
              <span className="hidden sm:inline">Upload File</span>
              <span className="sm:hidden">Upload</span>
            </Button>
          }
        />
      )}

      {/* Files List - Grouped by Category */}
      {isLoadingFiles ? (
        <Card className="glass-card">
          <CardContent className="py-12 text-center">
            <Loader2 className="h-8 w-8 animate-spin text-electric-blue mx-auto mb-4" />
            <p className="text-gray-600 dark:text-white">Loading files...</p>
          </CardContent>
        </Card>
      ) : Object.keys(filesByCategory).length === 0 ? (
        <Card className="glass-card">
          <CardContent className="py-12 text-center">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No files found</h3>
            <p className="text-gray-600 dark:text-white mb-4">Upload your first file to share with the community</p>
            <Button 
              onClick={handleFileUpload}
              className="bg-electric-blue hover:bg-electric-blue/90"
            >
              <Upload className="h-4 w-4 mr-2" />
              Upload File
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {categories.map((category) => {
            const categoryFiles = filesByCategory[category.id] || [];
            return (
              <Card key={category.id} className="glass-card">
                <CardContent className="p-0">
                  <div className="px-4 py-2 border-b border-gray-200 bg-gray-50 dark:bg-gray-800">
                    <div className="flex items-center gap-2">
                      <Folder className="h-4 w-4 dark:text-white" style={{ color: category.color }} />
                      <h2 className="font-semibold text-sm text-gray-900 dark:text-white">{category.name}</h2>
                    </div>
                  </div>
                  <div className="divide-y divide-gray-200">
                    {categoryFiles.length === 0 ? (
                      <div className="px-4 py-8 text-center text-sm text-gray-500 dark:text-white">
                        No files in this category
                      </div>
                    ) : (
                      categoryFiles.map((file) => (
                      <div
                        key={file.id}
                        className="flex items-center gap-3 px-4 py-3 hover:bg-electric-blue/5 transition-colors"
                      >
                        <div className="flex-shrink-0">
                          <div className="h-4 w-4">
                            {getResourceIcon(file.type)}
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 
                              className="font-medium text-sm text-gray-900 dark:text-white cursor-pointer hover:text-electric-blue transition-colors"
                              onClick={() => navigate(academyFileViewPath(file.id))}
                            >
                              {file.name}
                            </h3>
                            {file.fileYear && (
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                {file.fileMonth 
                                  ? `${new Date(2000, file.fileMonth - 1).toLocaleString('default', { month: 'short' })} ${file.fileYear}`
                                  : file.fileYear}
                              </span>
                            )}
                            {file.authors && file.authors.length > 0 && (
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                by {file.authors.join(', ')}
                              </span>
                            )}
                          </div>
                          {file.description && (
                            <p className="text-xs text-gray-500 dark:text-white mt-0.5 line-clamp-1">{file.description}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="h-7 px-2"
                            onClick={() => navigate(academyFileViewPath(file.id))}
                            title="View file"
                          >
                            <Eye className="h-3 w-3" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="h-7 px-2"
                            onClick={() => handleDownload(file)}
                            title="Download"
                          >
                            <Download className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Upload Dialog - Mobile Optimized */}
      <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
        <DialogContent className="bg-white dark:bg-[hsl(217,40%,18%)] border-gray-200 dark:border-[hsl(217,35%,25%)] max-w-[95vw] sm:max-w-md w-full overflow-y-auto max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="text-gray-900 dark:text-white text-lg sm:text-xl">Upload File</DialogTitle>
            <DialogDescription className="text-gray-600 dark:text-white text-sm">
              Upload documents, spreadsheets, eBooks, or any file you want to share.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 w-full">
            <div className="border-2 border-dashed border-gray-300 dark:border-[hsl(217,35%,25%)] rounded-lg p-4 sm:p-6 text-center bg-gray-50 dark:bg-gray-800 min-h-[180px] sm:min-h-[200px] flex flex-col items-center justify-center w-full box-border">
              <Upload className="h-10 w-10 sm:h-12 sm:w-12 text-gray-600 dark:text-white mx-auto mb-3 sm:mb-4" />
              <p className="text-sm sm:text-base text-gray-700 dark:text-white mb-4 sm:mb-6 px-2 break-words">
                {selectedFilesForUpload.length > 0 
                  ? `${selectedFilesForUpload.length} file${selectedFilesForUpload.length > 1 ? 's' : ''} selected`
                  : 'Drag and drop files here, or tap to browse'}
              </p>
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                onChange={handleFileSelect}
                accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt"
                multiple
              />
              <Button 
                variant="outline" 
                size="lg"
                className="border-gray-300 dark:border-[hsl(217,35%,25%)] text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 min-h-[44px] px-6 text-base sm:text-sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
              >
                {selectedFilesForUpload.length > 0 ? (
                  <>
                    <FileText className="h-5 w-5 sm:h-4 sm:w-4 mr-2" />
                    Change Files
                  </>
                ) : (
                  <>
                    <Upload className="h-5 w-5 sm:h-4 sm:w-4 mr-2" />
                    Select Files
                  </>
                )}
              </Button>
              {selectedFilesForUpload.length > 0 && (
                <div className="mt-4 w-full px-2 box-border">
                  <p className="text-xs text-gray-600 dark:text-white mb-2">Selected files:</p>
                  <div className="space-y-1 max-h-32 overflow-y-auto w-full">
                    {selectedFilesForUpload.map((file, index) => (
                      <p key={index} className="text-xs text-gray-700 dark:text-white break-words">{file.name}</p>
                    ))}
                  </div>
                </div>
              )}
              <p className="text-xs sm:text-sm text-gray-600 dark:text-white mt-4 px-2 break-words">
                Supports: PDFs, Documents, Spreadsheets, eBooks, and more
              </p>
            </div>
            
            {selectedFilesForUpload.length > 0 && (
              <>
                <div className="space-y-2 w-full box-border">
                  <Label htmlFor="upload-file-name" className="text-sm text-gray-700 dark:text-white">File Name *</Label>
                    <input
                      id="upload-file-name"
                      name="upload-file-name"
                      type="text"
                      value={uploadFileName}
                      onChange={(e) => setUploadFileName(e.target.value)}
                      placeholder="Enter file name"
                      className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-[hsl(217,35%,25%)] rounded-md focus:outline-none focus:ring-2 focus:ring-electric-blue focus:border-transparent bg-white dark:bg-[hsl(217,40%,18%)] text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 box-border"
                      disabled={isUploading}
                    />
                </div>
                
                <div className="space-y-2 w-full box-border">
                  <Label htmlFor="upload-category" className="text-sm text-gray-700 dark:text-white">Category</Label>
                  <Select
                    value={uploadCategoryId}
                    onValueChange={setUploadCategoryId}
                    disabled={isUploading}
                  >
                    <SelectTrigger 
                      id="upload-category"
                      name="upload-category"
                      className="w-full dark:bg-[hsl(217,40%,18%)] dark:text-white dark:border-[hsl(217,35%,25%)] box-border"
                    >
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent className="dark:bg-[hsl(217,40%,18%)] dark:border-[hsl(217,35%,25%)]">
                      {categories.map((category) => (
                        <SelectItem 
                          key={category.id} 
                          value={category.id}
                          className="dark:text-white dark:hover:bg-gray-800"
                        >
                          <div className="flex items-center gap-2">
                            {category.color && (
                              <div
                                className="w-2 h-2 rounded-full"
                                style={{ backgroundColor: category.color }}
                              />
                            )}
                            {category.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-3 w-full box-border">
                  <div className="space-y-2">
                    <Label htmlFor="upload-month" className="text-sm text-gray-700 dark:text-white">Month (Optional)</Label>
                    <Select
                      value={uploadMonth || 'none'}
                      onValueChange={(value) => setUploadMonth(value === 'none' ? '' : value)}
                      disabled={isUploading}
                    >
                      <SelectTrigger 
                        id="upload-month"
                        name="upload-month"
                        className="w-full dark:bg-[hsl(217,40%,18%)] dark:text-white dark:border-[hsl(217,35%,25%)] box-border"
                      >
                        <SelectValue placeholder="Select month" />
                      </SelectTrigger>
                      <SelectContent className="dark:bg-[hsl(217,40%,18%)] dark:border-[hsl(217,35%,25%)]">
                        <SelectItem value="none" className="dark:text-white dark:hover:bg-gray-800">None</SelectItem>
                        <SelectItem value="1" className="dark:text-white dark:hover:bg-gray-800">January</SelectItem>
                        <SelectItem value="2" className="dark:text-white dark:hover:bg-gray-800">February</SelectItem>
                        <SelectItem value="3" className="dark:text-white dark:hover:bg-gray-800">March</SelectItem>
                        <SelectItem value="4" className="dark:text-white dark:hover:bg-gray-800">April</SelectItem>
                        <SelectItem value="5" className="dark:text-white dark:hover:bg-gray-800">May</SelectItem>
                        <SelectItem value="6" className="dark:text-white dark:hover:bg-gray-800">June</SelectItem>
                        <SelectItem value="7" className="dark:text-white dark:hover:bg-gray-800">July</SelectItem>
                        <SelectItem value="8" className="dark:text-white dark:hover:bg-gray-800">August</SelectItem>
                        <SelectItem value="9" className="dark:text-white dark:hover:bg-gray-800">September</SelectItem>
                        <SelectItem value="10" className="dark:text-white dark:hover:bg-gray-800">October</SelectItem>
                        <SelectItem value="11" className="dark:text-white dark:hover:bg-gray-800">November</SelectItem>
                        <SelectItem value="12" className="dark:text-white dark:hover:bg-gray-800">December</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="upload-year" className="text-sm text-gray-700 dark:text-white">Year *</Label>
                    <input
                      id="upload-year"
                      name="upload-year"
                      type="number"
                      value={uploadYear}
                      onChange={(e) => setUploadYear(e.target.value)}
                      placeholder="YYYY"
                      min="1900"
                      max="2100"
                      className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-[hsl(217,35%,25%)] rounded-md focus:outline-none focus:ring-2 focus:ring-electric-blue focus:border-transparent bg-white dark:bg-[hsl(217,40%,18%)] text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 box-border"
                      disabled={isUploading}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2 w-full box-border">
                  <Label htmlFor="upload-authors" className="text-sm text-gray-700 dark:text-white">Authors</Label>
                  <div className="space-y-2">
                    {uploadAuthors.map((author, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <input
                          id={`upload-author-${index}`}
                          name={`upload-author-${index}`}
                          type="text"
                          value={author}
                          onChange={(e) => {
                            const newAuthors = [...uploadAuthors];
                            newAuthors[index] = e.target.value;
                            setUploadAuthors(newAuthors);
                          }}
                          placeholder="Author name"
                          className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-[hsl(217,35%,25%)] rounded-md focus:outline-none focus:ring-2 focus:ring-electric-blue focus:border-transparent bg-white dark:bg-[hsl(217,40%,18%)] text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 box-border"
                          disabled={isUploading}
                        />
                        {index === uploadAuthors.length - 1 && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setUploadAuthors([...uploadAuthors, ''])}
                            className="border-gray-300 dark:border-[hsl(217,35%,25%)] text-gray-700 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800 h-9 px-3"
                            disabled={isUploading}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        )}
                        {uploadAuthors.length > 1 && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const newAuthors = uploadAuthors.filter((_, i) => i !== index);
                              setUploadAuthors(newAuthors.length > 0 ? newAuthors : ['']);
                            }}
                            className="border-gray-300 dark:border-[hsl(217,35%,25%)] text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 h-9 px-3"
                            disabled={isUploading}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Add multiple authors by clicking the + button</p>
                </div>
              </>
            )}
            
            {isUploading && (
              <div className="mt-4 w-full box-border">
                <p className="text-sm text-gray-600 dark:text-white text-center">Uploading files... Please wait.</p>
                {uploadProgress > 0 && (
                  <div className="mt-2 w-full">
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-electric-blue h-2 rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-600 dark:text-white text-center mt-1">{uploadProgress}%</p>
                  </div>
                )}
              </div>
            )}
            
            <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-2 w-full box-border">
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowUploadDialog(false);
                  setIsUploading(false);
                  setUploadProgress(0);
                  setSelectedFilesForUpload([]);
                  setUploadFileName('');
                  setUploadCategoryId('');
                  setUploadMonth('');
                  setUploadYear(new Date().getFullYear().toString());
                  setUploadAuthors(['']);
                }}
                className="border-gray-300 dark:border-[hsl(217,35%,25%)] text-gray-700 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800 w-full sm:w-auto min-h-[44px] sm:min-h-[36px] box-border"
                disabled={isUploading}
              >
                Cancel
              </Button>
              {selectedFilesForUpload.length > 0 && (
                <Button 
                  onClick={handleUploadFiles}
                  className="bg-electric-blue hover:bg-electric-blue/90 text-white w-full sm:w-auto min-h-[44px] sm:min-h-[36px] box-border"
                  disabled={isUploading || !uploadFileName.trim()}
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      Upload
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

    </div>
  );
}

export default function Files() {
  return <Navigate to={ACADEMY_FILES_TAB_URL} replace />;
}

