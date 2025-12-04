import { Card, CardContent } from '@/components/ui/card';
import { PageTitle } from '@/components/PageTitle';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { MessageSquare, Plus, Search, Hash, Send, MoreVertical, Pin, Smile, X, Reply, Loader2, ArrowLeft } from 'lucide-react';
import { useState, useMemo, useRef, useEffect } from 'react';
import { useIsMobile, useIsLandscape } from '@/hooks/use-mobile';
import { getAllMembers } from '@/data/membersData';
import { sanitizeText, isValidLength } from '@/lib/security';
import { trackEvent, trackPageView } from '@/lib/analytics';
import { addNotification } from '@/lib/notifications';
import { getCurrentUser } from '@/lib/auth';
import { UserAvatar } from '@/components/UserAvatar';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import {
  getChannels,
  getMessages,
  createMessage,
  getMessageReactions,
  toggleReaction,
  togglePin,
  getThreadReplies,
  createThreadReply,
  createChannel,
  type Channel as ChannelType,
  type Message as MessageType,
  type ThreadReply as ThreadReplyType,
  type AggregatedReaction,
} from '@/data/discussions';

interface Channel extends ChannelType {
  unread?: number;
}

interface Message extends MessageType {
  timestamp: Date;
  reactions?: AggregatedReaction[];
}

interface ThreadReply extends ThreadReplyType {
  timestamp: Date;
}

