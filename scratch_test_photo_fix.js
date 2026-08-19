import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://zmfqmitijivhyvizovvb.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_JrvaY_nl3q7t32d89GHGsg_Waa8nKE7';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testPhotoFix() {
  console.log('=== TESTING FIXED PROFILE PHOTO UPDATE FOR MR KHAN ===');
  const testEmail = 'kmdnirob72@gmail.com';
  const newAvatarUrl = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80';

  // 1. Update ONLY avatar_url in profiles table
  const { data: updated, error: uErr } = await supabase
    .from('profiles')
    .update({
      avatar_url: newAvatarUrl
    })
    .eq('email', testEmail)
    .select();

  if (uErr) {
    console.error('Update error:', uErr);
  } else {
    console.log('Successfully updated avatar_url in Supabase profiles table:', JSON.stringify(updated, null, 2));
  }

  // 2. Query profiles by email to simulate login (getUserByEmail)
  const { data: loginResult } = await supabase.from('profiles').select('*').ilike('email', testEmail).maybeSingle();
  console.log('\nSimulated Login Fetch (getUserByEmail):', JSON.stringify(loginResult, null, 2));

  const resolvedAvatar = loginResult?.avatar_url || '';
  console.log('\nResolved Avatar upon login:', resolvedAvatar);
  console.log('Does resolved avatar match updated photo?', resolvedAvatar === newAvatarUrl ? '✅ YES!' : '❌ NO');

  // Reset back to original after test
  await supabase.from('profiles').update({ avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&h=120&q=80' }).eq('email', testEmail);
  console.log('\nTest cleanup complete!');
}

testPhotoFix();
