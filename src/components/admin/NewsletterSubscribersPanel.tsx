import { useCallback, useEffect, useMemo, useState } from 'react';
import { format } from 'date-fns';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import {
  buildSubscriberAnalytics,
  deleteNewsletterSubscriber,
  listNewsletterSubscribers,
  type NewsletterSubscriber,
} from '@/data/newsletterSubscribers';
import { exportToCSV } from '@/lib/export';
import { supabase } from '@/lib/supabase';
import { Download, Loader2, Mail, RefreshCw, Search, Trash2, TrendingUp, Users } from 'lucide-react';

export function NewsletterSubscribersPanel() {
  const { toast } = useToast();
  const [subscribers, setSubscribers] = useState<NewsletterSubscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await listNewsletterSubscribers();
      setSubscribers(data);
    } catch (e) {
      toast({
        title: 'Could not load subscribers',
        description: e instanceof Error ? e.message : 'Unknown error',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    const channel = supabase
      .channel('newsletter-subscribers-admin')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'newsletter_subscribers' },
        () => {
          load();
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [load]);

  const analytics = useMemo(() => buildSubscriberAnalytics(subscribers), [subscribers]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return subscribers;
    return subscribers.filter((s) => s.email.includes(q) || s.source.toLowerCase().includes(q));
  }, [search, subscribers]);

  const handleExport = () => {
    if (subscribers.length === 0) {
      toast({ title: 'No subscribers to export', variant: 'destructive' });
      return;
    }
    exportToCSV(
      subscribers.map((s) => ({
        Email: s.email,
        Source: s.source,
        'Subscribed at': format(s.createdAt, 'yyyy-MM-dd HH:mm'),
      })),
      'newsletter_subscribers',
    );
    toast({ title: 'Export started' });
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Remove this subscriber from the list?')) return;
    setDeletingId(id);
    try {
      await deleteNewsletterSubscriber(id);
      toast({ title: 'Subscriber removed' });
      await load();
    } catch (e) {
      toast({
        title: 'Delete failed',
        description: e instanceof Error ? e.message : 'Unknown error',
        variant: 'destructive',
      });
    } finally {
      setDeletingId(null);
    }
  };

  const chartDaily = analytics.dailySignups.map((d) => ({
    ...d,
    label: format(new Date(d.date), 'MMM d'),
  }));

  const chartGrowth = analytics.cumulativeGrowth.map((d) => ({
    ...d,
    label: format(new Date(d.date), 'MMM d'),
  }));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Subscribers</h2>
          <p className="text-sm text-gray-500">
            Emails collected from the public newsletter signup. Updates live when new people subscribe.
          </p>
        </div>
        <div className="flex gap-2">
          <Button type="button" variant="outline" size="sm" onClick={load} disabled={loading}>
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
            Refresh
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={handleExport} disabled={subscribers.length === 0}>
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="glass-card">
          <CardContent className="flex items-center gap-3 pt-6">
            <Users className="h-8 w-8 text-electric-blue" aria-hidden />
            <div>
              <p className="text-sm text-gray-500">Total subscribers</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{analytics.total}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="flex items-center gap-3 pt-6">
            <Mail className="h-8 w-8 text-green-600" aria-hidden />
            <div>
              <p className="text-sm text-gray-500">Today</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{analytics.todayCount}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="flex items-center gap-3 pt-6">
            <TrendingUp className="h-8 w-8 text-amber-600" aria-hidden />
            <div>
              <p className="text-sm text-gray-500">Last 7 days</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{analytics.last7DaysCount}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="flex items-center gap-3 pt-6">
            <TrendingUp className="h-8 w-8 text-indigo-600" aria-hidden />
            <div>
              <p className="text-sm text-gray-500">Avg per day (30d)</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{analytics.avgDailyLast30}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-base">Subscriber growth</CardTitle>
            <CardDescription>Cumulative total over the last 30 days</CardDescription>
          </CardHeader>
          <CardContent className="h-64">
            {chartGrowth.length === 0 ? (
              <p className="text-sm text-gray-500">No data yet.</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartGrowth}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
                  <XAxis dataKey="label" tick={{ fontSize: 11 }} interval="preserveStartEnd" />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Line type="monotone" dataKey="total" stroke="#0080ff" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-base">Daily signups</CardTitle>
            <CardDescription>New subscriptions per day (last 30 days)</CardDescription>
          </CardHeader>
          <CardContent className="h-64">
            {chartDaily.every((d) => d.count === 0) ? (
              <p className="text-sm text-gray-500">No signups in this period yet.</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartDaily}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
                  <XAxis dataKey="label" tick={{ fontSize: 10 }} interval="preserveStartEnd" />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#0080ff" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="glass-card">
        <CardHeader>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="text-base">Email list</CardTitle>
              <CardDescription>
                {filtered.length} of {subscribers.length} subscriber{subscribers.length === 1 ? '' : 's'}
              </CardDescription>
            </div>
            <div className="relative max-w-xs">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" aria-hidden />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search emails…"
                className="pl-9"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-electric-blue" />
            </div>
          ) : filtered.length === 0 ? (
            <p className="py-8 text-center text-sm text-gray-500">
              {subscribers.length === 0
                ? 'No subscribers yet. They will appear here when someone signs up on /newsletter or the homepage.'
                : 'No emails match your search.'}
            </p>
          ) : (
            <div className="max-h-[420px] overflow-auto rounded-lg border border-gray-200 dark:border-gray-700">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-gray-50 dark:bg-gray-900">
                  <tr className="border-b text-left text-gray-500">
                    <th className="px-4 py-2 font-medium">Email</th>
                    <th className="px-4 py-2 font-medium">Source</th>
                    <th className="px-4 py-2 font-medium">Subscribed</th>
                    <th className="px-4 py-2 w-10" />
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((sub) => (
                    <tr key={sub.id} className="border-b border-gray-100 dark:border-gray-800">
                      <td className="px-4 py-2 font-medium text-gray-900 dark:text-white">{sub.email}</td>
                      <td className="px-4 py-2 text-gray-600 dark:text-gray-300">{sub.source}</td>
                      <td className="px-4 py-2 text-gray-600 dark:text-gray-300">
                        {format(sub.createdAt, 'MMM d, yyyy h:mm a')}
                      </td>
                      <td className="px-4 py-2">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-red-500 hover:text-red-600"
                          onClick={() => handleDelete(sub.id)}
                          disabled={deletingId === sub.id}
                          aria-label="Remove subscriber"
                        >
                          {deletingId === sub.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
