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
export function simularFluxoDiario({ contas, saldoInicial, entradas = {}, entradasRestritas = {}, pagamentosAgendados = {}, salario, reservaMinima, usosReserva = {}, referenciaHoje }) {
  // reservaMinima é o TETO da reserva no mês (valor fixo configurado ou, na
  // falta dele, os 15% do salário líquido). A cada dia abatemos o que foi
  // lançado com a forma de pagamento "Reserva mínima": é isso que faz a linha
  // tracejada descer conforme a reserva vai sendo usada/liquidada.
  const reservaLimite = reservaMinima != null ? reservaMinima : (salario != null ? round2(salario * RESERVA_MINIMA_PCT) : 0);
  let reservaUsadaAcumulada = 0;
  const contasInfo = (contas || []).map((c) => {
    const campos = resolveCamposFinanceiros(c);
    const meta = calcularScore({ ...c, ...campos }, referenciaHoje);
    return { c, campos, meta, dia: diaVencimento(c) };
  });
  const porDia = {};
  contasInfo.forEach((x) => { (porDia[x.dia] = porDia[x.dia] || []).push(x); });

  const resultado = { dias: [], pagas: [], postergadas: [], pagamentosParciais: [], alertasCriticos: [], naoCobertas: [] };
  let saldo = round2(saldoInicial || 0);
  // Bolsos de dinheiro RESTRITO (ex.: cartão alimentação). Só pagam a própria
  // categoria (mercado/alimentação) e NUNCA entram no caixa livre das outras contas.
  let restrito = {};

  for (let dia = 1; dia <= DIAS_NO_MES; dia++) {
    saldo = round2(saldo + (Number(entradas[dia]) || 0) - (Number(pagamentosAgendados[dia]) || 0));
    const restritoDoDia = entradasRestritas[dia] || {};
    Object.keys(restritoDoDia).forEach((cat) => {
      restrito[cat] = round2((restrito[cat] || 0) + (Number(restritoDoDia[cat]) || 0));
    });
    reservaUsadaAcumulada = round2(reservaUsadaAcumulada + (Number(usosReserva[dia]) || 0));
    const reserva = Math.max(0, round2(reservaLimite - reservaUsadaAcumulada));
    let disponivel = round2(saldo - reserva);
    let deficit = 0;

    const doDia = (porDia[dia] || []).slice().sort(prioridadePagamento);

    for (const { c, campos, meta } of doDia) {
      const val = Number(c.amount) || 0;
      const ehEssencial = meta.G >= 5.0;
      const cat = c.category || c.categoria || null;

      // Dinheiro restrito (cartão alimentação) paga PRIMEIRO o que é da categoria dele.
      const bolsoRestrito = cat ? (restrito[cat] || 0) : 0;
      const usarRestrito = bolsoRestrito > 0 ? Math.min(bolsoRestrito, val) : 0;
      const falta = round2(val - usarRestrito);

      if (falta <= 0) {
        // pago inteiramente pelo benefício — não consome o caixa livre
        restrito[cat] = round2(bolsoRestrito - usarRestrito);
        resultado.pagas.push({ id: c.id, descricao: c.description, valor: val, dia, gravidade: meta.G, viaRestrito: true });
      } else if (disponivel >= falta) {
        // coube no caixa (sozinho ou somando o benefício) — paga
        if (usarRestrito > 0) restrito[cat] = round2(bolsoRestrito - usarRestrito);
        saldo = round2(saldo - falta);
        disponivel = round2(disponivel - falta);
        resultado.pagas.push({ id: c.id, descricao: c.description, valor: val, dia, gravidade: meta.G, viaRestrito: usarRestrito > 0 });
      } else if (ehEssencial) {
        // Conta essencial (G = 5) que não coube: NÃO postergar automaticamente (Seção 4.3).
        deficit = round2(deficit + falta);
        resultado.naoCobertas.push({ id: c.id, descricao: c.description, valor: val, dia, gravidade: meta.G });
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

    resultado.dias.push({
      dia, saldo,
      saldoDisponivel: round2(saldo - reserva),
      reserva,
      reservaLimite,
      reservaUsada: reservaUsadaAcumulada,
      deficit,
      // saldo do dinheiro restrito (benefício) ainda disponível no fim do dia
      restrito: round2(Object.keys(restrito).reduce((s, k) => s + (Number(restrito[k]) || 0), 0)),
    });
  }

  // ---------------------------------------------------------------------
  // DATA INDICADA — quando o motor indica PAGAR cada conta:
  //  • coube no caixa → o próprio dia do vencimento;
  //  • não coube → o primeiro dia seguinte em que o caixa livre (saldo −
  //    reserva) já cobre o valor (ex.: a conta vence dia 5, mas o salário
  //    entra dia 7 → a data indicada é 7);
  //  • não cabe mais neste mês → null (entra no fim da fila).
  // É a data indicada que ordena a lista "Contas em aberto" na Início.
  // ---------------------------------------------------------------------
  const indicadas = {};
  resultado.pagas.forEach((p) => { indicadas[p.id] = p.dia; });
  resultado.pagamentosParciais.forEach((p) => { indicadas[p.id] = p.dia; });

  const pendentes = [
    ...resultado.postergadas.map((p) => ({ id: p.id, valor: p.valor, dia: p.dia })),
    ...resultado.naoCobertas.map((p) => ({ id: p.id, valor: p.valor, dia: p.dia })),
  ];
  pendentes.forEach((c) => {
    const alvo = Number(c.valor) || 0;
    let achou = null;
    for (let d = Number(c.dia) + 1; d <= DIAS_NO_MES; d++) {
      const info = resultado.dias[d - 1];
      if (info && info.saldoDisponivel >= alvo) { achou = d; break; }
    }
    indicadas[c.id] = achou;
  });

  resultado.dataIndicada = indicadas;
  return resultado;
}
