#!/usr/bin/env node

/**
 * Environment Variables Verification Script
 *
 * Usage:
 *   node scripts/verify-env.js
 *   node scripts/verify-env.js --production
 */

const criticalVars = ['VITE_SUPABASE_URL', 'VITE_SUPABASE_ANON_KEY'];

const sesRequired = ['AWS_ACCESS_KEY_ID', 'AWS_SECRET_ACCESS_KEY'];

const optionalVars = [
  'AWS_REGION',
  'SES_FROM_EMAIL',
  'VITE_TRANSLATION_API_KEY',
];

const isProduction =
  process.argv.includes('--production') || process.env.NODE_ENV === 'production';

console.log('🔍 Checking Environment Variables...\n');
console.log(`Mode: ${isProduction ? 'PRODUCTION' : 'DEVELOPMENT'}\n`);

let hasErrors = false;
let hasWarnings = false;

function mask(varName, value) {
  if (!value) return '';
  if (
    varName.includes('KEY') ||
    varName.includes('SECRET') ||
    varName.includes('PASSWORD')
  ) {
    return value.substring(0, 8) + '...' + value.substring(value.length - 4);
  }
  return value;
}

console.log('📋 Critical (app + Supabase):');
console.log('─'.repeat(50));

criticalVars.forEach((varName) => {
  const value = process.env[varName];
  if (!value || value.trim() === '') {
    console.log(`❌ ${varName}: NOT SET`);
    hasErrors = true;
  } else {
    console.log(`✅ ${varName}: ${mask(varName, value)}`);
  }
});

console.log('\n📋 Amazon SES (server /api/send-email — set in Vercel, not VITE_*):');
console.log('─'.repeat(50));
console.log('   Region defaults to us-east-1 (same as SES SMTP email-smtp.us-east-1.amazonaws.com).');
console.log('─'.repeat(50));

sesRequired.forEach((varName) => {
  const value = process.env[varName];
  if (!value || value.trim() === '') {
    const label = isProduction ? '❌' : '⚠️ ';
    console.log(
      `${label} ${varName}: NOT SET${isProduction ? ' (required for production email)' : ''}`
    );
    if (isProduction) {
      hasErrors = true;
    } else {
      hasWarnings = true;
    }
  } else {
    console.log(`✅ ${varName}: ${mask(varName, value)}`);
  }
});

console.log('\n📋 Optional:');
console.log('─'.repeat(50));

optionalVars.forEach((varName) => {
  const value = process.env[varName];
  if (!value || value.trim() === '') {
    console.log(`⚠️  ${varName}: NOT SET`);
    if (varName === 'AWS_REGION') {
      console.log('     (api/send-email defaults to us-east-1)');
    }
    hasWarnings = true;
  } else {
    console.log(`✅ ${varName}: ${mask(varName, value)}`);
  }
});

console.log('\n🔐 Validating format:');
console.log('─'.repeat(50));

const supabaseUrl = process.env.VITE_SUPABASE_URL;
if (
  supabaseUrl &&
  !supabaseUrl.startsWith('https://') &&
  !supabaseUrl.startsWith('http://')
) {
  console.log(`⚠️  VITE_SUPABASE_URL: Should start with https://`);
  hasWarnings = true;
}

const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
if (supabaseAnonKey && supabaseAnonKey.length < 50) {
  console.log(`⚠️  VITE_SUPABASE_ANON_KEY: Seems too short (expected ~200+ chars)`);
  hasWarnings = true;
}

console.log('\n' + '═'.repeat(50));
if (hasErrors) {
  console.log('❌ FAILED: Required environment variables are missing!');
  console.log('\nSet Supabase vars for the Vite app; set AWS_* for the email API on your host.');
  process.exit(1);
}
if (hasWarnings) {
  console.log(
    '⚠️  WARNING: Some variables are missing or have format issues (OK for local dev without email).'
  );
  process.exit(0);
}
console.log('✅ SUCCESS: All checked environment variables are set correctly!');
process.exit(0);
