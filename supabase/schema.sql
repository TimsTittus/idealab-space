-- ============================================================
-- SJCET AICTE IDEA Lab — Complete Database Schema
-- Run this in the Supabase SQL Editor (Dashboard → SQL Editor)
-- ============================================================

-- ────────────────────────────────────────────────────────────
-- 1. EXTENSIONS
-- ────────────────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "btree_gist";
-- pg_cron must be enabled via Supabase Dashboard → Database → Extensions

-- ────────────────────────────────────────────────────────────
-- 2. HELPER: auto-update updated_at timestamp
-- ────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- ────────────────────────────────────────────────────────────
-- 3. AUTH: Restrict sign-ups to email addresses ending with sjcetpalai.ac.in
-- ────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.check_sjcet_email()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF NEW.email IS NULL THEN
    RAISE EXCEPTION 'Email address is required for registration.';
  END IF;

  IF lower(NEW.email) NOT LIKE '%sjcetpalai.ac.in' THEN
    RAISE EXCEPTION 'Registration is restricted to email addresses ending with sjcetpalai.ac.in';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS sjcet_email_check ON auth.users;
CREATE TRIGGER sjcet_email_check
  BEFORE INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.check_sjcet_email();

-- ────────────────────────────────────────────────────────────
-- 4. TABLE: user_profiles
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  email           TEXT DEFAULT '',
  full_name       TEXT NOT NULL DEFAULT '',
  department      TEXT DEFAULT '',
  year_of_study   TEXT DEFAULT '',
  bio             TEXT DEFAULT '',
  skill_tags      TEXT[] DEFAULT ARRAY[]::TEXT[],
  languages       JSONB DEFAULT '[]'::JSONB,
  github_url      TEXT DEFAULT '',
  avatar_url      TEXT DEFAULT '',
  role            TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Ensure email, role columns and constraint exist if user_profiles table was created prior
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS email TEXT DEFAULT '';
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'user';
ALTER TABLE public.user_profiles DROP CONSTRAINT IF EXISTS user_profiles_role_check;
ALTER TABLE public.user_profiles ADD CONSTRAINT user_profiles_role_check CHECK (role IN ('user', 'admin'));

DROP TRIGGER IF EXISTS user_profiles_updated_at ON public.user_profiles;
CREATE TRIGGER user_profiles_updated_at
  BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Auto-create a profile row when a new user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.user_profiles (user_id, email, full_name, avatar_url, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.email, NEW.raw_user_meta_data ->> 'email', ''),
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', ''),
    COALESCE(NEW.raw_user_meta_data ->> 'avatar_url', ''),
    'user'
  )
  ON CONFLICT (user_id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = CASE WHEN public.user_profiles.full_name = '' THEN EXCLUDED.full_name ELSE public.user_profiles.full_name END;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- RLS
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read profiles"
  ON public.user_profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can insert own profile"
  ON public.user_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
  ON public.user_profiles FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can update any profile"
  ON public.user_profiles FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles admin_p
      WHERE admin_p.user_id = auth.uid() AND admin_p.role = 'admin'
    )
  );

CREATE POLICY "Users can delete own profile"
  ON public.user_profiles FOR DELETE
  USING (auth.uid() = user_id);

