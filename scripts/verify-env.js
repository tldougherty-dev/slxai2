#!/usr/bin/env node

/**
 * Environment Variables Verification Script
 * 
 * This script checks if all required environment variables are set.
 * Run this before deploying to ensure everything is configured correctly.
 * 
 * Usage:
 *   node scripts/verify-env.js
 *   node scripts/verify-env.js --production
 */

const requiredVars = {
  critical: [
    'VITE_SUPABASE_URL',
    'VITE_SUPABASE_ANON_KEY',
    'VITE_RESEND_API_KEY',
  ],
  optional: [
    'VITE_TRANSLATION_API_KEY',
  ]
};

const isProduction = process.argv.includes('--production') || process.env.NODE_ENV === 'production';

console.log('🔍 Checking Environment Variables...\n');
console.log(`Mode: ${isProduction ? 'PRODUCTION' : 'DEVELOPMENT'}\n`);

let hasErrors = false;
let hasWarnings = false;

// Check critical variables
console.log('📋 Critical Variables (Required):');
console.log('─'.repeat(50));

requiredVars.critical.forEach(varName => {
  const value = process.env[varName];
  if (!value || value.trim() === '') {
    console.log(`❌ ${varName}: NOT SET`);
    hasErrors = true;
  } else {
    // Mask sensitive values
    const masked = varName.includes('KEY') || varName.includes('SECRET')
      ? value.substring(0, 8) + '...' + value.substring(value.length - 4)
      : value;
    console.log(`✅ ${varName}: ${masked}`);
  }
});

console.log('\n📋 Optional Variables:');
console.log('─'.repeat(50));

requiredVars.optional.forEach(varName => {
  const value = process.env[varName];
  if (!value || value.trim() === '') {
    console.log(`⚠️  ${varName}: NOT SET (optional but recommended)`);
    hasWarnings = true;
  } else {
    const masked = varName.includes('KEY') || varName.includes('SECRET')
      ? value.substring(0, 8) + '...' + value.substring(value.length - 4)
      : value;
    console.log(`✅ ${varName}: ${masked}`);
  }
});

// Validate format
console.log('\n🔐 Validating Format:');
console.log('─'.repeat(50));

const supabaseUrl = process.env.VITE_SUPABASE_URL;
if (supabaseUrl && !supabaseUrl.startsWith('https://') && !supabaseUrl.startsWith('http://')) {
  console.log(`⚠️  VITE_SUPABASE_URL: Should start with https://`);
  hasWarnings = true;
}

const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
if (supabaseAnonKey && supabaseAnonKey.length < 50) {
  console.log(`⚠️  VITE_SUPABASE_ANON_KEY: Seems too short (expected ~200+ chars)`);
  hasWarnings = true;
}

const resendKey = process.env.VITE_RESEND_API_KEY;
if (resendKey && !resendKey.startsWith('re_')) {
  console.log(`⚠️  VITE_RESEND_API_KEY: Should start with 're_'`);
  hasWarnings = true;
}

// Summary
console.log('\n' + '═'.repeat(50));
if (hasErrors) {
  console.log('❌ FAILED: Critical environment variables are missing!');
  console.log('\nPlease set the following variables:');
  requiredVars.critical.forEach(varName => {
    if (!process.env[varName]) {
      console.log(`  - ${varName}`);
    }
  });
  console.log('\nSee ENVIRONMENT_VARIABLES_SETUP.md for instructions.');
  process.exit(1);
} else if (hasWarnings) {
  console.log('⚠️  WARNING: Some optional variables are missing or have format issues.');
  console.log('The application will work, but some features may be limited.');
  process.exit(0);
} else {
  console.log('✅ SUCCESS: All environment variables are set correctly!');
  process.exit(0);
}

