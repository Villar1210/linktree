-- =============================================
-- LUMIAR CONNECT CRM - DATABASE SCHEMA
-- =============================================
-- Sistema de CRM com Kanban, WhatsApp e Visão 360° do Cliente

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- =============================================
-- ENUMS
-- =============================================

-- Status do Deal
CREATE TYPE deal_status AS ENUM ('OPEN', 'WON', 'LOST');

-- Tipos de Atividade
CREATE TYPE activity_type AS ENUM (
  'NOTE',
  'CALL',
  'EMAIL',
  'WHATSAPP_MESSAGE',
  'MEETING',
  'STAGE_CHANGE'
);

-- Direção da Mensagem WhatsApp
CREATE TYPE message_direction AS ENUM ('INBOUND', 'OUTBOUND');

-- Status da Mensagem WhatsApp
CREATE TYPE message_status AS ENUM ('SENT', 'DELIVERED', 'READ', 'FAILED');

-- =============================================
-- TABELA: funnels (Funis de Vendas)
-- =============================================

CREATE TABLE funnels (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_funnels_active ON funnels(is_active);

-- =============================================
-- TABELA: stages (Estágios do Funil)
-- =============================================

CREATE TABLE stages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  funnel_id UUID NOT NULL REFERENCES funnels(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  order_index INTEGER NOT NULL,
  is_final_stage BOOLEAN DEFAULT FALSE,
  is_win_stage BOOLEAN DEFAULT FALSE,
  is_loss_stage BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  CONSTRAINT unique_funnel_order UNIQUE (funnel_id, order_index)
);

CREATE INDEX idx_stages_funnel ON stages(funnel_id);
CREATE INDEX idx_stages_order ON stages(funnel_id, order_index);

-- =============================================
-- TABELA: contacts (Contatos/Clientes)
-- =============================================

CREATE TABLE contacts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  first_name TEXT NOT NULL,
  last_name TEXT,
  email TEXT UNIQUE,
  phone TEXT,
  cpf TEXT UNIQUE,
  company_name TEXT,
  address_data JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_contacts_email ON contacts(email);
CREATE INDEX idx_contacts_phone ON contacts(phone);
CREATE INDEX idx_contacts_cpf ON contacts(cpf);
CREATE INDEX idx_contacts_search ON contacts USING GIN (
  to_tsvector('portuguese', first_name || ' ' || COALESCE(last_name, '') || ' ' || COALESCE(email, ''))
);

-- =============================================
-- TABELA: deals (Oportunidades/Cards)
-- =============================================

CREATE TABLE deals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  funnel_id UUID NOT NULL REFERENCES funnels(id) ON DELETE CASCADE,
  stage_id UUID NOT NULL REFERENCES stages(id) ON DELETE RESTRICT,
  contact_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  value DECIMAL(15, 2),
  expected_close_date DATE,
  owner_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  status deal_status NOT NULL DEFAULT 'OPEN',
  custom_fields JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_deals_funnel ON deals(funnel_id);
CREATE INDEX idx_deals_stage ON deals(stage_id);
CREATE INDEX idx_deals_contact ON deals(contact_id);
CREATE INDEX idx_deals_owner ON deals(owner_id);
CREATE INDEX idx_deals_status ON deals(status);
CREATE INDEX idx_deals_expected_close ON deals(expected_close_date);

-- =============================================
-- TABELA: activities (Feed de Atividades)
-- =============================================

CREATE TABLE activities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  deal_id UUID REFERENCES deals(id) ON DELETE CASCADE,
  contact_id UUID REFERENCES contacts(id) ON DELETE CASCADE,
  type activity_type NOT NULL,
  description TEXT NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  CONSTRAINT activity_link_check CHECK (deal_id IS NOT NULL OR contact_id IS NOT NULL)
);

CREATE INDEX idx_activities_deal ON activities(deal_id);
CREATE INDEX idx_activities_contact ON activities(contact_id);
CREATE INDEX idx_activities_timestamp ON activities(timestamp DESC);
CREATE INDEX idx_activities_user ON activities(user_id);

-- =============================================
-- TABELA: whatsapp_messages (Mensagens WhatsApp)
-- =============================================

CREATE TABLE whatsapp_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  deal_id UUID REFERENCES deals(id) ON DELETE SET NULL,
  contact_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  direction message_direction NOT NULL,
  message_content TEXT NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  status message_status NOT NULL DEFAULT 'SENT',
  waba_message_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_whatsapp_deal ON whatsapp_messages(deal_id);
CREATE INDEX idx_whatsapp_contact ON whatsapp_messages(contact_id);
CREATE INDEX idx_whatsapp_timestamp ON whatsapp_messages(timestamp DESC);
CREATE INDEX idx_whatsapp_waba_id ON whatsapp_messages(waba_message_id);

-- =============================================
-- TRIGGERS (Auto-update timestamps)
-- =============================================

