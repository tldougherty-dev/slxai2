import { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { getNotifications, getUnreadCount, markAsRead, markAllAsRead, deleteNotification, Notification } from '@/lib/notifications';
import { getCurrentUser } from '@/lib/auth';
import { formatDistanceToNow } from 'date-fns';
import { Link } from 'react-router-dom';
import { X, CheckCheck } from 'lucide-react';

export default function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const user = getCurrentUser();

  useEffect(() => {
    const loadNotifications = async () => {
      try {
        const [notifs, count] = await Promise.all([
          getNotifications(user?.id),
          getUnreadCount(user?.id),
        ]);
        setNotifications(notifs);
        setUnreadCount(count);
      } catch (error) {
        console.error('Error loading notifications:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadNotifications();

    // Listen for new notifications
    const handleNotification = () => {
      loadNotifications();
    };

    window.addEventListener('notification', handleNotification);

    // Poll for updates every 10 seconds
    const interval = setInterval(loadNotifications, 10000);

    return () => {
      window.removeEventListener('notification', handleNotification);
      clearInterval(interval);
    };
  }, [user?.id]);

  const handleMarkAsRead = async (id: string) => {
    await markAsRead(id);
    const [notifs, count] = await Promise.all([
      getNotifications(user?.id),
      getUnreadCount(user?.id),
    ]);
    setNotifications(notifs);
    setUnreadCount(count);
  };

  const handleMarkAllAsRead = async () => {
    await markAllAsRead(user?.id);
    const [notifs, count] = await Promise.all([
      getNotifications(user?.id),
      getUnreadCount(user?.id),
    ]);
    setNotifications(notifs);
    setUnreadCount(count);
  };

  const handleDelete = async (id: string) => {
    await deleteNotification(id);
    const [notifs, count] = await Promise.all([
      getNotifications(user?.id),
      getUnreadCount(user?.id),
    ]);
    setNotifications(notifs);
    setUnreadCount(count);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative text-gray-900 hover:text-gray-900">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 sm:w-96" align="end">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-sm text-gray-900">Notifications</h3>
          {notifications.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMarkAllAsRead}
              className="h-7 text-xs"
            >
              <CheckCheck className="h-3 w-3 mr-1" />
              Mark all read
            </Button>
          )}
        </div>
        <ScrollArea className="h-[400px]">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-electric-blue"></div>
            </div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-8 text-sm text-gray-500">
              No notifications
            </div>
          ) : (
            <div className="space-y-1">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-3 rounded-lg border transition-colors ${
                    notification.read
                      ? 'bg-white border-gray-200'
                      : 'bg-blue-50 border-electric-blue/20'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-sm text-gray-900">
                          {notification.title}
                        </h4>
                        {!notification.read && (
                          <div className="h-2 w-2 rounded-full bg-electric-blue flex-shrink-0"></div>
                        )}
                      </div>
                      <p className="text-xs text-gray-600 mb-1">
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-400">
                        {formatDistanceToNow(notification.timestamp, {
                          addSuffix: true,
                        })}
                      </p>
                      {notification.link && (
                        <Link
                          to={notification.link}
                          onClick={() => setIsOpen(false)}
                          className="text-xs text-electric-blue hover:underline mt-1 inline-block"
                        >
                          View →
                        </Link>
                      )}
                    </div>
                    <div className="flex items-start gap-1">
                      {!notification.read && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleMarkAsRead(notification.id)}
                          className="h-6 w-6 p-0"
                        >
                          <CheckCheck className="h-3 w-3" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(notification.id)}
                        className="h-6 w-6 p-0 text-gray-400 hover:text-red-600"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
