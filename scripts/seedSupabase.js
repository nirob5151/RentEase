import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://zmfqmitijivhyvizovvb.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_JrvaY_nl3q7t32d89GHGsg_Waa8nKE7';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testConnection() {
  console.log('Testing Supabase Cloud Connection...');
  try {
    const { data, error } = await supabase.from('listings').select('*').limit(5);
    if (error) {
      console.log('Table error (tables need creation in Supabase SQL Editor):', error.message);
    } else {
      console.log('Successfully connected to Supabase Cloud! Data count:', data.length);
    }
  } catch (err) {
    console.error('Connection failed:', err.message);
  }
}

testConnection();
