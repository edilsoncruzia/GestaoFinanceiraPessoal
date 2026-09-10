// ============================================================================
// Motor de Priorização Inteligente de Contas — ponto de entrada (módulo novo)
// Lê as contas salvas e retorna a listagem enriquecida (gravidade, score,
// prioridade, status de postergação) para o front-end exibir.
// Não altera o core do app (receitas/despesas/conciliação/categorias).
// ============================================================================
import { calcularScore } from './score.js';
import { getGravidade, resolveCamposFinanceiros } from './gravidade.js';
import { simularFluxoDiario } from './fluxoDiario.js';
import { pacing } from './pacing.js';
import { agruparDespesas } from './agrupamento.js';

const STATUS_LABEL = {
  postergada: "POSTERGADO",
  atencao_necessaria: "ATENÇÃO NECESSÁRIA",
  vencida: "VENCIDA",
  a_vencer: "A VENCER",
};

// enriquece uma conta com os campos financeiros e o score (Seções 2, 3, 3.3).
export function enriquecerConta(conta, referenciaHoje) {
  const campos = resolveCamposFinanceiros(conta);
  const meta = calcularScore({ ...conta, ...campos }, referenciaHoje);
  return {
    id: conta.id,
    description: conta.description ?? conta.descricao ?? "",
    amount: Number(conta.amount) || 0,
    category: conta.category ?? null,
    memberId: conta.memberId ?? conta.member_id ?? null,
    dueDate: conta.dueDate ?? conta.due_date ?? null,
    ...campos,
    ...meta,
    gravidade: meta.G,
    jurosEstimados: meta.custoAtraso30d,
  };
}

// Ordena a lista conforme as regras da Seção 3.2/6.2:
//  - vencidas (Modo 2) primeiro, pelo maior Score;
//  - em dia (Modo 1) em seguida, por Gravidade decrescente e, em empate, vencimento crescente.
export function ordenarContas(lista) {
  return [...lista].sort((a, b) => {
    if (a.vencida !== b.vencida) return a.vencida ? -1 : 1;
    if (a.vencida) return b.S - a.S;
    if (b.G !== a.G) return b.G - a.G;
    const da = String(a.dueDate || ""), db = String(b.dueDate || "");
    return da < db ? -1 : da > db ? 1 : 0;
  });
}

export function processarContas(contas, opcoes = {}) {
  const referenciaHoje = opcoes.referenciaHoje || new Date().toISOString().slice(0, 10);
  const enriquecidas = (contas || []).map((c) => enriquecerConta(c, referenciaHoje));

  // Simulação de Fluxo de Caixa Diário (opcional — exige saldoInicial).
  let fluxoDiario = null;
  if (opcoes.saldoInicial != null) {
    fluxoDiario = simularFluxoDiario({
      contas: enriquecidas,
      saldoInicial: opcoes.saldoInicial,
      entradas: opcoes.entradas || {},
      pagamentosAgendados: opcoes.pagamentosAgendados || {},
      salario: opcoes.salario,
      reservaMinima: opcoes.reservaMinima,
      referenciaHoje,
    });
  }

  // Pacing de Mercado (opcional).
  const pacingInfo = opcoes.orcamentoMensalMercado != null
    ? pacing({ orcamentoMensalMercado: opcoes.orcamentoMensalMercado, gastosSemana: opcoes.gastosSemana || 0, diasRestantesSemana: opcoes.diasRestantesSemana, diaSemana: opcoes.diaSemana })
    : null;

  // Status de postergação / alerta crítico (Seção 6.1) derivado da simulação.
  const postergadas = new Set((fluxoDiario?.postergadas || []).map((p) => p.id));
  const criticas = new Set((fluxoDiario?.alertasCriticos || []).flatMap((a) => a.contas.map((c) => c.id)));

  const comStatus = enriquecidas.map((c) => {
    let status = c.vencida ? "vencida" : "a_vencer";
    if (criticas.has(c.id)) status = "atencao_necessaria";
    else if (postergadas.has(c.id)) status = "postergada";
    return { ...c, status, statusLabel: STATUS_LABEL[status] };
  });

  const ordenadas = ordenarContas(comStatus).map((c, i) => ({ ...c, prioridade: i + 1 }));

  return {
    contas: ordenadas,
    fluxoDiario,
    pacing: pacingInfo,
    resumo: {
      total: ordenadas.length,
      vencidas: ordenadas.filter((c) => c.vencida).length,
      postergadas: ordenadas.filter((c) => c.status === "postergada").length,
      atencaoNecessaria: ordenadas.filter((c) => c.status === "atencao_necessaria").length,
      totalOrcadoMes: round2(ordenadas.reduce((s, c) => s + c.amount, 0)),
    },
  };
}

// Processa despesas já agrupando por forma de pagamento (cartão vira fatura,
// débito/pix automático vira pagamento agendado) antes de rodar a simulação.
export function processarDespesas(despesas, contasBancarias, selectedMonth, opcoes = {}) {
  const { contas, agendados, autoDetalhes, cartaoFaturas } = agruparDespesas(despesas, contasBancarias, selectedMonth);
  const res = processarContas(contas, { ...opcoes, pagamentosAgendados: { ...(opcoes.pagamentosAgendados || {}), ...agendados } });
  return { ...res, agendados, autoDetalhes, cartaoFaturas };
}

// Re-exporta utilitários para uso no front-end.
export { getGravidade, resolveCamposFinanceiros } from './gravidade.js';
export { calcularScore, custoAtraso30d } from './score.js';
export { simularFluxoDiario } from './fluxoDiario.js';
export { pacing, verbaSemanal, tetoDiario } from './pacing.js';
export { agruparDespesas } from './agrupamento.js';
export { DEFAULT_POR_CATEGORIA, DEFAULT_CAMPOS, GRAVIDADE_POR_CONSEQUENCIA } from './constantes.js';

const round2 = (v) => Math.round(v * 100) / 100;
