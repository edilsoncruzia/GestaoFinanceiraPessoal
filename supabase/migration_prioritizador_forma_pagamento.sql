-- ============================================================================
-- Migração: forma de pagamento (tópico #23 — item 4 e fluxo "Pagar fatura")
-- planned.forma_pagamento      : 'normal' | 'debito_automatico' | 'cartao' | 'pix_automatico'
-- transactions.forma_pagamento : marca o lançamento como pago via cartão ('cartao')
-- Execute no SQL Editor do Supabase uma única vez.
-- ============================================================================
ALTER TABLE planned ADD COLUMN IF NOT EXISTS forma_pagamento TEXT DEFAULT 'normal';
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS forma_pagamento TEXT;
