-- Compatibilidade com bases antigas. O login atual usa Supabase Auth.
ALTER TABLE members ADD COLUMN IF NOT EXISTS cpf TEXT;
