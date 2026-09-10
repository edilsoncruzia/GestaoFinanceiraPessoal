// Score de Prioridade (S) — Seções 3, 3.1, 3.2 e 7.2
// S = (G × F_A) + C_rel + U_S
import { DIA_FATOR, U_S_BONUS } from './constantes.js';
import { getGravidade, resolveCamposFinanceiros } from './gravidade.js';

// Arredondamentos conforme os exemplos da Seção 7:
//  - F_A truncado em 2 casas (ex.: 1,66 e 3,66);
//  - C_rel e S com 1 casa decimal (ex.: 3,0 e 11,3).
const trunc2 = (v) => Math.floor((v + 1e-9) * 100) / 100;
const round1 = (v) => Math.round(v * 10) / 10;

// Custo total do atraso em 30 dias (multa % + multa fixa + juros diários × 30).
export function custoAtraso30d(campos, principal) {
  const multaPct = (campos.multa_fixa_porcentagem / 100) * principal;
  const juros30 = (campos.taxa_juros_diaria / 100) * principal * 30;
  return Math.round((multaPct + (campos.multa_fixa_valor || 0) + juros30) * 100) / 100;
}

// dias de atraso EFETIVOS (após a carência) — Seção 3.1.
export function diasAtrasoEfetivo(diasEmAtraso, diasCarencia) {
  return Math.max(0, diasEmAtraso - diasCarencia);
}

// Dois modos (Seção 3.2):
//  - MODE 1 "fila_mes_corrente": conta em dia. Ordena por gravidade desc / vencimento asc. S = G.
//  - MODE 2 "score_completo": conta vencida (após carência). Aplica S = (G × F_A) + C_rel + U_S.
export function calcularScore(conta, referenciaHoje) {
  const campos = resolveCamposFinanceiros(conta);
  const G = getGravidade({ ...conta, ...campos });
  const u = { ...conta, ...campos };
  const due = conta.dueDate || conta.due_date || conta.vencimento;
  const diasEmAtraso = conta.diasEmAtraso != null
    ? conta.diasEmAtraso
    : (referenciaHoje && due ? Math.max(0, Math.floor((new Date(referenciaHoje + "T00:00:00") - new Date(due + "T00:00:00")) / 86400000)) : 0);
  const efetivos = diasAtrasoEfetivo(diasEmAtraso, campos.dias_carencia);
  const vencida = diasEmAtraso > campos.dias_carencia;
  const principal = Number(u.amount) || 0;

  const F_A = trunc2(1 + efetivos / DIA_FATOR);

  let C_rel = 0;
  let U_S = 0;
  if (vencida) {
    const custo30 = custoAtraso30d(campos, principal);
    C_rel = principal > 0 ? round1((custo30 / principal) * 100) : 0;
    const regua = campos.dias_para_sancao - 5;
    if (efetivos >= regua) U_S = U_S_BONUS;
  }

  const S = round1((G * F_A) + C_rel + U_S);
  const S_exibicao = vencida ? S : G;

  return {
    modo: vencida ? "score_completo" : "fila_mes_corrente",
    G,
    F_A,
    C_rel,
    U_S,
    S,
    S_exibicao,
    diasEmAtraso,
    diasAtrasoEfetivos: efetivos,
    vencida,
    consequencia: campos.tipo_consequencia,
    custoAtraso30d: custoAtraso30d(campos, principal),
  };
}
