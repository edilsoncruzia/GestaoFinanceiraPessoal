-- Migração: Ajustes e Melhorias (registro de ideias)
-- Execute no SQL Editor do Supabase uma única vez.

CREATE TABLE IF NOT EXISTS ideas (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  text TEXT NOT NULL,
  done BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE ideas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Permitir acesso total em ideas" ON ideas FOR ALL USING (true) WITH CHECK (true);