-- Função de atualização de timestamp já existe
-- CREATE OR REPLACE FUNCTION update_updated_at_column() (já criada anteriormente)

CREATE TRIGGER update_funnels_updated_at BEFORE UPDATE ON funnels
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_stages_updated_at BEFORE UPDATE ON stages
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_contacts_updated_at BEFORE UPDATE ON contacts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_deals_updated_at BEFORE UPDATE ON deals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_activities_updated_at BEFORE UPDATE ON activities
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_whatsapp_messages_updated_at BEFORE UPDATE ON whatsapp_messages
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- TRIGGER: Auto-create activity on stage change
-- =============================================

CREATE OR REPLACE FUNCTION create_stage_change_activity()
RETURNS TRIGGER AS $$
BEGIN
  -- Só criar atividade se o estágio mudou
  IF OLD.stage_id IS DISTINCT FROM NEW.stage_id THEN
    INSERT INTO activities (
      deal_id,
      contact_id,
      type,
      description,
      user_id
    ) VALUES (
      NEW.id,
      NEW.contact_id,
      'STAGE_CHANGE',
      'Movido para ' || (SELECT name FROM stages WHERE id = NEW.stage_id),
      NEW.owner_id
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_deal_stage_change
  AFTER UPDATE ON deals
  FOR EACH ROW
  EXECUTE FUNCTION create_stage_change_activity();

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================

-- Enable RLS
ALTER TABLE funnels ENABLE ROW LEVEL SECURITY;
ALTER TABLE stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE whatsapp_messages ENABLE ROW LEVEL SECURITY;

-- =============================================
-- FUNNELS POLICIES
-- =============================================

-- Todos podem ver funis ativos
CREATE POLICY "Users can view active funnels"
  ON funnels FOR SELECT
  USING (is_active = TRUE OR EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
  ));

-- Apenas admins podem gerenciar funis
CREATE POLICY "Only admins can manage funnels"
  ON funnels FOR ALL
  USING (EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
  ));

-- =============================================
-- STAGES POLICIES
-- =============================================

-- Todos podem ver estágios de funis ativos
CREATE POLICY "Users can view stages"
  ON stages FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM funnels WHERE id = stages.funnel_id AND is_active = TRUE
  ) OR EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
  ));

-- Apenas admins podem gerenciar estágios
CREATE POLICY "Only admins can manage stages"
  ON stages FOR ALL
  USING (EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
  ));

-- =============================================
-- CONTACTS POLICIES
-- =============================================

-- Usuários autenticados podem ver contatos
CREATE POLICY "Authenticated users can view contacts"
  ON contacts FOR SELECT
  USING (auth.role() = 'authenticated');

-- Todos podem criar contatos
CREATE POLICY "Authenticated users can create contacts"
  ON contacts FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Usuários podem atualizar contatos
CREATE POLICY "Users can update contacts"
  ON contacts FOR UPDATE
  USING (auth.role() = 'authenticated');

-- Apenas admins podem deletar contatos
CREATE POLICY "Only admins can delete contacts"
  ON contacts FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
  ));

-- =============================================
-- DEALS POLICIES
-- =============================================

-- Usuários veem seus próprios deals ou são admin/agent
CREATE POLICY "Users can view own deals or all if admin/agent"
  ON deals FOR SELECT
  USING (
    owner_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role IN ('admin', 'agent')
    )
  );

-- Usuários podem criar deals
CREATE POLICY "Users can create deals"
  ON deals FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Usuários podem atualizar seus deals ou admins podem tudo
CREATE POLICY "Users can update own deals or admins all"
  ON deals FOR UPDATE
  USING (
    owner_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Apenas admins podem deletar deals
CREATE POLICY "Only admins can delete deals"
  ON deals FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
  ));

-- =============================================
-- ACTIVITIES POLICIES
-- =============================================

-- Usuários veem activities relacionadas aos seus deals
CREATE POLICY "Users can view related activities"
  ON activities FOR SELECT
  USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM deals 
      WHERE id = activities.deal_id AND owner_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'agent')
    )
  );

-- Usuários podem criar activities
CREATE POLICY "Users can create activities"
  ON activities FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- =============================================
-- WHATSAPP_MESSAGES POLICIES
-- =============================================

-- Usuários veem mensagens relacionadas aos seus deals/contacts
CREATE POLICY "Users can view related whatsapp messages"
  ON whatsapp_messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM deals 
      WHERE id = whatsapp_messages.deal_id AND owner_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'agent')
    )
  );

-- Usuários podem enviar mensagens
CREATE POLICY "Users can send whatsapp messages"
  ON whatsapp_messages FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- =============================================
-- DADOS INICIAIS (Funil Padrão)
-- =============================================

-- Nota: Inserir funil padrão depois via INSERT separado no Supabase
-- Removido \gset pois não funciona no editor SQL do Supabase
