-- =================================================================================
-- FINAL SUPABASE SECURITY MIGRATION (PRE-PRODUCTION)
-- Jesus Is With Us Ministries
-- Generated on: 2026-09-08
-- =================================================================================
-- Absolute Safety Constraints Applied:
-- 1. Idempotent creation of tables/functions.
-- 2. Non-destructive: No application/business data is deleted. Security metadata in 
--    login_attempts may be deleted for lock reset and stale-lock cleanup.
-- 3. Strict dependency ordering (table -> func -> RLS -> policy).
-- 4. Purge existing permissive policies before recreating strictly bounded ones 
--    (Note: Only the 12 explicit application/security tables are affected).
-- =================================================================================

-- ============================================================
-- 1. ADMIN AUTHORIZATION ARCHITECTURE
-- ============================================================

-- Create the admin_users table first
CREATE TABLE IF NOT EXISTS public.admin_users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create private schema for non-exposed security helpers
CREATE SCHEMA IF NOT EXISTS private;

-- Create the secure is_admin() function BEFORE any policy uses it
-- FIXED: Placed in 'private' schema so PostgREST does not expose it as an RPC.
CREATE OR REPLACE FUNCTION private.is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER 
SET search_path = ''
STABLE
AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.admin_users WHERE id = (SELECT auth.uid())
    );
END;
$$;

-- Secure the admin_users table
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------
-- SECURE POLICY RECONCILIATION SCRIPT
-- Safely DROP ALL existing policies across the 12 target application tables 
-- to prevent permissive overlays. Unrelated tables are completely ignored.
-- ------------------------------------------------------------
DO $$
DECLARE
    t_name text;
    p_name text;
    target_tables text[] := ARRAY['admin_users', 'rhema_words', 'categories', 'events', 'gallery_images', 'playlists', 'site_settings', 'contact_messages', 'popups', 'app_statistics', 'subscribers', 'login_attempts'];
BEGIN
    FOR t_name IN SELECT unnest(target_tables)
    LOOP
        FOR p_name IN (SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = t_name)
        LOOP
            EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', p_name, t_name);
        END LOOP;
    END LOOP;
END
$$;

-- Apply bounded policy to admin_users
CREATE POLICY "Admins can manage admin_users" ON public.admin_users
    FOR ALL TO authenticated
    USING ((SELECT private.is_admin()))
    WITH CHECK ((SELECT private.is_admin()));

-- ============================================================
-- 2. ENABLE ROW LEVEL SECURITY (RLS) ON ALL TABLES
-- ============================================================
ALTER TABLE IF EXISTS public.rhema_words ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.gallery_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.playlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.popups ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.app_statistics ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.subscribers ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 3. STRICT RLS SECURITY MATRIX
-- Note: Wrapping STABLE private.is_admin() in a SELECT subquery forces PostgreSQL
-- to cache the result per-statement rather than evaluating per-row, massively 
-- improving RLS performance on large queries.
-- ============================================================

-- --------------------------------------------------------
-- rhema_words
-- --------------------------------------------------------
CREATE POLICY "Public can read published rhema_words" ON public.rhema_words FOR SELECT TO public USING (status != 'draft');
CREATE POLICY "Admins can manage rhema_words" ON public.rhema_words FOR ALL TO authenticated USING ((SELECT private.is_admin())) WITH CHECK ((SELECT private.is_admin()));

-- --------------------------------------------------------
-- categories
-- --------------------------------------------------------
CREATE POLICY "Public can read categories" ON public.categories FOR SELECT TO public USING (true);
CREATE POLICY "Admins can manage categories" ON public.categories FOR ALL TO authenticated USING ((SELECT private.is_admin())) WITH CHECK ((SELECT private.is_admin()));

-- --------------------------------------------------------
-- events
-- --------------------------------------------------------
CREATE POLICY "Public can read published events" ON public.events FOR SELECT TO public USING (status = 'published');
CREATE POLICY "Admins can manage events" ON public.events FOR ALL TO authenticated USING ((SELECT private.is_admin())) WITH CHECK ((SELECT private.is_admin()));

-- --------------------------------------------------------
-- gallery_images
-- --------------------------------------------------------
CREATE POLICY "Public can read published gallery_images" ON public.gallery_images FOR SELECT TO public USING (status != 'draft');
CREATE POLICY "Admins can manage gallery_images" ON public.gallery_images FOR ALL TO authenticated USING ((SELECT private.is_admin())) WITH CHECK ((SELECT private.is_admin()));

-- --------------------------------------------------------
-- playlists
-- --------------------------------------------------------
CREATE POLICY "Public can read playlists" ON public.playlists FOR SELECT TO public USING (true);
CREATE POLICY "Admins can manage playlists" ON public.playlists FOR ALL TO authenticated USING ((SELECT private.is_admin())) WITH CHECK ((SELECT private.is_admin()));

