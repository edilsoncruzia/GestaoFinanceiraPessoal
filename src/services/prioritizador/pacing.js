// Cadenciamento do Orçamento do Mercado (Pacing Semanal) — Seção 5
import { ENVELOPES_SEMANAIS } from './constantes.js';
const round2 = (v) => Math.round(v * 100) / 100;

// Verba Semanal = Orçamento Mensal / 4
export function verbaSemanal(orcamentoMensalMercado) {
  return round2((Number(orcamentoMensalMercado) || 0) / ENVELOPES_SEMANAIS);
}

// Teto Diário de Gastos (Burn Rate) = Saldo Semanal Restante / Dias Restantes na Semana
export function tetoDiario(saldoSemanalRestante, diasRestantesSemana) {
  const dias = Number(diasRestantesSemana);
  if (!(dias > 0)) return 0;
  return round2((Number(saldoSemanalRestante) || 0) / dias);
}

// Recálculo dinâmico: gastos acima do teto recalculam o disponível dos dias restantes
// sem afetar as semanas futuras.
export function pacing({ orcamentoMensalMercado, gastosSemana = 0, diasRestantesSemana, diaSemana = 1 }) {
  const envelopeSemanal = verbaSemanal(orcamentoMensalMercado);
  const saldoSemanalRestante = round2(envelopeSemanal - (Number(gastosSemana) || 0));
  const dias = diasRestantesSemana != null ? diasRestantesSemana : Math.max(1, 7 - diaSemana);
  return {
    envelopeSemanal,
    saldoSemanalRestante,
    tetoDiario: tetoDiario(saldoSemanalRestante, dias),
    diasRestantesSemana: dias,
  };
}
