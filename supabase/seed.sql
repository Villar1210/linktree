-- This file contains instructions for seeding the database with initial data
-- Run after schema.sql

-- Note: Before running this, you need to create users through Supabase Auth
-- Then manually get their UUIDs to use as foreign keys

-- Example admin user (replace with actual UUID after creating in Supabase Auth)
-- INSERT INTO users (id, email, name, role) VALUES
--   ('your-admin-uuid-here', 'admin@luxeestate.com', 'Admin User', 'admin');

-- For now, properties can be inserted without user dependencies
-- You can migrate data from constants.ts manually or via migration script

-- Example:
-- INSERT INTO properties (title, description, price, type, bedrooms, bathrooms, area, address, city, state, images, featured, status)
-- VALUES (
--   'Residencial Vista do Parque',
--   'Apartamento moderno com vista panorâmica...',
--   480000,
--   'Apartamento',
--   3,
--   2,
--   85,
--   'Rua das Palmeiras, 123',
--   'São Paulo',
--   'SP',
--   ARRAY['https://images.unsplash.com/photo-1...'],
--   TRUE,
--   'active'
-- );

-- TODO: Create a migration script to bulk import data from constants.ts
