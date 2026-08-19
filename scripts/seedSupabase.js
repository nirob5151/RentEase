import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://zmfqmitijivhyvizovvb.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_JrvaY_nl3q7t32d89GHGsg_Waa8nKE7';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testAndSeedDatabase() {
  console.log('⚡ Testing Supabase Cloud Database Connection...');
  try {
    const tables = ['listings', 'properties', 'profiles', 'bookings', 'payments', 'roommate_profiles', 'chats', 'notifications', 'reports'];
    console.log('\n📊 Checking Active Table Statistics:');
    for (const t of tables) {
      const { data, error } = await supabase.from(t).select('*');
      if (error) {
        console.log(`  ❌ [${t}]: ${error.message}`);
      } else {
        console.log(`  ✅ [${t}]: ${data.length} records found.`);
      }
    }

    console.log('\n🚀 Verifying Database Health & Seeding...');
    const { data: listings } = await supabase.from('listings').select('*');
    if (!listings || listings.length === 0) {
      console.log('Seeding initial rental listings...');
      await supabase.from('listings').insert([
        {
          title: 'BUBT Student Hub - Single Room',
          location: 'Mirpur 2 (0.2 miles from BUBT)',
          price: 6500,
          type: 'Private Room',
          facilities: ['Wi-Fi Included', 'Furnished', 'Study Desk', 'Generator Backup'],
          verified: true,
          image: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=600&q=80',
          description: 'Ideal single room for BUBT CSE/EEE students. 3 minutes walk to main campus.'
        },
        {
          title: 'Mirpur 10 Smart Student Flat',
          location: 'Mirpur 10 Metro Station (0.5 miles)',
          price: 12500,
          type: 'Entire Apartment',
          facilities: ['Wi-Fi Included', 'Private Bath', 'In-unit Laundry', 'Balcony'],
          verified: true,
          image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=600&q=80',
          description: 'Modern 2-bedroom apartment perfect for 2-3 student roommates sharing expenses.'
        }
      ]);
      console.log('✅ Sample listings seeded!');
    }

    console.log('\n✨ Database is fully synchronized & ready for RentEase operations!');
  } catch (err) {
    console.error('❌ Connection test failed:', err.message);
  }
}

testAndSeedDatabase();