-- ────────────────────────────────────────────────────────────
-- 5. TABLE: space_checkins
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.space_checkins (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  purpose_of_visit    TEXT NOT NULL,
  estimated_duration  INTERVAL NOT NULL,
  checkin_timestamp   TIMESTAMPTZ NOT NULL DEFAULT now(),
  is_active           BOOLEAN NOT NULL DEFAULT true,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

DROP TRIGGER IF EXISTS space_checkins_updated_at ON public.space_checkins;
CREATE TRIGGER space_checkins_updated_at
  BEFORE UPDATE ON public.space_checkins
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- RLS
ALTER TABLE public.space_checkins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read all checkins"
  ON public.space_checkins FOR SELECT
  USING (true);

CREATE POLICY "Users can insert own checkins"
  ON public.space_checkins FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own checkins"
  ON public.space_checkins FOR UPDATE
  USING (auth.uid() = user_id);

-- Function to expire old check-ins (called by pg_cron)
CREATE OR REPLACE FUNCTION public.expire_checkins()
RETURNS VOID
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE public.space_checkins
  SET is_active = false
  WHERE is_active = true
    AND (checkin_timestamp + estimated_duration) < now();
END;
$$;

-- Schedule expiry job every minute (requires pg_cron extension)
-- If pg_cron is not available, use a Next.js cron endpoint instead.
-- SELECT cron.schedule('expire_space_checkins', '*/1 * * * *', $$SELECT public.expire_checkins();$$);

-- ────────────────────────────────────────────────────────────
-- 6. TABLE: equipment
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.equipment (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT NOT NULL,
  category      TEXT NOT NULL DEFAULT 'General',
  description   TEXT DEFAULT '',
  image_url     TEXT DEFAULT '',
  price         NUMERIC(10,2) DEFAULT 0,
  is_available  BOOLEAN NOT NULL DEFAULT true,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.equipment ADD COLUMN IF NOT EXISTS price NUMERIC(10,2) DEFAULT 0;

DROP TRIGGER IF EXISTS equipment_updated_at ON public.equipment;
CREATE TRIGGER equipment_updated_at
  BEFORE UPDATE ON public.equipment
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- RLS
ALTER TABLE public.equipment ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read equipment"
  ON public.equipment FOR SELECT
  USING (true);

-- ────────────────────────────────────────────────────────────
-- 7. TABLE: equipment_reservations (conflict-free booking)
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.equipment_reservations (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  equipment_id        UUID NOT NULL REFERENCES public.equipment(id) ON DELETE CASCADE,
  user_id             UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reservation_period  TSTZRANGE NOT NULL,
  status              TEXT NOT NULL DEFAULT 'confirmed'
                      CHECK (status IN ('confirmed', 'cancelled')),
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

DROP TRIGGER IF EXISTS equipment_reservations_updated_at ON public.equipment_reservations;
CREATE TRIGGER equipment_reservations_updated_at
  BEFORE UPDATE ON public.equipment_reservations
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- EXCLUDE constraint: prevent overlapping confirmed bookings per equipment
ALTER TABLE public.equipment_reservations
  ADD CONSTRAINT no_double_booking
  EXCLUDE USING GIST (
    equipment_id WITH =,
    reservation_period WITH &&
  )
  WHERE (status = 'confirmed');

-- RLS
ALTER TABLE public.equipment_reservations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read reservations"
  ON public.equipment_reservations FOR SELECT
  USING (true);

CREATE POLICY "Users can insert own reservations"
  ON public.equipment_reservations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reservations"
  ON public.equipment_reservations FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own reservations"
  ON public.equipment_reservations FOR DELETE
  USING (auth.uid() = user_id);

-- ────────────────────────────────────────────────────────────
-- 8. TABLE: events
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.events (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title       TEXT NOT NULL,
  description TEXT DEFAULT '',
  event_type  TEXT DEFAULT 'Workshop',
  location    TEXT DEFAULT '',
  start_time  TIMESTAMPTZ NOT NULL,
  end_time    TIMESTAMPTZ NOT NULL,
  image_url   TEXT DEFAULT '',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

DROP TRIGGER IF EXISTS events_updated_at ON public.events;
CREATE TRIGGER events_updated_at
  BEFORE UPDATE ON public.events
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- RLS
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read events"
  ON public.events FOR SELECT
  USING (true);

-- ────────────────────────────────────────────────────────────
-- 9. INDEXES
-- ────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON public.user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_checkins_user_id ON public.space_checkins(user_id);
CREATE INDEX IF NOT EXISTS idx_checkins_active ON public.space_checkins(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_checkins_timestamp ON public.space_checkins(checkin_timestamp);
CREATE INDEX IF NOT EXISTS idx_eq_reservations_equipment ON public.equipment_reservations(equipment_id);
CREATE INDEX IF NOT EXISTS idx_eq_reservations_user ON public.equipment_reservations(user_id);
CREATE INDEX IF NOT EXISTS idx_eq_reservations_period ON public.equipment_reservations USING GIST (reservation_period);
CREATE INDEX IF NOT EXISTS idx_events_start ON public.events(start_time);
CREATE INDEX IF NOT EXISTS idx_events_end ON public.events(end_time);

-- ────────────────────────────────────────────────────────────
-- 10. REALTIME PUBLICATION
-- ────────────────────────────────────────────────────────────
ALTER PUBLICATION supabase_realtime ADD TABLE public.space_checkins;
ALTER PUBLICATION supabase_realtime ADD TABLE public.equipment_reservations;
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_profiles;
ALTER PUBLICATION supabase_realtime ADD TABLE public.events;

-- ────────────────────────────────────────────────────────────
-- 11. SEED DATA: Equipment
-- ────────────────────────────────────────────────────────────
INSERT INTO public.equipment (name, category, description) VALUES
  ('Creality Ender 3 V3', '3D Printing', 'FDM 3D printer with auto bed leveling and 220×220×250mm build volume.'),
  ('Prusa i3 MK3S+', '3D Printing', 'Reliable FDM printer with filament sensor and power recovery.'),
  ('Epilog Zing 24', 'Laser Cutting', '40W CO2 laser cutter/engraver with 24×12 inch work area.'),
  ('CNC 3018 Pro', 'CNC Routing', '3-axis desktop CNC router for PCB milling and wood carving.'),
  ('Elegoo Mars 3 Pro', '3D Printing', 'Resin (MSLA) 3D printer with 4K mono LCD.'),
  ('Rigol DS1054Z', 'Electronics', '4-channel 50MHz digital oscilloscope.'),
  ('Hakko FX-888D', 'Electronics', 'Temperature-controlled soldering station.'),
  ('Arduino Mega Kit', 'Embedded Systems', 'Arduino Mega 2560 with sensor and actuator kit.')
ON CONFLICT DO NOTHING;

-- ────────────────────────────────────────────────────────────
-- 12. SEED DATA: Events
-- ────────────────────────────────────────────────────────────
INSERT INTO public.events (title, description, event_type, location, start_time, end_time) VALUES
  ('AI Wednesday', 'Weekly hands-on session exploring AI/ML tools and frameworks.', 'Bootcamp', 'IDEA Lab, SJCET', now() + interval '2 days', now() + interval '2 days' + interval '1.5 hours'),
  ('Maker Saturday', 'Open lab day — bring your projects and collaborate.', 'Workshop', 'IDEA Lab, SJCET', now() + interval '5 days', now() + interval '5 days' + interval '4 hours'),
  ('IoT Basics Bootcamp', 'Introduction to ESP32, MQTT, and sensor networks.', 'Bootcamp', 'IDEA Lab, SJCET', now() + interval '7 days', now() + interval '7 days' + interval '3 hours'),
  ('PCB Design Workshop', 'Learn KiCad and design your first PCB.', 'Workshop', 'IDEA Lab, SJCET', now() - interval '3 days', now() - interval '3 days' + interval '2 hours'),
  ('3D Printing Masterclass', 'Advanced FDM techniques: supports, infill, multi-material.', 'Seminar', 'IDEA Lab, SJCET', now() - interval '1 hour', now() + interval '1 hour')
ON CONFLICT DO NOTHING;

-- ============================================================
-- DONE — Schema is ready.
-- ============================================================
