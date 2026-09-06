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
  created_at TIMESTAMPTZ DEFAULT NOW()
);

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
  created_at TIMESTAMPTZ DEFAULT NOW()
);

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
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  amount NUMERIC(12,2) NOT NULL,
  due_date DATE NOT NULL,
  recurrence TEXT NOT NULL CHECK (recurrence IN ('unica', 'recorrente', 'parcelada')),
  installment_current INT,
  installment_total INT,
  priority TEXT DEFAULT 'importante' CHECK (priority IN ('essencial', 'importante', 'flexivel')),
  account_id BIGINT REFERENCES accounts(id) ON DELETE SET NULL,
  member_id BIGINT REFERENCES members(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

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

-- Habilitar Row Level Security (RLS) para segurança
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE planned ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;

-- Políticas de acesso anônimo/leitura e escrita (Para uso simples de chave anon/demo)
CREATE POLICY "Permitir acesso total em members" ON members FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Permitir acesso total em accounts" ON accounts FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Permitir acesso total em goals" ON goals FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Permitir acesso total em planned" ON planned FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Permitir acesso total em transactions" ON transactions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Permitir acesso total em budgets" ON budgets FOR ALL USING (true) WITH CHECK (true);
