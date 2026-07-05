// Wipe all SLxAI Academy rows from Supabase (workshops, submissions, registrations, etc.)
// Run: node --env-file=.env scripts/reset-academy-data.cjs

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://vkeuqauhfjgtcjigiymm.supabase.co';
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const TABLES_IN_ORDER = [
  'academy_email_logs',
  'academy_registrations',
  'academy_workshop_resources',
  'academy_workshops',
  'academy_workshop_submissions',
  'academy_presenters',
  'academy_categories',
];

async function clearTable(supabase, table) {
  const { error, count } = await supabase
    .from(table)
    .delete({ count: 'exact' })
    .neq('id', '00000000-0000-0000-0000-000000000000');

  if (error) {
    if (error.code === '42P01') {
      console.log(`  skip ${table} (table does not exist)`);
      return 0;
    }
    throw new Error(`${table}: ${error.message}`);
  }
  return count ?? 0;
}

async function main() {
  if (!SERVICE_ROLE_KEY) {
    console.error('Set SUPABASE_SERVICE_ROLE_KEY in .env');
    process.exit(1);
  }

  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  console.log('Resetting Academy data...\n');
  let total = 0;

  for (const table of TABLES_IN_ORDER) {
    const deleted = await clearTable(supabase, table);
    console.log(`  ${table}: ${deleted} row(s) deleted`);
    total += deleted;
  }

  console.log(`\nDone. ${total} total row(s) removed.`);
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
