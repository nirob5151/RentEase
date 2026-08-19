import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const SUPABASE_URL = 'https://zmfqmitijivhyvizovvb.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_JrvaY_nl3q7t32d89GHGsg_Waa8nKE7';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function inspectFullDb() {
  console.log('=== SUPABASE ROOMMATE PROFILES ===');
  const { data: roommates, error: rErr } = await supabase.from('roommate_profiles').select('*');
  if (rErr) console.error('Roommate profiles error:', rErr);
  else console.log(JSON.stringify(roommates, null, 2));

  console.log('\n=== SUPABASE PROFILES / USERS ===');
  const { data: profiles, error: pErr } = await supabase.from('profiles').select('*');
  if (pErr) console.error('Profiles error:', pErr);
  else console.log(JSON.stringify(profiles, null, 2));

  console.log('\n=== SUPABASE CONVERSATIONS ===');
  const { data: convs, error: cErr } = await supabase.from('conversations').select('*');
  if (cErr) console.error('Conversations error:', cErr);
  else console.log(JSON.stringify(convs, null, 2));

  console.log('\n=== SUPABASE MESSAGES ===');
  const { data: msgs, error: mErr } = await supabase.from('messages').select('*');
  if (mErr) console.error('Messages error:', mErr);
  else console.log(JSON.stringify(msgs, null, 2));
}

inspectFullDb();
