-- =============================================
-- LIMPAR TIPOS CONFLITANTES (se existirem)
-- =============================================
-- Execute este SQL ANTES do lumiar_schema.sql

-- Deletar tipo activity_type antigo (se existir)
DROP TYPE IF EXISTS activity_type CASCADE;

-- Agora você pode rodar o lumiar_schema.sql normalmente
