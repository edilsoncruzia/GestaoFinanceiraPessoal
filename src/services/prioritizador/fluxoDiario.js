// Simulação de Fluxo de Caixa Diário e Margem de Liquidez — Seções 4.1, 4.2, 4.3
import { RESERVA_MINIMA_PCT, DIAS_NO_MES } from './constantes.js';
import { calcularScore, custoAtraso30d } from './score.js';
import { getGravidade, resolveCamposFinanceiros } from './gravidade.js';

const round2 = (v) => Math.round(v * 100) / 100;

function diaVencimento(conta) {
  if (conta.dueDay) return Number(conta.dueDay);
  const d = conta.dueDate || conta.due_date || conta.vencimento;
  if (d) return new Date(d + "T00:00:00").getDate();
  return 1;
}

// Prioridade de PAGAMENTO: gravidade maior primeiro; dentro da mesma gravidade,
// vencidas (score maior) antes, depois vencimento mais próximo.
function prioridadePagamento(a, b) {
  if (a.meta.G !== b.meta.G) return b.meta.G - a.meta.G;
  if (a.meta.vencida !== b.meta.vencida) return a.meta.vencida ? -1 : 1;
  if (a.meta.vencida) return b.meta.S - a.meta.S;
  const da = String(a.c.dueDate || a.c.due_date || ""), db = String(b.c.dueDate || b.c.due_date || "");
  return da < db ? -1 : da > db ? 1 : 0;
}

// Simula o mês dia a dia: paga as contas dentro do caixa disponível (saldo − reserva),
// posterga as de menor prioridade (G < 5) e sinaliza Alerta Crítico para essenciais (G = 5).
export function simularFluxoDiario({ contas, saldoInicial, entradas = {}, pagamentosAgendados = {}, salario, reservaMinima, referenciaHoje }) {
  const reserva = reservaMinima != null ? reservaMinima : (salario != null ? round2(salario * RESERVA_MINIMA_PCT) : 0);
  const contasInfo = (contas || []).map((c) => {
    const campos = resolveCamposFinanceiros(c);
    const meta = calcularScore({ ...c, ...campos }, referenciaHoje);
    return { c, campos, meta, dia: diaVencimento(c) };
  });
  const porDia = {};
  contasInfo.forEach((x) => { (porDia[x.dia] = porDia[x.dia] || []).push(x); });

  const resultado = { dias: [], pagas: [], postergadas: [], pagamentosParciais: [], alertasCriticos: [] };
  let saldo = round2(saldoInicial || 0);

  for (let dia = 1; dia <= DIAS_NO_MES; dia++) {
    saldo = round2(saldo + (Number(entradas[dia]) || 0) - (Number(pagamentosAgendados[dia]) || 0));
    let disponivel = round2(saldo - reserva);
    let deficit = 0;

    const doDia = (porDia[dia] || []).slice().sort(prioridadePagamento);

    for (const { c, campos, meta } of doDia) {
      const val = Number(c.amount) || 0;
      const ehEssencial = meta.G >= 5.0;

      if (disponivel >= val) {
        // coube no caixa — paga
        saldo = round2(saldo - val);
        disponivel = round2(disponivel - val);
        resultado.pagas.push({ id: c.id, descricao: c.description, valor: val, dia, gravidade: meta.G });
      } else if (ehEssencial) {
        // Conta essencial (G = 5) que não coube: NÃO postergar automaticamente (Seção 4.3).
        deficit = round2(deficit + val);
      } else {
        // NOVO (v1.1): tenta pagamento parcial antes de adiar a conta inteira (Seção 4.2).
        const minimo = Number(c.valor_minimo || c.valorMinimo || 0);
        if (campos.aceita_pagamento_parcial && minimo > 0 && disponivel >= minimo) {
          saldo = round2(saldo - minimo);
          disponivel = round2(disponivel - minimo);
          resultado.pagamentosParciais.push({ id: c.id, descricao: c.description, valorMinimo: minimo, dia });
        } else {
          resultado.postergadas.push({
            id: c.id, descricao: c.description, valor: val, dia, gravidade: meta.G, score: meta.S,
            jurosEstimados: custoAtraso30d(campos, val),
          });
        }
      }
    }

    if (deficit > 0) {
      const essenciais = doDia.filter((x) => x.meta.G >= 5.0);
      resultado.alertasCriticos.push({
        dia, deficit,
        contas: essenciais.map((x) => ({ id: x.c.id, descricao: x.c.description, valor: Number(x.c.amount), gravidade: 5.0 })),
      });
    }

    resultado.dias.push({ dia, saldo, saldoDisponivel: round2(saldo - reserva), reserva, deficit });
  }

  return resultado;
}
