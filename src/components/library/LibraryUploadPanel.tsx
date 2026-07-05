import { useRef, useState, useMemo, useEffect } from 'react';
import { Upload, FileText, X, Plus, Loader2, Link2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import {
  addFile,
  FileResource,
  ResourceType,
  type FileCategory,
} from '@/data/filesOrder';
import {
  LIBRARY_CONTENT_SECTIONS,
  type LibraryContentType,
} from '@/data/libraryData';
import { sanitizeFilename } from '@/lib/security';
import { addActivity } from '@/lib/activityLog';
import { getCurrentUser } from '@/lib/auth';
import { trackEvent } from '@/lib/analytics';
import { supabase } from '@/lib/supabase';
import { addNotification } from '@/lib/notifications';
import { realtimeManager } from '@/lib/realtime';
import { LIBRARY_UPLOAD_TAB_URL } from '@/lib/libraryPaths';
import { getVideoEmbedUrl, parseVideoEmbed, supportsVideoUrlEmbed } from '@/lib/videoEmbed';
import { LibraryVideoEmbed } from '@/components/library/LibraryVideoEmbed';

type UploadMode = 'file' | 'url';

function inferResourceType(file: File): ResourceType {
  const name = file.name.toLowerCase();
  const mime = file.type.toLowerCase();
  if (mime.includes('video') || /\.(mp4|mov|webm|mkv|avi)$/.test(name)) return 'video';
  if (mime.includes('sheet') || /\.(xls|xlsx|csv)$/.test(name)) return 'spreadsheet';
  if (/\.(zip|tar|gz|jsonl|parquet)$/.test(name)) return 'dataset';
  if (mime.includes('pdf') || /\.(doc|docx|epub)$/.test(name)) return 'document';
  return 'other';
}

type LibraryUploadPanelProps = {
  categories: FileCategory[];
  onUploaded?: () => void;
};

export function LibraryUploadPanel({ categories, onUploaded }: LibraryUploadPanelProps) {
  const { toast } = useToast();
  const user = getCurrentUser();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedFilesForUpload, setSelectedFilesForUpload] = useState<File[]>([]);
  const [uploadFileName, setUploadFileName] = useState('');
  const [uploadLibraryType, setUploadLibraryType] = useState<LibraryContentType>('research');
  const [uploadDescription, setUploadDescription] = useState('');
  const [uploadMonth, setUploadMonth] = useState('');
  const [uploadYear, setUploadYear] = useState(new Date().getFullYear().toString());
  const [uploadAuthors, setUploadAuthors] = useState<string[]>(['']);
  const [uploadVideoUrl, setUploadVideoUrl] = useState('');
  const [uploadMode, setUploadMode] = useState<UploadMode>('file');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const videoUrlSupported = supportsVideoUrlEmbed(uploadLibraryType);
  const videoEmbedPreview = useMemo(() => getVideoEmbedUrl(uploadVideoUrl), [uploadVideoUrl]);

  useEffect(() => {
    if (videoUrlSupported) {
      setUploadMode('url');
    } else {
      setUploadMode('file');
      setUploadVideoUrl('');
    }
  }, [uploadLibraryType, videoUrlSupported]);

  const showMetadataFields =
    uploadMode === 'url' && videoUrlSupported ? true : selectedFilesForUpload.length > 0;

  const canSubmit =
    uploadFileName.trim().length > 0 &&
    !isUploading &&
    (uploadMode === 'url'
      ? videoUrlSupported && videoEmbedPreview !== null
      : selectedFilesForUpload.length > 0);

  const resetForm = () => {
    setSelectedFilesForUpload([]);
    setUploadFileName('');
    setUploadDescription('');
    setUploadMonth('');
    setUploadYear(new Date().getFullYear().toString());
    setUploadAuthors(['']);
    setUploadVideoUrl('');
    setUploadMode(supportsVideoUrlEmbed(uploadLibraryType) ? 'url' : 'file');
    setUploadProgress(0);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = event.target.files;
    if (!selectedFiles || selectedFiles.length === 0) return;

    const filesArray = Array.from(selectedFiles);
    setSelectedFilesForUpload(filesArray);

    if (filesArray.length === 1) {
      const fileName = filesArray[0].name;
      const nameWithoutExt = fileName.substring(0, fileName.lastIndexOf('.')) || fileName;
      setUploadFileName(nameWithoutExt);
    }
  };

  const resolveCategoryId = (libraryType: LibraryContentType): string | undefined => {
    const map: Partial<Record<LibraryContentType, string>> = {
      research: 'research',
      files: 'other',
    };
    const slug = map[libraryType];
    if (!slug) return categories.find((c) => c.name.toLowerCase() === 'other')?.id;
    return categories.find((c) => c.id === slug || c.name.toLowerCase().includes(slug))?.id;
  };

  const saveLibraryEntry = async (newFile: FileResource, label: string) => {
    await addFile(newFile);

    trackEvent({
      type: 'file_upload',
      category: 'library',
      action: 'file_uploaded',
      label,
      userId: user?.id,
    });

    realtimeManager.triggerUpdate({
      type: 'file',
      id: newFile.id,
      action: 'created',
      data: newFile,
      timestamp: new Date(),
    });

    await addNotification({
      type: 'file',
      title: 'New library upload',
      message: `${newFile.name} has been uploaded`,
      userId: user?.id,
      link: LIBRARY_UPLOAD_TAB_URL,
    });

    await addActivity({
      type: 'file',
      action: 'Library file uploaded',
      name: newFile.name,
      userId: user?.id,
      status: 'active',
    });
  };

  const handleVideoUrlSubmit = async () => {
    if (!uploadFileName.trim()) {
      toast({
        title: 'Title required',
        description: 'Please enter a title for the video.',
        variant: 'destructive',
      });
      return;
    }

    const embed = parseVideoEmbed(uploadVideoUrl);
    if (!embed) {
      toast({
        title: 'Invalid video URL',
        description: 'Please enter a valid YouTube or Vimeo link.',
        variant: 'destructive',
      });
      return;
    }

    if (!uploadYear.trim() || Number.isNaN(parseInt(uploadYear, 10))) {
      toast({
        title: 'Year required',
        description: 'Please enter a valid year.',
        variant: 'destructive',
      });
      return;
    }

    setIsUploading(true);

    try {
      const fileMonth = uploadMonth && uploadMonth !== 'none' ? parseInt(uploadMonth, 10) : undefined;
      const fileYear = parseInt(uploadYear, 10);
      const authors = uploadAuthors.filter((author) => author.trim().length > 0);

      const newFile: FileResource = {
        id: crypto.randomUUID(),
        name: uploadFileName.trim(),
        type: 'video',
        size: '—',
        lastModified: 'Just now',
        uploadedBy: getCurrentUser()?.name || 'You',
        description: uploadDescription.trim() || undefined,
        fileUrl: embed.embedUrl,
        categoryId: resolveCategoryId(uploadLibraryType),
        fileMonth,
        fileYear,
        authors: authors.length > 0 ? authors : undefined,
        libraryType: uploadLibraryType,
      };

      await saveLibraryEntry(newFile, uploadVideoUrl);

      toast({
        title: 'Video added',
        description: `"${newFile.name}" is now in ${
          LIBRARY_CONTENT_SECTIONS.find((s) => s.type === uploadLibraryType)?.title ?? 'the library'
        }.`,
      });

      resetForm();
      onUploaded?.();
    } catch (error: unknown) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to add video. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleUploadFiles = async () => {
    if (selectedFilesForUpload.length === 0) {
      toast({
        title: 'No files selected',
        description: 'Please select at least one file to upload.',
        variant: 'destructive',
      });
      return;
    }

    if (!uploadFileName.trim()) {
      toast({
        title: 'Title required',
        description: 'Please enter a title for the upload.',
        variant: 'destructive',
      });
      return;
    }

    if (!uploadYear.trim() || Number.isNaN(parseInt(uploadYear, 10))) {
      toast({
        title: 'Year required',
        description: 'Please enter a valid year.',
        variant: 'destructive',
      });
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    let uploadedCount = 0;
    let failedCount = 0;
    const errors: string[] = [];

    try {
      for (let i = 0; i < selectedFilesForUpload.length; i++) {
        const selectedFile = selectedFilesForUpload[i];

        try {
          const sanitizedFileName = sanitizeFilename(selectedFile.name);
          if (!sanitizedFileName) throw new Error('Invalid filename');

          const fileId = crypto.randomUUID();
          const storageName = `${fileId}_${sanitizedFileName}`;
          const filePath = `${getCurrentUser()?.id || 'anonymous'}/${storageName}`;

          const { error: uploadError } = await supabase.storage.from('files').upload(filePath, selectedFile, {
            cacheControl: '3600',
            upsert: false,
          });
          if (uploadError) throw uploadError;

          const { data: urlData } = supabase.storage.from('files').getPublicUrl(filePath);
          const fileUrl = urlData.publicUrl;
          setUploadProgress(Math.round(((i + 1) / selectedFilesForUpload.length) * 100));

          const displayName =
            selectedFilesForUpload.length === 1
              ? uploadFileName.trim()
              : `${uploadFileName.trim()} (${selectedFile.name})`;
          const fileMonth = uploadMonth && uploadMonth !== 'none' ? parseInt(uploadMonth, 10) : undefined;
          const fileYear = parseInt(uploadYear, 10);
          const authors = uploadAuthors.filter((author) => author.trim().length > 0);

          const newFile: FileResource = {
            id: fileId,
            name: displayName,
            type: inferResourceType(selectedFile),
            size: `${(selectedFile.size / 1024 / 1024).toFixed(2)} MB`,
            lastModified: 'Just now',
            uploadedBy: getCurrentUser()?.name || 'You',
            description: uploadDescription.trim() || undefined,
            fileUrl,
            categoryId: resolveCategoryId(uploadLibraryType),
            fileMonth,
            fileYear,
            authors: authors.length > 0 ? authors : undefined,
            libraryType: uploadLibraryType,
          };

          await addFile(newFile);

          if (!newFile.fileUrl) {
            await supabase.from('files').update({ file_url: fileUrl }).eq('id', fileId);
          }

          uploadedCount++;

          trackEvent({
            type: 'file_upload',
            category: 'library',
            action: 'file_uploaded',
            label: selectedFile.name,
            userId: user?.id,
          });

          realtimeManager.triggerUpdate({
            type: 'file',
            id: newFile.id,
            action: 'created',
            data: newFile,
            timestamp: new Date(),
          });

          await addNotification({
            type: 'file',
            title: 'New library upload',
            message: `${displayName} has been uploaded`,
            userId: user?.id,
            link: LIBRARY_UPLOAD_TAB_URL,
          });

          await addActivity({
            type: 'file',
            action: 'Library file uploaded',
            name: displayName,
            userId: user?.id,
            status: 'active',
          });
        } catch (fileError: unknown) {
          failedCount++;
          errors.push(
            `${selectedFile.name}: ${fileError instanceof Error ? fileError.message : 'Upload failed'}`,
          );
        }
      }

      if (uploadedCount > 0) {
        toast({
          title: 'Upload complete',
          description: `${uploadedCount} file${uploadedCount > 1 ? 's' : ''} added to ${
            LIBRARY_CONTENT_SECTIONS.find((s) => s.type === uploadLibraryType)?.title ?? 'library'
          }.`,
        });
        resetForm();
        onUploaded?.();
      }

      if (failedCount > 0) {
        toast({
          title: uploadedCount > 0 ? 'Some uploads failed' : 'Upload failed',
          description: errors.join('; '),
          variant: 'destructive',
        });
      }
    } catch (error: unknown) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to upload files. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <Card className="glass-card border border-gray-200 dark:border-[hsl(217,35%,25%)]">
      <CardHeader>
        <CardTitle className="text-xl text-gray-900 dark:text-white">Upload to Library</CardTitle>
        <CardDescription className="text-gray-600 dark:text-gray-300">
          Share any file type — documents, datasets, videos, recordings, and more. Choose which library section it
          belongs to.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="upload-library-type">Library section *</Label>
          <Select
            value={uploadLibraryType}
            onValueChange={(value) => setUploadLibraryType(value as LibraryContentType)}
            disabled={isUploading}
          >
            <SelectTrigger id="upload-library-type" className="dark:bg-[hsl(217,40%,18%)] dark:text-white">
              <SelectValue placeholder="Select section" />
            </SelectTrigger>
            <SelectContent className="dark:bg-[hsl(217,40%,18%)]">
              {LIBRARY_CONTENT_SECTIONS.map((section) => (
                <SelectItem key={section.type} value={section.type} className="dark:text-white">
                  {section.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {videoUrlSupported && (
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              size="sm"
              variant={uploadMode === 'url' ? 'default' : 'outline'}
              className={uploadMode === 'url' ? 'bg-electric-blue hover:bg-electric-blue/90' : ''}
              onClick={() => setUploadMode('url')}
              disabled={isUploading}
            >
              <Link2 className="mr-2 h-4 w-4" />
              Video URL
            </Button>
            <Button
              type="button"
              size="sm"
              variant={uploadMode === 'file' ? 'default' : 'outline'}
              className={uploadMode === 'file' ? 'bg-electric-blue hover:bg-electric-blue/90' : ''}
              onClick={() => setUploadMode('file')}
              disabled={isUploading}
            >
              <Upload className="mr-2 h-4 w-4" />
              Upload file
            </Button>
          </div>
        )}

        {uploadMode === 'url' && videoUrlSupported ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="upload-video-url">Video URL *</Label>
              <input
                id="upload-video-url"
                type="url"
                value={uploadVideoUrl}
                onChange={(e) => setUploadVideoUrl(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=… or https://vimeo.com/…"
                className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-electric-blue focus:outline-none focus:ring-2 focus:ring-electric-blue dark:border-[hsl(217,35%,25%)] dark:bg-[hsl(217,40%,18%)] dark:text-white"
                disabled={isUploading}
              />
              <p className="text-xs text-gray-500 dark:text-gray-400">Supports YouTube and Vimeo links.</p>
            </div>
            {videoEmbedPreview && (
              <LibraryVideoEmbed url={uploadVideoUrl} title="Video preview" />
            )}
          </div>
        ) : (
        <div className="flex min-h-[180px] flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-6 text-center dark:border-[hsl(217,35%,25%)] dark:bg-gray-800">
          <Upload className="mx-auto mb-3 h-10 w-10 text-gray-600 dark:text-white" />
          <p className="mb-4 text-sm text-gray-700 dark:text-white">
            {selectedFilesForUpload.length > 0
              ? `${selectedFilesForUpload.length} file${selectedFilesForUpload.length > 1 ? 's' : ''} selected`
              : 'Drag and drop files here, or tap to browse'}
          </p>
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            onChange={handleFileSelect}
            multiple
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
          >
            {selectedFilesForUpload.length > 0 ? (
              <>
                <FileText className="mr-2 h-4 w-4" />
                Change files
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Select files
              </>
            )}
          </Button>
          {selectedFilesForUpload.length > 0 && (
            <div className="mt-4 w-full max-w-md space-y-1 text-left">
              {selectedFilesForUpload.map((file, index) => (
                <p key={index} className="truncate text-xs text-gray-600 dark:text-gray-300">
                  {file.name}
                </p>
              ))}
            </div>
          )}
          <p className="mt-4 text-xs text-gray-500 dark:text-gray-400">All file types are accepted.</p>
        </div>
        )}

        {showMetadataFields && (
          <>
            <div className="space-y-2">
              <Label htmlFor="upload-title">Title *</Label>
              <input
                id="upload-title"
                type="text"
                value={uploadFileName}
                onChange={(e) => setUploadFileName(e.target.value)}
                placeholder="Enter a title"
                className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-electric-blue focus:outline-none focus:ring-2 focus:ring-electric-blue dark:border-[hsl(217,35%,25%)] dark:bg-[hsl(217,40%,18%)] dark:text-white"
                disabled={isUploading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="upload-description">Description (optional)</Label>
              <textarea
                id="upload-description"
                value={uploadDescription}
                onChange={(e) => setUploadDescription(e.target.value)}
                placeholder="Brief description of this resource"
                rows={3}
                className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-electric-blue focus:outline-none focus:ring-2 focus:ring-electric-blue dark:border-[hsl(217,35%,25%)] dark:bg-[hsl(217,40%,18%)] dark:text-white"
                disabled={isUploading}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="upload-month">Month (optional)</Label>
                <Select
                  value={uploadMonth || 'none'}
                  onValueChange={(value) => setUploadMonth(value === 'none' ? '' : value)}
                  disabled={isUploading}
                >
                  <SelectTrigger id="upload-month" className="dark:bg-[hsl(217,40%,18%)] dark:text-white">
                    <SelectValue placeholder="Select month" />
                  </SelectTrigger>
                  <SelectContent className="dark:bg-[hsl(217,40%,18%)]">
                    <SelectItem value="none">None</SelectItem>
                    {Array.from({ length: 12 }, (_, i) => (
                      <SelectItem key={i + 1} value={String(i + 1)}>
                        {new Date(2000, i).toLocaleString('default', { month: 'long' })}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="upload-year">Year *</Label>
                <input
                  id="upload-year"
                  type="number"
                  value={uploadYear}
                  onChange={(e) => setUploadYear(e.target.value)}
                  min="1900"
                  max="2100"
                  className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm dark:border-[hsl(217,35%,25%)] dark:bg-[hsl(217,40%,18%)] dark:text-white"
                  disabled={isUploading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Authors (optional)</Label>
              <div className="space-y-2">
                {uploadAuthors.map((author, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={author}
                      onChange={(e) => {
                        const next = [...uploadAuthors];
                        next[index] = e.target.value;
                        setUploadAuthors(next);
                      }}
                      placeholder="Author name"
                      className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-[hsl(217,35%,25%)] dark:bg-[hsl(217,40%,18%)] dark:text-white"
                      disabled={isUploading}
                    />
                    {index === uploadAuthors.length - 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setUploadAuthors([...uploadAuthors, ''])}
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
                        onClick={() =>
                          setUploadAuthors(
                            uploadAuthors.filter((_, i) => i !== index).length
                              ? uploadAuthors.filter((_, i) => i !== index)
                              : [''],
                          )
                        }
                        disabled={isUploading}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {isUploading && uploadProgress > 0 && (
          <div>
            <div className="h-2 w-full rounded-full bg-gray-200 dark:bg-gray-700">
              <div
                className="h-2 rounded-full bg-electric-blue transition-all"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
            <p className="mt-1 text-center text-xs text-gray-500">{uploadProgress}%</p>
          </div>
        )}

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={resetForm} disabled={isUploading}>
            Clear
          </Button>
          <Button
            type="button"
            className="bg-electric-blue hover:bg-electric-blue/90"
            onClick={uploadMode === 'url' && videoUrlSupported ? handleVideoUrlSubmit : handleUploadFiles}
            disabled={!canSubmit}
          >
            {isUploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {uploadMode === 'url' ? 'Adding...' : 'Uploading...'}
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                {uploadMode === 'url' && videoUrlSupported ? 'Add video' : 'Upload'}
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
