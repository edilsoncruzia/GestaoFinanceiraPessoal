import { COLORS, NECESSIDADES, DESEJOS } from '../constants/tokens';
import { statusFor } from './formatters';

// ============================================================================
// SAÚDE FINANCEIRA (KPI) — 0 a 100
//
// A pontuação começa em 100 e vai descontando conforme cada fator abaixo.
// Quanto maior a pontuação, mais saudável está o mês.
//
//   1) Orçamentos estourados   -> -15 por orçamento ACIMA do limite
//                                 -5  por orçamento EXATAMENTE no limite
//   2) Despesas acima da renda -> -25 quando o mês fechou no vermelho
//   3) Poupança insuficiente   -> -20 quando gastou além da renda (poupança < 0%)
//                                 -8  quando guarda menos de 15% da renda
// ============================================================================
export function computeHealthScore({ budgetsWithSpent, monthIncome, monthExpense, currentMonthTx }) {
  let score = 100;
  const factors = [];

  const overCount = budgetsWithSpent.filter((b) => statusFor(b.spent, b.limit).state === "over").length;
  const exactCount = budgetsWithSpent.filter((b) => statusFor(b.spent, b.limit).state === "exact").length;
  const budgetPenalty = overCount * 15 + exactCount * 5;
  if (budgetPenalty > 0) {
    score -= budgetPenalty;
    factors.push({
      label: "Orçamentos estourados",
      detail: overCount + " acima do limite (−" + (overCount * 15) + ") e " + exactCount + " no limite (−" + (exactCount * 5) + ")",
      impact: -budgetPenalty,
    });
  }

  if (monthIncome > 0 && monthExpense > monthIncome) {
    score -= 25;
    factors.push({ label: "Despesas acima da receita", detail: "O mês gastou mais do que recebeu (−25)", impact: -25 });
  }

  const necessidades = currentMonthTx.filter((t) => t.type === "expense" && NECESSIDADES.includes(t.category)).reduce((s, t) => s + t.amount, 0);
  const desejos = currentMonthTx.filter((t) => t.type === "expense" && DESEJOS.includes(t.category)).reduce((s, t) => s + t.amount, 0);
  const poupanca = monthIncome - necessidades - desejos;
  const poupancaPct = monthIncome > 0 ? Math.round((poupanca / monthIncome) * 100) : 0;
  if (monthIncome > 0) {
    if (poupancaPct < 0) {
      score -= 20;
      factors.push({ label: "Poupança negativa", detail: "Gastou " + Math.abs(poupancaPct) + "% além da renda (−20)", impact: -20 });
    } else if (poupancaPct < 15) {
      score -= 8;
      factors.push({ label: "Poupança abaixo de 15%", detail: "Guardando " + poupancaPct + "% da renda (−8)", impact: -8 });
    }
  }

  score = Math.max(0, Math.min(100, Math.round(score)));

  let mood;
  if (score >= 80) mood = { label: "Saúde financeira ótima", shortLabel: "Ótima", color: COLORS.green };
  else if (score >= 60) mood = { label: "Saúde financeira boa", shortLabel: "Boa", color: COLORS.greenLight };
  else if (score >= 40) mood = { label: "Atenção com os gastos", shortLabel: "Atenção", color: COLORS.amber };
  else mood = { label: "Momento de ajustar o mês", shortLabel: "Crítica", color: COLORS.rust };

  return { score, overCount, exactCount, poupancaPct, totalBudgets: budgetsWithSpent.length, factors, ...mood };
}
