-- 1. PROMOTE USER TO ADMIN
UPDATE auth.users
SET email_confirmed_at = COALESCE(email_confirmed_at, now()),
    raw_app_meta_data = COALESCE(raw_app_meta_data, '{}'::jsonb) || '{"role": "admin"}'::jsonb,
    updated_at = now()
WHERE email = 'admin@sjcetpalai.ac.in';

-- 2. ROW LEVEL SECURITY (RLS) POLICIES FOR ADMIN ROLE
-- Extracting role from JWT: (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'

-- Enable RLS on all tables
ALTER TABLE public.equipment ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.equipment_reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.space_checkins ENABLE ROW LEVEL SECURITY;

-- 2.1 EQUIPMENT RLS Policies
DROP POLICY IF EXISTS "Anyone can read equipment" ON public.equipment;
CREATE POLICY "Anyone can read equipment"
  ON public.equipment FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Admins have full access to equipment" ON public.equipment;
CREATE POLICY "Admins have full access to equipment"
  ON public.equipment
  FOR ALL
  TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- 2.2 EQUIPMENT RESERVATIONS RLS Policies
DROP POLICY IF EXISTS "Authenticated users can read reservations" ON public.equipment_reservations;
CREATE POLICY "Authenticated users can read reservations"
  ON public.equipment_reservations FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Users can insert own reservations" ON public.equipment_reservations;
CREATE POLICY "Users can insert own reservations"
  ON public.equipment_reservations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own reservations" ON public.equipment_reservations;
CREATE POLICY "Users can update own reservations"
  ON public.equipment_reservations FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own reservations" ON public.equipment_reservations;
CREATE POLICY "Users can delete own reservations"
  ON public.equipment_reservations FOR DELETE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins have full access to equipment_reservations" ON public.equipment_reservations;
CREATE POLICY "Admins have full access to equipment_reservations"
  ON public.equipment_reservations
  FOR ALL
  TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- 2.3 EVENTS RLS Policies
DROP POLICY IF EXISTS "Anyone can read events" ON public.events;
CREATE POLICY "Anyone can read events"
  ON public.events FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Admins have full access to events" ON public.events;
CREATE POLICY "Admins have full access to events"
  ON public.events
  FOR ALL
  TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- 2.4 SPACE CHECKINS RLS Policies
DROP POLICY IF EXISTS "Authenticated users can read all checkins" ON public.space_checkins;
CREATE POLICY "Authenticated users can read all checkins"
  ON public.space_checkins FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Users can insert own checkins" ON public.space_checkins;
CREATE POLICY "Users can insert own checkins"
  ON public.space_checkins FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own checkins" ON public.space_checkins;
CREATE POLICY "Users can update own checkins"
  ON public.space_checkins FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins have full access to space_checkins" ON public.space_checkins;
CREATE POLICY "Admins have full access to space_checkins"
  ON public.space_checkins
  FOR ALL
  TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- ────────────────────────────────────────────────────────────
-- 3. SUPABASE STORAGE SETUP (equipment-images)
-- ────────────────────────────────────────────────────────────
INSERT INTO storage.buckets (id, name, public)
VALUES ('equipment-images', 'equipment-images', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Public Read Access for Equipment Images" ON storage.objects;
CREATE POLICY "Public Read Access for Equipment Images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'equipment-images');

DROP POLICY IF EXISTS "Authenticated Upload Access for Equipment Images" ON storage.objects;
CREATE POLICY "Authenticated Upload Access for Equipment Images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'equipment-images');

DROP POLICY IF EXISTS "Authenticated Update Access for Equipment Images" ON storage.objects;
CREATE POLICY "Authenticated Update Access for Equipment Images"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'equipment-images');

DROP POLICY IF EXISTS "Authenticated Delete Access for Equipment Images" ON storage.objects;
CREATE POLICY "Authenticated Delete Access for Equipment Images"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'equipment-images');