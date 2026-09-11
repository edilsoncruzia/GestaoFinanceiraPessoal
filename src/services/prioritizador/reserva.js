// ============================================================================
// Reserva Mínima — controle de "limite" igual ao do cartão.
// A reserva é MENSAL: cada mês vale o aporte configurado e NÃO acumula.
// No fechamento, o saldo do mês (aporte − usado) é liquidado:
//   • saldo positivo  -> entra no mês seguinte como RECEITA;
//   • saldo negativo  -> entra no mês seguinte como DESPESA.
// A liquidação é uma linha do extrato da reserva (não gera lançamento novo),
// então o mesmo dinheiro nunca é contado duas vezes entre os meses.
//
// Já o dinheiro RESTRITO (cartão alimentação) É acumulativo: o que não foi
// gasto fica no cartão e entra positivo no mês seguinte.
// ============================================================================
import { addMonths, generatePlannedOccurrences, monthKey, round2 } from '../../utils/formatters.js';
import { RESERVA_MINIMA_PCT, DIAS_NO_MES } from './constantes.js';

// Valor gravado em planned.formaPagamento para identificar o uso da reserva.
export const FORMA_RESERVA = "reserva";

// Aporte do mês: valor fixo configurado; se não houver, mantém o comportamento
// antigo (15% do salário líquido — Seção 4.1).
export function limiteReserva(config, salario) {
  const fixo = Number(config && config.limite) || 0;
  if (fixo > 0) return round2(fixo);
  return round2((Number(salario) || 0) * RESERVA_MINIMA_PCT);
}

const diaDoVencimento = (dueDate) => {
  if (!dueDate) return 1;
  const d = new Date(dueDate + "T00:00:00").getDate();
  return Math.min(DIAS_NO_MES, Math.max(1, Number(d) || 1));
};

// Uso da reserva no mês: soma das ocorrências PREVISTAS marcadas como
// "Reserva mínima" com vencimento no mês, agrupadas por dia (o mesmo dia que o
// motor usa para pagar). Cada ocorrência conta uma única vez por mês.
export function calcularUsoReserva({ planned, selectedMonth, memberFilter = "todos" }) {
  const itens = [];
  const porDia = {};
  let total = 0;

  generatePlannedOccurrences(planned || [], selectedMonth)
    .filter((o) => o.type === "expense" && (o.formaPagamento || "normal") === FORMA_RESERVA)
    .filter((o) => memberFilter === "todos" || o.memberId === memberFilter || o.memberId == null)
    .forEach((o) => {
      const valor = round2(Number(o.amount) || 0);
      if (valor <= 0) return;
      const dia = diaDoVencimento(o.dueDate);
      total = round2(total + valor);
      porDia[dia] = round2((porDia[dia] || 0) + valor);
      itens.push({
        occId: o.occId,
        plannedId: o.id,
        description: o.description,
        amount: valor,
        dueDate: o.dueDate,
        dia,
        category: o.category,
        memberId: o.memberId,
        recurrence: o.recurrence,
      });
    });

  itens.sort((a, b) => (a.dueDate < b.dueDate ? -1 : a.dueDate > b.dueDate ? 1 : 0));
  return { total, porDia, itens };
}

// Aporte de um mês qualquer (valor fixo ou 15% do salário daquele mês).
function aporteDoMes(mes, config, salarioDoMes) {
  const fixo = Number(config && config.limite) || 0;
  if (fixo > 0) return round2(fixo);
  return round2((Number(salarioDoMes ? salarioDoMes(mes) : 0) || 0) * RESERVA_MINIMA_PCT);
}

// Resumo da reserva no mês: MENSAL, sem acumular.
// O saldo (aporte − usado) é o que é liquidado no fechamento.
export function resumoReserva({ planned, selectedMonth, memberFilter = "todos", config, salarioDoMes }) {
  const aporte = aporteDoMes(selectedMonth, config, salarioDoMes);
  const uso = calcularUsoReserva({ planned, selectedMonth, memberFilter });
  const saldo = round2(aporte - uso.total);

  // Fechamento do mês anterior — é o que "entra" neste mês (Receita ou Despesa).
  const mesAnterior = addMonths(selectedMonth, -1);
  const aporteAnterior = aporteDoMes(mesAnterior, config, salarioDoMes);
  const usoAnterior = calcularUsoReserva({ planned, selectedMonth: mesAnterior, memberFilter });
  const saldoAnterior = round2(aporteAnterior - usoAnterior.total);

  return {
    mes: selectedMonth,
    // extrato do mês
    aporte,
    usado: uso.total,
    saldo,
    // o que entra neste mês vindo do fechamento do mês anterior
    receitaDoMesAnterior: saldoAnterior > 0 ? saldoAnterior : 0,
    despesaDoMesAnterior: saldoAnterior < 0 ? round2(-saldoAnterior) : 0,
    // o que este mês leva para o próximo fechamento
    sobra: saldo > 0 ? saldo : 0,
    deficit: saldo < 0 ? round2(-saldo) : 0,
    estourou: saldo < 0,
    // compatibilidade com o resto da tela
    disponivel: saldo,
    limite: aporte,
    totalMes: aporte,
    porDia: uso.porDia,
    itens: uso.itens,
    configurado: (Number(config && config.limite) || 0) > 0,
  };
}

