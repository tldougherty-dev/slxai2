import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Building2, CheckCircle2, Clock, Download, History, Loader2, Mail, Phone, Ticket, Trash2, User, XCircle,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { exportToCSV } from '@/lib/export';
import { TicketReservation } from '@/data/summit2026';

export function TicketReservationsTab() {
  const { toast } = useToast();
  const [reservations, setReservations] = useState<TicketReservation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [reservationToDelete, setReservationToDelete] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<'all' | 'reserved' | 'confirmed' | 'cancelled'>('all');

  useEffect(() => {
    loadReservations();
  }, [statusFilter]);

  const loadReservations = async () => {
    setIsLoading(true);
    try {
      let query = supabase
        .from('summit_ticket_reservations')
        .select('*')
        .order('reserved_at', { ascending: false });

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      const { data, error } = await query;

      if (error) {
        if (process.env.NODE_ENV === 'development') {
          console.error('Error loading ticket reservations:', error);
        }
        throw error;
      }

      const formattedReservations: TicketReservation[] = (data || []).map((row: any) => ({
        id: row.id,
        name: row.name,
        email: row.email,
        phone: row.phone,
        organization: row.organization,
        status: row.status,
        reservedAt: new Date(row.reserved_at),
        confirmedAt: row.confirmed_at ? new Date(row.confirmed_at) : undefined,
        cancelledAt: row.cancelled_at ? new Date(row.cancelled_at) : undefined,
        createdAt: new Date(row.created_at),
        updatedAt: new Date(row.updated_at),
      }));

      setReservations(formattedReservations);
    } catch (error: any) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error loading ticket reservations:', error);
      }
      const errorMessage = error?.message || error?.details || 'Failed to load ticket reservations.';
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteReservation = async () => {
    if (!reservationToDelete) return;
    
    try {
      const { error } = await supabase
        .from('summit_ticket_reservations')
        .delete()
        .eq('id', reservationToDelete);

      if (error) throw error;

      toast({
        title: "Deleted",
        description: "Ticket reservation has been deleted.",
      });
      
      setReservationToDelete(null);
      loadReservations();
    } catch (error: any) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error deleting reservation:', error);
      }
      toast({
        title: "Error",
        description: "Failed to delete reservation.",
        variant: "destructive",
      });
    }
  };

  const handleUpdateStatus = async (reservationId: string, newStatus: 'reserved' | 'confirmed' | 'cancelled') => {
    try {
      const updateData: any = { status: newStatus };
      
      // Set timestamps based on new status
      if (newStatus === 'confirmed') {
        updateData.confirmed_at = new Date().toISOString();
        updateData.cancelled_at = null; // Clear cancelled_at if changing to confirmed
      } else if (newStatus === 'cancelled') {
        updateData.cancelled_at = new Date().toISOString();
        updateData.confirmed_at = null; // Clear confirmed_at if changing to cancelled
      } else if (newStatus === 'reserved') {
        // Clear both timestamps when reverting to reserved
        updateData.confirmed_at = null;
        updateData.cancelled_at = null;
      }

      const { error } = await supabase
        .from('summit_ticket_reservations')
        .update(updateData)
        .eq('id', reservationId);

      if (error) throw error;

      toast({
        title: "Updated",
        description: `Reservation status updated to ${newStatus}.`,
      });
      
      loadReservations();
    } catch (error: any) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error updating reservation status:', error);
      }
      toast({
        title: "Error",
        description: "Failed to update reservation status.",
        variant: "destructive",
      });
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDateForCSV = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleExportTicketHolders = () => {
    if (reservations.length === 0) {
      toast({
        title: "No data",
        description: "No ticket reservations to export.",
        variant: "destructive",
      });
      return;
    }

    const data = reservations.map(r => ({
      'Name': r.name,
      'Email': r.email,
      'Phone': r.phone || '',
      'Organization': r.organization || '',
      'Status': r.status,
      'Reserved At': formatDateForCSV(r.reservedAt),
      'Confirmed At': r.confirmedAt ? formatDateForCSV(r.confirmedAt) : '',
      'Cancelled At': r.cancelledAt ? formatDateForCSV(r.cancelledAt) : '',
      'Created At': formatDateForCSV(r.createdAt),
      'Updated At': formatDateForCSV(r.updatedAt),
    }));

    exportToCSV(data, 'ticket_holders_export');

    toast({
      title: "Export started",
      description: `Ticket holders exported as CSV.`,
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <Badge className="bg-green-100 text-green-700 border-green-200"><CheckCircle2 className="h-3 w-3 mr-1" />Confirmed</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-100 text-red-700 border-red-200"><XCircle className="h-3 w-3 mr-1" />Cancelled</Badge>;
      default:
        return <Badge className="bg-blue-100 text-blue-700 border-blue-200"><Clock className="h-3 w-3 mr-1" />Reserved</Badge>;
    }
  };

  const totalReservations = reservations.length;
  const confirmedCount = reservations.filter(r => r.status === 'confirmed').length;
  const reservedCount = reservations.filter(r => r.status === 'reserved').length;
  const cancelledCount = reservations.filter(r => r.status === 'cancelled').length;

  return (
    <Card className="glass-card floating-hover">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Ticket Reservations</CardTitle>
            <CardDescription>
              View and manage all ticket reservations ({totalReservations} total)
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={handleExportTicketHolders}
              variant="outline"
              size="sm"
              className="bg-white"
              disabled={reservations.length === 0}
            >
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
            <Button
              onClick={loadReservations}
              variant="outline"
              size="sm"
              className="bg-white"
            >
              <History className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
            <CardContent className="p-4">
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total</div>
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{totalReservations}</div>
            </CardContent>
          </Card>
          <Card className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
            <CardContent className="p-4">
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Confirmed</div>
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">{confirmedCount}</div>
            </CardContent>
          </Card>
          <Card className="bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800">
            <CardContent className="p-4">
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Reserved</div>
              <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">{reservedCount}</div>
            </CardContent>
          </Card>
          <Card className="bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
            <CardContent className="p-4">
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Cancelled</div>
              <div className="text-2xl font-bold text-red-600 dark:text-red-400">{cancelledCount}</div>
            </CardContent>
          </Card>
        </div>

        {/* Filter */}
        <div className="mb-4">
          <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="reserved">Reserved</SelectItem>
              <SelectItem value="confirmed">Confirmed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-electric-blue" />
          </div>
        ) : reservations.length === 0 ? (
          <div className="text-center py-12">
            <Ticket className="h-12 w-12 text-gray-400 dark:text-white mx-auto mb-4" />
            <p className="text-gray-600 dark:text-white">No ticket reservations found.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {reservations.map((reservation) => (
              <Card key={reservation.id} className="bg-white dark:bg-[hsl(217,40%,18%)] border-gray-200 dark:border-[hsl(217,35%,25%)]">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center gap-3">
                        <User className="h-5 w-5 text-electric-blue" />
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-white">{reservation.name}</p>
                          <p className="text-sm text-gray-600 dark:text-white flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {reservation.email}
                          </p>
                          {reservation.phone && (
                            <p className="text-sm text-gray-600 dark:text-white flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              {reservation.phone}
                            </p>
                          )}
                          {reservation.organization && (
                            <p className="text-sm text-gray-600 dark:text-white flex items-center gap-1">
                              <Building2 className="h-3 w-3" />
                              {reservation.organization}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="pl-8 flex items-center gap-4 text-xs text-gray-500 dark:text-white">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          Reserved: {formatDate(reservation.reservedAt)}
                        </div>
                        {reservation.confirmedAt && (
                          <div className="flex items-center gap-1 text-green-600">
                            <CheckCircle2 className="h-3 w-3" />
                            Confirmed: {formatDate(reservation.confirmedAt)}
                          </div>
                        )}
                        {reservation.cancelledAt && (
                          <div className="flex items-center gap-1 text-red-600">
                            <XCircle className="h-3 w-3" />
                            Cancelled: {formatDate(reservation.cancelledAt)}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      {getStatusBadge(reservation.status)}
                      {reservation.status !== 'confirmed' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleUpdateStatus(reservation.id, 'confirmed')}
                          className="bg-green-50 hover:bg-green-100 text-green-700 border-green-200"
                        >
                          <CheckCircle2 className="h-4 w-4 mr-1" />
                          Confirm
                        </Button>
                      )}
                      {reservation.status !== 'cancelled' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleUpdateStatus(reservation.id, 'cancelled')}
                          className="bg-red-50 hover:bg-red-100 text-red-700 border-red-200"
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Cancel
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setReservationToDelete(reservation.id)}
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
      <AlertDialog open={!!reservationToDelete} onOpenChange={(open) => !open && setReservationToDelete(null)}>
        <AlertDialogContent className="bg-white dark:bg-[hsl(217,40%,18%)] border-gray-200 dark:border-[hsl(217,35%,25%)]">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-gray-900 dark:text-white">Delete Reservation?</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-600 dark:text-white">
              Are you sure you want to delete this ticket reservation? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel 
              onClick={() => setReservationToDelete(null)}
              className="border-gray-300 dark:border-[hsl(217,35%,25%)] text-gray-700 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:text-white bg-white"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteReservation}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
