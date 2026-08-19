import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://zmfqmitijivhyvizovvb.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_JrvaY_nl3q7t32d89GHGsg_Waa8nKE7';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function auditRoommates() {
  console.log('=== AUDITING ALL ROOMMATE PROFILES IN SUPABASE ===');
  const { data: roommates, error: rErr } = await supabase.from('roommate_profiles').select('*');
  const { data: profiles, error: pErr } = await supabase.from('profiles').select('*');

  console.log('\n--- ALL PROFILES IN DATABASE ---');
  console.log(JSON.stringify(profiles, null, 2));

  console.log('\n--- ALL ROOMMATE PROFILES IN DATABASE BEFORE FIX ---');
  console.log(JSON.stringify(roommates, null, 2));

  if (roommates && profiles) {
    for (const r of roommates) {
      if (!r.student_id) {
        console.log(`\nFound row with student_id = NULL: ID ${r.id}, Name: ${r.name}`);
        const match = profiles.find(p => p.full_name && p.full_name.toLowerCase().trim() === (r.name || '').toLowerCase().trim());
        if (match) {
          console.log(`Matching user found in profiles: ID ${match.id}, Email: ${match.email}`);
          const { data: updated, error: uErr } = await supabase
            .from('roommate_profiles')
            .update({ student_id: match.id })
            .eq('id', r.id);
          if (uErr) {
            console.error(`Failed to update student_id for row ${r.id}:`, uErr.message);
          } else {
            console.log(`Successfully linked row ${r.id} to user_id ${match.id}`);
          }
        } else {
          console.log(`No matching user profile found for ${r.name}`);
        }
      }
    }
  }

  console.log('\n--- ALL ROOMMATE PROFILES AFTER AUDIT & FIX ---');
  const { data: updatedRoommates } = await supabase.from('roommate_profiles').select('*');
  console.log(JSON.stringify(updatedRoommates, null, 2));
}

auditRoommates();
