// Gravidade (G) — Seção 3.3
import { GRAVIDADE_POR_CONSEQUENCIA, DEFAULT_POR_CATEGORIA, DEFAULT_CATEGORIA_GENERICA, DEFAULT_CAMPOS } from './constantes.js';

export function getGravidade(conta) {
  const tipo = conta.tipo_consequencia || DEFAULT_CAMPOS.tipo_consequencia;
  let base = GRAVIDADE_POR_CONSEQUENCIA[tipo] ?? 1.0;
  // Juros compostos (cartão/cheque especial) => nível 4 (rotativo).
  if (Number(conta.taxa_juros_mensal) > 0) base = Math.max(base, 4.0);
  // Marcado como "essencial" no cadastro => não é postergável (G = 5).
  if (conta.priority === "essencial") base = 5.0;
  return base;
}

export function resolveCamposFinanceiros(conta) {
  const categoria = DEFAULT_POR_CATEGORIA[conta.category] || DEFAULT_CATEGORIA_GENERICA;
  const orCat = (k, dflt) => (categoria[k] != null ? categoria[k] : dflt);
  return {
    multa_fixa_porcentagem: num(conta.multa_fixa_porcentagem, orCat("multa_fixa_porcentagem", DEFAULT_CAMPOS.multa_fixa_porcentagem)),
    multa_fixa_valor: num(conta.multa_fixa_valor, DEFAULT_CAMPOS.multa_fixa_valor),
    taxa_juros_diaria: num(conta.taxa_juros_diaria, orCat("taxa_juros_diaria", DEFAULT_CAMPOS.taxa_juros_diaria)),
    taxa_juros_mensal: num(conta.taxa_juros_mensal, orCat("taxa_juros_mensal", DEFAULT_CAMPOS.taxa_juros_mensal)),
    dias_carencia: num(conta.dias_carencia, DEFAULT_CAMPOS.dias_carencia),
    tipo_consequencia: conta.tipo_consequencia || categoria.tipo_consequencia || DEFAULT_CAMPOS.tipo_consequencia,
    dias_para_sancao: num(conta.dias_para_sancao, orCat("dias_para_sancao", DEFAULT_CAMPOS.dias_para_sancao)),
    aceita_pagamento_parcial: conta.aceita_pagamento_parcial == null ? DEFAULT_CAMPOS.aceita_pagamento_parcial : Boolean(conta.aceita_pagamento_parcial),
  };
}

function num(v, dflt) { const n = Number(v); return isFinite(n) ? n : dflt; }
