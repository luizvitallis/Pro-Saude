-- =============================================================
-- Policies de Storage para acesso publico
-- Execute no SQL Editor do Supabase Dashboard
-- =============================================================

-- Permitir upload publico no bucket protocol-files
CREATE POLICY "Public upload protocol-files"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'protocol-files');

-- Permitir leitura publica
CREATE POLICY "Public read protocol-files"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'protocol-files');

-- Permitir atualizacao publica
CREATE POLICY "Public update protocol-files"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'protocol-files');

-- Permitir exclusao publica
CREATE POLICY "Public delete protocol-files"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'protocol-files');
