import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://zmfqmitijivhyvizovvb.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_JrvaY_nl3q7t32d89GHGsg_Waa8nKE7';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function auditAdminDashboardData() {
  console.log('====================================================');
  console.log('    REAL SUPABASE POSTGRESQL ADMIN DASHBOARD AUDIT   ');
  console.log('====================================================');

  // 1. PROFILES (Users by Role)
  const { count: studentCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'student');
  const { count: landlordCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'landlord');
  const { count: adminCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'admin');
  const { data: allProfiles } = await supabase.from('profiles').select('id, name, full_name, email, role, created_at');

  console.log('\n--- 1. PROFILES / USER COUNTS ---');
  console.log(`Real Students Count: ${studentCount}`);
  console.log(`Real Landlords Count: ${landlordCount}`);
  console.log(`Real Admins Count: ${adminCount}`);
  console.log('All Profiles in DB:\n', JSON.stringify(allProfiles, null, 2));

  // 2. PENDING APPROVALS / VERIFICATIONS
  const { count: pendingListingsCount } = await supabase.from('listings').select('*', { count: 'exact', head: true }).eq('verified', false);
  const { data: pendingProperties } = await supabase.from('properties').select('*').eq('status', 'pending');
  console.log('\n--- 2. PENDING APPROVALS ---');
  console.log(`Unverified Listings Count: ${pendingListingsCount}`);
  console.log('Pending Properties in DB:\n', JSON.stringify(pendingProperties, null, 2));

  // 3. REPORTS & COMPLAINTS
  const { data: reports, error: rErr } = await supabase.from('reports').select('*');
  console.log('\n--- 3. REPORTS & COMPLAINTS ---');
  if (rErr) console.log('Reports Table Error/Not Existing:', rErr.message);
  else console.log('Reports in DB:\n', JSON.stringify(reports, null, 2));

  // 4. AUDIT LOGS
  const { data: auditLogs, error: aErr } = await supabase.from('audit_logs').select('*').order('created_at', { ascending: false }).limit(10);
  console.log('\n--- 4. AUDIT LOGS ---');
  if (aErr) console.log('Audit Logs Table Error/Not Existing:', aErr.message);
  else console.log('Audit Logs in DB:\n', JSON.stringify(auditLogs, null, 2));

  // 5. LISTINGS & BOOKINGS FOR PROGRESS BARS
  const { data: listings } = await supabase.from('listings').select('id, verified');
  const totalListings = listings?.length || 0;
  const verifiedListings = listings?.filter(l => l.verified !== false).length || 0;
  const verifiedListingsPct = totalListings > 0 ? Math.round((verifiedListings / totalListings) * 100) : 0;

  const { data: bookings } = await supabase.from('bookings').select('id, status');
  const totalBookings = bookings?.length || 0;
  const confirmedBookings = bookings?.filter(b => b.status === 'Confirmed' || b.status === 'approved').length || 0;
  const activeBookingsPct = totalBookings > 0 ? Math.round((confirmedBookings / totalBookings) * 100) : 0;

  console.log('\n--- 6. PROGRESS BAR CALCULATIONS ---');
  console.log(`Total Listings: ${totalListings}, Verified: ${verifiedListings} -> Verified Pct: ${verifiedListingsPct}%`);
  console.log(`Total Bookings: ${totalBookings}, Confirmed: ${confirmedBookings} -> Active Bookings Pct: ${activeBookingsPct}%`);
}

auditAdminDashboardData();
