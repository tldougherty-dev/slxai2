import { useCallback, useEffect, useMemo, useState } from 'react';
import { BookOpen, Database, PlayCircle, Video, FileText, Plus, Pencil, Trash2, Loader2, Save } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import {
  LIBRARY_CONTENT_SECTIONS,
  type LibraryContentType,
  type LibraryResource,
} from '@/data/libraryData';
import {
  deleteLibraryResource,
  getAllLibraryResources,
  seedDefaultLibraryResources,
  upsertLibraryResource,
} from '@/data/libraryResources';
import {
  deleteFile,
  getCategories,
  getOrderedFiles,
  resolveFileLibraryType,
  updateFile,
  type FileCategory,
  type FileResource,
} from '@/data/filesOrder';
import {
  addVideo,
  deleteVideo,
  getLibraryAdminVideos,
  importCompanyVideosCatalog,
  isVideoDbId,
  updateVideo,
  type VideoResource,
} from '@/data/videosOrder';
import { parseVideoEmbed } from '@/lib/videoEmbed';
import { supabase } from '@/lib/supabase';
import { sanitizeText } from '@/lib/security';
import { realtimeManager } from '@/lib/realtime';

const SECTION_ICONS: Record<LibraryContentType, typeof BookOpen> = {
  research: BookOpen,
  dataset: Database,
  educational_video: PlayCircle,
  files: FileText,
};

const emptyCuratedForm = (type: LibraryContentType): LibraryResource => ({
  id: crypto.randomUUID(),
  type,
  title: '',
  description: '',
  url: '',
  source: '',
  tags: [],
});

