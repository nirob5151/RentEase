import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://zmfqmitijivhyvizovvb.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_JrvaY_nl3q7t32d89GHGsg_Waa8nKE7';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function checkLiveStats() {
  console.log('=== 1. LIVE SUPABASE DB COUNTS ===');
  const { count: lCount } = await supabase.from('listings').select('*', { count: 'exact', head: true });
  const { count: sCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'student');
  const { count: ldCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'landlord');
  const { count: rCount } = await supabase.from('roommate_profiles').select('*', { count: 'exact', head: true });

  console.log('Supabase Listings Count:', lCount);
  console.log('Supabase Students Count:', sCount);
  console.log('Supabase Landlords Count:', ldCount);
  console.log('Supabase Roommate Profiles Count:', rCount);

  console.log('\n=== 2. DETAILED SUPABASE PROFILES ===');
  const { data: profiles } = await supabase.from('profiles').select('*');
  console.log(JSON.stringify(profiles, null, 2));

  console.log('\n=== 3. DETAILED SUPABASE LISTINGS ===');
  const { data: listings } = await supabase.from('listings').select('*');
  console.log(JSON.stringify(listings, null, 2));
}

checkLiveStats();
