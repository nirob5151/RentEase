import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://zmfqmitijivhyvizovvb.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_JrvaY_nl3q7t32d89GHGsg_Waa8nKE7';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testLiveAvatarSync() {
  console.log('=== TESTING SUPABASE-BACKED LIVE AVATAR RESOLUTION ===');
  
  const targetEmail = 'kmdnirob72@gmail.com';
  const newAvatarUrl = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80';

  // 1. Update avatar in Supabase profiles
  await supabase.from('profiles').update({ avatar_url: newAvatarUrl }).eq('email', targetEmail);

  // 2. Fetch all user profiles from Supabase to simulate Messaging.jsx liveAvatars map
  const { data: profiles } = await supabase.from('profiles').select('email, avatar_url, name');
  const avatarMap = {};
  profiles.forEach(p => {
    if (p.email && p.avatar_url) avatarMap[p.email.toLowerCase().trim()] = p.avatar_url;
  });

  console.log('Live Avatars Map fetched from Supabase:\n', JSON.stringify(avatarMap, null, 2));

  const resolved = avatarMap[targetEmail];
  console.log(`\nResolved live avatar for ${targetEmail}:`, resolved);
  console.log('Is resolved avatar equal to updated photo?', resolved === newAvatarUrl ? '✅ YES!' : '❌ NO');

  // Reset back after test
  await supabase.from('profiles').update({ avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&h=120&q=80' }).eq('email', targetEmail);
  console.log('\nTest cleanup complete!');
}

testLiveAvatarSync();
