import React from 'react';
import { Clock, ShieldAlert, Gauge, TrendingDown, ListOrdered, Coins, PiggyBank, Wallet, CalendarClock, ArrowDownLeft, CreditCard } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ReferenceLine } from 'recharts';
import { COLORS } from '../../constants/tokens';
import { fmt, fmtDate, monthKey, inScope, generatePlannedOccurrences, buildOpenItems, monthLabelFull, round2 } from '../../utils/formatters';
import { TODAY_DATE } from '../../constants/seedData';
import { processarDespesas, pacing } from '../../services/prioritizador/index.js';
import { RESERVA_MINIMA_PCT } from '../../services/prioritizador/constantes.js';
import { SectionTitle } from '../ui/SectionTitle';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';

export function PriorizacaoView({ planned, transactions, budgets, accounts, selectedMonth, availableBalance, memberFilter }) {
  const inScope_ = (id) => inScope(id, memberFilter);
  const ded = (o) => (o.salaryDeductions || []).reduce((s, d) => s + (Number(d.amount) || 0), 0);

  const despesas = buildOpenItems(planned || [], transactions || [], selectedMonth)
    .filter((i) => i.type === "expense" && inScope_(i.memberId))
    .map((i) => ({
      id: i.occId, description: i.description, amount: i.amount, dueDate: i.dueDate,
      category: i.category, memberId: i.memberId, priority: i.priority, accountId: i.accountId,
      formaPagamento: i.formaPagamento,
      multa_fixa_porcentagem: i.multa_fixa_porcentagem, multa_fixa_valor: i.multa_fixa_valor,
      taxa_juros_diaria: i.taxa_juros_diaria, taxa_juros_mensal: i.taxa_juros_mensal,
      dias_carencia: i.dias_carencia, tipo_consequencia: i.tipo_consequencia,
      dias_para_sancao: i.dias_para_sancao, aceita_pagamento_parcial: i.aceita_pagamento_parcial,
      valor_minimo: i.valor_minimo,
    }));

  // Entradas previstas de receita (líquida) por dia do mês.
  const entradas = {};
  const occ = generatePlannedOccurrences(planned || [], selectedMonth);
  occ.filter((o) => o.type === "income" && inScope_(o.memberId)).forEach((o) => {
    const d = Number(o.dueDate.slice(8, 10));
    entradas[d] = (entradas[d] || 0) + Math.max(0, (Number(o.amount) || 0) - ded(o));
  });

  // Reserva = 15% do SALÁRIO líquido (categoria "salario"), realizado + previsto.
  const salario = occ.filter((o) => o.type === "income" && o.category === "salario" && inScope_(o.memberId)).reduce((s, o) => s + Math.max(0, (Number(o.amount) || 0) - ded(o)), 0)
    + (transactions || []).filter((t) => monthKey(t.date) === selectedMonth && t.type === "income" && t.category === "salario" && inScope_(t.memberId)).reduce((s, t) => {
        const tpl = (planned || []).find((x) => x.id === t.plannedId);
        return s + Math.max(0, (Number(t.amount) || 0) - (tpl ? ded(tpl) : 0));
      }, 0);
  const reservaMinima = round2(salario * RESERVA_MINIMA_PCT);
  const saldoParaContas = round2((availableBalance != null ? availableBalance : 0) - reservaMinima);

  const resultado = processarDespesas(despesas, accounts || [], selectedMonth, { referenciaHoje: TODAY_DATE, saldoInicial: availableBalance != null ? availableBalance : 0, salario, reservaMinima, entradas });

  const totalOrcado = occ.filter((o) => o.type === "expense" && inScope_(o.memberId)).reduce((s, o) => s + Number(o.amount || 0), 0);
  const saidaRealCaixa = (transactions || []).filter((t) => monthKey(t.date) === selectedMonth && t.type === "expense" && inScope_(t.memberId)).reduce((s, t) => s + t.amount, 0);

  // Pacing semanal de mercado.
  const budgetMercado = (budgets || []).find((b) => b.category === "alimentacao");
  const gastoMercadoMes = (transactions || []).filter((t) => t.type === "expense" && t.category === "alimentacao" && monthKey(t.date) === selectedMonth).reduce((s, t) => s + t.amount, 0);
  const previstoMercado = occ.filter((o) => o.type === "expense" && o.category === "alimentacao").reduce((s, o) => s + Number(o.amount || 0), 0);
  const orcamentoMercado = (budgetMercado && budgetMercado.limit > 0) ? budgetMercado.limit : Math.max(gastoMercadoMes, previstoMercado);
  const envelopeSemanal = round2(orcamentoMercado / 4);
  const diaHoje = new Date(TODAY_DATE + "T00:00:00").getDate();
  const semanaAtual = Math.min(4, Math.ceil(diaHoje / 7));
  const gastoSemanaAtual = (transactions || [])
    .filter((t) => t.type === "expense" && t.category === "alimentacao" && monthKey(t.date) === selectedMonth && Math.min(4, Math.ceil(new Date(t.date + "T00:00:00").getDate() / 7)) === semanaAtual)
    .reduce((s, t) => s + t.amount, 0);
  const pac = orcamentoMercado > 0 ? pacing({ orcamentoMensalMercado: orcamentoMercado, gastosSemana: gastoSemanaAtual, diasRestantesSemana: Math.max(1, 7 - ((diaHoje - 1) % 7)) }) : null;

  const postergadas = resultado.fluxoDiario?.postergadas || [];
  const criticos = resultado.fluxoDiario?.alertasCriticos || [];
  const dias = resultado.fluxoDiario?.dias || [];
  const vencidas = resultado.contas.filter((c) => c.vencida);
  const pagas = resultado.fluxoDiario?.pagas || [];

  const dueMap = {};
  resultado.contas.forEach((c) => { dueMap[c.id] = c.dueDate; });
  const diaDe = (id) => { const d = dueMap[id]; return d ? new Date(d + "T00:00:00").getDate() : null; };

  const custoPostergacoes = round2(postergadas.reduce((s, p) => s + (p.jurosEstimados || 0), 0));
  const rotativoPagoEmDia = round2(pagas.filter((p) => p.gravidade === 4).reduce((s, p) => s + p.valor, 0));

  const gantt = [
    ...pagas.map((p) => ({ id: p.id, descricao: p.descricao, dia: p.dia, tipo: "pago", valor: p.valor })),
    ...postergadas.map((p) => ({ id: p.id, descricao: p.descricao, dia: p.dia, tipo: "postergado", valor: p.valor })),
  ].sort((a, b) => a.dia - b.dia);

  return (
    <div>
      <SectionTitle title="Priorização de contas" subtitle={"Relatórios do motor · " + monthLabelFull(selectedMonth)} />

      {/* 4.1 Buffer */}
      <Card style={{ marginBottom: 12, padding: "14px 16px", background: "#3B6E8F0F", border: "1px solid #3B6E8F22" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
          <PiggyBank size={16} color="#3B6E8F" />
          <p style={{ fontSize: 13.5, fontWeight: 700, margin: 0, color: COLORS.ink, flex: 1 }}>Trava de liquidez mínima (buffer diário)</p>
          <Wallet size={14} color={COLORS.muted} />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          <div>
            <p style={{ fontSize: 11, color: COLORS.muted, margin: "0 0 2px" }}>Reserva mínima (15% do salário líquido)</p>
            <p style={{ fontSize: 16, fontWeight: 600, margin: 0, color: COLORS.ink }}>{fmt(reservaMinima)}</p>
          </div>
          <div>
            <p style={{ fontSize: 11, color: COLORS.muted, margin: "0 0 2px" }}>Disponível para contas</p>
            <p style={{ fontSize: 16, fontWeight: 600, margin: 0, color: saldoParaContas >= 0 ? COLORS.green : COLORS.rust }}>{fmt(saldoParaContas)}</p>
          </div>
        </div>
        <p style={{ fontSize: 11, color: COLORS.muted, margin: "6px 0 0" }}>Base: salário líquido do mês ({fmt(salario)}). A reserva protege transporte, pequenas despesas e imprevistos (Seção 4.1).</p>
      </Card>

      {/* Duplo totalizador */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
        <Card style={{ padding: "12px 14px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}><ListOrdered size={14} color={COLORS.green} /><span style={{ fontSize: 12, color: COLORS.muted }}>Total orçado (mês)</span></div>
          <p style={{ fontSize: 18, fontWeight: 600, margin: 0, color: COLORS.ink }}>{fmt(totalOrcado)}</p>
          <p style={{ fontSize: 10.5, color: COLORS.muted, margin: "2px 0 0" }}>regime de competência</p>
        </Card>
        <Card style={{ padding: "12px 14px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}><Coins size={14} color={COLORS.amber} /><span style={{ fontSize: 12, color: COLORS.muted }}>Saída real de caixa</span></div>
          <p style={{ fontSize: 18, fontWeight: 600, margin: 0, color: COLORS.ink }}>{fmt(saidaRealCaixa)}</p>
          <p style={{ fontSize: 10.5, color: COLORS.muted, margin: "2px 0 0" }}>pago/agendado no mês</p>
        </Card>
      </div>

      {criticos.length > 0 && (
        <Card style={{ marginBottom: 12, borderColor: COLORS.rust, background: COLORS.rust + "0F", padding: "12px 14px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
            <ShieldAlert size={15} color={COLORS.rust} />
            <p style={{ fontSize: 13, fontWeight: 700, margin: 0, color: COLORS.rust }}>Alerta crítico — contas essenciais em risco</p>
          </div>
          {criticos.map((a, i) => (
            <p key={i} style={{ fontSize: 12, color: COLORS.ink, margin: "2px 0 0" }}>
              Dia {a.dia}: faltam {fmt(a.deficit)} — {a.contas.map((c) => c.descricao).join(", ")} (Gravidade 5 não é postergada automaticamente)
            </p>
          ))}
        </Card>
      )}

      {vencidas.length > 0 && (
        <Card style={{ marginBottom: 12, padding: "12px 14px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
            <Clock size={15} color={COLORS.rust} />
            <p style={{ fontSize: 13, fontWeight: 700, margin: 0, color: COLORS.rust }}>Vencidas (reavaliadas com Score Completo — 6.2)</p>
          </div>
          {vencidas.map((c) => (
            <p key={c.id} style={{ fontSize: 12, color: COLORS.ink, margin: "2px 0 0" }}>
              <strong>{c.description}</strong> · venceu {fmtDate(c.dueDate)} · {c.diasEmAtraso} dias de atraso · Score {c.S}
            </p>
          ))}
        </Card>
      )}

      {(resultado.cartaoFaturas && resultado.cartaoFaturas.length > 0) && (
        <Card style={{ marginBottom: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
            <CreditCard size={15} color="#3B6E8F" />
            <p style={{ fontSize: 13, fontWeight: 500, margin: 0 }}>Faturas de cartão (agrupadas)</p>
          </div>
          {resultado.cartaoFaturas.map((f) => (
            <div key={f.id} style={{ marginBottom: 8 }}>
              <p style={{ fontSize: 12.5, fontWeight: 500, margin: 0, color: COLORS.ink }}>{f.description} · {fmt(f.amount)} · vence {fmtDate(f.dueDate)}</p>
              <p style={{ fontSize: 11.5, color: COLORS.muted, margin: "2px 0 0" }}>Inclui: {f.agrupadas}</p>
            </div>
          ))}
        </Card>
      )}

            {/* 8. Gantt de pagamentos × vencimentos */}
      <Card style={{ marginBottom: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
          <CalendarClock size={15} color={COLORS.green} />
          <p style={{ fontSize: 13, fontWeight: 500, margin: 0 }}>Cronograma (Gantt) — pagamentos × vencimentos</p>
        </div>
        <div style={{ display: "flex", fontSize: 9.5, color: COLORS.muted, marginBottom: 4 }}>
          {Array.from({ length: 31 }, (_, i) => <span key={i} style={{ flex: 1, textAlign: "center" }}>{i === 0 ? "" : i}</span>)}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {gantt.map((g) => {
            const venc = diaDe(g.id) || g.dia;
            return (
              <div key={g.id} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ width: 110, flexShrink: 0, fontSize: 11, color: COLORS.ink, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{g.descricao}</span>
                <div style={{ flex: 1, position: "relative", height: 14, background: COLORS.line, borderRadius: 7 }}>
                  <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: (Math.min(30, g.dia) / 30) * 100 + "%", background: g.tipo === "pago" ? COLORS.green : COLORS.amber, borderRadius: 7, opacity: 0.85 }} />
                  <div style={{ position: "absolute", left: (venc / 30) * 100 + "%", top: -3, bottom: -3, width: 2, background: COLORS.rust }} title={"venc. dia " + venc} />
                </div>
                <span style={{ width: 60, flexShrink: 0, fontSize: 10.5, color: COLORS.muted }}>dia {g.dia}</span>
              </div>
            );
          })}
          {gantt.length === 0 && <p style={{ fontSize: 12.5, color: COLORS.muted, margin: 0 }}>Sem pagamentos previstos para o mês.</p>}
        </div>
        <p style={{ fontSize: 11, color: COLORS.muted, margin: "6px 0 0" }}>Barra verde = pagamento ideal · barra âmbar = postergado · traço vermelho = vencimento.</p>
      </Card>

      {/* 5. Pacing */}
      {pac ? (
        <Card style={{ marginBottom: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
            <TrendingDown size={15} color="#3B6E8F" />
            <p style={{ fontSize: 13, fontWeight: 500, margin: 0 }}>Pacing de mercado (semana {semanaAtual}/4)</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 8 }}>
            <div><p style={{ fontSize: 11, color: COLORS.muted, margin: "0 0 2px" }}>Envelope da semana</p><p style={{ fontSize: 16, fontWeight: 600, margin: 0 }}>{fmt(pac.envelopeSemanal)}</p></div>
            <div><p style={{ fontSize: 11, color: COLORS.muted, margin: "0 0 2px" }}>Gasto nesta semana</p><p style={{ fontSize: 16, fontWeight: 600, margin: 0 }}>{fmt(gastoSemanaAtual)}</p></div>
          </div>
          <p style={{ fontSize: 12.5, margin: "0 0 4px" }}>Disponível nesta semana: <strong>{fmt(pac.saldoSemanalRestante)}</strong></p>
          <p style={{ fontSize: 12.5, margin: 0 }}>Teto diário (burn rate): <strong>{fmt(pac.tetoDiario)}</strong></p>
        </Card>
      ) : (
        <Card style={{ marginBottom: 12 }}><p style={{ fontSize: 12.5, color: COLORS.muted, margin: 0 }}>Sem valor de mercado para o mês (Seção 5).</p></Card>
      )}

      {/* 8. DRE */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
        <Card style={{ padding: "12px 14px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}><ArrowDownLeft size={14} color={COLORS.green} /><span style={{ fontSize: 12, color: COLORS.muted }}>Rotativo pago em dia</span></div>
          <p style={{ fontSize: 16, fontWeight: 600, margin: 0, color: COLORS.green }}>{fmt(rotativoPagoEmDia)}</p>
          <p style={{ fontSize: 10.5, color: COLORS.muted, margin: "2px 0 0" }}>juros de cartão/cheque especial evitados</p>
        </Card>
        <Card style={{ padding: "12px 14px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}><TrendingDown size={14} color={COLORS.rust} /><span style={{ fontSize: 12, color: COLORS.muted }}>Custo de atraso (postergações)</span></div>
          <p style={{ fontSize: 16, fontWeight: 600, margin: 0, color: COLORS.rust }}>{fmt(custoPostergacoes)}</p>
          <p style={{ fontSize: 10.5, color: COLORS.muted, margin: "2px 0 0" }}>juros estimados das postergadas</p>
        </Card>
      </div>

      {/* 8. Curva de liquidez */}
      {dias.length > 0 && (
        <Card>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
            <Gauge size={15} color="#3B6E8F" />
            <p style={{ fontSize: 13, fontWeight: 500, margin: 0 }}>Projeção diária de saldo (curva de liquidez)</p>
          </div>
          <div style={{ width: "100%", height: 160 }}>
            <ResponsiveContainer>
              <LineChart data={dias} margin={{ top: 6, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid vertical={false} stroke={COLORS.line} />
                <XAxis dataKey="dia" tick={{ fontSize: 10, fill: COLORS.muted }} axisLine={false} tickLine={false} interval={4} />
                <YAxis hide />
                <Tooltip formatter={(v) => fmt(v)} contentStyle={{ fontSize: 12, borderRadius: 10, border: "1px solid " + COLORS.line }} />
                <ReferenceLine y={reservaMinima} stroke={COLORS.amber} strokeDasharray="4 4" />
                <Line type="monotone" dataKey="saldo" stroke={COLORS.green} strokeWidth={2.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <p style={{ fontSize: 11, color: COLORS.muted, margin: "4px 0 0" }}>Linha tracejada = reserva mínima ({fmt(reservaMinima)}). A linha verde é o saldo previsto dia a dia.</p>
        </Card>
      )}
    </div>
  );
}
