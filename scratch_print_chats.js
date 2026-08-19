import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://zmfqmitijivhyvizovvb.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_JrvaY_nl3q7t32d89GHGsg_Waa8nKE7';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function printChats() {
  console.log('=== SUPABASE CHATS ROWS ===');
  const { data: chats } = await supabase.from('chats').select('*');
  console.log(JSON.stringify(chats, null, 2));
}

printChats();
