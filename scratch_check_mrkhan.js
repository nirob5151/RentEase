import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://zmfqmitijivhyvizovvb.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_JrvaY_nl3q7t32d89GHGsg_Waa8nKE7';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function inspectMRKhan() {
  console.log('=== PROFILES / USERS TABLE FOR MR KHAN ===');
  const { data: profiles, error: pErr } = await supabase.from('profiles').select('*');
  if (pErr) console.error('Profiles err:', pErr);
  else console.log(JSON.stringify(profiles, null, 2));

  console.log('\n=== ROOMMATE PROFILES TABLE ===');
  const { data: roommates, error: rErr } = await supabase.from('roommate_profiles').select('*');
  if (rErr) console.error('Roommates err:', rErr);
  else console.log(JSON.stringify(roommates, null, 2));
}

inspectMRKhan();