// Cobranças "Reserva mínima" de um mês em forma de despesas do motor.
export function usosPorDiaDeDespesas(despesas, selectedMonth) {
  const porDia = {};
  (despesas || []).forEach((d) => {
    if ((d.formaPagamento || d.forma_pagamento || "normal") !== FORMA_RESERVA) return;
    const due = d.dueDate || d.due_date;
    if (!due || monthKey(due) !== selectedMonth) return;
    const dia = diaDoVencimento(due);
    porDia[dia] = round2((porDia[dia] || 0) + (Number(d.amount) || 0));
  });
  return porDia;
}

// ---------------------------------------------------------------------------
// Dinheiro RESTRITO (ex.: cartão alimentação): entra num dia do mês e só pode
// pagar despesas de uma categoria (mercado/alimentação). NÃO conta como caixa
// livre para as outras contas. É ACUMULATIVO: o que não foi gasto fica no
// cartão e entra positivo no mês seguinte.
// ---------------------------------------------------------------------------
export const CATEGORIA_BENEFICIO_PADRAO = "alimentacao";

export function ehReceitaRestrita(item) {
  return Boolean(item) && item.type === "income" && Boolean(item.restritoCategoria || item.restrito_categoria);
}

export function categoriaRestrita(item) {
  if (!item) return null;
  return item.restritoCategoria || item.restrito_categoria || null;
}

// Categorias restritas em uso (mercado/alimentação, etc.).
export function categoriasRestritas(planned) {
  const set = new Set();
  (planned || []).forEach((p) => {
    const cat = categoriaRestrita(p);
    if (cat) set.add(cat);
  });
  return [...set];
}

// Entradas restritas por dia do mês: { [dia]: { [categoria]: valor } }.
// O carry (saldo que sobrou nos meses anteriores) entra no dia 1.
export function entradasRestritasPorDia({ planned, selectedMonth, memberFilter = "todos", carryInicial = 0 }) {
  const porDia = {};
  const itens = [];
  let total = 0;

  const ocorrencias = generatePlannedOccurrences(planned || [], selectedMonth)
    .filter(ehReceitaRestrita)
    .filter((o) => memberFilter === "todos" || o.memberId === memberFilter);

  ocorrencias.forEach((o) => {
    const valor = round2(Number(o.amount) || 0);
    if (valor <= 0) return;
    const cat = categoriaRestrita(o) || CATEGORIA_BENEFICIO_PADRAO;
    const dia = diaDoVencimento(o.dueDate);
    porDia[dia] = porDia[dia] || {};
    porDia[dia][cat] = round2((porDia[dia][cat] || 0) + valor);
    total = round2(total + valor);
    itens.push({ occId: o.occId, plannedId: o.id, description: o.description, amount: valor, dueDate: o.dueDate, dia, category: cat, memberId: o.memberId });
  });

  // Saldo que ficou no cartão nos meses anteriores.
  const carry = round2(Number(carryInicial) || 0);
  if (carry > 0) {
    const cat = itens[0] ? itens[0].category : (categoriasRestritas(planned)[0] || CATEGORIA_BENEFICIO_PADRAO);
    porDia[1] = porDia[1] || {};
    porDia[1][cat] = round2((porDia[1][cat] || 0) + carry);
    total = round2(total + carry);
  }

  itens.sort((a, b) => (a.dueDate < b.dueDate ? -1 : a.dueDate > b.dueDate ? 1 : 0));
  return { porDia, itens, total, carry };
}

// Primeiro mês com cartão/benefício cadastrado (base do acumulado).
function mesInicialBeneficio(planned) {
  let inicio = null;
  (planned || []).forEach((p) => {
    if (!ehReceitaRestrita(p) || !p.dueDate) return;
    const m = monthKey(p.dueDate);
    if (inicio == null || m < inicio) inicio = m;
  });
  return inicio;
}

// Saldo acumulado do cartão até o mês selecionado (exclusive): o crédito de cada
// mês mais o que sobrou, menos os gastos da categoria restrita daquele mês.
export function saldoRestritoAcumulado({ planned, selectedMonth, memberFilter = "todos" }) {
  const inicio = mesInicialBeneficio(planned);
  if (!inicio || inicio >= selectedMonth) return 0;

  const cats = categoriasRestritas(planned);
  let carry = 0;
  let m = inicio;

  for (let i = 0; i < 36 && m < selectedMonth; i++) {
    const entradas = entradasRestritasPorDia({ planned, selectedMonth: m, memberFilter }).total;
    const gastos = generatePlannedOccurrences(planned || [], m)
      .filter((o) => o.type === "expense" && cats.includes(o.category))
      .reduce((s, o) => s + (Number(o.amount) || 0), 0);
    const disponivel = round2(entradas + carry);
    // O cartão não fica negativo: gasta no máximo o que tem nele.
    carry = round2(Math.max(0, disponivel - gastos));
    m = addMonths(m, 1);
  }
  return carry;
}
