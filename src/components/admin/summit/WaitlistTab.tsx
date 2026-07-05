import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Building2, Clock, FileText, History, Loader2, Mail, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';

interface WaitlistEntry {
  id: string;
  name: string;
  email: string;
  organization?: string | null;
  created_at: string;
}

export function WaitlistTab() {
  const { toast } = useToast();
  const [entries, setEntries] = useState<WaitlistEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [entryToDelete, setEntryToDelete] = useState<string | null>(null);
  const [showEmptyConfirm, setShowEmptyConfirm] = useState(false);
  const [isEmptying, setIsEmptying] = useState(false);

  useEffect(() => {
    loadWaitlist();
  }, []);

  const loadWaitlist = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('waitlist')
        .select('*')
        .order('created_at', { ascending: false }); // Chronological order (newest first)

      if (error) {
        if (process.env.NODE_ENV === 'development') {
          console.error('Error loading waitlist:', error);
        }
        throw error;
      }
      setEntries(data || []);
    } catch (error: any) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error loading waitlist:', error);
      }
      const errorMessage = error?.message || error?.details || 'Failed to load waitlist entries.';
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteEntry = async () => {
    if (!entryToDelete) return;

    try {
      const { error } = await supabase
        .from('waitlist')
        .delete()
        .eq('id', entryToDelete);

      if (error) throw error;

      toast({
        title: "Deleted",
        description: "Waitlist entry has been deleted.",
      });

      setEntryToDelete(null);
      loadWaitlist();
    } catch (error: any) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error deleting waitlist entry:', error);
      }
      toast({
        title: "Error",
        description: error?.message || "Failed to delete waitlist entry.",
        variant: "destructive",
      });
    }
  };

  const handleEmptyWaitlist = async () => {
    setIsEmptying(true);
    try {
      // Delete all entries by selecting all IDs first, then deleting them
      const { data: allEntries, error: selectError } = await supabase
        .from('waitlist')
        .select('id');

      if (selectError) throw selectError;

      if (allEntries && allEntries.length > 0) {
        const ids = allEntries.map(entry => entry.id);
        const { error } = await supabase
          .from('waitlist')
          .delete()
          .in('id', ids);

        if (error) throw error;
      }

      toast({
        title: "Waitlist Cleared",
        description: `All ${entries.length} waitlist entries have been deleted.`,
      });

      setShowEmptyConfirm(false);
      loadWaitlist();
    } catch (error: any) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error emptying waitlist:', error);
      }
      toast({
        title: "Error",
        description: error?.message || "Failed to empty waitlist.",
        variant: "destructive",
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

  const exportWaitlistCsv = () => {
    if (entries.length === 0) {
      toast({
        title: "No Data",
        description: "There are no waitlist entries to export.",
        variant: "destructive",
      });
      return;
    }

    // Create CSV headers
    const headers = ['Name', 'Email', 'Organization', 'Joined Date'];
    
    // Create CSV rows
    const rows = entries.map(entry => {
      const date = new Date(entry.created_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
      return [
        entry.name || '',
        entry.email || '',
        entry.organization || '',
        date,
      ];
    });

    // Combine headers and rows
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell.replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `waitlist-export-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Export Successful",
      description: `Exported ${entries.length} waitlist entries to CSV.`,
    });
  };

  return (
    <Card className="glass-card floating-hover">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Waitlist</CardTitle>
            <CardDescription>
              View all waitlist submissions in chronological order
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={exportWaitlistCsv}
              variant="outline"
              size="sm"
              className="bg-white"
            >
              <FileText className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
            <Button
              onClick={loadWaitlist}
              variant="outline"
              size="sm"
              className="bg-white"
            >
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
                Empty Waitlist
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
            <FileText className="h-12 w-12 text-gray-400 dark:text-white mx-auto mb-4" />
            <p className="text-gray-600 dark:text-white">No waitlist entries yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {entries.map((entry, index) => (
              <Card key={entry.id} className="bg-white dark:bg-[hsl(217,40%,18%)] border-gray-200 dark:border-[hsl(217,35%,25%)]">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-electric-blue/10 text-electric-blue font-semibold text-sm">
                          #{entries.length - index}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-white">{entry.name}</p>
                          <p className="text-sm text-gray-600 dark:text-white flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {entry.email}
                          </p>
                          {entry.organization && (
                            <p className="text-sm text-gray-600 dark:text-white flex items-center gap-1 mt-1">
                              <Building2 className="h-3 w-3" />
                              {entry.organization}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="pl-11 flex items-center gap-2 text-xs text-gray-500 dark:text-white">
                        <Clock className="h-3 w-3" />
                        Joined waitlist on {formatDate(entry.created_at)}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEntryToDelete(entry.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!entryToDelete} onOpenChange={(open) => !open && setEntryToDelete(null)}>
        <AlertDialogContent className="bg-white dark:bg-[hsl(217,40%,18%)] border-gray-200 dark:border-[hsl(217,35%,25%)]">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-gray-900 dark:text-white">Delete Waitlist Entry?</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-600 dark:text-white">
              Are you sure you want to delete this waitlist entry? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel 
              onClick={() => setEntryToDelete(null)}
              className="border-gray-300 dark:border-[hsl(217,35%,25%)] text-gray-700 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:text-white bg-white"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteEntry}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Empty Waitlist Confirmation Dialog */}
      <AlertDialog open={showEmptyConfirm} onOpenChange={(open) => !open && setShowEmptyConfirm(false)}>
        <AlertDialogContent className="bg-white dark:bg-[hsl(217,40%,18%)] border-gray-200 dark:border-[hsl(217,35%,25%)]">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-gray-900 dark:text-white">Empty Entire Waitlist?</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-600 dark:text-white">
              Are you sure you want to delete all {entries.length} waitlist entries? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel 
              onClick={() => setShowEmptyConfirm(false)}
              className="border-gray-300 dark:border-[hsl(217,35%,25%)] text-gray-700 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:text-white bg-white"
              disabled={isEmptying}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleEmptyWaitlist}
              className="bg-red-600 hover:bg-red-700 text-white"
              disabled={isEmptying}
            >
              {isEmptying ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Emptying...
                </>
              ) : (
                'Empty Waitlist'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