-- --------------------------------------------------------
-- site_settings (Safe for public read per audit)
-- --------------------------------------------------------
CREATE POLICY "Public can read site_settings" ON public.site_settings FOR SELECT TO public USING (true);
CREATE POLICY "Admins can manage site_settings" ON public.site_settings FOR ALL TO authenticated USING ((SELECT private.is_admin())) WITH CHECK ((SELECT private.is_admin()));

-- --------------------------------------------------------
-- contact_messages & subscribers
-- Note: Public INSERT allowed for website forms. Frontend Zod validation applies, 
-- but Zod validation is NOT backend XSS sanitization. React handles DOM XSS securely. 
-- Edge/WAF rate limiting MUST be implemented to prevent database spam.
-- --------------------------------------------------------
CREATE POLICY "Public can insert contact_messages" ON public.contact_messages FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Admins can manage contact_messages" ON public.contact_messages FOR ALL TO authenticated USING ((SELECT private.is_admin())) WITH CHECK ((SELECT private.is_admin()));

CREATE POLICY "Public can insert subscribers" ON public.subscribers FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Admins can manage subscribers" ON public.subscribers FOR ALL TO authenticated USING ((SELECT private.is_admin())) WITH CHECK ((SELECT private.is_admin()));

-- --------------------------------------------------------
-- popups
-- --------------------------------------------------------
CREATE POLICY "Public can read active popups" ON public.popups FOR SELECT TO public USING (status = 'published');
CREATE POLICY "Admins can manage popups" ON public.popups FOR ALL TO authenticated USING ((SELECT private.is_admin())) WITH CHECK ((SELECT private.is_admin()));

-- --------------------------------------------------------
-- app_statistics (Strict Internal)
-- --------------------------------------------------------
CREATE POLICY "Admins can manage app_statistics" ON public.app_statistics FOR ALL TO authenticated USING ((SELECT private.is_admin())) WITH CHECK ((SELECT private.is_admin()));


-- ============================================================
-- 4. LOGIN RATE LIMITING ARCHITECTURE
-- ============================================================
-- WARNING: These RPCs are secondary application-level controls. They do NOT 
-- reliably know the client's true IP (due to PostgREST proxying). A malicious 
-- client can target an admin email address. True Edge/WAF/IP rate limiting is 
-- STRICTLY REQUIRED to prevent Denial-of-Service account lockouts. Email-based 
-- locking is NOT complete brute-force protection.
-- ============================================================

CREATE TABLE IF NOT EXISTS public.login_attempts (
    email TEXT PRIMARY KEY,
    attempts INT DEFAULT 0,
    locked_until TIMESTAMP WITH TIME ZONE,
    last_attempt TIMESTAMP WITH TIME ZONE DEFAULT pg_catalog.now()
);

ALTER TABLE public.login_attempts ENABLE ROW LEVEL SECURITY;
-- Explicitly deny all client access to login_attempts (only SECURITY DEFINER RPCs can manipulate it)
CREATE POLICY "Deny direct SELECT on login_attempts" ON public.login_attempts FOR SELECT TO public USING (false);
CREATE POLICY "Deny direct INSERT on login_attempts" ON public.login_attempts FOR INSERT TO public WITH CHECK (false);
CREATE POLICY "Deny direct UPDATE on login_attempts" ON public.login_attempts FOR UPDATE TO public USING (false) WITH CHECK (false);
CREATE POLICY "Deny direct DELETE on login_attempts" ON public.login_attempts FOR DELETE TO public USING (false);

-- --------------------------------------------------------
-- RPC: check_login_status
-- --------------------------------------------------------
CREATE OR REPLACE FUNCTION public.check_login_status(p_email TEXT)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER 
SET search_path = ''
AS $$
DECLARE
  v_locked_until TIMESTAMP WITH TIME ZONE;
BEGIN
  IF p_email IS NULL OR pg_catalog.length(pg_catalog.btrim(p_email)) < 5 OR pg_catalog.length(pg_catalog.btrim(p_email)) > 255 THEN
    RAISE EXCEPTION 'Invalid email input';
  END IF;

  -- Opportunistic cleanup of stale locks (Security metadata deletion)
  DELETE FROM public.login_attempts WHERE locked_until <= pg_catalog.now();

  SELECT locked_until INTO v_locked_until 
  FROM public.login_attempts 
  WHERE email = pg_catalog.lower(pg_catalog.btrim(p_email));
  
  IF v_locked_until IS NOT NULL AND v_locked_until > pg_catalog.now() THEN
    RETURN pg_catalog.json_build_object('allowed', false, 'locked_until', v_locked_until);
  END IF;
  
  RETURN pg_catalog.json_build_object('allowed', true);
END;
$$;

