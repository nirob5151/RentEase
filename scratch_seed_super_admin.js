import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://zmfqmitijivhyvizovvb.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_JrvaY_nl3q7t32d89GHGsg_Waa8nKE7';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function addSuperAdminAccount() {
  console.log('=== ADDING/UPDATING SUPER ADMIN ACCOUNT IN SUPABASE ===');

  const superAdminObj = {
    id: '99999999-9999-4999-a999-999999999999',
    email: 'renteasy.web@gmail.com',
    name: 'Super Admin (Root)',
    phone: '+880 1900-112233',
    role: 'admin',
    avatar_url: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=120&h=120&q=80',
    created_at: new Date().toISOString()
  };

  const { data, error } = await supabase.from('profiles').upsert([superAdminObj], { onConflict: 'email' }).select();

  if (error) {
    console.error('Error upserting Super Admin in Supabase profiles:', error);
  } else {
    console.log('Successfully upserted Super Admin account in Supabase profiles:');
    console.log(JSON.stringify(data, null, 2));
  }
}

addSuperAdminAccount();
