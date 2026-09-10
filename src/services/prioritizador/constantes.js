// ============================================================================
// Motor de Priorização Inteligente de Contas (Smart Debt Scheduler)
// Documentacao_Motor_Priorizacao_v1.1.pdf — tópico #23 (Ajustes e Melhorias)
// MÓDULO NOVO E SEPARADO: apenas lê as contas e devolve metadados.
// Não altera o core (receitas/despesas/conciliação/categorias).
// ============================================================================

export const DIA_FATOR = 15;
export const RESERVA_MINIMA_PCT = 0.15;
export const U_S_BONUS = 100;
export const DIAS_NO_MES = 30;
export const ENVELOPES_SEMANAIS = 4;
export const CATEGORIA_MERCADO = "alimentacao";

// --- Mapeamento Gravidade x Tipo de Consequência (Seção 3.3) ----------------
export const GRAVIDADE_POR_CONSEQUENCIA = {
  CORTE_SERVICO: 5.0,
  PERDA_BEM_MORADIA: 5.0,
  PROTESTO_JUDICIAL: 3.0,
  NEGATIVACAO_SPC_SERASA: 2.0,
  BLOQUEIO_SERVICO_NAO_ESSENCIAL: 1.0,
};
export const CONSEQUENCIAS_VALIDAS = Object.keys(GRAVIDADE_POR_CONSEQUENCIA);

// --- Defaults globais dos 8 campos novos (Seção 2) --------------------------
export const DEFAULT_CAMPOS = {
  multa_fixa_porcentagem: 2.0,
  multa_fixa_valor: 0.0,
  taxa_juros_diaria: 0.033,
  taxa_juros_mensal: 0.0,
  dias_carencia: 0,
  tipo_consequencia: "NEGATIVACAO_SPC_SERASA",
  dias_para_sancao: 30,
  aceita_pagamento_parcial: false,
};

// --- Pré-preenchimento por categoria (Seção 2.1) ----------------------------
export const DEFAULT_POR_CATEGORIA = {
  moradia:      { tipo_consequencia: "PERDA_BEM_MORADIA",              taxa_juros_mensal: 0.0, dias_para_sancao: 30, multa_fixa_porcentagem: 2.0, taxa_juros_diaria: 0.033 },
  contas:       { tipo_consequencia: "CORTE_SERVICO",                  taxa_juros_mensal: 0.0, dias_para_sancao: 30, multa_fixa_porcentagem: 2.0, taxa_juros_diaria: 0.033 },
  saude:        { tipo_consequencia: "PROTESTO_JUDICIAL",              taxa_juros_mensal: 0.0, dias_para_sancao: 45, multa_fixa_porcentagem: 0.0, taxa_juros_diaria: 0.0 },
  educacao:     { tipo_consequencia: "PROTESTO_JUDICIAL",              taxa_juros_mensal: 0.0, dias_para_sancao: 45, multa_fixa_porcentagem: 0.0, taxa_juros_diaria: 0.0 },
  transporte:   { tipo_consequencia: "NEGATIVACAO_SPC_SERASA",         taxa_juros_mensal: 0.0, dias_para_sancao: 30, multa_fixa_porcentagem: 0.0, taxa_juros_diaria: 0.0 },
  lazer:        { tipo_consequencia: "BLOQUEIO_SERVICO_NAO_ESSENCIAL", taxa_juros_mensal: 0.0, dias_para_sancao: 15, multa_fixa_porcentagem: 0.0, taxa_juros_diaria: 0.0 },
  assinaturas:  { tipo_consequencia: "BLOQUEIO_SERVICO_NAO_ESSENCIAL", taxa_juros_mensal: 0.0, dias_para_sancao: 15, multa_fixa_porcentagem: 0.0, taxa_juros_diaria: 0.0 },
  alimentacao:  { tipo_consequencia: "BLOQUEIO_SERVICO_NAO_ESSENCIAL", taxa_juros_mensal: 0.0, dias_para_sancao: 15, multa_fixa_porcentagem: 0.0, taxa_juros_diaria: 0.0 },
  outros:       { tipo_consequencia: "NEGATIVACAO_SPC_SERASA",         taxa_juros_mensal: 0.0, dias_para_sancao: 30, multa_fixa_porcentagem: 2.0, taxa_juros_diaria: 0.033 },
  poupanca:     { tipo_consequencia: "NEGATIVACAO_SPC_SERASA",         taxa_juros_mensal: 0.0, dias_para_sancao: 30, multa_fixa_porcentagem: 0.0, taxa_juros_diaria: 0.0 },
};

export const DEFAULT_CATEGORIA_GENERICA = {
  tipo_consequencia: "NEGATIVACAO_SPC_SERASA",
  taxa_juros_mensal: 0.0,
  dias_para_sancao: 30,
  multa_fixa_porcentagem: 2.0,
  taxa_juros_diaria: 0.033,
};
