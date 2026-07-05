import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { PageTitle } from '@/components/PageTitle';
import { useIsLandscape } from '@/hooks/use-mobile';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Shield, Users, Building2, MessageSquare, Vote as VoteIcon, FileText, Video,
  Settings, TrendingUp, AlertCircle, CheckCircle2, XCircle, Edit, Trash2,
  Plus, Search, Filter, Save, X, Hand, Mail, Globe, Upload, History, Calendar, Clock, Folder,
  Download, Loader2, CheckSquare, Square, Pencil, GripVertical, Hash, Pin, User, MessageCircle, Ticket, Phone, RefreshCw
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Member, MemberPerson } from '@/data/members';
import { getAllMembers, deleteMember as deleteMemberData, updateMember, addMember as addMemberData } from '@/data/membersData';
import { sendEmail, createEmailTemplate } from '@/lib/email';
import { useMemo, useState as useReactState } from 'react';
import { getCountryFlag } from '@/lib/countryFlags';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  useDroppable,
  rectIntersection,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { 
  getOrderedFiles, 
  updateFilesOrder, 
  FileResource,
  getCategories,
  addCategory,
  updateCategory,
  deleteCategory,
  updateCategoriesOrder,
  FileCategory,
  updateFile,
  deleteFile,
} from '@/data/filesOrder';
import {
  getAllVotes,
  getActiveVotes,
  getPastVotes,
  addVote,
  updateVote,
  deleteVote,
  getVoteById,
  calculateVoteResult,
  Vote,
  VoteOption,
} from '@/data/votes';
import { isValidEmail, isValidUrl, isValidLength, sanitizeText, sanitizeFilename } from '@/lib/security';
import { Navigate } from 'react-router-dom';
import { getSettings, saveSettings, PortalSettings } from '@/lib/settings';
import { collectAdminBackupData, triggerBackupDownload } from '@/lib/adminBackup';
import { buildStorageBackupZip, triggerStorageBackupDownload } from '@/lib/storageBackup';
import { getActivities, addActivity } from '@/lib/activityLog';
import { exportToCSV, exportToJSON, parseCSV } from '@/lib/export';
import { getCurrentUser, getUserRole, isAdmin, isSuperAdmin, refreshUserSession } from '@/lib/auth';
import { canManageRoles, canDeleteMembers, UserRole } from '@/lib/roles';
import { supabase } from '@/lib/supabase';
import { getMetrics, trackPageView, trackEvent } from '@/lib/analytics';
import { addNotification } from '@/lib/notifications';
import { realtimeManager } from '@/lib/realtime';
import AnalyticsDashboard from '@/components/AnalyticsDashboard';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getChannels, getMessages, deleteMessage, deleteChannel, updateChannelsOrder, type Channel as ChannelType, type Message as MessageType } from '@/data/discussions';
import { getSummitMembers, addSummitMember, removeSummitMember, SummitMember } from '@/data/summit';

// Bylaws public feedback (from /bylaws page)
interface BylawsFeedbackEntry {
  id: string;
  name: string;
  email: string;
  organization: string;
  message: string;
  created_at: string;
}

