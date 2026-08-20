import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://zmfqmitijivhyvizovvb.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_JrvaY_nl3q7t32d89GHGsg_Waa8nKE7';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testAdminPanelRealData() {
  console.log('=== TESTING REAL SUPABASE ADMIN PANEL CALCULATIONS ===');

  const { data: profiles } = await supabase.from('profiles').select('*');
  const { data: listings } = await supabase.from('listings').select('*');

  const totalUsersCount = profiles?.length || 0;
  const totalStudents = (profiles || []).filter(p => (p.role || '').toLowerCase().includes('student')).length;
  const totalLandlords = (profiles || []).filter(p => (p.role || '').toLowerCase().includes('landlord')).length;

  const totalListings = listings?.length || 0;
  const verifiedListings = (listings || []).filter(l => l.verified !== false).length;
  const verifiedPct = totalListings > 0 ? Math.round((verifiedListings / totalListings) * 100) : 0;

  console.log(`Total Users: ${totalUsersCount} (${totalStudents} Students / ${totalLandlords} Landlords)`);
  console.log(`Total Listings: ${totalListings}, Verified: ${verifiedListings} -> ${verifiedPct}%`);

  // Monthly signup trends
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const monthCounts = {};
  months.forEach(m => monthCounts[m] = 0);

  (profiles || []).forEach(p => {
    if (p.created_at) {
      const d = new Date(p.created_at);
      const mName = months[d.getMonth()];
      monthCounts[mName] = (monthCounts[mName] || 0) + 1;
    }
  });

  console.log('\nReal Monthly Signup Counts from Supabase:');
  console.log(monthCounts);
}

testAdminPanelRealData();
