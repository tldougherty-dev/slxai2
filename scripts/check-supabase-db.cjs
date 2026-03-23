#!/usr/bin/env node
/**
 * Probe Supabase REST API for missing tables / RPC errors.
 * Run: node --env-file=.env scripts/check-supabase-db.cjs
 *
 * Uses SUPABASE_SERVICE_ROLE_KEY when set (bypasses RLS for accurate checks);
 * otherwise VITE_SUPABASE_ANON_KEY (some failures may be RLS, not missing objects).
 */

const { createClient } = require('@supabase/supabase-js');

const url = process.env.VITE_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const anonKey = process.env.VITE_SUPABASE_ANON_KEY;
const key = serviceKey || anonKey;
const usingServiceRole = Boolean(serviceKey);

const TABLES = [
  'members',
  'member_persons',
  'votes',
  'vote_options',
  'files',
  'videos',
  'file_categories',
  'notifications',
  'waitlist',
  'interest_submissions',
  'bylaws_feedback',
  'feedback_submissions',
  'portal_settings',
  'summit_members',
  'summit_tasks',
  'summit_ticket_reservations',
  'summit_workshop_submissions',
  'summit_sponsor_submissions',
  'channels',
  'messages',
  'message_reactions',
  'thread_replies',
  'feed_posts',
  'feed_post_reactions',
  'feed_post_comments',
  'user_notification_preferences',
  'activities',
  'analytics_events',
  'user_roles',
];

const RPCS = [
  { name: 'get_user_roles', args: { user_emails: ['probe@example.com'] } },
  { name: 'check_is_summit_member', args: { user_email: 'probe@example.com' } },
  { name: 'get_available_ticket_count', args: {} },
  { name: 'get_reserved_ticket_count', args: {} },
  { name: 'get_user_profile_pictures', args: { user_emails: ['probe@example.com'] } },
];

async function main() {
  if (!url || !key) {
    console.error('Missing VITE_SUPABASE_URL or anon/service key. Use: node --env-file=.env scripts/check-supabase-db.cjs');
    process.exit(1);
  }

  console.log('Supabase URL:', url);
  console.log('Key:', usingServiceRole ? 'service role (full table visibility)' : 'anon (RLS may hide tables)');
  console.log('');

  const supabase = createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  let errors = 0;

  console.log('--- Tables (head select) ---');
  for (const table of TABLES) {
    const { error } = await supabase.from(table).select('*', { head: true, count: 'exact' });
    if (error) {
      errors++;
      console.log(`❌ ${table}: ${error.code || 'ERR'} — ${error.message}`);
    } else {
      console.log(`✅ ${table}`);
    }
  }

  console.log('');
  console.log('--- RPCs (smoke) ---');
  for (const { name, args } of RPCS) {
    const { data, error } = await supabase.rpc(name, args);
    if (error) {
      const missing =
        error.code === 'PGRST202' ||
        error.message.includes('Could not find the function');
      if (missing) errors++;
      console.log(
        missing ? `❌ ${name}: ${error.message}` : `⚠️  ${name}: ${error.message}`
      );
    } else {
      const preview = data !== undefined && data !== null ? JSON.stringify(data).slice(0, 100) : 'ok';
      console.log(`✅ ${name}: ${preview}`);
    }
  }

  console.log('');
  if (errors > 0) {
    console.log(`Done with ${errors} error(s) requiring attention.`);
    process.exit(1);
  }
  console.log('Done. No hard errors on table probes.');
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
