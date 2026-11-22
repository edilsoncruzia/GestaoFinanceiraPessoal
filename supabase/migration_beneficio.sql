-- Migração: dinheiro restrito (benefício / cartão alimentação)
-- Execute no SQL Editor do Supabase uma única vez.
-- Marca uma RECEITA do Previsto como restrita: o valor entra no dia do
-- vencimento, mas só pode pagar despesas da categoria indicada (ex.: alimentacao)
-- e NUNCA conta como caixa livre para as outras contas.
-- Esta coluna também é criada pela migração protect_household_finances.

ALTER TABLE planned ADD COLUMN IF NOT EXISTS restrito_categoria TEXT;
