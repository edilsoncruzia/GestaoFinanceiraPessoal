-- Migração: novos campos em "accounts" (Contas e Cartões)
-- Execute no SQL Editor do Supabase uma única vez.

ALTER TABLE accounts ADD COLUMN IF NOT EXISTS initial_balance NUMERIC(12,2) DEFAULT 0;
ALTER TABLE accounts ADD COLUMN IF NOT EXISTS is_default BOOLEAN DEFAULT false;
ALTER TABLE accounts ADD COLUMN IF NOT EXISTS brand TEXT;
ALTER TABLE accounts ADD COLUMN IF NOT EXISTS current_invoice NUMERIC(12,2) DEFAULT 0;
