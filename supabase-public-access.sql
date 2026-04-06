-- =============================================================
-- Atualizar RLS para acesso publico (sem autenticacao)
-- Execute no SQL Editor do Supabase Dashboard
-- =============================================================

-- Remover policies antigas (que exigem authenticated)
DROP POLICY IF EXISTS "Authenticated users can read protocols" ON protocols;
DROP POLICY IF EXISTS "Authenticated users can insert protocols" ON protocols;
DROP POLICY IF EXISTS "Authenticated users can update protocols" ON protocols;
DROP POLICY IF EXISTS "Authenticated users can delete protocols" ON protocols;

DROP POLICY IF EXISTS "Authenticated users can read custom_options" ON custom_options;
DROP POLICY IF EXISTS "Authenticated users can insert custom_options" ON custom_options;
DROP POLICY IF EXISTS "Authenticated users can update custom_options" ON custom_options;

DROP POLICY IF EXISTS "Authenticated users can read profiles" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

-- Criar policies de acesso publico (anon + authenticated)
CREATE POLICY "Public read protocols" ON protocols FOR SELECT USING (true);
CREATE POLICY "Public insert protocols" ON protocols FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update protocols" ON protocols FOR UPDATE USING (true);
CREATE POLICY "Public delete protocols" ON protocols FOR DELETE USING (true);

CREATE POLICY "Public read custom_options" ON custom_options FOR SELECT USING (true);
CREATE POLICY "Public insert custom_options" ON custom_options FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update custom_options" ON custom_options FOR UPDATE USING (true);
CREATE POLICY "Public delete custom_options" ON custom_options FOR DELETE USING (true);

CREATE POLICY "Public read profiles" ON profiles FOR SELECT USING (true);
CREATE POLICY "Public insert profiles" ON profiles FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update profiles" ON profiles FOR UPDATE USING (true);
