// Bulk Create Users Script
// Run: npm run create-users   (loads .env via Node --env-file)
// Or:  node --env-file=.env create-users.js

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://vkeuqauhfjgtcjigiymm.supabase.co';
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// All emails from pending member_persons
const emails = [
  'pinky@360magicians.com',
  'sam@accessibilityglobal.com',
  'amirali.rezaei@aisa.solutions',
  'melissa@aslflurry.com',
  'star@aslflurry.com',
  'beryld@dawnsign.com',
  'alieber@bu.edu',
  'wrinella@csdr-cde.ca.gov',
  'joshua.finkle@dhisnyc.com',
  'nnibagwire2000@gmail.com',
  'lee.kezar@gallaudet.edu',
  'tibo@glwmax.com',
  'tiina@glwmax.com',
  'imaginashawn@gmail.com',
  'calvin@gosign.ai',
  'hasan.dikyuva@mpi.nl',
  'maciej.lewandowski@migam.org',
  'pk@migam.org',
  'lucas.soto@mindyourlanguageinc.com',
  'patrick.costello@nfrdct.com',
  'l.whynot@northeastern.edu',
  't.phillips@openmind-sw.de',
  'pault@partnersinterpreting.com',
  'john@pendulum.graphics',
  'darren@sign-ai.co',
  'skarabuklu@ttic.edu',
  'greg@ttic.edu',
  'shelley@truewayasl.com',
  'pamela.macias@colorado.edu'
];

function generatePassword() {
  // Generate a random password: 12 characters + special chars
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%';
  let password = '';
  for (let i = 0; i < 12; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password + 'A1!'; // Ensure it meets password requirements
}

async function createUsers() {
  if (!SERVICE_ROLE_KEY) {
    console.error('❌ ERROR: Set SUPABASE_SERVICE_ROLE_KEY in .env (server secret, not VITE_).');
    console.log('Run: npm run create-users');
    process.exit(1);
  }

  console.log('🚀 Starting user creation...\n');
  console.log(`📧 Creating ${emails.length} users...\n`);

  const results = {
    created: [],
    skipped: [],
    failed: []
  };

  for (let i = 0; i < emails.length; i++) {
    const email = emails[i];
    try {
      const tempPassword = generatePassword();
      
      const { data, error } = await supabase.auth.admin.createUser({
        email: email,
        password: tempPassword,
        email_confirm: true, // Auto-confirm email
      });
      
      if (error) {
        if (error.message.includes('already registered') || error.message.includes('already exists')) {
          console.log(`⏭️  [${i + 1}/${emails.length}] Skipped (exists): ${email}`);
          results.skipped.push({ email, reason: 'Already exists' });
        } else {
          console.error(`❌ [${i + 1}/${emails.length}] Failed: ${email} - ${error.message}`);
          results.failed.push({ email, error: error.message });
        }
      } else {
        console.log(`✅ [${i + 1}/${emails.length}] Created: ${email}`);
        results.created.push({ email, userId: data.user?.id });
      }
      
      // Small delay to avoid rate limits
      if (i < emails.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 300));
      }
    } catch (error) {
      console.error(`❌ [${i + 1}/${emails.length}] Error: ${email} - ${error.message}`);
      results.failed.push({ email, error: error.message });
    }
  }
  
  console.log('\n' + '='.repeat(50));
  console.log('📊 SUMMARY');
  console.log('='.repeat(50));
  console.log(`✅ Created: ${results.created.length}`);
  console.log(`⏭️  Skipped: ${results.skipped.length}`);
  console.log(`❌ Failed: ${results.failed.length}`);
  
  if (results.failed.length > 0) {
    console.log('\n❌ Failed emails:');
    results.failed.forEach(r => {
      console.log(`   - ${r.email}: ${r.error}`);
    });
  }
  
  if (results.created.length > 0) {
    console.log('\n✅ Successfully created users can now log in!');
    console.log('   They should reset their password on first login.');
  }
}

createUsers().catch(console.error);
