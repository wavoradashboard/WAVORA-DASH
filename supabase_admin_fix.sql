-- ==============================================================================
-- Wavora Master Supabase Database Sync & Permissions Fix
-- Run this entire script in your Supabase SQL Editor (https://supabase.com/dashboard)
-- ==============================================================================

-- 1. Ensure all tables exist with flexible, nullable schemas
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    artist_name TEXT,
    plan TEXT DEFAULT 'Basic',
    is_approved BOOLEAN DEFAULT true,
    registered_at TIMESTAMPTZ DEFAULT now(),
    plan_start_date TIMESTAMPTZ,
    plan_end_date TIMESTAMPTZ,
    allowed_c_lines TEXT,
    allowed_p_lines TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.labels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID,
    email TEXT NOT NULL,
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.artists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID,
    email TEXT NOT NULL,
    name TEXT NOT NULL,
    spotify_link TEXT,
    apple_music_link TEXT,
    instagram_link TEXT,
    default_c_line TEXT,
    default_p_line TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.releases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID,
    email TEXT,
    album_name TEXT,
    type TEXT,
    main_artist_name TEXT,
    other_artists JSONB,
    feature_artists JSONB,
    language TEXT,
    content_type TEXT,
    num_tracks INT,
    genre TEXT,
    sub_genre TEXT,
    label_name TEXT,
    upc TEXT,
    content_id TEXT,
    c_line TEXT,
    p_line TEXT,
    release_date TEXT,
    cover_art_url TEXT,
    tracks JSONB,
    special_request TEXT,
    status TEXT DEFAULT 'Submitted',
    feedback TEXT,
    submitted_at TIMESTAMPTZ DEFAULT now(),
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.revenue_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID,
    email TEXT NOT NULL,
    month TEXT NOT NULL,
    amount NUMERIC DEFAULT 0,
    currency TEXT DEFAULT 'INR',
    breakdown JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.support_queries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID,
    email TEXT NOT NULL,
    artist_name TEXT,
    query_text TEXT NOT NULL,
    reply_text TEXT,
    status TEXT DEFAULT 'Pending',
    submitted_at TIMESTAMPTZ DEFAULT now(),
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.oac_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID,
    email TEXT NOT NULL,
    artist_name TEXT,
    spotify_link TEXT,
    youtube_link TEXT,
    full_name TEXT,
    status TEXT DEFAULT 'Pending',
    submitted_at TIMESTAMPTZ DEFAULT now(),
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.payout_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID,
    email TEXT NOT NULL,
    artist_name TEXT,
    amount NUMERIC DEFAULT 0,
    currency TEXT DEFAULT 'INR',
    payment_method TEXT,
    payment_details JSONB,
    status TEXT DEFAULT 'Pending',
    feedback TEXT,
    submitted_at TIMESTAMPTZ DEFAULT now(),
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    target_type TEXT DEFAULT 'Everyone',
    target_value TEXT,
    severity TEXT DEFAULT 'Info',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Drop any foreign key constraints that might block inserts when user_id is null or custom
DO $$
BEGIN
  -- labels
  ALTER TABLE public.labels ALTER COLUMN user_id DROP NOT NULL;
  -- artists
  ALTER TABLE public.artists ALTER COLUMN user_id DROP NOT NULL;
  -- revenue_reports
  ALTER TABLE public.revenue_reports ALTER COLUMN user_id DROP NOT NULL;
  -- support_queries
  ALTER TABLE public.support_queries ALTER COLUMN user_id DROP NOT NULL;
  -- oac_applications
  ALTER TABLE public.oac_applications ALTER COLUMN user_id DROP NOT NULL;
  -- payout_requests
  ALTER TABLE public.payout_requests ALTER COLUMN user_id DROP NOT NULL;
  -- releases
  ALTER TABLE public.releases ALTER COLUMN user_id DROP NOT NULL;
EXCEPTION
  WHEN OTHERS THEN NULL;
END $$;

-- 3. Reset RLS policies to allow full read & write access for anon & authenticated keys
-- (This ensures the web frontend can read & write seamlessly)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.labels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.artists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.releases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.revenue_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_queries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.oac_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payout_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Clean existing policies
DROP POLICY IF EXISTS "allow_all_users" ON public.users;
DROP POLICY IF EXISTS "allow_all_labels" ON public.labels;
DROP POLICY IF EXISTS "allow_all_artists" ON public.artists;
DROP POLICY IF EXISTS "allow_all_releases" ON public.releases;
DROP POLICY IF EXISTS "allow_all_revenue" ON public.revenue_reports;
DROP POLICY IF EXISTS "allow_all_support" ON public.support_queries;
DROP POLICY IF EXISTS "allow_all_oac" ON public.oac_applications;
DROP POLICY IF EXISTS "allow_all_payouts" ON public.payout_requests;
DROP POLICY IF EXISTS "allow_all_notifications" ON public.notifications;

-- Create universal access policies (Read/Write/Update/Delete for app)
CREATE POLICY "allow_all_users" ON public.users FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_labels" ON public.labels FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_artists" ON public.artists FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_releases" ON public.releases FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_revenue" ON public.revenue_reports FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_support" ON public.support_queries FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_oac" ON public.oac_applications FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_payouts" ON public.payout_requests FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_notifications" ON public.notifications FOR ALL USING (true) WITH CHECK (true);

-- 4. Grant table privileges to authenticated & anon roles
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO postgres, anon, authenticated, service_role;
