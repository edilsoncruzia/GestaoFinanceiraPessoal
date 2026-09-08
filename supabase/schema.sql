-- Script de criação do Schema para o Supabase (Gestão Financeira Pessoal)
-- Cole este código no SQL Editor do seu projeto Supabase e clique em RUN.

-- 1. Habilitar a extensão UUID se necessário
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Tabela de Membros da Família / Casal
CREATE TABLE IF NOT EXISTS members (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  name TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT '#1F5D4C',
  email TEXT,
  cpf TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE members ADD COLUMN IF NOT EXISTS cpf TEXT;

-- Inserir membros padrões se a tabela estiver vazia
INSERT INTO members (id, name, color, email)
OVERRIDING SYSTEM VALUE
VALUES 
  (1, 'Você', '#1F5D4C', 'voce@gmail.com'),
  (2, 'Esposa', '#8A5B7A', 'esposa@gmail.com')
ON CONFLICT (id) DO NOTHING;

-- 3. Tabela de Contas Bancárias e Cartões
CREATE TABLE IF NOT EXISTS accounts (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('conta', 'cartao')),
  bank TEXT,
  color TEXT DEFAULT '#1F5D4C',
  limit_amount NUMERIC(12,2) DEFAULT 0,
  closing_day INT,
  due_day INT,
  member_id BIGINT REFERENCES members(id) ON DELETE SET NULL,
  initial_balance NUMERIC(12,2) DEFAULT 0,
  is_default BOOLEAN DEFAULT false,
  brand TEXT,
  current_invoice NUMERIC(12,2) DEFAULT 0,
  count_in_available BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Migração (para bancos já existentes) — adiciona colunas caso ainda não existam
ALTER TABLE accounts ADD COLUMN IF NOT EXISTS initial_balance NUMERIC(12,2) DEFAULT 0;
ALTER TABLE accounts ADD COLUMN IF NOT EXISTS is_default BOOLEAN DEFAULT false;
ALTER TABLE accounts ADD COLUMN IF NOT EXISTS brand TEXT;
ALTER TABLE accounts ADD COLUMN IF NOT EXISTS current_invoice NUMERIC(12,2) DEFAULT 0;
ALTER TABLE accounts ADD COLUMN IF NOT EXISTS count_in_available BOOLEAN DEFAULT true;

-- 4. Tabela de Metas de Economia
CREATE TABLE IF NOT EXISTS goals (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  name TEXT NOT NULL,
  target NUMERIC(12,2) NOT NULL DEFAULT 0,
  saved NUMERIC(12,2) NOT NULL DEFAULT 0,
  member_id BIGINT REFERENCES members(id) ON DELETE SET NULL,
  account_id BIGINT REFERENCES accounts(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Tabela de Compromissos Previstos (Receitas/Despesas Planejadas)
CREATE TABLE IF NOT EXISTS planned (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense', 'transferencia')),
  category TEXT,
  description TEXT NOT NULL,
  amount NUMERIC(12,2) NOT NULL,
  due_date DATE NOT NULL,
  recurrence TEXT NOT NULL CHECK (recurrence IN ('unica', 'recorrente', 'parcelada')),
  installment_current INT,
  installment_total INT,
  priority TEXT DEFAULT 'importante' CHECK (priority IN ('essencial', 'importante', 'flexivel')),
  account_id BIGINT REFERENCES accounts(id) ON DELETE SET NULL,
  from_account_id BIGINT REFERENCES accounts(id) ON DELETE SET NULL,
  to_account_id BIGINT REFERENCES accounts(id) ON DELETE SET NULL,
  member_id BIGINT REFERENCES members(id) ON DELETE SET NULL,
  periodicity TEXT,
  realized BOOLEAN DEFAULT false,
  attachment TEXT,
  attachment_method TEXT,
  skipped_months TEXT,
  end_month TEXT,
  salary_deductions TEXT,
  include_in_ir BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Migração (para bancos já existentes)
ALTER TABLE planned DROP CONSTRAINT IF EXISTS planned_type_check;
ALTER TABLE planned ADD CONSTRAINT planned_type_check CHECK (type IN ('income', 'expense', 'transferencia'));
ALTER TABLE planned ADD COLUMN IF NOT EXISTS from_account_id BIGINT REFERENCES accounts(id) ON DELETE SET NULL;
ALTER TABLE planned ADD COLUMN IF NOT EXISTS to_account_id BIGINT REFERENCES accounts(id) ON DELETE SET NULL;
ALTER TABLE planned ADD COLUMN IF NOT EXISTS periodicity TEXT;
ALTER TABLE planned ADD COLUMN IF NOT EXISTS realized BOOLEAN DEFAULT false;
ALTER TABLE planned ADD COLUMN IF NOT EXISTS attachment TEXT;
ALTER TABLE planned ADD COLUMN IF NOT EXISTS attachment_method TEXT;
ALTER TABLE planned ADD COLUMN IF NOT EXISTS skipped_months TEXT;
ALTER TABLE planned ADD COLUMN IF NOT EXISTS end_month TEXT;
ALTER TABLE planned ADD COLUMN IF NOT EXISTS salary_deductions TEXT;
ALTER TABLE planned ADD COLUMN IF NOT EXISTS include_in_ir BOOLEAN DEFAULT false;

-- 6. Tabela de Transações Efetivadas
CREATE TABLE IF NOT EXISTS transactions (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  date DATE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense', 'transferencia')),
  category TEXT,
  description TEXT NOT NULL,
  amount NUMERIC(12,2) NOT NULL,
  account_id BIGINT REFERENCES accounts(id) ON DELETE SET NULL,
  from_account_id BIGINT REFERENCES accounts(id) ON DELETE SET NULL,
  to_account_id BIGINT REFERENCES accounts(id) ON DELETE SET NULL,
  member_id BIGINT REFERENCES members(id) ON DELETE SET NULL,
  planned_id BIGINT REFERENCES planned(id) ON DELETE SET NULL,
  attachment TEXT,
  include_in_ir BOOLEAN DEFAULT false,
  deducted_in_payroll BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Tabela de Orçamentos por Categoria
CREATE TABLE IF NOT EXISTS budgets (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  category TEXT NOT NULL,
  limit_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  member_id BIGINT REFERENCES members(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Tabela de Fontes (de quem recebe / para quem paga)
CREATE TABLE IF NOT EXISTS sources (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  name TEXT NOT NULL,
  type TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Migração (para bancos já existentes)
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS fonte_id BIGINT REFERENCES sources(id) ON DELETE SET NULL;
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS attachment_method TEXT;
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS include_in_ir BOOLEAN DEFAULT false;
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS deducted_in_payroll BOOLEAN DEFAULT false;
ALTER TABLE planned ADD COLUMN IF NOT EXISTS fonte_id BIGINT REFERENCES sources(id) ON DELETE SET NULL;

-- 9. Tabela de Categorias (receitas/despesas personalizáveis)
CREATE TABLE IF NOT EXISTS categories (
  key TEXT PRIMARY KEY,
  label TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT '#1F5D4C',
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. Tabela de Ideias de Ajustes e Melhorias
CREATE TABLE IF NOT EXISTS ideas (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  text TEXT NOT NULL,
  done BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Habilitar Row Level Security (RLS) para segurança
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE planned ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE ideas ENABLE ROW LEVEL SECURITY;

-- Políticas de acesso anônimo/leitura e escrita (Para uso simples de chave anon/demo)
CREATE POLICY "Permitir acesso total em members" ON members FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Permitir acesso total em accounts" ON accounts FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Permitir acesso total em goals" ON goals FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Permitir acesso total em planned" ON planned FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Permitir acesso total em transactions" ON transactions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Permitir acesso total em budgets" ON budgets FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Permitir acesso total em sources" ON sources FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Permitir acesso total em categories" ON categories FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Permitir acesso total em ideas" ON ideas FOR ALL USING (true) WITH CHECK (true);
