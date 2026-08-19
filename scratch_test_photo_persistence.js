import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://zmfqmitijivhyvizovvb.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_JrvaY_nl3q7t32d89GHGsg_Waa8nKE7';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testPhotoPersistence() {
  console.log('=== TESTING PROFILE PHOTO PERSISTENCE FOR MR KHAN ===');
  const testEmail = 'kmdnirob72@gmail.com';
  const newAvatarUrl = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80';

  // 1. Check current record in Supabase profiles table
  const { data: before } = await supabase.from('profiles').select('*').eq('email', testEmail);
  console.log('1. Profile in DB before update:\n', JSON.stringify(before, null, 2));

  // 2. Update profile picture in Supabase
  const { data: updated, error: uErr } = await supabase
    .from('profiles')
    .update({
      avatar_url: newAvatarUrl,
      profile_picture: newAvatarUrl
    })
    .eq('email', testEmail)
    .select();

  if (uErr) console.error('Update error:', uErr);
  else console.log('\n2. Profile in DB after update:\n', JSON.stringify(updated, null, 2));

  // 3. Query profiles by email to simulate login (getUserByEmail)
  const { data: loginResult } = await supabase.from('profiles').select('*').ilike('email', testEmail).maybeSingle();
  console.log('\n3. Simulated Login Fetch (getUserByEmail):\n', JSON.stringify(loginResult, null, 2));

  const resolvedAvatar = loginResult?.avatar_url || loginResult?.profile_picture || '';
  console.log('\n4. Resolved Avatar upon login:', resolvedAvatar);
  console.log('Does resolved avatar match updated photo?', resolvedAvatar === newAvatarUrl ? '✅ YES!' : '❌ NO');
}

testPhotoPersistence();
