-- =============================================
-- RESET SCRIPT - Apaga tudo e recria do zero
-- =============================================

-- Drop tables (cascade remove constraints)
DROP TABLE IF EXISTS jobs CASCADE;
DROP TABLE IF EXISTS campaigns CASCADE;
DROP TABLE IF EXISTS leads CASCADE;
DROP TABLE IF EXISTS properties CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Drop types
DROP TYPE IF EXISTS activity_type CASCADE;
DROP TYPE IF EXISTS lead_temperature CASCADE;
DROP TYPE IF EXISTS lead_status CASCADE;
DROP TYPE IF EXISTS user_role CASCADE;
DROP TYPE IF EXISTS property_status CASCADE;
DROP TYPE IF EXISTS property_type CASCADE;

-- Drop function
DROP FUNCTION IF EXISTS update_updated_at_column CASCADE;

-- Now you can run the main schema.sql without errors!
