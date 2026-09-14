-- =================================================================================
-- FINAL SUPABASE SECURITY VERIFICATION SCRIPT (PRE-PRODUCTION)
-- Jesus Is With Us Ministries
-- Generated on: 2026-09-08
-- =================================================================================
-- This script is READ-ONLY. It safely queries PostgreSQL system catalogs to verify
-- the security configuration without modifying any data or exposing PII.
-- =================================================================================

-- =================================================================================
-- PREFLIGHT POLICY INVENTORY (READ-ONLY)
-- Run this BEFORE migration to inspect existing policies on target tables.
-- =================================================================================
SELECT 
    tablename, 
    policyname, 
    roles, 
    cmd, 
    qual as using_expression, 
    with_check as with_check_expression
FROM pg_policies
WHERE schemaname = 'public' 
  AND tablename IN ('admin_users', 'rhema_words', 'categories', 'events', 'gallery_images', 'playlists', 'site_settings', 'contact_messages', 'popups', 'app_statistics', 'subscribers', 'login_attempts')
ORDER BY tablename, policyname;

-- 1. VERIFY RLS IS ENABLED ON ALL TABLES
SELECT 
    schemaname, 
    tablename, 
    rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY tablename;

-- 2. VERIFY EVERY RLS POLICY BY TABLE
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual as using_expression,
    with_check as with_check_expression
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- 3. VERIFY NO INSECURE AUTHENTICATED OVERLAYS REMAIN
-- This query must return ZERO rows. If it returns rows, insecure legacy policies still exist.
SELECT 
    tablename, policyname, qual 
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename IN ('admin_users', 'rhema_words', 'categories', 'events', 'gallery_images', 'playlists', 'site_settings', 'contact_messages', 'popups', 'app_statistics', 'subscribers', 'login_attempts')
  AND qual LIKE '%auth.uid() IS NOT NULL%';

-- 4. VERIFY POLICY RECONCILIATION AUDIT
-- Detect any active policies on the 12 target tables that are NOT part of our strict security matrix.
-- This query should return ZERO rows for unexpected policies.
SELECT 
    tablename, policyname
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('admin_users', 'rhema_words', 'categories', 'events', 'gallery_images', 'playlists', 'site_settings', 'contact_messages', 'popups', 'app_statistics', 'subscribers', 'login_attempts')
  AND policyname NOT IN (
    'Admins can manage admin_users',
    'Public can read published rhema_words', 'Admins can manage rhema_words',
    'Public can read categories', 'Admins can manage categories',
    'Public can read published events', 'Admins can manage events',
    'Public can read published gallery_images', 'Admins can manage gallery_images',
    'Public can read playlists', 'Admins can manage playlists',
    'Public can read site_settings', 'Admins can manage site_settings',
    'Public can insert contact_messages', 'Admins can manage contact_messages',
    'Public can insert subscribers', 'Admins can manage subscribers',
    'Public can read active popups', 'Admins can manage popups',
    'Admins can manage app_statistics',
    'Deny direct SELECT on login_attempts', 'Deny direct INSERT on login_attempts', 'Deny direct UPDATE on login_attempts', 'Deny direct DELETE on login_attempts'
  );

-- 5. VERIFY SECURITY DEFINER FUNCTIONS AND SAFE SEARCH PATH
-- Ensures check_login_status, record_failed_login, and reset_login_attempts also use search_path = ''
SELECT 
    n.nspname AS schema_name,
    p.proname AS function_name,
    p.prosecdef AS is_security_definer,
    CASE WHEN 'search_path=""' = ANY(p.proconfig) OR 'search_path=' = ANY(p.proconfig) OR array_to_string(p.proconfig, ',') LIKE '%search_path=""%' THEN 'PASS' ELSE 'FAIL' END AS search_path_check
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE p.proname IN ('is_admin', 'check_login_status', 'record_failed_login', 'reset_login_attempts');

-- 6. VERIFY EXECUTE PRIVILEGES ON SECURITY DEFINER FUNCTIONS
SELECT 
    routine_schema, 
    routine_name, 
    grantee, 
    privilege_type 
FROM information_schema.routine_privileges 
WHERE routine_name IN ('is_admin', 'check_login_status', 'record_failed_login', 'reset_login_attempts')
ORDER BY routine_name, grantee;

-- 7. TABLE GRANT AUDIT FOR ANON AND AUTHENTICATED
-- Verify actual table privileges match intended RLS matrix. Do not assume RLS alone proves authorization.
SELECT 
    grantee, 
    table_schema, 
    table_name, 
    privilege_type
FROM information_schema.role_table_grants
WHERE table_schema = 'public' 
  AND grantee IN ('anon', 'authenticated')
  AND table_name IN ('admin_users', 'rhema_words', 'categories', 'events', 'gallery_images', 'playlists', 'site_settings', 'contact_messages', 'popups', 'app_statistics', 'subscribers', 'login_attempts')
ORDER BY table_name, grantee, privilege_type;

-- 8. SCHEMA EXPOSURE AUDIT
-- Verify 'private' is not exposed in PostgREST schemas.
-- Expected output: 'private' should NOT be in this list.
SELECT current_setting('pgrst.db_schema', true) AS exposed_schemas;

-- 9. VERIFY PUBLIC.IS_ADMIN DOES NOT EXIST
SELECT COUNT(*) AS public_is_admin_count 
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public' AND p.proname = 'is_admin';

-- 10. VERIFY ADMIN_USERS TABLE STRUCTURE
SELECT 
    column_name, 
    data_type, 
    is_nullable 
FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'admin_users';

-- 11. VERIFY LOGIN_ATTEMPTS TABLE STRUCTURE
SELECT 
    column_name, 
    data_type, 
    is_nullable 
FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'login_attempts';
