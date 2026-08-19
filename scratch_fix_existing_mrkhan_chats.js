import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://zmfqmitijivhyvizovvb.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_JrvaY_nl3q7t32d89GHGsg_Waa8nKE7';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function fixMrKhanChats() {
  console.log('=== FIXING EXISTING MR KHAN CONVERSATIONS ===');
  
  // 1. Fetch MR Khan's profile to get exact UUID & Email
  const { data: profiles } = await supabase.from('profiles').select('*').eq('full_name', 'MR Khan');
  console.log('MR Khan profile in Supabase:', profiles);

  const mrKhanUser = profiles?.[0] || {
    id: '11111111-1111-4111-a111-787166563441',
    email: 'kmdnirob72@gmail.com',
    full_name: 'MR Khan',
    avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&h=120&q=80'
  };

  // 2. Check roommate profile table
  const { data: roommate } = await supabase.from('roommate_profiles').select('*').eq('name', 'MR Khan');
  console.log('MR Khan roommate profile in Supabase:', roommate);

  // Update roommate profile student_id if null
  if (roommate && roommate.length > 0) {
    await supabase.from('roommate_profiles').update({
      student_id: mrKhanUser.id
    }).eq('id', roommate[0].id);
    console.log('Updated MR Khan roommate_profiles student_id to:', mrKhanUser.id);
  }

  console.log('Finished DB verification!');
}

fixMrKhanChats();
