-- Migração: novos campos em "planned" (Previstos)
-- Execute no SQL Editor do Supabase uma única vez.

-- Permitir o tipo "transferencia"
ALTER TABLE planned DROP CONSTRAINT IF EXISTS planned_type_check;
ALTER TABLE planned ADD CONSTRAINT planned_type_check CHECK (type IN ('income', 'expense', 'transferencia'));

-- Novas colunas
ALTER TABLE planned ADD COLUMN IF NOT EXISTS from_account_id BIGINT REFERENCES accounts(id) ON DELETE SET NULL;
ALTER TABLE planned ADD COLUMN IF NOT EXISTS to_account_id BIGINT REFERENCES accounts(id) ON DELETE SET NULL;
ALTER TABLE planned ADD COLUMN IF NOT EXISTS periodicity TEXT;
ALTER TABLE planned ADD COLUMN IF NOT EXISTS realized BOOLEAN DEFAULT false;
ALTER TABLE planned ADD COLUMN IF NOT EXISTS attachment TEXT;
ALTER TABLE planned ADD COLUMN IF NOT EXISTS attachment_method TEXT;
