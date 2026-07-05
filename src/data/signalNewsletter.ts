import { supabase } from '@/lib/supabase';
import {
  EMPTY_SIGNAL_CONTENT,
  type SignalNewsletter,
  type SignalNewsletterContent,
  type SignalNewsletterStatus,
  slugifyNewsletterTitle,
} from '@/lib/signalNewsletterTemplate';

type Row = {
  id: string;
  slug: string;
  title: string;
  issue_number: number | null;
  status: SignalNewsletterStatus;
  scheduled_at: string | null;
  published_at: string | null;
  content: Partial<SignalNewsletterContent> | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

function mapRow(row: Row): SignalNewsletter {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    issueNumber: row.issue_number,
    status: row.status,
    scheduledAt: row.scheduled_at ? new Date(row.scheduled_at) : null,
    publishedAt: row.published_at ? new Date(row.published_at) : null,
    content: { ...EMPTY_SIGNAL_CONTENT, ...(row.content ?? {}) },
    createdBy: row.created_by,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  };
}

function mergeContent(content: SignalNewsletterContent): SignalNewsletterContent {
  return { ...EMPTY_SIGNAL_CONTENT, ...content };
}

export async function promoteDueScheduledNewsletters(): Promise<void> {
  const now = new Date().toISOString();
  await supabase
    .from('signal_newsletters')
    .update({ status: 'published', published_at: now, updated_at: now })
    .eq('status', 'scheduled')
    .lte('scheduled_at', now);
}

export async function listAllNewsletters(): Promise<SignalNewsletter[]> {
  await promoteDueScheduledNewsletters();
  const { data, error } = await supabase
    .from('signal_newsletters')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data as Row[]).map(mapRow);
}

export async function listPublishedNewsletters(): Promise<SignalNewsletter[]> {
  await promoteDueScheduledNewsletters();
  const { data, error } = await supabase
    .from('signal_newsletters')
    .select('*')
    .eq('status', 'published')
    .order('published_at', { ascending: false });

  if (error) throw error;
  return (data as Row[]).map(mapRow);
}

export async function getNewsletterBySlug(slug: string): Promise<SignalNewsletter | null> {
  await promoteDueScheduledNewsletters();
  const { data, error } = await supabase
    .from('signal_newsletters')
    .select('*')
    .eq('slug', slug)
    .eq('status', 'published')
    .maybeSingle();

  if (error) throw error;
  return data ? mapRow(data as Row) : null;
}

export async function getNewsletterById(id: string): Promise<SignalNewsletter | null> {
  const { data, error } = await supabase.from('signal_newsletters').select('*').eq('id', id).maybeSingle();
  if (error) throw error;
  return data ? mapRow(data as Row) : null;
}

async function uniqueSlug(base: string, excludeId?: string): Promise<string> {
  const candidate = base || 'issue';
  let attempt = 0;
  while (attempt < 50) {
    const testSlug = attempt === 0 ? candidate : `${candidate}-${attempt + 1}`;
    const { data } = await supabase.from('signal_newsletters').select('id').eq('slug', testSlug).maybeSingle();
    if (!data || (excludeId && data.id === excludeId)) return testSlug;
    attempt += 1;
  }
  return `${candidate}-${Date.now()}`;
}

export type SaveNewsletterInput = {
  id?: string;
  title: string;
  issueNumber?: number | null;
  content: SignalNewsletterContent;
  status?: SignalNewsletterStatus;
  scheduledAt?: Date | null;
};

export async function saveNewsletter(input: SaveNewsletterInput): Promise<SignalNewsletter> {
  const content = mergeContent(input.content);
  const baseSlug = slugifyNewsletterTitle(input.title) || 'signal-issue';
  const now = new Date().toISOString();

  if (input.id) {
    const slug = await uniqueSlug(baseSlug, input.id);
    const payload: Record<string, unknown> = {
      title: input.title.trim(),
      slug,
      issue_number: input.issueNumber ?? null,
      content,
      updated_at: now,
    };
    if (input.status) payload.status = input.status;
    if (input.scheduledAt !== undefined) payload.scheduled_at = input.scheduledAt?.toISOString() ?? null;
    if (input.status === 'published') payload.published_at = now;

    const { data, error } = await supabase
      .from('signal_newsletters')
      .update(payload)
      .eq('id', input.id)
      .select('*')
      .single();

    if (error) throw error;
    return mapRow(data as Row);
  }

  const slug = await uniqueSlug(baseSlug);
  const { data: userData } = await supabase.auth.getUser();
  const { data, error } = await supabase
    .from('signal_newsletters')
    .insert({
      title: input.title.trim(),
      slug,
      issue_number: input.issueNumber ?? null,
      content,
      status: input.status ?? 'draft',
      scheduled_at: input.scheduledAt?.toISOString() ?? null,
      published_at: input.status === 'published' ? now : null,
      created_by: userData.user?.id ?? null,
      updated_at: now,
    })
    .select('*')
    .single();

  if (error) throw error;
  return mapRow(data as Row);
}

export async function publishNewsletter(id: string): Promise<SignalNewsletter> {
  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from('signal_newsletters')
    .update({ status: 'published', published_at: now, scheduled_at: null, updated_at: now })
    .eq('id', id)
    .select('*')
    .single();

  if (error) throw error;
  return mapRow(data as Row);
}

export async function scheduleNewsletter(id: string, scheduledAt: Date): Promise<SignalNewsletter> {
  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from('signal_newsletters')
    .update({ status: 'scheduled', scheduled_at: scheduledAt.toISOString(), updated_at: now })
    .eq('id', id)
    .select('*')
    .single();

  if (error) throw error;
  return mapRow(data as Row);
}

export async function deleteNewsletter(id: string): Promise<void> {
  const { error } = await supabase.from('signal_newsletters').delete().eq('id', id);
  if (error) throw error;
}
