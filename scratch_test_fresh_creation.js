import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://zmfqmitijivhyvizovvb.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_JrvaY_nl3q7t32d89GHGsg_Waa8nKE7';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testFreshCreation() {
  console.log('=== TESTING FRESH ROOMMATE PROFILE CREATION ===');

  const freshUser = {
    id: '88888888-8888-4888-a888-888888888888',
    name: 'Fresh Test Student',
    email: 'freshstudent@gmail.com',
    bio: 'Fresh CSE Student looking for room'
  };

  // 1. Ensure user profile exists in profiles table first
  const { data: pData, error: pErr } = await supabase.from('profiles').upsert([{
    id: freshUser.id,
    name: freshUser.name,
    email: freshUser.email,
    role: 'student',
    avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&h=120&q=80'
  }]).select();

  if (pErr) console.error('Profile upsert error:', pErr);
  else console.log('Successfully created user profile in profiles table:', pData);

  // 2. Save roommate profile with student_id payload
  const payload = {
    student_id: freshUser.id,
    name: freshUser.name,
    bio: freshUser.bio,
    budget: 7000,
    cleanliness: 'Tidy',
    gender: 'Female'
  };

  const { data: inserted, error: iErr } = await supabase.from('roommate_profiles').insert([payload]).select();

  if (iErr) {
    console.error('Insert error:', iErr);
  } else {
    console.log('Successfully created fresh roommate profile with student_id:', JSON.stringify(inserted, null, 2));
  }

  // 3. Verify row in roommate_profiles table
  const { data: checkRow } = await supabase.from('roommate_profiles').select('*').eq('student_id', freshUser.id);
  console.log('\n--- VERIFIED ROOMMATE ROW FOR FRESH USER ---');
  console.log(JSON.stringify(checkRow, null, 2));

  // Clean up fresh test user after verification
  await supabase.from('roommate_profiles').delete().eq('student_id', freshUser.id);
  await supabase.from('profiles').delete().eq('id', freshUser.id);
  console.log('\nTest cleanup complete!');
}

testFreshCreation();
