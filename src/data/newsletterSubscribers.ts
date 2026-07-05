import { format, startOfDay, subDays, addDays } from 'date-fns';
import { supabase } from '@/lib/supabase';

export type NewsletterSubscriber = {
  id: string;
  email: string;
  source: string;
  createdAt: Date;
};

export type SubscriberDailyCount = {
  date: string;
  count: number;
};

export type SubscriberCumulativePoint = {
  date: string;
  total: number;
};

export type NewsletterSubscriberAnalytics = {
  total: number;
  todayCount: number;
  last7DaysCount: number;
  last30DaysCount: number;
  avgDailyLast30: number;
  dailySignups: SubscriberDailyCount[];
  cumulativeGrowth: SubscriberCumulativePoint[];
};

type Row = {
  id: string;
  email: string;
  source: string;
  created_at: string;
};

function mapRow(row: Row): NewsletterSubscriber {
  return {
    id: row.id,
    email: row.email,
    source: row.source,
    createdAt: new Date(row.created_at),
  };
}

export async function subscribeNewsletter(
  email: string,
  source = 'public',
): Promise<'subscribed' | 'already_subscribed'> {
  const normalized = email.trim().toLowerCase();
  const { error } = await supabase.from('newsletter_subscribers').insert({
    email: normalized,
    source,
  });

  if (error) {
    if (error.code === '23505') return 'already_subscribed';
    throw error;
  }
  return 'subscribed';
}

export async function listNewsletterSubscribers(): Promise<NewsletterSubscriber[]> {
  const { data, error } = await supabase
    .from('newsletter_subscribers')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data as Row[]).map(mapRow);
}

export async function deleteNewsletterSubscriber(id: string): Promise<void> {
  const { error } = await supabase.from('newsletter_subscribers').delete().eq('id', id);
  if (error) throw error;
}

export function buildSubscriberAnalytics(
  subscribers: NewsletterSubscriber[],
  chartDays = 30,
): NewsletterSubscriberAnalytics {
  const now = startOfDay(new Date());
  const todayKey = format(now, 'yyyy-MM-dd');
  const chartStart = subDays(now, chartDays - 1);

  const dailyMap = new Map<string, number>();
  for (let i = 0; i < chartDays; i++) {
    dailyMap.set(format(subDays(now, chartDays - 1 - i), 'yyyy-MM-dd'), 0);
  }

  let todayCount = 0;
  let last7DaysCount = 0;
  let last30DaysCount = 0;

  for (const sub of subscribers) {
    const day = startOfDay(sub.createdAt);
    const key = format(day, 'yyyy-MM-dd');
    if (dailyMap.has(key)) {
      dailyMap.set(key, (dailyMap.get(key) ?? 0) + 1);
    }
    if (key === todayKey) todayCount += 1;
    if (day >= subDays(now, 6)) last7DaysCount += 1;
    if (day >= subDays(now, 29)) last30DaysCount += 1;
  }

  const dailySignups = Array.from(dailyMap.entries()).map(([date, count]) => ({ date, count }));
  const avgDailyLast30 = dailySignups.reduce((sum, d) => sum + d.count, 0) / chartDays;

  const sorted = [...subscribers].sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  const cumulativeGrowth: SubscriberCumulativePoint[] = [];
  const subsByDay = new Map<string, number>();
  for (const sub of sorted) {
    const key = format(startOfDay(sub.createdAt), 'yyyy-MM-dd');
    subsByDay.set(key, (subsByDay.get(key) ?? 0) + 1);
  }

  let running = sorted.filter((s) => startOfDay(s.createdAt) < chartStart).length;
  let cursor = chartStart;
  while (cursor <= now) {
    const key = format(cursor, 'yyyy-MM-dd');
    running += subsByDay.get(key) ?? 0;
    cumulativeGrowth.push({ date: key, total: running });
    cursor = addDays(cursor, 1);
  }

  return {
    total: subscribers.length,
    todayCount,
    last7DaysCount,
    last30DaysCount,
    avgDailyLast30: Math.round(avgDailyLast30 * 10) / 10,
    dailySignups,
    cumulativeGrowth,
  };
}
