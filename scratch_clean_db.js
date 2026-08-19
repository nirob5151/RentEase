import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://zmfqmitijivhyvizovvb.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_JrvaY_nl3q7t32d89GHGsg_Waa8nKE7';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function cleanDb() {
  console.log('--- Deleting legacy/orphaned row 5 by name in Supabase roommate_profiles ---');
  const { data: deleted, error: dErr } = await supabase
    .from('roommate_profiles')
    .delete()
    .eq('name', 'Md Masudur Rahman Nirob');
  
  if (dErr) console.error('Delete error:', dErr);
  else console.log('Successfully deleted row by name');

  const { data: all, error: aErr } = await supabase.from('roommate_profiles').select('*');
  console.log('Current DB state after deletion:', JSON.stringify(all, null, 2));
}

cleanDb();
