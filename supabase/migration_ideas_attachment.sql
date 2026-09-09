-- Migração: Ajustes e Melhorias — permitir anexar imagem/documento às ideias
-- Execute no SQL Editor do Supabase uma única vez.

ALTER TABLE ideas ADD COLUMN IF NOT EXISTS attachment TEXT;
ALTER TABLE ideas ADD COLUMN IF NOT EXISTS attachment_method TEXT;
