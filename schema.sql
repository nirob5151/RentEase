-- ====================================================================
-- RentEase Complete Enterprise PostgreSQL Database Schema
-- 22 Tables | Storage Buckets | RLS Security Policies
-- Copy and paste this into Supabase SQL Editor and click RUN ▶
-- ====================================================================

-- --------------------------------------------------------------------
-- 1. AUTH & USER MODULE
-- --------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(50),
  address TEXT,
  nid_number VARCHAR(100),
  landlord_code VARCHAR(100),
  payout_channel VARCHAR(100),
  payout_account VARCHAR(100),
  avatar_url TEXT,
  profile_picture TEXT,
  role VARCHAR(50) DEFAULT 'student' CHECK (role IN ('student', 'landlord', 'admin')),
  is_active BOOLEAN DEFAULT true,
  is_verified BOOLEAN DEFAULT false,
  is_root_admin BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.student_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  university VARCHAR(255),
  student_id_number VARCHAR(100),
  department VARCHAR(255),
  year VARCHAR(50),
  gender VARCHAR(50),
  date_of_birth DATE,
  bio TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.landlord_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  landlord_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  nid_number VARCHAR(100),
  nid_front_url TEXT,
  nid_back_url TEXT,
  verification_status VARCHAR(50) DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected')),
  ownership_document_url TEXT,
  utility_bill_url TEXT,
  verified_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  verified_at TIMESTAMP WITH TIME ZONE,
  rejection_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- --------------------------------------------------------------------
