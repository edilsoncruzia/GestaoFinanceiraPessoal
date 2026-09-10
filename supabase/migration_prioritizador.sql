-- ============================================================================
-- Migração: Campos do Motor de Priorização Inteligente de Contas (tópico #23)
-- Fonte: Documentacao_Motor_Priorizacao_v1.1.pdf — Seção 2 e 2.1
-- Alvo: tabela "planned" (entidade Despesa / compromissos previstos)
-- Os campos são OPCIONAIS com DEFAULTS definidos por categoria (Seção 2.1),
-- portanto NÃO quebram registros de despesas já existentes.
-- Execute no SQL Editor do Supabase uma única vez.
-- ============================================================================

-- Colunas novas (8 campos + valor_minimo, usado na varredura da Seção 4.2)
ALTER TABLE planned ADD COLUMN IF NOT EXISTS multa_fixa_porcentagem NUMERIC(5,2) DEFAULT 2.0;
ALTER TABLE planned ADD COLUMN IF NOT EXISTS multa_fixa_valor NUMERIC(12,2) DEFAULT 0.0;
ALTER TABLE planned ADD COLUMN IF NOT EXISTS taxa_juros_diaria NUMERIC(6,3) DEFAULT 0.033;
ALTER TABLE planned ADD COLUMN IF NOT EXISTS taxa_juros_mensal NUMERIC(5,2) DEFAULT 0.0;
ALTER TABLE planned ADD COLUMN IF NOT EXISTS dias_carencia INTEGER DEFAULT 0;
ALTER TABLE planned ADD COLUMN IF NOT EXISTS tipo_consequencia TEXT DEFAULT 'NEGATIVACAO_SPC_SERASA';
ALTER TABLE planned ADD COLUMN IF NOT EXISTS dias_para_sancao INTEGER DEFAULT 30;
ALTER TABLE planned ADD COLUMN IF NOT EXISTS aceita_pagamento_parcial BOOLEAN DEFAULT false;
ALTER TABLE planned ADD COLUMN IF NOT EXISTS valor_minimo NUMERIC(12,2) DEFAULT 0.0;

-- Pré-preenchimento por categoria (Seção 2.1): define tipo_consequencia,
-- taxa_juros_mensal e dias_para_sancao com valores típicos de mercado.
-- Usamos UPDATE por categoria apenas quando o campo ainda estiver no valor
-- DEFAULT global, para não sobrescrever ajustes manuais do usuário.
UPDATE planned SET
  tipo_consequencia = CASE category
    WHEN 'moradia' THEN 'PERDA_BEM_MORADIA'
    WHEN 'contas'  THEN 'CORTE_SERVICO'
    WHEN 'saude'   THEN 'PROTESTO_JUDICIAL'
    WHEN 'educacao' THEN 'PROTESTO_JUDICIAL'
    WHEN 'transporte' THEN 'NEGATIVACAO_SPC_SERASA'
    WHEN 'lazer'   THEN 'BLOQUEIO_SERVICO_NAO_ESSENCIAL'
    WHEN 'assinaturas' THEN 'BLOQUEIO_SERVICO_NAO_ESSENCIAL'
    WHEN 'alimentacao' THEN 'BLOQUEIO_SERVICO_NAO_ESSENCIAL'
    ELSE 'NEGATIVACAO_SPC_SERASA'
  END,
  dias_para_sancao = CASE category
    WHEN 'moradia' THEN 30
    WHEN 'contas'  THEN 30
    WHEN 'saude' THEN 45
    WHEN 'educacao' THEN 45
    WHEN 'transporte' THEN 30
    WHEN 'lazer' THEN 15
    WHEN 'assinaturas' THEN 15
    WHEN 'alimentacao' THEN 15
    ELSE 30
  END
WHERE type = 'expense'
  AND (tipo_consequencia IS NULL OR tipo_consequencia = 'NEGATIVACAO_SPC_SERASA')
  AND (dias_para_sancao IS NULL OR dias_para_sancao = 30);

-- Índice auxiliar para a varredura por vencimento.
CREATE INDEX IF NOT EXISTS idx_planned_due_date ON planned (due_date);
CREATE INDEX IF NOT EXISTS idx_planned_category ON planned (category);
