import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://zmfqmitijivhyvizovvb.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_JrvaY_nl3q7t32d89GHGsg_Waa8nKE7';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function debugChatHeaderName() {
  console.log('=== STEP 1: PROFILES RECORD FOR MR KHAN AND NIROB ===');
  const { data: profiles } = await supabase.from('profiles').select('*').in('email', ['kmdnirob72@gmail.com', 'nirob5151@gmail.com']);
  console.log('Profiles:\n', JSON.stringify(profiles, null, 2));

  console.log('\n=== STEP 2: RAW MESSAGES / CONVERSATIONS IN SUPABASE ===');
  const { data: messages } = await supabase.from('messages').select('*');
  console.log('All Messages in DB:\n', JSON.stringify(messages, null, 2));

  const { data: conversations } = await supabase.from('conversations').select('*');
  console.log('All Conversations in DB:\n', JSON.stringify(conversations, null, 2));
}

debugChatHeaderName();
