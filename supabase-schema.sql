-- =============================================================
-- Schema SQL para o Supabase - Pro-Saude
-- Execute este script no SQL Editor do Supabase Dashboard
-- =============================================================

-- Tabela de protocolos
CREATE TABLE protocols (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  department TEXT[] DEFAULT '{}',
  category TEXT NOT NULL,
  priority TEXT DEFAULT 'media',
  status TEXT DEFAULT 'rascunho',
  content JSONB,
  steps JSONB DEFAULT '[]'::jsonb,
  flowchart JSONB,
  version TEXT DEFAULT '1.0',
  approved_by TEXT,
  approved_date DATE,
  tags TEXT[] DEFAULT '{}',
  pdf_url TEXT,
  attachments TEXT[] DEFAULT '{}',
  created_by UUID REFERENCES auth.users(id),
  created_date TIMESTAMPTZ DEFAULT now(),
  updated_date TIMESTAMPTZ DEFAULT now()
);

-- Tabela de opcoes customizaveis (setores, categorias, prioridades, status)
CREATE TABLE custom_options (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  list_name TEXT NOT NULL,
  display_name TEXT,
  options TEXT[] DEFAULT '{}',
  created_date TIMESTAMPTZ DEFAULT now(),
  updated_date TIMESTAMPTZ DEFAULT now()
);

-- Perfis de usuario (espelha auth.users com campos do app)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  full_name TEXT,
  email TEXT,
  department TEXT,
  position TEXT,
  role TEXT DEFAULT 'user',
  avatar_url TEXT,
  created_date TIMESTAMPTZ DEFAULT now()
);

-- =============================================================
-- Trigger para atualizar updated_date automaticamente
-- =============================================================
CREATE OR REPLACE FUNCTION update_updated_date()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_date = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER protocols_updated_date
  BEFORE UPDATE ON protocols
  FOR EACH ROW EXECUTE FUNCTION update_updated_date();

CREATE TRIGGER custom_options_updated_date
  BEFORE UPDATE ON custom_options
  FOR EACH ROW EXECUTE FUNCTION update_updated_date();

-- =============================================================
-- Trigger para criar perfil automaticamente ao registrar usuario
-- =============================================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- =============================================================
-- Row Level Security (RLS)
-- =============================================================

-- Habilitar RLS
ALTER TABLE protocols ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Protocols: usuarios autenticados podem ler, admins podem tudo
CREATE POLICY "Authenticated users can read protocols"
  ON protocols FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert protocols"
  ON protocols FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update protocols"
  ON protocols FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can delete protocols"
  ON protocols FOR DELETE
  TO authenticated
  USING (true);

-- Custom Options: leitura para todos autenticados, escrita para todos autenticados
CREATE POLICY "Authenticated users can read custom_options"
  ON custom_options FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert custom_options"
  ON custom_options FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update custom_options"
  ON custom_options FOR UPDATE
  TO authenticated
  USING (true);

-- Profiles: usuarios podem ver todos os perfis, editar apenas o proprio
CREATE POLICY "Authenticated users can read profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- =============================================================
-- Dados iniciais (opcoes padroes)
-- =============================================================
INSERT INTO custom_options (list_name, display_name, options) VALUES
  ('department_options', 'Setores', ARRAY['Atencao Primaria', 'Atencao Especializada', 'Saude Mental', 'Vigilancia em Saude']),
  ('category_options', 'Categorias', ARRAY['procedimento', 'diagnostico', 'tratamento', 'prevencao']),
  ('priority_options', 'Prioridades', ARRAY['Baixa', 'Media', 'Alta', 'Critica']),
  ('status_options', 'Status', ARRAY['Rascunho', 'Revisao', 'Aprovado', 'Arquivado']);
