import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://zmfqmitijivhyvizovvb.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_JrvaY_nl3q7t32d89GHGsg_Waa8nKE7';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function auditUsersStore() {
  console.log('=== 1. SUPABASE PROFILES TABLE RECORDS ===');
  const { data: profiles, error: pErr } = await supabase.from('profiles').select('*');
  if (pErr) console.error('Profiles err:', pErr);
  else console.log(JSON.stringify(profiles, null, 2));

  console.log('\n=== 2. COUNT BY ROLE IN SUPABASE PROFILES ===');
  const { count: studentCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'student');
  const { count: landlordCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'landlord');
  const { count: adminCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'admin');

  console.log('Supabase Student Profiles Count:', studentCount);
  console.log('Supabase Landlord Profiles Count:', landlordCount);
  console.log('Supabase Admin Profiles Count:', adminCount);
}

auditUsersStore();
