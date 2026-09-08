-- Migração: Autenticação (login por CPF + senha e Google)
-- Execute no SQL Editor do Supabase uma única vez.

-- CPF do membro (usado no login por CPF + senha)
ALTER TABLE members ADD COLUMN IF NOT EXISTS cpf TEXT;

-- Defina o CPF do membro conectado (substitua pelos seus dados):
-- UPDATE members SET cpf = '00000000000', email = 'seu.email@gmail.com' WHERE id = 1;
