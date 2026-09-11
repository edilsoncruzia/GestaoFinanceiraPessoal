-- Migração: configurações do app (ex.: teto da Reserva mínima)
-- Execute no SQL Editor do Supabase uma única vez.
-- Opcional: sem esta tabela o app continua funcionando (a configuração fica
-- salva no LocalStorage do dispositivo).

CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Permitir acesso total em settings" ON settings FOR ALL USING (true) WITH CHECK (true);
