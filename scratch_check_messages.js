import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://zmfqmitijivhyvizovvb.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_JrvaY_nl3q7t32d89GHGsg_Waa8nKE7';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function inspectDb() {
  console.log('=== CONVERSATIONS TABLE ===');
  const { data: conversations, error: cErr } = await supabase.from('conversations').select('*');
  if (cErr) console.error('Conversations err:', cErr);
  else console.log(JSON.stringify(conversations, null, 2));

  console.log('\n=== MESSAGES TABLE ===');
  const { data: messages, error: mErr } = await supabase.from('messages').select('*');
  if (mErr) console.error('Messages err:', mErr);
  else console.log(JSON.stringify(messages, null, 2));

  console.log('\n=== ROOMMATE PROFILES TABLE ===');
  const { data: roommates, error: rErr } = await supabase.from('roommate_profiles').select('*');
  if (rErr) console.error('Roommates err:', rErr);
  else console.log(JSON.stringify(roommates, null, 2));
}

inspectDb();
