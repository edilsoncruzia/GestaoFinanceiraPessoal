-- Migração: configurações do app (ex.: teto da Reserva mínima)
-- Execute no SQL Editor do Supabase uma única vez.
-- Esta tabela também é criada pela migração protect_household_finances.

CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
