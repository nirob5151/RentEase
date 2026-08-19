import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://zmfqmitijivhyvizovvb.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_JrvaY_nl3q7t32d89GHGsg_Waa8nKE7';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function cleanRoommateProfiles() {
  console.log('=== 1. LIVE QUERY BEFORE CLEANUP ===');
  const { data: beforeRows, error: bErr } = await supabase.from('roommate_profiles').select('*');
  if (bErr) console.error('Error fetching rows:', bErr);
  else console.log('Rows count before cleanup:', beforeRows.length, '\nRows:\n', JSON.stringify(beforeRows, null, 2));

  console.log('\n=== 2. DELETING ORPHANED SEED ROW (Tanvir Hossain) ===');
  const { data: deleted, error: dErr } = await supabase
    .from('roommate_profiles')
    .delete()
    .eq('name', 'Tanvir Hossain');

  if (dErr) console.error('Delete error:', dErr);
  else console.log('Successfully executed delete query for Tanvir Hossain!');

  console.log('\n=== 3. LIVE QUERY AFTER CLEANUP ===');
  const { data: afterRows, error: aErr } = await supabase.from('roommate_profiles').select('*');
  if (aErr) console.error('Error fetching after rows:', aErr);
  else console.log('Rows count after cleanup:', afterRows.length, '\nRows:\n', JSON.stringify(afterRows, null, 2));

  console.log('\n=== 4. ACTIVE DISCOVERABLE ROOMMATE COUNT ===');
  const activeCount = afterRows.filter(r => r && r.is_active !== false).length;
  console.log('Active discoverable roommate profiles count:', activeCount);
}

cleanRoommateProfiles();
