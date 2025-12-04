import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PageTitle } from '@/components/PageTitle';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useIsMobile, useIsLandscape } from '@/hooks/use-mobile';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import {
  Plus,
  Edit,
  Pencil,
  Trash2,
  X,
  Calendar,
  User,
  Tag,
  Clock,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Loader2,
  Mail,
  Users,
  MessageSquare,
  Send,
  Reply,
  Hash,
  Search,
  Smile,
  Pin,
  MoreVertical,
  Building2,
  ArrowLeft,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  getSummitTasks,
  createSummitTask,
  updateSummitTask,
  deleteSummitTask,
  getSummitMembers,
  SummitTask,
  SummitMember,
} from '@/data/summit';
import { getCurrentUser } from '@/lib/auth';
import { format, isPast, isToday, isTomorrow } from 'date-fns';
import { Link } from 'react-router-dom';
import { UserAvatar } from '@/components/UserAvatar';
import {
  getChannels,
  getMessages,
  createMessage,
  getMessageReactions,
  toggleReaction,
  getThreadReplies,
  createThreadReply,
  createChannel,
  type Channel as ChannelType,
  type Message as MessageType,
} from '@/data/discussions';
import { sanitizeText } from '@/lib/security';
import {
  getWorkshopSubmissions,
  getSponsorSubmissions,
  updateWorkshopSubmissionStatus,
  updateSponsorSubmissionStatus,
  deleteWorkshopSubmission,
  deleteSponsorSubmission,
  type WorkshopSubmission,
  type SponsorSubmission,
} from '@/data/summit2026';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  useDroppable,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const STATUSES: Array<{ value: SummitTask['status']; label: string; color: string }> = [
  { value: 'todo', label: 'To Do', color: 'bg-gray-100 text-gray-800' },
  { value: 'in_progress', label: 'In Progress', color: 'bg-blue-100 text-blue-800' },
  { value: 'review', label: 'Review', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'done', label: 'Done', color: 'bg-green-100 text-green-800' },
];

const PRIORITIES: Array<{ value: SummitTask['priority']; label: string; color: string }> = [
  { value: 'low', label: 'Low', color: 'bg-gray-100 text-gray-700' },
  { value: 'medium', label: 'Medium', color: 'bg-blue-100 text-blue-700' },
  { value: 'high', label: 'High', color: 'bg-orange-100 text-orange-700' },
  { value: 'urgent', label: 'Urgent', color: 'bg-red-100 text-red-700' },
];

function DroppableColumn({ id, children }: { id: string; children: React.ReactNode }) {
  const { setNodeRef, isOver } = useDroppable({
    id,
  });

  return (
    <div
      ref={setNodeRef}
      className={isOver ? 'min-h-[200px] bg-blue-50 dark:bg-blue-900/20 rounded' : 'min-h-[200px]'}
    >
      {children}
    </div>
  );
}

