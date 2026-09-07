-- Migração: meses pulados em "planned" (excluir apenas a ocorrência atual)
-- Execute no SQL Editor do Supabase uma única vez.

ALTER TABLE planned ADD COLUMN IF NOT EXISTS skipped_months TEXT;
