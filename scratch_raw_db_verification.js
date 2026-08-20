import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://zmfqmitijivhyvizovvb.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_JrvaY_nl3q7t32d89GHGsg_Waa8nKE7';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function runRawVerificationQueries() {
  console.log('=================================================================');
  console.log('       RAW SUPABASE POSTGRESQL LIVE VERIFICATION QUERIES         ');
  console.log('=================================================================\n');

  // QUERY 1: PROFILES BY ROLE
  console.log('--- QUERY 1: PROFILES TABLE (ALL ROWS & ROLE COUNTS) ---');
  const { data: profiles, error: pErr } = await supabase.from('profiles').select('id, name, email, role, created_at');
  
  if (pErr) {
    console.error('Error fetching profiles:', pErr);
  } else {
    console.log('RAW PROFILES DATA:');
    console.log(JSON.stringify(profiles, null, 2));

    const studentRows = (profiles || []).filter(p => (p.role || '').toLowerCase().includes('student'));
    const landlordRows = (profiles || []).filter(p => (p.role || '').toLowerCase().includes('landlord'));
    const adminRows = (profiles || []).filter(p => (p.role || '').toLowerCase().includes('admin'));

    console.log('\nROLE COUNTS SUMMARY:');
    console.log(`- Students (role = 'student'): ${studentRows.length}`);
    console.log(`- Landlords (role = 'landlord'): ${landlordRows.length}`);
    console.log(`- Admins (role = 'admin'): ${adminRows.length}`);
    console.log(`- Total Profiles: ${profiles.length}`);
  }

  // QUERY 2: REPORTS WHERE STATUS = 'open'
  console.log('\n--- QUERY 2: REPORTS TABLE (WHERE status = \'open\') ---');
  const { data: openReports, error: rErr } = await supabase.from('reports').select('*').eq('status', 'open');

  if (rErr) {
    console.log(`Table Status / Error: ${rErr.message} (Code: ${rErr.code})`);
    console.log('RAW OPEN REPORTS DATA: [] (0 rows / Table does not exist in schema cache)');
  } else {
    console.log('RAW OPEN REPORTS DATA:');
    console.log(JSON.stringify(openReports, null, 2));
    console.log(`TOTAL OPEN REPORTS FOUND IN DATABASE: ${openReports?.length || 0}`);
  }

  // QUERY 3: AUDIT_LOGS TABLE
  console.log('\n--- QUERY 3: AUDIT_LOGS TABLE (LIMIT 10) ---');
  const { data: auditLogs, error: aErr } = await supabase.from('audit_logs').select('*').order('created_at', { ascending: false }).limit(10);

  if (aErr) {
    console.log(`Table Status / Error: ${aErr.message} (Code: ${aErr.code})`);
    console.log('RAW AUDIT_LOGS DATA: [] (0 rows / Table does not exist in schema cache)');
  } else {
    console.log('RAW AUDIT_LOGS DATA:');
    console.log(JSON.stringify(auditLogs, null, 2));
    console.log(`TOTAL AUDIT LOG ROWS FOUND IN DATABASE: ${auditLogs?.length || 0}`);
  }
}

runRawVerificationQueries();