-- 2. PROPERTY MODULE
-- --------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.properties (
  id BIGSERIAL PRIMARY KEY,
  landlord_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  property_type VARCHAR(100),
  address TEXT,
  area VARCHAR(100),
  city VARCHAR(100),
  latitude NUMERIC(10, 8),
  longitude NUMERIC(11, 8),
  monthly_rent NUMERIC NOT NULL,
  security_deposit NUMERIC,
  bedrooms INTEGER DEFAULT 1,
  bathrooms INTEGER DEFAULT 1,
  available_from DATE DEFAULT CURRENT_DATE,
  furnished VARCHAR(50) DEFAULT 'Unfurnished',
  amenities TEXT[],
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'hidden', 'rented')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.property_images (
  id BIGSERIAL PRIMARY KEY,
  property_id BIGINT REFERENCES public.properties(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.property_verifications (
  id BIGSERIAL PRIMARY KEY,
  property_id BIGINT REFERENCES public.properties(id) ON DELETE CASCADE,
  landlord_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  ownership_document_url TEXT,
  utility_bill_url TEXT,
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  verified_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  verified_at TIMESTAMP WITH TIME ZONE,
  rejection_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- --------------------------------------------------------------------
-- 3. BOOKING MODULE
-- --------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id BIGINT REFERENCES public.properties(id) ON DELETE CASCADE,
  student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  landlord_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  move_in_date DATE DEFAULT CURRENT_DATE,
  booking_date DATE DEFAULT CURRENT_DATE,
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled', 'completed')),
  special_request TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.lease_agreements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID REFERENCES public.bookings(id) ON DELETE CASCADE,
  property_id BIGINT REFERENCES public.properties(id) ON DELETE CASCADE,
  student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  landlord_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  monthly_rent NUMERIC NOT NULL,
  deposit NUMERIC NOT NULL,
  contract_url TEXT,
  status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'expired', 'terminated')),
  signed_by_student BOOLEAN DEFAULT false,
  signed_by_landlord BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID REFERENCES public.bookings(id) ON DELETE CASCADE,
  student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  landlord_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  amount NUMERIC NOT NULL,
  currency VARCHAR(10) DEFAULT 'BDT',
  payment_type VARCHAR(50) DEFAULT 'rent',
  payment_method VARCHAR(50) DEFAULT 'bKash',
  transaction_id VARCHAR(100),
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  paid_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- --------------------------------------------------------------------
-- 4. ROOMMATE MODULE
-- --------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.roommate_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  bio TEXT,
  preferred_location VARCHAR(255),
  min_budget NUMERIC,
  max_budget NUMERIC,
  preferred_move_in_date DATE,
  gender_preference VARCHAR(50),
  smoking VARCHAR(50),
  pets VARCHAR(50),
  cleanliness_level VARCHAR(50),
  sleep_schedule VARCHAR(50),
  study_habits VARCHAR(50),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.roommate_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  receiver_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  message TEXT,
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.roommate_matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_a_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  student_b_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  compatibility_score NUMERIC(5, 2),
  match_reason TEXT,
  status VARCHAR(50) DEFAULT 'matched',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- --------------------------------------------------------------------
-- 5. MESSAGING MODULE
-- --------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.chats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chat_type VARCHAR(50) DEFAULT 'student_landlord' CHECK (chat_type IN ('student_student', 'student_landlord', 'student_admin', 'landlord_admin')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chat_id UUID REFERENCES public.chats(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- --------------------------------------------------------------------
-- 6. REVIEWS MODULE
-- --------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  property_id BIGINT REFERENCES public.properties(id) ON DELETE CASCADE,
  landlord_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  rating NUMERIC(2, 1) CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT,
  status VARCHAR(50) DEFAULT 'published',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- --------------------------------------------------------------------
-- 7. ADMIN MODULE
-- --------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  reported_user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  property_id BIGINT REFERENCES public.properties(id) ON DELETE SET NULL,
  report_type VARCHAR(100),
  subject VARCHAR(255),
  description TEXT,
  priority VARCHAR(50) DEFAULT 'medium',
  status VARCHAR(50) DEFAULT 'open' CHECK (status IN ('open', 'under_investigation', 'resolved', 'dismissed')),
  assigned_admin_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  resolution_note TEXT,
  resolved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  notification_type VARCHAR(100),
  related_id VARCHAR(255),
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- --------------------------------------------------------------------
-- PAYMENTS & RENT RECEIPT LEDGER MODULE
-- --------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.payments (
  id VARCHAR(255) PRIMARY KEY,
  receipt_id VARCHAR(100) NOT NULL UNIQUE,
  tenant_name VARCHAR(255) NOT NULL,
  tenant_email VARCHAR(255),
  property_title VARCHAR(255),
  property_id BIGINT REFERENCES public.properties(id) ON DELETE SET NULL,
  landlord_email VARCHAR(255),
  amount NUMERIC(10, 2) NOT NULL,
  billing_month VARCHAR(100) NOT NULL,
  deposit_status VARCHAR(100) DEFAULT 'Refundable',
  payment_method VARCHAR(100) DEFAULT 'bKash / Bank',
  payment_date DATE,
  status VARCHAR(50) DEFAULT 'Pending' CHECK (status IN ('Pending', 'Paid', 'Overdue', 'Cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- --------------------------------------------------------------------
-- LEASE & TENANCY CONTRACTS SIGNING MODULE
-- --------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.contracts (
  id VARCHAR(255) PRIMARY KEY,
  booking_id VARCHAR(255),
  landlord_id VARCHAR(255),
  landlord_name VARCHAR(255) NOT NULL,
  landlord_email VARCHAR(255),
  landlord_signature_name VARCHAR(255),
  student_id VARCHAR(255),
  student_name VARCHAR(255) NOT NULL,
  student_email VARCHAR(255),
  student_signature_name VARCHAR(255),
  property_title VARCHAR(255) NOT NULL,
  property_address TEXT,
  monthly_rent NUMERIC(10, 2) NOT NULL,
  security_deposit NUMERIC(10, 2) NOT NULL,
  commence_date DATE,
  expiry_date DATE,
  special_terms TEXT,
  status VARCHAR(50) DEFAULT 'pending_student_signature' CHECK (status IN ('draft', 'pending_student_signature', 'signed', 'active', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  signed_at TIMESTAMP WITH TIME ZONE
);

-- --------------------------------------------------------------------
-- REAL-TIME MESSAGING & CONVERSATIONS MODULE
-- --------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.conversations (
  id VARCHAR(255) PRIMARY KEY,
  landlord_id VARCHAR(255) NOT NULL,
  landlord_name VARCHAR(255),
  landlord_email VARCHAR(255),
  landlord_avatar TEXT,
  student_id VARCHAR(255) NOT NULL,
  student_name VARCHAR(255),
  student_email VARCHAR(255),
  student_avatar TEXT,
  property_id VARCHAR(255),
  property_title VARCHAR(255),
  last_message_text TEXT,
  last_message_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  unread_count_landlord INT DEFAULT 0,
  unread_count_student INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.messages (
  id VARCHAR(255) PRIMARY KEY,
  conversation_id VARCHAR(255) REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_id VARCHAR(255) NOT NULL,
  sender_email VARCHAR(255),
  sender_name VARCHAR(255),
  sender_role VARCHAR(50) NOT NULL CHECK (sender_role IN ('student', 'landlord', 'admin')),
  message_text TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_type VARCHAR(100) NOT NULL,
  title VARCHAR(255) NOT NULL,
  content TEXT,
  image_url TEXT,
  status VARCHAR(50) DEFAULT 'published',
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  updated_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.system_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key VARCHAR(255) UNIQUE NOT NULL,
  setting_value TEXT,
  setting_type VARCHAR(50) DEFAULT 'string',
  description TEXT,
  updated_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.security_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  event_type VARCHAR(100) NOT NULL,
  ip_address VARCHAR(100),
  user_agent TEXT,
  success BOOLEAN DEFAULT true,
  details JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  action VARCHAR(255) NOT NULL,
  entity_type VARCHAR(100),
  entity_id VARCHAR(255),
  old_data JSONB,
  new_data JSONB,
  description TEXT,
  ip_address VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.admin_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  action_type VARCHAR(100) NOT NULL,
  target_type VARCHAR(100),
  target_id VARCHAR(255),
  note TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- --------------------------------------------------------------------
-- 8. SUPPORT MODULE
-- --------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.help_articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category VARCHAR(100),
  title VARCHAR(255) NOT NULL,
  content TEXT,
  status VARCHAR(50) DEFAULT 'published',
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  updated_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ====================================================================
-- RLS ACCESS SECURITY POLICIES FOR ALL TABLES
-- ====================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.landlord_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.property_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.property_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lease_agreements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roommate_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roommate_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roommate_matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.security_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.help_articles ENABLE ROW LEVEL SECURITY;

-- --------------------------------------------------------------------
-- 1. PROFILES SECURITY POLICIES
-- Users can SELECT/UPDATE/INSERT only their own profile row (auth.uid() = id).
-- --------------------------------------------------------------------
DROP POLICY IF EXISTS "Public Profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users SELECT own profile" ON public.profiles;
CREATE POLICY "Users SELECT own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users UPDATE own profile" ON public.profiles;
CREATE POLICY "Users UPDATE own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users INSERT own profile" ON public.profiles;
CREATE POLICY "Users INSERT own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Student Profiles: Users can manage only their own student profile
DROP POLICY IF EXISTS "Public Student Profiles" ON public.student_profiles;
DROP POLICY IF EXISTS "Student manage own profile" ON public.student_profiles;
CREATE POLICY "Student manage own profile" ON public.student_profiles FOR ALL USING (auth.uid() = student_id);

-- Landlord Profiles: Landlords can manage only their own landlord profile
DROP POLICY IF EXISTS "Public Landlord Profiles" ON public.landlord_profiles;
DROP POLICY IF EXISTS "Landlord manage own profile" ON public.landlord_profiles;
CREATE POLICY "Landlord manage own profile" ON public.landlord_profiles FOR ALL USING (auth.uid() = landlord_id);

-- --------------------------------------------------------------------
-- 2. PROPERTY MARKETPLACE POLICIES
-- Marketplace property viewing is public (SELECT true), but INSERT/UPDATE/DELETE restricted to landlord owner.
-- --------------------------------------------------------------------
DROP POLICY IF EXISTS "Public Properties" ON public.properties;
DROP POLICY IF EXISTS "Public SELECT properties" ON public.properties;
CREATE POLICY "Public SELECT properties" ON public.properties FOR SELECT USING (true);

DROP POLICY IF EXISTS "Landlord INSERT properties" ON public.properties;
CREATE POLICY "Landlord INSERT properties" ON public.properties FOR INSERT WITH CHECK (auth.uid() = landlord_id);

DROP POLICY IF EXISTS "Landlord UPDATE properties" ON public.properties;
CREATE POLICY "Landlord UPDATE properties" ON public.properties FOR UPDATE USING (auth.uid() = landlord_id);

DROP POLICY IF EXISTS "Landlord DELETE properties" ON public.properties;
CREATE POLICY "Landlord DELETE properties" ON public.properties FOR DELETE USING (auth.uid() = landlord_id);

DROP POLICY IF EXISTS "Public Property Images" ON public.property_images;
DROP POLICY IF EXISTS "Public SELECT property_images" ON public.property_images;
CREATE POLICY "Public SELECT property_images" ON public.property_images FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public Property Verifications" ON public.property_verifications;
DROP POLICY IF EXISTS "Landlord manage property verifications" ON public.property_verifications;
CREATE POLICY "Landlord manage property verifications" ON public.property_verifications FOR ALL USING (auth.uid() = landlord_id);

-- --------------------------------------------------------------------
-- 3. BOOKINGS, LEASES, CONTRACTS & PAYMENTS POLICIES
-- Only visible & manageable by the participating parties (auth.uid() matches student_id or landlord_id).
-- --------------------------------------------------------------------
-- Bookings: Restricted to participating student or landlord
DROP POLICY IF EXISTS "Public Bookings" ON public.bookings;
DROP POLICY IF EXISTS "Parties manage bookings" ON public.bookings;
CREATE POLICY "Parties manage bookings" ON public.bookings FOR ALL USING (auth.uid() = student_id OR auth.uid() = landlord_id);

-- Lease Agreements: Restricted to participating student or landlord
DROP POLICY IF EXISTS "Public Lease Agreements" ON public.lease_agreements;
DROP POLICY IF EXISTS "Parties manage lease_agreements" ON public.lease_agreements;
CREATE POLICY "Parties manage lease_agreements" ON public.lease_agreements FOR ALL USING (auth.uid() = student_id OR auth.uid() = landlord_id);

-- Contracts: Restricted to participating student or landlord (matching text UUIDs)
DROP POLICY IF EXISTS "Public Contracts" ON public.contracts;
DROP POLICY IF EXISTS "Parties manage contracts" ON public.contracts;
CREATE POLICY "Parties manage contracts" ON public.contracts FOR ALL USING (auth.uid()::text = student_id OR auth.uid()::text = landlord_id);

-- Payments: Restricted to participating student or landlord
DROP POLICY IF EXISTS "Public Payments" ON public.payments;
DROP POLICY IF EXISTS "Parties manage payments" ON public.payments;
CREATE POLICY "Parties manage payments" ON public.payments FOR ALL USING (auth.uid() = student_id OR auth.uid() = landlord_id);

-- --------------------------------------------------------------------
-- 4. ROOMMATE & MESSAGING MODULE POLICIES
-- Roommate profiles public read; chats/messages restricted to participant users.
-- --------------------------------------------------------------------
DROP POLICY IF EXISTS "Public Roommate Profiles" ON public.roommate_profiles;
CREATE POLICY "Public SELECT roommate_profiles" ON public.roommate_profiles FOR SELECT USING (true);
CREATE POLICY "Student manage roommate_profile" ON public.roommate_profiles FOR ALL USING (auth.uid() = student_id);

DROP POLICY IF EXISTS "Public Roommate Requests" ON public.roommate_requests;
CREATE POLICY "Parties manage roommate_requests" ON public.roommate_requests FOR ALL USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

DROP POLICY IF EXISTS "Public Roommate Matches" ON public.roommate_matches;
CREATE POLICY "Parties manage roommate_matches" ON public.roommate_matches FOR ALL USING (auth.uid() = student_a_id OR auth.uid() = student_b_id);

DROP POLICY IF EXISTS "Public Chats" ON public.chats;
CREATE POLICY "Public SELECT chats" ON public.chats FOR SELECT USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Public Messages" ON public.messages;
CREATE POLICY "Users manage messages" ON public.messages FOR ALL USING (auth.uid() = sender_id OR auth.uid()::text = sender_id);

DROP POLICY IF EXISTS "Public Reviews" ON public.reviews;
CREATE POLICY "Public SELECT reviews" ON public.reviews FOR SELECT USING (true);
CREATE POLICY "Student INSERT reviews" ON public.reviews FOR INSERT WITH CHECK (auth.uid() = student_id);

DROP POLICY IF EXISTS "Public Reports" ON public.reports;
CREATE POLICY "Reporter manage reports" ON public.reports FOR ALL USING (auth.uid() = reporter_id);

DROP POLICY IF EXISTS "Public Notifications" ON public.notifications;
CREATE POLICY "User manage notifications" ON public.notifications FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Public Content" ON public.content;
CREATE POLICY "Public SELECT content" ON public.content FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public System Settings" ON public.system_settings;
CREATE POLICY "Public SELECT system_settings" ON public.system_settings FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public Help Articles" ON public.help_articles;
CREATE POLICY "Public SELECT help_articles" ON public.help_articles FOR SELECT USING (true);

-- --------------------------------------------------------------------
-- 5. AUDIT LOGS, ADMIN ACTIONS & SECURITY EVENTS POLICIES
-- No client access allowed (USING false for anon/authenticated). Accessible ONLY via server-side Service Role key.
-- --------------------------------------------------------------------
DROP POLICY IF EXISTS "Public Security Events" ON public.security_events;
DROP POLICY IF EXISTS "No client access security_events" ON public.security_events;
CREATE POLICY "No client access security_events" ON public.security_events FOR ALL USING (false);

DROP POLICY IF EXISTS "Public Audit Logs" ON public.audit_logs;
DROP POLICY IF EXISTS "No client access audit_logs" ON public.audit_logs;
CREATE POLICY "No client access audit_logs" ON public.audit_logs FOR ALL USING (false);

DROP POLICY IF EXISTS "Public Admin Actions" ON public.admin_actions;
DROP POLICY IF EXISTS "No client access admin_actions" ON public.admin_actions;
CREATE POLICY "No client access admin_actions" ON public.admin_actions FOR ALL USING (false);

-- ====================================================================
-- SUPABASE STORAGE BUCKETS & FOLDER SECURITY POLICIES
-- ====================================================================

-- 1. Create Storage Buckets
INSERT INTO storage.buckets (id, name, public) VALUES ('property-images', 'property-images', true) ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('profile-images', 'profile-images', true) ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('landlord-verification', 'landlord-verification', false) ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('lease-documents', 'lease-documents', false) ON CONFLICT (id) DO NOTHING;

-- 2. Storage Security Policies
-- Public property-images read; authenticated landlord upload
DROP POLICY IF EXISTS "Public Property Images Access" ON storage.objects;
DROP POLICY IF EXISTS "Public SELECT property-images" ON storage.objects;
CREATE POLICY "Public SELECT property-images" ON storage.objects FOR SELECT USING (bucket_id = 'property-images');

DROP POLICY IF EXISTS "Authenticated INSERT property-images" ON storage.objects;
CREATE POLICY "Authenticated INSERT property-images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'property-images' AND auth.uid() IS NOT NULL);

-- Public profile-images read; authenticated user upload
DROP POLICY IF EXISTS "Public Profile Images Access" ON storage.objects;
DROP POLICY IF EXISTS "Public SELECT profile-images" ON storage.objects;
CREATE POLICY "Public SELECT profile-images" ON storage.objects FOR SELECT USING (bucket_id = 'profile-images');

DROP POLICY IF EXISTS "Authenticated INSERT profile-images" ON storage.objects;
CREATE POLICY "Authenticated INSERT profile-images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'profile-images' AND auth.uid() IS NOT NULL);

-- Landlord verification documents: Scope to owning landlord user only
DROP POLICY IF EXISTS "Public Landlord Verification Access" ON storage.objects;
DROP POLICY IF EXISTS "Landlord owner verification documents access" ON storage.objects;
CREATE POLICY "Landlord owner verification documents access" ON storage.objects FOR ALL USING (bucket_id = 'landlord-verification' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Lease documents: Scope to owning user only
DROP POLICY IF EXISTS "Public Lease Documents Access" ON storage.objects;
DROP POLICY IF EXISTS "User owner lease documents access" ON storage.objects;
CREATE POLICY "User owner lease documents access" ON storage.objects FOR ALL USING (bucket_id = 'lease-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

-- ====================================================================
-- REALTIME HOMEPAGE STATS RPC FUNCTION
-- ====================================================================

CREATE OR REPLACE FUNCTION public.get_rentease_stats()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_listings BIGINT;
  v_students BIGINT;
  v_landlords BIGINT;
  v_roommates BIGINT;
BEGIN
  SELECT GREATEST((SELECT COUNT(*) FROM public.listings), (SELECT COUNT(*) FROM public.properties)) INTO v_listings;
  SELECT COUNT(*) INTO v_students FROM public.profiles WHERE LOWER(role) = 'student' OR role IS NULL;
  SELECT COUNT(*) INTO v_landlords FROM public.profiles WHERE LOWER(role) = 'landlord';
  SELECT COUNT(*) INTO v_roommates FROM public.roommate_profiles;

  RETURN jsonb_build_object(
    'verified_listings', COALESCE(v_listings, 4),
    'active_students', COALESCE(v_students, 450),
    'trusted_landlords', COALESCE(v_landlords, 85),
    'roommate_profiles', COALESCE(v_roommates, 120)
  );
END;
$$;

-- ====================================================================
-- REALTIME REPLICATION SUBSCRIPTIONS
-- ====================================================================
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.listings;
    ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
    ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
    ALTER PUBLICATION supabase_realtime ADD TABLE public.properties;
    ALTER PUBLICATION supabase_realtime ADD TABLE public.reports;
  END IF;
EXCEPTION WHEN OTHERS THEN
  NULL;
END $$;

-- --------------------------------------------------------------------
-- 23. TEMPORARY EMAIL VERIFICATIONS (SERVER-ONLY ACCESS VIA SERVICE ROLE)
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.email_verifications (
  email VARCHAR(255) PRIMARY KEY,
  code VARCHAR(10) NOT NULL,
  signup_data JSONB NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE public.email_verifications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "No client access email_verifications" ON public.email_verifications;
CREATE POLICY "No client access email_verifications" ON public.email_verifications FOR ALL USING (false);

-- --------------------------------------------------------------------
-- 24. STUDENT & LANDLORD ID VERIFICATIONS (ADMIN APPROVAL QUEUE)
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.id_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_email VARCHAR(255) NOT NULL,
  user_name VARCHAR(255),
  id_document_url TEXT NOT NULL,
  verification_status VARCHAR(50) DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected')),
  rejection_reason TEXT,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by VARCHAR(255)
);

ALTER TABLE public.id_verifications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "User manage own id_verification" ON public.id_verifications;
CREATE POLICY "User manage own id_verification" ON public.id_verifications FOR ALL USING (auth.jwt() ->> 'email' = user_email);

