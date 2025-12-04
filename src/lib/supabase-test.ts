// Quick test to verify Supabase connection
// Run this in browser console: import { testSupabaseConnection } from '@/lib/supabase-test'; testSupabaseConnection();

import { supabase } from './supabase';

export async function testSupabaseConnection() {
  console.log('Testing Supabase connection...');
  
  try {
    // Test basic connection
    const { data, error } = await supabase.from('members').select('count').limit(1);
    
    if (error) {
      console.error('❌ Supabase connection error:', error.message);
      console.log('💡 Make sure you have:');
      console.log('   1. Created the database tables (run supabase-schema.sql)');
      console.log('   2. Set up your .env file correctly');
      return false;
    }
    
    console.log('✅ Supabase connection successful!');
    console.log('📊 Data:', data);
    return true;
  } catch (err) {
    console.error('❌ Connection failed:', err);
    return false;
  }
}

