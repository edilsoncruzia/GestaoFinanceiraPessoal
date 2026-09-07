-- Migração: Fontes (quem paga/recebe) + anexo/fonte por pagamento
-- Execute no SQL Editor do Supabase uma única vez.

CREATE TABLE IF NOT EXISTS sources (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  name TEXT NOT NULL,
  type TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE sources ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Permitir acesso total em sources" ON sources FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE transactions ADD COLUMN IF NOT EXISTS fonte_id BIGINT REFERENCES sources(id) ON DELETE SET NULL;
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS attachment_method TEXT;

ALTER TABLE planned ADD COLUMN IF NOT EXISTS fonte_id BIGINT REFERENCES sources(id) ON DELETE SET NULL;
