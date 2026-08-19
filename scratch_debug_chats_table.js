import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://zmfqmitijivhyvizovvb.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_JrvaY_nl3q7t32d89GHGsg_Waa8nKE7';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function debugChatsTable() {
  console.log('=== 1. CHATS TABLE IN SUPABASE ===');
  const { data: chats, error: cErr } = await supabase.from('chats').select('*');
  if (cErr) console.error('Chats err:', cErr);
  else console.log('Chats rows:\n', JSON.stringify(chats, null, 2));

  console.log('\n=== 2. ROOMMATE PROFILES TABLE IN SUPABASE ===');
  const { data: roommates } = await supabase.from('roommate_profiles').select('*');
  console.log('Roommates rows:\n', JSON.stringify(roommates, null, 2));

  console.log('\n=== 3. ALL PROFILES IN SUPABASE ===');
  const { data: profiles } = await supabase.from('profiles').select('*');
  console.log('Profiles rows:\n', JSON.stringify(profiles, null, 2));
}

debugChatsTable();
