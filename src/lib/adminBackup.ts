/**
 * Full portal data backup for admins: downloads a JSON snapshot of Supabase tables
 * the admin client can read (subject to RLS).
 */
import { supabase } from '@/lib/supabase';

const PAGE_SIZE = 1000;

/** Tables to include in a full backup (public schema). Order matters only for readability. */
export const BACKUP_TABLES = [
  'portal_settings',
  'members',
  'member_persons',
  'user_roles',
  'votes',
  'vote_options',
  'file_categories',
  'files',
  'videos',
  'notifications',
  'user_notification_preferences',
  'activities',
  'feed_posts',
  'feed_post_reactions',
  'feed_post_comments',
  'channels',
  'messages',
  'message_reactions',
  'thread_replies',
  'analytics_events',
  'summit_members',
  'summit_tasks',
  'summit_workshop_submissions',
  'summit_sponsor_submissions',
  'summit_ticket_reservations',
  'interest_submissions',
  'feedback_submissions',
  'bylaws_feedback',
  'signal_newsletters',
  'waitlist',
] as const;

export type BackupTableName = (typeof BACKUP_TABLES)[number];

export interface TableBackupResult {
  table: string;
  rowCount: number;
  rows?: unknown[];
  error?: string;
}

async function fetchPage(
  table: string,
  offset: number,
  orderColumn: 'id' | 'created_at' | null
): Promise<{ data: unknown[] | null; error: { message: string } | null }> {
  let q = supabase.from(table).select('*');

  if (orderColumn) {
    q = q.order(orderColumn, { ascending: true });
  }

  return q.range(offset, offset + PAGE_SIZE - 1);
}

async function fetchTableRows(table: string): Promise<{ rows: unknown[]; error?: string }> {
  const rows: unknown[] = [];
  let offset = 0;

  /** Try stable pagination: id → created_at → unordered (last resort only). */
  let order: 'id' | 'created_at' | null = 'id';
  let firstPage = true;

  for (;;) {
    let { data, error } = await fetchPage(table, offset, order);

    if (error && firstPage && order === 'id') {
      const { data: d2, error: e2 } = await fetchPage(table, offset, 'created_at');
      if (!e2) {
        order = 'created_at';
        data = d2;
        error = null;
      }
    }
    if (error && firstPage && order !== null) {
      const { data: d3, error: e3 } = await fetchPage(table, offset, null);
      if (!e3) {
        order = null;
        data = d3;
        error = null;
      }
    }

    if (error) {
      return { rows: [], error: error.message || String(error) };
    }

    firstPage = false;

    if (!data?.length) {
      break;
    }

    rows.push(...data);

    if (data.length < PAGE_SIZE) {
      break;
    }

    offset += PAGE_SIZE;
  }

  return { rows };
}

export async function collectAdminBackupData(): Promise<{
  exportedAt: string;
  version: number;
  tables: TableBackupResult[];
}> {
  const exportedAt = new Date().toISOString();
  const tables: TableBackupResult[] = [];

  for (const table of BACKUP_TABLES) {
    const { rows, error } = await fetchTableRows(table);
    if (error) {
      tables.push({ table, rowCount: 0, error });
    } else {
      tables.push({ table, rowCount: rows.length, rows });
    }
  }

  return {
    exportedAt,
    version: 1,
    tables,
  };
}

export function triggerBackupDownload(payload: Awaited<ReturnType<typeof collectAdminBackupData>>): void {
  const jsonContent = JSON.stringify(payload, null, 2);
  const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
  const stamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const filename = `slxai-portal-backup-${stamp}.json`;

  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
