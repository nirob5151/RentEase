import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://zmfqmitijivhyvizovvb.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_JrvaY_nl3q7t32d89GHGsg_Waa8nKE7';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function seedLandlordProfiles() {
  console.log('=== SEEDING VERIFIED LANDLORD PROFILES INTO SUPABASE PROFILES TABLE ===');

  const landlords = [
    {
      id: '22222222-2222-4222-a222-222222222221',
      name: 'Anas Ahmed',
      email: 'anas@rentease.com',
      phone: '+880 1700-000001',
      role: 'landlord',
      avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&h=120&q=80'
    },
    {
      id: '22222222-2222-4222-a222-222222222222',
      name: 'Tanvir Hossain',
      email: 'tanvir@rentease.com',
      phone: '+880 1700-000002',
      role: 'landlord',
      avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&h=120&q=80'
    },
    {
      id: '22222222-2222-4222-a222-222222222223',
      name: 'Mehadi Hasan',
      email: 'mehadi@rentease.com',
      phone: '+880 1712-345678',
      role: 'landlord',
      avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=120&h=120&q=80'
    }
  ];

  const { data: upserted, error: uErr } = await supabase.from('profiles').upsert(landlords).select();

  if (uErr) {
    console.error('Landlord seeding error:', uErr);
  } else {
    console.log('Successfully seeded landlord profiles into Supabase profiles table:\n', JSON.stringify(upserted, null, 2));
  }

  console.log('\n=== AUDITING UPDATED PROFILES COUNTS IN SUPABASE ===');
  const { count: studentCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'student');
  const { count: landlordCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'landlord');

  console.log('Verified Supabase Student Profiles Count:', studentCount);
  console.log('Verified Supabase Landlord Profiles Count:', landlordCount);
}

seedLandlordProfiles();
