-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable pg_trgm for text search
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- =============================================
-- ENUMS
-- =============================================

CREATE TYPE property_type AS ENUM ('Apartamento', 'Casa', 'Comercial', 'Terreno', 'Lançamento');
CREATE TYPE property_status AS ENUM ('active', 'sold', 'rented');
CREATE TYPE user_role AS ENUM ('admin', 'agent', 'buyer');
CREATE TYPE lead_status AS ENUM ('Novo', 'Em Triagem', 'Qualificado', 'Visita', 'Proposta', 'Negociação', 'Vendido', 'Não Qualificado', 'Arquivado');
CREATE TYPE lead_temperature AS ENUM ('hot', 'warm', 'cold');
CREATE TYPE activity_type AS ENUM ('call', 'meeting', 'email', 'visit', 'whatsapp', 'lunch', 'proposal', 'system_log');

-- =============================================
-- USERS TABLE
-- =============================================

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role user_role NOT NULL DEFAULT 'buyer',
  team TEXT,
  avatar TEXT,
  phone TEXT,
  favorites TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================
-- PROPERTIES TABLE
-- =============================================

CREATE TABLE properties (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  price NUMERIC NOT NULL,
  type property_type NOT NULL,
  bedrooms INTEGER NOT NULL DEFAULT 0,
  bathrooms INTEGER NOT NULL DEFAULT 0,
  suites INTEGER NOT NULL DEFAULT 0,
  area NUMERIC NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  images TEXT[] DEFAULT '{}',
  featured BOOLEAN DEFAULT FALSE,
  status property_status NOT NULL DEFAULT 'active',
  features TEXT[] DEFAULT '{}',
  campaign_ids TEXT[] DEFAULT '{}',
  
  -- Launch specific fields (nullable for non-launches)
  delivery_date TEXT,
  construction_progress INTEGER CHECK (construction_progress BETWEEN 0 AND 100),
  stage TEXT,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_properties_type ON properties(type);
CREATE INDEX idx_properties_city ON properties(city);
CREATE INDEX idx_properties_price ON properties(price);
CREATE INDEX idx_properties_status ON properties(status);
CREATE INDEX idx_properties_featured ON properties(featured);

-- Full text search index
CREATE INDEX idx_properties_search ON properties USING GIN (to_tsvector('portuguese', title || ' ' || description || ' ' || address));

-- =============================================
-- LEADS TABLE
-- =============================================

CREATE TABLE leads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT NOT NULL,
  status lead_status NOT NULL DEFAULT 'Novo',
  interest TEXT,
  notes TEXT[] DEFAULT '{}',
  tasks JSONB DEFAULT '[]'::jsonb,
  tags TEXT[] DEFAULT '{}',
  source TEXT,
  value NUMERIC,
  
  -- CRM Intelligence
  temperature lead_temperature,
  last_interaction TIMESTAMPTZ,
  probability INTEGER CHECK (probability BETWEEN 0 AND 100),
  assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
  lost_reason TEXT,
  
  -- Enterprise Features
  score INTEGER CHECK (score BETWEEN 0 AND 100),
  documents JSONB DEFAULT '[]'::jsonb,
  enriched_data JSONB,
  script_data JSONB,
  
  -- Detailed Registration
  profile JSONB,
  address JSONB,
  preferences JSONB,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_leads_status ON leads(status);
CREATE INDEX idx_leads_temperature ON leads(temperature);
CREATE INDEX idx_leads_assigned_to ON leads(assigned_to);
CREATE INDEX idx_leads_created_at ON leads(created_at DESC);

-- =============================================
-- CAMPAIGNS TABLE
-- =============================================

CREATE TABLE campaigns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  discount_percentage INTEGER,
  valid_until TEXT NOT NULL,
  active BOOLEAN DEFAULT TRUE,
  image TEXT,
  cta_link TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================
-- JOBS TABLE
-- =============================================

CREATE TABLE jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('CLT', 'PJ', 'Estágio')),
  description TEXT NOT NULL,
  department TEXT NOT NULL,
  requirements TEXT[] DEFAULT '{}',
  benefits TEXT[] DEFAULT '{}',
  location TEXT NOT NULL,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================
-- TRIGGERS (Auto-update timestamps)
-- =============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_properties_updated_at BEFORE UPDATE ON properties
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_leads_updated_at BEFORE UPDATE ON leads
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_campaigns_updated_at BEFORE UPDATE ON campaigns
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_jobs_updated_at BEFORE UPDATE ON jobs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;

-- USERS POLICIES
CREATE POLICY "Users can view their own profile"
  ON users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON users FOR UPDATE
  USING (auth.uid() = id);

-- PROPERTIES POLICIES
CREATE POLICY "Everyone can view active properties"
  ON properties FOR SELECT
  USING (status = 'active' OR auth.role() = 'authenticated');

CREATE POLICY "Only admins can insert properties"
  ON properties FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Only admins can update properties"
  ON properties FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Only admins can delete properties"
  ON properties FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- LEADS POLICIES
CREATE POLICY "Admins and agents can view all leads"
  ON leads FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role IN ('admin', 'agent')
    )
  );

CREATE POLICY "Admins and agents can create leads"
  ON leads FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role IN ('admin', 'agent')
    )
  );

CREATE POLICY "Admins and agents can update leads"
  ON leads FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role IN ('admin', 'agent')
    )
  );

CREATE POLICY "Only admins can delete leads"
  ON leads FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- CAMPAIGNS POLICIES
CREATE POLICY "Everyone can view active campaigns"
  ON campaigns FOR SELECT
  USING (active = TRUE);

CREATE POLICY "Only admins can manage campaigns"
  ON campaigns FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- JOBS POLICIES
CREATE POLICY "Everyone can view active jobs"
  ON jobs FOR SELECT
  USING (active = TRUE);

CREATE POLICY "Only admins can manage jobs"
  ON jobs FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