export default function Discussions() {
  const user = getCurrentUser();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const isLandscape = useIsLandscape();
  const [selectedChannel, setSelectedChannel] = useState<string | null>(null);
  const [mobileView, setMobileView] = useState<'channels' | 'messages'>('channels');
  const [isLoadingChannels, setIsLoadingChannels] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  
  // Swipe gesture state
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const swipeThreshold = 50;
  const [isLoadingThreads, setIsLoadingThreads] = useState(false);
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [isSendingReply, setIsSendingReply] = useState(false);
  const [isCreatingChannel, setIsCreatingChannel] = useState(false);
  const [allMemberNames, setAllMemberNames] = useState<Array<{ name: string; email: string }>>([]);

  // Track page view
  useEffect(() => {
    trackPageView('/membership-portal/discussions', user?.id);
  }, [user?.id]);

  // Load all members for mentions
  useEffect(() => {
    const loadMembers = async () => {
      try {
        const membersData = await getAllMembers();
        const memberNames = membersData.flatMap(m => 
          m.members.map(p => ({ name: p.name, email: p.email }))
        );
        setAllMemberNames(memberNames);
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          console.error('Error loading members:', error);
        }
      }
    };
    loadMembers();
  }, []);

  const [channelSearchQuery, setChannelSearchQuery] = useState('');
  const [messageSearchQuery, setMessageSearchQuery] = useState('');
  const [messageInput, setMessageInput] = useState('');
  const [threadInput, setThreadInput] = useState('');
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null);
  const [showNewChannelDialog, setShowNewChannelDialog] = useState(false);
  const [newChannelName, setNewChannelName] = useState('');
  const [newChannelDescription, setNewChannelDescription] = useState('');
  const [showReactionPicker, setShowReactionPicker] = useState<string | null>(null);
  const [showMessageEmojiPicker, setShowMessageEmojiPicker] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Channels state
  const [channels, setChannels] = useState<Channel[]>([]);

  // Messages state - stored by channel ID
  const [messages, setMessages] = useState<Record<string, Message[]>>({});

  // Threads state - stored by message ID
  const [threads, setThreads] = useState<Record<string, ThreadReply[]>>({});

  // Load channels from database (only once on mount)
  useEffect(() => {
    let cancelled = false;
    
    const loadChannels = async () => {
      setIsLoadingChannels(true);
      try {
        const channelsData = await getChannels();
        
        if (cancelled) return;
        
        // Filter out summit channels (they should only appear in Summit Planning page)
        const mainChannels = channelsData.filter(ch => !ch.name.toLowerCase().startsWith('summit-'));
        
        const channelsWithUnread: Channel[] = mainChannels.map(ch => ({
          ...ch,
          unread: 0, // TODO: Calculate unread count
        }));
        setChannels(channelsWithUnread);
        
        // Select first channel if none selected (only on desktop)
        if (!selectedChannel && channelsWithUnread.length > 0 && !isMobile) {
          setSelectedChannel(channelsWithUnread[0].id);
        }
      } catch (error: any) {
        if (cancelled) return;
        
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
        if (!cancelled) {
          setIsLoadingChannels(false);
        }
      }
    };
    
    loadChannels();
    
    return () => {
      cancelled = true;
    };
  }, []); // Only run once on mount

  // Load messages when channel is selected
  useEffect(() => {
    if (!selectedChannel) return;
    
    // Prevent concurrent loads
    if (isLoadingMessages) return;

    let cancelled = false;

    const loadChannelMessages = async () => {
      setIsLoadingMessages(true);
      try {
        const messagesData = await getMessages(selectedChannel);
        
        if (cancelled) return;
        
        // Load reactions for each message
        const messagesWithReactions = await Promise.all(
          messagesData.map(async (msg) => {
            const reactions = await getMessageReactions(msg.id);
            return {
              ...msg,
              timestamp: msg.createdAt,
              reactions: reactions.length > 0 ? reactions : undefined,
            } as Message;
          })
        );

        if (cancelled) return;

        setMessages(prev => ({
          ...prev,
          [selectedChannel]: messagesWithReactions,
        }));
      } catch (error) {
        if (cancelled) return;
        
        if (process.env.NODE_ENV === 'development') {
          console.error('Error loading messages:', error);
        }
        toast({
          title: "Error",
          description: "Failed to load messages. Please try again.",
          variant: "destructive",
        });
      } finally {
        if (!cancelled) {
          setIsLoadingMessages(false);
        }
      }
    };

    loadChannelMessages();

    return () => {
      cancelled = true;
    };
  }, [selectedChannel]); // Only reload when selectedChannel changes

  // Load thread replies when message is selected
  useEffect(() => {
    if (!selectedMessageId) return;

    const loadThreadReplies = async () => {
      setIsLoadingThreads(true);
      try {
        const repliesData = await getThreadReplies(selectedMessageId);
        const repliesWithTimestamp = repliesData.map(reply => ({
          ...reply,
          timestamp: reply.createdAt,
        })) as ThreadReply[];
        
        setThreads(prev => ({
          ...prev,
          [selectedMessageId]: repliesWithTimestamp,
        }));
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          console.error('Error loading thread replies:', error);
        }
      } finally {
        setIsLoadingThreads(false);
      }
    };

    loadThreadReplies();
  }, [selectedMessageId]);

  // Get current channel messages
  const currentMessages = useMemo(() => {
    if (!selectedChannel) return [];
    return messages[selectedChannel] || [];
  }, [messages, selectedChannel]);

  // Filter messages by search
  const filteredMessages = useMemo(() => {
    if (!messageSearchQuery) return currentMessages;
    const query = messageSearchQuery.toLowerCase();
    return currentMessages.filter(msg => 
      msg.content.toLowerCase().includes(query) || 
      msg.author.toLowerCase().includes(query)
    );
  }, [currentMessages, messageSearchQuery]);

  // Filter channels by search
  const filteredChannels = useMemo(() => {
    if (!channelSearchQuery) return channels;
    const query = channelSearchQuery.toLowerCase();
    return channels.filter(ch => ch.name.toLowerCase().includes(query));
  }, [channels, channelSearchQuery]);

  // Format timestamp
  const formatTimestamp = (date: Date): string => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins} ${diffMins === 1 ? 'minute' : 'minutes'} ago`;
    if (diffHours < 24) return `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`;
    if (diffDays < 7) return `${diffDays} ${diffDays === 1 ? 'day' : 'days'} ago`;
    return date.toLocaleDateString();
  };

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [filteredMessages]);

  // Handle sending message
  const handleSendMessage = async () => {
    if (!selectedChannel || !user) return;
    
    const trimmedInput = messageInput.trim();
    if (!trimmedInput) return;

    // Validate length (max 5000 characters)
    if (!isValidLength(trimmedInput, 1, 5000)) {
      toast({
        title: "Invalid message",
        description: "Message must be between 1 and 5000 characters.",
        variant: "destructive",
      });
      return;
    }

    setIsSendingMessage(true);
    try {
      const authorName = user.name || user.email?.split('@')[0] || 'User';
      const authorEmail = user.email || '';

      const newMessage = await createMessage(
        selectedChannel,
        sanitizeText(trimmedInput),
        authorName,
        authorEmail
      );

      // Add to local state with timestamp
      const messageWithTimestamp: Message = {
        ...newMessage,
        timestamp: newMessage.createdAt,
      };

      setMessages(prev => ({
        ...prev,
        [selectedChannel]: [...(prev[selectedChannel] || []), messageWithTimestamp],
      }));

      // Track analytics
      trackEvent({
        type: 'discussion',
        category: 'discussions',
        action: 'message_sent',
        label: selectedChannel,
        userId: user?.id,
      });

      // Check for mentions and send notifications
      const mentionRegex = /@(\w+)/g;
      const mentions = trimmedInput.match(mentionRegex);
      if (mentions) {
        mentions.forEach(mention => {
          const mentionedName = mention.substring(1);
          const mentionedMember = allMemberNames.find(m => 
            m.name.toLowerCase().includes(mentionedName.toLowerCase())
          );
          if (mentionedMember && mentionedMember.email !== authorEmail) {
            addNotification({
              type: 'mention',
              title: `You were mentioned in #${channels.find(c => c.id === selectedChannel)?.name || selectedChannel}`,
              message: `${authorName}: ${trimmedInput.substring(0, 100)}...`,
              userId: mentionedMember.email,
              link: `/membership-portal/discussions?channel=${selectedChannel}`,
            });
          }
        });
      }

      setMessageInput('');
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error sending message:', error);
      }
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSendingMessage(false);
    }
  };

  // Handle sending thread reply
  const handleSendThreadReply = async () => {
    if (!selectedMessageId || !user) return;
    
    const trimmedInput = threadInput.trim();
    if (!trimmedInput) return;

    // Validate length (max 5000 characters)
    if (!isValidLength(trimmedInput, 1, 5000)) {
      toast({
        title: "Invalid reply",
        description: "Reply must be between 1 and 5000 characters.",
        variant: "destructive",
      });
      return;
    }

    setIsSendingReply(true);
    try {
      const authorName = user.name || user.email?.split('@')[0] || 'User';
      const authorEmail = user.email || '';

      const newReply = await createThreadReply(
        selectedMessageId,
        sanitizeText(trimmedInput),
        authorName,
        authorEmail
      );

      // Add to local state with timestamp
      const replyWithTimestamp: ThreadReply = {
        ...newReply,
        timestamp: newReply.createdAt,
      };

      setThreads(prev => ({
        ...prev,
        [selectedMessageId]: [...(prev[selectedMessageId] || []), replyWithTimestamp],
      }));

      // Track analytics
      trackEvent({
        type: 'click',
        category: 'discussions',
        action: 'reply_sent',
        label: selectedMessageId,
        userId: user?.id,
      });

      // Notify original message author
      const originalMessage = Object.values(messages).flat().find(m => m.id === selectedMessageId);
      if (originalMessage && originalMessage.authorEmail !== authorEmail) {
        addNotification({
          type: 'reply',
          title: `New reply in #${channels.find(c => c.id === selectedChannel)?.name || selectedChannel}`,
          message: `${authorName} replied to your message`,
          userId: originalMessage.authorEmail,
          link: `/membership-portal/discussions?channel=${selectedChannel}&message=${selectedMessageId}`,
        });
      }

      setThreadInput('');
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error sending reply:', error);
      }
      toast({
        title: "Error",
        description: "Failed to send reply. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSendingReply(false);
    }
  };

  // Handle creating new channel
  const handleCreateChannel = async () => {
    if (!newChannelName.trim() || !user) return;

    // Prevent creating summit channels from main Discussions page
    const channelName = newChannelName.trim().toLowerCase();
    if (channelName.startsWith('summit-')) {
      toast({
        title: "Invalid channel name",
        description: "Channels starting with 'summit-' are reserved for Summit Planning. Please use a different name.",
        variant: "destructive",
      });
      return;
    }

    setIsCreatingChannel(true);
    try {
      const createdBy = user.email || user.name || 'unknown';
      const newChannel = await createChannel(
        newChannelName.trim(),
        newChannelDescription.trim(),
        createdBy
      );

      const channelWithUnread: Channel = {
        ...newChannel,
        unread: 0,
      };

      setChannels(prev => [...prev, channelWithUnread]);
      setMessages(prev => ({ ...prev, [newChannel.id]: [] }));
      setNewChannelName('');
      setNewChannelDescription('');
      setShowNewChannelDialog(false);
      setSelectedChannel(newChannel.id);

      toast({
        title: "Channel created",
        description: `Channel #${newChannel.name} has been created.`,
      });
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error creating channel:', error);
      }
      toast({
        title: "Error",
        description: "Failed to create channel. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCreatingChannel(false);
    }
  };

  // Handle adding reaction
  const handleAddReaction = async (messageId: string, emoji: string) => {
    if (!user || !selectedChannel) return;

    try {
      const userId = user.id || user.email || 'unknown';
      await toggleReaction(messageId, emoji, userId);

      // Reload reactions for this message
      const updatedReactions = await getMessageReactions(messageId);
      
      setMessages(prev => {
        const channelMessages = prev[selectedChannel] || [];
        return {
          ...prev,
          [selectedChannel]: channelMessages.map(msg => {
            if (msg.id !== messageId) return msg;
            return {
              ...msg,
              reactions: updatedReactions.length > 0 ? updatedReactions : undefined,
            };
          }),
        };
      });
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error toggling reaction:', error);
      }
      toast({
        title: "Error",
        description: "Failed to add reaction. Please try again.",
        variant: "destructive",
      });
    }
    setShowReactionPicker(null);
  };

  // Handle pinning/unpinning message
  const handleTogglePin = async (messageId: string) => {
    if (!selectedChannel) return;

    try {
      const message = messages[selectedChannel]?.find(m => m.id === messageId);
      if (!message) return;

      const newPinnedState = !message.isPinned;
      await togglePin(messageId, newPinnedState);

      // Update local state
      setMessages(prev => {
        const channelMessages = prev[selectedChannel] || [];
        return {
          ...prev,
          [selectedChannel]: channelMessages.map(msg =>
            msg.id === messageId ? { ...msg, isPinned: newPinnedState } : msg
          ),
        };
      });
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error toggling pin:', error);
      }
      toast({
        title: "Error",
        description: "Failed to update pin status. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Get thread count for message
  const getThreadCount = (messageId: string): number => {
    return threads[messageId]?.length || 0;
  };

  // Get thread replies for message
  const getThreadReplies = (messageId: string): ThreadReply[] => {
    return threads[messageId] || [];
  };

  // Basic emotions and common reactions organized by category
  const emojiCategories = {
    emotions: [
      { emoji: '😊', name: 'Happy' },
      { emoji: '😄', name: 'Grinning' },
      { emoji: '😃', name: 'Excited' },
      { emoji: '😍', name: 'Love' },
      { emoji: '🥰', name: 'Adoring' },
      { emoji: '😎', name: 'Cool' },
      { emoji: '😢', name: 'Sad' },
      { emoji: '😭', name: 'Crying' },
      { emoji: '😤', name: 'Frustrated' },
      { emoji: '😡', name: 'Angry' },
      { emoji: '😱', name: 'Shocked' },
      { emoji: '😨', name: 'Fearful' },
      { emoji: '😴', name: 'Sleepy' },
      { emoji: '🤔', name: 'Thinking' },
      { emoji: '😏', name: 'Smirk' },
      { emoji: '🙄', name: 'Rolling Eyes' },
    ],
    reactions: [
      { emoji: '👍', name: 'Thumbs Up' },
      { emoji: '👎', name: 'Thumbs Down' },
      { emoji: '❤️', name: 'Heart' },
      { emoji: '💯', name: '100' },
      { emoji: '🎉', name: 'Celebrate' },
      { emoji: '✅', name: 'Checkmark' },
      { emoji: '👏', name: 'Clap' },
      { emoji: '🔥', name: 'Fire' },
      { emoji: '🚀', name: 'Rocket' },
      { emoji: '💬', name: 'Comment' },
      { emoji: '⭐', name: 'Star' },
      { emoji: '✨', name: 'Sparkles' },
    ],
  };

  // Flatten all emojis for quick access
  const allEmojis = [...emojiCategories.emotions, ...emojiCategories.reactions];

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

  // In landscape mobile, show side-by-side layout instead of overlay
  const isPortraitMobile = isMobile && !isLandscape;
  const showSideBySide = isLandscape || !isMobile;
  
  // Ref to measure PageTitle height
  const pageTitleRef = useRef<HTMLDivElement>(null);
  const [pageTitleHeight, setPageTitleHeight] = useState(0);

  useEffect(() => {
    if (isLandscape && pageTitleRef.current) {
      const updateHeight = () => {
        // Find the Card element inside the wrapper to measure its actual bottom
        const wrapper = pageTitleRef.current;
        const card = wrapper?.querySelector('.glass-card') as HTMLElement;
        
        if (card) {
          // Measure the CardContent's bottom - this accounts for padding
          const cardContent = card.querySelector('div[class*="CardContent"], div[class*="card-content"]') as HTMLElement;
          if (cardContent) {
            const contentRect = cardContent.getBoundingClientRect();
            // Use CardContent bottom - this is where actual content ends
            setPageTitleHeight(Math.ceil(contentRect.bottom));
          } else {
            // Fallback: measure Card's bottom including border
            const cardRect = card.getBoundingClientRect();
            const computedStyle = window.getComputedStyle(card);
            const borderBottom = parseFloat(computedStyle.borderBottomWidth) || 1;
            // Overlap the border to eliminate gap
            setPageTitleHeight(Math.ceil(cardRect.bottom) - borderBottom);
          }
        } else if (wrapper) {
          // Fallback: measure wrapper
          const rect = wrapper.getBoundingClientRect();
          setPageTitleHeight(Math.ceil(rect.bottom));
        }
      };
      // Use multiple methods to ensure accurate measurement
      const measure = () => {
        requestAnimationFrame(() => {
          updateHeight();
          setTimeout(updateHeight, 10);
        });
      };
      measure();
      window.addEventListener('resize', measure);
      window.addEventListener('orientationchange', measure);
      return () => {
        window.removeEventListener('resize', measure);
        window.removeEventListener('orientationchange', measure);
      };
    }
  }, [isLandscape]);

  return (
    <div className={`${isLandscape ? 'space-y-0' : 'space-y-0'} md:space-y-4`} style={isLandscape ? { margin: 0, padding: 0, marginTop: 0 } : {}}>
      <div ref={pageTitleRef} style={isLandscape ? { marginBottom: 0, paddingBottom: 0, marginTop: 0 } : {}}>
        <PageTitle title="Discussions" fullWidthLandscape={true} />
      </div>
      {isPortraitMobile && <div className="h-[0px]"></div>}
      <div 
        className={`flex ${isLandscape ? 'fixed z-30' : isPortraitMobile ? 'relative z-0' : 'h-[calc(100dvh-9rem)]'} md:h-[calc(100dvh-12rem)] md:relative md:z-auto gap-2 md:gap-4 overflow-hidden`}
        style={isLandscape ? { 
          top: pageTitleHeight > 0 ? `${pageTitleHeight - 70}px` : '-22px',
          left: 0,
          right: 0,
          bottom: 0,
          height: 'auto',
          maxHeight: pageTitleHeight > 0 ? `calc(100dvh - ${pageTitleHeight - 70}px)` : 'calc(100dvh + 22px)',
          overflow: 'hidden',
          margin: 0,
          padding: 0,
          zIndex: 30
        } : isPortraitMobile ? {
          height: 'calc(100dvh - 44px)',
          minHeight: 'calc(100dvh - 44px)',
          maxHeight: 'calc(100dvh - 44px)'
        } : {}}
      >
      {/* Channels Sidebar - Side-by-side in landscape, overlay in portrait mobile */}
      <div className={`${isPortraitMobile ? 'absolute top-0 left-0 right-0 bottom-0 z-10' : showSideBySide ? 'block' : 'hidden'} ${showSideBySide ? 'w-full md:w-64' : 'w-full'} flex-shrink-0 transition-transform duration-300 ease-in-out ${
        isPortraitMobile && mobileView === 'messages' ? '-translate-x-full' : 'translate-x-0'
      }`}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      >
        <Card className={`glass-card h-full flex flex-col ${isLandscape ? 'border-t-0' : ''} ${isPortraitMobile ? 'mt-0' : ''}`}>
          <CardContent className={`p-0 flex flex-col flex-1 min-h-0 ${isPortraitMobile ? 'pt-0' : ''}`}>
            <div className={`p-3 border-b border-electric-blue/20 ${isPortraitMobile ? 'pt-4' : ''}`}>
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Channels</h2>
                <Dialog open={showNewChannelDialog} onOpenChange={setShowNewChannelDialog}>
                  <DialogTrigger asChild>
                    <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create New Channel</DialogTitle>
                      <DialogDescription>Create a new channel for discussions</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <Input
                        id="new-channel-name"
                        name="new-channel-name"
                        placeholder="Channel name (e.g., research)"
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
            <div className={`overflow-y-auto flex-1 min-h-0`}>
              {isLoadingChannels ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-electric-blue" />
                </div>
              ) : filteredChannels.length === 0 ? (
                <div className="text-center py-8 text-gray-500 dark:text-white text-sm">
                  {channelSearchQuery ? 'No channels found' : 'No channels yet'}
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
                    <span className="flex-1 text-left text-gray-700 dark:text-white">{channel.name}</span>
                    {channel.unread && channel.unread > 0 && (
                      <span className="bg-electric-blue text-white text-xs rounded-full px-1.5 py-0.5 min-w-[20px] text-center">
                        {channel.unread}
                      </span>
                    )}
                  </button>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Messages Area */}
      <div className={`${isPortraitMobile ? 'absolute top-0 left-0 right-0 bottom-0 z-20' : 'flex-1'} flex flex-col transition-transform duration-300 ease-in-out ${
        isPortraitMobile && mobileView === 'channels' ? 'translate-x-full' : 'translate-x-0'
      }`}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      >
        <Card className={`glass-card flex-1 flex flex-col h-full min-h-0 ${isLandscape ? 'border-t-0' : ''}`}>
          {/* Channel Header */}
          <div className={`p-2 md:p-3 border-b border-electric-blue/20 flex flex-col md:flex-row md:items-start md:justify-between gap-2 ${isPortraitMobile ? 'pt-4' : ''}`}>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                {isPortraitMobile && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleBackToChannels}
                    className="-ml-2 flex-shrink-0"
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                )}
                <Hash className="h-4 w-4 md:h-5 md:w-5 text-gray-500 dark:text-white flex-shrink-0" />
                <h2 className="font-semibold text-sm md:text-base text-gray-900 dark:text-white truncate flex-1 min-w-0">
                  {channels.find(c => c.id === selectedChannel)?.name || selectedChannel || 'Select a channel'}
                </h2>
              </div>
              {channels.find(c => c.id === selectedChannel)?.description && (
                <p className="text-xs text-gray-500 dark:text-white mt-1 line-clamp-3 md:line-clamp-4 break-words">
                  {channels.find(c => c.id === selectedChannel)?.description}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <div className="relative flex-1 md:flex-none">
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 md:h-4 md:w-4 text-gray-400" />
                <Input
                  id="message-search"
                  name="message-search"
                  placeholder="Search messages..."
                  className="pl-7 md:pl-8 h-7 md:h-8 w-full md:w-48 text-xs"
                  value={messageSearchQuery}
                  onChange={(e) => setMessageSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Messages List */}
          <div className="flex-1 overflow-y-auto p-2 md:p-4 space-y-2 md:space-y-4 min-h-0">
            {!selectedChannel ? (
              <div className="text-center py-12">
                <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Select a channel</h3>
                <p className="text-gray-600 dark:text-white">Choose a channel from the sidebar to start chatting</p>
              </div>
            ) : isLoadingMessages ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-electric-blue mb-3" />
                <p className="text-gray-600 dark:text-white">Loading messages...</p>
              </div>
            ) : filteredMessages.length === 0 ? (
              <div className="text-center py-12">
                <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No messages yet</h3>
                <p className="text-gray-600 dark:text-white mb-4">Be the first to start the conversation!</p>
                <p className="text-sm text-gray-500 dark:text-white">Type a message below to get started</p>
              </div>
            ) : (
              <>
                {filteredMessages.map((message) => {
                  // Get profile picture for current user's messages
                  const currentUser = getCurrentUser();
                  const isCurrentUser = currentUser && message.authorEmail?.toLowerCase() === currentUser.email.toLowerCase();
                  const profilePicture = isCurrentUser ? currentUser.profilePicture : undefined;
                  
                  return (
                  <div key={message.id} className="flex gap-2 md:gap-3 group hover:bg-electric-blue/5 rounded-lg p-1 md:p-2 -m-1 md:-m-2 transition-colors">
                    <UserAvatar
                      email={message.authorEmail}
                      name={message.author}
                      profilePicture={profilePicture}
                      size="md"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-sm text-gray-900 dark:text-white">{message.author}</span>
                        <span className="text-xs text-gray-500 dark:text-white">{formatTimestamp(message.timestamp)}</span>
                        <div className="flex items-center gap-1 ml-auto">
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => setShowReactionPicker(showReactionPicker === message.id ? null : message.id)}
                              className="p-1 hover:bg-gray-100 rounded"
                              title="Add reaction"
                            >
                              <Smile className="h-3 w-3 text-gray-500 dark:text-white" />
                            </button>
                            <button
                              onClick={() => setSelectedMessageId(selectedMessageId === message.id ? null : message.id)}
                              className="p-1 hover:bg-gray-100 rounded"
                              title="Reply in thread"
                            >
                              <Reply className="h-3 w-3 text-gray-500 dark:text-white" />
                            </button>
                          </div>
                          <button
                            onClick={() => handleTogglePin(message.id)}
                            className={`p-1 hover:bg-gray-100 rounded ${message.isPinned ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} transition-opacity`}
                            title={message.isPinned ? 'Unpin' : 'Pin'}
                          >
                            <Pin className={`h-3 w-3 ${message.isPinned ? 'text-electric-blue' : 'text-gray-500 dark:text-white'}`} />
                          </button>
                        </div>
                      </div>
                      <p className="text-sm text-gray-700 dark:text-white mb-2 whitespace-pre-wrap">{message.content}</p>
                      
                      {/* Reaction Picker */}
                      {showReactionPicker === message.id && (
                        <div className="mb-2 p-3 bg-white border border-gray-200 rounded-lg shadow-lg max-w-md">
                          <div className="mb-2">
                            <span className="text-xs font-semibold text-gray-600 dark:text-white uppercase">Emotions</span>
                            <div className="flex items-center gap-1 mt-1 flex-wrap">
                              {emojiCategories.emotions.map((item) => (
                                <button
                                  key={item.emoji}
                                  onClick={() => handleAddReaction(message.id, item.emoji)}
                                  className="text-xl hover:scale-125 transition-transform p-1.5 hover:bg-gray-100 rounded"
                                  title={item.name}
                                >
                                  {item.emoji}
                                </button>
                              ))}
                            </div>
                          </div>
                          <div className="border-t border-gray-200 pt-2 mt-2">
                            <span className="text-xs font-semibold text-gray-600 dark:text-white uppercase">Reactions</span>
                            <div className="flex items-center gap-1 mt-1 flex-wrap">
                              {emojiCategories.reactions.map((item) => (
                                <button
                                  key={item.emoji}
                                  onClick={() => handleAddReaction(message.id, item.emoji)}
                                  className="text-xl hover:scale-125 transition-transform p-1.5 hover:bg-gray-100 rounded"
                                  title={item.name}
                                >
                                  {item.emoji}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Reactions */}
                      {message.reactions && message.reactions.length > 0 && (
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          {message.reactions.map((reaction, idx) => {
                            const currentUser = getCurrentUser();
                            const userIdentifier = currentUser?.id || currentUser?.email || '';
                            const hasUserReacted = reaction.users.includes(userIdentifier);
                            return (
                              <button
                                key={idx}
                                onClick={() => handleAddReaction(message.id, reaction.emoji)}
                                className={`text-xs px-2 py-0.5 rounded-full flex items-center gap-1 transition-colors ${
                                  hasUserReacted 
                                    ? 'bg-electric-blue/20 border border-electric-blue' 
                                    : 'bg-gray-100 hover:bg-gray-200'
                                }`}
                              >
                                <span>{reaction.emoji}</span>
                                <span>{reaction.count}</span>
                              </button>
                            );
                          })}
                        </div>
                      )}

                      {/* Thread Replies */}
                      {getThreadCount(message.id) > 0 && (
                        <button
                          onClick={() => setSelectedMessageId(selectedMessageId === message.id ? null : message.id)}
                          className="text-xs text-electric-blue hover:underline flex items-center gap-1 mb-2"
                        >
                          <MessageSquare className="h-3 w-3" />
                          {getThreadCount(message.id)} {getThreadCount(message.id) === 1 ? 'reply' : 'replies'}
                        </button>
                      )}

                      {/* Thread View */}
                      {selectedMessageId === message.id && (
                        <div className="mt-3 ml-4 pl-4 border-l-2 border-electric-blue/30 space-y-3">
                          {isLoadingThreads ? (
                            <div className="flex items-center justify-center py-4">
                              <Loader2 className="h-4 w-4 animate-spin text-electric-blue" />
                            </div>
                          ) : (
                            <>
                              {getThreadReplies(message.id).map((reply) => {
                                // Get profile picture for current user's replies
                                const currentUser = getCurrentUser();
                                const isCurrentUser = currentUser && reply.authorEmail?.toLowerCase() === currentUser.email.toLowerCase();
                                const profilePicture = isCurrentUser ? currentUser.profilePicture : undefined;
                                
                                return (
                                <div key={reply.id} className="flex gap-2">
                                  <UserAvatar
                                    email={reply.authorEmail}
                                    name={reply.author}
                                    profilePicture={profilePicture}
                                    size="sm"
                                  />
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                      <span className="font-semibold text-xs text-gray-900 dark:text-white">{reply.author}</span>
                                      <span className="text-xs text-gray-500 dark:text-white">{formatTimestamp(reply.timestamp)}</span>
                                    </div>
                                    <p className="text-xs text-gray-700 dark:text-white">{reply.content}</p>
                                  </div>
                                </div>
                                );
                              })}
                            </>
                          )}
                          <div className="flex gap-2">
                            <Input
                              id="thread-reply"
                              name="thread-reply"
                              placeholder="Reply in thread..."
                              value={threadInput}
                              onChange={(e) => setThreadInput(e.target.value)}
                              onKeyPress={(e) => e.key === 'Enter' && !isSendingReply && handleSendThreadReply()}
                              className="flex-1 h-8 text-xs"
                              disabled={isSendingReply}
                            />
                            <Button
                              size="sm"
                              onClick={handleSendThreadReply}
                              disabled={!threadInput.trim() || isSendingReply}
                              className="bg-electric-blue hover:bg-blue-600"
                            >
                              {isSendingReply ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                              ) : (
                                <Send className="h-3 w-3" />
                              )}
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          {/* Message Input */}
          <div className="p-2 md:p-4 border-t border-electric-blue/20 flex-shrink-0">
            {/* Emoji Picker for Message Input */}
            {showMessageEmojiPicker && (
              <div className="mb-2 p-3 bg-white border border-gray-200 rounded-lg shadow-lg max-w-md">
                <div className="mb-2">
                  <span className="text-xs font-semibold text-gray-600 uppercase">Emotions</span>
                  <div className="flex items-center gap-1 mt-1 flex-wrap">
                    {emojiCategories.emotions.map((item) => (
                      <button
                        key={item.emoji}
                        onClick={() => {
                          setMessageInput(prev => prev + item.emoji);
                          setShowMessageEmojiPicker(false);
                        }}
                        className="text-xl hover:scale-125 transition-transform p-1.5 hover:bg-gray-100 rounded"
                        title={item.name}
                      >
                        {item.emoji}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="border-t border-gray-200 pt-2 mt-2">
                  <span className="text-xs font-semibold text-gray-600 dark:text-white uppercase">Reactions</span>
                  <div className="flex items-center gap-1 mt-1 flex-wrap">
                    {emojiCategories.reactions.map((item) => (
                      <button
                        key={item.emoji}
                        onClick={() => {
                          setMessageInput(prev => prev + item.emoji);
                          setShowMessageEmojiPicker(false);
                        }}
                        className="text-xl hover:scale-125 transition-transform p-1.5 hover:bg-gray-100 rounded"
                        title={item.name}
                      >
                        {item.emoji}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
            <div className="flex gap-2">
              <div className="relative flex-1">
                <button
                  onClick={() => setShowMessageEmojiPicker(!showMessageEmojiPicker)}
                  className="absolute left-2 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-100 rounded"
                  title="Add emoji"
                >
                  <Smile className="h-4 w-4 text-gray-500 dark:text-white" />
                </button>
                <Input
                  id="message-input"
                  name="message-input"
                  placeholder={selectedChannel ? `Message #${channels.find(c => c.id === selectedChannel)?.name || selectedChannel}` : 'Select a channel'}
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey && !isSendingMessage && selectedChannel) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  className="pl-10"
                  disabled={!selectedChannel || isSendingMessage}
                />
              </div>
              <Button 
                onClick={handleSendMessage}
                className="bg-electric-blue hover:bg-blue-600"
                disabled={!messageInput.trim() || !selectedChannel || isSendingMessage}
              >
                {isSendingMessage ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
    </div>
  );
}

