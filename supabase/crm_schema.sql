-- =============================================
-- CRM DYNAMIC SCHEMA
-- =============================================

-- 1. Create Funnels Table
CREATE TABLE IF NOT EXISTS funnels (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Create Stages Table
CREATE TABLE IF NOT EXISTS stages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  funnel_id UUID REFERENCES funnels(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  order_index INTEGER NOT NULL DEFAULT 0,
  is_final_stage BOOLEAN DEFAULT FALSE,
  is_win_stage BOOLEAN DEFAULT FALSE,
  is_loss_stage BOOLEAN DEFAULT FALSE,
  color TEXT DEFAULT 'gray',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Modify Leads Table (or create Deals if preferred, but extending leads is easier for now)
-- Adding columns for dynamic pipeline
ALTER TABLE leads ADD COLUMN IF NOT EXISTS funnel_id UUID REFERENCES funnels(id);
ALTER TABLE leads ADD COLUMN IF NOT EXISTS stage_id UUID REFERENCES stages(id);

-- 4. Enable RLS
ALTER TABLE funnels ENABLE ROW LEVEL SECURITY;
ALTER TABLE stages ENABLE ROW LEVEL SECURITY;

-- 5. Policies for Funnels
CREATE POLICY "Everyone can view active funnels"
  ON funnels FOR SELECT
  USING (is_active = TRUE);

CREATE POLICY "Only admins can manage funnels"
  ON funnels FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- 6. Policies for Stages
CREATE POLICY "Everyone can view stages"
  ON stages FOR SELECT
  USING (TRUE);

CREATE POLICY "Only admins can manage stages"
  ON stages FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- 7. Triggers for updated_at
CREATE TRIGGER update_funnels_updated_at BEFORE UPDATE ON funnels
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_stages_updated_at BEFORE UPDATE ON stages
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- SEED DATA (Default Funnel)
-- =============================================

DO $$
DECLARE
  v_funnel_id UUID;
BEGIN
  -- Insert Default Funnel if not exists
  IF NOT EXISTS (SELECT 1 FROM funnels WHERE name = 'Pipeline de Vendas Padrão') THEN
    INSERT INTO funnels (name, description, is_active)
    VALUES ('Pipeline de Vendas Padrão', 'Funil padrão para gestão de oportunidades imobiliárias', TRUE)
    RETURNING id INTO v_funnel_id;

    -- Insert Stages for this funnel
    INSERT INTO stages (funnel_id, name, order_index, is_final_stage, is_win_stage, is_loss_stage, color) VALUES
    (v_funnel_id, 'Novo Lead', 0, FALSE, FALSE, FALSE, 'blue'),
    (v_funnel_id, 'Qualificação', 1, FALSE, FALSE, FALSE, 'cyan'),
    (v_funnel_id, 'Visita', 2, FALSE, FALSE, FALSE, 'purple'),
    (v_funnel_id, 'Proposta', 3, FALSE, FALSE, FALSE, 'orange'),
    (v_funnel_id, 'Negociação', 4, FALSE, FALSE, FALSE, 'amber'),
    (v_funnel_id, 'Fechado/Ganho', 5, TRUE, TRUE, FALSE, 'green'),
    (v_funnel_id, 'Perdido', 6, TRUE, FALSE, TRUE, 'red');
  END IF;
END $$;
