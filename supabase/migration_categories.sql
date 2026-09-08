-- Migração: Categorias personalizáveis + flag "Considerar no saldo disponível"
-- Execute no SQL Editor do Supabase uma única vez.

-- 1. Contas: opção de considerar (ou não) a conta no saldo disponível
ALTER TABLE accounts ADD COLUMN IF NOT EXISTS count_in_available BOOLEAN DEFAULT true;

-- 2. Tabela de categorias (receitas/despesas personalizáveis)
CREATE TABLE IF NOT EXISTS categories (
  key TEXT PRIMARY KEY,
  label TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT '#1F5D4C',
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Permitir acesso total em categories" ON categories FOR ALL USING (true) WITH CHECK (true);

-- 3. (Opcional) Semeia as categorias padrão, caso a tabela esteja vazia.
--    O próprio app também semeia automaticamente na primeira carga.
INSERT INTO categories (key, label, color, type) VALUES
  ('moradia', 'Aluguel', '#1F5D4C', 'expense'),
  ('contas', 'Contas', '#2E6B72', 'expense'),
  ('alimentacao', 'Alimentação', '#C98A3B', 'expense'),
  ('transporte', 'Transporte', '#3B6E8F', 'expense'),
  ('lazer', 'Lazer', '#8A5B7A', 'expense'),
  ('saude', 'Saúde', '#A6432F', 'expense'),
  ('educacao', 'Educação', '#5C7A3F', 'expense'),
  ('assinaturas', 'Assinaturas', '#6B6558', 'expense'),
  ('outros', 'Outros', '#9C8F6B', 'expense'),
  ('poupanca', 'Poupança/Meta', '#2E6B72', 'expense'),
  ('salario', 'Salário', '#1F5D4C', 'income'),
  ('freelance', 'Freelance', '#3B8F6E', 'income'),
  ('investimentos', 'Investimentos', '#2E6B72', 'income')
ON CONFLICT (key) DO NOTHING;