export function LibraryAdminTab() {
  const { toast } = useToast();
  const [activeSection, setActiveSection] = useState<LibraryContentType>('research');
  const [curated, setCurated] = useState<LibraryResource[]>([]);
  const [files, setFiles] = useState<FileResource[]>([]);
  const [categories, setCategories] = useState<FileCategory[]>([]);
  const [videos, setVideos] = useState<VideoResource[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [curatedDialogOpen, setCuratedDialogOpen] = useState(false);
  const [curatedForm, setCuratedForm] = useState<LibraryResource>(emptyCuratedForm('research'));
  const [curatedToDelete, setCuratedToDelete] = useState<string | null>(null);
  const [fileToEdit, setFileToEdit] = useState<FileResource | null>(null);
  const [fileToDelete, setFileToDelete] = useState<string | null>(null);
  const [videoDialogOpen, setVideoDialogOpen] = useState(false);
  const [videoForm, setVideoForm] = useState<Partial<VideoResource> & { urlInput?: string }>({});
  const [videoToDelete, setVideoToDelete] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const loadAll = useCallback(async () => {
    setIsLoading(true);
    try {
      const [curatedData, filesData, categoriesData, videosData] = await Promise.all([
        getAllLibraryResources(),
        getOrderedFiles(),
        getCategories(),
        getLibraryAdminVideos(),
      ]);
      setCurated(curatedData);
      setFiles(filesData);
      setCategories(categoriesData);
      setVideos(videosData);
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to load library data.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const categoryNameById = useMemo(
    () => new Map(categories.map((c) => [c.id, c.name])),
    [categories],
  );

  const getSectionCurated = (type: LibraryContentType) => curated.filter((r) => r.type === type);
  const getSectionFiles = (type: LibraryContentType) =>
    files.filter(
      (file) =>
        resolveFileLibraryType(file, file.categoryId ? categoryNameById.get(file.categoryId) : undefined) === type,
    );

  const openCuratedDialog = (resource?: LibraryResource) => {
    setCuratedForm(resource ? { ...resource } : emptyCuratedForm(activeSection));
    setCuratedDialogOpen(true);
  };

  const saveCurated = async () => {
    if (!curatedForm.title.trim() || !curatedForm.url.trim()) {
      toast({ title: 'Title and URL are required', variant: 'destructive' });
      return;
    }
    setIsSaving(true);
    try {
      await upsertLibraryResource({
        ...curatedForm,
        type: activeSection,
        title: curatedForm.title.trim(),
        url: curatedForm.url.trim(),
        description: curatedForm.description?.trim() || '',
        tags: curatedForm.tags?.filter(Boolean) ?? [],
      });
      setCuratedDialogOpen(false);
      await loadAll();
      toast({ title: 'Curated resource saved' });
    } catch (error: unknown) {
      toast({
        title: 'Save failed',
        description: error instanceof Error ? error.message : 'Could not save resource.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const confirmDeleteCurated = async () => {
    if (!curatedToDelete) return;
    try {
      await deleteLibraryResource(curatedToDelete);
      setCuratedToDelete(null);
      await loadAll();
      toast({ title: 'Resource deleted' });
    } catch {
      toast({ title: 'Delete failed', variant: 'destructive' });
    }
  };

  const saveFileEdit = async () => {
    if (!fileToEdit || !fileToEdit.name.trim()) return;
    setIsSaving(true);
    try {
      await updateFile(fileToEdit.id, {
        name: sanitizeText(fileToEdit.name.trim()),
        description: fileToEdit.description,
        libraryType: fileToEdit.libraryType,
        fileYear: fileToEdit.fileYear,
        fileMonth: fileToEdit.fileMonth,
        authors: fileToEdit.authors,
      });
      realtimeManager.triggerUpdate({ type: 'file', id: fileToEdit.id, action: 'updated', timestamp: new Date() });
      setFileToEdit(null);
      await loadAll();
      toast({ title: 'Upload updated' });
    } catch {
      toast({ title: 'Update failed', variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };

  const confirmDeleteFile = async () => {
    if (!fileToDelete) return;
    const file = files.find((f) => f.id === fileToDelete);
    if (!file) return;
    try {
      if (file.fileUrl && !file.fileUrl.includes('youtube.com/embed') && !file.fileUrl.includes('vimeo.com')) {
        try {
          const urlParts = file.fileUrl.split('/');
          const fileName = urlParts[urlParts.length - 1];
          const userId = urlParts[urlParts.length - 2];
          await supabase.storage.from('files').remove([`${userId}/${fileName}`]);
        } catch {
          // continue with DB delete
        }
      }
      await deleteFile(fileToDelete);
      realtimeManager.triggerUpdate({ type: 'file', id: fileToDelete, action: 'deleted', timestamp: new Date() });
      setFileToDelete(null);
      await loadAll();
      toast({ title: 'Upload deleted' });
    } catch {
      toast({ title: 'Delete failed', variant: 'destructive' });
    }
  };

  const openVideoDialog = (video?: VideoResource) => {
    if (video) {
      setVideoForm({ ...video, urlInput: video.embedUrl });
    } else {
      setVideoForm({ id: crypto.randomUUID(), name: '', description: '', uploadedBy: 'SLxAI', urlInput: '' });
    }
    setVideoDialogOpen(true);
  };

  const saveVideo = async () => {
    const embed = parseVideoEmbed(videoForm.urlInput || '');
    if (!videoForm.name?.trim() || !embed) {
      toast({ title: 'Title and valid YouTube/Vimeo URL required', variant: 'destructive' });
      return;
    }
    setIsSaving(true);
    try {
      const payload: VideoResource = {
        id: videoForm.id || crypto.randomUUID(),
        name: videoForm.name.trim(),
        type: 'video',
        lastModified: 'Just now',
        uploadedBy: videoForm.uploadedBy?.trim() || 'SLxAI',
        description: videoForm.description?.trim(),
        embedUrl: embed.embedUrl,
      };
      const existing = isVideoDbId(payload.id) ? videos.find((v) => v.id === payload.id) : undefined;
      if (existing && isVideoDbId(existing.id)) {
        await updateVideo(payload.id, payload);
      } else {
        await addVideo({ ...payload, id: crypto.randomUUID() });
      }
      setVideoDialogOpen(false);
      await loadAll();
      toast({ title: 'Video saved' });
    } catch {
      toast({ title: 'Save failed', variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };

  const confirmDeleteVideo = async () => {
    if (!videoToDelete) return;
    if (!isVideoDbId(videoToDelete)) {
      toast({
        title: 'Built-in catalog video',
        description: 'Click “Import company catalog” first, then delete the imported copy from the database.',
        variant: 'destructive',
      });
      setVideoToDelete(null);
      return;
    }
    try {
      await deleteVideo(videoToDelete);
      setVideoToDelete(null);
      await loadAll();
      toast({ title: 'Video deleted' });
    } catch {
      toast({ title: 'Delete failed', variant: 'destructive' });
    }
  };

  const handleImportCompanyVideos = async () => {
    setIsSaving(true);
    try {
      const count = await importCompanyVideosCatalog();
      await loadAll();
      toast({
        title: count > 0 ? `Imported ${count} videos` : 'Catalog already imported',
        description: count > 0 ? 'Member company videos are now editable in the database.' : undefined,
      });
    } catch {
      toast({ title: 'Import failed', variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSeedCurated = async () => {
    setIsSaving(true);
    try {
      const count = await seedDefaultLibraryResources();
      await loadAll();
      toast({ title: `Seeded ${count} curated resources` });
    } catch {
      toast({ title: 'Seed failed — run LIBRARY_RESOURCES_SCHEMA.sql in Supabase', variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-electric-blue" />
            Library Admin
          </CardTitle>
          <CardDescription>
            Manage curated links, member uploads, and educational videos for each library section.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={handleSeedCurated} disabled={isSaving}>
            Seed default curated links
          </Button>
          <Button variant="outline" size="sm" onClick={loadAll} disabled={isLoading}>
            Refresh
          </Button>
        </CardContent>
      </Card>

      <Tabs value={activeSection} onValueChange={(v) => setActiveSection(v as LibraryContentType)}>
        <TabsList className="flex h-auto flex-wrap gap-1">
          {LIBRARY_CONTENT_SECTIONS.map((section) => {
            const Icon = SECTION_ICONS[section.type];
            return (
              <TabsTrigger key={section.type} value={section.type} className="text-xs sm:text-sm">
                <Icon className="mr-1.5 h-4 w-4" />
                {section.title}
              </TabsTrigger>
            );
          })}
        </TabsList>

        {LIBRARY_CONTENT_SECTIONS.map((section) => (
          <TabsContent key={section.type} value={section.type} className="space-y-6">
            {isLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-electric-blue" />
              </div>
            ) : (
              <>
                <Card className="glass-card">
                  <CardHeader className="flex flex-row items-center justify-between gap-4">
                    <div>
                      <CardTitle className="text-lg">Curated links</CardTitle>
                      <CardDescription>External resources shown at the top of this section.</CardDescription>
                    </div>
                    <Button size="sm" onClick={() => openCuratedDialog()} className="bg-electric-blue hover:bg-electric-blue/90">
                      <Plus className="mr-2 h-4 w-4" />
                      Add link
                    </Button>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {getSectionCurated(section.type).length === 0 ? (
                      <p className="py-4 text-center text-sm text-gray-500">No curated links yet.</p>
                    ) : (
                      getSectionCurated(section.type).map((resource) => (
                        <div
                          key={resource.id}
                          className="flex items-start justify-between gap-3 rounded-lg border border-gray-200 p-3 dark:border-[hsl(217,35%,25%)]"
                        >
                          <div className="min-w-0">
                            <p className="font-medium text-gray-900 dark:text-white">{resource.title}</p>
                            <p className="truncate text-xs text-gray-500">{resource.url}</p>
                          </div>
                          <div className="flex shrink-0 gap-1">
                            <Button variant="ghost" size="sm" onClick={() => openCuratedDialog(resource)}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => setCuratedToDelete(resource.id)}>
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                        </div>
                      ))
                    )}
                  </CardContent>
                </Card>

                {section.type === 'educational_video' && (
                  <Card className="glass-card border-electric-blue/30">
                    <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <CardTitle className="text-lg">Educational videos</CardTitle>
                        <CardDescription>
                          {videos.length} video{videos.length === 1 ? '' : 's'} — member company catalog plus any you add.
                          Edit title, URL, or description; import to database to enable delete.
                        </CardDescription>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Button variant="outline" size="sm" onClick={handleImportCompanyVideos} disabled={isSaving}>
                          Import to database
                        </Button>
                        <Button size="sm" onClick={() => openVideoDialog()} className="bg-electric-blue hover:bg-electric-blue/90">
                          <Plus className="mr-2 h-4 w-4" />
                          Add video
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {videos.length === 0 ? (
                        <p className="py-4 text-center text-sm text-gray-500">
                          No videos found. Click Add video or Import to database.
                        </p>
                      ) : (
                        videos.map((video) => (
                          <div
                            key={video.id}
                            className="flex items-start justify-between gap-3 rounded-lg border border-gray-200 p-3 dark:border-[hsl(217,35%,25%)]"
                          >
                            <div className="min-w-0 flex-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <p className="font-medium text-gray-900 dark:text-white">{video.name}</p>
                                {!isVideoDbId(video.id) && (
                                  <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-medium uppercase text-amber-800 dark:bg-amber-900/40 dark:text-amber-200">
                                    Catalog
                                  </span>
                                )}
                              </div>
                              <p className="truncate text-xs text-gray-500">{video.embedUrl}</p>
                              {video.description && (
                                <p className="mt-1 line-clamp-2 text-xs text-gray-600 dark:text-gray-300">
                                  {video.description}
                                </p>
                              )}
                              {video.uploadedBy && (
                                <p className="text-xs text-gray-400">{video.uploadedBy}</p>
                              )}
                            </div>
                            <div className="flex shrink-0 gap-1">
                              <Button variant="ghost" size="sm" onClick={() => openVideoDialog(video)} title="Edit">
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm" onClick={() => setVideoToDelete(video.id)} title="Delete">
                                <Trash2 className="h-4 w-4 text-red-500" />
                              </Button>
                            </div>
                          </div>
                        ))
                      )}
                    </CardContent>
                  </Card>
                )}

                <Card className="glass-card">
                  <CardHeader>
                    <CardTitle className="text-lg">Member uploads</CardTitle>
                    <CardDescription>Files and embeds members added via the Library upload tab.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {getSectionFiles(section.type).length === 0 ? (
                      <p className="py-4 text-center text-sm text-gray-500">No member uploads in this section.</p>
                    ) : (
                      getSectionFiles(section.type).map((file) => (
                        <div
                          key={file.id}
                          className="flex items-start justify-between gap-3 rounded-lg border border-gray-200 p-3 dark:border-[hsl(217,35%,25%)]"
                        >
                          <div className="min-w-0">
                            <p className="font-medium text-gray-900 dark:text-white">{file.name}</p>
                            <p className="text-xs text-gray-500">
                              {file.uploadedBy} · {file.lastModified}
                            </p>
                          </div>
                          <div className="flex shrink-0 gap-1">
                            <Button variant="ghost" size="sm" onClick={() => setFileToEdit({ ...file })}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => setFileToDelete(file.id)}>
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                        </div>
                      ))
                    )}
                  </CardContent>
                </Card>
              </>
            )}
          </TabsContent>
        ))}
      </Tabs>

      <Dialog open={curatedDialogOpen} onOpenChange={setCuratedDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{curatedForm.title ? 'Edit curated link' : 'Add curated link'}</DialogTitle>
            <DialogDescription>Shown in the {LIBRARY_CONTENT_SECTIONS.find((s) => s.type === activeSection)?.title} section.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Title</Label>
              <Input value={curatedForm.title} onChange={(e) => setCuratedForm({ ...curatedForm, title: e.target.value })} />
            </div>
            <div>
              <Label>URL</Label>
              <Input value={curatedForm.url} onChange={(e) => setCuratedForm({ ...curatedForm, url: e.target.value })} />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea value={curatedForm.description} onChange={(e) => setCuratedForm({ ...curatedForm, description: e.target.value })} />
            </div>
            <div>
              <Label>Source</Label>
              <Input value={curatedForm.source || ''} onChange={(e) => setCuratedForm({ ...curatedForm, source: e.target.value })} />
            </div>
            <div>
              <Label>Tags (comma-separated)</Label>
              <Input
                value={(curatedForm.tags || []).join(', ')}
                onChange={(e) =>
                  setCuratedForm({
                    ...curatedForm,
                    tags: e.target.value.split(',').map((t) => t.trim()).filter(Boolean),
                  })
                }
              />
            </div>
            <Button onClick={saveCurated} disabled={isSaving} className="w-full bg-electric-blue hover:bg-electric-blue/90">
              <Save className="mr-2 h-4 w-4" />
              Save
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!fileToEdit} onOpenChange={(open) => !open && setFileToEdit(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit member upload</DialogTitle>
          </DialogHeader>
          {fileToEdit && (
            <div className="space-y-3">
              <div>
                <Label>Title</Label>
                <Input value={fileToEdit.name} onChange={(e) => setFileToEdit({ ...fileToEdit, name: e.target.value })} />
              </div>
              <div>
                <Label>Library section</Label>
                <Select
                  value={fileToEdit.libraryType || 'files'}
                  onValueChange={(v) => setFileToEdit({ ...fileToEdit, libraryType: v as LibraryContentType })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {LIBRARY_CONTENT_SECTIONS.map((s) => (
                      <SelectItem key={s.type} value={s.type}>
                        {s.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Description</Label>
                <Textarea
                  value={fileToEdit.description || ''}
                  onChange={(e) => setFileToEdit({ ...fileToEdit, description: e.target.value })}
                />
              </div>
              <Button onClick={saveFileEdit} disabled={isSaving} className="w-full bg-electric-blue hover:bg-electric-blue/90">
                Save changes
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={videoDialogOpen} onOpenChange={setVideoDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{videoForm.id && videos.some((v) => v.id === videoForm.id) ? 'Edit video' : 'Add video'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Title</Label>
              <Input value={videoForm.name || ''} onChange={(e) => setVideoForm({ ...videoForm, name: e.target.value })} />
            </div>
            <div>
              <Label>YouTube or Vimeo URL</Label>
              <Input value={videoForm.urlInput || ''} onChange={(e) => setVideoForm({ ...videoForm, urlInput: e.target.value })} />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea value={videoForm.description || ''} onChange={(e) => setVideoForm({ ...videoForm, description: e.target.value })} />
            </div>
            <div>
              <Label>Source / organization</Label>
              <Input value={videoForm.uploadedBy || ''} onChange={(e) => setVideoForm({ ...videoForm, uploadedBy: e.target.value })} />
            </div>
            <Button onClick={saveVideo} disabled={isSaving} className="w-full bg-electric-blue hover:bg-electric-blue/90">
              Save video
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!curatedToDelete} onOpenChange={(open) => !open && setCuratedToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete curated link?</AlertDialogTitle>
            <AlertDialogDescription>This cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteCurated} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!fileToDelete} onOpenChange={(open) => !open && setFileToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete member upload?</AlertDialogTitle>
            <AlertDialogDescription>Removes the file from storage and the library.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteFile} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!videoToDelete} onOpenChange={(open) => !open && setVideoToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete video?</AlertDialogTitle>
            <AlertDialogDescription>Removes this video from the educational videos section.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteVideo} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
