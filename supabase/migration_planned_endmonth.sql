-- Migração: fim opcional para séries recorrentes (planned.end_month)
-- Usado ao editar "este e os próximos" em um lançamento recorrente.
-- Execute no SQL Editor do Supabase uma única vez.

ALTER TABLE planned ADD COLUMN IF NOT EXISTS end_month TEXT;