function BylawsFeedbackTab() {
  const { toast } = useToast();
  const [entries, setEntries] = useState<BylawsFeedbackEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [entryToDelete, setEntryToDelete] = useState<string | null>(null);
  const [showEmptyConfirm, setShowEmptyConfirm] = useState(false);
  const [isEmptying, setIsEmptying] = useState(false);

  useEffect(() => {
    loadEntries();
  }, []);

  const loadEntries = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('bylaws_feedback')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setEntries((data as BylawsFeedbackEntry[]) || []);
    } catch (error: unknown) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error loading bylaws feedback:', error);
      }
      const errorMessage =
        error && typeof error === 'object' && 'message' in error
          ? String((error as { message?: string }).message)
          : 'Failed to load bylaws feedback.';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteEntry = async () => {
    if (!entryToDelete) return;
    try {
      const { error } = await supabase.from('bylaws_feedback').delete().eq('id', entryToDelete);
      if (error) throw error;
      toast({ title: 'Deleted', description: 'Bylaws feedback entry has been deleted.' });
      setEntryToDelete(null);
      loadEntries();
    } catch (error: unknown) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error deleting bylaws feedback:', error);
      }
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to delete entry.',
        variant: 'destructive',
      });
    }
  };

  const handleEmptyAll = async () => {
    setIsEmptying(true);
    try {
      const { data: allRows, error: selectError } = await supabase.from('bylaws_feedback').select('id');
      if (selectError) throw selectError;
      if (allRows && allRows.length > 0) {
        const ids = allRows.map((r: { id: string }) => r.id);
        const { error } = await supabase.from('bylaws_feedback').delete().in('id', ids);
        if (error) throw error;
      }
      toast({
        title: 'Cleared',
        description: `All ${entries.length} bylaws feedback entries have been deleted.`,
      });
      setShowEmptyConfirm(false);
      loadEntries();
    } catch (error: unknown) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error emptying bylaws feedback:', error);
      }
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to clear entries.',
        variant: 'destructive',
      });
    } finally {
      setIsEmptying(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const exportToCSV = () => {
    if (entries.length === 0) {
      toast({
        title: 'No Data',
        description: 'There are no entries to export.',
        variant: 'destructive',
      });
      return;
    }
    const headers = ['Name', 'Email', 'Organization', 'Message', 'Submitted'];
    const rows = entries.map((entry) => {
      const date = formatDate(entry.created_at);
      return [entry.name, entry.email, entry.organization, entry.message, date];
    });
    const csvContent = [
      headers.join(','),
      ...rows.map((row) =>
        row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')
      ),
    ].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `bylaws-feedback-export-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast({
      title: 'Export Successful',
      description: `Exported ${entries.length} entr${entries.length === 1 ? 'y' : 'ies'} to CSV.`,
    });
  };

  return (
    <Card className="glass-card floating-hover">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <CardTitle>Bylaws feedback</CardTitle>
            <CardDescription>
              Public submissions from the Bylaws page ({' '}
              <code className="text-xs">/bylaws</code>
              )
            </CardDescription>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button onClick={exportToCSV} variant="outline" size="sm" className="bg-white">
              <FileText className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
            <Button onClick={loadEntries} variant="outline" size="sm" className="bg-white">
              <History className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            {entries.length > 0 && (
              <Button
                onClick={() => setShowEmptyConfirm(true)}
                variant="outline"
                size="sm"
                className="bg-white text-red-600 hover:text-red-700 hover:bg-red-50 border-red-300"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete all
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-electric-blue" />
          </div>
        ) : entries.length === 0 ? (
          <div className="text-center py-12">
            <MessageSquare className="h-12 w-12 text-gray-400 dark:text-white mx-auto mb-4" />
            <p className="text-gray-600 dark:text-white">No bylaws feedback yet.</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              Ensure the <code className="text-xs">bylaws_feedback</code> table exists in Supabase (see BYLAWS_FEEDBACK_SCHEMA.sql).
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {entries.map((entry, index) => (
              <Card
                key={entry.id}
                className="bg-white dark:bg-[hsl(217,40%,18%)] border-gray-200 dark:border-[hsl(217,35%,25%)]"
              >
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-3 min-w-0">
                      <div className="flex items-center gap-3 flex-wrap">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-electric-blue/10 text-electric-blue font-semibold text-sm shrink-0">
                          #{entries.length - index}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                            <User className="h-4 w-4 shrink-0" />
                            {entry.name}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-white flex items-center gap-1 mt-1">
                            <Mail className="h-3 w-3 shrink-0" />
                            {entry.email}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-white flex items-center gap-1 mt-1">
                            <Building2 className="h-3 w-3 shrink-0" />
                            {entry.organization}
                          </p>
                        </div>
                      </div>
                      <div className="pl-0 sm:pl-11 border-t border-gray-100 dark:border-gray-700 pt-3">
                        <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Message</p>
                        <div className="text-sm text-gray-800 dark:text-gray-100 whitespace-pre-wrap max-h-48 overflow-y-auto rounded-md bg-gray-50 dark:bg-gray-900/50 p-3">
                          {entry.message}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-white">
                        <Clock className="h-3 w-3" />
                        {formatDate(entry.created_at)}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEntryToDelete(entry.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 shrink-0"
                      aria-label="Delete entry"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>

      <AlertDialog open={!!entryToDelete} onOpenChange={(open) => !open && setEntryToDelete(null)}>
        <AlertDialogContent className="bg-white dark:bg-[hsl(217,40%,18%)] border-gray-200 dark:border-[hsl(217,35%,25%)]">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-gray-900 dark:text-white">Delete this entry?</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-600 dark:text-white">
              This bylaws feedback will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => setEntryToDelete(null)}
              className="border-gray-300 dark:border-[hsl(217,35%,25%)] text-gray-700 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800 bg-white"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteEntry} className="bg-red-600 hover:bg-red-700 text-white">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showEmptyConfirm} onOpenChange={(open) => !open && setShowEmptyConfirm(false)}>
        <AlertDialogContent className="bg-white dark:bg-[hsl(217,40%,18%)] border-gray-200 dark:border-[hsl(217,35%,25%)]">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-gray-900 dark:text-white">Delete all bylaws feedback?</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-600 dark:text-white">
              Are you sure you want to delete all {entries.length} entr{entries.length === 1 ? 'y' : 'ies'}? This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => setShowEmptyConfirm(false)}
              className="border-gray-300 dark:border-[hsl(217,35%,25%)] text-gray-700 dark:text-white bg-white"
              disabled={isEmptying}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleEmptyAll}
              className="bg-red-600 hover:bg-red-700 text-white"
              disabled={isEmptying}
            >
              {isEmptying ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting…
                </>
              ) : (
                'Delete all'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}

// Droppable Category Container Component
function DroppableCategory({ 
  category, 
  files, 
  onCategoryChange,
  onEditCategory,
  onDeleteCategory,
  onDeleteFile,
  onRenameFile
}: { 
  category: FileCategory | null; // null for uncategorized (deprecated, use "Other" instead)
  files: FileResource[];
  onCategoryChange: (fileId: string, categoryId: string) => void;
  onEditCategory?: (category: FileCategory) => void;
  onDeleteCategory?: (categoryId: string) => void;
  onDeleteFile?: (fileId: string) => void;
  onRenameFile?: (file: FileResource) => void;
}) {
  const categoryId = category?.id || 'other';
  const { setNodeRef, isOver } = useDroppable({
    id: `category-${categoryId}`,
  });

  return (
    <div
      className={`p-4 border-2 rounded-lg transition-colors ${
        isOver 
          ? 'border-electric-blue bg-blue-50 dark:bg-blue-900/20' 
          : 'border-gray-200 dark:border-[hsl(217,35%,25%)] bg-white dark:bg-[hsl(217,40%,18%)]'
      }`}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {category ? (
            <>
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: category.color }}
              />
              <h3 className="font-semibold text-gray-900 dark:text-white">{category.name}</h3>
            </>
          ) : (
            <>
              <Folder className="h-4 w-4 text-gray-400 dark:text-white" />
              <h3 className="font-semibold text-gray-900 dark:text-white">Uncategorized</h3>
            </>
          )}
        </div>
        {category && onEditCategory && (
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEditCategory(category)}
              className="h-7 px-2"
            >
              <Edit className="h-3 w-3" />
            </Button>
            {category.id !== 'other' && onDeleteCategory && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDeleteCategory(category.id)}
                className="h-7 px-2 text-red-600 hover:text-red-700"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            )}
          </div>
        )}
      </div>
      <SortableContext
        items={files.map(f => f.id)}
        strategy={verticalListSortingStrategy}
      >
        <div 
          ref={setNodeRef}
          className={`space-y-2 min-h-[50px] ${
            isOver ? 'bg-blue-50 dark:bg-blue-900/20' : ''
          }`}
        >
          {files.length === 0 ? (
            <div className={`text-sm text-gray-400 dark:text-white text-center py-4 border-2 border-dashed rounded transition-colors ${
              isOver 
                ? 'border-electric-blue bg-blue-50 dark:bg-blue-900/20 dark:border-electric-blue' 
                : 'border-gray-200 dark:border-[hsl(217,35%,25%)]'
            }`}>
              Drop files here
            </div>
          ) : (
            files.map((file) => (
              <SortableFileRow key={file.id} file={file} onDelete={onDeleteFile} onRename={onRenameFile} />
            ))
          )}
        </div>
      </SortableContext>
    </div>
  );
}

// Sortable File Row Component (simplified, no dropdown)
function SortableFileRow({ file, onDelete, onRename }: { file: FileResource; onDelete?: (fileId: string) => void; onRename?: (file: FileResource) => void }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: file.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'spreadsheet':
        return <FileText className="h-4 w-4 text-green-600" />;
      case 'ebook':
        return <FileText className="h-4 w-4 text-purple-500" />;
      default:
        return <FileText className="h-4 w-4 text-electric-blue" />;
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-3 p-3 border border-gray-200 dark:border-[hsl(217,35%,25%)] rounded-lg bg-white dark:bg-[hsl(217,40%,18%)] hover:bg-gray-50 dark:hover:bg-gray-800 dark:hover:bg-gray-800"
    >
      <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing">
        <GripVertical className="h-5 w-5 text-gray-400 dark:text-white flex-shrink-0" />
      </div>
      {getFileIcon(file.type)}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{file.name}</p>
        <p className="text-xs text-gray-500 dark:text-white">{file.uploadedBy} • {file.lastModified}</p>
      </div>
      <div className="flex items-center gap-1 flex-shrink-0">
        {onRename && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onRename(file)}
            className="h-7 px-2 text-gray-600 dark:text-white hover:text-gray-900 dark:text-white flex-shrink-0"
            title="Rename"
          >
            <Pencil className="h-3 w-3" />
          </Button>
        )}
        {onDelete && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(file.id)}
            className="h-7 px-2 text-red-600 hover:text-red-700 flex-shrink-0"
            title="Delete"
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        )}
      </div>
    </div>
  );
}

// Sortable Category Component
function SortableCategory({ 
  category, 
  files, 
  onCategoryChange,
  onEditCategory,
  onDeleteCategory,
  onDeleteFile,
  onRenameFile
}: { 
  category: FileCategory;
  files: FileResource[];
  onCategoryChange: (fileId: string, categoryId: string) => void;
  onEditCategory?: (category: FileCategory) => void;
  onDeleteCategory?: (categoryId: string) => void;
  onDeleteFile?: (fileId: string) => void;
  onRenameFile?: (file: FileResource) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: category.id });

  const { setNodeRef: setDroppableRef, isOver } = useDroppable({
    id: `category-${category.id}`,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={(node) => {
        setNodeRef(node);
        setDroppableRef(node);
      }}
      style={style}
      className={`p-4 border-2 rounded-lg transition-colors ${
        isOver 
          ? 'border-electric-blue bg-blue-50' 
          : 'border-gray-200 dark:border-[hsl(217,35%,25%)] bg-white dark:bg-[hsl(217,40%,18%)]'
      }`}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing">
            <GripVertical className="h-4 w-4 text-gray-400 dark:text-white" />
          </div>
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: category.color }}
          />
          <h3 className="font-semibold text-gray-900 dark:text-white">{category.name}</h3>
        </div>
        {onEditCategory && (
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEditCategory(category)}
              className="h-7 px-2"
            >
              <Edit className="h-3 w-3" />
            </Button>
            {category.id !== 'other' && onDeleteCategory && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDeleteCategory(category.id)}
                className="h-7 px-2 text-red-600 hover:text-red-700"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            )}
          </div>
        )}
      </div>
      <SortableContext
        items={files.map(f => f.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="space-y-2 min-h-[50px]">
          {files.length === 0 ? (
            <div className="text-sm text-gray-400 dark:text-white text-center py-4 border-2 border-dashed border-gray-200 dark:border-[hsl(217,35%,25%)] rounded">
              Drop files here
            </div>
          ) : (
            files.map((file) => (
              <SortableFileRow key={file.id} file={file} onDelete={onDeleteFile} onRename={onRenameFile} />
            ))
          )}
        </div>
      </SortableContext>
    </div>
  );
}

// Sortable Channel Item Component
function SortableChannelItem({
  channel,
  isSelected,
  onSelect,
  onDelete,
  displayName,
}: {
  channel: ChannelType;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: () => void;
  displayName?: string;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: channel.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`p-3 border-b border-gray-200 dark:border-[hsl(217,35%,25%)] last:border-b-0 hover:bg-gray-50 dark:hover:bg-gray-800 dark:hover:bg-gray-800 cursor-pointer ${
        isSelected ? 'bg-electric-blue/10' : ''
      }`}
      onClick={onSelect}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 flex-1">
          <div
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing touch-none"
            onClick={(e) => e.stopPropagation()}
          >
            <GripVertical className="h-4 w-4 text-gray-400 dark:text-white hover:text-gray-600 dark:text-white" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <Hash className="h-4 w-4 text-gray-500 dark:text-white" />
              <span className="font-medium text-gray-900 dark:text-white">{displayName || channel.name}</span>
            </div>
            {channel.description && (
              <p className="text-xs text-gray-600 dark:text-white mt-1">{channel.description}</p>
            )}
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={async (e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="h-7 px-2 text-red-600 hover:text-red-700 hover:bg-red-50"
        >
          <Trash2 className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
}

export default function Admin() {
  // Authorization check - redirect if not admin or super_admin
  const [isSuperAdminUser, setIsSuperAdminUser] = useState(false);
  const [userRole, setUserRole] = useState<UserRole>('member');
  const isLandscape = useIsLandscape();
  
  // Refresh user session and update role state on mount
  useEffect(() => {
    const refreshRole = async () => {
      await refreshUserSession();
      // Small delay to ensure session is fully refreshed
      await new Promise(resolve => setTimeout(resolve, 100));
      const role = getUserRole();
      setUserRole(role);
      setIsSuperAdminUser(isSuperAdmin());
    };
    refreshRole();
  }, []);
  
  // Check admin status - use state if available, otherwise check directly
  const isAdminUser = userRole === 'admin' || userRole === 'super_admin' || isAdmin();
  
  if (!isAdminUser) {
    return <Navigate to="/membership-portal" replace />;
  }
  const canManageUserRoles = canManageRoles(userRole);
  const canDeleteUsers = canDeleteMembers(userRole);

  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [members, setMembers] = useState<Member[]>([]);
  const [isLoadingMembers, setIsLoadingMembers] = useState(true);

  // Load members from Supabase
  const loadMembers = async () => {
    setIsLoadingMembers(true);
    try {
      const data = await getAllMembers();
      // Debug: Log status counts
      if (process.env.NODE_ENV === 'development') {
        const activeCount = data.filter(m => m.status === 'active').length;
        const pendingCount = data.filter(m => m.status === 'pending').length;
        console.log('Loaded members:', { total: data.length, active: activeCount, pending: pendingCount });
      }
      setMembers(data);
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error loading members:', error);
      }
    } finally {
      setIsLoadingMembers(false);
    }
  };

  useEffect(() => {
    loadMembers();
  }, []);

  // Load votes from Supabase
  useEffect(() => {
    const loadVotes = async () => {
      setIsLoadingVotes(true);
      try {
        const data = await getAllVotes();
        setVotes(data);
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          console.error('Error loading votes:', error);
        }
      } finally {
        setIsLoadingVotes(false);
      }
    };
    loadVotes();
  }, []);

  // Load files from Supabase
  useEffect(() => {
    const loadContent = async () => {
      setIsLoadingContent(true);
      try {
        const [filesData, categoriesData] = await Promise.all([
          getOrderedFiles(),
          getCategories(),
        ]);
        
        setCategories(categoriesData);
        
        // Find "Other" category by name (since database uses UUIDs, not string IDs)
        const otherCategory = categoriesData.find(c => c.name.toLowerCase() === 'other');
        
        // Assign uncategorized files to "Other" category
        if (otherCategory) {
          // Update files that have categoryId='other' (string) to use the UUID, and files without categoryId
          const filesWithStringOther = filesData.filter(file => file.categoryId === 'other');
          const filesWithoutCategory = filesData.filter(file => !file.categoryId);
          const filesToUpdate = [...filesWithStringOther, ...filesWithoutCategory];
          if (filesToUpdate.length > 0) {
            await Promise.all(
              filesToUpdate.map(file => updateFile(file.id, { categoryId: otherCategory.id }))
            );
            // Reload files after updating
            const updatedFiles = await getOrderedFiles();
            setFiles(updatedFiles);
            setHasUnsavedFileOrder(false);
          } else {
            setFiles(filesData);
            setHasUnsavedFileOrder(false);
          }
        } else {
          if (process.env.NODE_ENV === 'development') {
            console.warn('"Other" category not found in database. Files without categories may not display.');
          }
          // Still set files, they'll be grouped under their categoryId or show as uncategorized
          setFiles(filesData);
          setHasUnsavedFileOrder(false);
        }
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          console.error('Error loading content:', error);
        }
      } finally {
        setIsLoadingContent(false);
      }
    };
    loadContent();
  }, []);

  // Load settings from Supabase
  useEffect(() => {
    const loadSettings = async () => {
      setIsLoadingSettings(true);
      try {
        const settings = await getSettings();
        setPortalSettings(settings);
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          console.error('Error loading settings:', error);
        }
      } finally {
        setIsLoadingSettings(false);
      }
    };
    loadSettings();
  }, []);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [editFormData, setEditFormData] = useState<Member | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [isAddingMember, setIsAddingMember] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedMembers, setSelectedMembers] = useState<Set<string>>(new Set());
  const [showMergeDialog, setShowMergeDialog] = useState(false);
  const [mergeTargetName, setMergeTargetName] = useState('');
  const [mergeNameOption, setMergeNameOption] = useState<'select' | 'custom'>('select');
  const [isMerging, setIsMerging] = useState(false);
  const [portalSettings, setPortalSettings] = useState<PortalSettings>({
    memberRegistration: true,
    publicDirectory: true,
    emailNotifications: true,
    contentModeration: 'auto-approve',
  });
  const [isLoadingSettings, setIsLoadingSettings] = useState(true);
  const [isDownloadingBackup, setIsDownloadingBackup] = useState(false);
  const [isDownloadingStorage, setIsDownloadingStorage] = useState(false);
  const [storageBackupStatus, setStorageBackupStatus] = useState<string | null>(null);
  const [importProgress, setImportProgress] = useState(0);
  const [isImporting, setIsImporting] = useState(false);
  const fileImportRef = useRef<HTMLInputElement>(null);
  
  // Files state
  const [files, setFiles] = useReactState<FileResource[]>([]);
  const [categories, setCategories] = useReactState<FileCategory[]>([]);
  const [isLoadingContent, setIsLoadingContent] = useState(true);
  const [hasUnsavedCategoryOrder, setHasUnsavedCategoryOrder] = useState(false);
  const [showCategoryDialog, setShowCategoryDialog] = useState(false);
  const [editingCategory, setEditingCategory] = useState<FileCategory | null>(null);
  
  // Discussions state
  const [channels, setChannels] = useState<ChannelType[]>([]);
  const [summitChannels, setSummitChannels] = useState<ChannelType[]>([]);
  const [messages, setMessages] = useState<Record<string, MessageType[]>>({});
  const [isLoadingChannels, setIsLoadingChannels] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [selectedChannelForMessages, setSelectedChannelForMessages] = useState<string | null>(null);
  const [memberSection, setMemberSection] = useState<'companies' | 'individuals' | 'email'>('individuals');
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [showEmailDialog, setShowEmailDialog] = useState(false);
  const [summitMembers, setSummitMembers] = useState<SummitMember[]>([]);
  const [summitSearchQuery, setSummitSearchQuery] = useState('');
  const [isLoadingSummitMembers, setIsLoadingSummitMembers] = useState(false);
  const [adminSearchQuery, setAdminSearchQuery] = useState('');
  const [adminMembers, setAdminMembers] = useState<Array<{ email: string; name: string; role: UserRole; organizationName?: string }>>([]);
  const [feedbackSubmissions, setFeedbackSubmissions] = useState<Array<{ id: string; user_email: string; user_name: string | null; feedback_text: string; created_at: string }>>([]);
  const [isLoadingFeedback, setIsLoadingFeedback] = useState(false);

  // Load summit members
  useEffect(() => {
    const loadSummitMembers = async () => {
      setIsLoadingSummitMembers(true);
      try {
        const data = await getSummitMembers();
        setSummitMembers(data);
      } catch (error) {
        console.error('Error loading summit members:', error);
        toast({
          title: 'Error',
          description: 'Failed to load summit members.',
          variant: 'destructive',
        });
      } finally {
        setIsLoadingSummitMembers(false);
      }
    };
    // Load data (role refresh happens in separate useEffect above)
    loadSummitMembers();
    loadAdminMembers();
    loadFeedbackSubmissions();
  }, []);

  // Load feedback submissions
  const loadFeedbackSubmissions = async () => {
    setIsLoadingFeedback(true);
    try {
      const { data, error } = await supabase
        .from('feedback_submissions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      setFeedbackSubmissions(data || []);
    } catch (error: any) {
      console.error('Error loading feedback submissions:', error);
      toast({
        title: "Error",
        description: error?.message || "Failed to load feedback submissions.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingFeedback(false);
    }
  };

  // Load admin members
  const loadAdminMembers = async () => {
    try {
      // Refresh current user session first to ensure we have latest role
      await refreshUserSession();
      
      // Get current user to ensure they're included
      const currentUser = getCurrentUser();
      
      // Try to query user_roles table first (if it exists)
      // Note: This table may not exist, so we gracefully fall back to members table
      // Skip query if we've already determined the table doesn't exist (stored in sessionStorage)
      const userRolesTableExists = sessionStorage.getItem('user_roles_table_exists');
      let roleData = null;
      let roleError = null;
      
      if (userRolesTableExists !== 'false') {
        try {
          const result = await supabase
            .from('user_roles')
            .select('email, role, full_name, organization_id')
            .in('role', ['admin', 'super_admin']);
          roleData = result.data;
          roleError = result.error;
          
          // If table doesn't exist (404 or PGRST116), mark it and skip future queries
          if (roleError && (
            roleError.code === 'PGRST116' || 
            roleError.code === '42P01' ||
            roleError.message?.includes('not found') || 
            roleError.message?.includes('does not exist') ||
            roleError.message?.includes('relation') ||
            (roleError as any).status === 404 ||
            (roleError as any).statusCode === 404 ||
            roleError.message?.includes('404')
          )) {
            // Table doesn't exist - this is expected, silently handle it
            sessionStorage.setItem('user_roles_table_exists', 'false');
            roleData = null;
            roleError = null;
          } else if (!roleError && roleData) {
            // Table exists and we got data
            sessionStorage.setItem('user_roles_table_exists', 'true');
          } else if (roleError) {
            // Other error - log only in dev mode
            if (process.env.NODE_ENV === 'development') {
              console.warn('Error querying user_roles table:', roleError);
            }
            // Still mark as not existing to avoid repeated queries
            sessionStorage.setItem('user_roles_table_exists', 'false');
            roleData = null;
            roleError = null;
          }
        } catch (e: any) {
          // Silently catch and use fallback - table doesn't exist
          if (process.env.NODE_ENV === 'development') {
            console.warn('user_roles table not found, using fallback:', e);
          }
          sessionStorage.setItem('user_roles_table_exists', 'false');
          roleData = null;
          roleError = null;
        }
      }

      const adminList: Array<{ email: string; name: string; role: UserRole; organizationName?: string }> = [];
      
      if (!roleError && roleData) {
        // Process role data from user_roles table
        for (const row of roleData) {
          let organizationName = '';
          const orgId = row.organization_id;

          if (orgId) {
            try {
              const { data: orgData, error: orgError } = await supabase
                .from('members')
                .select('organization_name')
                .eq('id', orgId)
                .single();

              if (!orgError && orgData) {
                organizationName = (orgData as { organization_name?: string }).organization_name || '';
              }
            } catch (e) {
              // Ignore error, continue without org name
            }
          }

          adminList.push({
            email: row.email,
            name: row.full_name || row.email.split('@')[0],
            role: row.role as UserRole,
            organizationName: organizationName,
          });
        }
      }
      
      // Also check members table for admin/super_admin roles (fallback or additional source)
      try {
        const allMembers = await getAllMembers();
        allMembers.forEach(member => {
          member.members.forEach(person => {
            if (person.role === 'admin' || person.role === 'super_admin') {
              const alreadyInList = adminList.some(a => a.email.toLowerCase() === person.email.toLowerCase());
              if (!alreadyInList) {
                adminList.push({
                  email: person.email,
                  name: person.name,
                  role: person.role as UserRole,
                  organizationName: member.organizationName,
                });
              }
            }
          });
        });
      } catch (e) {
        console.error('Error loading from members table:', e);
      }
      
      // ALWAYS include current user if they're an admin or super_admin, even if not in other sources
      if (currentUser && (currentUser.role === 'admin' || currentUser.role === 'super_admin')) {
        const alreadyInList = adminList.some(a => a.email.toLowerCase() === currentUser.email.toLowerCase());
        if (!alreadyInList) {
          // Try to get organization name from members table
          let orgName = '';
          try {
            const allMembers = await getAllMembers();
            const orgMember = allMembers.find(m => 
              m.members.some(p => p.email.toLowerCase() === currentUser.email.toLowerCase())
            );
            orgName = orgMember?.organizationName || '';
          } catch (e) {
            // Ignore error
          }
          
          adminList.push({
            email: currentUser.email,
            name: currentUser.name,
            role: currentUser.role,
            organizationName: orgName,
          });
        } else {
          // Update existing entry with current user's role to ensure it's accurate
          const index = adminList.findIndex(a => a.email.toLowerCase() === currentUser.email.toLowerCase());
          if (index >= 0) {
            adminList[index].role = currentUser.role;
            adminList[index].name = currentUser.name;
          }
        }
      }
      
      setAdminMembers(adminList);
    } catch (error) {
      console.error('Error loading admin members:', error);
    }
  };

  // Function to load all channels
  const loadAllChannels = async () => {
    setIsLoadingChannels(true);
    try {
      const allChannels = await getChannels();
      // Separate main discussions (not starting with "summit-") and summit discussions
      // Use case-insensitive matching to catch any variations
      const mainChannels = allChannels.filter(c => !c.name.toLowerCase().startsWith('summit-'));
      const summitChans = allChannels.filter(c => c.name.toLowerCase().startsWith('summit-'));
      
      // Debug logging to help identify missing channels
      if (process.env.NODE_ENV === 'development') {
        console.log('All channels loaded:', allChannels.map(c => c.name));
        console.log('Main channels:', mainChannels.map(c => c.name));
        console.log('Summit channels:', summitChans.map(c => c.name));
      }
      
      setChannels(mainChannels);
      setSummitChannels(summitChans);
    } catch (error: any) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error loading channels:', error);
      }
      const errorMessage = error?.message || 'Failed to load channels.';
      const isSchemaError = errorMessage.includes('not found') || errorMessage.includes('does not exist') || errorMessage.includes('DISCUSSIONS_SCHEMA');
      toast({
        title: "Error Loading Channels",
        description: isSchemaError 
          ? "Discussions tables not found. Please run DISCUSSIONS_SCHEMA.sql in Supabase SQL Editor first."
          : errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoadingChannels(false);
    }
  };

  // Load channels for Discussions tab on mount
  useEffect(() => {
    loadAllChannels();
  }, []);

  // Load messages when a channel is selected
  useEffect(() => {
    if (!selectedChannelForMessages) return;
    
    const loadChannelMessages = async () => {
      setIsLoadingMessages(true);
      try {
        const channelMessages = await getMessages(selectedChannelForMessages);
        setMessages(prev => ({
          ...prev,
          [selectedChannelForMessages]: channelMessages,
        }));
      } catch (error: any) {
        if (process.env.NODE_ENV === 'development') {
          console.error('Error loading messages:', error);
        }
        toast({
          title: "Error Loading Messages",
          description: error?.message || "Failed to load messages.",
          variant: "destructive",
        });
      } finally {
        setIsLoadingMessages(false);
      }
    };
    
    loadChannelMessages();
  }, [selectedChannelForMessages]);

  // Handle channels drag end for Main Discussions
  const handleChannelsDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = channels.findIndex(c => c.id === active.id);
    const newIndex = channels.findIndex(c => c.id === over.id);

    if (oldIndex !== -1 && newIndex !== -1) {
      const newChannels = arrayMove(channels, oldIndex, newIndex);
      setChannels(newChannels);
      
      try {
        await updateChannelsOrder(newChannels.map(c => c.id));
        toast({
          title: "Order updated",
          description: "Channels order has been saved.",
        });
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          console.error('Error updating channels order:', error);
        }
        toast({
          title: "Error",
          description: "Failed to save channels order.",
          variant: "destructive",
        });
        // Revert on error
        setChannels(channels);
      }
    }
  };

  // Handle channels drag end for Summit Planning Discussions
  const handleSummitChannelsDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = summitChannels.findIndex(c => c.id === active.id);
    const newIndex = summitChannels.findIndex(c => c.id === over.id);

    if (oldIndex !== -1 && newIndex !== -1) {
      const newChannels = arrayMove(summitChannels, oldIndex, newIndex);
      setSummitChannels(newChannels);
      
      try {
        await updateChannelsOrder(newChannels.map(c => c.id));
        toast({
          title: "Order updated",
          description: "Summit channels order has been saved.",
        });
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          console.error('Error updating summit channels order:', error);
        }
        toast({
          title: "Error",
          description: "Failed to save summit channels order.",
          variant: "destructive",
        });
        // Revert on error
        setSummitChannels(summitChannels);
      }
    }
  };
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryColor, setNewCategoryColor] = useState('#3b82f6');
  const [fileToDelete, setFileToDelete] = useState<string | null>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null);
  const [memberToDelete, setMemberToDelete] = useState<string | null>(null);
  const [renamingFile, setRenamingFile] = useState<FileResource | null>(null);
  const [newFileName, setNewFileName] = useState('');
  const [editingFileCategory, setEditingFileCategory] = useState<string>('');
  const [editingFileMonth, setEditingFileMonth] = useState<string>('');
  const [editingFileYear, setEditingFileYear] = useState<string>('');
  const [editingFileAuthors, setEditingFileAuthors] = useState<string[]>(['']);
  const [hasUnsavedFileOrder, setHasUnsavedFileOrder] = useState(false);
  
  // Votes state
  const [votes, setVotes] = useReactState<Vote[]>([]);
  const [isLoadingVotes, setIsLoadingVotes] = useState(true);
  const [showVoteDialog, setShowVoteDialog] = useState(false);
  const [editingVote, setEditingVote] = useState<Vote | null>(null);
  const [voteToDelete, setVoteToDelete] = useState<string | null>(null);
  const [voteFormData, setVoteFormData] = useState<Partial<Vote>>({
    title: '',
    description: '',
    organization: 'SLxAI Cooperative',
    endTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Default 7 days from now
    options: [
      { id: 'yes', label: 'Yes', votes: 0 },
      { id: 'no', label: 'No', votes: 0 },
      { id: 'abstain', label: 'Abstain', votes: 0 },
    ],
    status: 'draft',
  });

  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleFilesDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    const fileId = active.id as string;
    const overId = over.id as string;

    if (process.env.NODE_ENV === 'development') {
      console.log('Drag end:', { fileId, overId, overIdType: typeof overId });
    }

    // First, check if dropped directly into a category container
    if (typeof overId === 'string' && overId.startsWith('category-')) {
      const targetCategoryId = overId.replace('category-', '') || 'other';
      const file = files.find(f => f.id === fileId);
      
      if (process.env.NODE_ENV === 'development') {
        console.log('Dropped into category:', { targetCategoryId, fileCategoryId: file?.categoryId });
      }
      
      if (file && file.categoryId !== targetCategoryId) {
        try {
          await updateFile(fileId, { categoryId: targetCategoryId });
          const updatedFiles = await getOrderedFiles();
          setFiles(updatedFiles);
          setHasUnsavedFileOrder(false);
          const categoryName = categories.find(c => c.id === targetCategoryId)?.name || 'category';
          toast({
            title: "Category updated",
            description: `File moved to ${categoryName}.`,
          });
          return;
        } catch (error) {
          if (process.env.NODE_ENV === 'development') {
            console.error('Error updating file category:', error);
          }
          toast({
            title: "Error",
            description: "Failed to update category. Please try again.",
            variant: "destructive",
          });
          return;
        }
      }
      return;
    }

    // If dropped on a file, move to that file's category
    const activeFile = files.find(f => f.id === fileId);
    const overFile = files.find(f => f.id === overId);
    
    if (activeFile && overFile) {
      // If moving to different category, update category
      if (activeFile.categoryId !== overFile.categoryId) {
        const targetCategoryId = overFile.categoryId || 'other';
        try {
          await updateFile(fileId, { categoryId: targetCategoryId });
          const updatedFiles = await getOrderedFiles();
          setFiles(updatedFiles);
          setHasUnsavedFileOrder(false);
          const categoryName = categories.find(c => c.id === targetCategoryId)?.name || 'category';
          toast({
            title: "Category updated",
            description: `File moved to ${categoryName}.`,
          });
          return;
        } catch (error) {
          if (process.env.NODE_ENV === 'development') {
            console.error('Error updating file category:', error);
          }
          toast({
            title: "Error",
            description: "Failed to update category. Please try again.",
            variant: "destructive",
          });
          return;
        }
      }
      
      // Otherwise, handle reordering (within same category)
      if (activeFile.categoryId === overFile.categoryId) {
      // Only reorder if files are in the same category
      const targetCategoryFiles = files.filter(f => 
        (overFile.categoryId || '') === (f.categoryId || '')
      );
      
      const oldIndex = files.findIndex(f => f.id === fileId);
      const newIndexInCategory = targetCategoryFiles.findIndex(f => f.id === overId);
      
      if (oldIndex !== -1 && newIndexInCategory !== -1) {
        // Remove file from old position
        const filesWithoutActive = files.filter(f => f.id !== fileId);
        
        // Insert at new position in target category
        const targetCategoryFilesWithoutActive = targetCategoryFiles.filter(f => f.id !== fileId);
        const newIndexInList = filesWithoutActive.findIndex(f => 
          targetCategoryFilesWithoutActive[newIndexInCategory]?.id === f.id
        );
        
        // Reorder files within same category (only update local state, don't save yet)
        const insertIndex = newIndexInList >= 0 ? newIndexInList : filesWithoutActive.length;
        const newFiles = [
          ...filesWithoutActive.slice(0, insertIndex),
          activeFile,
          ...filesWithoutActive.slice(insertIndex)
        ];
        
        setFiles(newFiles);
        setHasUnsavedFileOrder(true);
      }
    }
  };
  };


  // Group files by category for display
  const filesByCategory = useMemo(() => {
    const grouped: { [key: string]: FileResource[] } = {};
    
    // Initialize with all categories
    categories.forEach(cat => {
      grouped[cat.id] = [];
    });
    
    // Group files - assign uncategorized files to "Other" category (find by name since DB uses UUIDs)
    const otherCategory = categories.find(c => c.name.toLowerCase() === 'other');
    const otherCategoryId = otherCategory?.id;
    
    files.forEach(file => {
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
          if (process.env.NODE_ENV === 'development') {
            console.warn('File', file.name, 'has categoryId', catId, 'but no matching category found. Assigning to Other.');
          }
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
  }, [files, categories]);

  const handleOpenCategoryDialog = (category?: FileCategory) => {
    if (category) {
      setEditingCategory(category);
      setNewCategoryName(category.name);
      setNewCategoryColor(category.color || '#3b82f6');
    } else {
      setEditingCategory(null);
      setNewCategoryName('');
      setNewCategoryColor('#3b82f6');
    }
    setShowCategoryDialog(true);
  };

  const handleSaveFileOrder = async () => {
    try {
      await updateFilesOrder(files.map(f => f.id));
      setHasUnsavedFileOrder(false);
      toast({
        title: "Order saved",
        description: "Files order has been saved successfully.",
      });
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error saving file order:', error);
      }
      toast({
        title: "Error",
        description: "Failed to save file order. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSaveCategory = async () => {
    if (!newCategoryName.trim()) {
      toast({
        title: "Validation error",
        description: "Category name is required.",
        variant: "destructive",
      });
      return;
    }

    try {
      if (editingCategory) {
        await updateCategory(editingCategory.id, {
          name: newCategoryName,
          color: newCategoryColor,
        });
        toast({
          title: "Category updated",
          description: "Category has been updated successfully.",
        });
      } else {
        const newCategory: FileCategory = {
          id: newCategoryName.toLowerCase().replace(/\s+/g, '-'),
          name: newCategoryName,
          color: newCategoryColor,
        };
        await addCategory(newCategory);
        toast({
          title: "Category created",
          description: "New category has been created.",
        });
      }
      const updatedCategories = await getCategories();
      setCategories(updatedCategories);
      setShowCategoryDialog(false);
      setEditingCategory(null);
      setNewCategoryName('');
      setNewCategoryColor('#3b82f6');
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error saving category:', error);
      }
      toast({
        title: "Error",
        description: "Failed to save category. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSaveCategoryOrder = async () => {
    try {
      await updateCategoriesOrder(categories.map(c => c.id));
      setHasUnsavedCategoryOrder(false);
      
      // Reload categories to ensure we have the latest data
      const updatedCategories = await getCategories();
      setCategories(updatedCategories);
      
      toast({
        title: "Order saved",
        description: "Categories order has been saved successfully.",
      });
    } catch (error: any) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error saving category order:', error);
      }
      const errorMessage = error?.message || error?.toString() || 'Unknown error';
      toast({
        title: "Error",
        description: `Failed to save category order: ${errorMessage}`,
        variant: "destructive",
      });
    }
  };

  const handleCategoriesDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = categories.findIndex(c => c.id === active.id);
    const newIndex = categories.findIndex(c => c.id === over.id);

    if (oldIndex !== -1 && newIndex !== -1) {
      const newCategories = arrayMove(categories, oldIndex, newIndex);
      setCategories(newCategories);
      setHasUnsavedCategoryOrder(true);
    }
  };

  const handleDeleteCategoryClick = (categoryId: string) => {
    // Don't allow deleting "Other" category
    if (categoryId === 'other') {
      toast({
        title: "Cannot delete",
        description: "The 'Other' category cannot be deleted.",
        variant: "destructive",
      });
      return;
    }
    setCategoryToDelete(categoryId);
  };

  const handleDeleteCategory = async () => {
    if (!categoryToDelete) return;
    
    const categoryId = categoryToDelete;
    const category = categories.find(c => c.id === categoryId);
    
    try {
      deleteCategory(categoryId);
      // Assign files from deleted category to "Other"
      await Promise.all(
        files
          .filter(file => file.categoryId === categoryId)
          .map(file => updateFile(file.id, { categoryId: 'other' }))
      );
      const updatedCategories = await getCategories();
      setCategories(updatedCategories);
      const updatedFiles = await getOrderedFiles();
      setFiles(updatedFiles);
      setCategoryToDelete(null);
      toast({
        title: "Category deleted",
        description: `Category "${category?.name}" has been deleted and its files moved to 'Other'.`,
      });
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error deleting category:', error);
      }
      toast({
        title: "Error",
        description: "Failed to delete category. Please try again.",
        variant: "destructive",
      });
      setCategoryToDelete(null);
    }
  };

  const handleDeleteFileClick = (fileId: string) => {
    setFileToDelete(fileId);
  };

  const handleDeleteFile = async () => {
    if (!fileToDelete) return;
    
    const fileId = fileToDelete;
    const file = files.find(f => f.id === fileId);
    
    if (!file) {
      toast({
        title: "Error",
        description: "File not found.",
        variant: "destructive",
      });
      setFileToDelete(null);
      return;
    }

    try {
      // Delete from Supabase Storage if fileUrl exists
      if (file.fileUrl) {
        try {
          // Extract file path from URL
          const urlParts = file.fileUrl.split('/');
          const fileName = urlParts[urlParts.length - 1];
          const userId = urlParts[urlParts.length - 2];
          const filePath = `${userId}/${fileName}`;

          const { error: storageError } = await supabase.storage
            .from('files')
            .remove([filePath]);

          if (storageError) {
            if (process.env.NODE_ENV === 'development') {
              console.warn('Error deleting file from storage:', storageError);
            }
            // Continue with database deletion even if storage deletion fails
          }
        } catch (storageError) {
          if (process.env.NODE_ENV === 'development') {
            console.warn('Error deleting file from storage:', storageError);
          }
          // Continue with database deletion even if storage deletion fails
        }
      }

      // Delete from database
      await deleteFile(fileId);

      // Refresh files list
      const updatedFiles = await getOrderedFiles();
      setFiles(updatedFiles);
      setFileToDelete(null);

      toast({
        title: "File deleted",
        description: `File "${file.name}" has been deleted successfully.`,
      });
    } catch (error: any) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error deleting file:', error);
      }
      toast({
        title: "Error",
        description: error?.message || "Failed to delete file. Please try again.",
        variant: "destructive",
      });
      setFileToDelete(null);
    }
  };

  const handleRenameFileClick = (file: FileResource) => {
    setRenamingFile(file);
    setNewFileName(file.name);
    setEditingFileCategory(file.categoryId || 'other');
    setEditingFileMonth(file.fileMonth ? file.fileMonth.toString() : '');
    setEditingFileYear(file.fileYear ? file.fileYear.toString() : new Date().getFullYear().toString());
    setEditingFileAuthors(file.authors && file.authors.length > 0 ? [...file.authors] : ['']);
  };

  const handleSaveRename = async () => {
    if (!renamingFile || !newFileName.trim()) return;

    // Validate filename length
    if (!isValidLength(newFileName.trim(), 1, 255)) {
      toast({
        title: "Validation error",
        description: "File name must be between 1 and 255 characters.",
        variant: "destructive",
      });
      return;
    }

    // Sanitize filename
    const sanitizedName = sanitizeText(newFileName.trim());

    if (!editingFileYear.trim() || isNaN(parseInt(editingFileYear))) {
      toast({
        title: "Year required",
        description: "Please enter a valid year.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Parse month and year
      const fileMonth = editingFileMonth && editingFileMonth !== 'none' ? parseInt(editingFileMonth) : undefined;
      const fileYear = parseInt(editingFileYear);
      
      // Filter out empty author names
      const authors = editingFileAuthors.filter(author => author.trim().length > 0);
      
      // Update file name, category, date, and authors, but preserve file_url
      await updateFile(renamingFile.id, { 
        name: sanitizedName,
        categoryId: editingFileCategory || renamingFile.categoryId,
        fileMonth: fileMonth,
        fileYear: fileYear,
        authors: authors.length > 0 ? authors : undefined,
      });
      
      // Refresh files list
      const updatedFiles = await getOrderedFiles();
      setFiles(updatedFiles);
      
      toast({
        title: "File updated",
        description: "The file has been updated successfully.",
      });
      
      setRenamingFile(null);
      setNewFileName('');
      setEditingFileCategory('');
      setEditingFileMonth('');
      setEditingFileYear('');
      setEditingFileAuthors(['']);
    } catch (error: any) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error renaming file:', error);
      }
      toast({
        title: "Error",
        description: error?.message || "Failed to rename file. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Vote management handlers
  const handleOpenVoteDialog = (vote?: Vote) => {
    if (vote) {
      setEditingVote(vote);
      setVoteFormData({
        title: vote.title,
        description: vote.description,
        organization: vote.organization,
        endTime: vote.endTime,
        options: vote.options,
        status: vote.status,
      });
    } else {
      setEditingVote(null);
      setVoteFormData({
        title: '',
        description: '',
        organization: 'SLxAI Cooperative',
        endTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        options: [
          { id: 'yes', label: 'Yes', votes: 0 },
          { id: 'no', label: 'No', votes: 0 },
          { id: 'abstain', label: 'Abstain', votes: 0 },
        ],
        status: 'draft',
      });
    }
    setShowVoteDialog(true);
  };

  const handleAddVoteOption = () => {
    const newOption: VoteOption = {
      id: `option-${Date.now()}`,
      label: '',
      votes: 0,
    };
    setVoteFormData(prev => ({
      ...prev,
      options: [...(prev.options || []), newOption],
    }));
  };

  const handleRemoveVoteOption = (optionId: string) => {
    if (voteFormData.options && voteFormData.options.length > 2) {
      setVoteFormData(prev => ({
        ...prev,
        options: prev.options?.filter(opt => opt.id !== optionId) || [],
      }));
    }
  };

  const handleVoteOptionChange = (optionId: string, field: keyof VoteOption, value: any) => {
    setVoteFormData(prev => ({
      ...prev,
      options: prev.options?.map(opt =>
        opt.id === optionId ? { ...opt, [field]: value } : opt
      ) || [],
    }));
  };

  const handleSaveVote = async () => {
    if (!voteFormData.title || !voteFormData.description) {
      toast({
        title: "Validation error",
        description: "Title and description are required.",
        variant: "destructive",
      });
      return;
    }

    if (!voteFormData.options || voteFormData.options.length < 2) {
      toast({
        title: "Validation error",
        description: "At least 2 vote options are required.",
        variant: "destructive",
      });
      return;
    }

    try {
      if (editingVote) {
        await updateVote(editingVote.id, {
          ...voteFormData,
          endTime: voteFormData.endTime!,
          options: voteFormData.options,
        } as Vote);
        toast({
          title: "Vote updated",
          description: "Vote has been updated successfully.",
        });
      } else {
        const newVote: Vote = {
          id: `vote-${Date.now()}`,
          title: sanitizeText(voteFormData.title!),
          description: sanitizeText(voteFormData.description!),
          organization: sanitizeText(voteFormData.organization || 'SLxAI Cooperative'),
          endTime: voteFormData.endTime!,
          options: voteFormData.options.map(opt => ({
            ...opt,
            label: sanitizeText(opt.label),
          })),
          status: voteFormData.status || 'draft',
          createdAt: new Date(),
        };
        await addVote(newVote);
        toast({
          title: "Vote created",
          description: "New vote has been created successfully.",
        });
      }
      const updatedVotes = await getAllVotes();
      setVotes(updatedVotes);
      setShowVoteDialog(false);
      setEditingVote(null);
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error saving vote:', error);
      }
      toast({
        title: "Error",
        description: "Failed to save vote. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleCloseVote = async (voteId: string) => {
    try {
      const vote = await getVoteById(voteId);
      if (vote) {
        await updateVote(voteId, { status: 'closed' });
        const updatedVotes = await getAllVotes();
        setVotes(updatedVotes);
        toast({
          title: "Vote closed",
          description: "Vote has been closed.",
        });
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error closing vote:', error);
      }
      toast({
        title: "Error",
        description: "Failed to close vote. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteVote = async () => {
    if (voteToDelete) {
      try {
        await deleteVote(voteToDelete);
        const updatedVotes = await getAllVotes();
        setVotes(updatedVotes);
        setVoteToDelete(null);
        toast({
          title: "Vote deleted",
          description: "Vote has been deleted.",
        });
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          console.error('Error deleting vote:', error);
        }
        toast({
          title: "Error",
          description: "Failed to delete vote. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  // Filter votes from state (votes are already loaded from Supabase)
  const activeVotes = useMemo(() => {
    const now = new Date();
    return votes.filter(v => v.status === 'active' && now <= v.endTime);
  }, [votes]);
  
  const pastVotes = useMemo(() => {
    return votes.filter(v => v.status === 'closed');
  }, [votes]);

  const [newMemberData, setNewMemberData] = useState<Member>({
    id: '',
    organizationName: '',
    country: '',
    pocName: '',
    pocEmail: '',
    pocTitle: '',
    memberCount: 1,
    members: [{
      id: 'temp-1',
      name: '',
      email: '',
      title: '',
      isVotingRep: true,
    }],
    bio: '',
    website: '',
  });
  const [newLogoPreview, setNewLogoPreview] = useState<string | null>(null);

  // Activities state
  const [activities, setActivities] = useState<any[]>([]);
  const [isLoadingActivities, setIsLoadingActivities] = useState(true);

  // Load activities from Supabase
  useEffect(() => {
    const loadActivities = async () => {
      setIsLoadingActivities(true);
      try {
        const activitiesData = await getActivities(10);
        setActivities(activitiesData);
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          console.error('Error loading activities:', error);
        }
      } finally {
        setIsLoadingActivities(false);
      }
    };
    loadActivities();
    
    // Refresh activities periodically
    const interval = setInterval(loadActivities, 30000); // Every 30 seconds
    return () => clearInterval(interval);
  }, [votes, files, members]);

  // Calculate statistics - only count active members (exclude pending)
  const stats = useMemo(() => {
    const activeMembers = members.filter(m => m.status !== 'pending');
    const totalOrganizations = activeMembers.length;
    const totalIndividualMembers = activeMembers.reduce((sum, member) => 
      sum + member.members.filter(p => p.status !== 'pending').length, 0
    );
    const activeVotesCount = votes.filter(v => v.status === 'active').length;
    const recentDiscussions = activities.filter(a => a.type === 'discussion').length;
    const pendingApprovals = activities.filter(a => a.status === 'pending').length;
    
    return {
      totalOrganizations,
      totalIndividualMembers,
      activeVotes: activeVotesCount,
      recentDiscussions,
      pendingApprovals,
    };
  }, [members, activities, votes]);

  const filteredMembers = useMemo(() => {
    return members.filter(
      (member) =>
        member.organizationName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        member.country.toLowerCase().includes(searchQuery.toLowerCase()) ||
        member.pocName.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [members, searchQuery]);

  // Get all individual members (flattened from organizations)
  const allIndividualMembers = useMemo(() => {
    return members.flatMap(member => 
      member.members
        .filter(person => person.isRegistered !== false) // Only show registered members (default to true if not specified)
        .map(person => ({
          ...person,
          organizationId: member.id,
          organizationName: member.organizationName,
          organizationLogo: member.logo,
        }))
    );
  }, [members]);

  const filteredIndividualMembers = useMemo(() => {
    return allIndividualMembers.filter(
      (person) =>
        person.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        person.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (person.title?.toLowerCase().includes(searchQuery.toLowerCase()) || false) ||
        person.organizationName.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [allIndividualMembers, searchQuery]);

  const handleDeleteMemberClick = (memberId: string) => {
    setMemberToDelete(memberId);
  };

  const handleDeleteMember = async () => {
    if (!memberToDelete) return;
    
    const memberId = memberToDelete;
    const member = members.find(m => m.id === memberId);
    
    try {
      await deleteMemberData(memberId);
      const updatedMembers = await getAllMembers();
      setMembers(updatedMembers);
      setMemberToDelete(null);
      
      const user = getCurrentUser();
      await addActivity({
        type: 'member',
        action: 'Member organization deleted',
        name: member?.organizationName || 'Unknown',
        userId: user?.id,
        status: 'active',
      });
      
      toast({
        title: "Member deleted",
        description: `Organization "${member?.organizationName || 'Unknown'}" has been removed.`,
      });
    } catch (error: any) {
      let errorMessage = "Failed to delete member. Please try again.";
      if (error?.code === '23503') {
        errorMessage = "Cannot delete organization: It is still referenced in other tables (e.g., summit members). The organization has been unlinked from those references.";
      } else if (error?.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      setMemberToDelete(null);
    }
  };

  // Send email to all members
  const handleSendEmailToAll = async () => {
    if (!emailSubject.trim() || !emailBody.trim()) {
      toast({
        title: "Error",
        description: "Please fill in both subject and body.",
        variant: "destructive",
      });
      return;
    }

    setIsSendingEmail(true);
    try {
      // Get all unique email addresses from all members
      const allEmails = new Set<string>();
      members.forEach(member => {
        // Add POC email
        if (member.pocEmail) {
          allEmails.add(member.pocEmail.toLowerCase());
        }
        // Add all member person emails
        member.members.forEach(person => {
          if (person.email) {
            allEmails.add(person.email.toLowerCase());
          }
        });
      });

      const emailList = Array.from(allEmails);
      let successCount = 0;
      let failCount = 0;

      // Send emails in batches to avoid rate limits
      const batchSize = 10;
      for (let i = 0; i < emailList.length; i += batchSize) {
        const batch = emailList.slice(i, i + batchSize);
        const results = await Promise.all(
          batch.map(async (email) => {
            const htmlContent = createEmailTemplate(emailSubject, emailBody.replace(/\n/g, '<br>'));
            const success = await sendEmail({
              to: email,
              subject: emailSubject,
              html: htmlContent,
            });
            return { email, success };
          })
        );

        results.forEach(result => {
          if (result.success) {
            successCount++;
          } else {
            failCount++;
          }
        });

        // Small delay between batches to avoid rate limits
        if (i + batchSize < emailList.length) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }

      toast({
        title: "Emails sent",
        description: `Successfully sent ${successCount} email(s). ${failCount > 0 ? `${failCount} failed.` : ''}`,
      });

      // Clear form
      setEmailSubject('');
      setEmailBody('');

      // Log activity
      const user = getCurrentUser();
      await addActivity({
        type: 'member',
        action: 'Bulk email sent',
        name: `Sent email to ${successCount} members`,
        userId: user?.id,
        status: 'active',
      });
    } catch (error: any) {
      if (import.meta.env.DEV) {
        console.error('Error sending emails:', error);
      }
      toast({
        title: "Error",
        description: error?.message || "Failed to send emails. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSendingEmail(false);
    }
  };

  // Send email to pending members
  const handleEmailPendingMembers = async () => {
    setIsSendingEmail(true);
    try {
      // Query database directly for pending members based on email confirmation status
      // Get all member_persons
      const { data: personsData, error: personsError } = await supabase
        .from('member_persons')
        .select('email, member_id');
      
      if (personsError) {
        throw new Error(`Failed to fetch member persons: ${personsError.message}`);
      }

      // Get email confirmation status for all persons
      const pendingEmails = new Set<string>();
      if (personsData && personsData.length > 0) {
        const emails = personsData.map(p => p.email?.toLowerCase()).filter(Boolean) as string[];
        
        if (emails.length > 0) {
          // Check email confirmation status using RPC function
          const { data: roleData, error: roleError } = await supabase.rpc('get_user_roles', {
            user_emails: emails
          });

          if (roleError) {
            if (process.env.NODE_ENV === 'development') {
              console.warn('Error checking email confirmation, falling back to member status:', roleError);
            }
            // Fallback to checking member status
            const pendingMembers = members.filter(m => m.status === 'pending');
            pendingMembers.forEach(member => {
              if (member.pocEmail) {
                pendingEmails.add(member.pocEmail.toLowerCase());
              }
              member.members.forEach(person => {
                if (person.email && person.status === 'pending') {
                  pendingEmails.add(person.email.toLowerCase());
                }
              });
            });
          } else {
            // Build map of email -> confirmation status
            const emailConfirmedMap = new Map<string, boolean>();
            if (roleData) {
              roleData.forEach((row: { email: string; email_confirmed_at?: string | null }) => {
                const email = row.email?.toLowerCase();
                const isConfirmed = row.email_confirmed_at !== null && row.email_confirmed_at !== undefined;
                if (email) {
                  emailConfirmedMap.set(email, isConfirmed);
                }
              });
            }

            // Add emails that are NOT confirmed (pending)
            personsData.forEach(person => {
              const email = person.email?.toLowerCase();
              if (email) {
                const isConfirmed = emailConfirmedMap.get(email) ?? false;
                if (!isConfirmed) {
                  pendingEmails.add(email);
                }
              }
            });

            // Also check POC emails from members table
            const { data: membersData } = await supabase
              .from('members')
              .select('poc_email');
            
            if (membersData) {
              membersData.forEach(member => {
                const pocEmail = member.poc_email?.toLowerCase();
                if (pocEmail) {
                  const isConfirmed = emailConfirmedMap.get(pocEmail) ?? false;
                  if (!isConfirmed) {
                    pendingEmails.add(pocEmail);
                  }
                }
              });
            }
          }
        }
      }

      if (pendingEmails.size === 0) {
        toast({
          title: "No pending members",
          description: "There are no pending members to email.",
        });
        setIsSendingEmail(false);
        return;
      }

      const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://slxai.org';
      const signupUrl = `${baseUrl}/membership-portal/my-organization`;
      
      const subject = "Complete Your SLxAI Membership Signup";
      const body = `
        <p>Hello,</p>
        <p>Your organization has been approved for SLxAI membership, but your signup process is still pending.</p>
        <p>Please complete your signup by visiting your organization page and filling in all required information.</p>
        <p>Thank you for your interest in SLxAI!</p>
      `;

      const emailList = Array.from(pendingEmails);
      let successCount = 0;
      let failCount = 0;

      // Send emails in batches
      const batchSize = 10;
      for (let i = 0; i < emailList.length; i += batchSize) {
        const batch = emailList.slice(i, i + batchSize);
        const results = await Promise.all(
          batch.map(async (email) => {
            const htmlContent = createEmailTemplate(
              subject,
              body,
              undefined,
              email,
              { text: 'Complete Signup', url: signupUrl }
            );
            const success = await sendEmail({
              to: email,
              subject: subject,
              html: htmlContent,
            });
            return { email, success };
          })
        );

        results.forEach(result => {
          if (result.success) {
            successCount++;
          } else {
            failCount++;
          }
        });

        // Small delay between batches
        if (i + batchSize < emailList.length) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }

      toast({
        title: "Emails sent",
        description: `Successfully sent signup reminder to ${successCount} pending member(s). ${failCount > 0 ? `${failCount} failed.` : ''}`,
      });

      // Log activity
      const user = getCurrentUser();
      await addActivity({
        type: 'member',
        action: 'Pending member reminder sent',
        name: `Sent signup reminder to ${successCount} pending members`,
        userId: user?.id,
        status: 'active',
      });
    } catch (error: any) {
      if (import.meta.env.DEV) {
        console.error('Error sending pending member emails:', error);
      }
      toast({
        title: "Error",
        description: error?.message || "Failed to send emails. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSendingEmail(false);
    }
  };

  const handleEditMember = async (member: Member) => {
    setEditingMember(member);
    
    // Fetch actual roles from auth.users for each member person
    try {
      // Get all emails from member persons
      const emails = member.members.map(p => p.email.toLowerCase());
      
      // Call RPC function to get roles from auth.users
      const { data: roleData, error } = await supabase.rpc('get_user_roles', {
        user_emails: emails
      });
      
      // Handle permission errors gracefully
      if (error) {
        if (error.code === '42501' || error.message?.includes('permission denied') || error.message?.includes('permission')) {
          if (process.env.NODE_ENV === 'development') {
            console.warn('Permission denied accessing auth.users. Please run FIX_GET_USER_ROLES_COMPLETE.sql in Supabase SQL Editor.');
          }
          // Fallback: use existing roles
          const membersWithRoles = member.members.map((person) => ({
            ...person,
            role: (person.role || 'member') as UserRole,
          }));
          setEditFormData({ ...member, members: membersWithRoles });
          return;
        }
        throw error;
      }
      
      // Create a map of email -> role
      const roleMap = new Map<string, UserRole>();
      if (roleData) {
        roleData.forEach((row: { email: string; role: string }) => {
          roleMap.set(row.email.toLowerCase(), (row.role || 'member') as UserRole);
        });
      }
      
      // Merge roles into member persons
      const membersWithRoles = member.members.map((person) => {
        const role = roleMap.get(person.email.toLowerCase()) || person.role || 'member';
        return {
          ...person,
          role: role as UserRole,
        };
      });
      
      setEditFormData({ ...member, members: membersWithRoles });
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error fetching user roles:', error);
      }
      // Fallback: use existing roles or default to 'member'
      const membersWithRoles = member.members.map((person) => ({
        ...person,
        role: (person.role || 'member') as UserRole,
      }));
      setEditFormData({ ...member, members: membersWithRoles });
    }
    
    setLogoPreview(null);
  };

  const handleEditInputChange = (field: keyof Member, value: any) => {
    if (editFormData) {
      setEditFormData(prev => prev ? { ...prev, [field]: value } : null);
    }
  };

  const handleEditMemberChange = (memberId: string, field: keyof MemberPerson, value: any) => {
    if (editFormData) {
      setEditFormData(prev => prev ? {
        ...prev,
        members: prev.members.map(m => 
          m.id === memberId ? { ...m, [field]: value } : m
        )
      } : null);
    }
  };

  const handleAddEditMember = () => {
    if (editFormData) {
      const newMember: MemberPerson = {
        id: `new-${Date.now()}`,
        name: '',
        email: '',
        title: '',
        isVotingRep: false,
      };
      setEditFormData(prev => prev ? {
        ...prev,
        members: [...prev.members, newMember],
        memberCount: prev.members.length + 1,
      } : null);
    }
  };

  const handleRemoveEditMember = (memberId: string) => {
    if (editFormData) {
      setEditFormData(prev => prev ? {
        ...prev,
        members: prev.members.filter(m => m.id !== memberId),
        memberCount: prev.members.length - 1,
      } : null);
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveEdit = async () => {
    if (!editFormData) return;

    try {
      // Validate required fields
      if (!editFormData.organizationName || !isValidLength(editFormData.organizationName, 1, 200)) {
        toast({
          title: "Validation error",
          description: "Organization name is required and must be 200 characters or less.",
          variant: "destructive",
        });
        return;
      }

      if (!editFormData.country || !isValidLength(editFormData.country, 1, 100)) {
        toast({
          title: "Validation error",
          description: "Country is required and must be 100 characters or less.",
          variant: "destructive",
        });
        return;
      }

      // Validate emails
      for (const member of editFormData.members) {
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
      if (editFormData.website && !isValidUrl(editFormData.website)) {
        toast({
          title: "Validation error",
          description: "Invalid website URL format.",
          variant: "destructive",
        });
        return;
      }

      // Update POC info from voting rep
      const votingRep = editFormData.members.find(m => m.isVotingRep);
      if (votingRep) {
        editFormData.pocName = sanitizeText(votingRep.name);
        editFormData.pocEmail = votingRep.email.toLowerCase().trim();
        editFormData.pocTitle = sanitizeText(votingRep.title || 'Voting Representative');
      }

      // Sanitize inputs
      const sanitizedData = {
        ...editFormData,
        organizationName: sanitizeText(editFormData.organizationName),
        country: sanitizeText(editFormData.country),
        bio: editFormData.bio ? sanitizeText(editFormData.bio) : undefined,
        members: editFormData.members.map(m => ({
          ...m,
          name: sanitizeText(m.name),
          email: m.email.toLowerCase().trim(),
          title: m.title ? sanitizeText(m.title) : undefined,
        })),
      };

      // Admins can edit any organization, so pass null for currentUser check
      await updateMember(editFormData.id, sanitizedData);
      const updatedMembers = await getAllMembers();
      setMembers(updatedMembers);
      toast({
        title: "Member updated",
        description: "The member organization has been updated successfully.",
      });
      setEditingMember(null);
      setEditFormData(null);
      setLogoPreview(null);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update member. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleCancelEdit = () => {
    setEditingMember(null);
    setEditFormData(null);
    setLogoPreview(null);
  };

  const handleOpenAddMember = () => {
    setIsAddingMember(true);
    setNewMemberData({
      id: '',
      organizationName: '',
      country: '',
      pocName: '',
      pocEmail: '',
      pocTitle: '',
      memberCount: 1,
      members: [{
        id: 'temp-1',
        name: '',
        email: '',
        title: '',
        isVotingRep: true,
      }],
      bio: '',
      website: '',
    });
    setNewLogoPreview(null);
  };

  const handleNewMemberInputChange = (field: keyof Member, value: any) => {
    setNewMemberData(prev => ({ ...prev, [field]: value }));
  };

  const handleNewMemberPersonChange = (memberId: string, field: keyof MemberPerson, value: any) => {
    setNewMemberData(prev => ({
      ...prev,
      members: prev.members.map(m => 
        m.id === memberId ? { ...m, [field]: value } : m
      )
    }));
  };

  const handleAddNewMemberPerson = () => {
    const newPerson: MemberPerson = {
      id: `temp-${Date.now()}`,
      name: '',
      email: '',
      title: '',
      isVotingRep: false,
    };
    setNewMemberData(prev => ({
      ...prev,
      members: [...prev.members, newPerson],
      memberCount: prev.members.length + 1,
    }));
  };

  const handleRemoveNewMemberPerson = (memberId: string) => {
    if (newMemberData.members.length > 1) {
      setNewMemberData(prev => ({
        ...prev,
        members: prev.members.filter(m => m.id !== memberId),
        memberCount: prev.members.length - 1,
      }));
    }
  };

  const handleNewLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveNewMember = async () => {
    // Validate required fields
    if (!newMemberData.organizationName || !isValidLength(newMemberData.organizationName, 1, 200)) {
      toast({
        title: "Validation error",
        description: "Organization name is required and must be 200 characters or less.",
        variant: "destructive",
      });
      return;
    }

    if (!newMemberData.country || !isValidLength(newMemberData.country, 1, 100)) {
      toast({
        title: "Validation error",
        description: "Country is required and must be 100 characters or less.",
        variant: "destructive",
      });
      return;
    }

    if (!newMemberData.members[0]?.name || !newMemberData.members[0]?.email) {
      toast({
        title: "Validation error",
        description: "At least one member with name and email is required.",
        variant: "destructive",
      });
      return;
    }

    // Validate all member emails
    for (const member of newMemberData.members) {
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
    if (newMemberData.website && !isValidUrl(newMemberData.website)) {
      toast({
        title: "Validation error",
        description: "Invalid website URL format.",
        variant: "destructive",
      });
      return;
    }

    // Update POC info from voting rep
    const votingRep = newMemberData.members.find(m => m.isVotingRep);
    if (votingRep) {
      newMemberData.pocName = sanitizeText(votingRep.name);
      newMemberData.pocEmail = votingRep.email.toLowerCase().trim();
      newMemberData.pocTitle = sanitizeText(votingRep.title || 'Voting Representative');
    }

    try {
      // Generate a new ID
      const newId = `member-${Date.now()}`;
      const finalMemberData: Member = {
        ...newMemberData,
        id: newId,
        organizationName: sanitizeText(newMemberData.organizationName),
        country: sanitizeText(newMemberData.country),
        bio: newMemberData.bio ? sanitizeText(newMemberData.bio) : undefined,
        members: newMemberData.members.map((m, index) => ({
          ...m,
          id: `${newId}-${index + 1}`,
          name: sanitizeText(m.name),
          email: m.email.toLowerCase().trim(),
          title: m.title ? sanitizeText(m.title) : undefined,
        })),
      };

      await addMemberData(finalMemberData);
      const updatedMembers = await getAllMembers();
      setMembers(updatedMembers);
      toast({
        title: "Member created",
        description: `Successfully added ${finalMemberData.organizationName} to the directory.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create member. Please try again.",
        variant: "destructive",
      });
      return;
    }

    // Reset form
    setIsAddingMember(false);
    setNewMemberData({
      id: '',
      organizationName: '',
      country: '',
      pocName: '',
      pocEmail: '',
      pocTitle: '',
      memberCount: 1,
      members: [{
        id: 'temp-1',
        name: '',
        email: '',
        title: '',
        isVotingRep: true,
      }],
      bio: '',
      website: '',
    });
    setNewLogoPreview(null);
  };

  const handleCancelAddMember = () => {
    setIsAddingMember(false);
    setNewMemberData({
      id: '',
      organizationName: '',
      country: '',
      pocName: '',
      pocEmail: '',
      pocTitle: '',
      memberCount: 1,
      members: [{
        id: 'temp-1',
        name: '',
        email: '',
        title: '',
        isVotingRep: true,
      }],
      bio: '',
      website: '',
    });
    setNewLogoPreview(null);
  };

  // Helper function to format time ago
  const formatTimeAgo = (date: Date): string => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    if (seconds < 60) return 'Just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days} day${days > 1 ? 's' : ''} ago`;
    const weeks = Math.floor(days / 7);
    if (weeks < 4) return `${weeks} week${weeks > 1 ? 's' : ''} ago`;
    const months = Math.floor(days / 30);
    return `${months} month${months > 1 ? 's' : ''} ago`;
  };

  // Bulk operations
  const handleSelectAll = () => {
    if (selectedMembers.size === filteredMembers.length) {
      setSelectedMembers(new Set());
    } else {
      setSelectedMembers(new Set(filteredMembers.map(m => m.id)));
    }
  };

  const handleSelectMember = (memberId: string) => {
    const newSelected = new Set(selectedMembers);
    if (newSelected.has(memberId)) {
      newSelected.delete(memberId);
    } else {
      newSelected.add(memberId);
    }
    setSelectedMembers(newSelected);
  };

  const handleMergeOrganizations = async () => {
    if (selectedMembers.size < 2) {
      toast({
        title: "Invalid selection",
        description: "Please select at least 2 organizations to merge.",
        variant: "destructive",
      });
      return;
    }

    if (!mergeTargetName.trim()) {
      toast({
        title: "Organization name required",
        description: "Please select or enter an organization name.",
        variant: "destructive",
      });
      return;
    }

    setIsMerging(true);
    try {
      const selectedOrgIds = Array.from(selectedMembers);
      const selectedOrgs = members.filter(m => selectedOrgIds.includes(m.id));
      
      // Determine target organization (first selected, or create new)
      const targetOrgId = selectedOrgIds[0];
      const targetOrg = selectedOrgs[0];
      
      // Collect all member persons from all organizations
      const allPersons: MemberPerson[] = [];
      selectedOrgs.forEach(org => {
        allPersons.push(...org.members);
      });

      // Remove duplicates by email
      const uniquePersons = Array.from(
        new Map(allPersons.map(p => [p.email.toLowerCase(), p])).values()
      );

      // Update target organization with merged data
      // Prefer data from target org, but use best available from others
      const mergedMember: Partial<Member> = {
        organizationName: mergeTargetName.trim(),
        country: targetOrg.country, // Keep target org's country
        pocName: targetOrg.pocName, // Keep target org's POC
        pocEmail: targetOrg.pocEmail,
        pocTitle: targetOrg.pocTitle,
        bio: targetOrg.bio || selectedOrgs.find(o => o.bio && o.bio.trim())?.bio,
        website: targetOrg.website || selectedOrgs.find(o => o.website && o.website.trim())?.website,
        logo: targetOrg.logo || selectedOrgs.find(o => o.logo && o.logo.trim())?.logo,
        memberCount: uniquePersons.length,
      };

      // Update target organization (admin can update without currentUser check)
      await updateMember(targetOrgId, mergedMember);

      // Update all member_persons to point to target organization
      const sourceOrgIds = selectedOrgIds.slice(1); // All except target
      
      for (const sourceOrgId of sourceOrgIds) {
        // First, update summit_members references to point to target org
        // If update fails (e.g., RLS policy), try setting to NULL instead
        const { error: summitUpdateError, data: summitUpdateData } = await supabase
          .from('summit_members')
          .update({ 
            organization_id: targetOrgId,
            organization_name: mergeTargetName.trim()
          })
          .eq('organization_id', sourceOrgId)
          .select();

        if (summitUpdateError) {
          if (import.meta.env.DEV) {
            console.warn('Error updating summit_members references, trying to set to NULL:', summitUpdateError);
          }
          
          // If update to target org fails, try setting to NULL to break the foreign key constraint
          const { error: nullUpdateError } = await supabase
            .from('summit_members')
            .update({ 
              organization_id: null,
              organization_name: null
            })
            .eq('organization_id', sourceOrgId);

          if (nullUpdateError) {
            if (import.meta.env.DEV) {
              console.error('Error setting summit_members to NULL:', nullUpdateError);
            }
            // If both updates fail, we can't safely delete - throw error
            throw new Error(`Cannot delete organization: Failed to update summit_members references. Error: ${nullUpdateError.message}`);
          }
        }

        // Get all persons from source org
        const { data: sourcePersons, error: fetchError } = await supabase
          .from('member_persons')
          .select('*')
          .eq('member_id', sourceOrgId);

        if (!fetchError && sourcePersons && sourcePersons.length > 0) {
          // Get existing persons in target org to check for duplicates
          const { data: targetPersons } = await supabase
            .from('member_persons')
            .select('email')
            .eq('member_id', targetOrgId);

          const targetEmails = new Set(
            (targetPersons || []).map(p => p.email.toLowerCase())
          );

          // Process each person from source org
          for (const person of sourcePersons) {
            const personEmail = person.email.toLowerCase();
            
            if (targetEmails.has(personEmail)) {
              // Person already exists in target org, delete duplicate from source
              await supabase
                .from('member_persons')
                .delete()
                .eq('id', person.id);
            } else {
              // Person doesn't exist in target, move them
              await supabase
                .from('member_persons')
                .update({ member_id: targetOrgId })
                .eq('id', person.id);
              targetEmails.add(personEmail); // Track added email
            }
          }
        }

        // Delete source organization (summit_members references already updated)
        await deleteMemberData(sourceOrgId);
      }

      // Update member count for target org
      const { data: finalPersons } = await supabase
        .from('member_persons')
        .select('*')
        .eq('member_id', targetOrgId);

      await supabase
        .from('members')
        .update({ member_count: finalPersons?.length || 0 })
        .eq('id', targetOrgId);

      // Log activity
      const user = getCurrentUser();
      await addActivity({
        type: 'member',
        action: 'Organizations merged',
        name: `${selectedOrgs.length} organizations merged into ${mergeTargetName}`,
        userId: user?.id,
        status: 'active',
      });

      // Refresh members list
      const updatedMembers = await getAllMembers();
      setMembers(updatedMembers);
      setSelectedMembers(new Set());
      setShowMergeDialog(false);
      setMergeTargetName('');
      
      toast({
        title: "Organizations merged",
        description: `${selectedOrgs.length} organizations have been merged into "${mergeTargetName}".`,
      });
    } catch (error: any) {
      if (import.meta.env.DEV) {
        console.error('Error merging organizations:', error);
      }
      
      let errorMessage = "Failed to merge organizations. Please try again.";
      if (error?.code === '23503') {
        errorMessage = "Cannot delete organization: It is still referenced in other tables. Please contact support.";
      } else if (error?.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsMerging(false);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedMembers.size === 0) {
      toast({
        title: "No selection",
        description: "Please select at least one member to delete.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      await Promise.all(
        Array.from(selectedMembers).map(async (id) => {
          await deleteMemberData(id);
          const user = getCurrentUser();
          await addActivity({
            type: 'member',
            action: 'Member organization deleted',
            name: members.find(m => m.id === id)?.organizationName || 'Unknown',
            userId: user?.id,
            status: 'active',
          });
        })
      );
      const updatedMembers = await getAllMembers();
      setMembers(updatedMembers);
      setSelectedMembers(new Set());
      toast({
        title: "Members deleted",
        description: `${selectedMembers.size} member organization(s) have been removed.`,
      });
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error deleting members:', error);
      }
      toast({
        title: "Error",
        description: "Failed to delete some members. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Export functions
  const handleExportMembers = (format: 'csv' | 'json') => {
    const data = filteredMembers.map(m => ({
      'Organization Name': m.organizationName,
      'Country': m.country,
      'POC Name': m.pocName,
      'POC Email': m.pocEmail,
      'POC Title': m.pocTitle,
      'Member Count': m.memberCount,
      'Website': m.website || '',
      'Bio': m.bio || '',
    }));

    if (format === 'csv') {
      exportToCSV(data, 'members_export');
    } else {
      exportToJSON(data, 'members_export');
    }

    toast({
      title: "Export started",
      description: `Members exported as ${format.toUpperCase()}.`,
    });
  };

  const handleExportVotes = (format: 'csv' | 'json') => {
    const data = votes.map(v => ({
      'Title': v.title,
      'Description': v.description,
      'Organization': v.organization,
      'Status': v.status,
      'Created': v.createdAt.toISOString(),
      'End Time': v.endTime.toISOString(),
      'Total Votes': v.options.reduce((sum, opt) => sum + opt.votes, 0),
    }));

    if (format === 'csv') {
      exportToCSV(data, 'votes_export');
    } else {
      exportToJSON(data, 'votes_export');
    }

    toast({
      title: "Export started",
      description: `Votes exported as ${format.toUpperCase()}.`,
    });
  };

  const handleExportFiles = (format: 'csv' | 'json') => {
    const data = files.map(f => ({
      'Name': f.name,
      'Type': f.type,
      'Category': categories.find(c => c.id === f.categoryId)?.name || 'Uncategorized',
      'Uploaded By': f.uploadedBy,
      'Last Modified': f.lastModified,
    }));

    if (format === 'csv') {
      exportToCSV(data, 'files_export');
    } else {
      exportToJSON(data, 'files_export');
    }

    toast({
      title: "Export started",
      description: `Files exported as ${format.toUpperCase()}.`,
    });
  };

  // Settings functions
  const handleSettingsChange = (key: keyof PortalSettings, value: any) => {
    setPortalSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSaveSettings = async () => {
    setIsLoading(true);
    try {
      await saveSettings(portalSettings);
      const user = getCurrentUser();
      await addActivity({
        type: 'settings',
        action: 'Portal settings updated',
        name: 'Settings',
        userId: user?.id,
        status: 'active',
      });
      toast({
        title: "Settings saved",
        description: "Portal settings have been updated successfully.",
      });
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error saving settings:', error);
      }
      toast({
        title: "Error",
        description: "Failed to save settings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadFullBackup = async () => {
    setIsDownloadingBackup(true);
    try {
      const payload = await collectAdminBackupData();
      triggerBackupDownload(payload);

      const user = getCurrentUser();
      await addActivity({
        type: 'settings',
        action: 'Full portal data backup downloaded',
        name: 'Backup',
        userId: user?.id,
        status: 'active',
      });

      const totalRows = payload.tables.reduce((sum, t) => sum + t.rowCount, 0);
      const failedTables = payload.tables.filter((t) => t.error);

      toast({
        title: 'Backup downloaded',
        description:
          failedTables.length === 0
            ? `JSON snapshot saved (${totalRows.toLocaleString()} rows across ${payload.tables.length} tables).`
            : `Saved ${totalRows.toLocaleString()} rows. ${failedTables.length} table(s) could not be read (check file notes).`,
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Could not create backup.';
      if (process.env.NODE_ENV === 'development') {
        console.error('Backup error:', error);
      }
      toast({
        title: 'Backup failed',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setIsDownloadingBackup(false);
    }
  };

  const handleDownloadStorageBackup = async () => {
    setIsDownloadingStorage(true);
    setStorageBackupStatus(null);
    try {
      const { blob, manifest } = await buildStorageBackupZip((msg) => setStorageBackupStatus(msg));
      triggerStorageBackupDownload(blob);

      const user = getCurrentUser();
      await addActivity({
        type: 'settings',
        action: 'Supabase Storage backup downloaded (ZIP)',
        name: 'Storage backup',
        userId: user?.id,
        status: 'active',
      });

      const parts = [
        `${manifest.totalFiles} file(s) in ZIP`,
        manifest.totalFailed > 0 ? `${manifest.totalFailed} download(s) failed` : null,
      ].filter(Boolean);

      toast({
        title: 'Storage backup downloaded',
        description: parts.join(' · ') + '. Manifest is inside the ZIP as _storage-backup-manifest.json.',
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Could not create storage backup.';
      if (process.env.NODE_ENV === 'development') {
        console.error('Storage backup error:', error);
      }
      toast({
        title: 'Storage backup failed',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setIsDownloadingStorage(false);
      setStorageBackupStatus(null);
    }
  };

  // Member import
  const handleMemberImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    setImportProgress(0);

    try {
      const csvData = await parseCSV(file);
      setImportProgress(50);

      // Process import
      let imported = 0;
      await Promise.all(
        csvData.map(async (row, index) => {
          if (row['Organization Name'] && row['POC Email']) {
            const newMember: Member = {
              id: `imported_${Date.now()}_${index}`,
              organizationName: sanitizeText(row['Organization Name']),
              country: sanitizeText(row['Country'] || ''),
              pocName: sanitizeText(row['POC Name'] || ''),
              pocEmail: row['POC Email'].toLowerCase().trim(),
              pocTitle: sanitizeText(row['POC Title'] || 'Voting Representative'),
              memberCount: parseInt(row['Member Count'] || '1'),
              members: [{
                id: `imported_person_${Date.now()}_${index}`,
                name: sanitizeText(row['POC Name'] || ''),
                email: row['POC Email'].toLowerCase().trim(),
                title: sanitizeText(row['POC Title'] || 'Voting Representative'),
                isVotingRep: true,
              }],
              bio: sanitizeText(row['Bio'] || ''),
              website: row['Website'] || '',
            };

            await addMemberData(newMember);
            const user = getCurrentUser();
            await addActivity({
              type: 'member',
              action: 'Member organization imported',
              name: newMember.organizationName,
              userId: user?.id,
              status: 'active',
            });
            imported++;
          }
        })
      );

      const updatedMembers = await getAllMembers();
      setMembers(updatedMembers);
      setImportProgress(100);
      setIsImporting(false);
      toast({
        title: "Import completed",
        description: `${imported} member organization(s) imported successfully.`,
      });

      if (fileImportRef.current) {
        fileImportRef.current.value = '';
      }
    } catch (error) {
      setIsImporting(false);
      setImportProgress(0);
      toast({
        title: "Import failed",
        description: "Failed to parse CSV file. Please check the format.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <PageTitle 
        title="Admin Panel"
        fullWidthLandscape={true}
        rightContent={
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            Admin Access
          </Badge>
        }
      />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-[repeat(13,minmax(0,1fr))] h-auto gap-1">
          <TabsTrigger value="overview" className="text-xs sm:text-sm">Overview</TabsTrigger>
          <TabsTrigger value="bylaws" className="text-xs sm:text-sm">Bylaws</TabsTrigger>
          <TabsTrigger value="members" className="text-xs sm:text-sm">Members</TabsTrigger>
          <TabsTrigger value="files" className="text-xs sm:text-sm">Files</TabsTrigger>
          <TabsTrigger value="discussions" className="text-xs sm:text-sm">Discussions</TabsTrigger>
          <TabsTrigger value="voting" className="text-xs sm:text-sm">Voting</TabsTrigger>
          <TabsTrigger value="summit" className="text-xs sm:text-sm">Roles</TabsTrigger>
          <TabsTrigger value="feedback" className="text-xs sm:text-sm">Feedback</TabsTrigger>
          <TabsTrigger value="analytics" className="text-xs sm:text-sm">Analytics</TabsTrigger>
          <TabsTrigger value="settings" className="text-xs sm:text-sm">Settings</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card 
              className={`glass-card floating-hover cursor-pointer transition-all ${
                activeTab === 'members' && memberSection === 'companies' ? 'ring-2 ring-electric-blue bg-electric-blue/5' : ''
              }`}
              onClick={() => {
                setActiveTab('members');
                setMemberSection('companies');
                // Scroll to members tab content
                setTimeout(() => {
                  const membersTab = document.getElementById('members-tab-content');
                  if (membersTab) {
                    membersTab.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }
                }, 100);
              }}
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-white mb-1">Organizations</p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.totalOrganizations}</p>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <Building2 className="h-6 w-6 text-electric-blue" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card 
              className={`glass-card floating-hover cursor-pointer transition-all ${
                activeTab === 'members' && memberSection === 'individuals' ? 'ring-2 ring-electric-blue bg-electric-blue/5' : ''
              }`}
              onClick={() => {
                setActiveTab('members');
                setMemberSection('individuals');
                // Scroll to members tab content
                setTimeout(() => {
                  const membersTab = document.getElementById('members-tab-content');
                  if (membersTab) {
                    membersTab.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }
                }, 100);
              }}
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-white mb-1">Individual Members</p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.totalIndividualMembers}</p>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <Users className="h-6 w-6 text-electric-blue" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card floating-hover">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-white mb-1">Active Votes</p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.activeVotes}</p>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <VoteIcon className="h-6 w-6 text-electric-blue" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card floating-hover">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-white mb-1">Pending Approvals</p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.pendingApprovals}</p>
                  </div>
                  <div className="p-3 bg-orange-100 rounded-lg">
                    <AlertCircle className="h-6 w-6 text-orange-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <Card className="glass-card floating-hover">
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest actions and updates in the portal</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {activities.length === 0 ? (
                  <p className="text-sm text-gray-600 dark:text-white text-center py-4">No recent activity</p>
                ) : (
                  activities.map((activity) => {
                    const timeAgo = formatTimeAgo(activity.timestamp);
                    return (
                      <div key={activity.id} className="flex items-center justify-between p-3 border border-gray-200 dark:border-[hsl(217,35%,25%)] rounded-lg bg-white/50 dark:bg-gray-800/50">
                        <div className="flex items-center gap-3">
                          {activity.type === 'member' && <Users className="h-5 w-5 text-blue-600" />}
                          {activity.type === 'vote' && <VoteIcon className="h-5 w-5 text-purple-600" />}
                          {activity.type === 'discussion' && <MessageSquare className="h-5 w-5 text-green-600" />}
                          {activity.type === 'file' && <FileText className="h-5 w-5 text-orange-600" />}
                          {activity.type === 'video' && <Video className="h-5 w-5 text-red-600" />}
                          {activity.type === 'settings' && <Settings className="h-5 w-5 text-gray-600 dark:text-white" />}
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">{activity.action}</p>
                            <p className="text-xs text-gray-600 dark:text-white">{activity.name} • {timeAgo}</p>
                          </div>
                        </div>
                        <Badge 
                          variant={activity.status === 'pending' ? 'destructive' : 'default'}
                          className={activity.status === 'active' ? 'bg-green-100 text-green-700' : ''}
                        >
                          {activity.status}
                        </Badge>
                      </div>
                    );
                  })
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        {/* Bylaws feedback Tab */}
        <TabsContent value="bylaws" className="space-y-6">
          <BylawsFeedbackTab />
        </TabsContent>

        {/* Members Tab */}
        <TabsContent value="members" id="members-tab-content" className="space-y-4 sm:space-y-6">
          {/* Section Toggle */}
          <div className="flex gap-2 border-b border-gray-200 bg-white">
            <Button
              variant={memberSection === 'individuals' ? 'default' : 'ghost'}
              onClick={() => setMemberSection('individuals')}
              className={`rounded-b-none ${
                memberSection === 'individuals' 
                  ? 'bg-electric-blue text-white hover:bg-electric-blue/90' 
                  : 'text-gray-700 dark:text-white hover:text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 dark:bg-gray-800'
              }`}
            >
              <Users className="h-4 w-4 mr-2" />
              Individual Members
            </Button>
            <Button
              variant={memberSection === 'companies' ? 'default' : 'ghost'}
              onClick={() => setMemberSection('companies')}
              className={`rounded-b-none ${
                memberSection === 'companies' 
                  ? 'bg-electric-blue text-white hover:bg-electric-blue/90' 
                  : 'text-gray-700 dark:text-white hover:text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 dark:bg-gray-800'
              }`}
            >
              <Building2 className="h-4 w-4 mr-2" />
              Organization Members
            </Button>
            <Button
              variant={memberSection === 'email' ? 'default' : 'ghost'}
              onClick={() => setMemberSection('email')}
              className={`rounded-b-none ${
                memberSection === 'email' 
                  ? 'bg-electric-blue text-white hover:bg-electric-blue/90' 
                  : 'text-gray-700 dark:text-white hover:text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 dark:bg-gray-800'
              }`}
            >
              <Mail className="h-4 w-4 mr-2" />
              Email
            </Button>
          </div>

          {memberSection === 'individuals' && (
            <Card className="bg-white dark:bg-[hsl(217,40%,18%)] border border-gray-200 dark:border-[hsl(217,35%,25%)] shadow-sm !text-gray-900 dark:text-white">
              <CardHeader className="bg-white dark:bg-[hsl(217,40%,18%)] !text-gray-900 dark:text-white">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <CardTitle className="text-lg sm:text-xl !text-gray-900 dark:text-white font-semibold">Individual Members</CardTitle>
                    <CardDescription className="text-xs sm:text-sm !text-gray-600 dark:text-white">Manage individual members from all organizations</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 bg-white dark:bg-[hsl(217,40%,18%)] !text-gray-900 dark:text-white">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500 dark:text-white" />
                  <Input
                    placeholder="Search individual members..."
                    className="pl-10 bg-white text-gray-900 dark:text-white border-gray-300 dark:border-[hsl(217,35%,25%)] placeholder:text-gray-500 dark:text-white"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                {/* Individual Members Table */}
                <div className="border border-gray-200 dark:border-[hsl(217,35%,25%)] rounded-lg overflow-hidden bg-white dark:bg-[hsl(217,40%,18%)]">
                  <div className="overflow-x-auto bg-white dark:bg-[hsl(217,40%,18%)]">
                    <table className="w-full bg-white dark:bg-[hsl(217,40%,18%)]">
                      <thead className="bg-gray-100 dark:bg-gray-800 border-b-2 border-gray-300 dark:border-[hsl(217,35%,25%)]">
                        <tr>
                          <th className="px-2 sm:px-4 py-3 text-left text-xs font-semibold !text-gray-900 dark:text-white uppercase bg-gray-100 dark:bg-gray-800">Name</th>
                          <th className="px-2 sm:px-4 py-3 text-left text-xs font-semibold !text-gray-900 dark:text-white uppercase hidden sm:table-cell bg-gray-100 dark:bg-gray-800">Email</th>
                          <th className="px-2 sm:px-4 py-3 text-left text-xs font-semibold !text-gray-900 dark:text-white uppercase hidden md:table-cell bg-gray-100 dark:bg-gray-800">Title</th>
                          <th className="px-2 sm:px-4 py-3 text-left text-xs font-semibold !text-gray-900 dark:text-white uppercase hidden lg:table-cell bg-gray-100 dark:bg-gray-800">Organization</th>
                          <th className="px-2 sm:px-4 py-3 text-left text-xs font-semibold !text-gray-900 dark:text-white uppercase hidden lg:table-cell bg-gray-100 dark:bg-gray-800">Voting Rep</th>
                          <th className="px-2 sm:px-4 py-3 text-left text-xs font-semibold !text-gray-900 dark:text-white uppercase hidden lg:table-cell bg-gray-100 dark:bg-gray-800">Status</th>
                          <th className="px-2 sm:px-4 py-3 text-right text-xs font-semibold !text-gray-900 dark:text-white uppercase bg-gray-100 dark:bg-gray-800">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-[hsl(217,40%,18%)] divide-y divide-gray-200 dark:divide-[hsl(217,35%,25%)]">
                        {filteredIndividualMembers.length === 0 ? (
                          <tr className="bg-white dark:bg-[hsl(217,40%,18%)]">
                            <td colSpan={7} className="px-4 py-12 text-center !text-gray-900 dark:text-white text-base font-medium bg-white dark:bg-[hsl(217,40%,18%)]">
                              {allIndividualMembers.length === 0 
                                ? 'No individual members found in any organization' 
                                : 'No individual members match your search'}
                            </td>
                          </tr>
                        ) : (
                          filteredIndividualMembers.map((person) => (
                          <tr key={`${person.organizationId}-${person.id}`} className="hover:bg-gray-50 dark:hover:bg-gray-800 bg-white">
                            <td className="px-4 py-4 bg-white dark:bg-[hsl(217,40%,18%)]">
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-base !text-gray-900 dark:text-white">{person.name || 'Unknown'}</span>
                              </div>
                              <div className="sm:hidden mt-1 text-sm !text-gray-600 dark:text-white">
                                {person.email} • {person.organizationName}
                              </div>
                            </td>
                            <td className="px-4 py-4 text-base !text-gray-900 dark:text-white bg-white dark:bg-[hsl(217,40%,18%)] hidden sm:table-cell">{person.email || '-'}</td>
                            <td className="px-4 py-4 text-base !text-gray-900 dark:text-white bg-white dark:bg-[hsl(217,40%,18%)] hidden md:table-cell">{person.title || '-'}</td>
                            <td className="px-4 py-4 text-base !text-gray-900 dark:text-white bg-white dark:bg-[hsl(217,40%,18%)] hidden lg:table-cell">
                              <div className="flex items-center gap-2">
                                {person.organizationLogo ? (
                                  <img src={person.organizationLogo} alt={person.organizationName} className="h-6 w-6 rounded object-cover" />
                                ) : (
                                  <Building2 className="h-5 w-5 !text-gray-600 dark:text-white" />
                                )}
                                <span className="font-medium !text-gray-900 dark:text-white">{person.organizationName}</span>
                              </div>
                            </td>
                            <td className="px-4 py-4 bg-white dark:bg-[hsl(217,40%,18%)] hidden lg:table-cell">
                              {person.isVotingRep ? (
                                <Badge className="bg-blue-100 !text-blue-800 text-sm font-medium border border-blue-300">Yes</Badge>
                              ) : (
                                <span className="!text-gray-700 dark:text-white text-sm font-medium">No</span>
                              )}
                            </td>
                            <td className="px-4 py-4 bg-white dark:bg-[hsl(217,40%,18%)] hidden lg:table-cell">
                              {person.status === 'pending' ? (
                                <Badge className="bg-yellow-100 text-yellow-700 text-xs">Pending</Badge>
                              ) : (
                                <Badge className="bg-green-100 text-green-700 text-xs">Active</Badge>
                              )}
                            </td>
                            <td className="px-4 py-4 bg-white">
                              <div className="flex items-center justify-end gap-2">
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => {
                                    const org = members.find(m => m.id === person.organizationId);
                                    if (org) handleEditMember(org);
                                  }}
                                  className="h-8 px-3 !text-gray-700 dark:text-white hover:!text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 dark:bg-gray-800"
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
          {memberSection === 'companies' && (
          <Card className="glass-card floating-hover">
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <CardTitle className="text-lg sm:text-xl">Member Organizations</CardTitle>
                  <CardDescription className="text-xs sm:text-sm">Manage all member organizations and their details</CardDescription>
                </div>
                <div className="flex flex-wrap gap-2">
                  <input
                    ref={fileImportRef}
                    type="file"
                    accept=".csv"
                    className="hidden"
                    onChange={handleMemberImport}
                  />
                  <Button
                    variant="outline"
                    onClick={() => fileImportRef.current?.click()}
                    disabled={isImporting}
                  >
                    {isImporting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Importing...
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4 mr-2" />
                        Import CSV
                      </>
                    )}
                  </Button>
                  {isImporting && (
                    <div className="flex items-center gap-2">
                      <Progress value={importProgress} className="w-32" />
                      <span className="text-sm text-gray-600 dark:text-white">{importProgress}%</span>
                    </div>
                  )}
                  <Button
                    variant="outline"
                    onClick={() => handleExportMembers('csv')}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export CSV
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleExportMembers('json')}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export JSON
                  </Button>
                  {selectedMembers.size > 1 && (
                    <Button
                      variant="default"
                      onClick={() => {
                        const selectedOrgs = members.filter(m => selectedMembers.has(m.id));
                        setMergeTargetName(selectedOrgs[0]?.organizationName || '');
                        setMergeNameOption('select');
                        setShowMergeDialog(true);
                      }}
                      disabled={isLoading || isMerging}
                      className="bg-electric-blue hover:bg-blue-600"
                    >
                      <Users className="h-4 w-4 mr-2" />
                      Merge ({selectedMembers.size})
                    </Button>
                  )}
                  {selectedMembers.size > 0 && canDeleteUsers && (
                    <Button
                      variant="destructive"
                      onClick={handleBulkDelete}
                      disabled={isLoading || isMerging}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Deleting...
                        </>
                      ) : (
                        <>
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete ({selectedMembers.size})
                        </>
                      )}
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    onClick={loadMembers}
                    disabled={isLoadingMembers}
                  >
                    {isLoadingMembers ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Loading...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Refresh
                      </>
                    )}
                  </Button>
                  <Button 
                    className="bg-electric-blue hover:bg-electric-blue/90"
                    onClick={handleOpenAddMember}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Member
                  </Button>
                  {members.some(m => m.status === 'pending') && (
                    <Button
                      variant="outline"
                      onClick={handleEmailPendingMembers}
                      disabled={isSendingEmail}
                    >
                      {isSendingEmail ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        <>
                          <Mail className="h-4 w-4 mr-2" />
                          Email Pending Members
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-white" />
                <Input
                  placeholder="Search members..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              {/* Members Table */}
              <div className="border border-gray-200 dark:border-[hsl(217,35%,25%)] rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-[hsl(217,35%,25%)]">
                      <tr>
                        <th className="px-2 sm:px-4 py-3 text-left text-xs font-medium text-gray-600 dark:text-white uppercase w-12">
                          <Checkbox
                            checked={selectedMembers.size === filteredMembers.length && filteredMembers.length > 0}
                            onCheckedChange={handleSelectAll}
                          />
                        </th>
                        <th className="px-2 sm:px-4 py-3 text-left text-xs font-medium text-gray-600 dark:text-white uppercase">Organization</th>
                        <th className="px-2 sm:px-4 py-3 text-left text-xs font-medium text-gray-600 dark:text-white uppercase hidden sm:table-cell">Country</th>
                        <th className="px-2 sm:px-4 py-3 text-left text-xs font-medium text-gray-600 dark:text-white uppercase hidden md:table-cell">POC</th>
                        <th className="px-2 sm:px-4 py-3 text-left text-xs font-medium text-gray-600 dark:text-white uppercase hidden lg:table-cell">Members</th>
                        <th className="px-2 sm:px-4 py-3 text-left text-xs font-medium text-gray-600 dark:text-white uppercase hidden lg:table-cell">Status</th>
                        <th className="px-2 sm:px-4 py-3 text-right text-xs font-medium text-gray-600 dark:text-white uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredMembers.map((member) => (
                        <tr key={member.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                          <td className="px-2 sm:px-4 py-3">
                            <Checkbox
                              checked={selectedMembers.has(member.id)}
                              onCheckedChange={() => handleSelectMember(member.id)}
                            />
                          </td>
                          <td className="px-2 sm:px-4 py-3">
                            <div className="flex items-center gap-2">
                              {member.logo ? (
                                <img src={member.logo} alt={member.organizationName} className="h-6 w-6 sm:h-8 sm:w-8 rounded object-cover" />
                              ) : (
                                <div className="h-6 w-6 sm:h-8 sm:w-8 rounded bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                                  <Building2 className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400 dark:text-white" />
                                </div>
                              )}
                              <span className="font-medium text-sm sm:text-base text-gray-900 dark:text-white">{member.organizationName}</span>
                            </div>
                            <div className="sm:hidden mt-1 text-xs text-gray-600 dark:text-white">
                              {member.country} • {member.pocName}
                            </div>
                          </td>
                          <td className="px-2 sm:px-4 py-3 text-sm text-gray-700 dark:text-white hidden sm:table-cell">{member.country}</td>
                          <td className="px-2 sm:px-4 py-3 text-sm text-gray-700 dark:text-white hidden md:table-cell">{member.pocName}</td>
                          <td className="px-2 sm:px-4 py-3 text-sm text-gray-700 dark:text-white hidden lg:table-cell">{member.members.length}</td>
                          <td className="px-2 sm:px-4 py-3 hidden lg:table-cell">
                            {member.status === 'pending' ? (
                              <Badge className="bg-yellow-100 text-yellow-700 text-xs">Pending</Badge>
                            ) : (
                              <Badge className="bg-green-100 text-green-700 text-xs">Active</Badge>
                            )}
                          </td>
                          <td className="px-2 sm:px-4 py-3">
                            <div className="flex items-center justify-end gap-1 sm:gap-2">
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => handleEditMember(member)}
                                className="h-7 px-1.5 sm:px-2"
                                title="Edit organization"
                              >
                                <Edit className="h-3 w-3 sm:h-4 sm:w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => handleDeleteMemberClick(member.id)}
                                className="h-7 px-1.5 sm:px-2 text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/20"
                                title="Delete organization"
                              >
                                <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </CardContent>
          </Card>
          )}
          {memberSection === 'email' && (
          <Card className="glass-card floating-hover">
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <CardTitle className="text-lg sm:text-xl">Email All Members</CardTitle>
                  <CardDescription className="text-xs sm:text-sm">Send an email to all members in the system</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email-subject">Subject</Label>
                <Input
                  id="email-subject"
                  placeholder="Enter email subject"
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  className="bg-white dark:bg-[hsl(217,40%,18%)] text-gray-900 dark:text-white"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email-body">Email Body</Label>
                <Textarea
                  id="email-body"
                  placeholder="Enter email body (supports HTML)"
                  value={emailBody}
                  onChange={(e) => setEmailBody(e.target.value)}
                  rows={10}
                  className="bg-white dark:bg-[hsl(217,40%,18%)] text-gray-900 dark:text-white"
                />
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setEmailSubject('');
                    setEmailBody('');
                  }}
                  disabled={isSendingEmail}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSendEmailToAll}
                  disabled={!emailSubject.trim() || !emailBody.trim() || isSendingEmail}
                  className="bg-electric-blue hover:bg-blue-600"
                >
                  {isSendingEmail ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Mail className="h-4 w-4 mr-2" />
                      Send Email
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
          )}
        </TabsContent>

        {/* Files Tab */}
        <TabsContent value="files" className="space-y-6">
          {/* Files & Categories Management - Merged */}
          <Card className="glass-card floating-hover">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Folder className="h-5 w-5 text-electric-blue" />
                    Files & Categories
                  </CardTitle>
                  <CardDescription>
                    Drag files into categories and reorder them. Click Save to apply changes.
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  {(hasUnsavedFileOrder || hasUnsavedCategoryOrder) && (
                    <Button 
                      variant="outline"
                      onClick={async () => {
                        if (hasUnsavedFileOrder) await handleSaveFileOrder();
                        if (hasUnsavedCategoryOrder) await handleSaveCategoryOrder();
                      }}
                      className="border-gray-300 dark:border-[hsl(217,35%,25%)] text-gray-700 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      Save Order
                    </Button>
                  )}
                  <Button 
                    className="bg-electric-blue hover:bg-electric-blue/90"
                    onClick={() => handleOpenCategoryDialog()}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Category
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <DndContext
                sensors={sensors}
                collisionDetection={rectIntersection}
                onDragEnd={(event) => {
                  // Check if dragging a category or a file
                  const activeId = event.active.id as string;
                  const isCategory = categories.some(c => c.id === activeId);
                  
                  if (isCategory) {
                    handleCategoriesDragEnd(event);
                  } else {
                    handleFilesDragEnd(event);
                  }
                }}
              >
                <SortableContext
                  items={categories.map(c => c.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-4">
                    {/* Category Containers */}
                    {categories.length === 0 ? (
                      <div className="text-sm text-gray-500 dark:text-white text-center py-8">Loading categories...</div>
                    ) : (
                      categories.map((category) => {
                          const categoryFiles = filesByCategory[category.id] || [];
                          return (
                            <SortableCategory
                              key={category.id}
                              category={category}
                              files={categoryFiles}
                              onCategoryChange={() => {}}
                              onEditCategory={handleOpenCategoryDialog}
                              onDeleteCategory={handleDeleteCategoryClick}
                              onDeleteFile={handleDeleteFileClick}
                              onRenameFile={handleRenameFileClick}
                            />
                          );
                        })
                    )}
                  </div>
                </SortableContext>
              </DndContext>
              {isLoadingContent ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-6 w-6 animate-spin text-electric-blue" />
                  <span className="ml-2 text-sm text-gray-600 dark:text-white">Loading files...</span>
                </div>
              ) : files.length === 0 ? (
                <p className="text-sm text-gray-500 dark:text-white text-center py-8">No files available</p>
              ) : categories.length === 0 ? (
                <p className="text-sm text-gray-500 dark:text-white text-center py-8">Loading categories...</p>
              ) : null}
            </CardContent>
          </Card>

        </TabsContent>

        {/* Discussions Tab */}
        <TabsContent value="discussions" className="space-y-4 sm:space-y-6">
          {/* Main Discussions */}
          <Card className="glass-card floating-hover">
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <CardTitle className="text-lg sm:text-xl">Main Discussions</CardTitle>
                  <CardDescription className="text-xs sm:text-sm">Manage channels and messages from the main Discussions page</CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={loadAllChannels}
                  disabled={isLoadingChannels}
                  className="flex items-center gap-2"
                >
                  {isLoadingChannels ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Search className="h-4 w-4" />
                  )}
                  Refresh
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {isLoadingChannels ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-electric-blue" />
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {/* Channels List */}
                  <div className="space-y-2">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Channels</h3>
                    <div className="border border-gray-200 dark:border-[hsl(217,35%,25%)] rounded-lg overflow-hidden">
                      <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={handleChannelsDragEnd}
                      >
                        <SortableContext
                          items={channels.map(c => c.id)}
                          strategy={verticalListSortingStrategy}
                        >
                          <div className="max-h-96 overflow-y-auto">
                            {channels.length === 0 ? (
                              <div className="p-4 text-center text-gray-500 dark:text-white text-sm">No channels yet</div>
                            ) : (
                              channels.map((channel) => (
                                <SortableChannelItem
                                  key={channel.id}
                                  channel={channel}
                                  isSelected={selectedChannelForMessages === channel.id}
                                  onSelect={() => setSelectedChannelForMessages(channel.id)}
                                  onDelete={async () => {
                                    try {
                                      await deleteChannel(channel.id);
                                      setChannels(prev => prev.filter(c => c.id !== channel.id));
                                      if (selectedChannelForMessages === channel.id) {
                                        setSelectedChannelForMessages(null);
                                      }
                                      toast({
                                        title: "Channel deleted",
                                        description: "The channel has been deleted successfully.",
                                      });
                                    } catch (error) {
                                      toast({
                                        title: "Error",
                                        description: "Failed to delete channel.",
                                        variant: "destructive",
                                      });
                                    }
                                  }}
                                />
                              ))
                            )}
                          </div>
                        </SortableContext>
                      </DndContext>
                    </div>
                  </div>

                  {/* Messages List */}
                  <div className="space-y-2">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                      Messages {selectedChannelForMessages && channels.find(c => c.id === selectedChannelForMessages) && `in #${channels.find(c => c.id === selectedChannelForMessages)?.name || ''}`}
                    </h3>
                    {selectedChannelForMessages && channels.find(c => c.id === selectedChannelForMessages) ? (
                      <div className="border border-gray-200 dark:border-[hsl(217,35%,25%)] rounded-lg overflow-hidden">
                        <div className="max-h-96 overflow-y-auto">
                          {isLoadingMessages ? (
                            <div className="flex items-center justify-center py-8">
                              <Loader2 className="h-4 w-4 animate-spin text-electric-blue" />
                            </div>
                          ) : messages[selectedChannelForMessages]?.length === 0 ? (
                            <div className="p-4 text-center text-gray-500 dark:text-white text-sm">No messages in this channel</div>
                          ) : (
                            (messages[selectedChannelForMessages] || []).map((message) => (
                              <div key={message.id} className="p-3 border-b border-gray-200 last:border-b-0 hover:bg-gray-50 dark:hover:bg-gray-800">
                                <div className="flex items-start justify-between gap-2">
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                      <span className="font-medium text-sm text-gray-900 dark:text-white">{message.author}</span>
                                      {message.isPinned && (
                                        <Pin className="h-3 w-3 text-electric-blue" />
                                      )}
                                    </div>
                                    <p className="text-xs text-gray-700 dark:text-white line-clamp-2">{message.content}</p>
                                    <p className="text-xs text-gray-500 dark:text-white mt-1">
                                      {new Date(message.createdAt).toLocaleDateString()}
                                    </p>
                                  </div>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={async () => {
                                      try {
                                        await deleteMessage(message.id);
                                        setMessages(prev => {
                                          const channelMessages = prev[selectedChannelForMessages] || [];
                                          return {
                                            ...prev,
                                            [selectedChannelForMessages]: channelMessages.filter(m => m.id !== message.id),
                                          };
                                        });
                                        toast({
                                          title: "Message deleted",
                                          description: "The message has been deleted successfully.",
                                        });
                                      } catch (error) {
                                        toast({
                                          title: "Error",
                                          description: "Failed to delete message.",
                                          variant: "destructive",
                                        });
                                      }
                                    }}
                                    className="h-7 px-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="border border-gray-200 dark:border-[hsl(217,35%,25%)] rounded-lg p-8 text-center text-gray-500 dark:text-white text-sm">
                        Select a channel to view messages
                      </div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Summit Planning Discussions */}
          <Card className="glass-card floating-hover">
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <CardTitle className="text-lg sm:text-xl">Summit Planning Discussions</CardTitle>
                  <CardDescription className="text-xs sm:text-sm">Manage channels and messages from Summit Planning</CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={loadAllChannels}
                  disabled={isLoadingChannels}
                  className="flex items-center gap-2"
                >
                  {isLoadingChannels ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Search className="h-4 w-4" />
                  )}
                  Refresh
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {isLoadingChannels ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-electric-blue" />
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {/* Channels List */}
                  <div className="space-y-2">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Summit Channels</h3>
                    <div className="border border-gray-200 dark:border-[hsl(217,35%,25%)] rounded-lg overflow-hidden">
                      <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={handleSummitChannelsDragEnd}
                      >
                        <SortableContext
                          items={summitChannels.map(c => c.id)}
                          strategy={verticalListSortingStrategy}
                        >
                          <div className="max-h-96 overflow-y-auto">
                            {summitChannels.length === 0 ? (
                              <div className="p-4 text-center text-gray-500 dark:text-white text-sm">No summit channels yet</div>
                            ) : (
                              summitChannels.map((channel) => (
                                <SortableChannelItem
                                  key={channel.id}
                                  channel={channel}
                                  isSelected={selectedChannelForMessages === channel.id}
                                  onSelect={() => setSelectedChannelForMessages(channel.id)}
                                  onDelete={async () => {
                                    try {
                                      await deleteChannel(channel.id);
                                      setSummitChannels(prev => prev.filter(c => c.id !== channel.id));
                                      if (selectedChannelForMessages === channel.id) {
                                        setSelectedChannelForMessages(null);
                                      }
                                      toast({
                                        title: "Channel deleted",
                                        description: "The channel has been deleted successfully.",
                                      });
                                    } catch (error) {
                                      toast({
                                        title: "Error",
                                        description: "Failed to delete channel.",
                                        variant: "destructive",
                                      });
                                    }
                                  }}
                                  displayName={channel.name.replace('summit-', '')}
                                />
                              ))
                            )}
                          </div>
                        </SortableContext>
                      </DndContext>
                    </div>
                  </div>

                  {/* Messages List */}
                  <div className="space-y-2">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                      Messages {selectedChannelForMessages && summitChannels.find(c => c.id === selectedChannelForMessages) && `in #${summitChannels.find(c => c.id === selectedChannelForMessages)?.name.replace('summit-', '') || ''}`}
                    </h3>
                    {selectedChannelForMessages && summitChannels.find(c => c.id === selectedChannelForMessages) ? (
                      <div className="border border-gray-200 dark:border-[hsl(217,35%,25%)] rounded-lg overflow-hidden">
                        <div className="max-h-96 overflow-y-auto">
                          {isLoadingMessages ? (
                            <div className="flex items-center justify-center py-8">
                              <Loader2 className="h-4 w-4 animate-spin text-electric-blue" />
                            </div>
                          ) : messages[selectedChannelForMessages]?.length === 0 ? (
                            <div className="p-4 text-center text-gray-500 dark:text-white text-sm">No messages in this channel</div>
                          ) : (
                            (messages[selectedChannelForMessages] || []).map((message) => (
                              <div key={message.id} className="p-3 border-b border-gray-200 last:border-b-0 hover:bg-gray-50 dark:hover:bg-gray-800">
                                <div className="flex items-start justify-between gap-2">
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                      <span className="font-medium text-sm text-gray-900 dark:text-white">{message.author}</span>
                                      {message.isPinned && (
                                        <Pin className="h-3 w-3 text-electric-blue" />
                                      )}
                                    </div>
                                    <p className="text-xs text-gray-700 dark:text-white line-clamp-2">{message.content}</p>
                                    <p className="text-xs text-gray-500 dark:text-white mt-1">
                                      {new Date(message.createdAt).toLocaleDateString()}
                                    </p>
                                  </div>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={async () => {
                                      try {
                                        await deleteMessage(message.id);
                                        setMessages(prev => {
                                          const channelMessages = prev[selectedChannelForMessages] || [];
                                          return {
                                            ...prev,
                                            [selectedChannelForMessages]: channelMessages.filter(m => m.id !== message.id),
                                          };
                                        });
                                        toast({
                                          title: "Message deleted",
                                          description: "The message has been deleted successfully.",
                                        });
                                      } catch (error) {
                                        toast({
                                          title: "Error",
                                          description: "Failed to delete message.",
                                          variant: "destructive",
                                        });
                                      }
                                    }}
                                    className="h-7 px-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="border border-gray-200 dark:border-[hsl(217,35%,25%)] rounded-lg p-8 text-center text-gray-500 dark:text-white text-sm">
                        Select a channel to view messages
                      </div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Voting Tab */}
        <TabsContent value="voting" className="space-y-6">
          {/* Active Votes */}
          <Card className="glass-card floating-hover">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Active Votes</CardTitle>
                  <CardDescription>Currently open voting sessions</CardDescription>
                </div>
                <Button 
                  className="bg-electric-blue hover:bg-electric-blue/90"
                  onClick={() => handleOpenVoteDialog()}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Vote
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {activeVotes.length === 0 ? (
                  <p className="text-sm text-gray-500 dark:text-white text-center py-8">No active votes</p>
                ) : (
                  activeVotes.map((vote) => {
                    const totalVotes = vote.options.reduce((sum, opt) => sum + opt.votes, 0);
                    const endDate = vote.endTime.toLocaleDateString();
                    return (
                      <div 
                        key={vote.id} 
                        className="flex items-center justify-between p-4 border border-gray-200 dark:border-[hsl(217,35%,25%)] rounded-lg bg-white/50 dark:bg-gray-800/50 hover:bg-white/70 dark:hover:bg-gray-800/70 transition-colors"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-gray-900 dark:text-white">{vote.title}</h3>
                            <Badge className="bg-green-100 text-green-700">Active</Badge>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-white mb-2">{vote.description}</p>
                          <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-white">
                            <span className="flex items-center gap-1">
                              <VoteIcon className="h-3 w-3" />
                              {totalVotes} votes
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              Ends: {endDate}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleOpenVoteDialog(vote)}
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleCloseVote(vote.id)}
                            className="text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                          >
                            Close
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setVoteToDelete(vote.id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </CardContent>
          </Card>

          {/* Past Votes */}
          <Card className="glass-card floating-hover">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5 text-electric-blue" />
                Past Votes
              </CardTitle>
              <CardDescription>Completed voting sessions with results</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {pastVotes.length === 0 ? (
                  <p className="text-sm text-gray-500 dark:text-white text-center py-8">No past votes</p>
                ) : (
                  pastVotes.map((vote) => {
                    const result = calculateVoteResult(vote);
                    const totalVotes = vote.options.reduce((sum, opt) => sum + opt.votes, 0);
                    const endDate = vote.endTime.toLocaleDateString();
                    const isPassed = result === 'passed';
                    
                    return (
                      <div 
                        key={vote.id} 
                        className={`p-4 border rounded-lg transition-colors ${
                          isPassed 
                            ? 'border-green-300 bg-green-50/50' 
                            : 'border-red-300 bg-red-50/50'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold text-gray-900 dark:text-white">{vote.title}</h3>
                              {isPassed ? (
                                <Badge className="bg-green-600 text-white">
                                  <CheckCircle2 className="h-3 w-3 mr-1" />
                                  PASSED
                                </Badge>
                              ) : (
                                <Badge className="bg-red-600 text-white">
                                  <XCircle className="h-3 w-3 mr-1" />
                                  FAILED
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-gray-600 dark:text-white mb-2">{vote.description}</p>
                            <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-white mb-3">
                              <span className="flex items-center gap-1">
                                <VoteIcon className="h-3 w-3" />
                                {totalVotes} total votes
                              </span>
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                Ended: {endDate}
                              </span>
                            </div>
                            <div className="space-y-2">
                              {vote.options.map((option) => {
                                const percentage = totalVotes > 0 ? (option.votes / totalVotes) * 100 : 0;
                                const isWinning = isPassed && option.id === 'yes' || 
                                                 !isPassed && option.id === 'no' ||
                                                 (option.votes === Math.max(...vote.options.map(o => o.votes)));
                                return (
                                  <div key={option.id} className="space-y-1">
                                    <div className="flex items-center justify-between text-sm">
                                      <span className={`font-medium ${isWinning ? 'text-gray-900 dark:text-white' : 'text-gray-600 dark:text-white'}`}>
                                        {option.label}
                                      </span>
                                      <span className="text-gray-600 dark:text-white">
                                        {option.votes} ({percentage.toFixed(1)}%)
                                      </span>
                                    </div>
                                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                      <div
                                        className={`h-full transition-all ${
                                          isPassed && option.id === 'yes' 
                                            ? 'bg-green-600' 
                                            : !isPassed && option.id === 'no'
                                            ? 'bg-red-600'
                                            : 'bg-gray-400'
                                        }`}
                                        style={{ width: `${percentage}%` }}
                                      />
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                          <div className="flex items-center gap-2 ml-4">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleOpenVoteDialog(vote)}
                            >
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => setVoteToDelete(vote.id)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Summit Tab */}
        <TabsContent value="summit" className="space-y-4 sm:space-y-6">
          <Card className="bg-white border border-gray-200 shadow-sm !text-gray-900 dark:text-white">
            <CardHeader className="bg-white !text-gray-900 dark:text-white">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <CardTitle className="text-lg sm:text-xl !text-gray-900 dark:text-white font-semibold">Summit Committee Members</CardTitle>
                  <CardDescription className="text-xs sm:text-sm !text-gray-600 dark:text-white">
                    Manage members who have access to Summit Planning. Search for registered members to add them.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 bg-white !text-gray-900 dark:text-white">
              {/* Search for Members */}
              <div className="space-y-3">
                <Label className="!text-gray-900 dark:text-white font-semibold">Search Registered Members</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500 dark:text-white" />
                  <Input
                    placeholder="Search by name or email..."
                    className="pl-10 bg-white text-gray-900 dark:text-white border-gray-300 dark:border-[hsl(217,35%,25%)] placeholder:text-gray-500 dark:text-white"
                    value={summitSearchQuery}
                    onChange={(e) => setSummitSearchQuery(e.target.value)}
                  />
                </div>
                
                {/* Search Results */}
                {summitSearchQuery && (
                  <div className="border border-gray-200 dark:border-[hsl(217,35%,25%)] rounded-lg bg-white max-h-60 overflow-y-auto">
                    {(() => {
                      // Get all registered members from all organizations
                      const allRegisteredMembers = members.flatMap(member => 
                        member.members
                          .filter(person => person.isRegistered !== false)
                          .map(person => ({
                            ...person,
                            organizationId: member.id,
                            organizationName: member.organizationName,
                            organizationLogo: member.logo,
                          }))
                      );
                      
                      // Filter by search query
                      const searchResults = allRegisteredMembers.filter(person =>
                        !summitMembers.some(sm => sm.email === person.email) && // Not already added
                        (
                          person.name.toLowerCase().includes(summitSearchQuery.toLowerCase()) ||
                          person.email.toLowerCase().includes(summitSearchQuery.toLowerCase())
                        )
                      );
                      
                      if (searchResults.length === 0) {
                        return (
                          <div className="p-4 text-center text-sm !text-gray-600 dark:text-white">
                            {summitSearchQuery ? 'No registered members found matching your search' : 'Start typing to search for members'}
                          </div>
                        );
                      }
                      
                      return (
                        <div className="divide-y divide-gray-200">
                          {searchResults.map((person) => (
                            <div
                              key={`${person.organizationId}-${person.id}`}
                              className="p-3 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer flex items-center justify-between"
                              onClick={async () => {
                                try {
                                  await addSummitMember({
                                    email: person.email,
                                    name: person.name,
                                    organizationId: person.organizationId,
                                    organizationName: person.organizationName,
                                  });
                                  const updated = await getSummitMembers();
                                  setSummitMembers(updated);
                                  setSummitSearchQuery('');
                                  toast({
                                    title: "Member Added",
                                    description: `${person.name} has been added to the Summit Committee.`,
                                  });
                                } catch (error: any) {
                                  console.error('Error adding summit member:', error);
                                  const errorMessage = error?.message || error?.details || 'Failed to add member to Summit Committee.';
                                  toast({
                                    title: "Error",
                                    description: errorMessage,
                                    variant: 'destructive',
                                  });
                                }
                              }}
                            >
                              <div className="flex items-center gap-3">
                                <div className="flex flex-col">
                                  <span className="font-medium !text-gray-900 dark:text-white">{person.name}</span>
                                  <span className="text-sm !text-gray-600 dark:text-white">{person.email}</span>
                                  {person.organizationName && (
                                    <span className="text-xs !text-gray-500 dark:text-white">{person.organizationName}</span>
                                  )}
                                </div>
                              </div>
                              <Button size="sm" variant="outline" className="ml-auto">
                                <Plus className="h-4 w-4 mr-1" />
                                Add
                              </Button>
                            </div>
                          ))}
                        </div>
                      );
                    })()}
                  </div>
                )}
              </div>

              {/* Summit Members List */}
              <div className="space-y-3">
                <Label className="!text-gray-900 dark:text-white font-semibold">
                  Summit Committee ({summitMembers.length})
                </Label>
                {summitMembers.length === 0 ? (
                  <div className="border border-gray-200 dark:border-[hsl(217,35%,25%)] rounded-lg p-8 text-center bg-gray-50">
                    <Users className="h-12 w-12 text-gray-400 dark:text-white mx-auto mb-3" />
                    <p className="text-sm !text-gray-600 dark:text-white font-medium">
                      No summit committee members yet. Search above to add members.
                    </p>
                  </div>
                ) : (
                  <div className="border border-gray-200 dark:border-[hsl(217,35%,25%)] rounded-lg overflow-hidden bg-white">
                    <div className="overflow-x-auto">
                      <table className="w-full bg-white">
                        <thead className="bg-gray-100 dark:bg-gray-800 border-b-2 border-gray-300 dark:border-[hsl(217,35%,25%)]">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-semibold !text-gray-900 dark:text-white uppercase bg-gray-100 dark:bg-gray-800">Name</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold !text-gray-900 dark:text-white uppercase hidden sm:table-cell bg-gray-100 dark:bg-gray-800">Email</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold !text-gray-900 dark:text-white uppercase hidden lg:table-cell bg-gray-100 dark:bg-gray-800">Organization</th>
                            <th className="px-4 py-3 text-right text-xs font-semibold !text-gray-900 dark:text-white uppercase bg-gray-100 dark:bg-gray-800">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-[hsl(217,40%,18%)] divide-y divide-gray-200 dark:divide-[hsl(217,35%,25%)]">
                          {summitMembers.map((person) => (
                            <tr key={person.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 bg-white">
                              <td className="px-4 py-4 bg-white">
                                <span className="font-semibold text-base !text-gray-900 dark:text-white">{person.name || 'Unknown'}</span>
                              </td>
                              <td className="px-4 py-4 text-base !text-gray-900 dark:text-white bg-white hidden sm:table-cell">{person.email || '-'}</td>
                              <td className="px-4 py-4 text-base !text-gray-900 dark:text-white bg-white hidden lg:table-cell">
                                <div className="flex items-center gap-2">
                                  <Building2 className="h-5 w-5 !text-gray-600 dark:text-white" />
                                  <span className="font-medium !text-gray-900 dark:text-white">{person.organizationName || '-'}</span>
                                </div>
                              </td>
                              <td className="px-4 py-4 bg-white">
                                <div className="flex items-center justify-end gap-2">
                                  <Button 
                                    variant="ghost" 
                                    size="sm"
                                    onClick={async () => {
                                      try {
                                        await removeSummitMember(person.email);
                                        const updated = await getSummitMembers();
                                        setSummitMembers(updated);
                                        toast({
                                          title: "Member Removed",
                                          description: `${person.name} has been removed from the Summit Committee.`,
                                        });
                                      } catch (error) {
                                        console.error('Error removing summit member:', error);
                                        toast({
                                          title: "Error",
                                          description: "Failed to remove member from Summit Committee.",
                                          variant: 'destructive',
                                        });
                                      }
                                    }}
                                    className="h-8 px-3 !text-red-600 hover:!text-red-700 hover:bg-red-50"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Admin Roles */}
          <Card className="bg-white dark:bg-[hsl(217,40%,18%)] border border-gray-200 dark:border-[hsl(217,35%,25%)] shadow-sm !text-gray-900 dark:text-white">
            <CardHeader className="bg-white dark:bg-[hsl(217,40%,18%)] !text-gray-900 dark:text-white">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <CardTitle className="text-lg sm:text-xl !text-gray-900 dark:text-white font-semibold">Admin Roles</CardTitle>
                  <CardDescription className="text-xs sm:text-sm !text-gray-600 dark:text-white">
                    Manage admin and super admin roles. Search for registered members to assign admin authority.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 bg-white dark:bg-[hsl(217,40%,18%)] !text-gray-900 dark:text-white">
              {/* Search for Members */}
              {(isSuperAdminUser || isAdminUser) && (
                <div className="space-y-3">
                  <Label className="!text-gray-900 dark:text-white font-semibold">Search Registered Members</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500 dark:text-white" />
                    <Input
                      placeholder="Search by name or email..."
                      className="pl-10 bg-white dark:bg-[hsl(217,40%,18%)] text-gray-900 dark:text-white border-gray-300 dark:border-[hsl(217,35%,25%)] placeholder:text-gray-500 dark:text-white"
                      value={adminSearchQuery}
                      onChange={(e) => setAdminSearchQuery(e.target.value)}
                    />
                  </div>
                  
                  {/* Search Results */}
                  {adminSearchQuery && (
                    <div className="border border-gray-200 dark:border-[hsl(217,35%,25%)] rounded-lg bg-white dark:bg-[hsl(217,40%,18%)] max-h-60 overflow-y-auto">
                    {(() => {
                      // Get all registered members from all organizations
                      const allRegisteredMembers = members.flatMap(member => 
                        member.members
                          .filter(person => person.isRegistered !== false)
                          .map(person => ({
                            ...person,
                            organizationId: member.id,
                            organizationName: member.organizationName,
                            organizationLogo: member.logo,
                          }))
                      );
                      
                      // Filter by search query
                      const searchResults = allRegisteredMembers.filter(person =>
                        (person.role !== 'admin' && person.role !== 'super_admin') && // Not already admin
                        (
                          person.name.toLowerCase().includes(adminSearchQuery.toLowerCase()) ||
                          person.email.toLowerCase().includes(adminSearchQuery.toLowerCase())
                        )
                      );
                      
                      if (searchResults.length === 0) {
                        return (
                          <div className="p-4 text-center text-sm !text-gray-600 dark:text-white">
                            {adminSearchQuery ? 'No registered members found matching your search' : 'Start typing to search for members'}
                          </div>
                        );
                      }
                      
                      return (
                        <div className="divide-y divide-gray-200 dark:divide-[hsl(217,35%,25%)]">
                          {searchResults.map((person) => (
                            <div
                              key={`${person.organizationId}-${person.id}`}
                              className="p-3 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer flex items-center justify-between"
                            >
                              <div className="flex items-center gap-3">
                                <div className="flex flex-col">
                                  <span className="font-medium !text-gray-900 dark:text-white">{person.name}</span>
                                  <span className="text-sm !text-gray-600 dark:text-white">{person.email}</span>
                                  {person.organizationName && (
                                    <span className="text-xs !text-gray-500 dark:text-white">{person.organizationName}</span>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                {(isSuperAdminUser || isAdminUser) ? (
                                  <Select
                                    value=""
                                    onValueChange={async (value: UserRole) => {
                                      try {
                                        const { data, error } = await supabase.rpc('update_user_role', {
                                          user_email: person.email.toLowerCase().trim(),
                                          new_role: value
                                        });
                                        
                                        if (error) {
                                          console.error('Error updating user role:', error);
                                          toast({
                                            title: "Error",
                                            description: `Failed to update role: ${error.message}`,
                                            variant: "destructive",
                                          });
                                        } else if (data && data.success === false) {
                                          toast({
                                            title: "Error",
                                            description: data.message || "Failed to update role.",
                                            variant: "destructive",
                                          });
                                        } else {
                                          await loadAdminMembers();
                                          setAdminSearchQuery('');
                                          toast({
                                            title: "Role Updated",
                                            description: `${person.name} has been assigned ${value === 'admin' ? 'Admin' : 'Super Admin'} role.`,
                                          });
                                        }
                                      } catch (error: any) {
                                        console.error('Error updating role:', error);
                                        toast({
                                          title: "Error",
                                          description: error?.message || "Failed to update role.",
                                          variant: "destructive",
                                        });
                                      }
                                    }}
                                  >
                                    <SelectTrigger className="w-32">
                                      <SelectValue placeholder="Assign role" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="admin">Admin</SelectItem>
                                      {isSuperAdminUser && (
                                        <SelectItem value="super_admin">Super Admin</SelectItem>
                                      )}
                                    </SelectContent>
                                  </Select>
                                ) : (
                                  <span className="text-sm text-gray-500 dark:text-white">Only Admins can assign admin roles</span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      );
                    })()}
                  </div>
                  )}
                </div>
              )}

              {/* Admin Members List */}
              <div className="space-y-3">
                <Label className="!text-gray-900 dark:text-white font-semibold">
                  Current Admins ({adminMembers.length})
                </Label>
                {adminMembers.length === 0 ? (
                  <div className="border border-gray-200 dark:border-[hsl(217,35%,25%)] rounded-lg p-8 text-center bg-gray-50 dark:bg-gray-800">
                    <Shield className="h-12 w-12 text-gray-400 dark:text-white mx-auto mb-3" />
                    <p className="text-sm !text-gray-600 dark:text-white font-medium">
                      No admin members yet. Search above to assign admin roles.
                    </p>
                  </div>
                ) : (
                  <div className="border border-gray-200 dark:border-[hsl(217,35%,25%)] rounded-lg overflow-hidden bg-white dark:bg-[hsl(217,40%,18%)]">
                    <div className="overflow-x-auto">
                      <table className="w-full bg-white dark:bg-[hsl(217,40%,18%)]">
                        <thead className="bg-gray-100 dark:bg-gray-800 border-b-2 border-gray-300 dark:border-[hsl(217,35%,25%)]">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-semibold !text-gray-900 dark:text-white uppercase bg-gray-100 dark:bg-gray-800">Name</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold !text-gray-900 dark:text-white uppercase hidden sm:table-cell bg-gray-100 dark:bg-gray-800">Email</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold !text-gray-900 dark:text-white uppercase hidden lg:table-cell bg-gray-100 dark:bg-gray-800">Organization</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold !text-gray-900 dark:text-white uppercase bg-gray-100 dark:bg-gray-800">Role</th>
                            <th className="px-4 py-3 text-right text-xs font-semibold !text-gray-900 dark:text-white uppercase bg-gray-100 dark:bg-gray-800">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-[hsl(217,40%,18%)] divide-y divide-gray-200 dark:divide-[hsl(217,35%,25%)]">
                          {adminMembers.map((person) => {
                            const currentUser = getCurrentUser();
                            const isCurrentUser = currentUser && currentUser.email.toLowerCase() === person.email.toLowerCase();
                            // In admin panel, show "Super Admin" for super_admin, but for current user always show their actual role
                            const displayRole = isCurrentUser && userRole === 'super_admin' ? 'Super Admin' : (person.role === 'super_admin' ? 'Super Admin' : 'Admin');
                            
                            return (
                            <tr key={person.email} className="hover:bg-gray-50 dark:hover:bg-gray-800 bg-white dark:bg-[hsl(217,40%,18%)]">
                              <td className="px-4 py-4 bg-white dark:bg-[hsl(217,40%,18%)]">
                                <span className="font-semibold text-base !text-gray-900 dark:text-white">{person.name || 'Unknown'}</span>
                              </td>
                              <td className="px-4 py-4 text-base !text-gray-900 dark:text-white bg-white dark:bg-[hsl(217,40%,18%)] hidden sm:table-cell">{person.email || '-'}</td>
                              <td className="px-4 py-4 text-base !text-gray-900 dark:text-white bg-white dark:bg-[hsl(217,40%,18%)] hidden lg:table-cell">
                                <div className="flex items-center gap-2">
                                  <Building2 className="h-5 w-5 !text-gray-600 dark:text-white" />
                                  <span className="font-medium !text-gray-900 dark:text-white">{person.organizationName || '-'}</span>
                                </div>
                              </td>
                              <td className="px-4 py-4 bg-white dark:bg-[hsl(217,40%,18%)]">
                                <Badge className={person.role === 'super_admin' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'}>
                                  {displayRole}
                                </Badge>
                              </td>
                              <td className="px-4 py-4 bg-white dark:bg-[hsl(217,40%,18%)]">
                                <div className="flex items-center justify-end gap-2">
                                  {(isSuperAdminUser || isAdminUser) ? (
                                    <>
                                      <Select
                                        value={person.role}
                                        onValueChange={async (value: UserRole) => {
                                          try {
                                            const { data, error } = await supabase.rpc('update_user_role', {
                                              user_email: person.email.toLowerCase().trim(),
                                              new_role: value
                                            });
                                            
                                            if (error) {
                                              console.error('Error updating user role:', error);
                                              toast({
                                                title: "Error",
                                                description: `Failed to update role: ${error.message}`,
                                                variant: "destructive",
                                              });
                                            } else if (data && data.success === false) {
                                              toast({
                                                title: "Error",
                                                description: data.message || "Failed to update role.",
                                                variant: "destructive",
                                              });
                                            } else {
                                              await loadAdminMembers();
                                              toast({
                                                title: "Role Updated",
                                                description: `${person.name}'s role has been updated to ${value === 'admin' ? 'Admin' : value === 'super_admin' ? 'Super Admin' : value === 'voting_member' ? 'Voting Member' : 'Member'}.`,
                                              });
                                            }
                                          } catch (error: any) {
                                            console.error('Error updating role:', error);
                                            toast({
                                              title: "Error",
                                              description: error?.message || "Failed to update role.",
                                              variant: "destructive",
                                            });
                                          }
                                        }}
                                      >
                                        <SelectTrigger className="w-36">
                                          <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="member">Member</SelectItem>
                                          <SelectItem value="voting_member">Voting Member</SelectItem>
                                          <SelectItem value="admin">Admin</SelectItem>
                                          {isSuperAdminUser && (
                                            <SelectItem value="super_admin">Super Admin</SelectItem>
                                          )}
                                        </SelectContent>
                                      </Select>
                                      {person.role !== 'super_admin' && (
                                        <Button 
                                          variant="ghost" 
                                          size="sm"
                                          onClick={async () => {
                                            try {
                                              const { data, error } = await supabase.rpc('update_user_role', {
                                                user_email: person.email.toLowerCase().trim(),
                                                new_role: 'member'
                                              });
                                              
                                              if (error) {
                                                console.error('Error removing admin role:', error);
                                                toast({
                                                  title: "Error",
                                                  description: "Failed to remove admin role.",
                                                  variant: "destructive",
                                                });
                                              } else if (data && data.success === false) {
                                                toast({
                                                  title: "Error",
                                                  description: data.message || "Failed to remove admin role.",
                                                  variant: "destructive",
                                                });
                                              } else {
                                                await loadAdminMembers();
                                                toast({
                                                  title: "Admin Role Removed",
                                                  description: `${person.name} has been removed from admin roles.`,
                                                });
                                              }
                                            } catch (error) {
                                              console.error('Error removing admin role:', error);
                                              toast({
                                                title: "Error",
                                                description: "Failed to remove admin role.",
                                                variant: "destructive",
                                              });
                                            }
                                          }}
                                          className="h-8 px-3 !text-red-600 hover:!text-red-700 hover:bg-red-50"
                                        >
                                          <Trash2 className="h-4 w-4" />
                                        </Button>
                                      )}
                                    </>
                                  ) : (
                                    <span className="text-sm text-gray-500 dark:text-white">Only Super Admins can manage roles</span>
                                  )}
                                </div>
                              </td>
                            </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4 sm:space-y-6">
          <Card className="glass-card floating-hover">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-electric-blue" />
                Analytics Dashboard
              </CardTitle>
              <CardDescription>
                Track user activity, engagement, and portal usage metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AnalyticsDashboard />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Feedback Tab */}
        <TabsContent value="feedback" className="space-y-6">
          <Card className="glass-card floating-hover">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5 text-electric-blue" />
                Feedback Submissions
              </CardTitle>
              <CardDescription>
                View all feedback submissions from users
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingFeedback ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-electric-blue" />
                </div>
              ) : feedbackSubmissions.length === 0 ? (
                <div className="text-center py-8 text-gray-500 dark:text-white">
                  <MessageCircle className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No feedback submissions yet.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {feedbackSubmissions.map((feedback) => (
                    <Card key={feedback.id} className="border border-gray-200 dark:border-[hsl(217,35%,25%)]">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-4 mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <p className="font-semibold text-gray-900 dark:text-white">
                                {feedback.user_name || feedback.user_email}
                              </p>
                              <span className="text-sm text-gray-500 dark:text-gray-400">
                                {feedback.user_email}
                              </span>
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {new Date(feedback.created_at).toLocaleString()}
                            </p>
                          </div>
                        </div>
                        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-[hsl(217,35%,25%)]">
                          <p className="text-sm text-gray-700 dark:text-white whitespace-pre-wrap">
                            {feedback.feedback_text}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-6">
          <Card className="glass-card floating-hover">
            <CardHeader>
              <CardTitle>Portal Settings</CardTitle>
              <CardDescription>Configure portal-wide settings and preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-[hsl(217,35%,25%)] rounded-lg">
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">Member Registration</h3>
                    <p className="text-sm text-gray-600 dark:text-white">Allow new member organizations to register</p>
                  </div>
                  <Button 
                    variant={portalSettings.memberRegistration ? "default" : "outline"} 
                    size="sm"
                    onClick={() => handleSettingsChange('memberRegistration', !portalSettings.memberRegistration)}
                  >
                    {portalSettings.memberRegistration ? 'Enabled' : 'Disabled'}
                  </Button>
                </div>

                <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-[hsl(217,35%,25%)] rounded-lg">
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">Public Directory</h3>
                    <p className="text-sm text-gray-600 dark:text-white">Make member directory publicly visible</p>
                  </div>
                  <Button 
                    variant={portalSettings.publicDirectory ? "default" : "outline"} 
                    size="sm"
                    onClick={() => handleSettingsChange('publicDirectory', !portalSettings.publicDirectory)}
                  >
                    {portalSettings.publicDirectory ? 'Enabled' : 'Disabled'}
                  </Button>
                </div>

                <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-[hsl(217,35%,25%)] rounded-lg">
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">Email Notifications</h3>
                    <p className="text-sm text-gray-600 dark:text-white">Send email notifications for votes and updates</p>
                  </div>
                  <Button 
                    variant={portalSettings.emailNotifications ? "default" : "outline"} 
                    size="sm"
                    onClick={() => handleSettingsChange('emailNotifications', !portalSettings.emailNotifications)}
                  >
                    {portalSettings.emailNotifications ? 'Enabled' : 'Disabled'}
                  </Button>
                </div>

                <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-[hsl(217,35%,25%)] rounded-lg">
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">Content Moderation</h3>
                    <p className="text-sm text-gray-600 dark:text-white">Require approval for new content</p>
                  </div>
                  <Select
                    value={portalSettings.contentModeration}
                    onValueChange={(value: 'auto-approve' | 'require-approval') => handleSettingsChange('contentModeration', value)}
                  >
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="auto-approve">Auto-approve</SelectItem>
                      <SelectItem value="require-approval">Require Approval</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200">
                <Button 
                  className="bg-electric-blue hover:bg-electric-blue/90"
                  onClick={handleSaveSettings}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Settings className="h-4 w-4 mr-2" />
                      Save Settings
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card floating-hover">
            <CardHeader>
              <CardTitle>Data backup</CardTitle>
              <CardDescription>
                Download a JSON snapshot of portal database tables as of now. Use this for your own records; large tables
                (e.g. analytics) may take a moment.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-600 dark:text-white">
                The file includes members, votes, files, discussions, summit data, tickets, interest forms, waitlist,
                settings, and more. Everything your admin account can read from Supabase.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 flex-wrap">
                <Button
                  type="button"
                  variant="outline"
                  className="bg-white"
                  onClick={handleDownloadFullBackup}
                  disabled={isDownloadingBackup || isDownloadingStorage || isLoadingSettings}
                >
                  {isDownloadingBackup ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Preparing backup…
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4 mr-2" />
                      Download full backup (JSON)
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="bg-white"
                  onClick={handleDownloadStorageBackup}
                  disabled={isDownloadingStorage || isDownloadingBackup || isLoadingSettings}
                >
                  {isDownloadingStorage ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      {storageBackupStatus || 'Preparing storage ZIP…'}
                    </>
                  ) : (
                    <>
                      <Folder className="h-4 w-4 mr-2" />
                      Download storage (ZIP)
                    </>
                  )}
                </Button>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Storage ZIP includes buckets: <code className="text-xs">files</code>,{' '}
                <code className="text-xs">avatars</code>, <code className="text-xs">post-images</code>,{' '}
                <code className="text-xs">flags</code>. Your account must have storage read access; a manifest lists any
                skipped files.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Member Dialog */}
      <Dialog open={!!editingMember} onOpenChange={(open) => !open && handleCancelEdit()}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white dark:bg-[hsl(217,40%,18%)] border-gray-200 dark:border-[hsl(217,35%,25%)]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
              <Edit className="h-5 w-5 text-electric-blue" />
              Edit Member Organization
            </DialogTitle>
            <DialogDescription className="text-gray-600 dark:text-white">
              Update organization information and manage individual members
            </DialogDescription>
          </DialogHeader>

          {editFormData && (
            <div className="space-y-6 mt-4">
              {/* Organization Information */}
              <Card className="border border-gray-200">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Building2 className="h-4 w-4 text-electric-blue" />
                    Organization Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 pt-0">
                  {/* Logo Upload */}
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0">
                      {logoPreview || editFormData.logo ? (
                        <img 
                          src={logoPreview || editFormData.logo || '/placeholder.svg'} 
                          alt="Organization logo" 
                          className="h-16 w-16 rounded-lg object-cover border border-gray-200"
                        />
                      ) : (
                        <div className="h-16 w-16 rounded-lg bg-gray-100 dark:bg-gray-800 border border-gray-200 flex items-center justify-center">
                          <Building2 className="h-6 w-6 text-gray-400 dark:text-white" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <Label htmlFor="edit-logo-upload" className="cursor-pointer">
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-white hover:text-electric-blue">
                          <Upload className="h-4 w-4" />
                          Upload Logo
                        </div>
                      </Label>
                      <input
                        id="edit-logo-upload"
                        type="file"
                        accept="image/*"
                        onChange={handleLogoUpload}
                        className="hidden"
                      />
                      <p className="text-xs text-gray-500 dark:text-white mt-1">Recommended: 200x200px, PNG or JPG</p>
                    </div>
                  </div>

                  {/* Organization Name */}
                  <div className="space-y-1.5">
                    <Label htmlFor="edit-org-name" className="text-sm">Organization Name *</Label>
                    <Input
                      id="edit-org-name"
                      value={editFormData.organizationName}
                      onChange={(e) => handleEditInputChange('organizationName', e.target.value)}
                      placeholder="Enter organization name"
                    />
                  </div>

                  {/* Country */}
                  <div className="space-y-1.5">
                    <Label htmlFor="edit-country" className="text-sm">Country *</Label>
                    <Input
                      id="edit-country"
                      value={editFormData.country}
                      onChange={(e) => handleEditInputChange('country', e.target.value)}
                      placeholder="Enter country"
                    />
                  </div>

                  {/* Bio */}
                  <div className="space-y-1.5">
                    <Label htmlFor="edit-bio" className="text-sm">Organization Bio</Label>
                    <Textarea
                      id="edit-bio"
                      value={editFormData.bio || ''}
                      onChange={(e) => handleEditInputChange('bio', e.target.value)}
                      placeholder="Tell us about your organization..."
                      rows={3}
                    />
                  </div>

                  {/* Website */}
                  <div className="space-y-1.5">
                    <Label htmlFor="edit-website" className="text-sm">Website</Label>
                    <Input
                      id="edit-website"
                      type="url"
                      value={editFormData.website || ''}
                      onChange={(e) => handleEditInputChange('website', e.target.value)}
                      placeholder="https://example.com"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Organization Members */}
              <Card className="border border-gray-200">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <Users className="h-4 w-4 text-electric-blue" />
                        Organization Members ({editFormData.members.length})
                      </CardTitle>
                      <CardDescription className="text-sm">
                        Manage team members associated with this organization
                      </CardDescription>
                    </div>
                    <Button onClick={handleAddEditMember} variant="outline" size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Member
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-3">
                    {editFormData.members.map((member) => (
                      <div 
                        key={member.id} 
                        className="p-3 border border-gray-200 dark:border-[hsl(217,35%,25%)] rounded-lg bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm space-y-2"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            {member.isVotingRep && (
                              <div className="flex items-center gap-1 text-electric-blue">
                                <Hand className="h-4 w-4" />
                                <span className="text-xs font-medium">Voting Representative</span>
                              </div>
                            )}
                          </div>
                          {editFormData.members.length > 1 && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveEditMember(member.id)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div className="space-y-1.5">
                            <Label className="text-sm">Name *</Label>
                            <Input
                              value={member.name}
                              onChange={(e) => handleEditMemberChange(member.id, 'name', e.target.value)}
                              placeholder="Full name"
                            />
                          </div>

                          <div className="space-y-1.5">
                            <Label className="text-sm">Email *</Label>
                            <Input
                              type="email"
                              value={member.email}
                              onChange={(e) => handleEditMemberChange(member.id, 'email', e.target.value)}
                              placeholder="email@example.com"
                            />
                          </div>

                          <div className="space-y-1.5">
                            <Label className="text-sm">Title</Label>
                            <Input
                              value={member.title || ''}
                              onChange={(e) => handleEditMemberChange(member.id, 'title', e.target.value)}
                              placeholder="Job title"
                            />
                          </div>

                          <div className="space-y-1.5">
                            <Label htmlFor={`edit-member-voting-${member.id}`} className="text-sm">Voting Representative</Label>
                            <div className="flex items-center gap-2">
                              <input
                                id={`edit-member-voting-${member.id}`}
                                name={`edit-member-voting-${member.id}`}
                                type="checkbox"
                                checked={member.isVotingRep || false}
                                onChange={(e) => {
                                  const newMembers = editFormData.members.map(m => ({
                                    ...m,
                                    isVotingRep: m.id === member.id ? e.target.checked : false
                                  }));
                                  setEditFormData({ ...editFormData, members: newMembers });
                                }}
                                className="h-4 w-4 text-electric-blue focus:ring-electric-blue border-gray-300 dark:border-[hsl(217,35%,25%)] rounded"
                              />
                              <span className="text-xs text-gray-600 dark:text-white">
                                This person represents the organization in votes
                              </span>
                            </div>
                          </div>
                          
                          {canManageUserRoles && (
                            <div className="space-y-1.5 md:col-span-2">
                              <Label className="text-sm">User Role</Label>
                              <Select
                                value={member.role || 'member'}
                                onValueChange={async (value: UserRole) => {
                                  const newMembers = editFormData.members.map(m => ({
                                    ...m,
                                    role: m.id === member.id ? value : m.role
                                  }));
                                  setEditFormData({ ...editFormData, members: newMembers });
                                  
                                  // Update role in Supabase using RPC function
                                  try {
                                    // Call our special function that updates the user's role
                                    const { data, error } = await supabase.rpc('update_user_role', {
                                      user_email: member.email.toLowerCase().trim(),
                                      new_role: value
                                    });
                                    
                                    if (error) {
                                      if (process.env.NODE_ENV === 'development') {
                                        console.error('Error updating user role:', error);
                                      }
                                      toast({
                                        title: "Error",
                                        description: `Failed to update role: ${error.message}`,
                                        variant: "destructive",
                                      });
                                    } else if (data && data.success === false) {
                                      // Function returned an error
                                      toast({
                                        title: "Error",
                                        description: data.error || 'Failed to update role',
                                        variant: "destructive",
                                      });
                                    } else {
                                      // Success!
                                      toast({
                                        title: "Role updated",
                                        description: `${member.name}'s role has been updated to ${value}. They may need to log out and back in for changes to take effect.`,
                                      });
                                    }
                                  } catch (error: any) {
                                    console.error('Error updating user role:', error);
                                    toast({
                                      title: "Error",
                                      description: `Failed to update role: ${error.message || 'Unknown error'}`,
                                      variant: "destructive",
                                    });
                                  }
                                }}
                              >
                                <SelectTrigger className="w-full">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="member">Member</SelectItem>
                                  <SelectItem value="voting_member">Voting Member</SelectItem>
                                  {(isSuperAdminUser || isAdminUser) && (
                                    <>
                                      <SelectItem value="admin">Admin</SelectItem>
                                      {isSuperAdminUser && (
                                        <SelectItem value="super_admin">Super Admin</SelectItem>
                                      )}
                                    </>
                                  )}
                                </SelectContent>
                              </Select>
                              <p className="text-xs text-gray-500 dark:text-white">
                                Only Admins can promote users to Admin roles. Super Admins can also promote to Super Admin.
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Dialog Actions */}
              <div className="flex justify-end gap-2 pt-4 border-t border-gray-200">
                <Button 
                  variant="outline" 
                  onClick={handleCancelEdit}
                  className="border-gray-300 dark:border-[hsl(217,35%,25%)] text-gray-700 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
                <Button onClick={handleSaveEdit} className="bg-electric-blue hover:bg-electric-blue/90">
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Add New Member Dialog */}
      <Dialog open={isAddingMember} onOpenChange={(open) => !open && handleCancelAddMember()}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white dark:bg-[hsl(217,40%,18%)] border-gray-200 dark:border-[hsl(217,35%,25%)]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
              <Plus className="h-5 w-5 text-electric-blue" />
              Add New Member Organization
            </DialogTitle>
            <DialogDescription className="text-gray-600 dark:text-white">
              Create a new member organization and add team members
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 mt-4">
            {/* Organization Information */}
            <Card className="border border-gray-200">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Building2 className="h-4 w-4 text-electric-blue" />
                  Organization Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 pt-0">
                {/* Logo Upload */}
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0">
                    {newLogoPreview ? (
                      <img 
                        src={newLogoPreview} 
                        alt="Organization logo" 
                        className="h-16 w-16 rounded-lg object-cover border border-gray-200"
                      />
                    ) : (
                      <div className="h-16 w-16 rounded-lg bg-gray-100 dark:bg-gray-800 border border-gray-200 flex items-center justify-center">
                        <Building2 className="h-6 w-6 text-gray-400 dark:text-white" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <Label htmlFor="new-logo-upload" className="cursor-pointer">
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-white hover:text-electric-blue">
                        <Upload className="h-4 w-4" />
                        Upload Logo
                      </div>
                    </Label>
                    <input
                      id="new-logo-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleNewLogoUpload}
                      className="hidden"
                    />
                    <p className="text-xs text-gray-500 dark:text-white mt-1">Recommended: 200x200px, PNG or JPG</p>
                  </div>
                </div>

                {/* Organization Name */}
                <div className="space-y-1.5">
                  <Label htmlFor="new-org-name" className="text-sm">Organization Name *</Label>
                  <Input
                    id="new-org-name"
                    value={newMemberData.organizationName}
                    onChange={(e) => handleNewMemberInputChange('organizationName', e.target.value)}
                    placeholder="Enter organization name"
                  />
                </div>

                {/* Country */}
                <div className="space-y-1.5">
                  <Label htmlFor="new-country" className="text-sm">Country *</Label>
                  <Input
                    id="new-country"
                    value={newMemberData.country}
                    onChange={(e) => handleNewMemberInputChange('country', e.target.value)}
                    placeholder="Enter country"
                  />
                </div>

                {/* Bio */}
                <div className="space-y-1.5">
                  <Label htmlFor="new-bio" className="text-sm">Organization Bio</Label>
                  <Textarea
                    id="new-bio"
                    value={newMemberData.bio || ''}
                    onChange={(e) => handleNewMemberInputChange('bio', e.target.value)}
                    placeholder="Tell us about your organization..."
                    rows={3}
                  />
                </div>

                {/* Website */}
                <div className="space-y-1.5">
                  <Label htmlFor="new-website" className="text-sm">Website</Label>
                  <Input
                    id="new-website"
                    type="url"
                    value={newMemberData.website || ''}
                    onChange={(e) => handleNewMemberInputChange('website', e.target.value)}
                    placeholder="https://example.com"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Organization Members */}
            <Card className="border border-gray-200">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Users className="h-4 w-4 text-electric-blue" />
                      Organization Members ({newMemberData.members.length})
                    </CardTitle>
                    <CardDescription className="text-sm">
                      Add team members associated with this organization
                    </CardDescription>
                  </div>
                  <Button onClick={handleAddNewMemberPerson} variant="outline" size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Member
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-3">
                  {newMemberData.members.map((member) => (
                    <div 
                      key={member.id} 
                      className="p-3 border border-gray-200 dark:border-[hsl(217,35%,25%)] rounded-lg bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm space-y-2"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          {member.isVotingRep && (
                            <div className="flex items-center gap-1 text-electric-blue">
                              <Hand className="h-4 w-4" />
                              <span className="text-xs font-medium">Voting Representative</span>
                            </div>
                          )}
                        </div>
                        {newMemberData.members.length > 1 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveNewMemberPerson(member.id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                          <Label htmlFor={`new-member-name-${member.id}`} className="text-sm">Name *</Label>
                          <Input
                            id={`new-member-name-${member.id}`}
                            name={`new-member-name-${member.id}`}
                            value={member.name}
                            onChange={(e) => handleNewMemberPersonChange(member.id, 'name', e.target.value)}
                            placeholder="Full name"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <Label htmlFor={`new-member-email-${member.id}`} className="text-sm">Email *</Label>
                          <Input
                            id={`new-member-email-${member.id}`}
                            name={`new-member-email-${member.id}`}
                            type="email"
                            value={member.email}
                            onChange={(e) => handleNewMemberPersonChange(member.id, 'email', e.target.value)}
                            placeholder="email@example.com"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <Label htmlFor={`new-member-title-${member.id}`} className="text-sm">Title</Label>
                          <Input
                            id={`new-member-title-${member.id}`}
                            name={`new-member-title-${member.id}`}
                            value={member.title || ''}
                            onChange={(e) => handleNewMemberPersonChange(member.id, 'title', e.target.value)}
                            placeholder="Job title"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <Label htmlFor={`new-member-voting-${member.id}`} className="text-sm">Voting Representative</Label>
                          <div className="flex items-center gap-2">
                            <input
                              id={`new-member-voting-${member.id}`}
                              name={`new-member-voting-${member.id}`}
                              type="checkbox"
                              checked={member.isVotingRep || false}
                              onChange={(e) => {
                                const newMembers = newMemberData.members.map(m => ({
                                  ...m,
                                  isVotingRep: m.id === member.id ? e.target.checked : false
                                }));
                                setNewMemberData({ ...newMemberData, members: newMembers });
                              }}
                              className="h-4 w-4 text-electric-blue focus:ring-electric-blue border-gray-300 dark:border-[hsl(217,35%,25%)] rounded"
                            />
                            <span className="text-xs text-gray-600 dark:text-white">
                              This person represents the organization in votes
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Dialog Actions */}
            <div className="flex justify-end gap-2 pt-4 border-t border-gray-200">
              <Button 
                variant="outline" 
                onClick={handleCancelAddMember}
                className="border-gray-300 dark:border-[hsl(217,35%,25%)] text-gray-700 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button onClick={handleSaveNewMember} className="bg-electric-blue hover:bg-electric-blue/90">
                <Save className="h-4 w-4 mr-2" />
                Create Member
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Category Dialog */}
      <Dialog open={showCategoryDialog} onOpenChange={setShowCategoryDialog}>
        <DialogContent className="bg-white dark:bg-[hsl(217,40%,18%)] border-gray-200 dark:border-[hsl(217,35%,25%)]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
              <Folder className="h-5 w-5 text-electric-blue" />
              {editingCategory ? 'Edit Category' : 'Create New Category'}
            </DialogTitle>
            <DialogDescription className="text-gray-600 dark:text-white">
              {editingCategory ? 'Update category details' : 'Create a new category for organizing files'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="category-name" className="text-gray-900 dark:text-white">Category Name *</Label>
              <Input
                id="category-name"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="e.g., Research, Meeting Minutes"
                className="bg-white text-gray-900 dark:text-white border-gray-300 dark:border-[hsl(217,35%,25%)]"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category-color" className="text-gray-900 dark:text-white">Color</Label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  id="category-color"
                  value={newCategoryColor}
                  onChange={(e) => setNewCategoryColor(e.target.value)}
                  className="h-10 w-20 rounded border border-gray-300 dark:border-[hsl(217,35%,25%)] cursor-pointer"
                />
                <Input
                  value={newCategoryColor}
                  onChange={(e) => setNewCategoryColor(e.target.value)}
                  placeholder="#3b82f6"
                  className="flex-1 bg-white text-gray-900 dark:text-white border-gray-300 dark:border-[hsl(217,35%,25%)]"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-4 border-t border-gray-200">
              <Button
                variant="outline"
                onClick={() => {
                  setShowCategoryDialog(false);
                  setEditingCategory(null);
                  setNewCategoryName('');
                  setNewCategoryColor('#3b82f6');
                }}
                className="border-gray-300 dark:border-[hsl(217,35%,25%)] text-gray-700 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:text-white bg-white"
              >
                Cancel
              </Button>
              <Button onClick={handleSaveCategory} className="bg-electric-blue hover:bg-electric-blue/90 text-white">
                <Save className="h-4 w-4 mr-2" />
                {editingCategory ? 'Update' : 'Create'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Vote Create/Edit Dialog */}
      <Dialog open={showVoteDialog} onOpenChange={setShowVoteDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-white dark:bg-[hsl(217,40%,18%)] border-gray-200 dark:border-[hsl(217,35%,25%)]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
              <VoteIcon className="h-5 w-5 text-electric-blue" />
              {editingVote ? 'Edit Vote' : 'Create New Vote'}
            </DialogTitle>
            <DialogDescription className="text-gray-600 dark:text-white">
              {editingVote ? 'Update vote details and options' : 'Create a new voting session'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="vote-title" className="text-gray-900 dark:text-white">Title *</Label>
              <Input
                id="vote-title"
                value={voteFormData.title || ''}
                onChange={(e) => setVoteFormData({ ...voteFormData, title: e.target.value })}
                placeholder="Enter vote title"
                className="bg-white text-gray-900 dark:text-white border-gray-300 dark:border-[hsl(217,35%,25%)]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="vote-description" className="text-gray-900 dark:text-white">Description *</Label>
              <Textarea
                id="vote-description"
                value={voteFormData.description || ''}
                onChange={(e) => setVoteFormData({ ...voteFormData, description: e.target.value })}
                placeholder="Describe what members are voting on..."
                rows={3}
                className="bg-white text-gray-900 dark:text-white border-gray-300 dark:border-[hsl(217,35%,25%)]"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="vote-organization" className="text-gray-900 dark:text-white">Organization</Label>
                <Input
                  id="vote-organization"
                  value={voteFormData.organization || ''}
                  onChange={(e) => setVoteFormData({ ...voteFormData, organization: e.target.value })}
                  placeholder="SLxAI Cooperative"
                  className="bg-white text-gray-900 dark:text-white border-gray-300 dark:border-[hsl(217,35%,25%)]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="vote-end-time" className="text-gray-900 dark:text-white">End Date & Time *</Label>
                <Input
                  id="vote-end-time"
                  type="datetime-local"
                  value={voteFormData.endTime ? new Date(voteFormData.endTime).toISOString().slice(0, 16) : ''}
                  onChange={(e) => setVoteFormData({ ...voteFormData, endTime: new Date(e.target.value) })}
                  className="bg-white text-gray-900 dark:text-white border-gray-300 dark:border-[hsl(217,35%,25%)]"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-gray-900 dark:text-white">Status</Label>
              <Select
                value={voteFormData.status || 'draft'}
                onValueChange={(value: 'active' | 'closed' | 'draft') => 
                  setVoteFormData({ ...voteFormData, status: value })
                }
              >
                <SelectTrigger className="bg-white text-gray-900 dark:text-white border-gray-300 dark:border-[hsl(217,35%,25%)]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-[hsl(217,40%,18%)] border-gray-200 dark:border-[hsl(217,35%,25%)]">
                  <SelectItem value="draft" className="text-gray-900 dark:text-white">Draft</SelectItem>
                  <SelectItem value="active" className="text-gray-900 dark:text-white">Active</SelectItem>
                  <SelectItem value="closed" className="text-gray-900 dark:text-white">Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-gray-900 dark:text-white">Vote Options *</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddVoteOption}
                  className="border-gray-300 dark:border-[hsl(217,35%,25%)] text-gray-700 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Option
                </Button>
              </div>
              <div className="space-y-2">
                {voteFormData.options?.map((option, index) => (
                  <div key={option.id} className="flex items-center gap-2">
                    <Input
                      value={option.label}
                      onChange={(e) => handleVoteOptionChange(option.id, 'label', e.target.value)}
                      placeholder={`Option ${index + 1}`}
                      className="flex-1 bg-white text-gray-900 dark:text-white border-gray-300 dark:border-[hsl(217,35%,25%)]"
                    />
                    {voteFormData.options && voteFormData.options.length > 2 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveVoteOption(option.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-gray-200">
              <Button
                variant="outline"
                onClick={() => {
                  setShowVoteDialog(false);
                  setEditingVote(null);
                }}
                className="border-gray-300 dark:border-[hsl(217,35%,25%)] text-gray-700 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:text-white"
              >
                Cancel
              </Button>
              <Button onClick={handleSaveVote} className="bg-electric-blue hover:bg-electric-blue/90 text-white">
                <Save className="h-4 w-4 mr-2" />
                {editingVote ? 'Update Vote' : 'Create Vote'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Vote Confirmation Dialog */}
      <AlertDialog open={!!voteToDelete} onOpenChange={(open) => !open && setVoteToDelete(null)}>
        <AlertDialogContent className="bg-white dark:bg-[hsl(217,40%,18%)] border-gray-200 dark:border-[hsl(217,35%,25%)]">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-gray-900 dark:text-white">Are you sure?</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-600 dark:text-white">
              This action cannot be undone. This will permanently delete the vote and all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel 
              onClick={() => setVoteToDelete(null)}
              className="border-gray-300 dark:border-[hsl(217,35%,25%)] text-gray-700 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:text-white bg-white"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteVote}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete File Confirmation Dialog */}
      <AlertDialog open={!!fileToDelete} onOpenChange={(open) => !open && setFileToDelete(null)}>
        <AlertDialogContent className="bg-white dark:bg-[hsl(217,40%,18%)] border-gray-200 dark:border-[hsl(217,35%,25%)]">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-gray-900 dark:text-white">Are you sure you want to delete this?</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-600 dark:text-white">
              {fileToDelete && files.find(f => f.id === fileToDelete) && (
                <>
                  This will permanently delete the file "{files.find(f => f.id === fileToDelete)?.name}".
                  <br />
                  <br />
                  This action cannot be undone. The file will be removed from both storage and the database.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel 
              onClick={() => setFileToDelete(null)}
              className="border-gray-300 dark:border-[hsl(217,35%,25%)] text-gray-700 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:text-white bg-white"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteFile}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Yes, Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Category Confirmation Dialog */}
      <AlertDialog open={!!categoryToDelete} onOpenChange={(open) => !open && setCategoryToDelete(null)}>
        <AlertDialogContent className="bg-white dark:bg-[hsl(217,40%,18%)] border-gray-200 dark:border-[hsl(217,35%,25%)]">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-gray-900 dark:text-white">Are you sure you want to delete this?</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-600 dark:text-white">
              {categoryToDelete && categories.find(c => c.id === categoryToDelete) && (
                <>
                  This will permanently delete the category "{categories.find(c => c.id === categoryToDelete)?.name}".
                  <br />
                  <br />
                  All files in this category will be moved to the "Other" category. This action cannot be undone.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel 
              onClick={() => setCategoryToDelete(null)}
              className="border-gray-300 dark:border-[hsl(217,35%,25%)] text-gray-700 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:text-white bg-white"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteCategory}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Yes, Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit File Dialog */}
      {renamingFile && (
        <Dialog open={!!renamingFile} onOpenChange={() => {
          setRenamingFile(null);
          setNewFileName('');
          setEditingFileCategory('');
          setEditingFileMonth('');
          setEditingFileYear('');
          setEditingFileAuthors(['']);
        }}>
          <DialogContent className="bg-white dark:bg-[hsl(217,40%,18%)] border-gray-200 dark:border-[hsl(217,35%,25%)]">
            <DialogHeader>
              <DialogTitle className="text-gray-900 dark:text-white">Edit File</DialogTitle>
              <DialogDescription className="text-gray-600 dark:text-white">
                Update the file name, category, date, and authors. The original file remains unchanged.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="new-file-name" className="text-sm text-gray-700 dark:text-white">File Name</Label>
                <Input
                  id="new-file-name"
                  name="new-file-name"
                  value={newFileName}
                  onChange={(e) => setNewFileName(e.target.value)}
                  placeholder="Enter file name"
                  className="text-sm text-gray-900 dark:text-white bg-white dark:bg-[hsl(217,40%,18%)] border-gray-300 dark:border-[hsl(217,35%,25%)] focus:border-electric-blue focus:ring-electric-blue"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleSaveRename();
                    } else if (e.key === 'Escape') {
                      setRenamingFile(null);
                      setNewFileName('');
                      setEditingFileCategory('');
                      setEditingFileMonth('');
                      setEditingFileYear('');
                      setEditingFileAuthors(['']);
                    }
                  }}
                  autoFocus
                />
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  This only changes the display name. The original file URL remains unchanged.
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="file-category-edit" className="text-sm text-gray-700 dark:text-white">Category</Label>
                <Select
                  value={editingFileCategory}
                  onValueChange={setEditingFileCategory}
                >
                  <SelectTrigger 
                    id="file-category-edit"
                    name="file-category-edit"
                    className="bg-white dark:bg-[hsl(217,40%,18%)] text-gray-900 dark:text-white border-gray-300 dark:border-[hsl(217,35%,25%)]"
                  >
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-[hsl(217,40%,18%)] border-gray-200 dark:border-[hsl(217,35%,25%)]">
                    {categories.map((category) => (
                      <SelectItem 
                        key={category.id} 
                        value={category.id}
                        className="dark:text-white dark:hover:bg-gray-800"
                      >
                        <div className="flex items-center gap-2">
                          <div
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: category.color }}
                          />
                          {category.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="file-month-edit" className="text-sm text-gray-700 dark:text-white">Month (Optional)</Label>
                  <Select
                    value={editingFileMonth || 'none'}
                    onValueChange={(value) => setEditingFileMonth(value === 'none' ? '' : value)}
                  >
                    <SelectTrigger 
                      id="file-month-edit"
                      name="file-month-edit"
                      className="bg-white dark:bg-[hsl(217,40%,18%)] text-gray-900 dark:text-white border-gray-300 dark:border-[hsl(217,35%,25%)]"
                    >
                      <SelectValue placeholder="Select month" />
                    </SelectTrigger>
                    <SelectContent className="bg-white dark:bg-[hsl(217,40%,18%)] border-gray-200 dark:border-[hsl(217,35%,25%)]">
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
                  <Label htmlFor="file-year-edit" className="text-sm text-gray-700 dark:text-white">Year *</Label>
                  <Input
                    id="file-year-edit"
                    name="file-year-edit"
                    type="number"
                    value={editingFileYear}
                    onChange={(e) => setEditingFileYear(e.target.value)}
                    placeholder="YYYY"
                    min="1900"
                    max="2100"
                    className="text-sm text-gray-900 dark:text-white bg-white dark:bg-[hsl(217,40%,18%)] border-gray-300 dark:border-[hsl(217,35%,25%)] focus:border-electric-blue focus:ring-electric-blue"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="file-authors-edit" className="text-sm text-gray-700 dark:text-white">Authors</Label>
                <div className="space-y-2">
                  {editingFileAuthors.map((author, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Input
                        id={`file-author-edit-${index}`}
                        name={`file-author-edit-${index}`}
                        type="text"
                        value={author}
                        onChange={(e) => {
                          const newAuthors = [...editingFileAuthors];
                          newAuthors[index] = e.target.value;
                          setEditingFileAuthors(newAuthors);
                        }}
                        placeholder="Author name"
                        className="flex-1 text-sm text-gray-900 dark:text-white bg-white dark:bg-[hsl(217,40%,18%)] border-gray-300 dark:border-[hsl(217,35%,25%)] focus:border-electric-blue focus:ring-electric-blue"
                      />
                      {index === editingFileAuthors.length - 1 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setEditingFileAuthors([...editingFileAuthors, ''])}
                          className="border-gray-300 dark:border-[hsl(217,35%,25%)] text-gray-700 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800 h-9 px-3"
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      )}
                      {editingFileAuthors.length > 1 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const newAuthors = editingFileAuthors.filter((_, i) => i !== index);
                            setEditingFileAuthors(newAuthors.length > 0 ? newAuthors : ['']);
                          }}
                          className="border-gray-300 dark:border-[hsl(217,35%,25%)] text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 h-9 px-3"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Add multiple authors by clicking the + button</p>
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setRenamingFile(null);
                    setNewFileName('');
                    setEditingFileCategory('');
                    setEditingFileMonth('');
                    setEditingFileYear('');
                    setEditingFileAuthors(['']);
                  }}
                  className="border-gray-300 dark:border-[hsl(217,35%,25%)] text-gray-700 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSaveRename}
                  className="bg-electric-blue hover:bg-blue-600 text-white"
                  disabled={!newFileName.trim()}
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Delete Member Confirmation Dialog */}
      <AlertDialog open={!!memberToDelete} onOpenChange={(open) => !open && setMemberToDelete(null)}>
        <AlertDialogContent className="bg-white dark:bg-[hsl(217,40%,18%)] border-gray-200 dark:border-[hsl(217,35%,25%)]">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-gray-900 dark:text-white">Are you sure you want to delete this?</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-600 dark:text-white">
              {memberToDelete && members.find(m => m.id === memberToDelete) && (
                <>
                  This will permanently delete the organization "{members.find(m => m.id === memberToDelete)?.organizationName}".
                  <br />
                  <br />
                  This action cannot be undone. All associated data will be removed.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel 
              onClick={() => setMemberToDelete(null)}
              className="border-gray-300 dark:border-[hsl(217,35%,25%)] text-gray-700 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:text-white bg-white"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteMember}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Yes, Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Merge Organizations Dialog */}
      <Dialog open={showMergeDialog} onOpenChange={setShowMergeDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Merge Organizations</DialogTitle>
            <DialogDescription>
              Select the organization name to use for the merged organization, or enter a new name.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Organizations to merge:</Label>
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 space-y-1 max-h-32 overflow-y-auto">
                {members
                  .filter(m => selectedMembers.has(m.id))
                  .map((org) => (
                    <div key={org.id} className="text-sm text-gray-700 dark:text-gray-300">
                      • {org.organizationName} ({org.members.length} {org.members.length === 1 ? 'member' : 'members'})
                    </div>
                  ))}
              </div>
            </div>

            <div className="space-y-3">
              <Label>Choose organization name:</Label>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="select-name"
                    name="name-option"
                    checked={mergeNameOption === 'select'}
                    onChange={() => {
                      setMergeNameOption('select');
                      const firstOrg = members.find(m => selectedMembers.has(m.id));
                      setMergeTargetName(firstOrg?.organizationName || '');
                    }}
                    className="h-4 w-4 text-electric-blue"
                  />
                  <Label htmlFor="select-name" className="cursor-pointer">
                    Select from existing names
                  </Label>
                </div>
                {mergeNameOption === 'select' && (
                  <Select
                    value={mergeTargetName}
                    onValueChange={setMergeTargetName}
                  >
                    <SelectTrigger className="ml-6">
                      <SelectValue placeholder="Select organization name" />
                    </SelectTrigger>
                    <SelectContent>
                      {members
                        .filter(m => selectedMembers.has(m.id))
                        .map((org) => (
                          <SelectItem key={org.id} value={org.organizationName}>
                            {org.organizationName}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                )}

                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="custom-name"
                    name="name-option"
                    checked={mergeNameOption === 'custom'}
                    onChange={() => {
                      setMergeNameOption('custom');
                      setMergeTargetName('');
                    }}
                    className="h-4 w-4 text-electric-blue"
                  />
                  <Label htmlFor="custom-name" className="cursor-pointer">
                    Enter new name
                  </Label>
                </div>
                {mergeNameOption === 'custom' && (
                  <Input
                    placeholder="Enter organization name"
                    value={mergeTargetName}
                    onChange={(e) => setMergeTargetName(e.target.value)}
                    className="ml-6"
                  />
                )}
              </div>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                <strong>Note:</strong> All individuals from the selected organizations will be merged into one organization. 
                Duplicate organizations will be removed.
              </p>
            </div>
          </div>
          <div className="flex gap-2 justify-end">
            <Button
              variant="outline"
              onClick={() => {
                setShowMergeDialog(false);
                setMergeTargetName('');
              }}
              disabled={isMerging}
            >
              Cancel
            </Button>
            <Button
              onClick={handleMergeOrganizations}
              disabled={isMerging || !mergeTargetName.trim()}
              className="bg-electric-blue hover:bg-blue-600"
            >
              {isMerging ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Merging...
                </>
              ) : (
                <>
                  <Users className="h-4 w-4 mr-2" />
                  Merge Organizations
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

