import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://zmfqmitijivhyvizovvb.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_JrvaY_nl3q7t32d89GHGsg_Waa8nKE7';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function auditAndCleanupFakeLandlords() {
  console.log('=== 1. AUDITING SEEDED LANDLORD ACCOUNTS IN SUPABASE PROFILES ===');
  const fakeEmails = ['anas@rentease.com', 'tanvir@rentease.com', 'mehadi@rentease.com'];

  const { data: fakeProfiles } = await supabase.from('profiles').select('*').in('email', fakeEmails);
  console.log('Seeded Fake Landlord Rows:\n', JSON.stringify(fakeProfiles, null, 2));

  const fakeIds = (fakeProfiles || []).map(p => p.id);

  console.log('\n=== 2. CHECKING DOWNSTREAM REFERENCES ===');
  
  // Check Listings
  const { data: linkedListings } = await supabase.from('listings').select('id, title').in('landlord_id', fakeIds);
  console.log('Listings linked to fake landlord IDs:', JSON.stringify(linkedListings, null, 2));

  // Check Bookings
  const { data: linkedBookings } = await supabase.from('bookings').select('*').in('landlord_id', fakeIds);
  console.log('Bookings linked to fake landlord IDs:', JSON.stringify(linkedBookings, null, 2));

  // Check Messages
  const { data: linkedMessages } = await supabase.from('messages').select('*').or(`sender_email.in.(${fakeEmails.join(',')}),recipient_email.in.(${fakeEmails.join(',')})`);
  console.log('Messages linked to fake landlord emails:', JSON.stringify(linkedMessages, null, 2));

  console.log('\n=== 3. DELETING FAKE SEEDED LANDLORD ACCOUNTS ===');
  const { data: deleted, error: dErr } = await supabase.from('profiles').delete().in('email', fakeEmails).select();

  if (dErr) {
    console.error('Delete error:', dErr);
  } else {
    console.log('Successfully deleted fake landlord profile rows:', JSON.stringify(deleted, null, 2));
  }

  console.log('\n=== 4. AUDITING CLEAN REAL DATABASE STATS ===');
  const { count: realStudentCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'student');
  const { count: realLandlordCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'landlord');
  const { count: realListingsCount } = await supabase.from('listings').select('*', { count: 'exact', head: true });
  const { count: realRoommatesCount } = await supabase.from('roommate_profiles').select('*', { count: 'exact', head: true });

  console.log('REAL Active Students Count in Supabase:', realStudentCount);
  console.log('REAL Trusted Landlords Count in Supabase:', realLandlordCount);
  console.log('REAL Verified Listings Count in Supabase:', realListingsCount);
  console.log('REAL Roommate Profiles Count in Supabase:', realRoommatesCount);
}

auditAndCleanupFakeLandlords();