-- --------------------------------------------------------
-- RPC: record_failed_login
-- --------------------------------------------------------
CREATE OR REPLACE FUNCTION public.record_failed_login(p_email TEXT)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER 
SET search_path = ''
AS $$
DECLARE
  v_attempts INT;
  v_locked_until TIMESTAMP WITH TIME ZONE;
  v_email TEXT;
BEGIN
  IF p_email IS NULL OR pg_catalog.length(pg_catalog.btrim(p_email)) < 5 OR pg_catalog.length(pg_catalog.btrim(p_email)) > 255 THEN
    RAISE EXCEPTION 'Invalid email input';
  END IF;

  v_email := pg_catalog.lower(pg_catalog.btrim(p_email));

  -- Atomic Concurrency-Safe UPSERT with 15-minute failure window logic
  INSERT INTO public.login_attempts (email, attempts, last_attempt, locked_until)
  VALUES (v_email, 1, pg_catalog.now(), NULL)
  ON CONFLICT (email) DO UPDATE 
  SET 
    attempts = CASE 
                 WHEN public.login_attempts.last_attempt < (pg_catalog.now() - interval '15 minutes') THEN 1 
                 ELSE public.login_attempts.attempts + 1 
               END,
    last_attempt = pg_catalog.now(),
    locked_until = CASE 
                     WHEN public.login_attempts.last_attempt < (pg_catalog.now() - interval '15 minutes') THEN NULL
                     ELSE public.login_attempts.locked_until
                   END
  RETURNING attempts INTO v_attempts;

  -- Calculate exponential backoff locks (5 mins, 10 mins, 20 mins, etc) starting at 3 failures
  IF v_attempts >= 3 THEN
    v_locked_until := pg_catalog.now() + (5 * power(2, v_attempts - 3))::int * interval '1 minute';
  END IF;

  IF v_locked_until IS NOT NULL THEN
    UPDATE public.login_attempts 
    SET locked_until = v_locked_until 
    WHERE email = v_email;
    RETURN pg_catalog.json_build_object('locked', true, 'locked_until', v_locked_until, 'attempts', v_attempts);
  END IF;

  RETURN pg_catalog.json_build_object('locked', false, 'attempts', v_attempts);
END;
$$;

-- --------------------------------------------------------
-- RPC: reset_login_attempts
-- --------------------------------------------------------
CREATE OR REPLACE FUNCTION public.reset_login_attempts()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER 
SET search_path = ''
AS $$
DECLARE
  v_auth_email TEXT;
BEGIN
  -- Derive email cryptographically from the backend session, preventing client spoofing
  SELECT email INTO v_auth_email FROM auth.users WHERE id = (SELECT auth.uid());
  
  IF v_auth_email IS NULL OR pg_catalog.length(pg_catalog.btrim(v_auth_email)) < 5 THEN
    RAISE EXCEPTION 'Unauthorized to reset attempts. Valid backend identity required.';
  END IF;

  DELETE FROM public.login_attempts WHERE email = pg_catalog.lower(pg_catalog.btrim(v_auth_email));
END;
$$;


-- ============================================================
-- 5. RPC PRIVILEGE HARDENING
-- ============================================================

-- Explicitly revoke default direct execution from client/public roles for is_admin.
-- While revoked from PUBLIC/anon, the 'authenticated' role is GRANTed EXECUTE 
-- because PostgreSQL RLS policies evaluate functions using the calling role's privileges. 
-- Since admin policies are explicitly "FOR ALL TO authenticated", this role must have EXECUTE 
-- access. It accepts no parameters and securely derives state from the backend.
REVOKE ALL ON FUNCTION private.is_admin() FROM PUBLIC;
REVOKE ALL ON FUNCTION private.is_admin() FROM anon;
REVOKE ALL ON FUNCTION private.is_admin() FROM authenticated;
GRANT EXECUTE ON FUNCTION private.is_admin() TO authenticated;

-- Revoke default public execution for rate limiters
REVOKE ALL ON FUNCTION public.check_login_status(TEXT) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.check_login_status(TEXT) FROM anon;
REVOKE ALL ON FUNCTION public.check_login_status(TEXT) FROM authenticated;

REVOKE ALL ON FUNCTION public.record_failed_login(TEXT) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.record_failed_login(TEXT) FROM anon;
REVOKE ALL ON FUNCTION public.record_failed_login(TEXT) FROM authenticated;

REVOKE ALL ON FUNCTION public.reset_login_attempts() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.reset_login_attempts() FROM anon;
REVOKE ALL ON FUNCTION public.reset_login_attempts() FROM authenticated;

-- Grant precisely intended execution
GRANT EXECUTE ON FUNCTION public.check_login_status(TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.record_failed_login(TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.reset_login_attempts() TO authenticated;

-- Safely drop the old public.is_admin() function ONLY AFTER all dependent policies 
-- have been fully replaced and reconciled above.
DROP FUNCTION IF EXISTS public.is_admin();