function SortableTaskCard({ task, onEdit, onDelete }: { task: SummitTask; onEdit: () => void; onDelete: () => void }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const priority = PRIORITIES.find(p => p.value === task.priority) || PRIORITIES[1];
  const dueDate = task.dueDate ? new Date(task.dueDate) : null;
  const isOverdue = dueDate && isPast(dueDate) && task.status !== 'done';
  const isDueSoon = dueDate && (isToday(dueDate) || isTomorrow(dueDate)) && task.status !== 'done';

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-white dark:bg-[hsl(217,40%,18%)] border border-gray-200 dark:border-[hsl(217,35%,25%)] rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow relative overflow-visible"
    >
      {/* Edit button - left corner overlay */}
      <Button
        variant="ghost"
        size="sm"
        className="absolute left-0 -top-[10px] h-7 w-7 p-0 rounded-full bg-blue-500 hover:bg-blue-600 text-white z-20 shadow-md"
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
          onEdit();
        }}
        onPointerDown={(e) => {
          e.stopPropagation();
        }}
      >
        <Pencil className="h-3.5 w-3.5" />
      </Button>

      {/* Delete button - right corner overlay */}
      <Button
        variant="ghost"
        size="sm"
        className="absolute right-0 -top-[10px] h-7 w-7 p-0 rounded-full bg-red-500 hover:bg-red-600 text-white z-20 shadow-md"
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
          onDelete();
        }}
        onPointerDown={(e) => {
          e.stopPropagation();
        }}
      >
        <X className="h-3.5 w-3.5" />
      </Button>

      {/* Draggable area - excludes buttons */}
      <div
        {...attributes}
        {...listeners}
        className="cursor-move"
      >

        <div className="flex items-start justify-between mb-2">
          <h4 className="font-semibold text-gray-900 dark:text-white text-sm flex-1">{task.title}</h4>
        </div>
        
        {task.description && (
          <p className="text-xs text-gray-600 dark:text-white mb-2 line-clamp-2">{task.description}</p>
        )}

        <div className="flex items-center gap-2 mb-2">
          <Badge className={`${priority.color} text-xs`}>{priority.label}</Badge>
          {isOverdue && (
            <Badge className="bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 text-xs flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              Overdue
            </Badge>
          )}
          {isDueSoon && !isOverdue && (
            <Badge className="bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-200 text-xs flex items-center gap-1">
              <Clock className="h-3 w-3" />
              Due Soon
            </Badge>
          )}
        </div>

        <div className="space-y-1 text-xs text-gray-600 dark:text-white">
          <div className="flex items-center gap-1">
            <User className="h-3 w-3 dark:text-white" />
            <span>{task.ownerName}</span>
          </div>
          {dueDate && (
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3 dark:text-white" />
              <span>{format(dueDate, 'MMM d, yyyy')}</span>
            </div>
          )}
          {task.tags.length > 0 && (
            <div className="flex items-center gap-1 flex-wrap">
              <Tag className="h-3 w-3 dark:text-white" />
              {task.tags.map((tag, idx) => (
                <span key={idx} className="bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded text-xs dark:text-white">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function SummitPlanning() {
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const isLandscape = useIsLandscape();
  const [tasks, setTasks] = useState<SummitTask[]>([]);
  const [summitMembers, setSummitMembers] = useState<SummitMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<SummitTask | null>(null);
  const [taskToDelete, setTaskToDelete] = useState<string | null>(null);
  const [hasTableError, setHasTableError] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Discussions state - full board
  const [channels, setChannels] = useState<ChannelType[]>([]);
  const [selectedChannel, setSelectedChannel] = useState<string | null>(null);
  const [mobileView, setMobileView] = useState<'channels' | 'messages'>('channels');
  const [isLoadingChannels, setIsLoadingChannels] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [isSendingReply, setIsSendingReply] = useState(false);
  const [isCreatingChannel, setIsCreatingChannel] = useState(false);
  const [messageInput, setMessageInput] = useState('');
  const [channelSearchQuery, setChannelSearchQuery] = useState('');
  const [messageSearchQuery, setMessageSearchQuery] = useState('');
  const [messages, setMessages] = useState<Record<string, MessageType[]>>({});
  const [threadReplies, setThreadReplies] = useState<Record<string, any[]>>({});
  const [expandedThreads, setExpandedThreads] = useState<Set<string>>(new Set());
  const [threadInputs, setThreadInputs] = useState<Record<string, string>>({});
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null);
  const [showNewChannelDialog, setShowNewChannelDialog] = useState(false);
  const [newChannelName, setNewChannelName] = useState('');
  const [newChannelDescription, setNewChannelDescription] = useState('');
  const [showReactionPicker, setShowReactionPicker] = useState<string | null>(null);
  
  // Swipe gesture state
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const swipeThreshold = 50;
  
  // Submission review state
  const [workshopSubmissions, setWorkshopSubmissions] = useState<WorkshopSubmission[]>([]);
  const [sponsorSubmissions, setSponsorSubmissions] = useState<SponsorSubmission[]>([]);
  const [isLoadingSubmissions, setIsLoadingSubmissions] = useState(false);
  const [selectedWorkshop, setSelectedWorkshop] = useState<WorkshopSubmission | null>(null);
  const [selectedSponsor, setSelectedSponsor] = useState<SponsorSubmission | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [workshopToDelete, setWorkshopToDelete] = useState<string | null>(null);
  const [sponsorToDelete, setSponsorToDelete] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'todo' as SummitTask['status'],
    ownerEmail: '',
    ownerName: '',
    dueDate: '',
    priority: 'medium' as SummitTask['priority'],
    tags: '',
  });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      if (!cancelled) {
        await loadData();
        await loadSummitChannels();
      }
    };
    load();
    
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (selectedChannel) {
      let cancelled = false;
      const loadMessages = async () => {
        if (!cancelled) {
          await loadChannelMessages();
        }
      };
      loadMessages();
      
      return () => {
        cancelled = true;
      };
    }
  }, [selectedChannel]);

  const loadData = async () => {
    setIsLoading(true);
    setHasTableError(false);
    try {
      const [tasksData, membersData, workshopsData, sponsorsData] = await Promise.all([
        getSummitTasks(),
        getSummitMembers(),
        getWorkshopSubmissions(),
        getSponsorSubmissions(),
      ]);
      setTasks(tasksData);
      setSummitMembers(membersData);
      setWorkshopSubmissions(workshopsData);
      setSponsorSubmissions(sponsorsData);
    } catch (error: any) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error loading summit data:', error);
      }
      const errorMessage = error?.message || 'Failed to load summit planning data.';
      
      // Check if it's a table not found error
      if (errorMessage.includes('Summit tables not found') || errorMessage.includes('relation') || errorMessage.includes('does not exist')) {
        setHasTableError(true);
      }
      
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
      // Set empty arrays so the page can still render
      setTasks([]);
      setSummitMembers([]);
      setWorkshopSubmissions([]);
      setSponsorSubmissions([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) return;

    const activeTask = tasks.find(t => t.id === active.id);
    if (!activeTask) return;

    // Check if dropping on another task
    const overTask = tasks.find(t => t.id === over.id);
    
    if (overTask) {
      // Dropping on another task
      if (active.id === over.id) return;

      const newStatus = overTask.status;
      
      if (activeTask.status === newStatus) {
        // Reordering within the same column
        const oldIndex = tasks.findIndex(t => t.id === active.id);
        const newIndex = tasks.findIndex(t => t.id === over.id);
        const newTasks = arrayMove(tasks, oldIndex, newIndex);
        setTasks(newTasks);
      } else {
        // Moving to a different column
        try {
          await updateSummitTask(activeTask.id, { status: newStatus });
          setTasks(tasks.map(t => t.id === activeTask.id ? { ...t, status: newStatus } : t));
          toast({
            title: 'Task Updated',
            description: `Task moved to ${STATUSES.find(s => s.value === newStatus)?.label}`,
          });
        } catch (error) {
          if (process.env.NODE_ENV === 'development') {
            console.error('Error updating task:', error);
          }
          toast({
            title: 'Error',
            description: 'Failed to update task status.',
            variant: 'destructive',
          });
        }
      }
    } else {
      // Dropping into an empty column - check if over.id is a status value
      const newStatus = STATUSES.find(s => s.value === over.id)?.value;
      if (newStatus && activeTask.status !== newStatus) {
        try {
          await updateSummitTask(activeTask.id, { status: newStatus });
          setTasks(tasks.map(t => t.id === activeTask.id ? { ...t, status: newStatus } : t));
          toast({
            title: 'Task Updated',
            description: `Task moved to ${STATUSES.find(s => s.value === newStatus)?.label}`,
          });
        } catch (error) {
          if (process.env.NODE_ENV === 'development') {
            console.error('Error updating task:', error);
          }
          toast({
            title: 'Error',
            description: 'Failed to update task status.',
            variant: 'destructive',
          });
        }
      }
    }
  };

  const handleOpenDialog = (task?: SummitTask) => {
    if (task) {
      setEditingTask(task);
      setFormData({
        title: task.title,
        description: task.description || '',
        status: task.status,
        ownerEmail: task.ownerEmail,
        ownerName: task.ownerName,
        dueDate: task.dueDate ? format(new Date(task.dueDate), 'yyyy-MM-dd') : '',
        priority: task.priority,
        tags: task.tags.join(', '),
      });
    } else {
      const user = getCurrentUser();
      setEditingTask(null);
      setFormData({
        title: '',
        description: '',
        status: 'todo',
        ownerEmail: user?.email || '',
        ownerName: user?.name || '',
        dueDate: '',
        priority: 'medium',
        tags: '',
      });
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingTask(null);
    setFormData({
      title: '',
      description: '',
      status: 'todo',
      ownerEmail: '',
      ownerName: '',
      dueDate: '',
      priority: 'medium',
      tags: '',
    });
  };

  const handleSubmit = async () => {
    if (!formData.title.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Task title is required.',
        variant: 'destructive',
      });
      return;
    }

    if (!formData.ownerEmail) {
      toast({
        title: 'Validation Error',
        description: 'Task owner is required.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const taskData = {
        title: formData.title.trim(),
        description: formData.description.trim() || undefined,
        status: formData.status,
        ownerEmail: formData.ownerEmail,
        ownerName: formData.ownerName,
        dueDate: formData.dueDate ? new Date(formData.dueDate) : undefined,
        priority: formData.priority,
        tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
      };

      if (editingTask) {
        await updateSummitTask(editingTask.id, taskData);
        toast({
          title: 'Task Updated',
          description: 'Task has been updated successfully.',
        });
      } else {
        await createSummitTask(taskData);
        toast({
          title: 'Task Created',
          description: 'New task has been created successfully.',
        });
      }

      handleCloseDialog();
      loadData();
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error saving task:', error);
      }
      toast({
        title: 'Error',
        description: 'Failed to save task.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!taskToDelete) return;

    try {
      await deleteSummitTask(taskToDelete);
      toast({
        title: 'Task Deleted',
        description: 'Task has been deleted successfully.',
      });
      setTaskToDelete(null);
      loadData();
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error deleting task:', error);
      }
      toast({
        title: 'Error',
        description: 'Failed to delete task.',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteWorkshop = async () => {
    if (!workshopToDelete) return;

    try {
      await deleteWorkshopSubmission(workshopToDelete);
      toast({
        title: 'Submission Deleted',
        description: 'Workshop submission has been deleted successfully.',
      });
      setWorkshopToDelete(null);
      loadData();
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error deleting workshop submission:', error);
      }
      toast({
        title: 'Error',
        description: 'Failed to delete workshop submission.',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteSponsor = async () => {
    if (!sponsorToDelete) return;

    try {
      await deleteSponsorSubmission(sponsorToDelete);
      toast({
        title: 'Submission Deleted',
        description: 'Sponsor submission has been deleted successfully.',
      });
      setSponsorToDelete(null);
      loadData();
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error deleting sponsor submission:', error);
      }
      toast({
        title: 'Error',
        description: 'Failed to delete sponsor submission.',
        variant: 'destructive',
      });
    }
  };

  // Load summit channels (filtered to only show channels starting with "summit-")
  const loadSummitChannels = async () => {
    setIsLoadingChannels(true);
    try {
      const allChannels = await getChannels();
      // Filter to only show summit-related channels (case-insensitive)
      const summitChannels = allChannels.filter(c => c.name.toLowerCase().startsWith('summit-'));
      
      // Create default channel if none exist
      if (summitChannels.length === 0) {
        const user = getCurrentUser();
        if (user) {
          try {
            const defaultChannel = await createChannel(
              'summit-planning',
              'Private discussions for Summit Planning Committee members',
              user.email || user.id || 'system'
            );
            setChannels([defaultChannel]);
            setSelectedChannel(defaultChannel.id);
            return;
          } catch (createError: any) {
            if (process.env.NODE_ENV === 'development') {
              console.error('Error creating default channel:', createError);
            }
            const errorMessage = createError?.message || 'Failed to create channel';
            if (errorMessage.includes('not found') || errorMessage.includes('does not exist')) {
              toast({
                title: 'Discussions Setup Required',
                description: 'Discussions tables not found. Please run DISCUSSIONS_SCHEMA.sql in Supabase SQL Editor.',
                variant: 'destructive',
              });
            }
          }
        }
      } else {
        setChannels(summitChannels);
        // Select first channel if none selected (only on desktop or landscape mobile)
        if (!selectedChannel && summitChannels.length > 0 && (!isMobile || isLandscape)) {
          setSelectedChannel(summitChannels[0].id);
        }
      }
    } catch (error: any) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error loading summit channels:', error);
      }
      const errorMessage = error?.message || 'Failed to load channels.';
      const isSchemaError = errorMessage.includes('not found') || errorMessage.includes('does not exist') || errorMessage.includes('DISCUSSIONS_SCHEMA');
      
      toast({
        title: 'Error Loading Discussions',
        description: isSchemaError 
          ? 'Discussions tables not found. Please run DISCUSSIONS_SCHEMA.sql in Supabase SQL Editor first.'
          : errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsLoadingChannels(false);
    }
  };

  // Load messages for selected channel
  const loadChannelMessages = async () => {
    if (!selectedChannel) return;
    
    setIsLoadingMessages(true);
    try {
      const messagesData = await getMessages(selectedChannel);
      
      // Load reactions for each message
      const messagesWithReactions = await Promise.all(
        messagesData.map(async (msg) => {
          const reactions = await getMessageReactions(msg.id);
          return {
            ...msg,
            reactions: reactions.length > 0 ? reactions : undefined,
          };
        })
      );

      setMessages(prev => ({
        ...prev,
        [selectedChannel]: messagesWithReactions,
      }));
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error loading messages:', error);
      }
      toast({
        title: 'Error',
        description: 'Failed to load messages.',
        variant: 'destructive',
      });
    } finally {
      setIsLoadingMessages(false);
    }
  };

  // Create new channel
  const handleCreateChannel = async () => {
    if (!newChannelName.trim()) return;

    setIsCreatingChannel(true);
    try {
      const user = getCurrentUser();
      if (!user) {
        toast({
          title: 'Error',
          description: 'You must be logged in to create channels.',
          variant: 'destructive',
        });
        return;
      }

      // Ensure channel name starts with "summit-"
      const channelName = newChannelName.trim().toLowerCase().startsWith('summit-') 
        ? newChannelName.trim().toLowerCase()
        : `summit-${newChannelName.trim().toLowerCase()}`;

      const newChannel = await createChannel(
        channelName,
        newChannelDescription.trim() || '',
        user.email || user.id || 'system'
      );

      setChannels(prev => [...prev, newChannel]);
      setSelectedChannel(newChannel.id);
      setNewChannelName('');
      setNewChannelDescription('');
      setShowNewChannelDialog(false);
      
      toast({
        title: 'Channel Created',
        description: `Channel "${newChannel.name}" has been created.`,
      });
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error creating channel:', error);
      }
      toast({
        title: 'Error',
        description: 'Failed to create channel.',
        variant: 'destructive',
      });
    } finally {
      setIsCreatingChannel(false);
    }
  };

  // Send a message
  const handleSendMessage = async () => {
    if (!messageInput.trim() || !selectedChannel) return;

    setIsSendingMessage(true);
    try {
      const user = getCurrentUser();
      if (!user) {
        toast({
          title: 'Error',
          description: 'You must be logged in to send messages.',
          variant: 'destructive',
        });
        return;
      }

      const newMessage = await createMessage(
        selectedChannel,
        sanitizeText(messageInput),
        user.name || user.email || 'Unknown',
        user.email || ''
      );

      // Add to local state immediately
      setMessages(prev => ({
        ...prev,
        [selectedChannel]: [...(prev[selectedChannel] || []), newMessage],
      }));

      setMessageInput('');
      // Reload to get reactions
      await       loadChannelMessages();
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error sending message:', error);
      }
      toast({
        title: 'Error',
        description: 'Failed to send message.',
        variant: 'destructive',
      });
    } finally {
      setIsSendingMessage(false);
    }
  };

  // Toggle thread expansion and load replies
  const toggleThread = async (messageId: string) => {
    const isExpanded = expandedThreads.has(messageId);
    
    if (!isExpanded && !threadReplies[messageId]) {
      // Load thread replies when expanding
      try {
        const replies = await getThreadReplies(messageId);
        setThreadReplies(prev => ({ ...prev, [messageId]: replies }));
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          console.error('Error loading thread replies:', error);
        }
      }
    }
    
    setExpandedThreads(prev => {
      const newSet = new Set(prev);
      if (newSet.has(messageId)) {
        newSet.delete(messageId);
      } else {
        newSet.add(messageId);
      }
      return newSet;
    });
  };

  // Send thread reply
  const handleSendReply = async (messageId: string) => {
    const replyText = threadInputs[messageId];
    if (!replyText?.trim()) return;

    setIsSendingReply(true);
    try {
      const user = getCurrentUser();
      if (!user) {
        toast({
          title: 'Error',
          description: 'You must be logged in to reply.',
          variant: 'destructive',
        });
        return;
      }

      await createThreadReply(
        messageId,
        sanitizeText(replyText),
        user.name || user.email || 'Unknown',
        user.email || ''
      );

      setThreadInputs(prev => ({ ...prev, [messageId]: '' }));
      // Reload thread replies for this message
      const replies = await getThreadReplies(messageId);
      setThreadReplies(prev => ({ ...prev, [messageId]: replies }));
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error sending reply:', error);
      }
      toast({
        title: 'Error',
        description: 'Failed to send reply.',
        variant: 'destructive',
      });
    } finally {
      setIsSendingReply(false);
    }
  };

  // Filter channels by search
  const filteredChannels = channels.filter(ch => 
    !channelSearchQuery || ch.name.toLowerCase().includes(channelSearchQuery.toLowerCase())
  );

  // Get current channel messages
  const currentMessages = selectedChannel ? (messages[selectedChannel] || []) : [];

  // Filter messages by search
  const filteredMessages = currentMessages.filter(msg => 
    !messageSearchQuery || 
    msg.content.toLowerCase().includes(messageSearchQuery.toLowerCase()) ||
    msg.author.toLowerCase().includes(messageSearchQuery.toLowerCase())
  );

  // Format timestamp
  const formatTimestamp = (date: Date): string => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return format(date, 'MMM d, yyyy');
  };

  // Handle channel selection - switch to messages view on mobile
  const handleChannelSelect = (channelId: string) => {
    setSelectedChannel(channelId);
    setMessageSearchQuery('');
    if (isMobile) {
      setMobileView('messages');
    }
  };

  // Handle back to channels
  const handleBackToChannels = () => {
    setMobileView('channels');
  };

  // Swipe gesture handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    // Prevent default scrolling during horizontal swipe
    if (touchStartX.current === null || touchStartY.current === null) return;
    
    const deltaX = e.touches[0].clientX - touchStartX.current;
    const deltaY = e.touches[0].clientY - touchStartY.current;
    
    // Only prevent default if horizontal swipe is dominant
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 10) {
      e.preventDefault();
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null || touchStartY.current === null) return;
    
    const deltaX = e.changedTouches[0].clientX - touchStartX.current;
    const deltaY = e.changedTouches[0].clientY - touchStartY.current;
    
    // Check if it's a horizontal swipe (not vertical scroll)
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > swipeThreshold) {
      if (deltaX > 0 && mobileView === 'messages') {
        // Swipe right - go back to channels
        handleBackToChannels();
      } else if (deltaX < 0 && mobileView === 'channels' && selectedChannel) {
        // Swipe left - go to messages
        setMobileView('messages');
      }
    }
    
    touchStartX.current = null;
    touchStartY.current = null;
  };

  const tasksByStatus = STATUSES.map(status => ({
    ...status,
    tasks: tasks.filter(t => t.status === status.value),
  }));

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-electric-blue" />
      </div>
    );
  }

  // Show helpful message if tables don't exist
  if (hasTableError && !isLoading) {
    return (
      <div className="space-y-6">
        <Card className="glass-card">
          <CardContent className="pt-1 pb-4">
            <h1 className="text-4xl font-bold text-gray-900 text-center whitespace-nowrap">Summit Planning</h1>
          </CardContent>
        </Card>
        <Card className="bg-yellow-50 border-yellow-200">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <AlertCircle className="h-6 w-6 text-yellow-600 mt-0.5" />
              <div>
                <h3 className="font-semibold text-yellow-900 mb-2">Database Setup Required</h3>
                <p className="text-sm text-yellow-800 mb-4">
                  The Summit Planning tables have not been created yet. Please run the <code className="bg-yellow-100 px-2 py-1 rounded text-xs">SUMMIT_SCHEMA.sql</code> script in your Supabase SQL Editor to set up the database tables.
                </p>
                <p className="text-xs text-yellow-700">
                  Once the tables are created, refresh this page to start managing summit tasks.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-0 md:space-y-6 w-full" style={isMobile ? { maxWidth: '100vw', width: '100%', boxSizing: 'border-box', overflowX: 'hidden' } : {}}>
      <PageTitle 
        title="Summit Planning"
        fullWidthLandscape={true}
        titleClassName="whitespace-nowrap"
        rightContent={
          <Button 
            onClick={() => handleOpenDialog()} 
            className={`bg-electric-blue hover:bg-blue-600 text-xs md:text-sm gap-0 ${isMobile && !isLandscape ? 'h-8 w-8 p-0' : ''}`}
            style={isMobile && !isLandscape ? { marginRight: '-16px', position: 'relative', right: '-8px' } : {}}
          >
            <Plus className={`${isMobile && !isLandscape ? 'h-4 w-4' : 'h-3 w-3 md:h-4 md:w-4'}`} />
            {!(isMobile && !isLandscape) && <span>Task</span>}
          </Button>
        }
      />

      {/* Summit Committee Members */}
      <Card className="glass-card floating-hover">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-electric-blue" />
            Summit Committee Members ({summitMembers.length})
          </CardTitle>
          <CardDescription>
            All members of the Summit Planning Committee
          </CardDescription>
        </CardHeader>
        <CardContent>
          {summitMembers.length === 0 ? (
            <div className="text-center py-8 text-sm text-gray-500">
              No summit committee members yet. Add members from the Admin panel.
            </div>
          ) : (
            <div className={`grid ${isLandscape ? 'grid-cols-3' : 'grid-cols-1'} md:grid-cols-2 lg:grid-cols-3 gap-4`}>
              {summitMembers.map((member) => (
                <Link
                  key={member.email}
                  to={`/membership-portal/member/${encodeURIComponent(member.email)}`}
                  className="flex items-start gap-4 p-4 border border-electric-blue/20 rounded-lg bg-electric-blue/5 backdrop-blur-sm hover:bg-electric-blue/10 transition-all cursor-pointer"
                >
                  <div className="flex flex-col items-center gap-2 flex-shrink-0">
                    <UserAvatar
                      email={member.email}
                      name={member.name}
                      size="2xl"
                    />
                  </div>
                  <div className="flex-1 min-w-0 space-y-1">
                    <h4 className="font-medium text-sm text-gray-900 dark:text-white">{member.name}</h4>
                    <span 
                      className="text-sm text-electric-blue hover:underline flex items-center gap-1.5 cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        window.location.href = `mailto:${member.email}`;
                      }}
                    >
                      <Mail className="h-4 w-4" />
                      <span className="truncate">{member.email}</span>
                    </span>
                    {member.addedAt && (
                      <p className="text-xs text-gray-500 dark:text-white mt-1">
                        Added {format(new Date(member.addedAt), 'MMM d, yyyy')}
                      </p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <div className={`${isLandscape ? 'overflow-x-visible' : 'overflow-x-auto'} md:overflow-visible`}>
          <div className={`grid ${isLandscape ? 'grid-cols-4' : 'grid-cols-4'} gap-4 ${isLandscape ? 'min-w-0' : 'min-w-[800px]'} md:min-w-0 md:grid-cols-2 lg:grid-cols-4`}>
            {tasksByStatus.map(({ value, label, color, tasks: statusTasks }) => (
              <Card key={value} className={`bg-gray-50 dark:bg-gray-800 flex-shrink-0 ${isLandscape ? 'w-auto' : 'w-[200px]'} md:w-auto`}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-semibold flex items-center gap-2">
                      <Badge className={color}>{label}</Badge>
                      <span className="text-gray-600 dark:text-white">({statusTasks.length})</span>
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <DroppableColumn id={value}>
                    <SortableContext
                      items={statusTasks.map(t => t.id)}
                      strategy={verticalListSortingStrategy}
                    >
                      <div className="space-y-3 min-h-[200px]">
                        {statusTasks.length === 0 ? (
                          <div className="text-center py-8 text-sm text-gray-500 dark:text-white">
                            No tasks
                          </div>
                        ) : (
                          statusTasks.map(task => (
                            <SortableTaskCard
                              key={task.id}
                              task={task}
                              onEdit={() => handleOpenDialog(task)}
                              onDelete={() => setTaskToDelete(task.id)}
                            />
                          ))
                        )}
                      </div>
                    </SortableContext>
                  </DroppableColumn>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </DndContext>

      {/* Summit Planning Discussions - Full Board */}
      <Card className="glass-card floating-hover overflow-hidden w-full" style={isMobile ? { maxWidth: '100vw', width: '100%', boxSizing: 'border-box' } : {}}>
        <CardHeader className="p-3 md:p-6 w-full overflow-visible">
          <CardTitle className="text-base md:text-lg flex flex-wrap items-center gap-2 break-words overflow-visible w-full">
            <MessageSquare className="h-5 w-5 text-electric-blue flex-shrink-0" />
            <span className="break-words overflow-visible min-w-0 flex-1">Committee Discussions</span>
          </CardTitle>
          <CardDescription className="text-xs md:text-sm break-words overflow-visible whitespace-normal w-full min-w-0 line-clamp-2 md:line-clamp-none">
            Private discussions for Summit Planning Committee members
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0 overflow-hidden w-full" style={isMobile ? { maxWidth: '100%', width: '100%', boxSizing: 'border-box', padding: 0, overflowX: 'hidden' } : {}}>
          <div className={`flex ${isLandscape ? 'h-[calc(100dvh-20rem)]' : 'h-[600px]'} md:h-[600px] gap-4 relative overflow-hidden w-full`} style={isMobile ? { maxWidth: '100%', width: '100%', boxSizing: 'border-box', overflowX: 'hidden' } : {}}>
            {/* Channels Sidebar - Side-by-side in landscape, overlay in portrait mobile */}
            {(() => {
              const isPortraitMobile = isMobile && !isLandscape;
              const showSideBySide = isLandscape || !isMobile;
              return (
            <div className={`${isPortraitMobile ? 'absolute left-0 top-0 bottom-0 right-0 z-10 bg-white' : showSideBySide ? 'block' : 'hidden'} ${isLandscape ? 'w-1/3' : showSideBySide ? 'w-full md:w-64' : 'w-full'} flex-shrink-0 border-r border-gray-200 transition-transform duration-300 ease-in-out flex flex-col ${
              isPortraitMobile && mobileView === 'messages' ? '-translate-x-full' : 'translate-x-0'
            }`}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            >
              <div className="p-3 border-b border-electric-blue/20 bg-white dark:bg-electric-blue">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Channels</h2>
                  <Dialog open={showNewChannelDialog} onOpenChange={setShowNewChannelDialog}>
                    <DialogTrigger asChild>
                      <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-white border-gray-200">
                      <DialogHeader>
                        <DialogTitle className="text-gray-900">Create New Channel</DialogTitle>
                        <DialogDescription className="text-gray-600">Create a new channel for discussions</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <Input
                          id="new-channel-name"
                          name="new-channel-name"
                          placeholder="Channel name (e.g., logistics)"
                          value={newChannelName}
                          onChange={(e) => setNewChannelName(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && !isCreatingChannel && handleCreateChannel()}
                          className="bg-white text-gray-900 border-gray-300"
                          disabled={isCreatingChannel}
                        />
                        <Input
                          id="new-channel-description"
                          name="new-channel-description"
                          placeholder="Description (optional)"
                          value={newChannelDescription}
                          onChange={(e) => setNewChannelDescription(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && !isCreatingChannel && handleCreateChannel()}
                          className="bg-white text-gray-900 border-gray-300"
                          disabled={isCreatingChannel}
                        />
                        <div className="flex justify-end gap-2">
                          <Button 
                            variant="outline" 
                            onClick={() => setShowNewChannelDialog(false)}
                            className="border-gray-300 text-gray-700 hover:bg-gray-50"
                          >
                            Cancel
                          </Button>
                          <Button 
                            onClick={handleCreateChannel} 
                            disabled={!newChannelName.trim() || isCreatingChannel}
                            className="bg-electric-blue hover:bg-blue-600 text-white"
                          >
                            {isCreatingChannel ? (
                              <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Creating...
                              </>
                            ) : (
                              'Create'
                            )}
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
                <div className="relative">
                  <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-gray-400" />
                  <Input
                    id="channel-search"
                    name="channel-search"
                    placeholder="Search channels..."
                    className="pl-7 h-8 text-xs"
                    value={channelSearchQuery}
                    onChange={(e) => setChannelSearchQuery(e.target.value)}
                  />
                </div>
              </div>
              <div className={`overflow-y-auto flex-1 min-h-0 ${isLandscape ? 'h-[calc(100dvh-25rem)]' : 'h-[calc(600px-5rem)]'}`}>
                {isLoadingChannels ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-electric-blue" />
                  </div>
                ) : filteredChannels.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 dark:text-white text-sm">
                    {channelSearchQuery ? 'No channels found' : 'No channels yet'}
                    {process.env.NODE_ENV === 'development' && (
                      <div className="text-xs mt-2">Total channels: {channels.length}, Filtered: {filteredChannels.length}</div>
                    )}
                  </div>
                ) : (
                  filteredChannels.map((channel) => (
                    <button
                      key={channel.id}
                      onClick={() => handleChannelSelect(channel.id)}
                      className={`w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-electric-blue/10 transition-colors ${
                        selectedChannel === channel.id ? 'bg-electric-blue/20 border-l-2 border-electric-blue' : ''
                      }`}
                    >
                      <Hash className="h-4 w-4 text-gray-500 dark:text-white" />
                      <span className="flex-1 text-left text-gray-700 dark:text-white">{channel.name.toLowerCase().replace('summit-', '')}</span>
                    </button>
                  ))
                )}
              </div>
            </div>
            );
            })()}
            {/* Messages Area */}
            {(() => {
              const isPortraitMobile = isMobile && !isLandscape;
              const showSideBySide = isLandscape || !isMobile;
              return (
            <div className={`${isPortraitMobile ? 'absolute left-0 top-0 bottom-0 right-0 z-20 bg-white' : isLandscape ? 'w-2/3' : 'flex-1'} flex flex-col transition-transform duration-300 ease-in-out ${
              isPortraitMobile && mobileView === 'channels' ? 'translate-x-full' : 'translate-x-0'
            }`}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            style={isMobile ? { width: '100%', maxWidth: '100%', boxSizing: 'border-box' } : {}}
            >
              {/* Channel Header */}
              <div className={`p-2 md:p-3 border-b border-electric-blue/20 flex flex-col md:flex-row ${isLandscape ? 'md:items-start' : 'md:items-center'} md:justify-between gap-2 relative`} style={isMobile ? { width: '100%', maxWidth: '100%', boxSizing: 'border-box', overflowX: 'hidden' } : {}}>
                <div className={`flex-1 min-w-0 ${isLandscape ? 'pr-24' : ''}`}>
                  <div className="flex items-center gap-2">
                    {isPortraitMobile && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleBackToChannels}
                        className="h-8 w-8 p-0 flex-shrink-0"
                      >
                        <ArrowLeft className="h-4 w-4" />
                      </Button>
                    )}
                    <Hash className="h-5 w-5 text-gray-500 dark:text-white flex-shrink-0" />
                    <h2 className={`font-semibold text-gray-900 dark:text-white ${isLandscape ? 'truncate flex-1 min-w-0' : 'break-words min-w-0'}`}>
                      {channels.find(c => c.id === selectedChannel)?.name.replace('summit-', '') || selectedChannel || 'Select a channel'}
                    </h2>
                  </div>
                  {channels.find(c => c.id === selectedChannel)?.description && (
                    <p className={`text-xs text-gray-500 dark:text-white mt-1 ${isLandscape ? 'line-clamp-3 md:line-clamp-4' : 'hidden md:block'} break-words`}>
                      {channels.find(c => c.id === selectedChannel)?.description}
                    </p>
                  )}
                </div>
                <div className={`flex items-center gap-2 ${isLandscape ? 'absolute top-2 right-2' : ''}`} style={isMobile && !isLandscape ? { width: '100%', maxWidth: '100%', boxSizing: 'border-box' } : {}}>
                  <div className={`relative ${isLandscape ? 'w-24' : 'flex-1 md:flex-none'}`} style={isMobile && !isLandscape ? { width: '100%', maxWidth: '100%', boxSizing: 'border-box' } : {}}>
                    <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="message-search"
                      name="message-search"
                      placeholder="Search messages..."
                      className={`pl-8 h-8 ${isLandscape ? 'w-24' : 'w-full md:w-48'} text-xs`}
                      value={messageSearchQuery}
                      onChange={(e) => setMessageSearchQuery(e.target.value)}
                      style={isMobile && !isLandscape ? { width: '100%', maxWidth: '100%', boxSizing: 'border-box' } : {}}
                    />
                  </div>
                </div>
              </div>

              {/* Messages List */}
              <div className="flex-1 overflow-y-auto p-2 md:p-4 space-y-4 overflow-x-hidden">
                {!selectedChannel ? (
                  <div className="text-center py-12 text-gray-500 dark:text-white px-2 w-full overflow-visible">
                    <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50 dark:text-white" />
                    <p className="break-words w-full">Select a channel to start chatting</p>
                  </div>
                ) : isLoadingMessages ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-electric-blue" />
                  </div>
                ) : filteredMessages.length === 0 ? (
                  <div className="text-center py-12 text-gray-500 dark:text-white px-2 w-full overflow-visible">
                    <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50 dark:text-white" />
                    <p className="break-words w-full">No messages yet. Start the conversation!</p>
                  </div>
                ) : (
                  <>
                    {filteredMessages.map((message) => {
                      const isExpanded = expandedThreads.has(message.id);
                      return (
                        <div key={message.id} className="flex gap-2 md:gap-3 group hover:bg-electric-blue/5 rounded-lg p-2 -m-2 transition-colors">
                          <UserAvatar
                            email={message.authorEmail || ''}
                            name={message.author}
                            size="md"
                            className="flex-shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2 mb-1">
                              <span className="font-semibold text-sm text-gray-900 dark:text-white break-words">{message.author}</span>
                              <span className="text-xs text-gray-500 dark:text-white flex-shrink-0">{formatTimestamp(message.createdAt)}</span>
                              <div className="flex items-center gap-1 ml-auto opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                                <button
                                  onClick={() => toggleThread(message.id)}
                                  className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
                                  title="Reply in thread"
                                >
                                  <Reply className="h-3 w-3 text-gray-500 dark:text-white" />
                                </button>
                              </div>
                            </div>
                            <p className="text-sm text-gray-700 dark:text-white whitespace-pre-wrap break-words">{message.content}</p>
                            
                            {/* Thread Replies */}
                            {isExpanded && (
                              <div className="mt-3 ml-2 md:ml-6 border-l-2 border-gray-200 pl-2 md:pl-4 space-y-3">
                                {threadReplies[message.id]?.map((reply) => (
                                  <div key={reply.id} className="flex items-start gap-2 py-2">
                                    <UserAvatar
                                      email={reply.authorEmail || ''}
                                      name={reply.author}
                                      size="sm"
                                      className="flex-shrink-0"
                                    />
                                    <div className="flex-1 min-w-0">
                                      <div className="flex flex-wrap items-center gap-2 mb-1">
                                        <span className="font-medium text-xs text-gray-900 dark:text-white break-words">{reply.author}</span>
                                        <span className="text-xs text-gray-500 dark:text-white flex-shrink-0">
                                          {formatTimestamp(reply.createdAt)}
                                        </span>
                                      </div>
                                      <p className="text-xs text-gray-700 dark:text-white whitespace-pre-wrap break-words">{reply.content}</p>
                                    </div>
                                  </div>
                                ))}
                                
                                {/* Thread input */}
                                <div className="flex gap-2">
                                  <Input
                                    id={`thread-reply-${message.id}`}
                                    name={`thread-reply-${message.id}`}
                                    placeholder="Write a reply..."
                                    value={threadInputs[message.id] || ''}
                                    onChange={(e) => setThreadInputs(prev => ({ ...prev, [message.id]: e.target.value }))}
                                    onKeyPress={(e) => {
                                      if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        handleSendReply(message.id);
                                      }
                                    }}
                                    className="flex-1 text-sm h-8"
                                  />
                                  <Button
                                    size="sm"
                                    onClick={() => handleSendReply(message.id)}
                                    disabled={isSendingReply || !threadInputs[message.id]?.trim()}
                                    className="bg-electric-blue hover:bg-blue-600"
                                  >
                                    {isSendingReply ? (
                                      <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                      <Send className="h-4 w-4" />
                                    )}
                                  </Button>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </>
                )}
              </div>

              {/* Message Input */}
              {selectedChannel && (
                <div className="p-2 md:p-3 border-t border-electric-blue/20" style={isMobile ? { width: '100%', maxWidth: '100%', boxSizing: 'border-box', overflowX: 'hidden' } : {}}>
                  <div className="flex gap-2" style={isMobile ? { width: '100%', maxWidth: '100%', boxSizing: 'border-box' } : {}}>
                    <div className="relative flex-1" style={isMobile ? { minWidth: 0, maxWidth: '100%', boxSizing: 'border-box' } : {}}>
                      <Input
                        id="message-input"
                        name="message-input"
                        placeholder="Type your message..."
                        value={messageInput}
                        onChange={(e) => setMessageInput(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSendMessage();
                          }
                        }}
                        className="w-full"
                        style={isMobile ? { width: '100%', maxWidth: '100%', boxSizing: 'border-box' } : {}}
                      />
                    </div>
                    <Button
                      onClick={handleSendMessage}
                      disabled={isSendingMessage || !messageInput.trim()}
                      className="bg-electric-blue hover:bg-blue-600 flex-shrink-0"
                    >
                      {isSendingMessage ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4 mr-2" />
                          Send
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </div>
            );
            })()}
          </div>
        </CardContent>
      </Card>

      {/* Workshop/Panel Submissions Review */}
      <Card className="glass-card floating-hover overflow-visible w-full max-w-full">
        <CardHeader className="p-3 md:p-6 w-full overflow-visible max-w-full">
          <CardTitle className="text-xl md:text-2xl flex flex-wrap items-center gap-2 break-words overflow-visible w-full">
            <Users className="h-5 w-5 text-electric-blue flex-shrink-0" />
            <span className="break-words overflow-visible min-w-0 flex-1">Workshop/Panel Submissions ({workshopSubmissions.length})</span>
            {workshopSubmissions.filter(s => s.status === 'accepted').length > 0 && (
              <Badge className="ml-2 bg-green-100 text-green-800 flex-shrink-0">
                {workshopSubmissions.filter(s => s.status === 'accepted').length}/15 Accepted
              </Badge>
            )}
          </CardTitle>
          <CardDescription className="text-xs md:text-sm break-words overflow-visible whitespace-normal w-full min-w-0 line-clamp-2 md:line-clamp-none">
            Review and manage workshop/panel submissions (Up to 15 accepted)
          </CardDescription>
        </CardHeader>
        <CardContent className="p-3 md:p-6 overflow-visible w-full max-w-full">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-electric-blue" />
            </div>
          ) : workshopSubmissions.length === 0 ? (
            <div className="text-center py-8 text-xs md:text-sm text-gray-500 w-full overflow-visible px-2 max-w-full">
              <span className="inline-block w-full break-words min-w-0">No submissions yet.</span>
            </div>
          ) : (
            <div className="space-y-4">
              {workshopSubmissions.map((submission) => {
                const acceptedCount = workshopSubmissions.filter(s => s.status === 'accepted').length;
                return (
                  <Card key={submission.id} className="border border-gray-200">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-base break-words">{submission.title}</CardTitle>
                          <div className="flex flex-wrap items-center gap-2 mt-1">
                            <Badge variant={submission.submissionType === 'workshop' ? 'default' : 'secondary'}>
                              {submission.submissionType}
                            </Badge>
                            <Badge 
                              variant={
                                submission.status === 'accepted' ? 'default' :
                                submission.status === 'rejected' ? 'destructive' :
                                submission.status === 'under_review' ? 'secondary' : 'secondary'
                              }
                              className={
                                submission.status === 'pending' 
                                  ? 'bg-yellow-100 text-yellow-800 border-yellow-300 hover:bg-yellow-200' 
                                  : ''
                              }
                            >
                              {submission.status === 'pending' ? 'Pending' :
                               submission.status === 'under_review' ? 'Under Review' :
                               submission.status === 'accepted' ? 'Accepted' :
                               submission.status === 'rejected' ? 'Rejected' :
                               submission.status}
                            </Badge>
                          </div>
                        </div>
                        <div className="text-xs text-gray-500">
                          {format(submission.submittedAt, 'MMM d, yyyy')}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <p className="text-sm text-gray-700 line-clamp-2">{submission.description}</p>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="md:col-span-2">
                          <span className="font-medium">
                            {submission.submissionType === 'panel' ? 'Panel Members' : 'Presenters'}:
                          </span>
                          <div className="mt-1 space-y-1">
                            {submission.presenters && submission.presenters.length > 0 ? (
                              submission.presenters.map((presenter, idx) => (
                                <div key={idx} className="text-gray-700 pl-2 border-l-2 border-gray-200">
                                  <div>{presenter.name} ({presenter.email})</div>
                                  {presenter.organization && (
                                    <div className="text-xs text-gray-600">{presenter.organization}</div>
                                  )}
                                </div>
                              ))
                            ) : (
                              <div className="text-gray-700 pl-2">
                                {submission.presenterName} ({submission.presenterEmail})
                                {submission.presenterOrganization && (
                                  <div className="text-xs text-gray-600">{submission.presenterOrganization}</div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                        {submission.durationMinutes && (
                          <div>
                            <span className="font-medium">Duration:</span> {submission.durationMinutes} minutes
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2 pt-2 border-t">
                        {submission.status === 'pending' && (
                          <Button
                            size="sm"
                            onClick={() => {
                              setSelectedWorkshop(submission);
                              setReviewNotes('');
                            }}
                            className="bg-electric-blue hover:bg-blue-600"
                          >
                            Review
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => setWorkshopToDelete(submission.id)}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Sponsor Submissions Review */}
      <Card className="glass-card floating-hover overflow-visible w-full max-w-full">
        <CardHeader className="p-3 md:p-6 w-full overflow-visible max-w-full">
          <CardTitle className="text-xl md:text-2xl flex flex-wrap items-center gap-2 break-words overflow-visible w-full">
            <Building2 className="h-5 w-5 text-electric-blue flex-shrink-0" />
            <span className="break-words overflow-visible min-w-0 flex-1">Sponsor Submissions ({sponsorSubmissions.length})</span>
          </CardTitle>
          <CardDescription className="text-xs md:text-sm break-words overflow-visible whitespace-normal w-full min-w-0 line-clamp-2 md:line-clamp-none">
            Review and manage sponsorship inquiries
          </CardDescription>
        </CardHeader>
        <CardContent className="p-3 md:p-6 overflow-visible w-full max-w-full">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-electric-blue" />
            </div>
          ) : sponsorSubmissions.length === 0 ? (
            <div className="text-center py-8 text-xs md:text-sm text-gray-500 w-full overflow-visible px-2 max-w-full">
              <span className="inline-block w-full break-words min-w-0">No submissions yet.</span>
            </div>
          ) : (
            <div className="space-y-4">
              {sponsorSubmissions.map((submission) => (
                <Card key={submission.id} className="border border-gray-200">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-base">{submission.companyName}</CardTitle>
                        <div className="flex items-center gap-2 mt-1">
                          {submission.sponsorshipLevel && (
                            <Badge variant="default">
                              {submission.sponsorshipLevel}
                            </Badge>
                          )}
                          <Badge 
                            variant={
                              submission.status === 'accepted' ? 'default' :
                              submission.status === 'rejected' ? 'destructive' :
                              submission.status === 'under_review' ? 'secondary' : 'secondary'
                            }
                            className={
                              submission.status === 'pending' 
                                ? 'bg-yellow-100 text-yellow-800 border-yellow-300 hover:bg-yellow-200' 
                                : ''
                            }
                          >
                            {submission.status === 'pending' ? 'Pending' :
                             submission.status === 'under_review' ? 'Under Review' :
                             submission.status === 'accepted' ? 'Accepted' :
                             submission.status === 'rejected' ? 'Rejected' :
                             submission.status}
                          </Badge>
                          {submission.sponsorshipAmount && (
                            <Badge variant="outline">
                              ${submission.sponsorshipAmount.toLocaleString()}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="text-xs text-gray-500">
                        {format(submission.submittedAt, 'MMM d, yyyy')}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="font-medium">Contact:</span> {submission.contactName}
                      </div>
                      <div>
                        <span className="font-medium">Email:</span> {submission.contactEmail}
                      </div>
                      {submission.contactPhone && (
                        <div>
                          <span className="font-medium">Phone:</span> {submission.contactPhone}
                        </div>
                      )}
                      {submission.companyWebsite && (
                        <div>
                          <span className="font-medium">Website:</span>{' '}
                          <a href={submission.companyWebsite} target="_blank" rel="noopener noreferrer" className="text-electric-blue hover:underline">
                            {submission.companyWebsite}
                          </a>
                        </div>
                      )}
                    </div>
                    {submission.companyDescription && (
                      <div>
                        <p className="text-sm text-gray-700 line-clamp-2">{submission.companyDescription}</p>
                      </div>
                    )}
                    <div className="flex gap-2 pt-2 border-t">
                      {submission.status === 'pending' && (
                        <Button
                          size="sm"
                          onClick={() => {
                            setSelectedSponsor(submission);
                            setReviewNotes('');
                          }}
                          className="bg-electric-blue hover:bg-blue-600"
                        >
                          Review
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => setSponsorToDelete(submission.id)}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Task Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white border-gray-200">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-gray-900">
              {editingTask ? (
                <>
                  <Edit className="h-5 w-5 text-electric-blue" />
                  Edit Task
                </>
              ) : (
                <>
                  <Plus className="h-5 w-5 text-electric-blue" />
                  Create New Task
                </>
              )}
            </DialogTitle>
            <DialogDescription className="text-gray-600">
              {editingTask ? 'Update task details below.' : 'Fill in the task details below.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Enter task title"
              />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Enter task description"
                rows={4}
              />
            </div>
            <div className={`grid ${isLandscape ? 'grid-cols-3' : 'grid-cols-2'} gap-4`}>
              <div>
                <Label className="text-gray-900 font-medium">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData({ ...formData, status: value as SummitTask['status'] })}
                >
                  <SelectTrigger aria-label="Task status" className="mt-1 bg-white text-gray-900 border-gray-300">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-gray-200">
                    {STATUSES.map(status => (
                      <SelectItem key={status.value} value={status.value} className="text-gray-900">
                        {status.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-gray-900 font-medium">Priority</Label>
                <Select
                  value={formData.priority}
                  onValueChange={(value) => setFormData({ ...formData, priority: value as SummitTask['priority'] })}
                >
                  <SelectTrigger aria-label="Task priority" className="mt-1 bg-white text-gray-900 border-gray-300">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-gray-200">
                    {PRIORITIES.map(priority => (
                      <SelectItem key={priority.value} value={priority.value} className="text-gray-900">
                        {priority.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className={`grid ${isLandscape ? 'grid-cols-3' : 'grid-cols-2'} gap-4`}>
              <div>
                <Label className="text-gray-900 font-medium">Task Owner *</Label>
                <Select
                  value={formData.ownerEmail}
                  onValueChange={(value) => {
                    const member = summitMembers.find(m => m.email === value);
                    setFormData({
                      ...formData,
                      ownerEmail: value,
                      ownerName: member?.name || '',
                    });
                  }}
                  disabled={isSubmitting}
                >
                  <SelectTrigger aria-label="Task owner" className="mt-1 bg-white text-gray-900 border-gray-300">
                    <SelectValue placeholder="Select task owner" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-gray-200">
                    {summitMembers.map(member => (
                      <SelectItem key={member.email} value={member.email} className="text-gray-900">
                        {member.name} ({member.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="dueDate" className="text-gray-900 font-medium">Due Date</Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  className="mt-1 bg-white text-gray-900 border-gray-300"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="tags" className="text-gray-900 font-medium">Tags (comma-separated)</Label>
              <Input
                id="tags"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                placeholder="e.g., logistics, marketing, content"
                className="mt-1 bg-white text-gray-900 border-gray-300"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-gray-200">
            <Button 
              variant="outline" 
              onClick={handleCloseDialog}
              disabled={isSubmitting}
              className="border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="bg-electric-blue hover:bg-blue-600 text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {editingTask ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                editingTask ? 'Update Task' : 'Create Task'
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Workshop Review Dialog */}
      <Dialog open={!!selectedWorkshop} onOpenChange={() => setSelectedWorkshop(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-white border-gray-200">
          <DialogHeader>
            <DialogTitle className="text-gray-900">Review Workshop/Panel Submission</DialogTitle>
            <DialogDescription className="text-gray-600">Review the details of the workshop or panel submission</DialogDescription>
          </DialogHeader>
          {selectedWorkshop && (
            <div className="space-y-4 mt-4">
              <div>
                <Label className="text-gray-900 font-medium">Title</Label>
                <p className="text-gray-700">{selectedWorkshop.title}</p>
              </div>
              <div>
                <Label className="text-gray-900 font-medium">Description</Label>
                <p className="text-gray-700 whitespace-pre-wrap">{selectedWorkshop.description}</p>
              </div>
              <div>
                <Label className="text-gray-900 font-medium">
                  {selectedWorkshop.submissionType === 'panel' ? 'Panel Members' : 'Presenters'}
                </Label>
                <div className="mt-2 space-y-3">
                  {selectedWorkshop.presenters && selectedWorkshop.presenters.length > 0 ? (
                    selectedWorkshop.presenters.map((presenter, idx) => (
                      <div key={idx} className="border border-gray-200 rounded-lg p-3 bg-gray-50">
                        <div className="font-medium text-sm text-gray-900 mb-1">
                          {selectedWorkshop.submissionType === 'panel' ? 'Panel Member' : 'Presenter'} {idx + 1}
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="font-medium">Name:</span> {presenter.name}
                          </div>
                          <div>
                            <span className="font-medium">Email:</span> {presenter.email}
                          </div>
                          {presenter.organization && (
                            <div>
                              <span className="font-medium">Organization:</span> {presenter.organization}
                            </div>
                          )}
                          {presenter.bio && (
                            <div className="md:col-span-2">
                              <span className="font-medium">Bio:</span>
                              <p className="text-gray-700 whitespace-pre-wrap mt-1">{presenter.bio}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="border border-gray-200 rounded-lg p-3 bg-gray-50">
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="font-medium">Name:</span> {selectedWorkshop.presenterName || 'N/A'}
                        </div>
                        <div>
                          <span className="font-medium">Email:</span> {selectedWorkshop.presenterEmail || 'N/A'}
                        </div>
                        {selectedWorkshop.presenterOrganization && (
                          <div>
                            <span className="font-medium">Organization:</span> {selectedWorkshop.presenterOrganization}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div className={`grid ${isLandscape ? 'grid-cols-3' : 'grid-cols-2'} gap-4`}>
                {selectedWorkshop.durationMinutes && (
                  <div>
                    <Label className="text-gray-900 font-medium">Duration</Label>
                    <p className="text-gray-700">{selectedWorkshop.durationMinutes} minutes</p>
                  </div>
                )}
                {selectedWorkshop.maxParticipants && (
                  <div>
                    <Label className="text-gray-900 font-medium">Max Participants</Label>
                    <p className="text-gray-700">{selectedWorkshop.maxParticipants}</p>
                  </div>
                )}
              </div>
              {selectedWorkshop.learningObjectives && (
                <div>
                  <Label className="text-gray-900 font-medium">Learning Objectives</Label>
                  <p className="text-gray-700 whitespace-pre-wrap">{selectedWorkshop.learningObjectives}</p>
                </div>
              )}
              {selectedWorkshop.targetAudience && (
                <div>
                  <Label className="text-gray-900 font-medium">Target Audience</Label>
                  <p className="text-gray-700">{selectedWorkshop.targetAudience}</p>
                </div>
              )}
              {selectedWorkshop.technicalRequirements && (
                <div>
                  <Label className="text-gray-900 font-medium">Technical Requirements</Label>
                  <p className="text-gray-700 whitespace-pre-wrap">{selectedWorkshop.technicalRequirements}</p>
                </div>
              )}
              <div>
                <Label htmlFor="review-notes-workshop" className="text-gray-900 font-medium">Review Notes</Label>
                <Textarea
                  id="review-notes-workshop"
                  name="review-notes-workshop"
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  placeholder="Add review notes..."
                  rows={3}
                  className="mt-1 bg-white text-gray-900 border-gray-300"
                />
              </div>
              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedWorkshop(null);
                    setReviewNotes('');
                  }}
                  className="border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => handleUpdateWorkshopStatus(selectedWorkshop.id, 'rejected')}
                  disabled={isUpdatingStatus}
                  className="bg-red-600 hover:bg-red-700"
                >
                  Reject
                </Button>
                <Button
                  onClick={() => handleUpdateWorkshopStatus(selectedWorkshop.id, 'under_review')}
                  disabled={isUpdatingStatus}
                  className="bg-yellow-600 hover:bg-yellow-700"
                >
                  Under Review
                </Button>
                <Button
                  onClick={() => handleUpdateWorkshopStatus(selectedWorkshop.id, 'accepted')}
                  disabled={isUpdatingStatus || workshopSubmissions.filter(s => s.status === 'accepted').length >= 15}
                  className="bg-green-600 hover:bg-green-700"
                >
                  Accept
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Sponsor Review Dialog */}
      <Dialog open={!!selectedSponsor} onOpenChange={() => setSelectedSponsor(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-white border-gray-200">
          <DialogHeader>
            <DialogTitle className="text-gray-900">Review Sponsor Submission</DialogTitle>
            <DialogDescription className="text-gray-600">Review the details of the sponsor submission</DialogDescription>
          </DialogHeader>
          {selectedSponsor && (
            <div className="space-y-4 mt-4">
              <div>
                <Label className="text-gray-900 font-medium">Company Name</Label>
                <p className="text-gray-700">{selectedSponsor.companyName}</p>
              </div>
              <div className={`grid ${isLandscape ? 'grid-cols-3' : 'grid-cols-2'} gap-4`}>
                <div>
                  <Label className="text-gray-900 font-medium">Contact Name</Label>
                  <p className="text-gray-700">{selectedSponsor.contactName}</p>
                </div>
                <div>
                  <Label className="text-gray-900 font-medium">Email</Label>
                  <p className="text-gray-700">{selectedSponsor.contactEmail}</p>
                </div>
                {selectedSponsor.contactPhone && (
                  <div>
                    <Label className="text-gray-900 font-medium">Phone</Label>
                    <p className="text-gray-700">{selectedSponsor.contactPhone}</p>
                  </div>
                )}
                {selectedSponsor.sponsorshipLevel && (
                  <div>
                    <Label className="text-gray-900 font-medium">Sponsorship Level</Label>
                    <p className="text-gray-700 capitalize">{selectedSponsor.sponsorshipLevel}</p>
                  </div>
                )}
                {selectedSponsor.sponsorshipAmount && (
                  <div>
                    <Label className="text-gray-900 font-medium">Amount</Label>
                    <p className="text-gray-700">${selectedSponsor.sponsorshipAmount.toLocaleString()}</p>
                  </div>
                )}
              </div>
              {selectedSponsor.companyDescription && (
                <div>
                  <Label className="text-gray-900 font-medium">Company Description</Label>
                  <p className="text-gray-700 whitespace-pre-wrap">{selectedSponsor.companyDescription}</p>
                </div>
              )}
              {selectedSponsor.marketingGoals && (
                <div>
                  <Label className="text-gray-900 font-medium">Marketing Goals</Label>
                  <p className="text-gray-700 whitespace-pre-wrap">{selectedSponsor.marketingGoals}</p>
                </div>
              )}
              {selectedSponsor.sponsorshipPackageDetails && (
                <div>
                  <Label className="text-gray-900 font-medium">Sponsorship Package Details</Label>
                  <p className="text-gray-700 whitespace-pre-wrap">{selectedSponsor.sponsorshipPackageDetails}</p>
                </div>
              )}
              <div>
                <Label htmlFor="review-notes-sponsor" className="text-gray-900 font-medium">Review Notes</Label>
                <Textarea
                  id="review-notes-sponsor"
                  name="review-notes-sponsor"
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  placeholder="Add review notes..."
                  rows={3}
                  className="mt-1 bg-white text-gray-900 border-gray-300"
                />
              </div>
              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedSponsor(null);
                    setReviewNotes('');
                  }}
                  className="border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => handleUpdateSponsorStatus(selectedSponsor.id, 'rejected')}
                  disabled={isUpdatingStatus}
                  className="bg-red-600 hover:bg-red-700"
                >
                  Reject
                </Button>
                <Button
                  onClick={() => handleUpdateSponsorStatus(selectedSponsor.id, 'under_review')}
                  disabled={isUpdatingStatus}
                  className="bg-yellow-600 hover:bg-yellow-700"
                >
                  Under Review
                </Button>
                <Button
                  onClick={() => handleUpdateSponsorStatus(selectedSponsor.id, 'accepted')}
                  disabled={isUpdatingStatus}
                  className="bg-green-600 hover:bg-green-700"
                >
                  Accept
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Task Confirmation Dialog */}
      <AlertDialog open={!!taskToDelete} onOpenChange={() => setTaskToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Task</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this task? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-gray-300 text-gray-700 hover:bg-gray-50">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Workshop Submission Confirmation Dialog */}
      <AlertDialog open={!!workshopToDelete} onOpenChange={() => setWorkshopToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Workshop Submission</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this workshop/panel submission? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-gray-300 text-gray-700 hover:bg-gray-50">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteWorkshop} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Sponsor Submission Confirmation Dialog */}
      <AlertDialog open={!!sponsorToDelete} onOpenChange={() => setSponsorToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Sponsor Submission</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this sponsor submission? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-gray-300 text-gray-700 hover:bg-gray-50">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteSponsor} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

